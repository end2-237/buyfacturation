-- ─────────────────────────────────────────────────────────────────────────────
-- migration_vendeur.sql — l'émetteur du document devient une donnée.
--
-- Jusqu'ici l'en-tête et le pied de page portaient BUYTICLE ETS en dur, avec
-- son RCCM et son NIU. Tout client de la plateforme envoyait donc à SES propres
-- clients un bon de commande au nom d'une autre entreprise.
--
-- La colonne est facultative : un document sans `seller` continue de s'imprimer
-- exactement comme avant. Les factures déjà émises ne bougent pas.
--
-- A LANCER SUR LA BASE SUPABASE DE BUYFACTURATION (celle qui porte `invoices`),
-- PAS sur le Postgres de Camille.
-- ─────────────────────────────────────────────────────────────────────────────

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

-- Emetteur du document : { name, tagline, address, phone, email, rccm, niu,
--                          logo_url, color }
-- Toutes les cles sont facultatives ; chacune retombe sur la valeur BUYTICLE
-- historique quand elle manque.
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS seller JSONB;

COMMENT ON COLUMN invoices.seller IS
  'Entreprise émettrice du document. NULL = en-tête BUYTICLE ETS par défaut.';
