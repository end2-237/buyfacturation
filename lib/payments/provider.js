/**
 * Interface générique d'un fournisseur de paiement.
 * Chaque agrégateur (PawaPay, CinetPay, …) est un adaptateur qui implémente ces méthodes.
 * Le reste du code ne dépend jamais d'un provider en particulier.
 *
 * @typedef {Object} InitierPaiementParams
 * @property {string} depositId   - UUID généré côté nous, clé de réconciliation.
 * @property {number} montant
 * @property {string} devise      - ex. "XAF"
 * @property {string} numero      - MSISDN international sans "+", ex. "2376XXXXXXXX"
 * @property {"MTN"|"ORANGE"} operateur
 * @property {string} [reference] - description/référence facture
 *
 * @typedef {Object} PaymentProvider
 * @property {(p: InitierPaiementParams) => Promise<{providerTxId: string, statut: string}>} initierPaiement
 * @property {(providerTxId: string) => Promise<{statut: string}>} verifierStatut
 * @property {(payload: any, headers: any) => boolean} verifierWebhook
 * @property {(payload: any) => {providerTxId: string, statut: string, montant?: number, devise?: string}} parseWebhook
 */

// Normalise les statuts spécifiques d'un provider vers nos statuts internes.
export const STATUTS = {
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
  EXPIRED: "EXPIRED",
};
