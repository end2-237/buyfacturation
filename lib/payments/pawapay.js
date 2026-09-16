import { STATUTS } from "./provider.js";

/**
 * Adaptateur PawaPay (deposits = encaissement mobile money).
 * Doc : https://docs.pawapay.io — les noms de champs / codes correspondent à l'API deposits v1.
 * Tout ce qui est spécifique à PawaPay reste confiné dans ce fichier.
 */

const BASE_URL = process.env.PAWAPAY_BASE_URL || "https://api.sandbox.pawapay.io";
const TOKEN = process.env.PAWAPAY_API_TOKEN;

// Codes correspondent PawaPay pour le Cameroun (à confirmer dans le dashboard live).
const CORRESPONDENT = {
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
    const msg = json?.errorMessage || json?.message || `PawaPay ${res.status}`;
    throw new Error(msg);
  }
  return json;
}

export const PawaPayProvider = {
  name: "pawapay",

  async initierPaiement({ depositId, montant, devise, numero, operateur, reference }) {
    const correspondent = CORRESPONDENT[operateur];
    if (!correspondent) throw new Error(`Opérateur non supporté : ${operateur}`);

    const body = {
      depositId,
      amount: String(montant),
      currency: devise || "XAF",
      correspondent,
      payer: { type: "MSISDN", address: { value: numero } },
      customerTimestamp: new Date().toISOString(),
      statementDescription: (reference || "BUYTICLE").slice(0, 22),
    };

    const json = await pawapayFetch("/deposits", {
      method: "POST",
      body: JSON.stringify(body),
    });

    // Réponse : { depositId, status }
    return { providerTxId: depositId, statut: mapStatut(json.status) };
  },

  async verifierStatut(providerTxId) {
    // GET /deposits/{id} -> tableau [{ depositId, status, ... }]
    const json = await pawapayFetch(`/deposits/${providerTxId}`, { method: "GET" });
    const entry = Array.isArray(json) ? json[0] : json;
    return { statut: mapStatut(entry?.status) };
  },

  verifierWebhook(_payload, _headers) {
    // PawaPay ne signe pas toujours les callbacks ; si un secret partagé est configuré,
    // on peut le comparer ici. Par défaut on accepte (la réconciliation se fait via verifierStatut).
    const secret = process.env.PAWAPAY_WEBHOOK_SECRET;
    if (!secret) return true;
    return _headers?.["x-pawapay-signature"] === secret;
  },

  parseWebhook(payload) {
    return {
      providerTxId: payload?.depositId,
      statut: mapStatut(payload?.status),
      montant: payload?.amount ? Number(payload.amount) : undefined,
      devise: payload?.currency,
    };
  },
};
