-- ─────────────────────────────────────────────────────────────────────────────
-- migration_style_bon.sql — l'habillage du document devient une donnée.
--
-- Le tableau avait une seule allure : en-tête plein couleur, lignes alternées,
-- filets horizontaux. Chaque vendeur peut désormais choisir un modèle et deux
-- réglages fins, et poser un bandeau en bas du document.
--
-- La colonne est facultative : un document sans `style` s'imprime exactement
-- comme avant (modèle « classique »). Les documents déjà émis ne bougent pas.
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

-- Habillage du document :
--   { template:   'classique' | 'epure' | 'contraste',
--     lines:      'toutes' | 'horizontales' | 'aucune',
--     zebra:      boolean,
--     banner_url: text }
-- Toutes les clés sont facultatives ; chacune retombe sur le modèle choisi,
-- et le modèle lui-même retombe sur « classique ».
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS style JSONB;

COMMENT ON COLUMN invoices.style IS
  'Habillage du document (modèle, filets, alternance, bandeau). NULL = modèle classique.';
