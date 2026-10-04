const pool = require("../config/db");

async function createClaim(req,res) {
  const { reason, identifying_description, approximate_lost_date } = req.body;
  if (!reason || !identifying_description || !approximate_lost_date)
    return res.status(400).json({ message:"All claim fields are required" });
  if (reason.length > 500 || identifying_description.length > 500)
    return res.status(400).json({ message:"Claim text must be 500 characters or less" });
  try {
    const [items] = await pool.execute("SELECT * FROM items WHERE item_id=?", [req.params.itemId]);
    if (!items.length) return res.status(404).json({message:"Item not found"});
    if (items[0].status === "RETURNED") return res.status(409).json({message:"Returned items cannot be claimed"});
    if (items[0].type !== "FOUND") return res.status(409).json({message:"Only found items can be claimed"});
    const [existing] = await pool.execute(
      "SELECT claim_id FROM claims WHERE item_id=? AND user_id=? AND status IN ('PENDING','UNDER_VERIFICATION')",
      [req.params.itemId, req.user.user_id]
    );
    if (existing.length) return res.status(409).json({message:"You already have an active claim"});
    await pool.execute(
      `INSERT INTO claims (item_id,user_id,reason,identifying_description,approximate_lost_date)
       VALUES (?,?,?,?,?)`,
      [req.params.itemId,req.user.user_id,reason,identifying_description,approximate_lost_date]
    );
    res.status(201).json({message:"Claim submitted"});
  } catch(e) {
    console.error(e);
    res.status(500).json({message:"Database error"});
  }
}

async function listClaims(req,res) {
  const [rows] = await pool.execute(
    `SELECT c.*, i.item_name, i.category, i.location, i.status AS item_status, u.name AS claimant_name, u.email AS claimant_email
     FROM claims c JOIN items i ON c.item_id=i.item_id JOIN users u ON c.user_id=u.user_id
     ORDER BY c.created_at DESC`
  );
  res.json(rows);
}

async function updateClaim(req,res) {
  const { status } = req.body;
  if (!["UNDER_VERIFICATION","APPROVED","REJECTED"].includes(status))
    return res.status(400).json({message:"Invalid claim status"});
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [claims] = await conn.execute("SELECT * FROM claims WHERE claim_id=? FOR UPDATE",[req.params.id]);
    if (!claims.length) { await conn.rollback(); return res.status(404).json({message:"Claim not found"}); }
    await conn.execute("UPDATE claims SET status=? WHERE claim_id=?",[status,req.params.id]);
    if (status === "APPROVED") {
      await conn.execute("UPDATE items SET status='CLAIMED' WHERE item_id=? AND status='ACTIVE'",[claims[0].item_id]);
    }
    await conn.commit();
    res.json({message:`Claim ${status.toLowerCase()}`});
  } catch(e) {
    await conn.rollback();
    console.error(e);
    res.status(500).json({message:"Database error"});
  } finally { conn.release(); }
}

async function markReturned(req,res) {
  try {
    const [items] = await pool.execute("SELECT item_id,status FROM items WHERE item_id=?",[req.params.id]);
    if (!items.length) return res.status(404).json({message:"Item not found"});
    if (!["CLAIMED","ACTIVE"].includes(items[0].status)) return res.status(409).json({message:"Invalid return transition"});
    await pool.execute("UPDATE items SET status='RETURNED' WHERE item_id=?",[req.params.id]);
    res.json({message:"Item marked returned"});
  } catch(e) {
    console.error(e);
    res.status(500).json({message:"Database error"});
  }
}

async function listAdminItems(req,res) {
  const [rows] = await pool.execute(
    `SELECT i.*, u.name AS reporter_name, u.email AS reporter_email FROM items i JOIN users u ON i.user_id=u.user_id ORDER BY i.created_at DESC`
  );
  res.json(rows);
}

async function updateItemStatus(req,res) {
  const { status } = req.body;
  if (!["ACTIVE","REJECTED","RETURNED","EXPIRED"].includes(status))
    return res.status(400).json({message:"Invalid status"});
  await pool.execute("UPDATE items SET status=? WHERE item_id=?",[status,req.params.id]);
  res.json({message:"Item status updated"});
}

async function stats(req,res) {
  const [[total]] = await pool.query("SELECT COUNT(*) count FROM items");
  const [[lost]] = await pool.query("SELECT COUNT(*) count FROM items WHERE type='LOST'");
  const [[found]] = await pool.query("SELECT COUNT(*) count FROM items WHERE type='FOUND'");
  const [[pendingReports]] = await pool.query("SELECT COUNT(*) count FROM items WHERE status='ACTIVE'");
  const [[pendingClaims]] = await pool.query("SELECT COUNT(*) count FROM claims WHERE status IN ('PENDING','UNDER_VERIFICATION')");
  const [[returned]] = await pool.query("SELECT COUNT(*) count FROM items WHERE status='RETURNED'");
  const [[rejected]] = await pool.query("SELECT COUNT(*) count FROM items WHERE status='REJECTED'");
  res.json({
    totalReports: total.count, lostItems: lost.count, foundItems: found.count,
    pendingReports: pendingReports.count, pendingClaims: pendingClaims.count,
    returnedItems: returned.count, rejected: rejected.count
  });
}
async function listHighConfidenceMatches(req, res) {
  try {
    const [rows] = await pool.execute(
      `SELECT
        m.match_id,
        m.match_score,
        m.match_status,
        m.created_at,

        l.item_id AS lost_item_id,
        l.item_name AS lost_item_name,
        l.category AS lost_category,
        l.location AS lost_location,
        l.date AS lost_date,
        l.description AS lost_description,
        l.image AS lost_image,
        l.status AS lost_status,

        f.item_id AS found_item_id,
        f.item_name AS found_item_name,
        f.category AS found_category,
        f.location AS found_location,
        f.date AS found_date,
        f.description AS found_description,
        f.image AS found_image,
        f.status AS found_status

       FROM matches m

       JOIN items l
         ON m.lost_item_id = l.item_id

       JOIN items f
         ON m.found_item_id = f.item_id

       WHERE m.match_score >= 90
       ORDER BY m.match_score DESC, m.created_at DESC`
    );

    res.json(rows);
  } catch (e) {
    console.error(e);

    res.status(500).json({
      message: "Unable to load high-confidence matches",
    });
  }
}
async function confirmMatch(req, res) {
  const { matchId } = req.params;

  try {
    const [matches] = await pool.execute(
      `SELECT *
       FROM matches
       WHERE match_id=?`,
      [matchId]
    );

    if (!matches.length) {
      return res.status(404).json({
        message: "Match not found",
      });
    }

    const match = matches[0];

    if (match.match_score < 90) {
      return res.status(400).json({
        message:
          "Only high-confidence matches can be confirmed.",
      });
    }

    if (match.match_status === "CONFIRMED") {
      return res.status(409).json({
        message: "This match is already confirmed.",
      });
    }

    await pool.execute(
      `UPDATE matches
       SET match_status='CONFIRMED'
       WHERE match_id=?`,
      [matchId]
    );

    res.json({
      message:
        "High-confidence match confirmed successfully.",
    });
  } catch (e) {
    console.error(e);

    res.status(500).json({
      message: "Database error",
    });
  }
}
async function returnMatchedItems(req, res) {
  const { matchId } = req.params;

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const [matches] = await conn.execute(
      `SELECT *
       FROM matches
       WHERE match_id=?
       FOR UPDATE`,
      [matchId]
    );

    if (!matches.length) {
      await conn.rollback();

      return res.status(404).json({
        message: "Match not found",
      });
    }

    const match = matches[0];

    if (match.match_score < 90) {
      await conn.rollback();

      return res.status(400).json({
        message:
          "Only high-confidence matches can be returned.",
      });
    }

    if (match.match_status !== "CONFIRMED") {
      await conn.rollback();

      return res.status(409).json({
        message:
          "Confirm the match before marking items returned.",
      });
    }

    await conn.execute(
      `UPDATE items
       SET status='RETURNED'
       WHERE item_id IN (?, ?)`,
      [
        match.lost_item_id,
        match.found_item_id,
      ]
    );

    await conn.execute(
      `UPDATE matches
       SET match_status='CONFIRMED'
       WHERE match_id=?`,
      [matchId]
    );

    await conn.commit();

    res.json({
      message:
        "Lost and found reports have both been marked as returned.",
    });
  } catch (e) {
    await conn.rollback();

    console.error(e);

    res.status(500).json({
      message: "Database error",
    });
  } finally {
    conn.release();
  }
}
module.exports = {
  createClaim,
  listClaims,
  updateClaim,
  markReturned,
  listAdminItems,
  updateItemStatus,
  stats,
  listHighConfidenceMatches,
  confirmMatch,
  returnMatchedItems,
};