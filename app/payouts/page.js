export const dynamic = "force-dynamic";
import { supabase } from "@/lib/supabase";
import PayoutForm from "./PayoutForm";

const D = { white: "#FFFFFF", bdr: "#EDEFF3", tx1: "#0F1728", tx2: "#4A5568", tx3: "#8896A8" };
const statutColor = {
  PENDING: { bg: "#FEF3C7", c: "#92400E", l: "En attente" },
  ACCEPTED: { bg: "#EAF0FF", c: "#2F6BFF", l: "Acceptée" },
  COMPLETED: { bg: "#DCFCE7", c: "#166534", l: "Envoyée" },
  FAILED: { bg: "#FEE2E2", c: "#991B1B", l: "Échouée" },
  EXPIRED: { bg: "#F1F3F6", c: "#6B7280", l: "Expirée" },
};
function fmt(n) { return Number(n || 0).toLocaleString("fr-FR"); }

export default async function PayoutsPage() {
  const { data: payouts } = await supabase
    .from("transactions").select("*").eq("source", "payout").order("created_at", { ascending: false });
  const all = payouts || [];
  const total = all.filter(t => t.statut === "COMPLETED").reduce((s, t) => s + Number(t.montant || 0), 0);

  return (
    <div>
      <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: D.tx1 }}>Décaissements</h1>
      <p style={{ margin: "4px 0 24px", color: D.tx3, fontSize: 13 }}>Envoyer de l&apos;argent Mobile Money — remboursements, fournisseurs, reversements</p>

      <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
        <PayoutForm />

        <div style={{ flex: 1, minWidth: 380, background: D.white, borderRadius: 12, border: `1px solid ${D.bdr}`, overflow: "hidden" }}>
          <div style={{ padding: "14px 18px", borderBottom: `1px solid ${D.bdr}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: 700, color: D.tx1, fontSize: 14 }}>Historique</span>
            <span style={{ fontSize: 12.5, color: D.tx3 }}>Total envoyé : <strong style={{ color: "#166534" }}>{fmt(total)} FCFA</strong></span>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr style={{ background: "#F7F8FA" }}>
              {["Date", "Bénéficiaire", "Opérateur", "Montant", "Statut"].map(h => (
                <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 10.5, color: D.tx3, fontWeight: 700, textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {all.map(t => {
                const st = statutColor[t.statut] || statutColor.PENDING;
                return (
                  <tr key={t.id} style={{ borderTop: `1px solid ${D.bdr}` }}>
                    <td style={{ padding: "11px 14px", fontSize: 12.5, color: D.tx2 }}>{new Date(t.created_at).toLocaleString("fr-FR")}</td>
                    <td style={{ padding: "11px 14px", fontSize: 12.5, color: D.tx1 }}>{t.numero_payeur}</td>
                    <td style={{ padding: "11px 14px", fontSize: 12.5, color: D.tx2 }}>{t.operateur}</td>
                    <td style={{ padding: "11px 14px", fontSize: 12.5, fontWeight: 600, color: D.tx1 }}>{fmt(t.montant)} FCFA</td>
                    <td style={{ padding: "11px 14px" }}>
                      <span style={{ background: st.bg, color: st.c, borderRadius: 6, padding: "3px 8px", fontSize: 10.5, fontWeight: 600 }}>{st.l}</span>
                    </td>
                  </tr>
                );
              })}
              {all.length === 0 && (
                <tr><td colSpan={5} style={{ padding: 28, textAlign: "center", color: D.tx3, fontSize: 12.5 }}>Aucun décaissement pour l&apos;instant.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
