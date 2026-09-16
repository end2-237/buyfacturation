import { supabase } from "@/lib/supabase";
import { getPaymentProvider } from "@/lib/payments";
import { invoiceTotal, toMsisdn } from "@/lib/invoice-utils";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

// POST /api/invoices/:id/pay  { numero, operateur, source? }
// Initie un paiement mobile money pour la facture. Publique (appelée depuis /pay/:id).
export async function POST(request, { params }) {
  const body = await request.json().catch(() => ({}));
  const { numero, operateur, source } = body;

  if (!numero || !operateur) {
    return NextResponse.json({ error: "numero et operateur requis" }, { status: 400 });
  }
  if (!["MTN", "ORANGE"].includes(operateur)) {
    return NextResponse.json({ error: "operateur doit être MTN ou ORANGE" }, { status: 400 });
  }

  // 1. Charger la facture
  const { data: invoice, error } = await supabase
    .from("invoices").select("*").eq("id", params.id).single();
  if (error || !invoice) {
    return NextResponse.json({ error: "Facture introuvable" }, { status: 404 });
  }

  // 2. Vérifier qu'elle n'est pas déjà payée
  if (invoice.status === "paid") {
    return NextResponse.json({ error: "Facture déjà payée" }, { status: 409 });
  }

  const montant = invoiceTotal(invoice);
  if (!montant || montant <= 0) {
    return NextResponse.json({ error: "Montant de la facture invalide" }, { status: 400 });
  }

  // 3. depositId = clé de réconciliation
  const depositId = randomUUID();
  const msisdn = toMsisdn(numero);

  // 4. Créer la transaction en PENDING
  const { data: tx, error: txErr } = await supabase
    .from("transactions")
    .insert({
      facture_id: invoice.id,
      montant,
      devise: "XAF",
      operateur,
      numero_payeur: msisdn,
      provider: process.env.PAYMENT_DEFAULT_PROVIDER || "pawapay",
      provider_tx_id: depositId,
      statut: "PENDING",
      source: source || "facture_manuelle",
    })
    .select()
    .single();
  if (txErr) {
    return NextResponse.json({ error: txErr.message }, { status: 500 });
  }

  // 5. Appeler le provider
  try {
    const provider = getPaymentProvider();
    const res = await provider.initierPaiement({
      depositId,
      montant,
      devise: "XAF",
      numero: msisdn,
      operateur,
      reference: invoice.number,
    });

    await supabase.from("transactions")
      .update({ statut: res.statut }).eq("id", tx.id);

    return NextResponse.json({
      transactionId: tx.id,
      providerTxId: depositId,
      statut: res.statut,
      message: "Validez le paiement sur votre téléphone.",
    });
  } catch (e) {
    await supabase.from("transactions")
      .update({ statut: "FAILED", raw_webhook: { error: e.message } }).eq("id", tx.id);
    return NextResponse.json({ error: `Échec de l'initiation : ${e.message}`, transactionId: tx.id }, { status: 502 });
  }
}
