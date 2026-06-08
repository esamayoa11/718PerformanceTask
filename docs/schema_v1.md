# E's World Cup Pick'em 2026
## Database Schema v1
---
## Purpose
This schema supports the MVP functionality for E's World Cup Pick'em 2026.

The MVP focuses on:
- Tournament Information
- Match Predictions
- Automated Scoring
- Leaderboards
- Community Resources

The schema is also designed to support future expansion into:
- Authentication
- Fantasy Mode
- Tournament Award Predictions
- User Achievements/Rewards
---
## Entity Relationship Overview

```text
USERS
│
├── PREDICTIONS ─── MATCHES
│
└── RESOURCES

GROUPS
│
├── TEAMS
│
└── MATCHES

TEAMS
│
├── PLAYERS
│
└── MATCHES (home/away)
```

## TABLE: users
Stores platform participants. 

| Column                              | Type         | Constraints              |
|-------------------------------------|--------------|--------------------------|
| id                                  | SERIAL       | PRIMARY KEY              |
| username                            | VARCHAR(50)  | UNIQUE NOT NULL          |
| favorite_team_id                    | INTEGER      | FK -> teams.id           |
| location                            | VARCHAR(100) | NULL                     |
| avatar_url                          | TEXT         | NULL                     |
| tournament_prediction_registered    | BOOLEAN      | DEFAULT FALSE            |
| fantasy_team_registered             | BOOLEAN      | DEFAULT FALSE            |
| created_at                          | TIMESTAMP    | DEFAULT NOW()            |

### Relationships
users → predictions (1:M)  
users → resources (1:M)

---
## TABLE: groups
Stores all FIFA World Cup tournament groups. 

| Column                              | Type         | Constraints              |
|-------------------------------------|--------------|--------------------------|
| id                                  | SERIAL       | PRIMARY KEY              |
| group_name                          | VARCHAR(5)  | UNIQUE NOT NULL           |
| created_at                          | TIMESTAMP    | DEFAULT NOW()            |

### Relationships
groups → teams (1:M)  
groups → matches (1:M)

## TABLE: teams
Stores all World Cup Teams

| Column                              | Type         | Constraints              |
|-------------------------------------|--------------|--------------------------|
| id                                  | SERIAL       | PRIMARY KEY              |
| name                                | VARCHAR(100) | UNIQUE NOT NULL          |
| group_id                            | INTEGER      | FK -> groups.id          |
| coach                               | VARCHAR(100) | NULL                     |
| country_code                        | VARCHAR(3)   | UNIQUE                   |
| created_at                          | TIMESTAMP    | DEFAULT NOW()            |

### Relationships
teams → players (1:M)
teams → matches (home_team)
teams → matches (away_team)

## TABLE: players
Stores player information.

| Column                              | Type         | Constraints              |
|-------------------------------------|--------------|--------------------------|
| id                                  | SERIAL       | PRIMARY KEY              |
| team_id                             | INTEGER      | FK -> teams.id.          |
| full_name                           | VARCHAR(100) | NOT NULL                 |
| jersey_number                       | INTEGER      | NOT NULL                 |
| position                            | VARCHAR(20)  |  NOT NULL                |
| date_of_birth                       | DATE         | NULL                     |
| caps                                | INTEGER      | DEFAULT 0                |
| international_goals                 | INTEGER      | DEFAULT 0                |
| club                                | VARCHAR(100) |  NULL                    |
| created_at                          | TIMESTAMP    | DEFAULT NOW()            |

### Relationships
teams → players (1:M)

## TABLE: matches
Stores all World Cup fixtures and results.

| Column                              | Type         | Constraints              |
|-------------------------------------|--------------|--------------------------|
| id                                  | SERIAL       | PRIMARY KEY              |
| fifa_match_number                   | INTEGER      | UNIQUE                   |
| home_team_id                        | INTEGER      | FK -> teams.id           |
| away_team_id                        | INTEGER      | FK -> teams.id           |
| group_id                            | INTEGER      | FK -> groups.id          |
| round                               | VARCHAR(50)  | NOT NULL                 |
| venue_name                          | VARCHAR(150) | NULL                     |
| venue_location                      | VARCHAR(150) | NULL                     |
| match_date                          | TIMESTAMP    | NOT NULL                 |
| actual_home_score                   | INTEGER      | NULL                     |
| actual_away_score                   | INTEGER      | NULL                     |
| actual_winner_team_id               | INTEGER      | FK -> teams.id NULL      |
| status                              | VARCHAR(25)  | DEFAULT 'scheduled'      |
| created_at                          | TIMESTAMP    | DEFAULT NOW()            |

### Status Values
- scheduled 
- in_progress
- completed

### Relationships
matches → predictions (1:M)

## TABLE: predictions
Stores user match predictions. This will be the core gameplay table.

| Column                              | Type         | Constraints              |
|-------------------------------------|--------------|--------------------------|
| id                                  | SERIAL       | PRIMARY KEY              |
| user_id                             | INTEGER      | FK -> users.id.          |
| match_id                            | INTEGER      | FK -> matches.id         |
| predicted_winner_team_id            | INTEGER      | FK -> teams.id           |
| predicted_home_score                | INTEGER      | NOT NULL                 |
| predicted_away_score                | INTEGER      | NOT NULL                 |
| points_awarded                      | INTEGER      | DEFAULT 0                |
| created_at                          | TIMESTAMP    | DEFAULT NOW()            |

### Constraints 
- UNIQUE(user_id, match_id)

## Relationships
users → predictions (1:M)

matches → predictions (1:M)

## TABLE: resources
Stores community-created resources.

| Column                              | Type         | Constraints              |
|-------------------------------------|--------------|--------------------------|
| id                                  | SERIAL       | PRIMARY KEY              |
| user_id                             | INTEGER      | FK -> users.id.          |
| title                               | VARCHAR(150) | NOT NULL                 |
| description                         | TEXT         | NOT NULL                 |
| category                            | VARCHAR(50)  | NOT NULL                 |
| created_at                          | TIMESTAMP    | DEFAULT NOW()            |

### Supported Categories
- Fantasy League 
- Tournament Group
- Watch Party
- Viewing Location 

### Relationships
users → resources (1:M)

## Leaderboard Design
No dedicated leaderboard table will exist. The leaderboard is intentionally derived rather than stored to prevent data duplication and ensure standings always reflect the latest prediction results.

Example:
```sql
SELECT
  users.username,
  SUM(predictions.points_awarded) AS total_points
FROM predictions
JOIN users
  ON users.id = predictions.user_id
GROUP BY users.id
ORDER BY total_points DESC;
```

This will help: 
-	avoid duplicated data
-	Always accurate
-	Easier maintenance
-	Scales with future features

## TABLE: player_stats
Stores player performance statistics for individual matches.
| Column           | Type      | Constraints         |
|------------------|-----------|---------------------|
| id               | SERIAL    | PRIMARY KEY         |
| player_id        | INTEGER   | FK -> players.id    |
| match_id         | INTEGER   | FK -> matches.id    |
| minutes_played   | INTEGER   | DEFAULT 0           |
| goals            | INTEGER   | DEFAULT 0           |
| assists          | INTEGER   | DEFAULT 0           |
| saves            | INTEGER   | DEFAULT 0           |
| clean_sheet      | BOOLEAN   | DEFAULT FALSE       |
| tackles          | INTEGER   | DEFAULT 0           |
| passes_completed | INTEGER   | DEFAULT 0           |
| interceptions    | INTEGER   | DEFAULT 0           |
| yellow_cards     | INTEGER   | DEFAULT 0           |
| red_cards        | INTEGER   | DEFAULT 0           |
| created_at       | TIMESTAMP | DEFAULT NOW()       |

### Relationships
players → player_stats (1:M)

matches → player_stats (1:M)

### Constraints
- UNIQUE(player_id, match_id)

### Future Schema Planning (Not Implemented in MVP)

## TABLE: fantasy_rosters (Future Expansion)

Stores user fantasy team selections.

| Column        | Type      | Constraints       |
|---------------|-----------|-------------------|
| id            | SERIAL    | PRIMARY KEY       |
| user_id       | INTEGER   | FK → users.id     |
| forward_id    | INTEGER   | FK → players.id   |
| midfielder_id | INTEGER   | FK → players.id   |
| defender_id   | INTEGER   | FK → players.id   |
| goalkeeper_id | INTEGER   | FK → players.id   |
| captain_id    | INTEGER   | FK → players.id   |
| created_at    | TIMESTAMP | DEFAULT NOW()     |

### Relationships
users → fantasy_rosters (1:1)

players → fantasy_rosters

## TABLE: achievements (Future Expansion)
Stores available platform achievements.

| Column       | Type         | Constraints          |
|--------------|--------------|----------------------|
| id           | SERIAL       | PRIMARY KEY          |
| name         | VARCHAR(100) | UNIQUE NOT NULL      |
| description  | TEXT         | NOT NULL             |
| points_bonus | INTEGER      | DEFAULT 0            |
| created_at   | TIMESTAMP    | DEFAULT NOW()        |

### Examples:
- First Prediction
- Perfect Call
- Hat Trick
- Oracle
- Tournament Champion

## TABLE: user_achievements (Future Expansion)
Tracks achievements earned by users.

| Column         | Type      | Constraints            |
|----------------|-----------|------------------------|
| id             | SERIAL    | PRIMARY KEY            |
| user_id        | INTEGER   | FK → users.id          |
| achievement_id | INTEGER   | FK → achievements.id   |
| earned_at      | TIMESTAMP | DEFAULT NOW()          |

### Relationships
users → user_achievements (1:M)

achievements → user_achievements (1:M)

## MVP Tables Summary
| Table             | Purpose                         |
|-------------------|---------------------------------|
| users             | Platform participants           |
| groups            | FIFA World Cup groups           |
| teams             | World Cup teams                 |
| players           | Player information              |
| matches           | Tournament fixtures and results |
| predictions       | User predictions                |
| resources         | Community resource board        |
| player_stats      | Stores player performance stats |