"use client";
import { useState } from "react";
import { Download, Send, Link2 } from "lucide-react";

const D = { brand: "#DD5509" };

export default function InvoiceActions({ id, email }) {
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState("");

  async function copyPayLink() {
    const url = `${window.location.origin}/pay/${id}`;
    try {
      await navigator.clipboard.writeText(url);
      setMsg("✓ Lien de paiement copié : " + url);
    } catch {
      setMsg(url);
    }
  }

  async function download() {
    window.open(`/api/invoices/${id}/download`, "_blank");
  }

  async function send() {
    if (!email) { setMsg("Pas d'email client renseigné."); return; }
    setSending(true);
    setMsg("");
    const res = await fetch(`/api/invoices/${id}/send`, { method: "POST" });
    const data = await res.json();
    setMsg(res.ok ? `✓ ${data.message}` : `✗ ${data.error}`);
    setSending(false);
  }

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
      <button onClick={download} style={{ display: "flex", alignItems: "center", gap: 6, background: D.brand, color: "#fff", border: "none", borderRadius: 6, padding: "8px 14px", cursor: "pointer", fontSize: 13, fontWeight: "600" }}>
        <Download size={14} /> Télécharger PDF
      </button>
      <button onClick={send} disabled={sending} style={{ display: "flex", alignItems: "center", gap: 6, background: "#1E40AF", color: "#fff", border: "none", borderRadius: 6, padding: "8px 14px", cursor: "pointer", fontSize: 13, fontWeight: "600" }}>
        <Send size={14} /> {sending ? "Envoi…" : "Envoyer par email"}
      </button>
      <button onClick={copyPayLink} style={{ display: "flex", alignItems: "center", gap: 6, background: "#166534", color: "#fff", border: "none", borderRadius: 6, padding: "8px 14px", cursor: "pointer", fontSize: 13, fontWeight: "600" }}>
        <Link2 size={14} /> Lien de paiement
      </button>
      {msg && <span style={{ fontSize: 12, color: msg.startsWith("✓") ? "#166534" : "#991B1B" }}>{msg}</span>}
    </div>
  );
}
