import { getPaymentProvider } from "@/lib/payments";
import { appAppelante } from "@/lib/apps";
import { NextResponse } from "next/server";

// GET /api/v1/operateurs
// Ce que le compte pawaPay autorise réellement, opérateur par opérateur :
// encaissement (DEPOSIT), décaissement (PAYOUT), montants min/max.
export async function GET(request) {
  const { refus } = appAppelante(request);
  if (refus) return refus;
  try {
    const conf = await getPaymentProvider("pawapay").configurationActive();
    const pays = (conf?.countries || []).filter((c) => !c.country || c.country === "CMR");
    const operateurs = pays.flatMap((c) =>
      (c.providers || []).map((p) => ({
        provider: p.provider,
        nom: p.displayName || p.provider,
        operations: (p.currencies || []).flatMap((cur) =>
          Object.entries(cur.operationTypes || {}).map(([type, o]) => ({
            type,
            devise: cur.currency,
            statut: o?.status || "OPERATIONAL",
            min: o?.minAmount ?? null,
            max: o?.maxAmount ?? null,
          })),
        ),
      })),
    );
    return NextResponse.json({ base: (process.env.PAWAPAY_BASE_URL || "").trim(), operateurs, brut: conf });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 502 });
  }
}
