"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, FileText, Plus, Code2, CreditCard, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const nav = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Tableau de bord" },
  { href: "/invoices", icon: FileText, label: "Factures" },
  { href: "/invoices/new", icon: Plus, label: "Nouvelle facture" },
  { href: "/transactions", icon: CreditCard, label: "Transactions" },
  { href: "/docs", icon: Code2, label: "Documentation API" },
];

// Routes publiques : pas de sidebar admin.
const HIDDEN = ["/login"];

export default function Sidebar() {
  const path = usePathname();
  const router = useRouter();

  if (HIDDEN.includes(path) || path.startsWith("/pay")) return null;

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside style={{ width: 220, background: "#0D1B2E", display: "flex", flexDirection: "column", padding: "24px 0" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 20px 24px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <span style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg, #7C3AED 0%, #10B981 100%)", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 16, boxShadow: "0 2px 8px rgba(124,58,237,.4)" }}>B</span>
        <div>
          <div style={{ color: "#fff", fontWeight: "bold", fontSize: 15 }}>BUYTICLE</div>
          <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 10 }}>Facturation & Paiement</div>
        </div>
      </div>
      <nav style={{ marginTop: 16, flex: 1 }}>
        {nav.map(({ href, icon: Icon, label }) => {
          const active = path === href || (href !== "/dashboard" && path.startsWith(href));
          return (
            <Link key={href} href={href} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 20px", textDecoration: "none",
              color: active ? "#A78BFA" : "rgba(255,255,255,0.7)",
              background: active ? "rgba(124,58,237,0.16)" : "transparent",
              borderLeft: active ? "3px solid #7C3AED" : "3px solid transparent",
              fontSize: 13,
            }}>
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>
      <button onClick={logout} style={{
        display: "flex", alignItems: "center", gap: 10, margin: "0 20px",
        background: "transparent", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6,
        color: "rgba(255,255,255,0.7)", padding: "9px 12px", fontSize: 13, cursor: "pointer",
      }}>
        <LogOut size={15} /> Déconnexion
      </button>
    </aside>
  );
}
