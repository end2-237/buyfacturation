// Total d'une facture (somme des lignes). Les abonnements sont à 0.
export function invoiceTotal(invoice) {
  if (invoice.type === "abonnement") return 0;
  return (invoice.items || []).reduce(
    (s, i) => s + (Number(i.quantity) || 1) * Number(i.price || 0),
    0
  );
}

// Normalise un numéro camerounais vers un MSISDN international sans "+", ex. 2376XXXXXXXX.
export function toMsisdn(numero) {
  let n = String(numero || "").replace(/[^0-9]/g, "");
  if (n.startsWith("237")) return n;
  if (n.length === 9) return "237" + n; // numéro local à 9 chiffres
  return n;
}
