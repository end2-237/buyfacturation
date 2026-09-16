"use client";
import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LayoutGrid, FileText, Plus, CreditCard, Code2, LogOut, Search } from "lucide-react";
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
    <aside style={{ width: 236, background: "#fff", borderRight: `1px solid ${C.line}`, display: "flex", flexDirection: "column", padding: "18px 14px", fontFamily: "Arial, sans-serif" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "0 6px 16px" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={LOGO} alt="BUYTICLE" style={{ width: 30, height: 30, borderRadius: 8, objectFit: "contain" }} />
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: C.ink, lineHeight: 1.1 }}>BUYTICLE</div>
          <div style={{ fontSize: 10.5, color: C.faint }}>Facturation</div>
        </div>
      </div>

      <form onSubmit={search} style={{ display: "flex", alignItems: "center", gap: 8, background: "#F4F6FA", borderRadius: 9, padding: "8px 11px", marginBottom: 14 }}>
        <Search size={14} color={C.faint} />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher…"
          style={{ border: "none", background: "transparent", outline: "none", fontSize: 12.5, color: C.ink, width: "100%" }} />
      </form>

      <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
        {nav.map(({ href, icon: Icon, label }) => {
          const active = path === href || (href !== "/dashboard" && path.startsWith(href));
          return (
            <Link key={href} href={href} style={{
              display: "flex", alignItems: "center", gap: 11, padding: "9px 11px", borderRadius: 9,
              textDecoration: "none", fontSize: 13, fontWeight: active ? 600 : 500,
              color: active ? C.blue : C.muted, background: active ? C.blueSoft : "transparent",
            }}>
              <Icon size={16} /> {label}
            </Link>
          );
        })}
      </nav>

      <button onClick={logout} style={{
        display: "flex", alignItems: "center", gap: 10, padding: "9px 11px", borderRadius: 9,
        background: "transparent", border: `1px solid ${C.line}`, color: C.muted, fontSize: 13, cursor: "pointer",
      }}>
        <LogOut size={15} /> Déconnexion
      </button>
    </aside>
  );
}
