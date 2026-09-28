import { doPayout } from "@/lib/payout";
import { requireApiKey } from "@/lib/apiAuth";
import { NextResponse } from "next/server";

// POST /api/payouts  { numero, operateur, montant, reference?, source? }
// Décaissement Mobile Money vers un bénéficiaire. Protégé par BUYFACT_API_KEY.
export async function POST(request) {
  const denied = requireApiKey(request);
  if (denied) return denied;

  const body = await request.json().catch(() => ({}));
  const r = await doPayout(body);
  if (!r.ok) return NextResponse.json({ error: r.error, transactionId: r.transactionId }, { status: r.status });
  return NextResponse.json({
    transactionId: r.transactionId,
    providerTxId: r.providerTxId,
    statut: r.statut,
    message: `Décaissement de ${r.montant} FCFA initié vers ${r.numero}.`,
  });
}
