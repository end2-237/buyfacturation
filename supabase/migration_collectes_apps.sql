-- ============================================================
-- Collectes pour les applications (Master Break, Camille, …)
-- À exécuter une fois dans le SQL Editor de Supabase. Idempotent.
-- ============================================================
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS app          TEXT;  -- l'application appelante (kix, camille…)
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS description  TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS callback_url TEXT;  -- prévenue à chaque changement de statut
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS raison       TEXT;  -- motif d'échec lisible

CREATE INDEX IF NOT EXISTS idx_tx_app ON transactions (app);
