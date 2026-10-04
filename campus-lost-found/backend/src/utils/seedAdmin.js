const bcrypt = require("bcryptjs");
const pool = require("../config/db");

(async () => {
  try {
    const hash = await bcrypt.hash("Admin@12345", 12);
    await pool.execute(
      `INSERT INTO users (name,college_id,email,phone,password,role)
       VALUES (?,?,?,?,?, 'ADMIN')
       ON DUPLICATE KEY UPDATE role='ADMIN'`,
      ["Campus Admin", "ADMIN001", "admin@campus.local", "9999999999", hash]
    );
    console.log("Admin ready: admin@campus.local / Admin@12345");
  } catch (e) {
    console.error(e);
  } finally {
    await pool.end();
  }
})();
