"use client";
import { useActionState } from "react";
import { createPayoutAction } from "./actions";

const B = { blue: "#2F6BFF", ink: "#0F1728", muted: "#667085", line: "#E4E7EC", green: "#12B76A" };

const label = { display: "block", fontSize: 12.5, fontWeight: 600, color: "#344054", marginBottom: 6 };
const input = { width: "100%", border: `1px solid ${B.line}`, borderRadius: 8, padding: "11px 12px", fontSize: 14, outline: "none", boxSizing: "border-box", marginBottom: 16 };

export default function PayoutForm() {
  const [state, action, pending] = useActionState(createPayoutAction, null);

  return (
    <form action={action} style={{ background: "#fff", border: `1px solid ${B.line}`, borderRadius: 12, padding: 24, maxWidth: 440 }}>
      <label style={label}>Opérateur</label>
      <select name="operateur" required defaultValue="" style={input}>
        <option value="" disabled>Choisir…</option>
        <option value="MTN">MTN MoMo</option>
        <option value="ORANGE">Orange Money</option>
      </select>

      <label style={label}>Numéro du bénéficiaire</label>
      <input name="numero" required placeholder="6XX XX XX XX" style={input} />

      <label style={label}>Montant (FCFA)</label>
      <input name="montant" type="number" min="1" required placeholder="5000" style={input} />

      <label style={label}>Motif (optionnel)</label>
      <input name="reference" placeholder="Remboursement FAC-2026-001" style={input} />

      {state && (
        <div style={{
          fontSize: 13, marginBottom: 14, padding: "10px 12px", borderRadius: 8,
          background: state.ok ? "#ECFDF3" : "#FEF3F2",
          color: state.ok ? "#067647" : "#B42318",
          border: `1px solid ${state.ok ? "#ABEFC6" : "#FEE4E2"}`,
        }}>
          {state.ok ? `✓ ${state.message} (statut : ${state.statut})` : `✗ ${state.error}`}
        </div>
      )}

      <button type="submit" disabled={pending} style={{
        width: "100%", background: B.blue, color: "#fff", border: "none", borderRadius: 8,
        padding: 13, fontSize: 14, fontWeight: 700, cursor: "pointer",
      }}>
        {pending ? "Envoi en cours…" : "Envoyer le décaissement"}
      </button>

      <div style={{ fontSize: 11.5, color: B.muted, marginTop: 12, textAlign: "center" }}>
        ⚠️ Envoie de l'argent réel depuis le solde PawaPay.
      </div>
    </form>
  );
}
