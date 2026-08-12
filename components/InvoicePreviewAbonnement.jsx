const C = {
  orange: "#DD5509", darkOrange: "#B8450A", black: "#1F2328",
  gray: "#6B7280", bgLight: "#FCF1E8", bgPale: "#FBF6F2", lineGray: "#E6E6E6",
};

function fmtDate(d) {
  if (!d) return "";
  const [y, m, day] = String(d).split("T")[0].split("-");
  return `${day}/${m}/${y}`;
}

function MetaRow({ label, value, vs = {} }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "2px 0", fontSize: "8pt" }}>
      <span style={{ color: C.gray }}>{label}</span>
      <span style={{ color: C.black, ...vs }}>{value}</span>
    </div>
  );
}

function fmt(n) {
  return Number(n || 0).toLocaleString("fr-FR").replace(/[\u202f\u00a0]/g, " ") + " FCFA";
}

export default function InvoicePreviewAbonnement({ d }) {
  // Meme regle que dans le PDF (lib/pdf.js) : rien de du, c'est un essai ;
  // un montant du, c'est une facture. L'apercu et le document imprime ne
  // doivent jamais raconter deux choses differentes.
  const items = Array.isArray(d.items) && d.items.length
    ? d.items
    : [{ description: `Abonnement Plateforme « ${d.platform || ""} » — Forfait Entreprise`, quantity: 1, price: 0 }];
  const total = items.reduce((acc, i) => acc + (i.quantity || 1) * Number(i.price || 0), 0);
  const essai = total <= 0;
  const debut = d.period_start || d.trial_start;
  const fin   = d.period_end   || d.trial_end;
  const validite = debut && fin ? `Du ${fmtDate(debut)} au ${fmtDate(fin)}` : "[ Du JJ/MM/2026 au JJ/MM/2026 ]";

  return (
    <div style={{ fontFamily: "Arial,sans-serif", color: C.black, fontSize: "9pt", lineHeight: 1.4, padding: "19mm", background: "#fff", width: "210mm", minHeight: "297mm", boxSizing: "border-box" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}><tbody><tr>
        <td style={{ width: "36%", verticalAlign: "middle" }}>
          <div style={{ fontWeight: "bold", fontSize: "13pt", color: C.black }}>BUYTICLE ETS</div>
          <div style={{ fontStyle: "italic", fontSize: "8pt", color: C.gray }}>Entreprise Individuelle (ETS)</div>
        </td>
        <td style={{ textAlign: "right", verticalAlign: "middle" }}>
          <div style={{ fontWeight: "bold", fontSize: "13pt", color: C.black, marginBottom: 2 }}>BUYTICLE ETS</div>
          <div style={{ fontSize: "9pt", color: C.black, marginBottom: 1 }}>Bonamoussadi, Douala — Cameroun</div>
          <div style={{ fontSize: "9pt", color: C.black, marginBottom: 1 }}>Tél : (+237) 696 99 58 79</div>
          <div style={{ fontSize: "8pt", color: C.gray, marginBottom: 1 }}>RCCM : CM-DLA-01-2025-A10-01482</div>
          <div style={{ fontSize: "8pt", color: C.gray }}>NIU : {d.niu || "En cours"}</div>
        </td>
      </tr></tbody></table>
      <div style={{ borderBottom: `3px solid ${C.orange}`, margin: "10px 0 14px" }} />
      <div style={{ fontWeight: "bold", fontSize: "23pt", color: C.orange, marginBottom: 8 }}>FACTURE D&apos;ABONNEMENT</div>
      {essai ? (
        <div style={{ display: "inline-block", background: C.orange, color: "#fff", fontWeight: "bold", fontSize: "7.5pt", padding: "3px 10px", marginBottom: 12 }}>
          PÉRIODE D&apos;ESSAI · {d.trial_months || "2"} MOIS
        </div>
      ) : d.status === "paid" ? (
        <div style={{ display: "inline-block", background: "#0F7B4F", color: "#fff", fontWeight: "bold", fontSize: "7.5pt", padding: "3px 10px", marginBottom: 12 }}>
          ACQUITTÉE
        </div>
      ) : null}
      <div style={{ fontSize: "9pt", color: C.gray, marginBottom: 18 }}>
        Plateforme émettrice :{" "}
        <span style={{ fontWeight: "bold", color: C.black }}>{d.platform || ""}</span>
        <span style={{ color: C.gray }}>  ·  </span>
        <span style={{ color: C.darkOrange, textDecoration: "underline" }}>{d.platform_url || ""}</span>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 18 }}><tbody><tr>
        <td style={{ width: "51%", verticalAlign: "top", paddingRight: 12 }}>
          <div style={{ fontWeight: "bold", fontSize: "8pt", color: C.orange, marginBottom: 6 }}>FACTURÉ À</div>
          <div style={{ fontWeight: "bold", fontSize: "10pt", color: C.black, marginBottom: 3 }}>{d.client_name || "[ Nom du client ]"}</div>
          {d.client_address && <div style={{ fontSize: "9.5pt", color: C.black, marginBottom: 2 }}>{d.client_address}</div>}
          {d.client_phone && <div style={{ fontSize: "9.5pt", color: C.black, marginBottom: 2 }}>{d.client_phone}</div>}
          {d.client_email && <div style={{ fontSize: "9.5pt", color: C.black }}>{d.client_email}</div>}
        </td>
        <td style={{ width: "49%", verticalAlign: "top", background: C.bgLight, padding: "8px 10px" }}>
          <MetaRow label="N° de facture" value={d.number} vs={{ fontWeight: "bold", color: C.darkOrange }} />
          <MetaRow label="Date d'émission" value={fmtDate(d.date) || "[ JJ / MM / 2026 ]"} />
          <MetaRow label="Type de document" value="Facture d'abonnement" />
          <MetaRow label="Statut" value={d.statut || (essai ? "Période d'essai" : "Payé")} />
        </td>
      </tr></tbody></table>

      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 8 }}>
        <thead><tr style={{ background: C.orange }}>
          <th style={{ textAlign: "left", padding: "6px 8px", color: "#fff", fontSize: "8pt", width: "54%" }}>DÉSIGNATION</th>
          <th style={{ textAlign: "center", padding: "6px 8px", color: "#fff", fontSize: "8pt", width: "10%" }}>QTÉ</th>
          <th style={{ textAlign: "right", padding: "6px 8px", color: "#fff", fontSize: "8pt", width: "18%" }}>PRIX UNIT.</th>
          <th style={{ textAlign: "right", padding: "6px 8px", color: "#fff", fontSize: "8pt", width: "18%" }}>MONTANT</th>
        </tr></thead>
        <tbody>
          {items.map((it, i) => {
            const cell = { padding: "7px 8px", borderTop: `1px solid ${C.lineGray}`, borderBottom: `1px solid ${C.lineGray}` };
            return (
              <tr key={i}>
                <td style={cell}>
                  <div style={{ fontWeight: "bold", fontSize: "9pt" }}>{it.description}</div>
                  {essai && (
                    <div style={{ fontStyle: "italic", fontSize: "8pt", color: C.gray }}>
                      Période d&apos;essai de {d.trial_months || "2"} mois incluse.
                    </div>
                  )}
                  <div style={{ fontSize: "8pt", color: C.darkOrange }}>Validité : {validite}</div>
                </td>
                <td style={{ ...cell, textAlign: "center" }}>{it.quantity || 1}</td>
                <td style={{ ...cell, textAlign: "right" }}>{essai ? "—" : fmt(it.price)}</td>
                <td style={{ ...cell, textAlign: "right" }}>
                  {essai ? "GRATUIT" : fmt((it.quantity || 1) * Number(it.price || 0))}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 4 }}>
        <table style={{ borderCollapse: "collapse", width: 240 }}><tbody>
          <tr><td style={{ padding: "4px 8px", fontSize: "9pt" }}>TVA</td><td style={{ padding: "4px 8px", textAlign: "right", fontSize: "9pt", color: C.gray }}>Non applicable</td></tr>
          <tr style={{ background: C.orange }}>
            <td style={{ padding: "6px 8px", fontSize: "9.5pt", fontWeight: "bold", color: "#fff" }}>
              {essai ? "NET À PAYER (ESSAI)" : "TOTAL NET À PAYER"}
            </td>
            <td style={{ padding: "6px 8px", textAlign: "right", fontSize: "9.5pt", fontWeight: "bold", color: "#fff" }}>
              {essai ? "0 FCFA" : fmt(total)}
            </td>
          </tr>
        </tbody></table>
      </div>

      <div style={{ borderLeft: `3px solid ${C.orange}`, background: C.bgLight, padding: "10px 12px", marginBottom: 12 }}>
        {essai ? (
          <>
            <div style={{ fontWeight: "bold", fontSize: "9.5pt", color: C.darkOrange, marginBottom: 6 }}>Note relative au Forfait Entreprise</div>
            <div style={{ fontSize: "9pt" }}>
              Conformément à nos conditions générales, cet abonnement bénéficie d&apos;une période d&apos;essai gratuite de {d.trial_months || "2"} mois.
              À l&apos;échéance de cette période ({fin ? fmtDate(fin) : "[ Date de fin ]"}), la tarification finale sera appliquée.
            </div>
          </>
        ) : (
          <>
            <div style={{ fontWeight: "bold", fontSize: "9.5pt", color: C.darkOrange, marginBottom: 6 }}>Note relative à l&apos;abonnement</div>
            <div style={{ fontSize: "9pt" }}>
              Cet abonnement est réglé pour la période indiquée ci-dessus. Au terme de cette période,
              il doit être renouvelé pour que la boutique reste visible sur la plateforme.
            </div>
          </>
        )}
      </div>
      <div style={{ borderLeft: `3px solid ${C.gray}`, background: C.bgPale, padding: "8px 12px", marginBottom: 16 }}>
        <span style={{ fontSize: "9pt" }}>Facture arrêtée à la somme de </span>
        <span style={{ fontWeight: "bold", fontSize: "9pt" }}>
          {essai ? "zéro Franc CFA" : `${total.toLocaleString("fr-FR").replace(/[\u202f\u00a0]/g, " ")} francs CFA`}
        </span>
        <span style={{ fontSize: "9pt" }}>{essai ? " au titre de la période d'essai." : "."}</span>
      </div>

      <div style={{ borderTop: `2px solid ${C.lineGray}`, paddingTop: 8, textAlign: "center" }}>
        <span style={{ fontWeight: "bold", fontSize: "10pt", color: C.orange }}>Merci pour votre confiance.</span>
      </div>
      <div style={{ borderTop: `1px solid ${C.lineGray}`, marginTop: 16, paddingTop: 4, textAlign: "center", fontSize: "6.5pt", color: C.gray }}>
        <div>BUYTICLE ETS — Bonamoussadi, Douala — Cameroun · Tél : (+237) 696 99 58 79 · RCCM : CM-DLA-01-2025-A10-01482</div>
      </div>
    </div>
  );
}
