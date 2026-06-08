const pool = require("../config/db");

const isMatchLocked = async (match_id) => {
  const result = await pool.query(
    "SELECT match_date FROM matches WHERE id = $1",
    [match_id]
  );

  const matchDate = result.rows[0].match_date;
  return new Date() >= new Date(matchDate);
};

module.exports = isMatchLocked;