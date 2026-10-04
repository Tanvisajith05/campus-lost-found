const pool = require("../config/db");
const { scoreMatch, matchLabel } = require("../utils/matching");

const categories = [
  "Electronics",
  "Books",
  "ID Cards",
  "Bags",
  "Clothing",
  "Accessories",
  "Stationery",
  "Keys",
  "Other",
];

async function createItem(req, res) {
  const {
    item_name,
    category,
    type,
    location,
    date,
    description,
  } = req.body;

  if (
    !item_name ||
    !categories.includes(category) ||
    !["LOST", "FOUND"].includes(type) ||
    !location ||
    !date ||
    !description
  ) {
    return res.status(400).json({
      message: "Please provide valid item details",
    });
  }

  const d = new Date(date);

  if (Number.isNaN(d.getTime()) || d > new Date()) {
    return res.status(400).json({
      message: "Invalid or future date",
    });
  }

  if (description.length < 10 || description.length > 500) {
    return res.status(400).json({
      message: "Description must be 10-500 characters",
    });
  }

  try {
    const image = req.file
      ? `/uploads/${req.file.filename}`
      : null;

    const [dupes] = await pool.execute(
      `SELECT item_id
       FROM items
       WHERE user_id=?
       AND item_name=?
       AND type=?
       AND date=?
       AND status='ACTIVE'`,
      [
        req.user.user_id,
        item_name,
        type,
        date,
      ]
    );

    if (dupes.length) {
      return res.status(409).json({
        message: "A similar active report already exists",
      });
    }

    const [result] = await pool.execute(
      `INSERT INTO items
       (user_id,item_name,category,type,location,date,description,image)
       VALUES (?,?,?,?,?,?,?,?)`,
      [
        req.user.user_id,
        item_name,
        category,
        type,
        location,
        date,
        description,
        image,
      ]
    );

    /*
     * After creating the report, compare it
     * against reports of the opposite type.
     */
    const matches = await buildMatches(
      result.insertId,
      type
    );

    /*
     * Find high-confidence matches.
     * 90% or above = high-confidence match.
     */
    const highConfidenceMatches = matches.filter(
      (match) => match.score >= 90
    );

    let message = "Report created successfully.";

    if (highConfidenceMatches.length > 0) {
      message =
        "Report created. A high-confidence match was detected and the admin has been notified.";
    } else if (matches.length > 0) {
      message =
        "Report created. Possible matching reports were found.";
    }

    res.status(201).json({
      message,
      item_id: result.insertId,
      matches_found: matches.length,
      high_confidence_matches:
        highConfidenceMatches.length,
      matches: matches.map((match) => ({
        match_id: match.match_id,
        score: match.score,
        label: matchLabel(match.score),
      })),
    });
  } catch (e) {
    console.error(e);

    res.status(500).json({
      message: "Database error",
    });
  }
}

async function buildMatches(itemId, type) {
  const [items] = await pool.execute(
    "SELECT * FROM items WHERE item_id=?",
    [itemId]
  );

  if (!items.length) {
    return [];
  }

  const current = items[0];

  const opposite =
    type === "LOST" ? "FOUND" : "LOST";

  const [candidates] = await pool.execute(
    `SELECT *
     FROM items
     WHERE type=?
     AND status='ACTIVE'`,
    [opposite]
  );

  const createdMatches = [];

  for (const other of candidates) {
    const lost =
      type === "LOST"
        ? current
        : other;

    const found =
      type === "LOST"
        ? other
        : current;

    const score = scoreMatch(lost, found);

    /*
     * Only store meaningful matches.
     * 60+ = possible match.
     */
    if (score >= 60) {
      const [result] = await pool.execute(
        `INSERT INTO matches
         (lost_item_id, found_item_id, match_score)
         VALUES (?,?,?)
         ON DUPLICATE KEY UPDATE
         match_score=VALUES(match_score)`,
        [
          lost.item_id,
          found.item_id,
          score,
        ]
      );

      createdMatches.push({
        match_id: result.insertId,
        lost_item_id: lost.item_id,
        found_item_id: found.item_id,
        score,
        label: matchLabel(score),
      });
    }
  }

  return createdMatches;
}

async function listItems(req, res) {
  const {
    q,
    type,
    category,
    location,
    date,
    status,
  } = req.query;

  let sql = `
    SELECT
      i.*,
      u.name AS reporter_name
    FROM items i
    JOIN users u ON i.user_id=u.user_id
    WHERE 1=1
  `;

  const params = [];

  if (q) {
    sql += `
      AND (
        i.item_name LIKE ?
        OR i.description LIKE ?
      )
    `;

    params.push(
      `%${q}%`,
      `%${q}%`
    );
  }

  if (type) {
    sql += " AND i.type=?";
    params.push(type);
  }

  if (category) {
    sql += " AND i.category=?";
    params.push(category);
  }

  if (location) {
    sql += " AND i.location LIKE ?";
    params.push(`%${location}%`);
  }

  if (date) {
    sql += " AND i.date=?";
    params.push(date);
  }

  if (status) {
    sql += " AND i.status=?";
    params.push(status);
  } else {
    sql += `
      AND i.status IN ('ACTIVE','CLAIMED')
    `;
  }

  sql += " ORDER BY i.created_at DESC";

  try {
    const [rows] = await pool.execute(
      sql,
      params
    );

    res.json(rows);
  } catch (e) {
    console.error(e);

    res.status(500).json({
      message: "Database error",
    });
  }
}

async function getItem(req, res) {
  try {
    const [rows] = await pool.execute(
      `SELECT
        i.*,
        u.name AS reporter_name
       FROM items i
       JOIN users u
       ON i.user_id=u.user_id
       WHERE i.item_id=?`,
      [req.params.id]
    );

    if (!rows.length) {
      return res.status(404).json({
        message: "Item not found",
      });
    }

    const item = rows[0];

    const [matches] = await pool.execute(
      `SELECT
        m.*,
        l.item_name AS lost_name,
        f.item_name AS found_name
       FROM matches m
       JOIN items l
       ON m.lost_item_id=l.item_id
       JOIN items f
       ON m.found_item_id=f.item_id
       WHERE
         m.lost_item_id=?
         OR m.found_item_id=?
       ORDER BY m.match_score DESC`,
      [
        item.item_id,
        item.item_id,
      ]
    );

    res.json({
      item,
      matches,
    });
  } catch (e) {
    console.error(e);

    res.status(500).json({
      message: "Database error",
    });
  }
}

async function myReports(req, res) {
  try {
    const [rows] = await pool.execute(
      `SELECT *
       FROM items
       WHERE user_id=?
       ORDER BY created_at DESC`,
      [req.user.user_id]
    );

    res.json(rows);
  } catch (e) {
    console.error(e);

    res.status(500).json({
      message: "Database error",
    });
  }
}

async function myClaims(req, res) {
  try {
    const [rows] = await pool.execute(
      `SELECT
        c.*,
        i.item_name,
        i.category,
        i.status AS item_status
       FROM claims c
       JOIN items i
       ON c.item_id=i.item_id
       WHERE c.user_id=?
       ORDER BY c.created_at DESC`,
      [req.user.user_id]
    );

    res.json(rows);
  } catch (e) {
    console.error(e);

    res.status(500).json({
      message: "Database error",
    });
  }
}

module.exports = {
  createItem,
  listItems,
  getItem,
  myReports,
  myClaims,
  buildMatches,
};