const pool = require("../config/db");

// LOGIN (or auto-create user for simplicity)
const loginUser = async (req, res) => {
  try {
    const { username } = req.body;

    // check if user exists
    let user = await pool.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );

    // if not, create user
    if (user.rows.length === 0) {
      user = await pool.query(
        `INSERT INTO users (username)
         VALUES ($1)
         RETURNING *`,
        [username]
      );
    }

    res.json(user.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
};

module.exports = { loginUser };