import { supabase } from "@/lib/supabase";
import { getPaymentProvider } from "@/lib/payments";
import { appAppelante } from "@/lib/apps";
import { toMsisdn } from "@/lib/invoice-utils";
import { operateurDuNumero } from "@/lib/operateur";
import { vue } from "@/lib/collectes";
import { NextResponse } from "next/server";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// POST /api/v1/collectes
// Encaisser un montant pour une application (Master Break, Camille…), sans facture.
// En-tête : x-api-key: <clé de l'app, voir BUYFACT_APPS>
// Corps : { reference (UUID v4, idempotent), montant, numero, operateur?, description?, callbackUrl? }
export async function POST(request) {
  const { app, refus } = appAppelante(request);
  if (refus) return refus;

  const body = await request.json().catch(() => ({}));
  const reference = String(body.reference || "");
  const montant = Math.round(Number(body.montant));
  const numero = toMsisdn(body.numero);
  const operateur = body.operateur || operateurDuNumero(numero);
  const callbackUrl = typeof body.callbackUrl === "string" && body.callbackUrl.startsWith("https://") ? body.callbackUrl : null;

  if (!UUID.test(reference)) return NextResponse.json({ error: "reference : UUID v4 attendu" }, { status: 400 });
  if (!montant || montant <= 0) return NextResponse.json({ error: "montant invalide" }, { status: 400 });
  if (!/^2376\d{8}$/.test(numero)) return NextResponse.json({ error: "numéro camerounais attendu" }, { status: 400 });
  if (!["MTN", "ORANGE"].includes(operateur)) {
    return NextResponse.json({ error: "operateur : MTN ou ORANGE (non déduit du numéro)" }, { status: 400 });
  }

  // Idempotence : la même référence rejouée rend la même collecte.
  const { data: existante } = await supabase
    .from("transactions").select("*").eq("provider_tx_id", reference).maybeSingle();
  if (existante) {
    if (existante.app !== app.nom) return NextResponse.json({ error: "référence déjà utilisée" }, { status: 409 });
    return NextResponse.json(vue(existante));
  }

  const { data: tx, error } = await supabase
    .from("transactions")
    .insert({
      facture_id: null,
      montant,
      devise: "XAF",
      operateur,
      numero_payeur: numero,
      provider: process.env.PAYMENT_DEFAULT_PROVIDER || "pawapay",
      provider_tx_id: reference,
      statut: "PENDING",
      source: app.nom,
      app: app.nom,
      description: String(body.description || "").slice(0, 200),
      callback_url: callbackUrl,
    })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  try {
    const res = await getPaymentProvider().initierPaiement({
      depositId: reference,
      montant,
      devise: "XAF",
      numero,
      operateur,
      reference: body.description || app.nom,
    });
    const { data: maj } = await supabase
      .from("transactions").update({ statut: res.statut }).eq("id", tx.id).select().single();
    return NextResponse.json(vue(maj || { ...tx, statut: res.statut }));
  } catch (e) {
    const { data: maj } = await supabase
      .from("transactions")
      .update({ statut: "FAILED", raison: e.message, raw_webhook: { error: e.message } })
      .eq("id", tx.id).select().single();
    return NextResponse.json({ ...vue(maj || tx), error: `Échec de l'initiation : ${e.message}` }, { status: 502 });
  }
}
