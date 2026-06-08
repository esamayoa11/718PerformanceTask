const pool = require("../config/db");

// GET all matches
const getAllMatches = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM matches ORDER BY match_date ASC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch matches" });
  }
};

// GET match by ID
const getMatchById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "SELECT * FROM matches WHERE id = $1",
      [id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch match" });
  }
};

module.exports = {
  getAllMatches,
  getMatchById,
};