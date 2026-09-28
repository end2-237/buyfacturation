"use server";
import { doPayout } from "@/lib/payout";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// Server action : protégée car la page /payouts est derrière le login (middleware),
// et on revérifie la session ici. Pas de clé API exposée au navigateur.
export async function createPayoutAction(_prev, formData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Non autorisé." };

  const r = await doPayout({
    numero: formData.get("numero"),
    operateur: formData.get("operateur"),
    montant: formData.get("montant"),
    reference: formData.get("reference"),
    source: "payout",
  });

  if (!r.ok) return { ok: false, error: r.error };
  revalidatePath("/payouts");
  return { ok: true, message: `Décaissement de ${r.montant} FCFA initié vers ${r.numero}.`, statut: r.statut };
}
