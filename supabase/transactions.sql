-- ============================================================
-- Table transactions — centralisation de tous les encaissements
-- (factures manuelles, boutique, Camille, …) quel que soit le provider.
-- ============================================================
CREATE TABLE IF NOT EXISTS transactions (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  facture_id     UUID REFERENCES invoices(id) ON DELETE SET NULL,  -- nullable : paiement hors facture
  montant        NUMERIC(14,2) NOT NULL,
  devise         TEXT NOT NULL DEFAULT 'XAF',
  operateur      TEXT CHECK (operateur IN ('MTN', 'ORANGE')),
  numero_payeur  TEXT,                                             -- MSISDN international, ex. 2376XXXXXXXX
  provider       TEXT NOT NULL DEFAULT 'pawapay',                  -- pawapay | cinetpay | …
  provider_tx_id TEXT UNIQUE,                                      -- depositId côté PawaPay
  statut         TEXT NOT NULL DEFAULT 'PENDING'
                   CHECK (statut IN ('PENDING', 'ACCEPTED', 'COMPLETED', 'FAILED', 'EXPIRED')),
  source         TEXT NOT NULL DEFAULT 'facture_manuelle',         -- facture_manuelle | boutique | camille | …
  raw_webhook    JSONB,                                            -- charge utile brute (audit/debug)
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tx_facture   ON transactions (facture_id);
CREATE INDEX IF NOT EXISTS idx_tx_provider  ON transactions (provider_tx_id);
CREATE INDEX IF NOT EXISTS idx_tx_statut    ON transactions (statut);
CREATE INDEX IF NOT EXISTS idx_tx_created   ON transactions (created_at DESC);

-- Réutilise la fonction update_updated_at() créée dans schema.sql
CREATE TRIGGER transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
