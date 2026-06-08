# E's World Cup Pick'em 2026
## Scoring Rules v1

## Overview
The platform uses an automated scoring engine to evaluate user predictions after each match is completed. Scoring is fully deterministic and recalculated from match results; no manual overrides exist in MVP. Points are awarded based on prediction accuracy of match outcomes and scores. Scoring is triggered when match status changes to 'completed'.

## MATCH PREDICTION SCORING

### Primary Scoring Rules

### 1. Correct Match Winner
If a user correctly predicts the winning team OR correctly predicts a draw: +1 Point

### 2. Exact Final Score
If a user correctly predicts the exact final score: +2 Bonus Points

## Total Scoring Formula
```text
Total Points = Winner Points + Exact Score Bonus
```

### Examples
#### Example 1: 
- User Prediction: Mexico 3 - 0 South Africa

- Actual Result: Mexico 2 - 1 South Africa

Evaluation:
- Correct Winner: Mexico ✔ → +1 point
- Exact Score: ❌ not correct
- Final Score: 1 Point

#### Example 2: 
- User Prediction: Brazil 2 - 1 Argentina
- Actual Result: Brazil 2 - 1 Argentina

Evaluation:
- Correct Winner: ✔ → +1 point
- Exact Score: ✔ → +2 points
- Final Score: 3 Points

Exact Score Bonus is awarded in addition to Winner Points (not instead of them).

### EDGE CASE RULES
#### Draw Handling
A “draw prediction” is any prediction where predicted_home_score == predicted_away_score. Winner points for draws are awarded if both predicted and actual results are draws, regardless of scoreline. If match ends in a draw, users must predict a draw to receive Winner Point (+1)

Example:
- Prediction: 1–1. Tie.
- Actual: 0–0. Tie → Winner point awarded

### Edge case: penalty shootouts / knockout matches
World Cup knockout games introduce:
- Draw after 120 minutes
- Winner decided by penalties

For knockout matches, winner is determined by official match result (including penalties).

#### Invalid Predictions
A prediction is invalid if:
- Missing scores
- Non-numeric input
- Match does not exist
- Predictions for matches with status != 'scheduled' are rejected. Otherwise users can “game” results after kickoff.

Invalid predictions receive: 0 points

#### LEADERBOARD LOGIC
The leaderboard is derived dynamically:
```SQL
SELECT
    users.username,
    SUM(predictions.points_awarded) AS total_points
FROM predictions
JOIN users ON users.id = predictions.user_id
GROUP BY users.id
ORDER BY total_points DESC;
```

No leaderboard table is stored to ensure: real-time accuracy, no duplication, simpler architecture.

### FANTASY MODE (FUTURE FEATURE)
Fantasy mode is a secondary gameplay system where users draft:
- 1 Forward
- 1 Midfielder
- 1 Defender
- 1 Goalkeeper
- 1 Captain

### Simplified Fantasy Game Scoring Concept
Players earn fantasy points based on real match performance:

Goals → + points
Assists → + points
Clean sheets → bonus (defenders/goalkeepers)
Saves → goalkeeper bonus
Cards → negative impact
(additional modifiers may be added in future versions)

### See database schema for full player_stats structure.

### TOURNAMENT AWARDS PREDICTIONS (FUTURE FEATURE)
Users may also predict tournament-wide awards upon submission. The options and possible points awarded for correct predictions are: 
- Golden Boot (10+)
- Golden Ball (10+)
- Golden Glove (10+)
- Best Young Player (10+)

### DESIGN PRINCIPLES
This scoring system is designed to be:

- simple for MVP users
- deterministic (no ambiguity)
- easy to compute in backend
- scalable for fantasy + advanced features later

### FUTURE EXPANSION NOTES
Future versions may introduce:

- streak bonuses
- knockout stage multipliers
- fantasy multiplier captain bonuses