import { useEffect, useState } from "react";

const Matches = () => {
  const [matches, setMatches] = useState([]);
  const [predictions, setPredictions] = useState({}); // store inputs

  // =========================
  // FETCH MATCHES
  // =========================
  useEffect(() => {
    fetch("http://localhost:3001/api/matches")
      .then((res) => res.json())
      .then((data) => setMatches(data))
      .catch((err) => console.error(err));
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

    const payload = {
      user_id: 1, // TEMP (replace later with auth)
      match_id: matchId,
      predicted_home_score: Number(prediction?.home || 0),
      predicted_away_score: Number(prediction?.away || 0),
      predicted_winner_team_id: null,
    };

    try {
      const res = await fetch("http://localhost:3001/api/predictions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log("Saved:", data);

      alert("Prediction saved!");
    } catch (err) {
      console.error(err);
    }
  };

  // =========================
  // RENDER
  // =========================
  return (
    <div style={{ padding: "20px" }}>
      <h1>World Cup Matches</h1>

      {matches.map((match) => {
        const locked = new Date() > new Date(match.match_date);

        return (
          <div
            key={match.id}
            style={{
              border: "1px solid #ccc",
              marginBottom: "15px",
              padding: "10px",
              borderRadius: "8px",
            }}
          >
            {/* MATCH INFO */}
            <h3>
              {match.home_team_id} vs {match.away_team_id}
            </h3>

            <p>{match.round}</p>
            <p>{new Date(match.match_date).toLocaleString()}</p>

            {/* LOCK STATE */}
            {locked ? (
              <p style={{ color: "red" }}>🔒Match Started🔒</p>
            ) : (
              <>
                {/* INPUTS */}
                <input
                  type="number"
                  placeholder="Home"
                  onChange={(e) =>
                    handleChange(match.id, "home", e.target.value)
                  }
                />

                <input
                  type="number"
                  placeholder="Away"
                  onChange={(e) =>
                    handleChange(match.id, "away", e.target.value)
                  }
                />

                <button onClick={() => submitPrediction(match.id)}>
                  Submit Prediction
                </button>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Matches;