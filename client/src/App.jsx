import { useEffect, useState } from "react";

function App() {
  // =========================
  // STATE
  // =========================
  const [matches, setMatches] = useState([]);
  const [predictions, setPredictions] = useState({});

  // =========================
  // LOAD MATCHES FROM BACKEND
  // =========================
  useEffect(() => {
    fetch("http://localhost:3001/api/matches")
      .then((res) => res.json())
      .then((data) => setMatches(data))
      .catch((err) => console.error("Error fetching matches:", err));
  }, []);

  // =========================
  // HANDLE INPUT CHANGE
  // =========================
  const handleChange = (matchId, field, value) => {
    setPredictions((prev) => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [field]: value,
      },
    }));
  };

  // =========================
  // SUBMIT PREDICTION
  // =========================
  const submitPrediction = async (matchId) => {
    const prediction = predictions[matchId];

    if (!prediction) {
      alert("Enter scores first");
      return;
    }

    try {
      const res = await fetch("http://localhost:3001/api/predictions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: 1, // TEMP USER (we'll fix auth later)
          match_id: matchId,
          predicted_home_score: prediction.home,
          predicted_away_score: prediction.away,
        }),
      });

      const data = await res.json();
      console.log("Saved:", data);

      alert("Prediction saved!");
    } catch (err) {
      console.error(err);
      alert("Error saving prediction");
    }
  };

  // =========================
  // UI
  // =========================
  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>🏆 World Cup Matches</h1>

      {matches.map((match) => (
        <div
          key={match.id}
          style={{
            border: "1px solid #ccc",
            padding: "10px",
            marginBottom: "10px",
            borderRadius: "8px",
          }}
        >
          {/* MATCH INFO */}
          <h3>
            Match #{match.fifa_match_number} — Team {match.home_team_id} vs Team{" "}
            {match.away_team_id}
          </h3>

          <p>{match.round}</p>

          {/* INPUTS */}
          <div>
            <input
              type="number"
              placeholder="Home"
              onChange={(e) =>
                handleChange(match.id, "home", e.target.value)
              }
              style={{ width: "60px", marginRight: "10px" }}
            />

            <input
              type="number"
              placeholder="Away"
              onChange={(e) =>
                handleChange(match.id, "away", e.target.value)
              }
              style={{ width: "60px", marginRight: "10px" }}
            />

            {/* SUBMIT */}
            <button onClick={() => submitPrediction(match.id)}>
              Submit Prediction
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default App;