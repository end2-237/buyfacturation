"use client";
import { useState, useRef } from "react";

const OPERATEURS = [
  { key: "MTN", label: "MTN MoMo", color: "#FFCC00", text: "#000" },
  { key: "ORANGE", label: "Orange Money", color: "#FF6600", text: "#fff" },
];

export default function PaymentForm({ invoiceId }) {
  const [operateur, setOperateur] = useState("");
  const [numero, setNumero] = useState("");
  const [phase, setPhase] = useState("form"); // form | waiting | done | failed
  const [message, setMessage] = useState("");
  const pollRef = useRef(null);

  function startPolling(txId) {
    let tries = 0;
    pollRef.current = setInterval(async () => {
      tries++;
      try {
        const res = await fetch(`/api/transactions/${txId}/status`);
        const data = await res.json();
        if (data.statut === "COMPLETED") {
          clearInterval(pollRef.current);
          setPhase("done");
        } else if (["FAILED", "EXPIRED"].includes(data.statut)) {
          clearInterval(pollRef.current);
          setPhase("failed");
          setMessage("Le paiement a échoué ou expiré. Réessayez.");
        }
      } catch { /* réessaie au prochain tick */ }
      if (tries > 40) { // ~3 min à 4.5s
        clearInterval(pollRef.current);
        setPhase("failed");
        setMessage("Délai dépassé. Vérifiez votre téléphone puis réessayez.");
      }
    }, 4500);
  }

  async function pay(e) {
    e.preventDefault();
    if (!operateur) { setMessage("Choisis un opérateur."); return; }
    setPhase("waiting");
    setMessage("");
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ numero, operateur }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPhase("failed");
        setMessage(data.error || "Erreur lors de l'initiation.");
        return;
      }
      startPolling(data.transactionId);
    } catch (err) {
      setPhase("failed");
      setMessage("Erreur réseau. Réessayez.");
    }
  }

  if (phase === "waiting") {
    return (
      <div style={{ marginTop: 24, textAlign: "center" }}>
        <div style={{ width: 40, height: 40, border: "4px solid #FEF0E8", borderTopColor: "#DD5509", borderRadius: "50%", margin: "0 auto 16px", animation: "spin 1s linear infinite" }} />
        <div style={{ fontWeight: 600, color: "#0F1623" }}>Validez le paiement sur votre téléphone</div>
        <div style={{ fontSize: 13, color: "#8896A8", marginTop: 6 }}>Saisis ton code {operateur === "MTN" ? "MTN MoMo" : "Orange Money"} pour confirmer.</div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (phase === "done") {
    return (
      <div style={{ marginTop: 24, background: "#DCFCE7", color: "#166534", borderRadius: 8, padding: 18, textAlign: "center", fontWeight: 600 }}>
        ✓ Paiement confirmé ! Merci.
      </div>
    );
  }

  return (
    <form onSubmit={pay} style={{ marginTop: 20 }}>
      <div style={{ fontSize: 12, color: "#4A5568", marginBottom: 8 }}>Opérateur</div>
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        {OPERATEURS.map((o) => (
          <button type="button" key={o.key} onClick={() => setOperateur(o.key)}
            style={{
              flex: 1, padding: "12px", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 13,
              border: operateur === o.key ? `2px solid #0D1B2E` : "1px solid #DCE0E8",
              background: operateur === o.key ? o.color : "#F7F8FA",
              color: operateur === o.key ? o.text : "#4A5568",
            }}>
            {o.label}
          </button>
        ))}
      </div>

      <div style={{ fontSize: 12, color: "#4A5568", marginBottom: 4 }}>Numéro mobile money</div>
      <input value={numero} onChange={(e) => setNumero(e.target.value)} required placeholder="6XX XX XX XX"
        style={{ width: "100%", border: "1px solid #DCE0E8", borderRadius: 6, padding: "11px 12px", fontSize: 15, marginBottom: 16, background: "#F7F8FA" }} />

      {message && <div style={{ color: phase === "failed" ? "#991B1B" : "#4A5568", fontSize: 13, marginBottom: 12 }}>{message}</div>}

      <button type="submit" style={{ width: "100%", background: "#DD5509", color: "#fff", border: "none", borderRadius: 8, padding: 14, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
        Payer maintenant
      </button>
    </form>
  );
}
