export const dynamic = "force-dynamic";
import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { invoiceTotal } from "@/lib/invoice-utils";
import PaymentForm from "@/components/PaymentForm";

const LOGO = "https://alrbokstfwwlvbvghrqr.supabase.co/storage/v1/object/public/vendor-assets/buylogo.png";
const HERO = "https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?auto=format&fit=crop&w=1000&q=80";

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
      padding: 20, fontFamily: "Arial, Helvetica, sans-serif",
      background: "linear-gradient(135deg,#0D1B2E 0%,#16324F 100%)",
    }}>
      <div style={{
        width: 940, maxWidth: "100%", display: "flex", borderRadius: 20, overflow: "hidden",
        boxShadow: "0 30px 80px rgba(0,0,0,.45)", background: "#fff", minHeight: 560, flexWrap: "wrap",
      }}>
        {/* Gauche — récapitulatif */}
        <div style={{ flex: "1 1 340px", minWidth: 300, position: "relative", color: "#fff", padding: "36px 34px", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${HERO})`, backgroundSize: "cover", backgroundPosition: "center" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(160deg, rgba(13,27,46,.92), rgba(22,50,79,.86))" }} />
          <div style={{ position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={LOGO} alt="BUYTICLE" style={{ width: 44, height: 44, borderRadius: 10, objectFit: "contain", background: "#fff", padding: 4 }} />
              <div style={{ fontWeight: 800, fontSize: 18, letterSpacing: .5 }}>BUYTICLE</div>
            </div>
            <div style={{ fontSize: 13, fontStyle: "italic", opacity: .85, marginBottom: 26, lineHeight: 1.4 }}>
              « BUYTICLE vous accompagne partout où vous allez. »
            </div>
            <div style={{ fontSize: 13, letterSpacing: 2, textTransform: "uppercase", opacity: .7, marginBottom: 4 }}>Récapitulatif</div>
            <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 2 }}>Facture {inv.number}</div>
            <div style={{ fontSize: 13, opacity: .75, marginBottom: 24 }}>Émise le {fmtDate(inv.date)} · {inv.client_name}</div>

            <div style={{ borderTop: "1px solid rgba(255,255,255,.15)", paddingTop: 18 }}>
              {items.slice(0, 6).map((it, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700 }}>{it.description || "Article"}</div>
                    <div style={{ fontSize: 11.5, opacity: .65 }}>Quantité : {it.quantity || 1}</div>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, whiteSpace: "nowrap" }}>{fmt((it.quantity || 1) * Number(it.price || 0))} FCFA</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ position: "relative", marginTop: 24 }}>
            <div style={{ background: "#DD5509", borderRadius: 12, padding: "16px 18px" }}>
              <div style={{ fontSize: 12, opacity: .9, textTransform: "uppercase", letterSpacing: 1 }}>Montant total</div>
              <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.2 }}>{fmt(montant)} FCFA</div>
              <div style={{ fontSize: 11, opacity: .85 }}>TVA non applicable — régime simplifié</div>
            </div>
            <a href={`/api/invoices/${inv.id}/download`} target="_blank" rel="noopener noreferrer"
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 12, padding: "11px 16px", borderRadius: 10, border: "1px solid rgba(255,255,255,.3)", color: "#fff", textDecoration: "none", fontSize: 13, fontWeight: 600, background: "rgba(255,255,255,.08)" }}>
              ⭳ Télécharger ma facture (PDF)
            </a>
          </div>
        </div>

        {/* Droite — paiement */}
        <div style={{ flex: "1 1 380px", minWidth: 320, padding: "40px 38px", background: "#fff" }}>
          {alreadyPaid ? (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#E7F7EF", color: "#0F7B4F", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, margin: "0 auto 16px" }}>✓</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#0F1728" }}>Facture déjà payée</div>
              <div style={{ fontSize: 13, color: "#667085", marginTop: 6 }}>Aucune action requise. Merci !</div>
            </div>
          ) : montant <= 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#92400E" }}>Cette facture n'a pas de montant à régler.</div>
          ) : (
            <>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#DD5509", marginBottom: 4 }}>Méthode de paiement</div>
              <div style={{ fontSize: 13, color: "#667085", marginBottom: 24 }}>Payez en toute sécurité par Mobile Money.</div>
              <PaymentForm invoiceId={inv.id} montant={montant} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
