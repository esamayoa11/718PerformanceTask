const pool = require("../config/db");

// CREATE prediction
const createPrediction = async (req, res) => {
  try {
    const {
      user_id,
      match_id,
      predicted_winner_team_id,
      predicted_home_score,
      predicted_away_score,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO predictions 
      (user_id, match_id, predicted_winner_team_id, predicted_home_score, predicted_away_score)
      VALUES ($1,$2,$3,$4,$5)
      RETURNING *`,
      [
        user_id,
        match_id,
        predicted_winner_team_id,
        predicted_home_score,
        predicted_away_score,
      ]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create prediction" });
  }
};

// GET predictions by user
const getUserPredictions = async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await pool.query(
      "SELECT * FROM predictions WHERE user_id = $1",
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch predictions" });
  }
};

module.exports = {
  createPrediction,
  getUserPredictions,
};