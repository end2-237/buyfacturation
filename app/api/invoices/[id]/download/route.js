// Cette route reste volontairement SANS cle d'API : elle est consommee par des
// clients qui ne peuvent pas porter d'en-tete (WhatsApp via camille-core
// telecharge le PDF depuis son URL). La protection repose sur l'UUID, non
// devinable. Ne pas y exposer de liste ni de recherche.
import { supabase } from "@/lib/supabase";
import { generatePdf } from "@/lib/pdf";
import { NextResponse } from "next/server";

export async function GET(_, { params }) {
  const { data: inv, error } = await supabase.from("invoices").select("*").eq("id", params.id).single();
  if (error || !inv) return NextResponse.json({ error: "Facture introuvable" }, { status: 404 });

  const pdf = await generatePdf(inv);

  return new NextResponse(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${inv.number}.pdf"`,
    },
  });
}
