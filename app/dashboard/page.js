export const dynamic = "force-dynamic";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { UserPlus, Plus, CalendarPlus, ArrowDownLeft, ArrowUpRight, ChevronRight } from "lucide-react";

// ── Palette violet / vert (reprise de la maquette Melio, teinte maison) ──────
const P = {
  violet: "#7C3AED", violetDeep: "#5B21B6", violetSoft: "#F1ECFE",
  green: "#10B981", greenDeep: "#0F7B4F", greenSoft: "#E7F7F0",
  navy: "#101828", ink: "#101828", muted: "#667085", faint: "#98A2B3",
  card: "#FFFFFF", line: "#EEF0F4", pale: "#E7E2F3",
};

function fmt(n) { return Number(n || 0).toLocaleString("fr-FR").replace(/[  ]/g, " "); }
function initials(name) {
  return String(name || "?").trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() || "").join("") || "?";
}
function invoiceTotal(inv) {
  return (inv.items || []).reduce((s, i) => s + (Number(i.quantity) || 1) * Number(i.price || 0), 0);
}

// Série des N derniers jours (somme par jour) à partir d'un champ date + montant.
function dailySeries(rows, days, amountOf) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const buckets = Array.from({ length: days }, () => 0);
  for (const r of rows) {
    const d = new Date(r.created_at); d.setHours(0, 0, 0, 0);
    const diff = Math.round((today - d) / 86400000);
    if (diff >= 0 && diff < days) buckets[days - 1 - diff] += amountOf(r);
  }
  return buckets;
}

// Graphe en points (colonnes remplies par le bas), style Melio.
function DotChart({ values, rows = 7, active }) {
  const max = Math.max(1, ...values);
  return (
    <div style={{ display: "flex", gap: 4, alignItems: "flex-end", height: rows * 9 }}>
      {values.map((v, ci) => {
        const filled = Math.max(v > 0 ? 1 : 0, Math.round((v / max) * rows));
        return (
          <div key={ci} style={{ display: "flex", flexDirection: "column-reverse", gap: 3 }}>
            {Array.from({ length: rows }).map((_, ri) => (
              <span key={ri} style={{ width: 6, height: 6, borderRadius: "50%", background: ri < filled ? active : P.pale }} />
            ))}
          </div>
        );
      })}
    </div>
  );
}

function Avatar({ name, i = 0 }) {
  const tints = [P.violet, P.green, P.violetDeep, P.greenDeep];
  return (
    <span style={{ width: 26, height: 26, borderRadius: "50%", background: tints[i % tints.length], color: "#fff", fontSize: 10, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center", border: "2px solid #fff" }}>
      {initials(name)}
    </span>
  );
}

const statusMap = {
  draft: { l: "Brouillon", bg: "#FEF3C7", c: "#92400E" },
  sent: { l: "Envoyée", bg: P.violetSoft, c: P.violetDeep },
  paid: { l: "Payée", bg: P.greenSoft, c: P.greenDeep },
};
const txMap = {
  PENDING: { l: "En attente", bg: "#FEF3C7", c: "#92400E" },
  ACCEPTED: { l: "Acceptée", bg: P.violetSoft, c: P.violetDeep },
  COMPLETED: { l: "Payée", bg: P.greenSoft, c: P.greenDeep },
  FAILED: { l: "Échouée", bg: "#FEE2E2", c: "#991B1B" },
  EXPIRED: { l: "Expirée", bg: "#F1F3F6", c: "#6B7280" },
};

export default async function DashboardPage() {
  const [{ data: invoices }, { data: txs }] = await Promise.all([
    supabase.from("invoices").select("*").order("created_at", { ascending: false }),
    supabase.from("transactions").select("*").order("created_at", { ascending: false }),
  ]);
  const inv = invoices || [];
  const tx = txs || [];

  const totalFacture = inv.reduce((s, i) => s + invoiceTotal(i), 0);
  const totalEncaisse = tx.filter(t => t.statut === "COMPLETED").reduce((s, t) => s + Number(t.montant || 0), 0);
  const impayees = inv.filter(i => i.status !== "paid" && invoiceTotal(i) > 0);
  const recentInv = inv.slice(0, 4);
  const recentTx = tx.slice(0, 4);
  const clients = [...new Map(inv.map(i => [i.client_name, i])).values()].slice(0, 3);

  const serieFacture = dailySeries(inv, 24, invoiceTotal);
  const serieEncaisse = dailySeries(tx.filter(t => t.statut === "COMPLETED"), 20, t => Number(t.montant || 0));

  const card = { background: P.card, borderRadius: 16, border: `1px solid ${P.line}`, boxShadow: "0 1px 2px rgba(16,24,40,.04)" };
  const H = ({ children, right }) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: `1px solid ${P.line}` }}>
      <span style={{ fontWeight: 700, color: P.ink, fontSize: 15 }}>{children}</span>{right}
    </div>
  );

  return (
    <div style={{ margin: -28, padding: 28, minHeight: "100vh", background: "linear-gradient(135deg,#EDE9FE 0%,#EAF6F0 100%)" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: P.ink }}>Dashboard</h1>
          <p style={{ margin: "2px 0 0", color: P.muted, fontSize: 13 }}>BUYTICLE ETS — Facturation & Paiement</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Link href="/transactions" style={{ display: "flex", alignItems: "center", gap: 7, background: "#fff", border: `1px solid ${P.line}`, borderRadius: 10, padding: "9px 16px", textDecoration: "none", color: P.ink, fontSize: 13, fontWeight: 600 }}>
            <UserPlus size={15} /> Transactions
          </Link>
          <Link href="/invoices" style={{ display: "flex", alignItems: "center", gap: 7, background: "#fff", border: `1px solid ${P.line}`, borderRadius: 10, padding: "9px 16px", textDecoration: "none", color: P.ink, fontSize: 13, fontWeight: 600 }}>
            <CalendarPlus size={15} /> Factures
          </Link>
          <Link href="/invoices/new" style={{ display: "flex", alignItems: "center", gap: 7, background: P.navy, border: "none", borderRadius: 10, padding: "9px 16px", textDecoration: "none", color: "#fff", fontSize: 13, fontWeight: 600 }}>
            <Plus size={15} /> Nouvelle facture
          </Link>
        </div>
      </div>

      {/* Row 1 : profil + 2 cartes stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr", gap: 18, marginBottom: 18 }}>
        <div style={{ ...card, padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: `linear-gradient(135deg, ${P.violet}, ${P.green})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 18 }}>B</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: P.ink, fontSize: 16 }}>BUYTICLE ETS</div>
              <div style={{ color: P.muted, fontSize: 12 }}>Super Admin</div>
            </div>
            <Link href="/invoices" style={{ color: P.violet, fontSize: 12, fontWeight: 600, textDecoration: "none" }}>Voir factures</Link>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#FAFAFB", border: `1px solid ${P.line}`, borderRadius: 10, padding: "10px 14px", marginBottom: 10 }}>
            <div><div style={{ fontSize: 11, color: P.faint }}>Factures émises</div><div style={{ fontSize: 13, color: P.ink, fontWeight: 600 }}>{inv.length} documents</div></div>
            <ChevronRight size={16} color={P.faint} />
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#FAFAFB", border: `1px solid ${P.line}`, borderRadius: 10, padding: "10px 14px" }}>
            <div><div style={{ fontSize: 11, color: P.faint }}>Transactions</div><div style={{ fontSize: 13, color: P.ink, fontWeight: 600 }}>{tx.length} paiements</div></div>
            <ChevronRight size={16} color={P.faint} />
          </div>
        </div>

        <div style={{ ...card, padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <span style={{ width: 30, height: 30, borderRadius: 8, background: P.violetSoft, display: "inline-flex", alignItems: "center", justifyContent: "center" }}><ArrowDownLeft size={16} color={P.violet} /></span>
            <span style={{ fontSize: 12, color: P.muted, border: `1px solid ${P.line}`, borderRadius: 8, padding: "4px 10px" }}>Facturé</span>
          </div>
          <DotChart values={serieFacture} active={P.violet} />
          <div style={{ fontSize: 12, color: P.muted, marginTop: 14 }}>Total facturé</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: P.ink }}>{fmt(totalFacture)} <span style={{ fontSize: 13, color: P.muted }}>FCFA</span></div>
        </div>

        <div style={{ ...card, padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <span style={{ width: 30, height: 30, borderRadius: 8, background: P.greenSoft, display: "inline-flex", alignItems: "center", justifyContent: "center" }}><ArrowUpRight size={16} color={P.green} /></span>
            <span style={{ fontSize: 12, color: P.muted, border: `1px solid ${P.line}`, borderRadius: 8, padding: "4px 10px" }}>Encaissé</span>
          </div>
          <DotChart values={serieEncaisse} active={P.green} />
          <div style={{ fontSize: 12, color: P.muted, marginTop: 14 }}>Total encaissé</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: P.ink }}>{fmt(totalEncaisse)} <span style={{ fontSize: 13, color: P.muted }}>FCFA</span></div>
        </div>
      </div>

      {/* Row 2 : factures récentes + à encaisser */}
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 18, marginBottom: 18 }}>
        <div style={card}>
          <H right={<Link href="/invoices" style={{ color: P.violet, fontSize: 13, textDecoration: "none" }}>Voir tout</Link>}>Factures récentes</H>
          <div style={{ padding: 12 }}>
            {recentInv.map((i, idx) => (
              <div key={i.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 10px", borderRadius: 12, background: idx === 0 ? "#FAFAFB" : "transparent" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Avatar name={i.client_name} i={idx} />
                  <div>
                    <div style={{ fontWeight: 600, color: P.ink, fontSize: 14 }}>{i.client_name}</div>
                    <div style={{ color: P.muted, fontSize: 12 }}>{i.number} · {fmt(invoiceTotal(i))} FCFA</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ background: statusMap[i.status]?.bg, color: statusMap[i.status]?.c, borderRadius: 6, padding: "3px 9px", fontSize: 11, fontWeight: 600 }}>{statusMap[i.status]?.l}</span>
                  <Link href={`/invoices/${i.id}`} style={{ background: P.violet, color: "#fff", borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 600, textDecoration: "none" }}>Ouvrir</Link>
                </div>
              </div>
            ))}
            {recentInv.length === 0 && <div style={{ padding: 24, textAlign: "center", color: P.faint }}>Aucune facture. <Link href="/invoices/new" style={{ color: P.violet }}>Créer →</Link></div>}
          </div>
        </div>

        <div style={card}>
          <H right={<span style={{ background: P.violet, color: "#fff", borderRadius: 999, fontSize: 11, fontWeight: 700, padding: "1px 8px" }}>{impayees.length}</span>}>À encaisser</H>
          <div style={{ padding: 12 }}>
            {impayees.slice(0, 4).map((i, idx) => (
              <div key={i.id} style={{ padding: "10px 10px", borderBottom: idx < 3 ? `1px solid ${P.line}` : "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${P.pale}` }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: P.ink, fontSize: 13 }}>{i.client_name}</div>
                    <div style={{ color: P.muted, fontSize: 12 }}>{i.number}</div>
                  </div>
                  <div style={{ fontWeight: 700, color: P.violetDeep, fontSize: 13 }}>{fmt(invoiceTotal(i))}</div>
                </div>
              </div>
            ))}
            {impayees.length === 0 && <div style={{ padding: 24, textAlign: "center", color: P.faint }}>Tout est encaissé ✓</div>}
          </div>
        </div>
      </div>

      {/* Row 3 : clients récents + notifications (transactions) */}
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 18 }}>
        <div style={card}>
          <H right={<Link href="/invoices" style={{ color: P.violet, fontSize: 13, textDecoration: "none" }}>Voir tout</Link>}>Clients récents</H>
          <div style={{ padding: 12 }}>
            {clients.map((c, idx) => (
              <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 10px", borderBottom: idx < clients.length - 1 ? `1px solid ${P.line}` : "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Avatar name={c.client_name} i={idx} />
                  <div>
                    <div style={{ fontWeight: 600, color: P.ink, fontSize: 14 }}>{c.client_name}</div>
                    <div style={{ color: P.muted, fontSize: 12 }}>{c.client_email || c.client_phone || "—"}</div>
                  </div>
                </div>
                <ChevronRight size={16} color={P.faint} />
              </div>
            ))}
            {clients.length === 0 && <div style={{ padding: 24, textAlign: "center", color: P.faint }}>Aucun client.</div>}
          </div>
        </div>

        <div style={card}>
          <H right={<Link href="/transactions" style={{ color: P.violet, fontSize: 13, textDecoration: "none" }}>Tout voir</Link>}>Notifications</H>
          <div style={{ padding: 12 }}>
            {recentTx.map((t, idx) => (
              <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 10px", borderBottom: idx < recentTx.length - 1 ? `1px solid ${P.line}` : "none" }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: t.statut === "COMPLETED" ? P.green : t.statut === "FAILED" ? "#EF4444" : P.violet }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: P.ink }}><strong>{fmt(t.montant)} FCFA</strong> · {t.operateur || "—"}</div>
                  <div style={{ fontSize: 11, color: P.faint }}>{new Date(t.created_at).toLocaleString("fr-FR")}</div>
                </div>
                <span style={{ background: txMap[t.statut]?.bg, color: txMap[t.statut]?.c, borderRadius: 6, padding: "3px 9px", fontSize: 11, fontWeight: 600 }}>{txMap[t.statut]?.l}</span>
              </div>
            ))}
            {recentTx.length === 0 && <div style={{ padding: 24, textAlign: "center", color: P.faint }}>Aucune transaction.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
