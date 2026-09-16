import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { invoiceTotal } from "@/lib/invoice-utils";
import PaymentForm from "@/components/PaymentForm";

export const dynamic = "force-dynamic";

function fmt(n) { return Number(n || 0).toLocaleString("fr-FR"); }

export default async function PayPage({ params }) {
  const { data: inv } = await supabase.from("invoices").select("*").eq("id", params.id).single();
  if (!inv) notFound();

  const montant = invoiceTotal(inv);
  const alreadyPaid = inv.status === "paid";

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, background: "#E8EAEE" }}>
      <div style={{ width: 420, maxWidth: "100%", background: "#fff", borderRadius: 14, border: "1px solid #DCE0E8", overflow: "hidden" }}>
        <div style={{ background: "#0D1B2E", padding: "20px 24px" }}>
          <div style={{ color: "#DD5509", fontWeight: 700, fontSize: 17 }}>BUYTICLE ETS</div>
          <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>Paiement de facture</div>
        </div>

        <div style={{ padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#4A5568", marginBottom: 6 }}>
            <span>Facture</span><strong style={{ color: "#0F1623" }}>{inv.number}</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#4A5568", marginBottom: 6 }}>
            <span>Client</span><span style={{ color: "#0F1623" }}>{inv.client_name}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderTop: "1px solid #EEE", marginTop: 12, paddingTop: 12 }}>
            <span style={{ fontSize: 13, color: "#4A5568" }}>Montant à payer</span>
            <strong style={{ fontSize: 24, color: "#DD5509" }}>{fmt(montant)} FCFA</strong>
          </div>

          {alreadyPaid ? (
            <div style={{ marginTop: 20, background: "#DCFCE7", color: "#166534", borderRadius: 8, padding: "14px 16px", textAlign: "center", fontWeight: 600 }}>
              ✓ Cette facture est déjà payée.
            </div>
          ) : montant <= 0 ? (
            <div style={{ marginTop: 20, background: "#FEF3C7", color: "#92400E", borderRadius: 8, padding: "14px 16px", textAlign: "center" }}>
              Cette facture n'a pas de montant à régler.
            </div>
          ) : (
            <PaymentForm invoiceId={inv.id} />
          )}
        </div>
      </div>
    </div>
  );
}
