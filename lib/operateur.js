// L'opérateur d'un numéro camerounais, d'après son préfixe.
// MTN : 67x, 650-654, 680-684. Orange : 69x, 655-659, 685-689.
// Renvoie null quand on ne sait pas : il faut alors le demander.
export function operateurDuNumero(msisdn) {
  const local = String(msisdn || "").replace(/\D/g, "").replace(/^237/, "");
  if (local.length !== 9 || local[0] !== "6") return null;
  const deux = local.slice(0, 2);
  const trois = Number(local.slice(0, 3));
  if (deux === "67") return "MTN";
  if (deux === "69") return "ORANGE";
  if (trois >= 650 && trois <= 654) return "MTN";
  if (trois >= 655 && trois <= 659) return "ORANGE";
  if (trois >= 680 && trois <= 684) return "MTN";
  if (trois >= 685 && trois <= 689) return "ORANGE";
  return null;
}
