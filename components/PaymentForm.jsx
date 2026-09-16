"use client";
import { useState, useRef, useEffect } from "react";

function fmt(n) { return Number(n || 0).toLocaleString("fr-FR").replace(/[  ]/g, " "); }

const OPERATEURS = [
  { key: "MTN", label: "MTN MoMo", logo: "/brand/mtn-momo.jpg" },
  { key: "ORANGE", label: "Orange Money", logo: "/brand/orange-money.png" },
];

export default function PaymentForm({ invoiceId, montant }) {
  const [operateur, setOperateur] = useState("");
  const [numero, setNumero] = useState("");
  const [phase, setPhase] = useState("form"); // form | waiting | done | failed
  const [message, setMessage] = useState("");
  const pollRef = useRef(null);

  useEffect(() => () => clearInterval(pollRef.current), []);

  function startPolling(txId) {
    let tries = 0;
    pollRef.current = setInterval(async () => {
      tries++;
      try {
        const res = await fetch(`/api/transactions/${txId}/status`);
        const data = await res.json();
        if (data.statut === "COMPLETED") { clearInterval(pollRef.current); setPhase("done"); }
        else if (["FAILED", "EXPIRED"].includes(data.statut)) { clearInterval(pollRef.current); setPhase("failed"); setMessage("Le paiement a échoué ou expiré. Veuillez réessayer."); }
      } catch {}
      if (tries > 40) { clearInterval(pollRef.current); setPhase("failed"); setMessage("Délai dépassé. Vérifiez votre téléphone puis réessayez."); }
    }, 4500);
  }

  async function pay(e) {
    e.preventDefault();
    if (!operateur) { setMessage("Veuillez choisir un opérateur."); return; }
    setPhase("waiting"); setMessage("");
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/pay`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ numero, operateur }),
      });
      const data = await res.json();
      if (!res.ok) { setPhase("failed"); setMessage(data.error || "Erreur lors de l'initiation."); return; }
      startPolling(data.transactionId);
    } catch { setPhase("failed"); setMessage("Erreur réseau. Veuillez réessayer."); }
  }

  if (phase === "waiting") {
    return (
      <div style={{ textAlign: "center", padding: "40px 0" }}>
        <div style={{ width: 46, height: 46, border: "4px solid #F0F0F0", borderTopColor: "#DD5509", borderRadius: "50%", margin: "0 auto 18px", animation: "spin 1s linear infinite" }} />
        <div style={{ fontWeight: 700, color: "#101828", fontSize: 16 }}>Validez sur votre téléphone</div>
        <div style={{ fontSize: 13, color: "#667085", marginTop: 8, lineHeight: 1.5 }}>
          Une demande de <strong>{fmt(montant)} FCFA</strong> a été envoyée au <strong>{numero}</strong>.<br />
          Saisissez votre code {operateur === "MTN" ? "MTN MoMo" : "Orange Money"} pour confirmer.
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (phase === "done") {
    return (
      <div style={{ textAlign: "center", padding: "40px 0" }}>
        <div style={{ width: 66, height: 66, borderRadius: "50%", background: "#ECFDF3", color: "#12B76A", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34, margin: "0 auto 16px" }}>✓</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#101828" }}>Paiement confirmé</div>
        <div style={{ fontSize: 13, color: "#667085", marginTop: 6 }}>Votre règlement de {fmt(montant)} FCFA a bien été reçu. Merci !</div>
        <a href={`/api/invoices/${invoiceId}/download`} target="_blank" rel="noopener noreferrer"
          style={{ display: "inline-block", marginTop: 18, color: "#DD5509", fontWeight: 600, fontSize: 13, textDecoration: "none" }}>⭳ Télécharger le reçu</a>
      </div>
    );
  }

  return (
    <form onSubmit={pay}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 22 }}>
        {OPERATEURS.map(({ key, label, logo }) => {
          const active = operateur === key;
          return (
            <button type="button" key={key} onClick={() => setOperateur(key)}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "18px 10px", cursor: "pointer",
                borderRadius: 0, background: active ? "#FFF7F2" : "#fff",
                border: active ? "1px solid #DD5509" : "1px solid #E4E7EC",
                borderTop: active ? "3px solid #DD5509" : "3px solid transparent",
                transition: "all .15s",
              }}>
              <span style={{ height: 38, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={logo} alt={label} style={{ maxHeight: 38, maxWidth: 96, objectFit: "contain" }} />
              </span>
              <span style={{ fontSize: 12.5, fontWeight: 600, color: "#101828" }}>{label}</span>
            </button>
          );
        })}
      </div>

      <label style={{ display: "block", fontSize: 10.5, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "#667085", marginBottom: 8 }}>Numéro Mobile Money</label>
      <input value={numero} onChange={(e) => setNumero(e.target.value)} required placeholder="6XX XX XX XX"
        style={{ width: "100%", border: "1px solid #E4E7EC", borderRadius: 0, padding: "13px 14px", fontSize: 15, marginBottom: 8, outline: "none", boxSizing: "border-box" }} />
      <div style={{ fontSize: 11.5, color: "#98A2B3", marginBottom: 20 }}>Vous recevrez une demande de confirmation sur ce numéro.</div>

      {message && <div style={{ color: "#B42318", fontSize: 12.5, marginBottom: 14, background: "#FEF3F2", border: "1px solid #FEE4E2", borderRadius: 0, padding: "9px 12px" }}>{message}</div>}

      <button type="submit" style={{
        width: "100%", background: "#DD5509", color: "#fff", border: "none", borderRadius: 0,
        padding: 16, fontSize: 13, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
      }}>
        <span>Payer {fmt(montant)} FCFA</span><span style={{ fontSize: 16 }}>→</span>
      </button>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 16, fontSize: 11.5, color: "#98A2B3" }}>
        🔒 Paiement sécurisé via PawaPay
      </div>
    </form>
  );
}
