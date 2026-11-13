-- ─────────────────────────────────────────────────────────────────────────────
-- migration_proforma.sql — la facture proforma devient un type à part.
--
-- Une proforma est un devis chiffré : rien n'est dû tant que le client ne l'a
-- pas acceptée, et elle ne vaut pas facture. Elle porte un objet (la prestation
-- en une phrase), une date de validité (due_date) et des conditions libres.
--
-- A LANCER SUR LA BASE SUPABASE DE BUYFACTURATION (celle qui porte `invoices`).
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_type_check;
ALTER TABLE invoices ADD  CONSTRAINT invoices_type_check
  CHECK (type IN ('standard', 'abonnement', 'bon_commande', 'recu', 'proforma'));

ALTER TABLE invoices ADD COLUMN IF NOT EXISTS objet      TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS conditions TEXT;

COMMENT ON COLUMN invoices.objet      IS 'Objet du document (proforma) : la prestation en une phrase.';
COMMENT ON COLUMN invoices.conditions IS 'Conditions libres (proforma) : acompte, délais, modalités.';
-- Pour une proforma, due_date = date de fin de validité. Lignes : items[] avec
-- description, details (facultatif), quantity, unit (facultatif), price.
