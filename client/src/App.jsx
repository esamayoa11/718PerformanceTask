import { useEffect, useState } from "react";

function App() {

  const USER_ID = 1; 
  
  const [matches, setMatches] = useState([]);
  const [myPredictions, setMyPredictions] = useState([]);
  const [form, setForm] = useState({});
  const [tab, setTab] = useState("all");

  // =========================
  // LOAD MATCHES
  // =========================
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/matches`)
      .then((res) => res.json())
      .then(setMatches)
      .catch(console.error);
  }, []);

  // =========================
  // LOAD PREDICTIONS
  // =========================
  const loadPredictions = () => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/predictions/user/1`)
      .then((res) => res.json())
      .then(setMyPredictions)
      .catch(console.error);
  };

  useEffect(() => {
    loadPredictions();
  }, []);

  // =========================
  // HANDLE INPUTS
  // =========================
  const handleChange = (matchId, field, value) => {
    setForm((prev) => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [field]: value === "" ? "" : Math.max(0, Number(value)),
      },
    }));
  };

  // =========================
  // EDIT → LOAD INTO FORM
  // =========================
  const startEdit = (matchId) => {
    const existing = myPredictions.find(
      (p) => Number(p.match_id) === Number(matchId)
    );

    if (!existing) return;

    setForm((prev) => ({
      ...prev,
      [matchId]: {
        home: existing.predicted_home_score,
        away: existing.predicted_away_score,
      },
    }));
  };

  // =========================
  // SAVE / UPSERT
  // =========================
  const savePrediction = async (matchId) => {
    const prediction = form[matchId];

    if (!prediction) return alert("Enter scores first");

    const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/predictions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: 1,
        match_id: matchId,
        predicted_home_score: prediction.home,
        predicted_away_score: prediction.away,
        predicted_winner_team_id: null,
      }),
    });

    const saved = await res.json();

    setMyPredictions((prev) => {
      const filtered = prev.filter(
        (p) => Number(p.match_id) !== Number(matchId)
      );
      return [...filtered, saved];
    });
  };

  // =========================
  // DELETE
  // =========================
  const deletePrediction = async (matchId) => {
    await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/predictions`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: 1,
        match_id: matchId,
      }),
    });

    setMyPredictions((prev) =>
      prev.filter((p) => Number(p.match_id) !== Number(matchId))
    );

    setForm((prev) => {
      const copy = { ...prev };
      delete copy[matchId];
      return copy;
    });
  };

// =========================
// UI
// =========================
return (
  <div style={{ padding: "20px", fontFamily: "Arial" }}>

    <div style={{ textAlign: "center", marginBottom: "15px" }}>
      <h1 style={{ fontSize: "36px", marginBottom: "5px" }}>
        The World's Smallest Platform
      </h1>

      <h1 style={{ fontSize: "36px", marginTop: "0" }}>
        for the World's Largest Sporting Event
      </h1>

      <p style={{ marginTop: "10px", color: "#666" }}>
        ⚽ A family-style prediction game built around the FIFA World Cup.
      </p>
    </div>

    {/* GAME BOX */}
    <div
      style={{
        marginTop: "15px",
        marginBottom: "20px",
        padding: "15px",
        border: "1px solid #ddd",
        borderRadius: "12px",
        backgroundColor: "#fafafa"
      }}
    >
      <h2 style={{ marginBottom: "10px" }}>
        Pick Your Winners Tournament 2026 (Group Stage)
      </h2>

      <h3>How it works:</h3>

      <ul style={{ marginTop: "10px", lineHeight: "1.6" }}>
        <li> Predict every match winner/score before kickoff</li>
        <li> Predictions lock once the match starts</li>
        <li> Edit or delete picks anytime before kickoff</li>
        <li> Exact score = highest reward</li>
      </ul>
    </div>
      {matches.map((match) => {
        const existing = myPredictions.find(
          (p) => Number(p.match_id) === Number(match.id)
        );

        const current = form[match.id] || {};

        return (
          <div
            key={match.id}
            style={{
              border: "1px solid #ccc",
              padding: "14px",
              marginBottom: "12px",
              borderRadius: "10px",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            {/* ================= LEFT SIDE ================= */}
            <div style={{ flex: 1 }}>
              <h3>
                Match #{match.fifa_match_number} —{" "}
                {match.home_team_name} vs {match.away_team_name}
              </h3>

              <p>{match.round}</p>
              <p>{new Date(match.match_date).toLocaleString()}</p>

              <div style={{ marginTop: "10px" }}>
                <input
                  type="number"
                  min="0"
                  value={current.home ?? ""}
                  placeholder="Home"
                  onChange={(e) =>
                    handleChange(match.id, "home", e.target.value)
                  }
                  style={{ width: "60px", marginRight: "10px" }}
                />

                <input
                  type="number"
                  min="0"
                  value={current.away ?? ""}
                  placeholder="Away"
                  onChange={(e) =>
                    handleChange(match.id, "away", e.target.value)
                  }
                  style={{ width: "60px", marginRight: "10px" }}
                />
              </div>

              <div style={{ marginTop: "10px" }}>
                <button onClick={() => savePrediction(match.id)}>
                  💾 Save / Update
                </button>
              </div>
            </div>

            {/* ================= RIGHT SIDE (IMPROVED UI ONLY) ================= */}
            <div
              style={{
                width: "220px",
                borderLeft: "2px solid #eee",
                paddingLeft: "15px",
                textAlign: "center",
              }}
            >
              <h4>Your Prediction</h4>

              <div
                style={{
                  fontSize: "22px",
                  fontWeight: "bold",
                  minHeight: "30px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {existing
                  ? `${existing.predicted_home_score} - ${existing.predicted_away_score}`
                  : "—"}
              </div>

              <div style={{ marginTop: "6px", minHeight: "20px" }}>
                {existing ? (
                  <span style={{ color: "green" }}>✅ Locked In</span>
                ) : (
                  <span style={{ color: "#999" }}>
                    No prediction yet
                  </span>
                )}
              </div>

              <div style={{ marginTop: "12px" }}>
                <button onClick={() => startEdit(match.id)}>
                  ✏️ Edit
                </button>

                <button
                  onClick={() => deletePrediction(match.id)}
                  style={{ marginLeft: "10px", color: "red" }}
                >
                  🗑 Delete
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default App;