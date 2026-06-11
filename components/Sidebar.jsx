"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, Plus } from "lucide-react";

const nav = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Tableau de bord" },
  { href: "/invoices", icon: FileText, label: "Factures" },
  { href: "/invoices/new", icon: Plus, label: "Nouvelle facture" },
];

export default function Sidebar() {
  const path = usePathname();
  return (
    <aside style={{ width: 220, background: "#0D1B2E", display: "flex", flexDirection: "column", padding: "24px 0" }}>
      <div style={{ padding: "0 20px 24px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ color: "#DD5509", fontWeight: "bold", fontSize: 16 }}>BUYTICLE ETS</div>
        <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, marginTop: 2 }}>Facturation</div>
      </div>
      <nav style={{ marginTop: 16 }}>
        {nav.map(({ href, icon: Icon, label }) => {
          const active = path === href || (href !== "/dashboard" && path.startsWith(href));
          return (
            <Link key={href} href={href} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 20px", textDecoration: "none",
              color: active ? "#DD5509" : "rgba(255,255,255,0.7)",
              background: active ? "rgba(221,85,9,0.13)" : "transparent",
              borderLeft: active ? "3px solid #DD5509" : "3px solid transparent",
              fontSize: 13, transition: "all .15s",
            }}>
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
