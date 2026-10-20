import { supabase } from "@/lib/supabase";
import { getPaymentProvider } from "@/lib/payments";
import { appAppelante } from "@/lib/apps";
import { vue } from "@/lib/collectes";
import { NextResponse } from "next/server";

const FINAUX = ["COMPLETED", "FAILED", "EXPIRED"];

// GET /api/v1/collectes/:reference
// Le statut d'une collecte, redemandé à pawaPay tant qu'elle n'est pas finie.
// C'est la seule source qu'une application doit croire avant de créditer.
export async function GET(request, { params }) {
  const { app, refus } = appAppelante(request);
  if (refus) return refus;

  const { reference } = await params;
  const { data: tx } = await supabase
    .from("transactions").select("*").eq("provider_tx_id", reference).maybeSingle();
  if (!tx || tx.app !== app.nom) return NextResponse.json({ error: "collecte introuvable" }, { status: 404 });
  if (FINAUX.includes(tx.statut)) return NextResponse.json(vue(tx));

  try {
    const { statut, raison } = await getPaymentProvider(tx.provider).verifierStatut(reference);
    if (statut === tx.statut) return NextResponse.json(vue(tx));
    const { data: maj } = await supabase
      .from("transactions")
      .update({ statut, ...(raison ? { raison } : {}) })
      .eq("id", tx.id).select().single();
    return NextResponse.json(vue(maj || { ...tx, statut, raison }));
  } catch (e) {
    // pawaPay ne connaît pas encore le dépôt, ou ne répond pas : on rend ce qu'on sait.
    return NextResponse.json({ ...vue(tx), avertissement: e.message });
  }
}
