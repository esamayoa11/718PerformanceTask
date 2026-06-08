-- =========================
-- E's World Cup Pick'em 2026
-- Database Schema v1 (MVP)
-- =========================
BEGIN;

-- USERS
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    favorite_team_id INTEGER,
    location VARCHAR(100),
    avatar_url TEXT,
    tournament_prediction_registered BOOLEAN DEFAULT FALSE,
    fantasy_team_registered BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- GROUPS
CREATE TABLE groups (
    id SERIAL PRIMARY KEY,
    group_name VARCHAR(5) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- TEAMS
CREATE TABLE teams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    group_id INTEGER REFERENCES groups(id),
    coach VARCHAR(100),
    country_code VARCHAR(3) UNIQUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- PLAYERS
CREATE TABLE players (
    id SERIAL PRIMARY KEY,
    team_id INTEGER REFERENCES teams(id),
    full_name VARCHAR(100) NOT NULL,
    jersey_number INTEGER NOT NULL,
    position VARCHAR(20) NOT NULL,
    date_of_birth DATE,
    caps INTEGER DEFAULT 0,
    international_goals INTEGER DEFAULT 0,
    club VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);

-- MATCHES
CREATE TABLE matches (
    id SERIAL PRIMARY KEY,
    fifa_match_number INTEGER UNIQUE,
    home_team_id INTEGER REFERENCES teams(id),
    away_team_id INTEGER REFERENCES teams(id),
    group_id INTEGER REFERENCES groups(id),
    round VARCHAR(50) NOT NULL,
    venue_name VARCHAR(150),
    venue_location VARCHAR(150),
    match_date TIMESTAMP NOT NULL,
    actual_home_score INTEGER,
    actual_away_score INTEGER,
    actual_winner_team_id INTEGER REFERENCES teams(id),
    status VARCHAR(25) DEFAULT 'scheduled',
    created_at TIMESTAMP DEFAULT NOW()
);

-- PREDICTIONS
CREATE TABLE predictions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    match_id INTEGER NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    predicted_winner_team_id INTEGER REFERENCES teams(id),
    predicted_home_score INTEGER NOT NULL,
    predicted_away_score INTEGER NOT NULL,
    points_awarded INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, match_id)
);
    
-- RESOURCES
CREATE TABLE resources (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- PLAYER STATS
CREATE TABLE player_stats (
    id SERIAL PRIMARY KEY,
    player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    match_id INTEGER NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    minutes_played INTEGER DEFAULT 0,
    goals INTEGER DEFAULT 0,
    assists INTEGER DEFAULT 0,
    saves INTEGER DEFAULT 0,
    clean_sheet BOOLEAN DEFAULT FALSE,
    tackles INTEGER DEFAULT 0,
    passes_completed INTEGER DEFAULT 0,
    interceptions INTEGER DEFAULT 0,
    yellow_cards INTEGER DEFAULT 0,
    red_cards INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(player_id, match_id)
);

-- FANTASY ROSTERS (FUTURE)
CREATE TABLE fantasy_rosters (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    forward_id INTEGER REFERENCES players(id),
    midfielder_id INTEGER REFERENCES players(id),
    defender_id INTEGER REFERENCES players(id),
    goalkeeper_id INTEGER REFERENCES players(id),
    captain_id INTEGER REFERENCES players(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- ACHIEVEMENTS (FUTURE)
CREATE TABLE achievements (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    points_bonus INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- USER ACHIEVEMENTS (FUTURE)
CREATE TABLE user_achievements (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_id INTEGER REFERENCES achievements(id),
    earned_at TIMESTAMP DEFAULT NOW()
);

-- PERFORMANCE INDEXES
CREATE INDEX idx_predictions_user_id ON predictions(user_id);
CREATE INDEX idx_predictions_match_id ON predictions(match_id);
CREATE INDEX idx_matches_group_id ON matches(group_id);

COMMIT;