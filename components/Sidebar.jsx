"use client";
import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LayoutGrid, FileText, Plus, CreditCard, Code2, LogOut, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const LOGO = "https://alrbokstfwwlvbvghrqr.supabase.co/storage/v1/object/public/vendor-assets/buylogo.png";

// Navigation globale — uniquement dans le rail (icônes).
const RAIL = [
  { href: "/dashboard", icon: LayoutGrid, title: "Tableau de bord" },
  { href: "/invoices", icon: FileText, title: "Factures" },
  { href: "/invoices/new", icon: Plus, title: "Nouvelle facture" },
  { href: "/transactions", icon: CreditCard, title: "Transactions" },
  { href: "/docs", icon: Code2, title: "Documentation" },
];

// Contenu du panneau — varie selon la page. Aucun doublon avec le rail.
function contextFor(path) {
  if (path.startsWith("/invoices/new")) {
    return { title: "Nouvelle facture", subtitle: "Créer un document",
      groups: [{ label: "Aide", items: [{ label: "Retour aux factures", href: "/invoices" }] }] };
  }
  if (path.startsWith("/invoices")) {
    return { title: "Factures", subtitle: "Gérer et filtrer", search: true,
      groups: [
        { label: "Statut", items: [
          { label: "Toutes", href: "/invoices" },
          { label: "Brouillons", href: "/invoices?status=draft" },
          { label: "Envoyées", href: "/invoices?status=sent" },
          { label: "Payées", href: "/invoices?status=paid" },
        ] },
        { label: "Type", items: [
          { label: "Standard", href: "/invoices?type=standard" },
          { label: "Abonnement", href: "/invoices?type=abonnement" },
        ] },
      ] };
  }
  if (path.startsWith("/transactions")) {
    return { title: "Transactions", subtitle: "Encaissements",
      groups: [{ label: "Statut", items: [
        { label: "Toutes", href: "/transactions" },
        { label: "En attente", href: "/transactions?status=PENDING" },
        { label: "Payées", href: "/transactions?status=COMPLETED" },
        { label: "Échouées", href: "/transactions?status=FAILED" },
      ] }] };
  }
  if (path.startsWith("/docs")) {
    return { title: "Documentation", subtitle: "API REST",
      groups: [{ label: "Référence", items: [{ label: "Vue d'ensemble", href: "/docs" }] }] };
  }
  return { title: "Tableau de bord", subtitle: "Vue d'ensemble",
    groups: [{ label: "Raccourcis", items: [
      { label: "Factures impayées", href: "/invoices?status=sent" },
      { label: "Factures payées", href: "/invoices?status=paid" },
      { label: "Voir les transactions", href: "/transactions" },
    ] }] };
}

const HIDDEN = ["/login"];
const C = { blue: "#2F6BFF", blueSoft: "#EAF0FF", ink: "#0F1728", muted: "#667085", faint: "#98A2B3", line: "#EDEFF3" };

export default function Sidebar() {
  const path = usePathname();
  const router = useRouter();
  const [q, setQ] = useState("");

  if (HIDDEN.includes(path) || path.startsWith("/pay")) return null;

  const ctx = contextFor(path);
  const railActive = (href) => path === href || (href !== "/dashboard" && href !== "/invoices/new" && path.startsWith(href)) || (href === "/invoices/new" && path.startsWith("/invoices/new"));

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

  const sticky = { position: "sticky", top: 0, height: "100vh", flexShrink: 0 };

  return (
    <>
      {/* Rail — navigation globale + logo (une seule fois) */}
      <div style={{ ...sticky, width: 56, background: "#fff", borderRight: `1px solid ${C.line}`, display: "flex", flexDirection: "column", alignItems: "center", padding: "16px 0", gap: 4, fontFamily: "Arial, sans-serif" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={LOGO} alt="BUYTICLE" style={{ width: 28, height: 28, borderRadius: 8, objectFit: "contain", marginBottom: 12 }} />
        {RAIL.map(({ href, icon: Icon, title }) => {
          const active = railActive(href);
          return (
            <Link key={href} href={href} title={title} style={{
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

      {/* Panneau — contexte de la page (varie), sans logo ni doublon */}
      <div style={{ ...sticky, width: 208, background: "#fff", borderRight: `1px solid ${C.line}`, padding: "18px 14px", display: "flex", flexDirection: "column", overflowY: "auto", fontFamily: "Arial, sans-serif" }}>
        <div style={{ padding: "0 4px 14px" }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: C.ink }}>{ctx.title}</div>
          <div style={{ fontSize: 11, color: C.faint, marginTop: 1 }}>{ctx.subtitle}</div>
        </div>

        {ctx.search && (
          <form onSubmit={search} style={{ display: "flex", alignItems: "center", gap: 7, background: "#F4F6FA", borderRadius: 8, padding: "7px 10px", marginBottom: 12 }}>
            <Search size={13} color={C.faint} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher…"
              style={{ border: "none", background: "transparent", outline: "none", fontSize: 12, color: C.ink, width: "100%" }} />
          </form>
        )}

        {ctx.groups.map((g, gi) => (
          <div key={gi} style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.faint, textTransform: "uppercase", letterSpacing: .4, padding: "0 6px 6px" }}>{g.label}</div>
            {g.items.map((it, i) => {
              const active = path + (typeof window !== "undefined" ? window.location.search : "") === it.href || path === it.href;
              return (
                <Link key={i} href={it.href} style={{
                  display: "block", padding: "7px 10px", borderRadius: 8, textDecoration: "none",
                  fontSize: 12.5, fontWeight: active ? 600 : 500,
                  color: active ? C.blue : C.muted, background: active ? C.blueSoft : "transparent",
                }}>
                  {it.label}
                </Link>
              );
            })}
          </div>
        ))}
      </div>
    </>
  );
}
