import { supabase } from "@/lib/supabase";
import { getPaymentProvider } from "@/lib/payments";
import { toMsisdn } from "@/lib/invoice-utils";
import { requireApiKey } from "@/lib/apiAuth";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

// POST /api/payouts  { numero, operateur, montant, reference?, source? }
// Décaissement : envoie de l'argent Mobile Money à un bénéficiaire (remboursement,
// paiement fournisseur, dropshipping…). Protégé par clé d'API (BUYFACT_API_KEY).
export async function POST(request) {
  const denied = requireApiKey(request);
  if (denied) return denied;

  const body = await request.json().catch(() => ({}));
  const { numero, operateur, montant, reference, source } = body;

  if (!numero || !operateur || !montant) {
    return NextResponse.json({ error: "numero, operateur et montant requis" }, { status: 400 });
  }
  if (!["MTN", "ORANGE"].includes(operateur)) {
    return NextResponse.json({ error: "operateur doit être MTN ou ORANGE" }, { status: 400 });
  }
  const amount = Number(montant);
  if (!amount || amount <= 0) {
    return NextResponse.json({ error: "montant invalide" }, { status: 400 });
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
  if (txErr) return NextResponse.json({ error: txErr.message }, { status: 500 });

  try {
    const provider = getPaymentProvider();
    const res = await provider.initierPayout({
      payoutId, montant: amount, devise: "XAF", numero: msisdn, operateur,
      reference: reference || "BUYTICLE",
    });
    await supabase.from("transactions").update({ statut: res.statut }).eq("id", tx.id);
    return NextResponse.json({
      transactionId: tx.id,
      providerTxId: payoutId,
      statut: res.statut,
      message: `Décaissement de ${amount} FCFA initié vers ${msisdn}.`,
    });
  } catch (e) {
    await supabase.from("transactions")
      .update({ statut: "FAILED", raw_webhook: { error: e.message } }).eq("id", tx.id);
    return NextResponse.json({ error: `Échec du décaissement : ${e.message}`, transactionId: tx.id }, { status: 502 });
  }
}
