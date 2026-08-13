const C = {
  orange: "#DD5509", darkOrange: "#B8450A", black: "#1F2328",
  gray: "#6B7280", bgLight: "#FCF1E8", bgPale: "#FBF6F2", lineGray: "#E6E6E6",
  green: "#0F7B4F",
};

function fmtDate(d) {
  if (!d) return "";
  const [y, m, day] = String(d).split("T")[0].split("-");
  return `${day}/${m}/${y}`;
}

function fmt(n) {
  return Number(n || 0).toLocaleString("fr-FR").replace(/[  ]/g, " ") + " FCFA";
}

function MetaRow({ label, value, vs = {} }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "2px 0", fontSize: "8pt", gap: 10 }}>
      <span style={{ color: C.gray, whiteSpace: "nowrap" }}>{label}</span>
      <span style={{ color: C.black, textAlign: "right", ...vs }}>{value}</span>
    </div>
  );
}

/* L'apercu du recu de versement. Meme regle que le PDF (lib/pdf.js) : l'argent
   part de la plateforme vers le beneficiaire, donc « verse a » et « montant
   verse », jamais « net a payer ». Les deux ne doivent pas raconter deux
   choses differentes. */
export default function InvoicePreviewRecu({ d }) {
  const items = Array.isArray(d.items) && d.items.length ? d.items : [];
  const total = items.length
    ? items.reduce((acc, i) => acc + (i.quantity || 1) * Number(i.price || 0), 0)
    : Number(d.amount || 0);
  const lignes = items.length ? items : [{ description: "Versement", quantity: 1, price: total }];

  return (
    <div style={{ fontFamily: "Arial,sans-serif", color: C.black, fontSize: "9pt", lineHeight: 1.4, padding: "19mm", background: "#fff", width: "210mm", minHeight: "297mm", boxSizing: "border-box" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}><tbody><tr>
        <td style={{ width: "36%", verticalAlign: "middle" }}>
          <div style={{ fontWeight: "bold", fontSize: "13pt" }}>BUYTICLE ETS</div>
          <div style={{ fontStyle: "italic", fontSize: "8pt", color: C.gray }}>Entreprise Individuelle (ETS)</div>
        </td>
        <td style={{ textAlign: "right", verticalAlign: "middle" }}>
          <div style={{ fontSize: "9pt", marginBottom: 1 }}>Bonamoussadi, Douala — Cameroun</div>
          <div style={{ fontSize: "9pt", marginBottom: 1 }}>Tél : (+237) 696 99 58 79</div>
          <div style={{ fontSize: "8pt", color: C.gray, marginBottom: 1 }}>RCCM : CM-DLA-01-2025-A10-01482</div>
          <div style={{ fontSize: "8pt", color: C.gray }}>NIU : {d.niu || "P070418499910G"}</div>
        </td>
      </tr></tbody></table>

      <div style={{ borderBottom: `3px solid ${C.orange}`, margin: "10px 0 14px" }} />
      <div style={{ fontWeight: "bold", fontSize: "23pt", color: C.orange, marginBottom: 8 }}>REÇU DE VERSEMENT</div>
      <div style={{ display: "inline-block", background: C.green, color: "#fff", fontWeight: "bold", fontSize: "7.5pt", padding: "3px 10px", marginBottom: 12 }}>
        VERSEMENT EFFECTUÉ
      </div>

      {d.platform && (
        <div style={{ fontSize: "9pt", color: C.gray, marginBottom: 18 }}>
          Plateforme émettrice : <span style={{ fontWeight: "bold", color: C.black }}>{d.platform}</span>
          {d.platform_url && (
            <>
              <span>{"  ·  "}</span>
              <span style={{ color: C.darkOrange, textDecoration: "underline" }}>{d.platform_url}</span>
            </>
          )}
        </div>
      )}

      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 18 }}><tbody><tr>
        <td style={{ width: "51%", verticalAlign: "top", paddingRight: 12 }}>
          <div style={{ fontWeight: "bold", fontSize: "8pt", color: C.orange, marginBottom: 6 }}>VERSÉ À</div>
          <div style={{ fontWeight: "bold", fontSize: "10pt", marginBottom: 3 }}>{d.client_name || "[ Bénéficiaire ]"}</div>
          {d.client_address && <div style={{ fontSize: "9.5pt", marginBottom: 2 }}>{d.client_address}</div>}
          {d.client_phone && <div style={{ fontSize: "9.5pt", marginBottom: 2 }}>{d.client_phone}</div>}
          {d.client_email && <div style={{ fontSize: "9.5pt" }}>{d.client_email}</div>}
        </td>
        <td style={{ width: "49%", verticalAlign: "top", background: C.bgLight, padding: "8px 10px" }}>
          <MetaRow label="N° de reçu" value={d.number} vs={{ fontWeight: "bold", color: C.darkOrange }} />
          <MetaRow label="Date du versement" value={fmtDate(d.date) || "[ JJ / MM / 2026 ]"} />
          {d.statut && <MetaRow label="Moyen" value={d.statut} />}
          {d.reference && <MetaRow label="Réf. transaction" value={d.reference} />}
        </td>
      </tr></tbody></table>

      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 8 }}>
        <thead><tr style={{ background: C.orange }}>
          <th style={{ textAlign: "left", padding: "6px 8px", color: "#fff", fontSize: "8pt", width: "70%" }}>OBJET DU VERSEMENT</th>
          <th style={{ textAlign: "right", padding: "6px 8px", color: "#fff", fontSize: "8pt", width: "30%" }}>MONTANT</th>
        </tr></thead>
        <tbody>
          {lignes.map((it, i) => {
            const cell = { padding: "7px 8px", borderTop: `1px solid ${C.lineGray}`, borderBottom: `1px solid ${C.lineGray}` };
            return (
              <tr key={i}>
                <td style={cell}>{it.description}</td>
                <td style={{ ...cell, textAlign: "right" }}>{fmt((it.quantity || 1) * Number(it.price || 0))}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
        <table style={{ borderCollapse: "collapse", width: 240 }}><tbody>
          <tr style={{ background: C.orange }}>
            <td style={{ padding: "6px 8px", fontSize: "9.5pt", fontWeight: "bold", color: "#fff" }}>MONTANT VERSÉ</td>
            <td style={{ padding: "6px 8px", textAlign: "right", fontSize: "9.5pt", fontWeight: "bold", color: "#fff" }}>{fmt(total)}</td>
          </tr>
        </tbody></table>
      </div>

      <div style={{ borderLeft: `3px solid ${C.orange}`, background: C.bgLight, padding: "10px 12px", marginBottom: 12 }}>
        <span style={{ fontSize: "9pt" }}>Reçu arrêté à la somme de </span>
        <span style={{ fontWeight: "bold", fontSize: "9pt", color: C.darkOrange }}>{fmt(total).replace(" FCFA", "")} francs CFA</span>
        <span style={{ fontSize: "9pt" }}>, versés par BUYTICLE ETS au bénéficiaire ci-dessus.</span>
      </div>

      {d.notice && (
        <div style={{ borderLeft: `3px solid ${C.gray}`, background: C.bgPale, padding: "8px 12px", marginBottom: 16, fontSize: "9pt", color: C.gray }}>
          {d.notice}
        </div>
      )}

      <div style={{ borderTop: `1px solid ${C.lineGray}`, marginTop: 16, paddingTop: 4, textAlign: "center", fontSize: "6.5pt", color: C.gray }}>
        <div>BUYTICLE ETS — Bonamoussadi, Douala — Cameroun · Tél : (+237) 696 99 58 79 · RCCM : CM-DLA-01-2025-A10-01482</div>
      </div>
    </div>
  );
}
