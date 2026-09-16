import { STATUTS } from "./provider.js";

/**
 * Adaptateur PawaPay — API v2 (deposits = encaissement mobile money).
 * Doc : https://docs.pawapay.io — endpoints /v2/deposits.
 * Tout ce qui est spécifique à PawaPay reste confiné dans ce fichier.
 */

const BASE_URL = process.env.PAWAPAY_BASE_URL || "https://api.sandbox.pawapay.io";
const TOKEN = process.env.PAWAPAY_API_TOKEN;

// Codes provider PawaPay pour le Cameroun (surchargeables par variable d'env).
const PROVIDER_CODE = {
  MTN: process.env.PAWAPAY_CORRESPONDENT_MTN || "MTN_MOMO_CMR",
  ORANGE: process.env.PAWAPAY_CORRESPONDENT_ORANGE || "ORANGE_CMR",
};

// Statuts PawaPay -> statuts internes.
function mapStatut(s) {
  switch ((s || "").toUpperCase()) {
    case "COMPLETED":
      return STATUTS.COMPLETED;
    case "ACCEPTED":
    case "SUBMITTED":
    case "ENQUEUED":
    case "IN_RECONCILIATION":
    case "PROCESSING":
      return STATUTS.ACCEPTED;
    case "FAILED":
    case "REJECTED":
      return STATUTS.FAILED;
    case "EXPIRED":
      return STATUTS.EXPIRED;
    default:
      return STATUTS.PENDING;
  }
}

async function pawapayFetch(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${TOKEN}`,
      ...(options.headers || {}),
    },
  });
  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { raw: text };
  }
  if (!res.ok) {
    const msg = json?.failureReason?.failureMessage || json?.message || json?.errorMessage || `PawaPay ${res.status}`;
    throw new Error(msg);
  }
  return json;
}

export const PawaPayProvider = {
  name: "pawapay",

  async initierPaiement({ depositId, montant, devise, numero, operateur, reference }) {
    const provider = PROVIDER_CODE[operateur];
    if (!provider) throw new Error(`Opérateur non supporté : ${operateur}`);

    const body = {
      depositId,
      amount: String(montant),
      currency: devise || "XAF",
      payer: {
        type: "MMO",
        accountDetails: {
          phoneNumber: numero, // MSISDN international sans "+"
          provider,
        },
      },
      customerMessage: (reference || "BUYTICLE").slice(0, 22),
    };

    // v2 : réponse { depositId, status, ... }
    const json = await pawapayFetch("/v2/deposits", {
      method: "POST",
      body: JSON.stringify(body),
    });

    const statut = mapStatut(json.status);
    if (statut === STATUTS.FAILED) {
      throw new Error(json?.failureReason?.failureMessage || "Paiement rejeté par PawaPay");
    }
    return { providerTxId: depositId, statut };
  },

  async verifierStatut(providerTxId) {
    // v2 : GET /v2/deposits/{id} -> { status: "FOUND", data: { status, ... } }
    const json = await pawapayFetch(`/v2/deposits/${providerTxId}`, { method: "GET" });
    const data = json?.data || json;
    return { statut: mapStatut(data?.status) };
  },

  verifierWebhook(_payload, headers) {
    // Vérifie le secret partagé si configuré, sinon on accepte
    // (la réconciliation via verifierStatut reste la source de vérité).
    const secret = process.env.PAWAPAY_WEBHOOK_SECRET;
    if (!secret) return true;
    return headers?.["x-pawapay-signature"] === secret || headers?.["signature"] === secret;
  },

  parseWebhook(payload) {
    // v2 : le callback contient l'objet deposit { depositId, status, amount, currency }
    const d = payload?.data || payload;
    return {
      providerTxId: d?.depositId,
      statut: mapStatut(d?.status),
      montant: d?.amount ? Number(d.amount) : undefined,
      devise: d?.currency,
    };
  },
};
