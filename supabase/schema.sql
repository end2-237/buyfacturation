-- Table des factures
CREATE TABLE IF NOT EXISTS invoices (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type        TEXT NOT NULL CHECK (type IN ('standard', 'abonnement')),
  number      TEXT NOT NULL UNIQUE,
  date        DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date    DATE,

  -- Abonnement
  platform      TEXT,
  platform_url  TEXT,
  trial_months  INTEGER,
  trial_start   DATE,
  trial_end     DATE,
  statut        TEXT,

  niu         TEXT,

  -- Client
  client_name     TEXT NOT NULL,
  client_address  TEXT,
  client_phone    TEXT,
  client_email    TEXT,

  -- Standard
  items       JSONB DEFAULT '[]'::jsonb,
  bank_info   TEXT,

  status      TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour la recherche
CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices (number);
CREATE INDEX IF NOT EXISTS idx_invoices_status  ON invoices (status);
CREATE INDEX IF NOT EXISTS idx_invoices_type    ON invoices (type);
CREATE INDEX IF NOT EXISTS idx_invoices_created ON invoices (created_at DESC);

-- Trigger updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
