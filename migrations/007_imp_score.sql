CREATE TABLE IF NOT EXISTS match_imp_scores (
  id SERIAL PRIMARY KEY,
  match_id BIGINT NOT NULL,
  discord_id VARCHAR(20) NOT NULL,
  steam_id VARCHAR(32) NOT NULL,
  hero_id INT NOT NULL,
  imp_score DECIMAL(6,2) NOT NULL,
  rank_tier INT DEFAULT 0,
  calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(match_id, steam_id),
  FOREIGN KEY (discord_id) REFERENCES users(discord_id)
);

CREATE INDEX IF NOT EXISTS idx_imp_discord ON match_imp_scores(discord_id);
CREATE INDEX IF NOT EXISTS idx_imp_score ON match_imp_scores(imp_score DESC);
CREATE INDEX IF NOT EXISTS idx_imp_match ON match_imp_scores(match_id);
