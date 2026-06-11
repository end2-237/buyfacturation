import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { FileText, Plus } from "lucide-react";

const D = { brand: "#DD5509", white: "#FFFFFF", bdr: "#DCE0E8", tx1: "#0F1623", tx2: "#4A5568", tx3: "#8896A8" };

const statusLabel = { draft: "Brouillon", sent: "Envoyée", paid: "Payée" };
const statusColor = { draft: "#92400E", sent: "#1E40AF", paid: "#166534" };
const statusBg = { draft: "#FEF3C7", sent: "#DBEAFE", paid: "#DCFCE7" };

export default async function InvoicesPage({ searchParams }) {
  const search = searchParams?.search || "";
  const type = searchParams?.type || "";
  const status = searchParams?.status || "";

  let query = supabase.from("invoices").select("*").order("created_at", { ascending: false });
  if (type) query = query.eq("type", type);
  if (status) query = query.eq("status", status);
  if (search) query = query.or(`number.ilike.%${search}%,client_name.ilike.%${search}%`);

  const { data: invoices } = await query;
  const all = invoices || [];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: "700", color: D.tx1 }}>Factures</h1>
        <Link href="/invoices/new" style={{ display: "flex", alignItems: "center", gap: 6, background: D.brand, color: "#fff", padding: "10px 18px", borderRadius: 8, textDecoration: "none", fontSize: 13, fontWeight: "600" }}>
          <Plus size={15} /> Nouvelle facture
        </Link>
      </div>

      {/* Filters */}
      <form style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <input name="search" defaultValue={search} placeholder="Rechercher…"
          style={{ flex: 1, border: `1px solid ${D.bdr}`, borderRadius: 6, padding: "8px 12px", fontSize: 13, background: D.white }} />
        <select name="type" defaultValue={type}
          style={{ border: `1px solid ${D.bdr}`, borderRadius: 6, padding: "8px 12px", fontSize: 13, background: D.white }}>
          <option value="">Tous types</option>
          <option value="standard">Standard</option>
          <option value="abonnement">Abonnement</option>
        </select>
        <select name="status" defaultValue={status}
          style={{ border: `1px solid ${D.bdr}`, borderRadius: 6, padding: "8px 12px", fontSize: 13, background: D.white }}>
          <option value="">Tous statuts</option>
          <option value="draft">Brouillon</option>
          <option value="sent">Envoyée</option>
          <option value="paid">Payée</option>
        </select>
        <button type="submit" style={{ background: D.brand, color: "#fff", border: "none", borderRadius: 6, padding: "8px 16px", cursor: "pointer", fontSize: 13 }}>Filtrer</button>
      </form>

      <div style={{ background: D.white, borderRadius: 10, border: `1px solid ${D.bdr}`, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#F7F8FA" }}>
              {["N° Facture", "Client", "Type", "Date", "Statut", ""].map(h => (
                <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, color: D.tx3, fontWeight: "600", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {all.map(inv => (
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
                <td style={{ padding: "12px 16px" }}>
                  <Link href={`/invoices/${inv.id}`} style={{ color: D.tx3, fontSize: 12, textDecoration: "none" }}>Voir →</Link>
                </td>
              </tr>
            ))}
            {all.length === 0 && (
              <tr><td colSpan={6} style={{ padding: 32, textAlign: "center", color: D.tx3 }}>Aucune facture trouvée.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
