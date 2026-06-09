-- ============================================================
-- PLANT TRACKING MIGRATION  (MariaDB 10.4+ compatible)
-- Safe to run multiple times — uses IF NOT EXISTS everywhere.
-- ============================================================

USE maize_detection_systemai;

-- ──────────────────────────────────────────────────────────
-- 1. MAIZE_PLANTS table
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS maize_plants (
  id            INT           AUTO_INCREMENT PRIMARY KEY,
  user_id       INT           NOT NULL,
  plant_code    VARCHAR(100)  NOT NULL,
  label         VARCHAR(255),
  location      VARCHAR(500),
  field_name    VARCHAR(255),
  planted_at    DATE,
  notes         TEXT,
  is_active     BOOLEAN       DEFAULT TRUE,
  created_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_plant (user_id, plant_code),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ──────────────────────────────────────────────────────────
-- 2. Add plant_id column to analysis_results
--    MariaDB 10.0.2+ supports ADD COLUMN IF NOT EXISTS
-- ──────────────────────────────────────────────────────────
ALTER TABLE analysis_results
  ADD COLUMN IF NOT EXISTS plant_id INT NULL AFTER chat_message_id;

-- ──────────────────────────────────────────────────────────
-- 3. Add scan_sequence_number column
-- ──────────────────────────────────────────────────────────
ALTER TABLE analysis_results
  ADD COLUMN IF NOT EXISTS scan_sequence_number INT DEFAULT 1 AFTER plant_id;

-- ──────────────────────────────────────────────────────────
-- 4. Add model_version column (referenced in code but was missing from schema)
-- ──────────────────────────────────────────────────────────
ALTER TABLE analysis_results
  ADD COLUMN IF NOT EXISTS model_version VARCHAR(50) NULL AFTER processing_time_ms;

-- ──────────────────────────────────────────────────────────
-- 5. Add foreign key from analysis_results.plant_id → maize_plants.id
--    Only add if the constraint doesn't already exist
-- ──────────────────────────────────────────────────────────
ALTER TABLE analysis_results
  ADD CONSTRAINT IF NOT EXISTS fk_ar_plant
  FOREIGN KEY (plant_id) REFERENCES maize_plants(id) ON DELETE SET NULL;

-- ──────────────────────────────────────────────────────────
-- 6. PLANT_PROGRESSION_ALERTS table
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS plant_progression_alerts (
  id                   INT           AUTO_INCREMENT PRIMARY KEY,
  plant_id             INT           NOT NULL,
  previous_analysis_id INT           NULL,
  current_analysis_id  INT           NOT NULL,
  previous_severity    VARCHAR(20)   DEFAULT 'healthy',
  current_severity     VARCHAR(20)   NOT NULL,
  previous_confidence  DECIMAL(5,2)  NULL,
  current_confidence   DECIMAL(5,2)  NOT NULL,
  severity_delta       TINYINT       NOT NULL,
  alert_message        TEXT,
  is_read              BOOLEAN       DEFAULT FALSE,
  created_at           TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (plant_id)             REFERENCES maize_plants(id)      ON DELETE CASCADE,
  FOREIGN KEY (previous_analysis_id) REFERENCES analysis_results(id)  ON DELETE SET NULL,
  FOREIGN KEY (current_analysis_id)  REFERENCES analysis_results(id)  ON DELETE CASCADE
);

-- ──────────────────────────────────────────────────────────
-- 7. Indexes — speed up "all scans for plant X" queries
-- ──────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_ar_plant_id   ON analysis_results(plant_id);
CREATE INDEX IF NOT EXISTS idx_ar_plant_scan ON analysis_results(plant_id, scan_sequence_number);
