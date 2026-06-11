"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Eye } from "lucide-react";
import InvoicePreviewAbonnement from "./InvoicePreviewAbonnement";
import InvoicePreviewStandard from "./InvoicePreviewStandard";

const D = { brand: "#DD5509", bdr: "#DCE0E8", white: "#FFFFFF", tx2: "#4A5568", bgAlt: "#F7F8FA" };

function today() { return new Date().toISOString().split("T")[0]; }

const EMPTY_ABO = {
  type: "abonnement", number: "FAC-CAMILLE-2026-001", date: today(),
  platform: "Camille", platform_url: "camille.vps.buyticle.com",
  trial_months: 2, trial_start: "", trial_end: "", niu: "En cours",
  client_name: "", client_address: "", client_phone: "", client_email: "",
  statut: "Période d'essai", status: "draft",
};
const EMPTY_STD = {
  type: "standard", number: "FAC-2026-001", date: today(), due_date: "",
  niu: "P070418499910G", client_name: "", client_address: "", client_phone: "", client_email: "",
  items: [{ description: "", quantity: 1, price: "" }],
  bank_info: "", status: "draft",
};

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 11, color: D.tx2, marginBottom: 4, fontWeight: "500" }}>{label}</label>
      {children}
    </div>
  );
}

function Input({ value, onChange, type = "text", placeholder }) {
  return (
    <input type={type} value={value ?? ""} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{ width: "100%", border: `1px solid ${D.bdr}`, borderRadius: 6, padding: "8px 10px", fontSize: 13, background: D.bgAlt, outline: "none" }} />
  );
}

export default function InvoiceForm({ initial }) {
  const router = useRouter();
  const [type, setType] = useState(initial?.type || "standard");
  const [form, setForm] = useState(initial || (type === "abonnement" ? EMPTY_ABO : EMPTY_STD));
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);

  function set(key, val) { setForm(f => ({ ...f, [key]: val })); }
  function setClient(key, val) { setForm(f => ({ ...f, [`client_${key}`]: val })); }

  function switchType(t) {
    setType(t);
    setForm(t === "abonnement" ? { ...EMPTY_ABO } : { ...EMPTY_STD });
  }

  function setItem(i, key, val) {
    setForm(f => {
      const items = [...(f.items || [])];
      items[i] = { ...items[i], [key]: val };
      return { ...f, items };
    });
  }

  async function save() {
    setSaving(true);
    const method = initial?.id ? "PUT" : "POST";
    const url = initial?.id ? `/api/invoices/${initial.id}` : "/api/invoices";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setSaving(false);
    if (res.ok) {
      const data = await res.json();
      router.push(`/invoices/${data.id}`);
    }
  }

  const btnStyle = (active) => ({
    padding: "8px 18px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 13, fontWeight: "600",
    background: active ? D.brand : "#E8EAEE", color: active ? "#fff" : D.tx2,
  });

  return (
    <div>
      {/* Type selector */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        <button style={btnStyle(type === "standard")} onClick={() => switchType("standard")}>Facture standard</button>
        <button style={btnStyle(type === "abonnement")} onClick={() => switchType("abonnement")}>Facture abonnement</button>
        <button style={{ ...btnStyle(preview), marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }} onClick={() => setPreview(p => !p)}>
          <Eye size={14} /> {preview ? "Masquer" : "Aperçu"}
        </button>
      </div>

      <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
        {/* Form */}
        <div style={{ flex: 1, background: D.white, borderRadius: 10, padding: 24, border: `1px solid ${D.bdr}` }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="N° de facture"><Input value={form.number} onChange={v => set("number", v)} /></Field>
            <Field label="Date"><Input type="date" value={form.date} onChange={v => set("date", v)} /></Field>
            {type === "standard" && <Field label="Échéance"><Input type="date" value={form.due_date} onChange={v => set("due_date", v)} /></Field>}
            <Field label="NIU"><Input value={form.niu} onChange={v => set("niu", v)} /></Field>
          </div>

          <div style={{ borderTop: `1px solid ${D.bdr}`, margin: "16px 0", fontWeight: "600", paddingTop: 12, color: D.brand }}>Client</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Nom / Raison sociale"><Input value={form.client_name} onChange={v => setClient("name", v)} /></Field>
            <Field label="Email"><Input type="email" value={form.client_email} onChange={v => setClient("email", v)} /></Field>
            <Field label="Téléphone"><Input value={form.client_phone} onChange={v => setClient("phone", v)} /></Field>
            <Field label="Adresse"><Input value={form.client_address} onChange={v => setClient("address", v)} /></Field>
          </div>

          {type === "abonnement" && (
            <>
              <div style={{ borderTop: `1px solid ${D.bdr}`, margin: "16px 0", fontWeight: "600", paddingTop: 12, color: D.brand }}>Abonnement</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Field label="Plateforme"><Input value={form.platform} onChange={v => set("platform", v)} /></Field>
                <Field label="URL plateforme"><Input value={form.platform_url} onChange={v => set("platform_url", v)} /></Field>
                <Field label="Durée essai (mois)"><Input type="number" value={form.trial_months} onChange={v => set("trial_months", v)} /></Field>
                <Field label="Statut"><Input value={form.statut} onChange={v => set("statut", v)} /></Field>
                <Field label="Début essai"><Input type="date" value={form.trial_start} onChange={v => set("trial_start", v)} /></Field>
                <Field label="Fin essai"><Input type="date" value={form.trial_end} onChange={v => set("trial_end", v)} /></Field>
              </div>
            </>
          )}

          {type === "standard" && (
            <>
              <div style={{ borderTop: `1px solid ${D.bdr}`, margin: "16px 0", fontWeight: "600", paddingTop: 12, color: D.brand }}>Lignes</div>
              {(form.items || []).map((it, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "3fr 1fr 1fr auto", gap: 8, marginBottom: 8 }}>
                  <Input value={it.description} onChange={v => setItem(i, "description", v)} placeholder="Description" />
                  <Input type="number" value={it.quantity} onChange={v => setItem(i, "quantity", v)} placeholder="Qté" />
                  <Input type="number" value={it.price} onChange={v => setItem(i, "price", v)} placeholder="Prix FCFA" />
                  <button onClick={() => setForm(f => ({ ...f, items: f.items.filter((_, j) => j !== i) }))}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#999" }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <button onClick={() => setForm(f => ({ ...f, items: [...(f.items || []), { description: "", quantity: 1, price: "" }] }))}
                style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: `1px dashed ${D.bdr}`, borderRadius: 6, padding: "6px 12px", cursor: "pointer", color: D.tx2, fontSize: 13, width: "100%", justifyContent: "center" }}>
                <Plus size={14} /> Ajouter une ligne
              </button>
              <div style={{ marginTop: 16 }}>
                <Field label="Informations bancaires"><Input value={form.bank_info} onChange={v => set("bank_info", v)} placeholder="Banque / IBAN / Titulaire" /></Field>
              </div>
            </>
          )}

          <div style={{ marginTop: 24 }}>
            <button onClick={save} disabled={saving}
              style={{ background: D.brand, color: "#fff", border: "none", borderRadius: 8, padding: "12px 28px", fontSize: 14, fontWeight: "600", cursor: "pointer", width: "100%" }}>
              {saving ? "Enregistrement…" : initial?.id ? "Mettre à jour" : "Enregistrer la facture"}
            </button>
          </div>
        </div>

        {/* Preview */}
        {preview && (
          <div style={{ flex: 1, overflow: "auto", transform: "scale(0.7)", transformOrigin: "top left", width: "142%" }}>
            {type === "abonnement" ? <InvoicePreviewAbonnement d={form} /> : <InvoicePreviewStandard d={form} />}
          </div>
        )}
      </div>
    </div>
  );
}
