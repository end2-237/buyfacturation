"use client";
import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LayoutGrid, FileText, Plus, CreditCard, Code2, LogOut, Search, Settings } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const LOGO = "https://alrbokstfwwlvbvghrqr.supabase.co/storage/v1/object/public/vendor-assets/buylogo.png";

const nav = [
  { href: "/dashboard", icon: LayoutGrid, label: "Tableau de bord" },
  { href: "/invoices", icon: FileText, label: "Factures" },
  { href: "/invoices/new", icon: Plus, label: "Nouvelle facture" },
  { href: "/transactions", icon: CreditCard, label: "Transactions" },
  { href: "/docs", icon: Code2, label: "Documentation API" },
];

const HIDDEN = ["/login"];
const C = { blue: "#2F6BFF", blueSoft: "#EAF0FF", ink: "#0F1728", muted: "#667085", faint: "#98A2B3", line: "#EDEFF3" };

export default function Sidebar() {
  const path = usePathname();
  const router = useRouter();
  const [q, setQ] = useState("");

  if (HIDDEN.includes(path) || path.startsWith("/pay")) return null;

  const isActive = (href) => path === href || (href !== "/dashboard" && path.startsWith(href));

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }
  function search(e) {
    e.preventDefault();
    router.push(q ? `/invoices?search=${encodeURIComponent(q)}` : "/invoices");
  }

  return (
    <div style={{ display: "flex", fontFamily: "Arial, sans-serif" }}>
      {/* Rail d'icônes */}
      <div style={{ width: 56, background: "#fff", borderRight: `1px solid ${C.line}`, display: "flex", flexDirection: "column", alignItems: "center", padding: "16px 0", gap: 4 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={LOGO} alt="BUYTICLE" style={{ width: 28, height: 28, borderRadius: 8, objectFit: "contain", marginBottom: 12 }} />
        {nav.map(({ href, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link key={href} href={href} title={href} style={{
              width: 38, height: 38, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
              background: active ? C.blue : "transparent", color: active ? "#fff" : C.faint,
            }}>
              <Icon size={18} />
            </Link>
          );
        })}
        <div style={{ flex: 1 }} />
        <button onClick={logout} title="Déconnexion" style={{ width: 38, height: 38, borderRadius: 10, border: "none", background: "transparent", color: C.faint, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <LogOut size={18} />
        </button>
      </div>

      {/* Panneau */}
      <div style={{ width: 208, background: "#fff", borderRight: `1px solid ${C.line}`, padding: "16px 12px", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 4px 14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={LOGO} alt="BUYTICLE" style={{ width: 24, height: 24, borderRadius: 7, objectFit: "contain" }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: 13.5, color: C.ink, lineHeight: 1.1 }}>BUYTICLE</div>
              <div style={{ fontSize: 10, color: C.faint }}>Facturation</div>
            </div>
          </div>
          <Settings size={15} color={C.faint} />
        </div>

        <form onSubmit={search} style={{ display: "flex", alignItems: "center", gap: 7, background: "#F4F6FA", borderRadius: 8, padding: "7px 10px", marginBottom: 12 }}>
          <Search size={13} color={C.faint} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher…"
            style={{ border: "none", background: "transparent", outline: "none", fontSize: 12, color: C.ink, width: "100%" }} />
        </form>

        <div style={{ fontSize: 10, fontWeight: 700, color: C.faint, textTransform: "uppercase", letterSpacing: .4, padding: "0 6px 6px" }}>Navigation</div>
        <nav style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {nav.map(({ href, icon: Icon, label }) => {
            const active = isActive(href);
            return (
              <Link key={href} href={href} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 8,
                textDecoration: "none", fontSize: 12.5, fontWeight: active ? 600 : 500,
                color: active ? C.blue : C.muted, background: active ? C.blueSoft : "transparent",
              }}>
                <Icon size={15} /> {label}
              </Link>
            );
          })}
        </nav>

        <div style={{ flex: 1 }} />
        <button onClick={logout} style={{
          display: "flex", alignItems: "center", gap: 9, padding: "8px 10px", borderRadius: 8,
          background: "transparent", border: `1px solid ${C.line}`, color: C.muted, fontSize: 12.5, cursor: "pointer",
        }}>
          <LogOut size={14} /> Déconnexion
        </button>
      </div>
    </div>
  );
}
