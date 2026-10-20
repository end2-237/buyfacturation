// ─────────────────────────────────────────────────────────────────────────────
// Les applications qui encaissent par buyfacturation (Master Break, Camille…).
//
// Chacune a sa clé, posée dans BUYFACT_APPS :
//   BUYFACT_APPS="kix:cle-longue-et-secrete,camille:autre-cle"
// La clé sert deux fois : l'application la présente pour appeler l'API, et
// buyfacturation signe avec elle les notifications qu'il lui renvoie.
// ─────────────────────────────────────────────────────────────────────────────
import { NextResponse } from "next/server";
import crypto from "crypto";

function apps() {
  return String(process.env.BUYFACT_APPS || "")
    .split(",")
    .map((paire) => paire.trim())
    .filter(Boolean)
    .map((paire) => {
      const i = paire.indexOf(":");
      return { nom: paire.slice(0, i).trim(), cle: paire.slice(i + 1).trim() };
    })
    .filter((a) => a.nom && a.cle.length >= 16);
}

function egal(a, b) {
  const ba = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  return ba.length === bb.length && crypto.timingSafeEqual(ba, bb);
}

/**
 * L'application qui appelle, d'après sa clé.
 * @returns {{ app: {nom: string, cle: string} } | { refus: NextResponse }}
 */
export function appAppelante(request) {
  const donnee =
    request.headers.get("x-api-key") ||
    (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  const app = donnee ? apps().find((a) => egal(a.cle, donnee)) : null;
  if (!app) return { refus: NextResponse.json({ error: "Clé d'application invalide" }, { status: 401 }) };
  return { app };
}

export const cleDe = (nom) => apps().find((a) => a.nom === nom)?.cle || null;

/** Signature HMAC-SHA256 du corps exact envoyé, en hexadécimal. */
export const signer = (corps, cle) => crypto.createHmac("sha256", cle).update(corps).digest("hex");

/**
 * Prévient l'application qu'une collecte a changé de statut.
 *
 * La notification ne porte que la référence et le statut : l'application
 * doit de toute façon redemander le statut avec sa clé avant de créditer
 * quoi que ce soit. Un échec d'envoi n'est pas grave — elle interroge aussi
 * d'elle-même.
 */
export async function prevenirApp(tx) {
  if (!tx?.callback_url || !tx.app) return;
  const cle = cleDe(tx.app);
  if (!cle) return;
  const corps = JSON.stringify({
    reference: tx.provider_tx_id,
    statut: tx.statut,
    montant: Number(tx.montant),
    operateur: tx.operateur,
    raison: tx.raison || null,
  });
  try {
    await fetch(tx.callback_url, {
      method: "POST",
      headers: { "content-type": "application/json", "x-buyticle-signature": `sha256=${signer(corps, cle)}` },
      body: corps,
      signal: AbortSignal.timeout(5000),
    });
  } catch (e) {
    console.warn(`[buyfact] notification à ${tx.app} impossible : ${e.message}`);
  }
}
