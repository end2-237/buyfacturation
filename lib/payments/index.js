import { PawaPayProvider } from "./pawapay.js";

// Registre des providers disponibles. Ajouter CinetPay ici plus tard.
const PROVIDERS = {
  pawapay: PawaPayProvider,
  // cinetpay: CinetPayProvider,
};

/**
 * Retourne le provider de paiement demandé, ou celui par défaut.
 * @param {string} [name]
 * @returns {import("./provider.js").PaymentProvider}
 */
export function getPaymentProvider(name) {
  const key = name || process.env.PAYMENT_DEFAULT_PROVIDER || "pawapay";
  const provider = PROVIDERS[key];
  if (!provider) throw new Error(`Provider de paiement inconnu : ${key}`);
  return provider;
}
