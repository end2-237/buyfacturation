import { supabase } from "@/lib/supabase";
import { getPaymentProvider } from "@/lib/payments";
import { NextResponse } from "next/server";
import { prevenirApp } from "@/lib/apps";

// POST /api/webhooks/pawapay
// Callback de confirmation PawaPay. Source de vérité du paiement.
// Doit répondre 200 rapidement (Vercel serverless).
export async function POST(request) {
  const headers = Object.fromEntries(request.headers);
  const payload = await request.json().catch(() => ({}));

  const provider = getPaymentProvider("pawapay");

  // 1. Authenticité
  if (!provider.verifierWebhook(payload, headers)) {
    return NextResponse.json({ error: "Signature invalide" }, { status: 401 });
  }

  // 2. Parser
  const { providerTxId, statut, raison } = provider.parseWebhook(payload);
  if (!providerTxId) {
    return NextResponse.json({ error: "depositId manquant" }, { status: 400 });
  }

  // 3. Retrouver la transaction
  const { data: tx } = await supabase
    .from("transactions").select("*").eq("provider_tx_id", providerTxId).single();
  if (!tx) {
    // On répond 200 pour éviter que PawaPay ne réessaie indéfiniment.
    return NextResponse.json({ received: true, note: "transaction inconnue" });
  }

  // 4. Mettre à jour transaction + facture
  await supabase.from("transactions")
    .update({ statut, raw_webhook: payload, ...(raison ? { raison } : {}) }).eq("id", tx.id);

  // Une collecte venue d'une application (Master Break, Camille…) : on la
  // prévient, pour qu'elle crédite sans attendre sa prochaine interrogation.
  if (tx.app && tx.statut !== statut) {
    await prevenirApp({ ...tx, statut, raison: raison || tx.raison });
  }

  if (tx.facture_id) {
    if (statut === "COMPLETED") {
      await supabase.from("invoices").update({ status: "paid" }).eq("id", tx.facture_id);
    }
    // (statut FAILED/EXPIRED : la facture reste en l'état, le client peut réessayer)
  }

  // 5. Répondre vite (notifications/reçus à déporter hors handler si besoin)
  return NextResponse.json({ received: true });
}
