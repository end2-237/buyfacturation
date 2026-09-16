export const dynamic = "force-dynamic";
import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { invoiceTotal } from "@/lib/invoice-utils";
import PaymentForm from "@/components/PaymentForm";

const LOGO = "https://alrbokstfwwlvbvghrqr.supabase.co/storage/v1/object/public/vendor-assets/buylogo.png";

function fmt(n) { return Number(n || 0).toLocaleString("fr-FR").replace(/[  ]/g, " "); }
function fmtDate(d) {
  if (!d) return "";
  const [y, m, day] = String(d).split("T")[0].split("-");
  return `${day}/${m}/${y}`;
}

export default async function PayPage({ params }) {
  const { data: inv } = await supabase.from("invoices").select("*").eq("id", params.id).single();
  if (!inv) notFound();

  const montant = invoiceTotal(inv);
  const items = inv.items || [];
  const alreadyPaid = inv.status === "paid";

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24, boxSizing: "border-box",
      background: "#0D1B2E",
    }}>
      <div style={{
        width: 880, maxWidth: "100%", display: "flex", flexWrap: "wrap",
        borderRadius: 16, overflow: "hidden", background: "#fff",
        boxShadow: "0 24px 60px rgba(0,0,0,.35)",
      }}>
        {/* Gauche — récapitulatif (image finance + overlay net) */}
        <div style={{ flex: "1 1 320px", minWidth: 300, position: "relative", color: "#fff", padding: 36, display: "flex", flexDirection: "column", overflow: "hidden", backgroundColor: "#0D1B2E" }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "url(https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?auto=format&fit=crop&w=1200&q=80)", backgroundSize: "cover", backgroundPosition: "center", opacity: 0.28 }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(165deg, rgba(13,27,46,.90) 0%, rgba(13,27,46,.82) 55%, rgba(9,20,35,.94) 100%)" }} />
          <div style={{ position: "relative", display: "flex", flexDirection: "column", height: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 10 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={LOGO} alt="BUYTICLE" style={{ width: 40, height: 40, borderRadius: 9, objectFit: "contain", background: "#fff", padding: 4 }} />
            <div style={{ fontWeight: 700, fontSize: 17, letterSpacing: .3 }}>BUYTICLE</div>
          </div>
          <div style={{ fontSize: 12.5, fontStyle: "italic", color: "rgba(255,255,255,.55)", marginBottom: 32 }}>
            BUYTICLE vous accompagne partout où vous allez.
          </div>

          <div style={{ fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: "rgba(255,255,255,.45)", marginBottom: 6 }}>Facture</div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{inv.number}</div>
          <div style={{ fontSize: 12.5, color: "rgba(255,255,255,.6)", marginBottom: 28 }}>Émise le {fmtDate(inv.date)} · {inv.client_name}</div>

          <div style={{ borderTop: "1px solid rgba(255,255,255,.12)", paddingTop: 18, flex: 1 }}>
            {items.slice(0, 6).map((it, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 15 }}>
                <div style={{ paddingRight: 12 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{it.description || "Article"}</div>
                  <div style={{ fontSize: 11.5, color: "rgba(255,255,255,.5)" }}>Quantité : {it.quantity || 1}</div>
                </div>
                <div style={{ fontSize: 13.5, fontWeight: 600, whiteSpace: "nowrap" }}>{fmt((it.quantity || 1) * Number(it.price || 0))} FCFA</div>
              </div>
            ))}
          </div>

          <div style={{ borderTop: "1px solid rgba(255,255,255,.12)", paddingTop: 18, marginTop: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,.7)" }}>Montant total</span>
              <span style={{ fontSize: 26, fontWeight: 800 }}>{fmt(montant)}<span style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,.6)" }}> FCFA</span></span>
            </div>
            <a href={`/api/invoices/${inv.id}/download`} target="_blank" rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: 7, marginTop: 16, fontSize: 12.5, color: "rgba(255,255,255,.7)", textDecoration: "none", borderBottom: "1px solid rgba(255,255,255,.25)", paddingBottom: 2 }}>
              ⭳ Télécharger ma facture (PDF)
            </a>
          </div>
          </div>
        </div>

        {/* Droite — paiement (clair, un seul accent) */}
        <div style={{ flex: "1 1 360px", minWidth: 320, padding: 40, background: "#fff", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          {alreadyPaid ? (
            <div style={{ textAlign: "center" }}>
              <div style={{ width: 60, height: 60, borderRadius: "50%", background: "#ECFDF3", color: "#12B76A", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, margin: "0 auto 16px" }}>✓</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#101828" }}>Facture déjà payée</div>
              <div style={{ fontSize: 13, color: "#667085", marginTop: 6 }}>Aucune action requise. Merci !</div>
            </div>
          ) : montant <= 0 ? (
            <div style={{ textAlign: "center", color: "#B54708", fontSize: 14 }}>Cette facture n'a pas de montant à régler.</div>
          ) : (
            <>
              <div style={{ fontSize: 19, fontWeight: 700, color: "#101828", marginBottom: 4 }}>Méthode de paiement</div>
              <div style={{ fontSize: 13, color: "#667085", marginBottom: 26 }}>Réglez en toute sécurité par Mobile Money.</div>
              <PaymentForm invoiceId={inv.id} montant={montant} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
