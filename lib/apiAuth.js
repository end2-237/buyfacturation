// ─────────────────────────────────────────────────────────────────────────────
// Protection des routes API par clé partagée.
//
// Les routes /api/invoices sont aujourd'hui ouvertes : n'importe qui peut créer,
// lister et télécharger des documents. Dès qu'un service externe les appelle
// (Camille pour les bons de commande), ça devient un vrai trou.
//
// Le contrôle est OPTIONNEL : sans BUYFACT_API_KEY, rien ne change et les
// usages existants continuent de fonctionner. Dès que la variable est posée,
// toute requête doit porter la clé.
// ─────────────────────────────────────────────────────────────────────────────
import { NextResponse } from "next/server";
import crypto from "crypto";

function safeEqual(a, b) {
  const ba = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

/**
 * @param {Request} request
 * @returns {NextResponse|null} une réponse 401 si refusé, null si autorisé
 */
export function requireApiKey(request) {
  const expected = process.env.BUYFACT_API_KEY;
  if (!expected) return null; // non configuré : ouvert, comme avant

  const given =
    request.headers.get("x-api-key") ||
    (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");

  if (!given || !safeEqual(given, expected)) {
    return NextResponse.json({ error: "Clé d'API invalide" }, { status: 401 });
  }
  return null;
}
