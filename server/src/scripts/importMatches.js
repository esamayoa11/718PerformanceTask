const fs = require("fs");
const csv = require("csv-parser");
const path = require("path");
require("dotenv").config({
    path: path.resolve(__dirname, "../../../.env"),
});

const pool = require("../config/db");

const results = [];

const csvPath = path.resolve(
  __dirname,
  "../../../data/raw/matches.csv"
);

fs.createReadStream(csvPath)
  .pipe(csv())
  .on("data", (data) => results.push(data))
  .on("end", async () => {
    try {
      console.log(`Importing ${results.length} matches...`);

      for (const match of results) {
        await pool.query(
          `
          INSERT INTO matches (
            fifa_match_number,
            home_team_id,
            away_team_id,
            group_id,
            round,
            venue_name,
            venue_location,
            match_date,
            actual_home_score,
            actual_away_score,
            actual_winner_team_id,
            status
          ) VALUES (
            $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12
          )
          ON CONFLICT (fifa_match_number) DO NOTHING
          `,
          [
            match.fifa_match_number,
            match.home_team_id,
            match.away_team_id,
            match.group_id,
            match.round,
            match.venue_name,
            match.venue_location,
            match.match_date,
            match.actual_home_score || null,
            match.actual_away_score || null,
            match.actual_winner_team_id || null,
            match.status,
          ]
        );
      }

      console.log("Matches imported successfully!");
      process.exit();
    } catch (err) {
      console.error("Import failed:", err);
      process.exit(1);
    }
  });