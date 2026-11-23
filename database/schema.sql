CREATE TABLE IF NOT EXISTS site_content (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  published_json TEXT NOT NULL,
  draft_json TEXT,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS login_attempts (
  ip_hash TEXT PRIMARY KEY,
  attempts INTEGER NOT NULL DEFAULT 0,
  window_started INTEGER NOT NULL
);

INSERT OR IGNORE INTO site_content (id, published_json, draft_json)
VALUES (1, '{"name":"Alex Morgan","role":"Creative developer & curious builder","intro":"I make thoughtful digital experiences, one little pixel at a time.","about":"A curious builder who loves turning ideas into useful, playful things. This world is a small map of what I do and what I am learning.","skills":["JavaScript","React","UI design","CSS","Figma","Problem solving"],"projects":[{"title":"Little Weather","description":"A friendly weather dashboard with a calm, focused interface.","tags":["React","API"],"link":"#"},{"title":"Pixel Notes","description":"A tiny space for collecting thoughts and keeping ideas moving.","tags":["JavaScript","CSS"],"link":"#"},{"title":"Open Source","description":"Small experiments, useful fixes and things shared with the community.","tags":["GitHub","Learning"],"link":"#"}],"journey":[{"year":"2024","title":"The beginning","description":"Started exploring how the web works."},{"year":"2025","title":"Building things","description":"Shipped small projects and learned by experimenting."},{"year":"2026","title":"Growing forward","description":"Making more thoughtful, accessible experiences."}],"socials":[{"label":"GitHub","url":"https://github.com/"},{"label":"Email","url":"mailto:hello@example.com"}],"theme":"meadow"}', NULL);