export const dynamic = "force-dynamic";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Plus, ArrowDownLeft, ArrowUpRight, ChevronRight, Copy, Link2, Phone } from "lucide-react";

const LOGO = "https://alrbokstfwwlvbvghrqr.supabase.co/storage/v1/object/public/vendor-assets/buylogo.png";

const B = {
  blue: "#2F6BFF", blueSoft: "#EAF0FF", navy: "#101828",
  ink: "#0F1728", muted: "#667085", faint: "#98A2B3",
  line: "#EDEFF3", pale: "#DCE3F1", green: "#12B76A", greenSoft: "#E7F7EF", greenDeep: "#0F7B4F",
};

function fmt(n) { return Number(n || 0).toLocaleString("fr-FR").replace(/[  ]/g, " "); }
function initials(name) { return String(name || "?").trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() || "").join("") || "?"; }
function invoiceTotal(inv) { return (inv.items || []).reduce((s, i) => s + (Number(i.quantity) || 1) * Number(i.price || 0), 0); }

function dailySeries(rows, days, amountOf) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const b = Array.from({ length: days }, () => 0);
  for (const r of rows) {
    const d = new Date(r.created_at); d.setHours(0, 0, 0, 0);
    const diff = Math.round((today - d) / 86400000);
    if (diff >= 0 && diff < days) b[days - 1 - diff] += amountOf(r);
  }
  return b;
}

function DotChart({ values, active, rows = 8 }) {
  const max = Math.max(1, ...values);
  return (
    <div style={{ display: "flex", gap: 3.5, alignItems: "flex-end" }}>
      {values.map((v, ci) => {
        const filled = v > 0 ? Math.max(1, Math.round((v / max) * rows)) : 0;
        return (
          <div key={ci} style={{ display: "flex", flexDirection: "column-reverse", gap: 3.5 }}>
            {Array.from({ length: rows }).map((_, ri) => (
              <span key={ri} style={{ width: 5.5, height: 5.5, borderRadius: "50%", background: ri < filled ? active : B.pale }} />
            ))}
          </div>
        );
      })}
    </div>
  );
}

function Ava({ name, i = 0, size = 30 }) {
  const t = ["#2F6BFF", "#12B76A", "#F79009", "#7C3AED", "#EF4444"];
  return <span style={{ width: size, height: size, borderRadius: "50%", background: t[i % t.length], color: "#fff", fontSize: size * 0.36, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{initials(name)}</span>;
}

const statusMap = {
  draft: { l: "Brouillon", bg: "#FEF3C7", c: "#92400E" },
  sent: { l: "Envoyée", bg: B.blueSoft, c: B.blue },
  paid: { l: "Payée", bg: B.greenSoft, c: B.greenDeep },
};
const txMap = {
  PENDING: { l: "En attente", bg: "#FEF3C7", c: "#92400E" },
  ACCEPTED: { l: "Acceptée", bg: B.blueSoft, c: B.blue },
  COMPLETED: { l: "Payée", bg: B.greenSoft, c: B.greenDeep },
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

  const income = inv.reduce((s, i) => s + invoiceTotal(i), 0);
  const paid = tx.filter(t => t.statut === "COMPLETED").reduce((s, t) => s + Number(t.montant || 0), 0);
  const recentInv = inv.slice(0, 4);
  const impayees = inv.filter(i => i.status !== "paid" && invoiceTotal(i) > 0).slice(0, 4);
  const clients = [...new Map(inv.map(i => [i.client_name, i])).values()].slice(0, 3);
  const recentTx = tx.slice(0, 3);

  const serieIncome = dailySeries(inv, 26, invoiceTotal);
  const seriePaid = dailySeries(tx.filter(t => t.statut === "COMPLETED"), 24, t => Number(t.montant || 0));

  const card = { background: "#fff", borderRadius: 14, border: `1px solid ${B.line}` };
  const empty = (txt) => <div style={{ padding: "26px 0", textAlign: "center", color: B.faint, fontSize: 12.5 }}>{txt}</div>;
  const Head = ({ title, href }) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", borderBottom: `1px solid ${B.line}` }}>
      <span style={{ fontWeight: 700, color: B.ink, fontSize: 14 }}>{title}</span>
      {href && <Link href={href} style={{ color: B.blue, fontSize: 12.5, textDecoration: "none" }}>Voir tout</Link>}
    </div>
  );

  return (
    <div style={{ margin: -28, padding: 24, minHeight: "100vh", background: "#FAFBFC", fontFamily: "Arial, sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: B.ink }}>Tableau de bord</h1>
          <p style={{ margin: "2px 0 0", color: B.muted, fontSize: 12.5 }}>BUYTICLE ETS</p>
        </div>
        <Link href="/invoices/new" style={{ display: "flex", alignItems: "center", gap: 7, background: B.navy, borderRadius: 9, padding: "9px 15px", textDecoration: "none", color: "#fff", fontSize: 13, fontWeight: 600 }}>
          <Plus size={15} /> Nouvelle facture
        </Link>
      </div>

      {/* Ligne 1 */}
      <div style={{ display: "grid", gridTemplateColumns: "1.35fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
        <div style={{ ...card, padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={LOGO} alt="BUYTICLE" style={{ width: 44, height: 44, borderRadius: 10, objectFit: "contain", border: `1px solid ${B.line}` }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: B.ink, fontSize: 14 }}>BUYTICLE ETS</div>
              <div style={{ color: B.muted, fontSize: 12 }}>Bonamoussadi, Douala — Cameroun</div>
            </div>
          </div>
          {[[Link2, "Espace de paiement", "pay.buyticle.com"], [Phone, "Contact", "(+237) 696 99 58 79"]].map(([Ic, t, v], i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, background: "#FAFBFC", border: `1px solid ${B.line}`, borderRadius: 10, padding: "9px 12px", marginBottom: 8 }}>
              <Ic size={15} color={B.faint} />
              <div style={{ flex: 1 }}><div style={{ fontSize: 10.5, color: B.faint }}>{t}</div><div style={{ fontSize: 12.5, color: B.ink }}>{v}</div></div>
              {i === 0 && <span style={{ display: "flex", alignItems: "center", gap: 5, border: `1px solid ${B.line}`, borderRadius: 8, padding: "5px 10px", fontSize: 11.5, color: B.ink, fontWeight: 600 }}><Copy size={12} /> Copier</span>}
            </div>
          ))}
        </div>

        <div style={{ ...card, padding: 16 }}>
          <span style={{ width: 28, height: 28, borderRadius: 8, background: B.blueSoft, display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}><ArrowDownLeft size={15} color={B.blue} /></span>
          <DotChart values={serieIncome} active={B.blue} />
          <div style={{ fontSize: 11.5, color: B.muted, marginTop: 12 }}>Total facturé</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: B.ink }}>{fmt(income)} <span style={{ fontSize: 12, color: B.muted }}>FCFA</span></div>
        </div>

        <div style={{ ...card, padding: 16 }}>
          <span style={{ width: 28, height: 28, borderRadius: 8, background: B.greenSoft, display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}><ArrowUpRight size={15} color={B.green} /></span>
          <DotChart values={seriePaid} active={B.green} />
          <div style={{ fontSize: 11.5, color: B.muted, marginTop: 12 }}>Total encaissé</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: B.greenDeep }}>{fmt(paid)} <span style={{ fontSize: 12, color: B.muted }}>FCFA</span></div>
        </div>
      </div>

      {/* Ligne 2 */}
      <div style={{ display: "grid", gridTemplateColumns: "1.35fr 1fr", gap: 16, marginBottom: 16 }}>
        <div style={card}>
          <Head title="Factures récentes" href="/invoices" />
          <div style={{ padding: 10 }}>
            {recentInv.map((i, idx) => (
              <div key={i.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 8px", borderRadius: 10, background: idx === 0 ? "#FAFBFC" : "transparent" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                  <Ava name={i.client_name} i={idx} />
                  <div>
                    <div style={{ fontWeight: 600, color: B.ink, fontSize: 13 }}>{i.client_name}</div>
                    <div style={{ color: B.muted, fontSize: 11.5 }}>{i.number} · {fmt(invoiceTotal(i))} FCFA</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <span style={{ background: statusMap[i.status]?.bg, color: statusMap[i.status]?.c, borderRadius: 6, padding: "3px 8px", fontSize: 10.5, fontWeight: 600 }}>{statusMap[i.status]?.l}</span>
                  <Link href={`/invoices/${i.id}`} style={{ background: B.blue, color: "#fff", borderRadius: 8, padding: "6px 12px", fontSize: 11.5, fontWeight: 600, textDecoration: "none" }}>Ouvrir</Link>
                </div>
              </div>
            ))}
            {recentInv.length === 0 && empty(<>Aucune facture. <Link href="/invoices/new" style={{ color: B.blue }}>Créer →</Link></>)}
          </div>
        </div>

        <div style={card}>
          <Head title="À encaisser" />
          <div style={{ padding: 10 }}>
            {impayees.map((i, idx) => (
              <div key={i.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 8px", borderBottom: idx < impayees.length - 1 ? `1px solid ${B.line}` : "none" }}>
                <span style={{ width: 16, height: 16, borderRadius: "50%", border: `2px solid ${B.pale}`, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: B.ink, fontSize: 12.5 }}>{i.client_name}</div>
                  <div style={{ color: B.muted, fontSize: 11.5 }}>{i.number}</div>
                </div>
                <div style={{ fontWeight: 700, color: B.blue, fontSize: 12.5 }}>{fmt(invoiceTotal(i))}</div>
              </div>
            ))}
            {impayees.length === 0 && empty("Tout est encaissé ✓")}
          </div>
        </div>
      </div>

      {/* Ligne 3 */}
      <div style={{ display: "grid", gridTemplateColumns: "1.35fr 1fr", gap: 16 }}>
        <div style={card}>
          <Head title="Clients récents" href="/invoices" />
          <div style={{ padding: 10 }}>
            {clients.map((c, idx) => (
              <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 8px", borderBottom: idx < clients.length - 1 ? `1px solid ${B.line}` : "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                  <Ava name={c.client_name} i={idx} />
                  <div>
                    <div style={{ fontWeight: 600, color: B.ink, fontSize: 13 }}>{c.client_name}</div>
                    <div style={{ color: B.muted, fontSize: 11.5 }}>{c.client_email || c.client_phone || "—"}</div>
                  </div>
                </div>
                <ChevronRight size={15} color={B.faint} />
              </div>
            ))}
            {clients.length === 0 && empty("Aucun client.")}
          </div>
        </div>

        <div style={card}>
          <Head title="Transactions récentes" href="/transactions" />
          <div style={{ padding: 10 }}>
            {recentTx.map((t, idx) => (
              <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 8px", borderBottom: idx < recentTx.length - 1 ? `1px solid ${B.line}` : "none" }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", flexShrink: 0, background: t.statut === "COMPLETED" ? B.green : t.statut === "FAILED" ? "#EF4444" : B.blue }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12.5, color: B.ink }}><strong>{fmt(t.montant)} FCFA</strong> · {t.operateur || "—"}</div>
                  <div style={{ fontSize: 10.5, color: B.faint }}>{new Date(t.created_at).toLocaleString("fr-FR")}</div>
                </div>
                <span style={{ background: txMap[t.statut]?.bg, color: txMap[t.statut]?.c, borderRadius: 6, padding: "3px 8px", fontSize: 10.5, fontWeight: 600 }}>{txMap[t.statut]?.l}</span>
              </div>
            ))}
            {recentTx.length === 0 && empty("Aucune transaction.")}
          </div>
        </div>
      </div>
    </div>
  );
}
