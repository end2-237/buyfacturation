import { supabase } from "@/lib/supabase";
import { getPaymentProvider } from "@/lib/payments";
import { toMsisdn } from "@/lib/invoice-utils";
import { randomUUID } from "crypto";

/**
 * Logique de décaissement partagée entre la route API (/api/payouts) et
 * la page admin (server action). Envoie de l'argent Mobile Money et
 * enregistre la transaction (source='payout').
 */
export async function doPayout({ numero, operateur, montant, reference, source }) {
  if (!numero || !operateur || !montant) {
    return { ok: false, status: 400, error: "numero, operateur et montant requis" };
  }
  if (!["MTN", "ORANGE"].includes(operateur)) {
    return { ok: false, status: 400, error: "operateur doit être MTN ou ORANGE" };
  }
  const amount = Number(montant);
  if (!amount || amount <= 0) {
    return { ok: false, status: 400, error: "montant invalide" };
  }

  const payoutId = randomUUID();
  const msisdn = toMsisdn(numero);

  const { data: tx, error: txErr } = await supabase
    .from("transactions")
    .insert({
      facture_id: null,
      montant: amount,
      devise: "XAF",
      operateur,
      numero_payeur: msisdn,
      provider: process.env.PAYMENT_DEFAULT_PROVIDER || "pawapay",
      provider_tx_id: payoutId,
      statut: "PENDING",
      source: source || "payout",
    })
    .select()
    .single();
  if (txErr) return { ok: false, status: 500, error: txErr.message };

  try {
    const provider = getPaymentProvider();
    const res = await provider.initierPayout({
      payoutId, montant: amount, devise: "XAF", numero: msisdn, operateur,
      reference: reference || "BUYTICLE",
    });
    await supabase.from("transactions").update({ statut: res.statut }).eq("id", tx.id);
    return { ok: true, status: 200, transactionId: tx.id, providerTxId: payoutId, statut: res.statut, montant: amount, numero: msisdn };
  } catch (e) {
    await supabase.from("transactions")
      .update({ statut: "FAILED", raw_webhook: { error: e.message } }).eq("id", tx.id);
    return { ok: false, status: 502, error: `Échec du décaissement : ${e.message}`, transactionId: tx.id };
  }
}
