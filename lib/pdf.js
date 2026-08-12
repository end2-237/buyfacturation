import React from "react";
import { Document, Page, Text, View, StyleSheet, pdf, Font, Image } from "@react-pdf/renderer";

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

// ── Emetteur du document ──────────────────────────────────────────────────────
// L'en-tete portait BUYTICLE ETS en dur : chaque client de la plateforme
// envoyait donc a SES propres clients un bon de commande au nom d'une autre
// entreprise. L'emetteur est desormais une donnee du document.
//
// Le repli etait applique cle par cle : un vendeur qui remplissait son nom mais
// laissait RCCM et NIU vides imprimait les mentions legales de BUYTICLE sur SES
// bons de commande. Un numero de registre de commerce n'est pas un detail de
// mise en page — c'est l'identite legale d'une autre entreprise.
//
// Desormais : des qu'un `seller` est fourni, le document appartient a ce
// vendeur et n'affiche QUE ce qu'il a renseigne. Une case vide reste vide.
// Sans `seller` du tout, on garde l'identite historique : c'est l'outil de
// facturation interne, ou l'emetteur est effectivement BUYTICLE.

// Le logo de la maison. Une seule definition, surchargeable par variable
// d'environnement pour ne pas redeployer le code quand l'image change.
export const LOGO_MAISON =
  process.env.BUYTICLE_LOGO_URL ||
  "https://alrbokstfwwlvbvghrqr.supabase.co/storage/v1/object/public/vendor-assets/buylogo.png";

const VENDEUR_MAISON = {
  name: "BUYTICLE ETS",
  tagline: "Entreprise Individuelle (ETS)",
  address: "Bonamoussadi, Douala — Cameroun",
  phone: "(+237) 696 99 58 79",
  rccm: "CM-DLA-01-2025-A10-01482",
  niu: "P070418499910G",
  logo_url: LOGO_MAISON,
  color: null,
};

const VENDEUR_VIDE = {
  name: "", tagline: "", address: "", phone: "", email: "",
  rccm: "", niu: "", logo_url: null, color: null,
};

function vendeur(inv) {
  const brut = inv?.seller && typeof inv.seller === "object" ? inv.seller : null;
  const fourni = brut
    ? Object.fromEntries(
        Object.entries(brut).filter(([, v]) => v !== null && v !== undefined && String(v).trim() !== "")
      )
    : null;

  // Un objet `seller` entierement vide compte comme un vendeur identifie : il
  // vient de la plateforme, pas de l'outil interne.
  if (!brut) {
    const maison = { ...VENDEUR_MAISON };
    if (inv?.niu) maison.niu = inv.niu;
    return maison;
  }

  const v = { ...VENDEUR_VIDE, ...fourni };
  // Le NIU reste surchargeable par la colonne dediee, qui lui est anterieure.
  if (inv?.niu) v.niu = inv.niu;
  return v;
}

/** Couleur d'accent du document, avec repli sur l'orange historique. */
function accentDe(inv) {
  const c = vendeur(inv).color;
  return typeof c === "string" && /^#[0-9a-fA-F]{6}$/.test(c.trim()) ? c.trim() : C.orange;
}

// ── Habillage du tableau ──────────────────────────────────────────────────────
// Trois modeles, parce qu'un vendeur ne veut pas regler quinze curseurs : il
// veut choisir une allure. Les deux reglages fins (filets, alternance) restent
// disponibles pour qui veut ajuster, et l'emportent sur le modele.
export const MODELES = {
  classique: { entete: "plein",    lines: "horizontales", zebra: true  },
  epure:     { entete: "souligne", lines: "aucune",       zebra: false },
  contraste: { entete: "sombre",   lines: "toutes",       zebra: false },
};

export function styleDe(inv) {
  const st = inv?.style && typeof inv.style === "object" ? inv.style : {};
  const base = MODELES[st.template] || MODELES.classique;
  return {
    template: MODELES[st.template] ? st.template : "classique",
    entete: base.entete,
    lines: ["toutes", "horizontales", "aucune"].includes(st.lines) ? st.lines : base.lines,
    zebra: typeof st.zebra === "boolean" ? st.zebra : base.zebra,
    banner_url: typeof st.banner_url === "string" && st.banner_url.trim() ? st.banner_url.trim() : null,
    watermark_url: filigraneDe(inv, st),
  };
}

/**
 * Adresse du filigrane.
 *
 * Par defaut, seuls les documents de la maison en portent un — c'est notre
 * papier a en-tete, pas celui des vendeurs. Un vendeur qui en veut un le
 * demande explicitement par `style.watermark_url`, et n'importe qui peut le
 * couper avec `style.watermark: false`.
 */
function filigraneDe(inv, st) {
  if (st.watermark === false) return null;
  if (typeof st.watermark_url === "string" && st.watermark_url.trim()) return st.watermark_url.trim();
  const maison = !(inv?.seller && typeof inv.seller === "object");
  return maison ? LOGO_MAISON : null;
}

/** Fond et couleur de texte de la ligne d'en-tete, selon le modele. */
function habillageEntete(entete, accent) {
  if (entete === "sombre")   return { fond: { backgroundColor: C.black }, texte: C.white };
  if (entete === "souligne") return { fond: { borderBottom: `2px solid ${accent}` }, texte: accent };
  return { fond: { backgroundColor: accent }, texte: C.white };
}

/** Filets d'une cellule. `derniere` supprime le trait vertical de droite. */
function filets(lines, derniere) {
  const b = {};
  if (lines !== "aucune") b.borderBottom = `1px solid ${C.lineGray}`;
  if (lines === "toutes" && !derniere) b.borderRight = `1px solid ${C.lineGray}`;
  return b;
}

// Le separateur de milliers du francais est une espace fine insecable, absente
// de l'encodage Helvetica du PDF. On la ramene a une espace ordinaire.
function fmt(n) {
  return Number(n || 0).toLocaleString("fr-FR").replace(/[\u202f\u00a0]/g, " ") + " FCFA";
}

function fmtDate(d) {
  if (!d) return "";
  const [y, m, day] = String(d).split("T")[0].split("-");
  return `${day}/${m}/${y}`;
}

// ── Le montant en toutes lettres ──────────────────────────────────────────────
// C'est la mention qui fait foi sur une facture, donc elle doit etre juste et
// pas seulement lisible. Trois regles du francais que la version precedente
// ignorait : « cent » ne prend pas de « un » devant, « mille » est invariable
// et ne se dit jamais « un mille », et « cent » comme « vingt » prennent un
// « s » quand ils terminent le nombre. Elle ecrivait « un cent cinquante mille »
// pour 150 000.
const UNITES = ["", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf",
  "dix", "onze", "douze", "treize", "quatorze", "quinze", "seize", "dix-sept", "dix-huit", "dix-neuf"];
const DIZAINES = ["", "", "vingt", "trente", "quarante", "cinquante", "soixante", "soixante", "quatre-vingt", "quatre-vingt"];

/** 0 a 99. `seul` : le groupe termine le nombre, donc « vingts » s'accorde. */
function sousCent(n, seul) {
  if (n < 20) return UNITES[n];
  const d = Math.floor(n / 10), u = n % 10;
  // 70 et 90 se comptent par vingtaines : soixante-dix, quatre-vingt-dix.
  if (d === 7 || d === 9) {
    // « soixante-et-onze », mais « quatre-vingt-onze » sans liaison.
    return DIZAINES[d] + (u === 1 && d === 7 ? "-et-" : "-") + UNITES[10 + u];
  }
  // Quatre-vingts prend son « s » seulement en fin de nombre :
  // « quatre-vingts francs », mais « quatre-vingt mille ».
  if (u === 0) return DIZAINES[d] + (d === 8 && seul ? "s" : "");
  // La liaison « et » s'arrete a soixante-et-un : on dit quatre-vingt-un.
  return DIZAINES[d] + (u === 1 && d <= 6 ? "-et-" : "-") + UNITES[u];
}

/** 0 a 999. `seul` : le groupe termine le nombre, donc « cents » s'accorde. */
function sousMille(n, seul) {
  if (n < 100) return sousCent(n, seul);
  const c = Math.floor(n / 100), r = n % 100;
  const tete = (c > 1 ? UNITES[c] + " " : "") + "cent" + (c > 1 && r === 0 && seul ? "s" : "");
  return r === 0 ? tete : `${tete} ${sousCent(r, seul)}`;
}

function numberToWords(n) {
  n = Math.abs(Math.round(Number(n) || 0));
  if (n === 0) return "zéro";

  const parts = [];
  const millions = Math.floor(n / 1000000);
  const milliers = Math.floor((n % 1000000) / 1000);
  const reste    = n % 1000;

  if (millions) parts.push(`${sousMille(millions, true)} million${millions > 1 ? "s" : ""}`);
  // « mille » est invariable, et ne se fait jamais preceder de « un ».
  if (milliers) parts.push(milliers === 1 ? "mille" : `${sousMille(milliers, false)} mille`);
  if (reste)    parts.push(sousMille(reste, true));

  return parts.join(" ");
}

// ── Images : chargees avant le rendu, jamais pendant ──────────────────────────
// Le commentaire du logo promettait qu'une image injoignable n'empechait pas le
// document de sortir. C'etait faux : @react-pdf va chercher l'image lui-meme au
// moment du rendu, et une URL morte fait echouer tout le PDF. On les recupere
// donc en amont, avec un delai court, et on ne passe au rendu que ce qui est
// reellement arrive. Un logo absent coute une ligne blanche ; un telechargement
// en erreur 500 coute un client qui n'a pas son recu.
async function chargerImage(url) {
  if (typeof url !== "string" || !url.trim()) return null;
  try {
    const stop = AbortSignal.timeout ? AbortSignal.timeout(6000) : undefined;
    const res = await fetch(url.trim(), { signal: stop });
    if (!res.ok) return null;
    const type = res.headers.get("content-type") || "";
    if (!type.startsWith("image/")) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (!buf.length) return null;
    return `data:${type.split(";")[0]};base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

/** Resout les trois images du document sans toucher aux champs d'origine. */
async function avecImages(inv) {
  const st = styleDe(inv);
  const [logo, banner, filigrane] = await Promise.all([
    chargerImage(vendeur(inv).logo_url),
    chargerImage(st.banner_url),
    chargerImage(st.watermark_url),
  ]);
  return { ...inv, __logo: logo, __banner: banner, __filigrane: filigrane };
}

/**
 * Le filigrane, pose sous le contenu et repete a chaque page.
 * Assez pale pour qu'on lise la facture par-dessus : c'est une marque
 * d'origine, pas une decoration.
 */
function Filigrane({ src }) {
  if (!src) return null;
  return (
    <View
      fixed
      style={{
        position: "absolute",
        top: 0, left: 0, right: 0, bottom: 0,
        alignItems: "center", justifyContent: "center",
      }}
    >
      <Image src={src} style={{ width: "62%", opacity: 0.05, objectFit: "contain" }} />
    </View>
  );
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
  const v = vendeur(inv);
  return (
    <View style={[s.row, { justifyContent: "space-between", marginBottom: 4 }]}>
      <View>
        <Text style={s.brand}>{v.name}</Text>
        {v.tagline ? (
          <Text style={[s.gray, { fontSize: 8, fontStyle: "italic" }]}>{v.tagline}</Text>
        ) : null}
        {v.address ? <Text>{v.address}</Text> : null}
        {v.phone ? <Text>Tél : {v.phone}</Text> : null}
        {v.email ? <Text style={s.gray}>{v.email}</Text> : null}
        {v.rccm ? <Text style={s.gray}>RCCM : {v.rccm}</Text> : null}
        {v.niu ? <Text style={s.gray}>NIU : {v.niu}</Text> : null}
      </View>
      {/* Le logo est facultatif : `__logo` ne contient que ce qui a
          effectivement ete telecharge (voir `avecImages`). */}
      {inv.__logo ? (
        <Image src={inv.__logo} style={{ maxWidth: 110, maxHeight: 55, objectFit: "contain" }} />
      ) : null}
    </View>
  );
}

// Un bon de commande n'est pas une facture : rien n'est du, on confirme une
// commande. Seuls le titre et la formule de cloture changent — la mise en page,
// elle, reste identique.
const IS_ORDER = (inv) => inv.type === "bon_commande";

function StdDocument({ inv }) {
  const items = inv.items || [];
  const subtotal = items.reduce((s, i) => s + (i.quantity || 1) * Number(i.price || 0), 0);
  const v = vendeur(inv);
  const accent = accentDe(inv);
  const st = styleDe(inv);
  const ent = habillageEntete(st.entete, accent);

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <Filigrane src={inv.__filigrane} />
        <CompanyHeader inv={inv} />
        <View style={[s.divider, { borderBottomColor: accent }]} />
        <Text style={[s.bold, { fontSize: 22, color: accent, marginBottom: 12 }]}>
          {IS_ORDER(inv) ? "BON DE COMMANDE" : "FACTURE"}
        </Text>

        <View style={[s.row, { marginBottom: 14 }]}>
          <View style={{ flex: 1, paddingRight: 10 }}>
            <Text style={[s.label, { color: accent, marginBottom: 4 }]}>
              {IS_ORDER(inv) ? "COMMANDÉ PAR" : "FACTURÉ À"}
            </Text>
            <Text style={s.bold}>{inv.client_name}</Text>
            {inv.client_address && <Text>{inv.client_address}</Text>}
            {inv.client_phone && <Text>{inv.client_phone}</Text>}
            {inv.client_email && <Text>{inv.client_email}</Text>}
          </View>
          <View style={s.metaBox}>
            <MetaRow label={IS_ORDER(inv) ? "N° de commande" : "N° de facture"} value={inv.number} bold />
            <MetaRow label="Date d'émission" value={fmtDate(inv.date)} />
            {inv.due_date && <MetaRow label="Échéance" value={fmtDate(inv.due_date)} />}
          </View>
        </View>

        <View style={[s.row, ent.fond]}>
          <Text style={[s.th, { flex: 4, color: ent.texte }]}>DÉSIGNATION</Text>
          <Text style={[s.th, { flex: 1, textAlign: "center", color: ent.texte }]}>QTÉ</Text>
          <Text style={[s.th, { flex: 2, textAlign: "right", color: ent.texte }]}>PRIX UNIT.</Text>
          <Text style={[s.th, { flex: 2, textAlign: "right", color: ent.texte }]}>MONTANT</Text>
        </View>
        {items.map((it, i) => (
          <View key={i} style={[s.row, { backgroundColor: st.zebra && i % 2 === 1 ? C.bgPale : C.white }]}>
            <Text style={[s.td, { flex: 4 }, filets(st.lines)]}>{it.description}</Text>
            <Text style={[s.td, { flex: 1, textAlign: "center" }, filets(st.lines)]}>{it.quantity || 1}</Text>
            <Text style={[s.td, { flex: 2, textAlign: "right" }, filets(st.lines)]}>{fmt(it.price)}</Text>
            <Text style={[s.td, { flex: 2, textAlign: "right" }, filets(st.lines, true)]}>{fmt((it.quantity || 1) * Number(it.price || 0))}</Text>
          </View>
        ))}
        <View style={[s.row, { justifyContent: "flex-end", marginTop: 4, marginBottom: 8 }]}>
          <View style={{ width: 240 }}>
            <View style={s.row}><Text style={{ flex: 1, padding: 4 }}>TVA</Text><Text style={{ padding: 4, color: C.gray }}>Non applicable</Text></View>
            <View style={[s.totalRow, { backgroundColor: accent }]}>
              <Text style={[s.totalTd, { flex: 1 }]}>TOTAL NET À PAYER</Text>
              <Text style={s.totalTd}>{fmt(subtotal)}</Text>
            </View>
          </View>
        </View>

        <View style={[s.noteBox, { borderLeftColor: accent }]}>
          <Text>
            {IS_ORDER(inv) ? "Commande arrêtée à la somme de " : "Facture arrêtée à la somme de "}
            <Text style={[s.bold, { color: accent }]}>{numberToWords(Math.round(subtotal))} francs CFA</Text>.
          </Text>
        </View>

        {inv.bank_info && (
          <View style={{ marginBottom: 8 }}>
            <Text style={[s.bold, { color: accent, fontSize: 8, marginBottom: 2 }]}>MODALITÉS DE PAIEMENT</Text>
            {v.phone ? <Text>Mobile Money (Orange Money / MTN MoMo) au {v.phone}</Text> : null}
            <Text>Virement bancaire : {inv.bank_info}</Text>
          </View>
        )}

        {/* Bandeau de bas de page : une image large et peu haute, pour une
            promotion ou une signature visuelle. Elle vient avant le pied de
            page, jamais a la place. Comme le logo, une image injoignable ne
            doit pas empecher le document de sortir. */}
        {inv.__banner ? (
          <View style={{ marginTop: 10 }}>
            <Image src={inv.__banner} style={{ width: "100%", maxHeight: 70, objectFit: "contain" }} />
          </View>
        ) : null}

        <View style={s.footer}>
          <Text>
            {[v.name, v.address, v.phone && `Tél : ${v.phone}`, v.rccm && `RCCM : ${v.rccm}`]
              .filter(Boolean)
              .join(" · ")}
          </Text>
        </View>
      </Page>
    </Document>
  );
}

// ── Facture d'abonnement ──────────────────────────────────────────────────────
// Ce modele n'ecrivait qu'une chose : une periode d'essai gratuite de deux
// mois, montant zero, en dur. Il ignorait les lignes qu'on lui passait — un
// abonnement regle 15 000 F en agence ressortait donc « GRATUIT ».
//
// Desormais le document suit le montant. Rien de du : c'est bien un essai, et
// la lettre d'essai s'imprime comme avant. Un montant du : c'est une facture,
// et elle porte ce qui a ete paye. Le meme type de document couvre les deux
// parce que c'est la meme relation commerciale, pas parce que c'est la meme
// somme.
function AboDocument({ inv }) {
  const items = Array.isArray(inv.items) && inv.items.length
    ? inv.items
    : [{
        description: `Abonnement Plateforme « ${inv.platform || ""} » — Forfait Entreprise`,
        quantity: 1,
        price: 0,
      }];
  const total = items.reduce((acc, i) => acc + (i.quantity || 1) * Number(i.price || 0), 0);
  const essai = total <= 0;

  // Les dates de validite portent le meme sens dans les deux cas : la periode
  // couverte. Les colonnes `trial_*` restent la source, les `period_*` sont
  // acceptees pour les appelants qui trouvent « trial » trompeur sur du payant.
  const debut = inv.period_start || inv.trial_start;
  const fin   = inv.period_end   || inv.trial_end;
  const validite = debut && fin ? `Du ${fmtDate(debut)} au ${fmtDate(fin)}` : "";

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <Filigrane src={inv.__filigrane} />
        <CompanyHeader inv={inv} />
        <View style={s.divider} />
        <Text style={[s.bold, { fontSize: 18, color: C.orange, marginBottom: 4 }]}>FACTURE D&apos;ABONNEMENT</Text>

        {essai ? (
          <View style={{ backgroundColor: C.orange, alignSelf: "flex-start", padding: "3px 10px", marginBottom: 10 }}>
            <Text style={{ color: C.white, fontFamily: "Helvetica-Bold", fontSize: 7.5 }}>
              PÉRIODE D&apos;ESSAI · {inv.trial_months || "2"} MOIS
            </Text>
          </View>
        ) : inv.status === "paid" ? (
          <View style={{ backgroundColor: "#0F7B4F", alignSelf: "flex-start", padding: "3px 10px", marginBottom: 10 }}>
            <Text style={{ color: C.white, fontFamily: "Helvetica-Bold", fontSize: 7.5 }}>ACQUITTÉE</Text>
          </View>
        ) : null}

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
            <MetaRow label="Statut" value={inv.statut || (essai ? "Période d'essai" : "Payé")} />
            {inv.payment_method ? <MetaRow label="Règlement" value={inv.payment_method} /> : null}
          </View>
        </View>

        <View style={s.tableHeader}>
          <Text style={[s.th, { flex: 3 }]}>DÉSIGNATION</Text>
          <Text style={[s.th, { flex: 1, textAlign: "right" }]}>MONTANT</Text>
        </View>
        {items.map((it, i) => {
          const ligne = (it.quantity || 1) * Number(it.price || 0);
          return (
            <View key={i} style={s.row}>
              <View style={[s.td, { flex: 3 }]}>
                <Text style={s.bold}>{it.description}</Text>
                {essai ? (
                  <Text style={{ color: C.gray, fontSize: 8, fontStyle: "italic" }}>
                    Période d&apos;essai de {inv.trial_months || "2"} mois incluse.
                  </Text>
                ) : (it.quantity || 1) > 1 ? (
                  <Text style={{ color: C.gray, fontSize: 8 }}>
                    {it.quantity} × {fmt(it.price)}
                  </Text>
                ) : null}
                {validite ? (
                  <Text style={{ color: C.darkOrange, fontSize: 8 }}>Validité : {validite}</Text>
                ) : null}
              </View>
              <Text style={[s.td, { flex: 1, textAlign: "right" }]}>
                {essai ? "GRATUIT" : fmt(ligne)}
              </Text>
            </View>
          );
        })}

        {!essai && (
          <View style={[s.row, { justifyContent: "flex-end", marginTop: 4, marginBottom: 8 }]}>
            <View style={{ width: 240 }}>
              <View style={s.row}>
                <Text style={{ flex: 1, padding: 4 }}>TVA</Text>
                <Text style={{ padding: 4, color: C.gray }}>Non applicable</Text>
              </View>
              <View style={s.totalRow}>
                <Text style={[s.totalTd, { flex: 1 }]}>TOTAL NET À PAYER</Text>
                <Text style={s.totalTd}>{fmt(total)}</Text>
              </View>
            </View>
          </View>
        )}

        {essai ? (
          <View style={s.noteBox}>
            <Text style={[s.bold, { color: C.darkOrange, marginBottom: 4 }]}>Note relative au Forfait Entreprise</Text>
            <Text>
              Conformément à nos conditions générales, cet abonnement bénéficie d&apos;une période d&apos;essai gratuite de {inv.trial_months || "2"} mois.
              À l&apos;échéance de cette période ({fin ? fmtDate(fin) : ""}), la tarification finale sera appliquée.
            </Text>
          </View>
        ) : (
          <View style={s.noteBox}>
            <Text style={[s.bold, { color: C.darkOrange, marginBottom: 4 }]}>Note relative à l&apos;abonnement</Text>
            <Text>
              Cet abonnement est réglé pour la période indiquée ci-dessus
              {inv.payment_method ? ` (${inv.payment_method})` : ""}.
              Au terme de cette période, il doit être renouvelé pour que la boutique
              reste visible sur la plateforme.
            </Text>
          </View>
        )}

        <View style={{ borderLeft: `3px solid ${C.gray}`, backgroundColor: C.bgPale, padding: "8px 10px", marginBottom: 10 }}>
          {essai ? (
            <Text>Facture arrêtée à la somme de <Text style={s.bold}>zéro Franc CFA</Text> au titre de la période d&apos;essai.</Text>
          ) : (
            <Text>
              Facture arrêtée à la somme de{" "}
              <Text style={[s.bold, { color: C.darkOrange }]}>{numberToWords(Math.round(total))} francs CFA</Text>.
            </Text>
          )}
        </View>

        {inv.__banner ? (
          <View style={{ marginTop: 6 }}>
            <Image src={inv.__banner} style={{ width: "100%", maxHeight: 70, objectFit: "contain" }} />
          </View>
        ) : null}

        <View style={s.footer}>
          <Text>BUYTICLE ETS — Plateforme {inv.platform || ""} · {inv.platform_url || ""}</Text>
          <Text>Bonamoussadi, Douala — Cameroun · Tél : (+237) 696 99 58 79 · RCCM : CM-DLA-01-2025-A10-01482</Text>
        </View>
      </Page>
    </Document>
  );
}

export async function generatePdf(invoice) {
  const inv = await avecImages(invoice);
  const Doc = inv.type === "abonnement" ? AboDocument : StdDocument;
  const blob = await pdf(<Doc inv={inv} />).toBlob();
  const arrayBuffer = await blob.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
