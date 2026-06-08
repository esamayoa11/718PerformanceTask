const pool = require("../config/db");

// GET all matches
const getAllMatches = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        m.id,
        m.fifa_match_number,
        m.round,
        m.venue_name,
        m.match_date,
        m.status,

        m.home_team_id,
        ht.name AS home_team_name,

        m.away_team_id,
        at.name AS away_team_name

      FROM matches m
      JOIN teams ht ON m.home_team_id = ht.id
      JOIN teams at ON m.away_team_id = at.id
      ORDER BY m.match_date ASC;
    `);

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