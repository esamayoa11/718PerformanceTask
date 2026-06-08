const pool = require("../config/db");

// =============================
// UTILITY: check if match is locked
// =============================
const isMatchLocked = async (match_id) => {
  const result = await pool.query(
    "SELECT match_date FROM matches WHERE id = $1",
    [match_id]
  );

  if (!result.rows.length) return true;

  const matchDate = result.rows[0].match_date;
  return new Date() >= new Date(matchDate);
};

// =============================
// CREATE OR UPDATE prediction (UPSERT LOGIC)
// =============================
const createPrediction = async (req, res) => {
  try {
    const {
      user_id,
      match_id,
      predicted_winner_team_id,
      predicted_home_score,
      predicted_away_score,
    } = req.body;

    // 🔒 LOCK CHECK
    const locked = await isMatchLocked(match_id);
    if (locked) {
      return res.status(403).json({
        error: "Match has started. Predictions are locked.",
      });
    }

    // =============================
    // UPSERT (CREATE or UPDATE)
    // =============================
    const result = await pool.query(
      `
      INSERT INTO predictions 
        (user_id, match_id, predicted_winner_team_id, predicted_home_score, predicted_away_score)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (user_id, match_id)
      DO UPDATE SET
        predicted_winner_team_id = EXCLUDED.predicted_winner_team_id,
        predicted_home_score = EXCLUDED.predicted_home_score,
        predicted_away_score = EXCLUDED.predicted_away_score
      RETURNING *;
      `,
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
    res.status(500).json({ error: "Failed to save prediction" });
  }
};

// =============================
// GET predictions by user
// =============================
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

// =============================
// DELETE prediction (optional CRUD completeness)
// =============================
const deletePrediction = async (req, res) => {
  try {
    const { user_id, match_id } = req.body;

    // LOCK CHECK
    const locked = await isMatchLocked(match_id);
    if (locked) {
      return res.status(403).json({
        error: "Match has started. Cannot delete prediction.",
      });
    }

    await pool.query(
      "DELETE FROM predictions WHERE user_id = $1 AND match_id = $2",
      [user_id, match_id]
    );

    res.json({ message: "Prediction deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete prediction" });
  }
};

module.exports = {
  createPrediction,
  getUserPredictions,
  deletePrediction,
};