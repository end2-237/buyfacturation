-- ─────────────────────────────────────────────────────────────────────────────
-- migration_recu_versement.sql — le reçu de versement devient un type a part.
--
-- Un versement n'est pas une facture : l'argent va dans l'autre sens, rien
-- n'est du, et personne n'a a payer quoi que ce soit en le lisant. Le faire
-- passer pour une facture obligeait le lecteur a faire la traduction lui-meme.
--
-- Buyticle s'en sert pour attester les retraits verses aux boutiques, une fois
-- le virement mobile money parti.
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

ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_type_check;
ALTER TABLE invoices ADD  CONSTRAINT invoices_type_check
  CHECK (type IN ('standard', 'abonnement', 'bon_commande', 'recu'));

COMMENT ON COLUMN invoices.type IS
  'standard : facture. bon_commande : confirmation de commande, rien n''est du. '
  'abonnement : abonnement plateforme, essai gratuit ou periode reglee. '
  'recu : attestation d''un versement effectue AU beneficiaire (retrait vendeur).';

-- Deux colonnes que le recu utilise, et qui servent aussi ailleurs :
--
--   reference : la reference de transaction de l'operateur. C'est le seul
--               element qu'emetteur et beneficiaire peuvent verifier chacun
--               de son cote — elle merite sa place sur la piece.
--   notice    : une mention libre en bas de document. Buyticle y ecrit le
--               recours en cas de virement non recu.
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS reference TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS notice    TEXT;
