CREATE TABLE IF NOT EXISTS match_awards (
  id SERIAL PRIMARY KEY,
  match_id BIGINT NOT NULL,
  discord_id VARCHAR(20) NOT NULL,
  steam_id VARCHAR(32) NOT NULL,
  award_keys TEXT[] NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(match_id, steam_id),
  FOREIGN KEY (discord_id) REFERENCES users(discord_id)
);

CREATE INDEX IF NOT EXISTS idx_awards_discord ON match_awards(discord_id);
