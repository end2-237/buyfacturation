import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import InvoiceForm from "@/components/InvoiceForm";

export default async function EditInvoicePage({ params }) {
  const { data: inv } = await supabase.from("invoices").select("*").eq("id", params.id).single();
  if (!inv) notFound();

  return (
    <div>
      <h1 style={{ margin: "0 0 24px", fontSize: 22, fontWeight: "700", color: "#0F1623" }}>Modifier {inv.number}</h1>
      <InvoiceForm initial={inv} />
    </div>
  );
}
