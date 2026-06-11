import { supabase } from "@/lib/supabase";
import { generatePdf } from "@/lib/pdf";
import { sendInvoiceEmail } from "@/lib/email";
import { NextResponse } from "next/server";

export async function POST(_, { params }) {
  const { data: inv, error } = await supabase.from("invoices").select("*").eq("id", params.id).single();
  if (error || !inv) return NextResponse.json({ error: "Facture introuvable" }, { status: 404 });

  const pdf = await generatePdf(inv);
  await sendInvoiceEmail(inv, pdf);

  await supabase.from("invoices").update({ status: "sent", updated_at: new Date().toISOString() }).eq("id", params.id);

  return NextResponse.json({ message: `Facture envoyée à ${inv.client_email}`, status: "sent" });
}
