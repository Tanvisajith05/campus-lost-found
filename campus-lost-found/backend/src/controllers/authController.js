const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function register(req, res) {
  const { name, college_id, email, phone, password, confirmPassword } = req.body;
  if (!name || !college_id || !email || !phone || !password || !confirmPassword)
    return res.status(400).json({ message: "All fields are required" });
  if (!emailRx.test(email)) return res.status(400).json({ message: "Invalid email" });
  if (password.length < 8) return res.status(400).json({ message: "Password must be at least 8 characters" });
  if (password !== confirmPassword) return res.status(400).json({ message: "Passwords do not match" });

  try {
    const [existing] = await pool.execute("SELECT user_id FROM users WHERE email=? OR college_id=?", [email, college_id]);
    if (existing.length) return res.status(409).json({ message: "Email or college ID already exists" });
    const hash = await bcrypt.hash(password, 12);
    await pool.execute(
      "INSERT INTO users (name,college_id,email,phone,password) VALUES (?,?,?,?,?)",
      [name, college_id, email, phone, hash]
    );
    res.status(201).json({ message: "Registration successful" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Database error" });
  }
}

async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Email and password are required" });
  try {
    const [rows] = await pool.execute("SELECT * FROM users WHERE email=?", [email]);
    if (!rows.length || !(await bcrypt.compare(password, rows[0].password)))
      return res.status(401).json({ message: "Invalid email or password" });
    const user = rows[0];
    const token = jwt.sign(
      { user_id: user.user_id, name: user.name, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );
    res.json({ token, user: { user_id: user.user_id, name: user.name, role: user.role, email: user.email } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Database error" });
  }
}

module.exports = { register, login };
