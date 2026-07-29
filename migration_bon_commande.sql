-- ─────────────────────────────────────────────────────────────────────────────
-- Nouveau type de document : bon de commande.
-- Un bon de commande confirme une commande, il n'appelle aucun paiement —
-- d'où un type distinct de 'standard' plutot qu'un detournement de celui-ci.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_type_check;
ALTER TABLE invoices ADD  CONSTRAINT invoices_type_check
  CHECK (type IN ('standard', 'abonnement', 'bon_commande'));

-- Reference externe : evite de creer deux fois le meme document si le vendeur
-- appuie plusieurs fois sur "Mettre en traitement".
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS external_ref TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_invoices_external_ref
  ON invoices (external_ref) WHERE external_ref IS NOT NULL;
