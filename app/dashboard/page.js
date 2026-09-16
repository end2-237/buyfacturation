export const dynamic = "force-dynamic";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import {
  LayoutGrid, Users, MessageSquare, BookOpen, BarChart2, Headphones, Bell,
  Settings, PenSquare, Search, FileText, Send, Link2, Copy, ArrowUp, ArrowDown,
  ChevronDown, Check, ChevronRight, Plus, UserPlus, CalendarPlus, Clock,
} from "lucide-react";

// ── Palette bleue (reproduction fidèle de la maquette) ───────────────────────
const B = {
  blue: "#2F6BFF", blueDeep: "#1D4ED8", blueSoft: "#EAF0FF",
  navy: "#101828", ink: "#0F1728", muted: "#667085", faint: "#98A2B3",
  line: "#EDEFF3", pale: "#DCE3F1", green: "#12B76A", greenSoft: "#E7F7EF",
};

function fmtMoney(n) { return "$ " + Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
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
  // Fond « plein » façon Melio même si peu de données réelles.
  return b.map((v, i) => v > 0 ? v : (Math.sin(i / 2) + 1) * 0.35);
}

function DotChart({ values, rows = 8 }) {
  const max = Math.max(1, ...values);
  return (
    <div style={{ display: "flex", gap: 3.5, alignItems: "flex-end" }}>
      {values.map((v, ci) => {
        const filled = Math.max(1, Math.round((v / max) * rows));
        return (
          <div key={ci} style={{ display: "flex", flexDirection: "column-reverse", gap: 3.5 }}>
            {Array.from({ length: rows }).map((_, ri) => (
              <span key={ri} style={{ width: 5.5, height: 5.5, borderRadius: "50%", background: ri < filled ? B.blue : B.pale }} />
            ))}
          </div>
        );
      })}
    </div>
  );
}

function Ava({ name, i = 0, size = 26 }) {
  const t = ["#2F6BFF", "#12B76A", "#F79009", "#7C3AED", "#EF4444"];
  return <span style={{ width: size, height: size, borderRadius: "50%", background: t[i % t.length], color: "#fff", fontSize: size * 0.38, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center", border: "2px solid #fff", flexShrink: 0 }}>{initials(name)}</span>;
}

function Stack({ names }) {
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      {names.slice(0, 3).map((n, i) => <span key={i} style={{ marginLeft: i ? -8 : 0 }}><Ava name={n} i={i} size={22} /></span>)}
      <span style={{ marginLeft: -8, width: 22, height: 22, borderRadius: "50%", background: B.blueSoft, color: B.blue, fontSize: 9, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center", border: "2px solid #fff" }}>+2</span>
    </div>
  );
}

export default async function DashboardPage() {
  const [{ data: invoices }, { data: txs }] = await Promise.all([
    supabase.from("invoices").select("*").order("created_at", { ascending: false }),
    supabase.from("transactions").select("*").order("created_at", { ascending: false }),
  ]);
  const inv = invoices || [];
  const tx = txs || [];

  const income = inv.reduce((s, i) => s + invoiceTotal(i), 0);
  const paid = tx.filter(t => t.statut === "COMPLETED").reduce((s, t) => s + Number(t.montant || 0), 0);
  const meetings = inv.slice(0, 2);
  const tasks = inv.slice(0, 2);
  const clients = [...new Map(inv.map(i => [i.client_name, i])).values()].slice(0, 3);
  const notifs = tx.slice(0, 2);

  const serieIncome = dailySeries(inv, 26, invoiceTotal);
  const seriePaid = dailySeries(tx.filter(t => t.statut === "COMPLETED"), 24, t => Number(t.montant || 0));

  const card = { background: "#fff", borderRadius: 16, border: `1px solid ${B.line}` };
  const railIcon = (Icon, active, href) => (
    <Link href={href || "/dashboard"} style={{ width: 40, height: 40, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", background: active ? B.blue : "transparent", color: active ? "#fff" : B.faint }}>
      <Icon size={19} />
    </Link>
  );
  const listRow = (Icon, label, count, href) => (
    <Link href={href} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 10px", borderRadius: 9, textDecoration: "none", color: B.ink }}>
      <span style={{ width: 30, height: 30, borderRadius: 8, background: "#F4F6FA", display: "inline-flex", alignItems: "center", justifyContent: "center", color: B.muted }}><Icon size={15} /></span>
      <span style={{ flex: 1, fontSize: 13.5, fontWeight: 500 }}>{label}</span>
      <span style={{ color: B.faint, fontSize: 12 }}>{count}</span>
    </Link>
  );

  return (
    <div style={{ margin: -28, minHeight: "100vh", display: "flex", background: "#fff", fontFamily: "Arial, sans-serif" }}>
      {/* Rail d'icônes */}
      <div style={{ width: 60, borderRight: `1px solid ${B.line}`, display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 0", gap: 6 }}>
        <div style={{ width: 26, height: 26, borderRadius: "50%", background: `radial-gradient(circle at 30% 30%, #7CA0FF, ${B.blue})`, marginBottom: 14 }} />
        {railIcon(LayoutGrid, true, "/dashboard")}
        {railIcon(Users, false, "/invoices")}
        {railIcon(MessageSquare, false, "/transactions")}
        {railIcon(BookOpen, false, "/docs")}
        {railIcon(BarChart2, false, "/transactions")}
        {railIcon(Headphones, false, "/docs")}
        <div style={{ flex: 1 }} />
        {railIcon(Bell, false, "/dashboard")}
      </div>

      {/* Panneau */}
      <div style={{ width: 260, borderRight: `1px solid ${B.line}`, padding: "18px 14px", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 6px 14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 22, height: 22, borderRadius: "50%", background: `radial-gradient(circle at 30% 30%, #7CA0FF, ${B.blue})` }} />
            <span style={{ fontWeight: 800, fontSize: 18, color: B.ink }}>Melio</span>
          </div>
          <div style={{ display: "flex", gap: 12, color: B.faint }}><Settings size={16} /><PenSquare size={16} /></div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#F4F6FA", borderRadius: 9, padding: "9px 12px", marginBottom: 14 }}>
          <Search size={15} color={B.faint} />
          <span style={{ color: B.faint, fontSize: 13 }}>Jump To...</span>
        </div>

        {listRow(MessageSquare, "Threads", 5, "/invoices")}
        {listRow(FileText, "Drafts", 5, "/invoices")}
        {listRow(Send, "Scheduled Sent", 5, "/invoices")}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 8px 8px" }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: B.muted, textTransform: "uppercase", letterSpacing: .3 }}>Messages</span>
          <Link href="/invoices" style={{ fontSize: 12, color: B.blue, textDecoration: "none" }}>See All</Link>
        </div>
        {(clients.length ? clients : [{ client_name: "Emily Carter" }, { client_name: "Sophia Bennett" }]).map((c, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 8px" }}>
            <Ava name={c.client_name} i={i} />
            <span style={{ flex: 1, fontSize: 13.5, color: B.ink }}>{c.client_name}</span>
            <span style={{ width: 18, height: 18, borderRadius: "50%", background: B.blue, color: "#fff", fontSize: 10, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</span>
          </div>
        ))}

        <div style={{ flex: 1 }} />
        <div style={{ borderTop: `1px solid ${B.line}`, paddingTop: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", color: B.muted, fontSize: 13.5 }}><span style={{ color: B.faint }}>#</span> product</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", color: B.muted, fontSize: 13.5 }}><span style={{ color: B.faint }}>#</span> design</div>
        </div>
      </div>

      {/* Contenu principal */}
      <div style={{ flex: 1, padding: "22px 26px", overflowY: "auto", background: "#FCFCFD" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <span style={{ fontSize: 22, fontWeight: 800, color: B.ink }}>Dashboard</span>
          <div style={{ display: "flex", gap: 10 }}>
            <Link href="/invoices/new" style={{ display: "flex", alignItems: "center", gap: 7, background: "#fff", border: `1px solid ${B.line}`, borderRadius: 10, padding: "9px 15px", textDecoration: "none", color: B.ink, fontSize: 13, fontWeight: 600 }}><UserPlus size={15} /> Invite Member</Link>
            <Link href="/invoices/new" style={{ display: "flex", alignItems: "center", gap: 7, background: "#fff", border: `1px solid ${B.line}`, borderRadius: 10, padding: "9px 15px", textDecoration: "none", color: B.ink, fontSize: 13, fontWeight: 600 }}><Plus size={15} /> Create Channel</Link>
            <Link href="/invoices/new" style={{ display: "flex", alignItems: "center", gap: 7, background: B.navy, borderRadius: 10, padding: "9px 15px", textDecoration: "none", color: "#fff", fontSize: 13, fontWeight: 600 }}><CalendarPlus size={15} /> Plan Meeting</Link>
          </div>
        </div>

        {/* Ligne 1 : profil + 2 charts */}
        <div style={{ display: "grid", gridTemplateColumns: "1.35fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
          <div style={{ ...card, padding: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <Ava name="Elian Brooks" i={0} size={46} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: B.ink, fontSize: 15 }}>Elian Brooks</div>
                <div style={{ color: B.muted, fontSize: 12 }}>Super Admin</div>
              </div>
              <span style={{ color: B.blue, fontSize: 12.5, fontWeight: 600 }}>Edit Profile</span>
            </div>
            {[["Personal channel link", "yourapp.com/elianbrooks", Link2], ["Work email", "elian@northvale.co", Send]].map(([t, v, Ic], i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, background: "#FAFBFC", border: `1px solid ${B.line}`, borderRadius: 10, padding: "9px 12px", marginBottom: 8 }}>
                <Ic size={15} color={B.faint} />
                <div style={{ flex: 1 }}><div style={{ fontSize: 11, color: B.faint }}>{t}</div><div style={{ fontSize: 12.5, color: B.ink }}>{v}</div></div>
                <span style={{ display: "flex", alignItems: "center", gap: 5, border: `1px solid ${B.line}`, borderRadius: 8, padding: "5px 10px", fontSize: 12, color: B.ink, fontWeight: 600 }}><Copy size={12} /> Copy Link</span>
              </div>
            ))}
          </div>

          <div style={{ ...card, padding: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ width: 30, height: 30, borderRadius: 8, background: "#F4F6FA", display: "inline-flex", alignItems: "center", justifyContent: "center" }}><ArrowDown size={15} color={B.muted} /></span>
              <span style={{ display: "flex", alignItems: "center", gap: 5, border: `1px solid ${B.line}`, borderRadius: 8, padding: "5px 10px", fontSize: 12, color: B.ink }}>Weekly <ChevronDown size={13} /></span>
            </div>
            <DotChart values={serieIncome} />
            <div style={{ fontSize: 12, color: B.muted, marginTop: 12 }}>Total Income</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: B.ink }}>{fmtMoney(income || 24250.8)}</div>
          </div>

          <div style={{ ...card, padding: 18, boxShadow: "0 10px 30px rgba(16,24,40,.10)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ width: 30, height: 30, borderRadius: 8, background: "#F4F6FA", display: "inline-flex", alignItems: "center", justifyContent: "center" }}><ArrowUp size={15} color={B.muted} /></span>
              <span style={{ display: "flex", alignItems: "center", gap: 5, border: `1px solid ${B.line}`, borderRadius: 8, padding: "5px 10px", fontSize: 12, color: B.ink }}>Weekly <ChevronDown size={13} /></span>
            </div>
            <DotChart values={seriePaid} />
            <div style={{ fontSize: 12, color: B.muted, marginTop: 12 }}>Total paid</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: B.blue }}>{fmtMoney(paid || 8145.2)}</div>
          </div>
        </div>

        {/* Ligne 2 : My Meetings + Task Overview */}
        <div style={{ display: "grid", gridTemplateColumns: "1.35fr 1fr", gap: 16, marginBottom: 16 }}>
          <div style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "15px 18px" }}>
              <span style={{ fontWeight: 700, color: B.ink, fontSize: 15 }}>My Meetings</span>
              <Link href="/invoices" style={{ color: B.blue, fontSize: 13, textDecoration: "none" }}>View Calendar</Link>
            </div>
            <div style={{ display: "flex", gap: 6, padding: "0 18px 12px" }}>
              {["Today", "Tue 7", "Wen 8", "Thu 9", "Fri 10"].map((t, i) => (
                <span key={t} style={{ flex: 1, textAlign: "center", padding: "8px 0", borderRadius: 8, fontSize: 12.5, fontWeight: 600, background: i === 0 ? B.blueSoft : "transparent", color: i === 0 ? B.blue : B.muted }}>{t}</span>
              ))}
            </div>
            {(meetings.length ? meetings : [{}, {}]).map((m, i) => (
              <div key={i} style={{ margin: "0 18px 12px", border: `1px solid ${B.line}`, borderRadius: 12, padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                  <span style={{ fontWeight: 600, color: B.ink, fontSize: 14 }}>{m.client_name || "Mesh weekly meeting"}</span>
                  <span style={{ color: B.muted, fontSize: 12.5 }}>9:15 PM - 10:00 PM</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Stack names={["A", "B", "C"]} />
                    <span style={{ display: "flex", alignItems: "center", gap: 5, background: "#F4F6FA", borderRadius: 8, padding: "5px 10px", fontSize: 12, color: B.muted }}><Clock size={12} /> In {i === 0 ? "10 min" : "2 hours"}</span>
                  </div>
                  <span style={{ background: B.blue, color: "#fff", borderRadius: 9, padding: "8px 16px", fontSize: 12.5, fontWeight: 600 }}>Join Meeting</span>
                </div>
              </div>
            ))}
          </div>

          <div style={card}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "15px 18px" }}>
              <span style={{ fontWeight: 700, color: B.ink, fontSize: 15 }}>Task Overview</span>
              <span style={{ width: 20, height: 20, borderRadius: "50%", background: B.blue, color: "#fff", fontSize: 11, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{inv.length || 7}</span>
            </div>
            {[["Prepare client presentation", "Finalize slides and key points", false], ["Review new design concepts", "Check UI consistency and feedback", true]].map(([t, sub, done], i) => (
              <div key={i} style={{ margin: "0 18px 12px", border: `1px solid ${B.line}`, borderRadius: 12, padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <div>
                    <div style={{ fontWeight: 600, color: B.ink, fontSize: 13.5, textDecoration: done ? "line-through" : "none", opacity: done ? .5 : 1 }}>{tasks[i]?.number ? `Facture ${tasks[i].number}` : t}</div>
                    <div style={{ color: B.muted, fontSize: 12 }}>{sub}</div>
                  </div>
                  {done
                    ? <span style={{ width: 20, height: 20, borderRadius: "50%", background: B.blue, display: "inline-flex", alignItems: "center", justifyContent: "center" }}><Check size={12} color="#fff" /></span>
                    : <span style={{ width: 20, height: 20, borderRadius: "50%", border: `2px solid ${B.pale}` }} />}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: B.muted, fontSize: 12 }}>Today  {i === 0 ? "9:15 PM - 10:00 PM" : "8:15 PM - 9:00 PM"}</span>
                  <Stack names={["A", "B", "C"]} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ligne 3 : Call Insights + Notifications */}
        <div style={{ display: "grid", gridTemplateColumns: "1.35fr 1fr", gap: 16 }}>
          <div style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "15px 18px" }}>
              <span style={{ fontWeight: 700, color: B.ink, fontSize: 15 }}>Call Insights</span>
              <Link href="/invoices" style={{ color: B.blue, fontSize: 13, textDecoration: "none" }}>View All</Link>
            </div>
            {(clients.length ? clients : [{ client_name: "BNVA Marketing" }, { client_name: "NovaTech Solutions" }, { client_name: "Anna Joe" }]).map((c, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, margin: "0 18px", padding: "12px 0", borderTop: i ? `1px solid ${B.line}` : "none" }}>
                <span style={{ width: 34, height: 34, borderRadius: 9, background: ["#FEF7C3", "#EAF0FF", "#E7F7EF"][i % 3], display: "inline-flex", alignItems: "center", justifyContent: "center", color: B.ink, fontWeight: 700, fontSize: 13 }}>{initials(c.client_name)}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: B.ink, fontSize: 13.5 }}>{c.client_name}</div>
                  <div style={{ color: B.muted, fontSize: 12 }}>Self Joined (44:54 min) · {i ? "Yesterday" : "Today"}</div>
                </div>
                <ChevronRight size={16} color={B.faint} />
              </div>
            ))}
          </div>

          <div style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "15px 18px" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, color: B.ink, fontSize: 15 }}>Notifications <span style={{ width: 20, height: 20, borderRadius: "50%", background: B.blue, color: "#fff", fontSize: 11, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{tx.length || 4}</span></span>
              <Link href="/transactions" style={{ color: B.blue, fontSize: 13, textDecoration: "none" }}>Mark all as read</Link>
            </div>
            <div style={{ display: "flex", gap: 10, margin: "0 18px", padding: "12px 0", borderTop: `1px solid ${B.line}` }}>
              <Ava name="Wei Chen" i={3} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: B.ink }}><strong>{notifs[0] ? `${Number(notifs[0].montant).toLocaleString("fr-FR")} FCFA` : "Wei Chen"}</strong> {notifs[0] ? "encaissé" : "joined to Final Presentation"}</div>
                <div style={{ fontSize: 11, color: B.faint }}>8 min ago</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, margin: "0 18px", padding: "12px 0", borderTop: `1px solid ${B.line}` }}>
              <Ava name="Anna Joe" i={4} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: B.ink }}><strong>Anna Joe</strong> invites you <span style={{ color: B.blue }}>synergy.fig</span></div>
                <div style={{ fontSize: 11, color: B.faint, marginBottom: 8 }}>2 hours ago</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <span style={{ border: `1px solid ${B.line}`, borderRadius: 8, padding: "6px 16px", fontSize: 12.5, fontWeight: 600, color: B.ink }}>Deny</span>
                  <span style={{ background: B.blue, color: "#fff", borderRadius: 8, padding: "6px 16px", fontSize: 12.5, fontWeight: 600 }}>Approve</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
