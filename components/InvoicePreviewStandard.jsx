const C = {
  orange: "#DD5509", darkOrange: "#B8450A", black: "#1F2328",
  gray: "#6B7280", bgLight: "#FCF1E8", bgPale: "#FBF6F2", lineGray: "#E6E6E6",
};

function fmt(n) { return Number(n || 0).toLocaleString("fr-FR"); }
function fmtDate(d) {
  if (!d) return "";
  const [y, m, day] = String(d).split("T")[0].split("-");
  return `${day}/${m}/${y}`;
}

function numberToWords(n) {
  const u = ["","un","deux","trois","quatre","cinq","six","sept","huit","neuf","dix","onze","douze","treize","quatorze","quinze","seize","dix-sept","dix-huit","dix-neuf"];
  const t = ["","","vingt","trente","quarante","cinquante","soixante","soixante","quatre-vingt","quatre-vingt"];
  if (n === 0) return "zéro";
  let r = "";
  if (n >= 1000000) { r += numberToWords(Math.floor(n / 1000000)) + " million "; n %= 1000000; }
  if (n >= 1000) { r += numberToWords(Math.floor(n / 1000)) + " mille "; n %= 1000; }
  if (n >= 100) { r += numberToWords(Math.floor(n / 100)) + " cent "; n %= 100; }
  if (n >= 20) {
    const tv = Math.floor(n / 10), uv = n % 10;
    if (tv === 7 || tv === 9) r += t[tv] + (uv === 1 ? "-et-" : "-") + u[10 + uv];
    else r += t[tv] + (uv ? (tv === 8 ? "-" : uv === 1 ? "-et-" : "-") + u[uv] : tv === 8 ? "s" : "");
  } else if (n > 0) r += u[n];
  return r.trim();
}

function MetaRow({ label, value, vs = {} }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0", fontSize: "8pt" }}>
      <span style={{ color: C.gray }}>{label}</span>
      <span style={{ color: C.black, ...vs }}>{value}</span>
    </div>
  );
}

export default function InvoicePreviewStandard({ d }) {
  const items = d.items || [];
  const subtotal = items.reduce((s, it) => s + (it.quantity || 1) * Number(it.price || 0), 0);
  const tl = numberToWords(Math.round(subtotal)) + " franc" + (subtotal > 1 ? "s" : "") + " CFA";

  return (
    <div style={{ fontFamily: "Arial,sans-serif", color: C.black, fontSize: "9pt", lineHeight: 1.4, padding: "19mm", background: "#fff", width: "210mm", minHeight: "297mm", boxSizing: "border-box" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}><tbody><tr>
        <td style={{ width: "36%", verticalAlign: "middle" }}>
          <div style={{ fontWeight: "bold", fontSize: "13pt" }}>BUYTICLE ETS</div>
          <div style={{ fontStyle: "italic", fontSize: "8pt", color: C.gray }}>Entreprise Individuelle (ETS)</div>
        </td>
        <td style={{ textAlign: "right", verticalAlign: "middle" }}>
          <div style={{ fontWeight: "bold", fontSize: "13pt", marginBottom: 2 }}>BUYTICLE ETS</div>
          <div style={{ fontSize: "9pt", marginBottom: 1 }}>Bonamoussadi, Douala — Cameroun</div>
          <div style={{ fontSize: "9pt", marginBottom: 1 }}>Tél : (+237) 696 99 58 79</div>
          <div style={{ fontSize: "8pt", color: C.gray, marginBottom: 1 }}>RCCM : CM-DLA-01-2025-A10-01482</div>
          <div style={{ fontSize: "8pt", color: C.gray }}>NIU : {d.niu || "P070418499910G"}</div>
        </td>
      </tr></tbody></table>
      <div style={{ borderBottom: `3px solid ${C.orange}`, margin: "10px 0 14px" }} />
      <div style={{ fontWeight: "bold", fontSize: "26pt", color: C.orange, marginBottom: 16 }}>FACTURE</div>

      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 18 }}><tbody><tr>
        <td style={{ width: "51%", verticalAlign: "top", paddingRight: 12 }}>
          <div style={{ fontWeight: "bold", fontSize: "8pt", color: C.orange, marginBottom: 6 }}>FACTURÉ À</div>
          <div style={{ fontWeight: "bold", fontSize: "10pt", marginBottom: 3 }}>{d.client_name || "[ Nom du client ]"}</div>
          {d.client_address && <div style={{ fontSize: "9.5pt", marginBottom: 2 }}>{d.client_address}</div>}
          {(d.client_phone || d.client_email) && <div style={{ fontSize: "9.5pt" }}>{[d.client_phone, d.client_email].filter(Boolean).join(" / ")}</div>}
        </td>
        <td style={{ width: "49%", verticalAlign: "top", background: C.bgLight, padding: "8px 10px" }}>
          <MetaRow label="N° de facture" value={d.number} vs={{ fontWeight: "bold", color: C.darkOrange }} />
          <MetaRow label="Date d'émission" value={fmtDate(d.date) || "[ JJ / MM / 2026 ]"} />
          {d.due_date && <MetaRow label="Échéance de paiement" value={fmtDate(d.due_date)} />}
        </td>
      </tr></tbody></table>

      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 8 }}>
        <thead><tr style={{ background: C.orange }}>
          <th style={{ textAlign: "left", padding: "6px 8px", color: "#fff", fontSize: "8pt", width: "56%" }}>DÉSIGNATION</th>
          <th style={{ textAlign: "center", padding: "6px 8px", color: "#fff", fontSize: "8pt", width: "9%" }}>QTÉ</th>
          <th style={{ textAlign: "right", padding: "6px 8px", color: "#fff", fontSize: "8pt", width: "20%" }}>PRIX UNITAIRE</th>
          <th style={{ textAlign: "right", padding: "6px 8px", color: "#fff", fontSize: "8pt", width: "15%" }}>MONTANT</th>
        </tr></thead>
        <tbody>
          {items.map((it, i) => (
            <tr key={i} style={{ background: i % 2 === 1 ? C.bgPale : "#fff" }}>
              <td style={{ padding: "6px 8px", borderTop: `1px solid ${C.lineGray}`, borderBottom: `1px solid ${C.lineGray}` }}>{it.description}</td>
              <td style={{ textAlign: "center", padding: "6px 8px", borderTop: `1px solid ${C.lineGray}`, borderBottom: `1px solid ${C.lineGray}` }}>{it.quantity || 1}</td>
              <td style={{ textAlign: "right", padding: "6px 8px", borderTop: `1px solid ${C.lineGray}`, borderBottom: `1px solid ${C.lineGray}` }}>{it.price !== "" && it.price !== undefined ? fmt(it.price) + " FCFA" : "—"}</td>
              <td style={{ textAlign: "right", padding: "6px 8px", borderTop: `1px solid ${C.lineGray}`, borderBottom: `1px solid ${C.lineGray}` }}>{it.price !== "" && it.price !== undefined ? fmt((it.quantity || 1) * Number(it.price)) + " FCFA" : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 4 }}>
        <table style={{ borderCollapse: "collapse", width: 240 }}><tbody>
          <tr><td style={{ padding: "4px 8px", fontSize: "9pt" }}>TVA</td><td style={{ padding: "4px 8px", textAlign: "right", fontSize: "9pt", color: C.gray }}>Non applicable</td></tr>
          <tr style={{ background: C.orange }}>
            <td style={{ padding: "6px 8px", fontSize: "10pt", fontWeight: "bold", color: "#fff" }}>TOTAL NET À PAYER</td>
            <td style={{ padding: "6px 8px", textAlign: "right", fontSize: "10pt", fontWeight: "bold", color: "#fff" }}>{fmt(subtotal)} FCFA</td>
          </tr>
        </tbody></table>
      </div>

      <div style={{ borderLeft: `3px solid ${C.orange}`, background: C.bgLight, padding: "8px 12px", marginBottom: 16 }}>
        <span>Facture arrêtée à la somme de </span>
        <span style={{ fontWeight: "bold", color: C.darkOrange }}>{tl}</span>
        <span>.</span>
      </div>

      <div style={{ fontWeight: "bold", fontSize: "8pt", color: C.orange, marginBottom: 4 }}>MODALITÉS DE PAIEMENT</div>
      <div style={{ fontSize: "9pt", marginBottom: 3 }}><span style={{ fontWeight: "bold" }}>Mobile Money</span> (Orange Money / MTN MoMo) au (+237) 696 99 58 79</div>
      {d.bank_info && <div style={{ fontSize: "9pt", marginBottom: 3 }}><span style={{ fontWeight: "bold" }}>Virement bancaire</span> : {d.bank_info}</div>}

      <div style={{ borderTop: `2px solid ${C.lineGray}`, paddingTop: 8, textAlign: "center" }}>
        <span style={{ fontWeight: "bold", fontSize: "11pt", color: C.orange }}>Merci pour votre confiance !</span>
      </div>
      <div style={{ borderTop: `1px solid ${C.lineGray}`, marginTop: 16, paddingTop: 4, textAlign: "center", fontSize: "6.5pt", color: C.gray }}>
        <div>BUYTICLE ETS — Conseil et activités informatiques · Prestation de services · Commerce général</div>
        <div>Bonamoussadi, Douala — Cameroun · Tél : (+237) 696 99 58 79 · RCCM : CM-DLA-01-2025-A10-01482</div>
      </div>
    </div>
  );
}
