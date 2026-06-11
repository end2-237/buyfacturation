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
