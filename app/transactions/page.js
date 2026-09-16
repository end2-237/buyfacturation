export const dynamic = "force-dynamic";
import { supabase } from "@/lib/supabase";

const D = { brand: "#DD5509", white: "#FFFFFF", bdr: "#DCE0E8", tx1: "#0F1623", tx2: "#4A5568", tx3: "#8896A8" };

const statutColor = {
  PENDING: { bg: "#FEF3C7", c: "#92400E", l: "En attente" },
  ACCEPTED: { bg: "#DBEAFE", c: "#1E40AF", l: "Acceptée" },
  COMPLETED: { bg: "#DCFCE7", c: "#166534", l: "Payée" },
  FAILED: { bg: "#FEE2E2", c: "#991B1B", l: "Échouée" },
  EXPIRED: { bg: "#F1F3F6", c: "#6B7280", l: "Expirée" },
};

function fmt(n) { return Number(n || 0).toLocaleString("fr-FR"); }

export default async function TransactionsPage() {
  const { data: txs } = await supabase.from("transactions").select("*").order("created_at", { ascending: false });
  const all = txs || [];

  const encaisse = all.filter(t => t.statut === "COMPLETED").reduce((s, t) => s + Number(t.montant || 0), 0);
  const pending = all.filter(t => t.statut === "PENDING" || t.statut === "ACCEPTED").length;

  return (
    <div>
      <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: D.tx1 }}>Transactions</h1>
      <p style={{ margin: "4px 0 24px", color: D.tx3, fontSize: 13 }}>Tous les encaissements — factures, boutique, Camille</p>

      <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
        <div style={{ flex: 1, background: D.white, borderRadius: 10, padding: "18px 22px", border: `1px solid ${D.bdr}` }}>
          <div style={{ fontSize: 11, color: D.tx3, textTransform: "uppercase" }}>Total encaissé</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#166534" }}>{fmt(encaisse)} FCFA</div>
        </div>
        <div style={{ flex: 1, background: D.white, borderRadius: 10, padding: "18px 22px", border: `1px solid ${D.bdr}` }}>
          <div style={{ fontSize: 11, color: D.tx3, textTransform: "uppercase" }}>Transactions</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: D.tx1 }}>{all.length}</div>
        </div>
        <div style={{ flex: 1, background: D.white, borderRadius: 10, padding: "18px 22px", border: `1px solid ${D.bdr}` }}>
          <div style={{ fontSize: 11, color: D.tx3, textTransform: "uppercase" }}>En attente</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#92400E" }}>{pending}</div>
        </div>
      </div>

      <div style={{ background: D.white, borderRadius: 10, border: `1px solid ${D.bdr}`, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#F7F8FA" }}>
              {["Date", "Montant", "Opérateur", "Numéro", "Source", "Provider", "Statut"].map(h => (
                <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, color: D.tx3, fontWeight: 600, textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {all.map(t => {
              const st = statutColor[t.statut] || statutColor.PENDING;
              return (
                <tr key={t.id} style={{ borderTop: `1px solid ${D.bdr}` }}>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: D.tx2 }}>{new Date(t.created_at).toLocaleString("fr-FR")}</td>
                  <td style={{ padding: "12px 16px", fontWeight: 600, color: D.tx1 }}>{fmt(t.montant)} {t.devise}</td>
                  <td style={{ padding: "12px 16px", color: D.tx2 }}>{t.operateur || "—"}</td>
                  <td style={{ padding: "12px 16px", color: D.tx2, fontSize: 13 }}>{t.numero_payeur || "—"}</td>
                  <td style={{ padding: "12px 16px", color: D.tx2, fontSize: 13 }}>{t.source}</td>
                  <td style={{ padding: "12px 16px", color: D.tx3, fontSize: 13 }}>{t.provider}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ background: st.bg, color: st.c, borderRadius: 4, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>{st.l}</span>
                  </td>
                </tr>
              );
            })}
            {all.length === 0 && (
              <tr><td colSpan={7} style={{ padding: 32, textAlign: "center", color: D.tx3 }}>Aucune transaction pour l'instant.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
