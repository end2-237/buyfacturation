-- ─────────────────────────────────────────────────────────────────────────────
-- Nouveau type de document : bon de commande.
-- Un bon de commande confirme une commande, il n'appelle aucun paiement —
-- d'où un type distinct de 'standard' plutot qu'un detournement de celui-ci.
--
-- A LANCER SUR LA BASE SUPABASE DE BUYFACTURATION (celle qui porte `invoices`),
-- PAS sur le Postgres de Camille.
-- Si la table n'existe pas encore, lance schema_full.sql a la place.
-- ─────────────────────────────────────────────────────────────────────────────

-- Garde-fou : l'erreur brute « 42P01 relation invoices does not exist » ne dit
-- pas QUELLE base est en cause. Celui-ci le dit.
DO $$
BEGIN
  IF to_regclass('public.invoices') IS NULL THEN
    RAISE EXCEPTION
      'Table "invoices" absente de la base "%". Deux causes possibles : '
      '(1) tu es connecte au Postgres de Camille au lieu du Supabase de buyfacturation ; '
      '(2) le schema initial n''a jamais ete applique — lance alors schema_full.sql.',
      current_database();
  END IF;
END $$;

ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_type_check;
ALTER TABLE invoices ADD  CONSTRAINT invoices_type_check
  CHECK (type IN ('standard', 'abonnement', 'bon_commande'));

-- Reference externe : evite de creer deux fois le meme document si le vendeur
-- appuie plusieurs fois sur "Mettre en traitement".
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS external_ref TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_invoices_external_ref
  ON invoices (external_ref) WHERE external_ref IS NOT NULL;
