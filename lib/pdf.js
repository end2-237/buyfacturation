import React from "react";
import { Document, Page, Text, View, StyleSheet, pdf, Font } from "@react-pdf/renderer";

const C = {
  orange: "#DD5509",
  darkOrange: "#B8450A",
  black: "#1F2328",
  gray: "#6B7280",
  bgLight: "#FCF1E8",
  bgPale: "#FBF6F2",
  lineGray: "#E6E6E6",
  white: "#FFFFFF",
};

const s = StyleSheet.create({
  page: { fontFamily: "Helvetica", fontSize: 9, color: C.black, padding: "19mm" },
  row: { flexDirection: "row" },
  brand: { fontSize: 13, fontFamily: "Helvetica-Bold", color: C.black },
  orange: { color: C.orange },
  bold: { fontFamily: "Helvetica-Bold" },
  gray: { color: C.gray },
  divider: { borderBottom: `3px solid ${C.orange}`, marginVertical: 8 },
  tableHeader: { backgroundColor: C.orange, flexDirection: "row" },
  th: { color: C.white, fontFamily: "Helvetica-Bold", fontSize: 8, padding: "5px 6px" },
  td: { padding: "5px 6px", borderBottom: `1px solid ${C.lineGray}` },
  totalRow: { backgroundColor: C.orange, flexDirection: "row" },
  totalTd: { color: C.white, fontFamily: "Helvetica-Bold", padding: "6px 8px" },
  metaBox: { backgroundColor: C.bgLight, padding: "8px 10px", flex: 1 },
  metaRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 2 },
  label: { color: C.gray, fontSize: 8, textTransform: "uppercase" },
  noteBox: { borderLeft: `3px solid ${C.orange}`, backgroundColor: C.bgLight, padding: "8px 10px", marginBottom: 10 },
  footer: { borderTop: `1px solid ${C.lineGray}`, marginTop: 12, paddingTop: 4, textAlign: "center", fontSize: 6.5, color: C.gray },
});

function fmt(n) { return Number(n || 0).toLocaleString("fr-FR") + " FCFA"; }

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

function MetaRow({ label, value, bold }) {
  return (
    <View style={s.metaRow}>
      <Text style={s.gray}>{label}</Text>
      <Text style={bold ? [s.bold, { color: C.darkOrange }] : {}}>{value}</Text>
    </View>
  );
}

function CompanyHeader({ inv }) {
  return (
    <View style={[s.row, { justifyContent: "space-between", marginBottom: 4 }]}>
      <View>
        <Text style={s.brand}>BUYTICLE ETS</Text>
        <Text style={[s.gray, { fontSize: 8, fontStyle: "italic" }]}>Entreprise Individuelle (ETS)</Text>
        <Text>Bonamoussadi, Douala — Cameroun</Text>
        <Text>Tél : (+237) 696 99 58 79</Text>
        <Text style={s.gray}>RCCM : CM-DLA-01-2025-A10-01482</Text>
        <Text style={s.gray}>NIU : {inv.niu || "P070418499910G"}</Text>
      </View>
    </View>
  );
}

function StdDocument({ inv }) {
  const items = inv.items || [];
  const subtotal = items.reduce((s, i) => s + (i.quantity || 1) * Number(i.price || 0), 0);

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <CompanyHeader inv={inv} />
        <View style={s.divider} />
        <Text style={[s.bold, { fontSize: 22, color: C.orange, marginBottom: 12 }]}>FACTURE</Text>

        <View style={[s.row, { marginBottom: 14 }]}>
          <View style={{ flex: 1, paddingRight: 10 }}>
            <Text style={[s.label, { color: C.orange, marginBottom: 4 }]}>FACTURÉ À</Text>
            <Text style={s.bold}>{inv.client_name}</Text>
            {inv.client_address && <Text>{inv.client_address}</Text>}
            {inv.client_phone && <Text>{inv.client_phone}</Text>}
            {inv.client_email && <Text>{inv.client_email}</Text>}
          </View>
          <View style={s.metaBox}>
            <MetaRow label="N° de facture" value={inv.number} bold />
            <MetaRow label="Date d'émission" value={fmtDate(inv.date)} />
            {inv.due_date && <MetaRow label="Échéance" value={fmtDate(inv.due_date)} />}
          </View>
        </View>

        <View style={s.tableHeader}>
          <Text style={[s.th, { flex: 4 }]}>DÉSIGNATION</Text>
          <Text style={[s.th, { flex: 1, textAlign: "center" }]}>QTÉ</Text>
          <Text style={[s.th, { flex: 2, textAlign: "right" }]}>PRIX UNIT.</Text>
          <Text style={[s.th, { flex: 2, textAlign: "right" }]}>MONTANT</Text>
        </View>
        {items.map((it, i) => (
          <View key={i} style={[s.row, { backgroundColor: i % 2 === 1 ? C.bgPale : C.white }]}>
            <Text style={[s.td, { flex: 4 }]}>{it.description}</Text>
            <Text style={[s.td, { flex: 1, textAlign: "center" }]}>{it.quantity || 1}</Text>
            <Text style={[s.td, { flex: 2, textAlign: "right" }]}>{fmt(it.price)}</Text>
            <Text style={[s.td, { flex: 2, textAlign: "right" }]}>{fmt((it.quantity || 1) * Number(it.price || 0))}</Text>
          </View>
        ))}
        <View style={[s.row, { justifyContent: "flex-end", marginTop: 4, marginBottom: 8 }]}>
          <View style={{ width: 240 }}>
            <View style={s.row}><Text style={{ flex: 1, padding: 4 }}>TVA</Text><Text style={{ padding: 4, color: C.gray }}>Non applicable</Text></View>
            <View style={s.totalRow}>
              <Text style={[s.totalTd, { flex: 1 }]}>TOTAL NET À PAYER</Text>
              <Text style={s.totalTd}>{fmt(subtotal)}</Text>
            </View>
          </View>
        </View>

        <View style={s.noteBox}>
          <Text>Facture arrêtée à la somme de <Text style={[s.bold, { color: C.darkOrange }]}>{numberToWords(Math.round(subtotal))} francs CFA</Text>.</Text>
        </View>

        {inv.bank_info && (
          <View style={{ marginBottom: 8 }}>
            <Text style={[s.bold, { color: C.orange, fontSize: 8, marginBottom: 2 }]}>MODALITÉS DE PAIEMENT</Text>
            <Text>Mobile Money (Orange Money / MTN MoMo) au (+237) 696 99 58 79</Text>
            <Text>Virement bancaire : {inv.bank_info}</Text>
          </View>
        )}

        <View style={s.footer}>
          <Text>BUYTICLE ETS — Bonamoussadi, Douala — Cameroun · Tél : (+237) 696 99 58 79 · RCCM : CM-DLA-01-2025-A10-01482</Text>
        </View>
      </Page>
    </Document>
  );
}

function AboDocument({ inv }) {
  return (
    <Document>
      <Page size="A4" style={s.page}>
        <CompanyHeader inv={inv} />
        <View style={s.divider} />
        <Text style={[s.bold, { fontSize: 18, color: C.orange, marginBottom: 4 }]}>FACTURE D'ABONNEMENT</Text>
        <View style={{ backgroundColor: C.orange, alignSelf: "flex-start", padding: "3px 10px", marginBottom: 10 }}>
          <Text style={{ color: C.white, fontFamily: "Helvetica-Bold", fontSize: 7.5 }}>
            PÉRIODE D'ESSAI · {inv.trial_months || "2"} MOIS
          </Text>
        </View>
        <Text style={{ color: C.gray, marginBottom: 14 }}>
          Plateforme émettrice : <Text style={s.bold}>{inv.platform || ""}</Text>
          {"  "}·{"  "}
          <Text style={{ color: C.darkOrange }}>{inv.platform_url || ""}</Text>
        </Text>

        <View style={[s.row, { marginBottom: 14 }]}>
          <View style={{ flex: 1, paddingRight: 10 }}>
            <Text style={[s.label, { color: C.orange, marginBottom: 4 }]}>FACTURÉ À</Text>
            <Text style={s.bold}>{inv.client_name}</Text>
            {inv.client_address && <Text>{inv.client_address}</Text>}
            {inv.client_phone && <Text>{inv.client_phone}</Text>}
            {inv.client_email && <Text>{inv.client_email}</Text>}
          </View>
          <View style={s.metaBox}>
            <MetaRow label="N° de facture" value={inv.number} bold />
            <MetaRow label="Date d'émission" value={fmtDate(inv.date)} />
            <MetaRow label="Statut" value={inv.statut || "Période d'essai"} />
          </View>
        </View>

        <View style={s.tableHeader}>
          <Text style={[s.th, { flex: 3 }]}>DÉSIGNATION</Text>
          <Text style={[s.th, { flex: 1, textAlign: "right" }]}>MONTANT</Text>
        </View>
        <View style={s.row}>
          <View style={[s.td, { flex: 3 }]}>
            <Text style={s.bold}>Abonnement Plateforme « {inv.platform} » — Forfait Entreprise</Text>
            <Text style={{ color: C.gray, fontSize: 8, fontStyle: "italic" }}>Période d'essai de {inv.trial_months || "2"} mois incluse.</Text>
            <Text style={{ color: C.darkOrange, fontSize: 8 }}>
              Validité : {inv.trial_start && inv.trial_end ? `Du ${fmtDate(inv.trial_start)} au ${fmtDate(inv.trial_end)}` : ""}
            </Text>
          </View>
          <Text style={[s.td, { flex: 1, textAlign: "right" }]}>GRATUIT</Text>
        </View>

        <View style={s.noteBox}>
          <Text style={[s.bold, { color: C.darkOrange, marginBottom: 4 }]}>Note relative au Forfait Entreprise</Text>
          <Text>
            Conformément à nos conditions générales, cet abonnement bénéficie d'une période d'essai gratuite de {inv.trial_months || "2"} mois.
            À l'échéance de cette période ({inv.trial_end ? fmtDate(inv.trial_end) : ""}), la tarification finale sera appliquée.
          </Text>
        </View>

        <View style={{ borderLeft: `3px solid ${C.gray}`, backgroundColor: C.bgPale, padding: "8px 10px", marginBottom: 10 }}>
          <Text>Facture arrêtée à la somme de <Text style={s.bold}>zéro Franc CFA</Text> au titre de la période d'essai.</Text>
        </View>

        <View style={s.footer}>
          <Text>BUYTICLE ETS — Plateforme {inv.platform || ""} · {inv.platform_url || ""}</Text>
          <Text>Bonamoussadi, Douala — Cameroun · Tél : (+237) 696 99 58 79 · RCCM : CM-DLA-01-2025-A10-01482</Text>
        </View>
      </Page>
    </Document>
  );
}

export async function generatePdf(invoice) {
  const Doc = invoice.type === "abonnement" ? AboDocument : StdDocument;
  const blob = await pdf(<Doc inv={invoice} />).toBlob();
  const arrayBuffer = await blob.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
