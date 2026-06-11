import puppeteer from "puppeteer";

function formatAmount(n) {
  return new Intl.NumberFormat("fr-FR").format(n) + " FCFA";
}

function formatDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

const numberWords = [
  "", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf",
  "dix", "onze", "douze", "treize", "quatorze", "quinze", "seize", "dix-sept",
  "dix-huit", "dix-neuf", "vingt", "vingt et un", "vingt-deux", "vingt-trois",
  "vingt-quatre", "vingt-cinq", "vingt-six", "vingt-sept", "vingt-huit", "vingt-neuf",
  "trente", "trente et un", "trente-deux", "trente-trois", "trente-quatre", "trente-cinq",
  "trente-six", "trente-sept", "trente-huit", "trente-neuf", "quarante", "quarante et un",
  "quarante-deux", "quarante-trois", "quarante-quatre", "quarante-cinq", "quarante-six",
  "quarante-sept", "quarante-huit", "quarante-neuf", "cinquante", "cinquante et un",
  "cinquante-deux", "cinquante-trois", "cinquante-quatre", "cinquante-cinq", "cinquante-six",
  "cinquante-sept", "cinquante-huit", "cinquante-neuf", "soixante", "soixante et un",
  "soixante-deux", "soixante-trois", "soixante-quatre", "soixante-cinq", "soixante-six",
  "soixante-sept", "soixante-huit", "soixante-neuf", "soixante-dix", "soixante et onze",
  "soixante-douze", "soixante-treize", "soixante-quatorze", "soixante-quinze",
  "soixante-seize", "soixante-dix-sept", "soixante-dix-huit", "soixante-dix-neuf",
  "quatre-vingts", "quatre-vingt-un", "quatre-vingt-deux", "quatre-vingt-trois",
  "quatre-vingt-quatre", "quatre-vingt-cinq", "quatre-vingt-six", "quatre-vingt-sept",
  "quatre-vingt-huit", "quatre-vingt-neuf", "quatre-vingt-dix", "quatre-vingt-onze",
  "quatre-vingt-douze", "quatre-vingt-treize", "quatre-vingt-quatorze", "quatre-vingt-quinze",
  "quatre-vingt-seize", "quatre-vingt-dix-sept", "quatre-vingt-dix-huit", "quatre-vingt-dix-neuf",
];

function toWords(n) {
  if (n === 0) return "zéro";
  if (n < 100) return numberWords[n];
  if (n < 1000) {
    const h = Math.floor(n / 100);
    const r = n % 100;
    return (h === 1 ? "cent" : numberWords[h] + " cents") + (r ? " " + toWords(r) : "");
  }
  if (n < 1000000) {
    const t = Math.floor(n / 1000);
    const r = n % 1000;
    return (t === 1 ? "mille" : toWords(t) + " mille") + (r ? " " + toWords(r) : "");
  }
  return n.toString();
}

function buildHtmlStandard(inv) {
  const total = (inv.items || []).reduce((s, i) => s + i.quantity * i.price, 0);
  const rows = (inv.items || [])
    .map(
      (i) => `<tr>
        <td style="padding:6px 8px;border:1px solid #ddd;">${i.description}</td>
        <td style="padding:6px 8px;border:1px solid #ddd;text-align:center;">${i.quantity}</td>
        <td style="padding:6px 8px;border:1px solid #ddd;text-align:right;">${formatAmount(i.price)}</td>
        <td style="padding:6px 8px;border:1px solid #ddd;text-align:right;">${formatAmount(i.quantity * i.price)}</td>
      </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8"/>
<style>
  body { font-family: Arial, sans-serif; font-size: 12px; color: #222; margin: 0; padding: 30px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; }
  .brand { color: #DD5509; font-size: 22px; font-weight: bold; }
  .title { font-size: 26px; font-weight: bold; color: #DD5509; text-align: right; }
  table { width: 100%; border-collapse: collapse; }
  th { background: #DD5509; color: white; padding: 8px; text-align: left; }
  .total-row td { font-weight: bold; background: #f8f8f8; }
  .section { margin: 20px 0; }
  .label { color: #888; font-size: 10px; text-transform: uppercase; }
  .footer { margin-top: 40px; font-size: 10px; color: #888; border-top: 1px solid #eee; padding-top: 10px; }
</style>
</head>
<body>
<div class="header">
  <div>
    <div class="brand">BUYTICLE ETS</div>
    <div>Bonamoussadi, Douala — Cameroun</div>
    <div>(+237) 696 99 58 79</div>
    <div>RCCM : CM-DLA-01-2025-A10-01482</div>
    <div>NIU : ${inv.niu || "P070418499910G"}</div>
  </div>
  <div class="title">FACTURE<br/><span style="font-size:14px;color:#555;">${inv.number}</span></div>
</div>

<div style="display:flex;justify-content:space-between;margin-bottom:20px;">
  <div class="section">
    <div class="label">Facturé à</div>
    <div><strong>${inv.client.name}</strong></div>
    ${inv.client.address ? `<div>${inv.client.address}</div>` : ""}
    ${inv.client.phone ? `<div>${inv.client.phone}</div>` : ""}
    ${inv.client.email ? `<div>${inv.client.email}</div>` : ""}
  </div>
  <div class="section" style="text-align:right;">
    <div class="label">Date</div><div>${formatDate(inv.date)}</div>
    ${inv.dueDate ? `<div class="label" style="margin-top:8px;">Échéance</div><div>${formatDate(inv.dueDate)}</div>` : ""}
  </div>
</div>

<table>
  <thead>
    <tr>
      <th>Description</th>
      <th style="text-align:center;">Qté</th>
      <th style="text-align:right;">Prix unitaire</th>
      <th style="text-align:right;">Total</th>
    </tr>
  </thead>
  <tbody>
    ${rows}
    <tr class="total-row">
      <td colspan="3" style="padding:8px;border:1px solid #ddd;text-align:right;">TOTAL</td>
      <td style="padding:8px;border:1px solid #ddd;text-align:right;">${formatAmount(total)}</td>
    </tr>
  </tbody>
</table>

<div style="margin-top:16px;font-style:italic;">
  Arrêtée la présente facture à la somme de : <strong>${toWords(total)} francs CFA</strong>
</div>

${inv.bankInfo ? `<div class="section"><div class="label">Informations de paiement</div><div>${inv.bankInfo}</div></div>` : ""}

<div class="footer">
  TVA non applicable — régime simplifié d'imposition &nbsp;|&nbsp; BUYTICLE ETS &copy; ${new Date().getFullYear()}
</div>
</body>
</html>`;
}

function buildHtmlAbonnement(inv) {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8"/>
<style>
  body { font-family: Arial, sans-serif; font-size: 12px; color: #222; margin: 0; padding: 30px; }
  .brand { color: #DD5509; font-size: 22px; font-weight: bold; }
  .title { font-size: 26px; font-weight: bold; color: #DD5509; }
  .box { background: #fff8f5; border-left: 4px solid #DD5509; padding: 12px 16px; margin: 16px 0; border-radius: 4px; }
  .label { color: #888; font-size: 10px; text-transform: uppercase; }
  .footer { margin-top: 40px; font-size: 10px; color: #888; border-top: 1px solid #eee; padding-top: 10px; }
  table { width: 100%; border-collapse: collapse; margin-top: 16px; }
  th { background: #DD5509; color: white; padding: 8px; }
  td { padding: 8px; border: 1px solid #ddd; }
</style>
</head>
<body>
<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:30px;">
  <div>
    <div class="brand">BUYTICLE ETS</div>
    <div>Bonamoussadi, Douala — Cameroun</div>
    <div>(+237) 696 99 58 79</div>
    <div>NIU : ${inv.niu || "P070418499910G"}</div>
  </div>
  <div class="title">FACTURE D'ABONNEMENT<br/><span style="font-size:14px;color:#555;">${inv.number}</span></div>
</div>

<div style="display:flex;justify-content:space-between;margin-bottom:20px;">
  <div>
    <div class="label">Facturé à</div>
    <div><strong>${inv.client.name}</strong></div>
    ${inv.client.address ? `<div>${inv.client.address}</div>` : ""}
    ${inv.client.phone ? `<div>${inv.client.phone}</div>` : ""}
    ${inv.client.email ? `<div>${inv.client.email}</div>` : ""}
  </div>
  <div style="text-align:right;">
    <div class="label">Date</div><div>${formatDate(inv.date)}</div>
    <div class="label" style="margin-top:8px;">Statut</div>
    <div><strong>${inv.statut || "Période d'essai"}</strong></div>
  </div>
</div>

<div class="box">
  <div><strong>Plateforme :</strong> ${inv.platform || ""}${inv.platformUrl ? ` — ${inv.platformUrl}` : ""}</div>
  <div><strong>Durée de la période d'essai :</strong> ${inv.trialMonths || ""} mois</div>
  <div><strong>Début :</strong> ${formatDate(inv.trialStart)} &nbsp;&nbsp; <strong>Fin :</strong> ${formatDate(inv.trialEnd)}</div>
</div>

<table>
  <thead><tr><th>Description</th><th>Montant</th></tr></thead>
  <tbody>
    <tr><td>Période d'essai — ${inv.platform}</td><td style="text-align:right;"><strong>GRATUIT</strong></td></tr>
  </tbody>
</table>

<div style="margin-top:16px;font-style:italic;">Aucun montant dû durant la période d'essai.</div>

<div class="footer">
  TVA non applicable — régime simplifié &nbsp;|&nbsp; BUYTICLE ETS &copy; ${new Date().getFullYear()}
</div>
</body>
</html>`;
}

export async function generatePdf(invoice) {
  const html =
    invoice.type === "abonnement"
      ? buildHtmlAbonnement(invoice)
      : buildHtmlStandard(invoice);

  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "10mm", bottom: "10mm", left: "10mm", right: "10mm" },
    });
    return pdf;
  } finally {
    await browser.close();
  }
}
