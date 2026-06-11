import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Link from "next/link";
import InvoiceActions from "@/components/InvoiceActions";
import InvoicePreviewAbonnement from "@/components/InvoicePreviewAbonnement";
import InvoicePreviewStandard from "@/components/InvoicePreviewStandard";

const D = { brand: "#DD5509", white: "#FFFFFF", bdr: "#DCE0E8", tx1: "#0F1623", tx3: "#8896A8" };

export default async function InvoicePage({ params }) {
  const { data: inv } = await supabase.from("invoices").select("*").eq("id", params.id).single();
  if (!inv) notFound();

  const statusLabel = { draft: "Brouillon", sent: "Envoyée", paid: "Payée" };
  const statusColor = { draft: "#92400E", sent: "#1E40AF", paid: "#166534" };
  const statusBg = { draft: "#FEF3C7", sent: "#DBEAFE", paid: "#DCFCE7" };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <Link href="/invoices" style={{ color: D.tx3, textDecoration: "none", fontSize: 13 }}>← Retour aux factures</Link>
          <h1 style={{ margin: "4px 0 0", fontSize: 22, fontWeight: "700", color: D.tx1 }}>{inv.number}</h1>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ background: statusBg[inv.status], color: statusColor[inv.status], borderRadius: 4, padding: "4px 10px", fontSize: 12, fontWeight: "600" }}>
            {statusLabel[inv.status]}
          </span>
          <Link href={`/invoices/${inv.id}/edit`} style={{ background: "#F7F8FA", color: D.tx1, border: `1px solid ${D.bdr}`, borderRadius: 6, padding: "8px 14px", textDecoration: "none", fontSize: 13 }}>
            Modifier
          </Link>
          <InvoiceActions id={inv.id} email={inv.client_email} />
        </div>
      </div>

      <div style={{ overflow: "auto" }}>
        {inv.type === "abonnement"
          ? <InvoicePreviewAbonnement d={inv} />
          : <InvoicePreviewStandard d={inv} />}
      </div>
    </div>
  );
}
