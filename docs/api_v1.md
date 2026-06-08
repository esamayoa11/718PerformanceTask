# E's World Cup Pick'em 2026
## API v1
## Overview
This API supports the MVP for E’s World Cup Pick’em 2026.

It handles:
- Users
- Groups / Teams / Players
- Matches
- Predictions
- Automatic scoring engine
- Leaderboards
- Community Resources
- Player Stats

Scoring is computed server-side when matches are marked as `completed`.

Base URL: `/api/v1`

## SYSTEM RULES

### Data Integrity Rules
- Predictions are locked after match kickoff (future enforcement by match_date)
- Scoring runs only once per match completion
- No manual score overrides
- Leaderboard is always derived dynamically
- One prediction per user per match (DB enforced unique constraint)

## EVENT FLOW (CORE SYSTEM)

```
MATCH COMPLETED
   ↓
SCORING ENGINE RUNS
   ↓
UPDATE predictions.points_awarded
   ↓
LEADERBOARD AUTO-UPDATES
```

## USERS
### GET /users
Returns all users.

```json
[
  {
    "id": 1,
    "username": "erick",
    "favorite_team_id": 3,
    "location": "LA",
    "avatar_url": null,
    "tournament_prediction_registered": false,
    "fantasy_team_registered": false,
    "created_at": "2026-06-07T00:00:00Z"
  }
]
```

### GET /users/:id
Returns a single user.

### POST /users
Create a new user.

```json
{
  "username": "erick",
  "favorite_team_id": 3,
  "location": "LA",
  "avatar_url": ""
}
```

## GROUPS

### GET /groups
List all World Cup groups.

### POST /groups
(Admin only) Create group.

## TEAMS
### GET /teams
List all teams.

Query params:
```
/teams?group_id=1
```

### GET /teams/:id
Get team details including players.

## PLAYERS
### GET /players
List players.

Query params:
```
/players?team_id=2
```

### GET /players/:id
Get player details.

## MATCHES
### GET /matches
List all matches.

Filters:

```
/matches?status=scheduled
/matches?group_id=2
```

### GET /matches/:id
Get match details.

Includes:
- teams
- scores
- status
- predictions (future enhancement)

### POST /matches
(Admin/seed only) Create match.

### PATCH /matches/:id/complete
Marks match as completed and triggers scoring engine.

```json
{
  "actual_home_score": 2,
  "actual_away_score": 1,
  "actual_winner_team_id": 5,
  "status": "completed"
}

#### Behavior
1. Update match results
2. Set status = completed
3. Fetch all predictions for match
4. Run scoring engine
5. Update `predictions.points_awarded`

## PREDICTIONS
### POST /predictions
Create a prediction (must be before kickoff).

```json
{
  "user_id": 1,
  "match_id": 10,
  "predicted_winner_team_id": 5,
  "predicted_home_score": 2,
  "predicted_away_score": 1
}
```

### Rules enforced:
- Match must be `scheduled`
- One prediction per user per match
- Predictions locked after kickoff (future enforcement)

### GET /predictions/user/:userId
Get all predictions for a user.

### GET /predictions/match/:matchId
Get all predictions for a match.

## SCORING ENGINE (INTERNAL LOGIC)

### Function
`calculatePoints(prediction, match)`

####  RULES
##### 1. Winner Rule (+1)
- Correct winner OR correct draw → +1 point

#### 2. Exact Score Rule (+2)
- Exact score match → +2 bonus points

### FORMULA
```
points_awarded = winner_points + exact_score_bonus
```

### Trigger
Runs ONLY when:
```
PATCH /matches/:id/complete
```

## LEADERBOARD
### GET /leaderboard
Returns ranked users by total points.

```json
[
  {
    "username": "erick",
    "total_points": 12
  },
  {
    "username": "alex",
    "total_points": 9
  }
]
```

### SQL (Derived)
```sql
SELECT
  users.username,
  SUM(predictions.points_awarded) AS total_points
FROM predictions
JOIN users ON users.id = predictions.user_id
GROUP BY users.id
ORDER BY total_points DESC;
```

## RESOURCES
### GET /resources
List community resources.

### POST /resources
Create a resource.

```json
{
  "user_id": 1,
  "title": "Best Watch Party Spots in LA",
  "description": "Top bars showing World Cup games",
  "category": "Watch Party"
}
```

## PLAYER STATS
### GET /player-stats/:playerId
Returns player stats across matches.

### GET /player-stats/match/:matchId
Returns match-specific player performance.

## FUTURE ENDPOINTS (NOT MVP)
- POST /fantasy/roster
- GET /fantasy/leaderboard
- POST /achievements
- GET /awards-predictions