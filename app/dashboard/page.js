import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { FileText, Plus } from "lucide-react";

const D = { brand: "#DD5509", white: "#FFFFFF", bdr: "#DCE0E8", tx1: "#0F1623", tx2: "#4A5568", tx3: "#8896A8" };

function fmt(n) { return Number(n || 0).toLocaleString("fr-FR"); }

function MetricTile({ label, value, sub }) {
  return (
    <div style={{ background: D.white, borderRadius: 10, padding: "20px 24px", border: `1px solid ${D.bdr}`, flex: 1 }}>
      <div style={{ fontSize: 11, color: D.tx3, textTransform: "uppercase", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: "700", color: D.tx1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: D.tx3, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

export default async function DashboardPage() {
  const { data: invoices } = await supabase.from("invoices").select("*").order("created_at", { ascending: false });
  const all = invoices || [];

  const total = all.reduce((s, inv) => {
    if (inv.type === "standard") {
      return s + (inv.items || []).reduce((ss, it) => ss + (it.quantity || 1) * Number(it.price || 0), 0);
    }
    return s;
  }, 0);

  const sent = all.filter(i => i.status === "sent").length;
  const paid = all.filter(i => i.status === "paid").length;
  const recent = all.slice(0, 5);

  const statusLabel = { draft: "Brouillon", sent: "Envoyée", paid: "Payée" };
  const statusColor = { draft: "#92400E", sent: "#1E40AF", paid: "#166534" };
  const statusBg = { draft: "#FEF3C7", sent: "#DBEAFE", paid: "#DCFCE7" };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: "700", color: D.tx1 }}>Tableau de bord</h1>
          <p style={{ margin: "4px 0 0", color: D.tx3, fontSize: 13 }}>BUYTICLE ETS — Vue d&apos;ensemble</p>
        </div>
        <Link href="/invoices/new" style={{ display: "flex", alignItems: "center", gap: 6, background: D.brand, color: "#fff", padding: "10px 18px", borderRadius: 8, textDecoration: "none", fontSize: 13, fontWeight: "600" }}>
          <Plus size={15} /> Nouvelle facture
        </Link>
      </div>

      <div style={{ display: "flex", gap: 16, marginBottom: 28 }}>
        <MetricTile label="Factures totales" value={all.length} />
        <MetricTile label="Envoyées" value={sent} />
        <MetricTile label="Payées" value={paid} />
        <MetricTile label="Chiffre d'affaires" value={fmt(total) + " FCFA"} />
      </div>

      <div style={{ background: D.white, borderRadius: 10, border: `1px solid ${D.bdr}`, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${D.bdr}`, display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontWeight: "600", color: D.tx1 }}>Factures récentes</span>
          <Link href="/invoices" style={{ color: D.brand, fontSize: 13, textDecoration: "none" }}>Voir tout →</Link>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#F7F8FA" }}>
              {["N° Facture", "Client", "Type", "Date", "Statut"].map(h => (
                <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, color: D.tx3, fontWeight: "600", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recent.map(inv => (
              <tr key={inv.id} style={{ borderTop: `1px solid ${D.bdr}` }}>
                <td style={{ padding: "12px 16px" }}>
                  <Link href={`/invoices/${inv.id}`} style={{ color: D.brand, textDecoration: "none", fontWeight: "600", display: "flex", alignItems: "center", gap: 6 }}>
                    <FileText size={14} /> {inv.number}
                  </Link>
                </td>
                <td style={{ padding: "12px 16px", color: D.tx1 }}>{inv.client_name}</td>
                <td style={{ padding: "12px 16px" }}>
                  <span style={{ background: inv.type === "abonnement" ? "#FEF0E8" : "#DBEAFE", color: inv.type === "abonnement" ? D.brand : "#1E40AF", borderRadius: 4, padding: "2px 8px", fontSize: 11, fontWeight: "600" }}>
                    {inv.type === "abonnement" ? "Abonnement" : "Standard"}
                  </span>
                </td>
                <td style={{ padding: "12px 16px", color: D.tx2, fontSize: 13 }}>{new Date(inv.date).toLocaleDateString("fr-FR")}</td>
                <td style={{ padding: "12px 16px" }}>
                  <span style={{ background: statusBg[inv.status], color: statusColor[inv.status], borderRadius: 4, padding: "2px 8px", fontSize: 11, fontWeight: "600" }}>
                    {statusLabel[inv.status]}
                  </span>
                </td>
              </tr>
            ))}
            {recent.length === 0 && (
              <tr><td colSpan={5} style={{ padding: 32, textAlign: "center", color: D.tx3 }}>Aucune facture. <Link href="/invoices/new" style={{ color: D.brand }}>Créer la première →</Link></td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
