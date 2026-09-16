import { supabase } from "@/lib/supabase";
import { getPaymentProvider } from "@/lib/payments";
import { NextResponse } from "next/server";

// GET /api/transactions/:id/status
// Polling front. Interroge PawaPay si la transaction est encore en attente,
// met à jour la base, et renvoie le statut courant.
export async function GET(_, { params }) {
  const { data: tx, error } = await supabase
    .from("transactions").select("*").eq("id", params.id).single();
  if (error || !tx) {
    return NextResponse.json({ error: "Transaction introuvable" }, { status: 404 });
  }

  // Statut déjà final : renvoyer directement.
  if (["COMPLETED", "FAILED", "EXPIRED"].includes(tx.statut)) {
    return NextResponse.json({ statut: tx.statut });
  }

  // Sinon, réconcilier auprès du provider (source de vérité).
  try {
    const provider = getPaymentProvider(tx.provider);
    const { statut } = await provider.verifierStatut(tx.provider_tx_id);

    if (statut !== tx.statut) {
      await supabase.from("transactions").update({ statut }).eq("id", tx.id);
      if (tx.facture_id && statut === "COMPLETED") {
        await supabase.from("invoices").update({ status: "paid" }).eq("id", tx.facture_id);
      }
    }
    return NextResponse.json({ statut });
  } catch (e) {
    return NextResponse.json({ statut: tx.statut, warning: e.message });
  }
}
