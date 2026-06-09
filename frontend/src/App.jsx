import React, { useState, useRef, useEffect } from "react";
import {
  FileText, Download, Plus, Trash2, User, Eye,
  Search, Edit2, LayoutDashboard,
  ChevronRight, ChevronLeft, Receipt, Layers, Zap,
  Building2, X, Check, DollarSign, TrendingUp,
  BarChart2, CalendarDays, Hash, ArrowUpRight,
} from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// ─── Palette & Design Tokens ─────────────────────────────────────────────────
const D = {
  // Brand (BUYTICLE orange)
  brand:    "#DD5509",
  brandD:   "#B8450A",
  brandL:   "#FEF0E8",
  brandXL:  "#FFF8F4",

  // Sidebar
  nav:      "#0D1B2E",
  navSep:   "rgba(255,255,255,0.07)",
  navHov:   "rgba(255,255,255,0.05)",
  navAct:   "rgba(221,85,9,0.13)",

  // Surfaces
  bg:       "#E8EAEE",   // page canvas
  white:    "#FFFFFF",
  bgAlt:    "#F7F8FA",   // table alt rows / input bg
  bgHov:    "#F1F3F6",   // row hover

  // Borders
  bdr:      "#DCE0E8",
  bdrM:     "#C4CAD4",

  // Text
  tx1:      "#0F1623",   // primary
  tx2:      "#4A5568",   // secondary
  tx3:      "#8896A8",   // muted
  tx4:      "#B8C4CE",   // disabled

  // Status
  ok:       "#166534",   okBg: "#DCFCE7",
  info:     "#1E40AF",   infoBg: "#DBEAFE",
  warn:     "#92400E",   warnBg: "#FEF3C7",
  err:      "#991B1B",   errBg:  "#FEE2E2",
};

// ─── Invoice-exact colors (inchangés) ────────────────────────────────────────
const C = {
  orange: "#DD5509", darkOrange: "#B8450A", black: "#1F2328",
  gray: "#6B7280", bgLight: "#FCF1E8", bgPale: "#FBF6F2", lineGray: "#E6E6E6",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmt         = (n) => Number(n || 0).toLocaleString("fr-FR");
const today       = () => new Date().toISOString().split("T")[0];
const fmtDate     = (d) => { if (!d) return ""; const [y,m,day]=d.split("-"); return `${day}/${m}/${y}`; };
const fmtDateDisp = (d) => { if (!d) return "—"; const [y,m,day]=d.split("-"); return `${day}/${m}/${y}`; };

function numberToWords(n) {
  const u=["","un","deux","trois","quatre","cinq","six","sept","huit","neuf","dix","onze","douze","treize","quatorze","quinze","seize","dix-sept","dix-huit","dix-neuf"];
  const t=["","","vingt","trente","quarante","cinquante","soixante","soixante","quatre-vingt","quatre-vingt"];
  if(n===0) return "zéro";
  if(n<0) return "moins "+numberToWords(-n);
  let r="";
  if(n>=1000000){r+=numberToWords(Math.floor(n/1000000))+" million ";n%=1000000;}
  if(n>=1000){r+=numberToWords(Math.floor(n/1000))+" mille ";n%=1000;}
  if(n>=100){r+=numberToWords(Math.floor(n/100))+" cent ";n%=100;}
  if(n>=20){const tv=Math.floor(n/10),uv=n%10;if(tv===7||tv===9)r+=t[tv]+(uv===1?"-et-":"-")+u[10+uv];else r+=t[tv]+(uv?(tv===8?"-":(uv===1?"-et-":"-"))+u[uv]:(tv===8?"s":""));}
  else if(n>0)r+=u[n];
  return r.trim();
}

// ─── Data models ─────────────────────────────────────────────────────────────
const EMPTY_ABO = {
  type:"abonnement", number:"FAC-CAMILLE-2026-001", date:today(),
  platform:"Camille", platformUrl:"camille.vps.buyticle.com",
  trialMonths:"2", trialStart:"", trialEnd:"", niu:"En cours",
  client:{name:"",address:"",phone:"",email:""}, statut:"Période d'essai",
};
const EMPTY_STD = {
  type:"standard", number:"FAC-2026-001", date:today(), dueDate:"",
  niu:"P070418499910G", client:{name:"",address:"",phone:"",email:""},
  items:[
    {description:"Développement de la plateforme SaaS « Eetra »",quantity:1,price:""},
    {description:"",quantity:1,price:""},
    {description:"",quantity:1,price:""},
  ],
  bankInfo:"",
};

// ══════════════════════════════════════════════════════════════════════════════
// INVOICE PREVIEWS — pixel-perfect, inchangés
// ══════════════════════════════════════════════════════════════════════════════
function MetaRow({ label, value, vs={} }) {
  return (
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",padding:"2px 0",fontSize:"8pt"}}>
      <span style={{color:C.gray}}>{label}</span>
      <span style={{color:C.black,...vs}}>{value}</span>
    </div>
  );
}

function PreviewAbonnement({ d }) {
  return (
    <div style={{fontFamily:"Arial,sans-serif",color:C.black,fontSize:"9pt",lineHeight:1.4,padding:"19mm",background:"#fff",width:"210mm",minHeight:"297mm",boxSizing:"border-box"}}>
      <table style={{width:"100%",borderCollapse:"collapse"}}><tbody><tr>
        <td style={{width:"36%",verticalAlign:"middle"}}>
          <img src="/logo-buyticle.png" alt="BUYTICLE" style={{height:"45px",maxWidth:"130px",objectFit:"contain"}}/>
        </td>
        <td style={{textAlign:"right",verticalAlign:"middle"}}>
          <div style={{fontWeight:"bold",fontSize:"13pt",color:C.black,marginBottom:2}}>BUYTICLE ETS</div>
          <div style={{fontStyle:"italic",fontSize:"8pt",color:C.gray,marginBottom:3}}>Entreprise Individuelle (ETS)</div>
          <div style={{fontSize:"9pt",color:C.black,marginBottom:1}}>Bonamoussadi, Douala — Cameroun</div>
          <div style={{fontSize:"9pt",color:C.black,marginBottom:1}}>Tél : (+237) 696 99 58 79</div>
          <div style={{fontSize:"8pt",color:C.gray,marginBottom:1}}>RCCM : CM-DLA-01-2025-A10-01482</div>
          <div style={{fontSize:"8pt",color:C.gray}}>NIU : {d.niu||"En cours"}</div>
        </td>
      </tr></tbody></table>
      <div style={{borderBottom:`3px solid ${C.orange}`,margin:"10px 0 14px"}}/>
      <div style={{fontWeight:"bold",fontSize:"23pt",color:C.orange,marginBottom:8}}>FACTURE D&apos;ABONNEMENT</div>
      <div style={{display:"inline-block",background:C.orange,color:"#fff",fontWeight:"bold",fontSize:"7.5pt",padding:"3px 10px",marginBottom:12}}>
        PÉRIODE D&apos;ESSAI · {d.trialMonths||"2"} MOIS
      </div>
      <div style={{fontSize:"9pt",color:C.gray,marginBottom:18}}>
        Plateforme émettrice :{" "}<span style={{fontWeight:"bold",color:C.black}}>{d.platform||"Camille"}</span>
        <span style={{color:C.gray}}>  ·  </span>
        <span style={{color:C.darkOrange,textDecoration:"underline"}}>{d.platformUrl||"camille.vps.buyticle.com"}</span>
      </div>
      <table style={{width:"100%",borderCollapse:"collapse",marginBottom:18}}><tbody><tr>
        <td style={{width:"51%",verticalAlign:"top",paddingRight:12}}>
          <div style={{fontWeight:"bold",fontSize:"8pt",color:C.orange,marginBottom:6}}>FACTURÉ À</div>
          <div style={{fontWeight:"bold",fontSize:"10pt",color:C.black,marginBottom:3}}>{d.client.name||"[ Nom / Raison sociale du client ]"}</div>
          <div style={{fontSize:"9.5pt",color:C.black,marginBottom:2}}>{d.client.address||"[ Adresse, Ville — Cameroun ]"}</div>
          <div style={{fontSize:"9.5pt",color:C.black,marginBottom:2}}>{d.client.phone||"[ Téléphone du client ]"}</div>
          <div style={{fontSize:"9.5pt",color:C.black}}>{d.client.email||"[ Email du client ]"}</div>
        </td>
        <td style={{width:"49%",verticalAlign:"top",background:C.bgLight,padding:"8px 10px"}}>
          <MetaRow label="N° de facture" value={d.number} vs={{fontWeight:"bold",color:C.darkOrange}}/>
          <MetaRow label="Date d'émission" value={fmtDate(d.date)||"[ JJ / MM / 2026 ]"}/>
          <MetaRow label="Type de document" value="Facture d'abonnement"/>
          <MetaRow label="Statut" value={d.statut||"Période d'essai"}/>
        </td>
      </tr></tbody></table>
      <table style={{width:"100%",borderCollapse:"collapse",marginBottom:8}}>
        <thead><tr style={{background:C.orange}}>
          <th style={{textAlign:"left",padding:"6px 8px",color:"#fff",fontSize:"8pt",fontWeight:"bold",width:"54%"}}>DÉSIGNATION</th>
          <th style={{textAlign:"center",padding:"6px 8px",color:"#fff",fontSize:"8pt",fontWeight:"bold",width:"10%"}}>QTÉ</th>
          <th style={{textAlign:"right",padding:"6px 8px",color:"#fff",fontSize:"8pt",fontWeight:"bold",width:"18%"}}>PRIX UNITAIRE</th>
          <th style={{textAlign:"right",padding:"6px 8px",color:"#fff",fontSize:"8pt",fontWeight:"bold",width:"18%"}}>MONTANT</th>
        </tr></thead>
        <tbody><tr>
          <td style={{padding:"7px 8px",borderTop:`1px solid ${C.lineGray}`,borderBottom:`1px solid ${C.lineGray}`,verticalAlign:"top"}}>
            <div style={{fontWeight:"bold",fontSize:"9pt",color:C.black,marginBottom:2}}>Abonnement Plateforme « {d.platform||"Camille"} » — Forfait Entreprise</div>
            <div style={{fontStyle:"italic",fontSize:"8pt",color:C.gray,marginBottom:2}}>Période d&apos;essai de {d.trialMonths||"2"} mois incluse.</div>
            <div style={{fontSize:"8pt",color:C.darkOrange}}>
              Validité de l&apos;essai : {d.trialStart&&d.trialEnd?`Du ${fmtDate(d.trialStart)} au ${fmtDate(d.trialEnd)}`:"[ Du JJ/MM/2026 au JJ/MM/2026 ]"}
            </div>
          </td>
          <td style={{textAlign:"center",padding:"7px 8px",borderTop:`1px solid ${C.lineGray}`,borderBottom:`1px solid ${C.lineGray}`,fontSize:"9pt",verticalAlign:"middle"}}>1</td>
          <td style={{textAlign:"right",padding:"7px 8px",borderTop:`1px solid ${C.lineGray}`,borderBottom:`1px solid ${C.lineGray}`,fontSize:"9pt",verticalAlign:"middle"}}>0 FCFA</td>
          <td style={{textAlign:"right",padding:"7px 8px",borderTop:`1px solid ${C.lineGray}`,borderBottom:`1px solid ${C.lineGray}`,fontSize:"9pt",verticalAlign:"middle"}}>0 FCFA</td>
        </tr></tbody>
      </table>
      <div style={{display:"flex",justifyContent:"flex-end",marginBottom:4}}>
        <table style={{borderCollapse:"collapse",width:"240px"}}><tbody>
          <tr><td style={{padding:"4px 8px",fontSize:"9pt",color:C.black}}>Sous-total</td><td style={{padding:"4px 8px",textAlign:"right",fontSize:"9pt",color:C.black}}>0 FCFA</td></tr>
          <tr><td style={{padding:"4px 8px",fontSize:"9pt",color:C.gray}}>TVA</td><td style={{padding:"4px 8px",textAlign:"right",fontSize:"9pt",color:C.gray}}>Non applicable</td></tr>
          <tr style={{background:C.orange}}>
            <td style={{padding:"6px 8px",fontSize:"9.5pt",fontWeight:"bold",color:"#fff"}}>NET À PAYER (ESSAI)</td>
            <td style={{padding:"6px 8px",textAlign:"right",fontSize:"9.5pt",fontWeight:"bold",color:"#fff"}}>0 FCFA</td>
          </tr>
        </tbody></table>
      </div>
      <div style={{textAlign:"right",fontStyle:"italic",fontSize:"7.5pt",color:C.gray,marginBottom:14}}>TVA non applicable — régime simplifié d&apos;imposition.</div>
      <div style={{borderLeft:`3px solid ${C.orange}`,background:C.bgLight,padding:"10px 12px",marginBottom:12}}>
        <div style={{fontWeight:"bold",fontSize:"9.5pt",color:C.darkOrange,marginBottom:6}}>Note relative au Forfait Entreprise</div>
        <div style={{fontSize:"9pt",color:C.black}}>
          Conformément à nos conditions générales, cet abonnement bénéficie d&apos;une période d&apos;essai gratuite de {d.trialMonths||"2"} mois. À l&apos;échéance de cette période (le{" "}
          <span style={{fontWeight:"bold",color:C.darkOrange}}>{d.trialEnd?fmtDate(d.trialEnd):"[ Date de fin de l'essai ]"}</span>
          ), la tarification finale sera appliquée sur la base du devis personnalisé qui sera évalué et validé conjointement en fonction de votre volume d&apos;utilisation et de vos besoins d&apos;intégration.
        </div>
      </div>
      <div style={{borderLeft:`3px solid ${C.gray}`,background:C.bgPale,padding:"8px 12px",marginBottom:16}}>
        <span style={{fontSize:"9pt",color:C.black}}>Facture arrêtée à la somme de </span>
        <span style={{fontWeight:"bold",fontSize:"9pt",color:C.black}}>zéro Franc CFA</span>
        <span style={{fontSize:"9pt",color:C.black}}> au titre de la période d&apos;essai.</span>
      </div>
      <div style={{fontWeight:"bold",fontSize:"8pt",color:C.orange,marginBottom:4}}>MODALITÉS DE PAIEMENT</div>
      <div style={{fontSize:"9pt",color:C.black,marginBottom:3}}>Aucun paiement n&apos;est requis durant la période d&apos;essai.</div>
      <div style={{fontSize:"9pt",color:C.black,marginBottom:3}}>
        <span style={{fontWeight:"bold"}}>À l&apos;issue de l&apos;essai : </span>
        Mobile Money (Orange Money / MTN MoMo) au (+237) 696 99 58 79 ou virement bancaire, selon le devis validé.
      </div>
      <div style={{fontStyle:"italic",fontSize:"8pt",color:C.gray,marginBottom:18}}>Merci de conserver ce document : il atteste de votre souscription et des conditions de l&apos;essai.</div>
      <div style={{borderTop:`2px solid ${C.lineGray}`,paddingTop:8,textAlign:"center"}}>
        <span style={{fontWeight:"bold",fontSize:"10pt",color:C.orange}}>Merci pour votre confiance.</span>
        <span style={{fontSize:"9pt",color:C.black}}>  L&apos;équipe de {d.platform||"Camille"} vous souhaite une excellente prise en main de nos agents IA !</span>
      </div>
      <div style={{borderTop:`1px solid ${C.lineGray}`,marginTop:16,paddingTop:4,textAlign:"center",fontSize:"6.5pt",color:C.gray}}>
        <div>BUYTICLE ETS  —  Plateforme {d.platform||"Camille"} · {d.platformUrl||"camille.vps.buyticle.com"}</div>
        <div>Bonamoussadi, Douala — Cameroun  ·  Tél : (+237) 696 99 58 79  ·  RCCM : CM-DLA-01-2025-A10-01482</div>
      </div>
    </div>
  );
}

function PreviewStandard({ d }) {
  const items = d.items||[];
  const subtotal = items.reduce((s,it)=>s+(it.quantity||1)*Number(it.price||0),0);
  const tl = numberToWords(Math.round(subtotal))+" franc"+(subtotal>1?"s":"")+" CFA";
  return (
    <div style={{fontFamily:"Arial,sans-serif",color:C.black,fontSize:"9pt",lineHeight:1.4,padding:"19mm",background:"#fff",width:"210mm",minHeight:"297mm",boxSizing:"border-box"}}>
      <table style={{width:"100%",borderCollapse:"collapse"}}><tbody><tr>
        <td style={{width:"36%",verticalAlign:"middle"}}>
          <img src="/logo-buyticle.png" alt="BUYTICLE" style={{height:"45px",maxWidth:"130px",objectFit:"contain"}}/>
        </td>
        <td style={{textAlign:"right",verticalAlign:"middle"}}>
          <div style={{fontWeight:"bold",fontSize:"13pt",color:C.black,marginBottom:2}}>BUYTICLE ETS</div>
          <div style={{fontStyle:"italic",fontSize:"8pt",color:C.gray,marginBottom:3}}>Entreprise Individuelle (ETS)</div>
          <div style={{fontSize:"9pt",color:C.black,marginBottom:1}}>Bonamoussadi, Douala — Cameroun</div>
          <div style={{fontSize:"9pt",color:C.black,marginBottom:1}}>Tél : (+237) 696 99 58 79</div>
          <div style={{fontSize:"8pt",color:C.gray,marginBottom:1}}>RCCM : CM-DLA-01-2025-A10-01482</div>
          <div style={{fontSize:"8pt",color:C.gray}}>NIU : {d.niu||"P070418499910G"}</div>
        </td>
      </tr></tbody></table>
      <div style={{borderBottom:`3px solid ${C.orange}`,margin:"10px 0 14px"}}/>
      <div style={{fontWeight:"bold",fontSize:"26pt",color:C.orange,marginBottom:16}}>FACTURE</div>
      <table style={{width:"100%",borderCollapse:"collapse",marginBottom:18}}><tbody><tr>
        <td style={{width:"51%",verticalAlign:"top",paddingRight:12}}>
          <div style={{fontWeight:"bold",fontSize:"8pt",color:C.orange,marginBottom:6}}>FACTURÉ À</div>
          <div style={{fontWeight:"bold",fontSize:"10pt",color:C.black,marginBottom:3}}>{d.client.name||"[ Nom / Raison sociale du client ]"}</div>
          <div style={{fontSize:"9.5pt",color:C.black,marginBottom:2}}>{d.client.address||"[ Ville, Cameroun ]"}</div>
          <div style={{fontSize:"9.5pt",color:C.black}}>{d.client.phone||d.client.email?[d.client.phone,d.client.email].filter(Boolean).join(" / "):"[ Téléphone / Email du client ]"}</div>
        </td>
        <td style={{width:"49%",verticalAlign:"top",background:C.bgLight,padding:"8px 10px"}}>
          <MetaRow label="N° de facture" value={d.number} vs={{fontWeight:"bold",color:C.darkOrange}}/>
          <MetaRow label="Date d'émission" value={fmtDate(d.date)||"[ JJ / MM / 2026 ]"}/>
          <MetaRow label="Échéance de paiement" value={d.dueDate?fmtDate(d.dueDate):"[ JJ / MM / 2026 ]"}/>
        </td>
      </tr></tbody></table>
      <table style={{width:"100%",borderCollapse:"collapse",marginBottom:8}}>
        <thead><tr style={{background:C.orange}}>
          <th style={{textAlign:"left",padding:"6px 8px",color:"#fff",fontSize:"8pt",fontWeight:"bold",width:"56%"}}>DÉSIGNATION</th>
          <th style={{textAlign:"center",padding:"6px 8px",color:"#fff",fontSize:"8pt",fontWeight:"bold",width:"9%"}}>QTÉ</th>
          <th style={{textAlign:"right",padding:"6px 8px",color:"#fff",fontSize:"8pt",fontWeight:"bold",width:"20%"}}>PRIX UNITAIRE</th>
          <th style={{textAlign:"right",padding:"6px 8px",color:"#fff",fontSize:"8pt",fontWeight:"bold",width:"15%"}}>MONTANT</th>
        </tr></thead>
        <tbody>
          {items.map((it,i)=>(
            <tr key={i} style={{background:i%2===1?C.bgPale:"#fff"}}>
              <td style={{padding:"6px 8px",borderTop:`1px solid ${C.lineGray}`,borderBottom:`1px solid ${C.lineGray}`,fontSize:"9pt",color:C.black}}>{it.description||"[ Désignation du service / produit ]"}</td>
              <td style={{textAlign:"center",padding:"6px 8px",borderTop:`1px solid ${C.lineGray}`,borderBottom:`1px solid ${C.lineGray}`,fontSize:"9pt"}}>{it.quantity||"[ 1 ]"}</td>
              <td style={{textAlign:"right",padding:"6px 8px",borderTop:`1px solid ${C.lineGray}`,borderBottom:`1px solid ${C.lineGray}`,fontSize:"9pt"}}>{it.price!==""&&it.price!==undefined?fmt(it.price)+" FCFA":"[ Montant ]"}</td>
              <td style={{textAlign:"right",padding:"6px 8px",borderTop:`1px solid ${C.lineGray}`,borderBottom:`1px solid ${C.lineGray}`,fontSize:"9pt"}}>{it.price!==""&&it.price!==undefined?fmt((it.quantity||1)*Number(it.price))+" FCFA":"[ Montant ]"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{display:"flex",justifyContent:"flex-end",marginBottom:4}}>
        <table style={{borderCollapse:"collapse",width:"240px"}}><tbody>
          <tr><td style={{padding:"4px 8px",fontSize:"9pt",color:C.black}}>Sous-total</td><td style={{padding:"4px 8px",textAlign:"right",fontSize:"9pt",color:C.black}}>{fmt(subtotal)} FCFA</td></tr>
          <tr><td style={{padding:"4px 8px",fontSize:"9pt",color:C.gray}}>TVA</td><td style={{padding:"4px 8px",textAlign:"right",fontSize:"9pt",color:C.gray}}>Non applicable</td></tr>
          <tr style={{background:C.orange}}>
            <td style={{padding:"6px 8px",fontSize:"10pt",fontWeight:"bold",color:"#fff"}}>TOTAL NET À PAYER</td>
            <td style={{padding:"6px 8px",textAlign:"right",fontSize:"10pt",fontWeight:"bold",color:"#fff"}}>{fmt(subtotal)} FCFA</td>
          </tr>
        </tbody></table>
      </div>
      <div style={{textAlign:"right",fontStyle:"italic",fontSize:"7.5pt",color:C.gray,marginBottom:14}}>TVA non applicable — régime simplifié d&apos;imposition.</div>
      <div style={{borderLeft:`3px solid ${C.orange}`,background:C.bgLight,padding:"8px 12px",marginBottom:16}}>
        <span style={{fontSize:"9pt",color:C.black}}>Facture arrêtée à la somme de </span>
        <span style={{fontWeight:"bold",fontSize:"9pt",color:C.darkOrange}}>{tl}</span>
        <span style={{fontSize:"9pt",color:C.black}}>.</span>
      </div>
      <div style={{fontWeight:"bold",fontSize:"8pt",color:C.orange,marginBottom:4}}>MODALITÉS DE PAIEMENT</div>
      <div style={{fontSize:"9pt",color:C.black,marginBottom:3}}><span style={{fontWeight:"bold"}}>Mobile Money</span> (Orange Money / MTN MoMo) au (+237) 696 99 58 79</div>
      <div style={{fontSize:"9pt",color:C.black,marginBottom:3}}><span style={{fontWeight:"bold"}}>Virement bancaire</span> : {d.bankInfo||"[ Banque / IBAN / Titulaire du compte ]"}</div>
      <div style={{fontStyle:"italic",fontSize:"8pt",color:C.gray,marginBottom:18}}>Paiement attendu au plus tard à la date d&apos;échéance indiquée ci-dessus. Merci de mentionner le numéro de facture lors du règlement.</div>
      <div style={{borderTop:`2px solid ${C.lineGray}`,paddingTop:8,textAlign:"center"}}>
        <span style={{fontWeight:"bold",fontSize:"11pt",color:C.orange}}>Merci pour votre confiance !</span>
      </div>
      <div style={{borderTop:`1px solid ${C.lineGray}`,marginTop:16,paddingTop:4,textAlign:"center",fontSize:"6.5pt",color:C.gray}}>
        <div>BUYTICLE ETS  —  Conseil et activités informatiques · Prestation de services · Commerce général</div>
        <div>Bonamoussadi, Douala — Cameroun  ·  Tél : (+237) 696 99 58 79  ·  RCCM : CM-DLA-01-2025-A10-01482</div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// UI ATOMS
// ══════════════════════════════════════════════════════════════════════════════

// Pill badge
function Badge({ type }) {
  const map = {
    abonnement: { bg: D.brandL,  color: D.brand, label: "Abonnement" },
    standard:   { bg: D.infoBg,  color: D.info,  label: "Standard"   },
  };
  const s = map[type] || map.standard;
  return (
    <span style={{
      display: "inline-block",
      background: s.bg, color: s.color,
      fontSize: 11, fontWeight: 600,
      padding: "2px 9px", borderRadius: 99,
      border: `1px solid ${s.color}22`,
      letterSpacing: "0.02em",
    }}>{s.label}</span>
  );
}

// Metric tile (Microsoft Business Central style)
function MetricTile({ label, value, sub, accentColor, icon: Icon }) {
  return (
    <div style={{
      background: D.white,
      border: `1px solid ${D.bdr}`,
      borderLeft: `4px solid ${accentColor}`,
      borderRadius: 6,
      padding: "14px 18px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    }}>
      <div>
        <p style={{ fontSize: 11, fontWeight: 500, color: D.tx3, margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</p>
        <p style={{ fontSize: 22, fontWeight: 700, color: D.tx1, margin: 0, lineHeight: 1 }}>{value}</p>
        {sub && <p style={{ fontSize: 11, color: D.tx3, margin: "4px 0 0" }}>{sub}</p>}
      </div>
      <div style={{ width: 36, height: 36, borderRadius: 6, background: accentColor + "18", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon size={17} color={accentColor} />
      </div>
    </div>
  );
}

// Input field
function Field({ label, value, onChange, type="text", placeholder="", full=false }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, gridColumn: full ? "1/-1" : undefined }}>
      <label style={{ fontSize: 12, fontWeight: 500, color: D.tx2 }}>{label}</label>
      <input
        type={type}
        value={value ?? ""}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          height: 34,
          padding: "0 10px",
          border: `1px solid ${D.bdrM}`,
          borderRadius: 4,
          fontSize: 13,
          color: D.tx1,
          background: D.white,
          outline: "none",
          boxSizing: "border-box",
          width: "100%",
        }}
        onFocus={e => {
          e.target.style.borderColor = D.brand;
          e.target.style.boxShadow = `0 0 0 3px ${D.brand}22`;
        }}
        onBlur={e => {
          e.target.style.borderColor = D.bdrM;
          e.target.style.boxShadow = "none";
        }}
      />
    </div>
  );
}

// Section card for forms
function SectionCard({ title, icon: Icon, children }) {
  return (
    <div style={{ background: D.white, border: `1px solid ${D.bdr}`, borderRadius: 6, overflow: "hidden", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>
      <div style={{ padding: "10px 16px", background: D.bgAlt, borderBottom: `1px solid ${D.bdr}`, display: "flex", alignItems: "center", gap: 8 }}>
        <Icon size={14} color={D.brand} />
        <span style={{ fontSize: 12, fontWeight: 600, color: D.tx2, textTransform: "uppercase", letterSpacing: "0.07em" }}>{title}</span>
      </div>
      <div style={{ padding: "16px" }}>{children}</div>
    </div>
  );
}

// Btn primary
function BtnPrimary({ children, onClick, icon: Icon, small }) {
  const h = small ? 30 : 34;
  const fs = small ? 12 : 13;
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 6,
      height: h, padding: `0 ${small?12:16}px`,
      background: D.brand, color: "#fff",
      border: "none", borderRadius: 4,
      fontSize: fs, fontWeight: 600,
      cursor: "pointer", whiteSpace: "nowrap",
      boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
    }}
      onMouseEnter={e => e.currentTarget.style.background = D.brandD}
      onMouseLeave={e => e.currentTarget.style.background = D.brand}
    >
      {Icon && <Icon size={small ? 13 : 14} />}{children}
    </button>
  );
}

// Btn secondary
function BtnSecondary({ children, onClick, icon: Icon }) {
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 6,
      height: 34, padding: "0 14px",
      background: D.white, color: D.tx2,
      border: `1px solid ${D.bdrM}`, borderRadius: 4,
      fontSize: 13, fontWeight: 500,
      cursor: "pointer", whiteSpace: "nowrap",
    }}
      onMouseEnter={e => e.currentTarget.style.background = D.bgAlt}
      onMouseLeave={e => e.currentTarget.style.background = D.white}
    >
      {Icon && <Icon size={14} />}{children}
    </button>
  );
}

// Icon action button
function IconBtn({ icon: Icon, onClick, title, hoverColor = D.brand, hoverBg = D.brandL }) {
  return (
    <button onClick={onClick} title={title} style={{
      width: 28, height: 28, border: `1px solid ${D.bdr}`,
      borderRadius: 4, background: D.white, cursor: "pointer",
      display: "flex", alignItems: "center", justifyContent: "center",
      color: D.tx3,
    }}
      onMouseEnter={e => { e.currentTarget.style.background = hoverBg; e.currentTarget.style.color = hoverColor; e.currentTarget.style.borderColor = hoverColor + "55"; }}
      onMouseLeave={e => { e.currentTarget.style.background = D.white; e.currentTarget.style.color = D.tx3; e.currentTarget.style.borderColor = D.bdr; }}
    >
      <Icon size={13} />
    </button>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// FORMS
// ══════════════════════════════════════════════════════════════════════════════
function FormAbonnement({ d, set }) {
  const up = (f, v) => set(p => ({ ...p, [f]: v }));
  const uc = (f, v) => set(p => ({ ...p, client: { ...p.client, [f]: v } }));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <SectionCard title="Informations de la facture" icon={Hash}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="N° de facture" value={d.number} onChange={v => up("number", v)} />
          <Field label="Date d'émission" type="date" value={d.date} onChange={v => up("date", v)} />
          <Field label="Plateforme" value={d.platform} onChange={v => up("platform", v)} />
          <Field label="URL plateforme" value={d.platformUrl} onChange={v => up("platformUrl", v)} />
          <Field label="Durée d'essai (mois)" type="number" value={d.trialMonths} onChange={v => up("trialMonths", v)} />
          <Field label="NIU" value={d.niu} onChange={v => up("niu", v)} />
          <Field label="Début de l'essai" type="date" value={d.trialStart} onChange={v => up("trialStart", v)} />
          <Field label="Fin de l'essai" type="date" value={d.trialEnd} onChange={v => up("trialEnd", v)} />
          <Field label="Statut" value={d.statut} onChange={v => up("statut", v)} />
        </div>
      </SectionCard>
      <SectionCard title="Informations client" icon={User}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Nom / Raison sociale" value={d.client.name} onChange={v => uc("name", v)} />
          <Field label="Adresse" value={d.client.address} onChange={v => uc("address", v)} />
          <Field label="Téléphone" value={d.client.phone} onChange={v => uc("phone", v)} />
          <Field label="Email" type="email" value={d.client.email} onChange={v => uc("email", v)} />
        </div>
      </SectionCard>
    </div>
  );
}

function FormStandard({ d, set }) {
  const up = (f, v) => set(p => ({ ...p, [f]: v }));
  const uc = (f, v) => set(p => ({ ...p, client: { ...p.client, [f]: v } }));
  const ui = (i, f, v) => set(p => { const it = [...p.items]; it[i] = { ...it[i], [f]: v }; return { ...p, items: it }; });
  const addItem = () => set(p => ({ ...p, items: [...p.items, { description: "", quantity: 1, price: "" }] }));
  const rmItem  = (i) => set(p => ({ ...p, items: p.items.filter((_, idx) => idx !== i) }));
  const subtotal = d.items.reduce((s, it) => s + (it.quantity || 1) * Number(it.price || 0), 0);

  const inputBase = {
    height: 32, padding: "0 8px",
    border: `1px solid ${D.bdrM}`, borderRadius: 3,
    fontSize: 12, color: D.tx1, background: D.white,
    outline: "none", width: "100%", boxSizing: "border-box",
  };
  const onF = e => { e.target.style.borderColor = D.brand; e.target.style.boxShadow = `0 0 0 3px ${D.brand}18`; };
  const onB = e => { e.target.style.borderColor = D.bdrM;  e.target.style.boxShadow = "none"; };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <SectionCard title="Informations de la facture" icon={Hash}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="N° de facture" value={d.number} onChange={v => up("number", v)} />
          <Field label="NIU" value={d.niu} onChange={v => up("niu", v)} />
          <Field label="Date d'émission" type="date" value={d.date} onChange={v => up("date", v)} />
          <Field label="Échéance de paiement" type="date" value={d.dueDate} onChange={v => up("dueDate", v)} />
          <Field label="Infos virement bancaire" value={d.bankInfo} onChange={v => up("bankInfo", v)} full placeholder="Banque / IBAN / Titulaire du compte" />
        </div>
      </SectionCard>
      <SectionCard title="Informations client" icon={User}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Nom / Raison sociale" value={d.client.name} onChange={v => uc("name", v)} />
          <Field label="Adresse / Ville" value={d.client.address} onChange={v => uc("address", v)} />
          <Field label="Téléphone" value={d.client.phone} onChange={v => uc("phone", v)} />
          <Field label="Email" type="email" value={d.client.email} onChange={v => uc("email", v)} />
        </div>
      </SectionCard>
      <SectionCard title="Articles & Prestations" icon={Layers}>
        {/* Grid header */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 64px 120px 28px", gap: 6, padding: "0 2px 4px", borderBottom: `1px solid ${D.bdr}`, marginBottom: 6 }}>
          {["Désignation", "Qté", "Prix unit. (FCFA)", ""].map((h, i) => (
            <span key={i} style={{ fontSize: 11, fontWeight: 600, color: D.tx3, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</span>
          ))}
        </div>
        {d.items.map((it, i) => (
          <div key={i} style={{
            display: "grid", gridTemplateColumns: "1fr 64px 120px 28px",
            gap: 6, padding: "4px 0",
            background: i % 2 === 1 ? D.bgAlt : "transparent",
          }}>
            <input
              value={it.description} onChange={e => ui(i, "description", e.target.value)}
              placeholder="Désignation du service / produit"
              style={inputBase} onFocus={onF} onBlur={onB}
            />
            <input
              type="number" min="1" value={it.quantity}
              onChange={e => ui(i, "quantity", parseFloat(e.target.value) || 1)}
              style={{ ...inputBase, textAlign: "center" }} onFocus={onF} onBlur={onB}
            />
            <input
              type="number" min="0" value={it.price} placeholder="0"
              onChange={e => ui(i, "price", e.target.value)}
              style={{ ...inputBase, textAlign: "right" }} onFocus={onF} onBlur={onB}
            />
            <button onClick={() => rmItem(i)} style={{
              width: 28, height: 32, border: `1px solid ${D.bdr}`,
              borderRadius: 3, background: "transparent", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: D.tx4,
            }}
              onMouseEnter={e => { e.currentTarget.style.background = D.errBg; e.currentTarget.style.color = "#DC2626"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = D.tx4; }}
            ><X size={13} /></button>
          </div>
        ))}
        <button onClick={addItem} style={{
          display: "flex", alignItems: "center", gap: 5,
          marginTop: 8, padding: "5px 10px",
          border: `1px dashed ${D.bdrM}`, borderRadius: 4,
          background: "transparent", cursor: "pointer",
          fontSize: 12, color: D.tx3, fontWeight: 500,
        }}>
          <Plus size={12} /> Ajouter une ligne
        </button>
        {/* Sub-total bar */}
        <div style={{
          marginTop: 12, padding: "10px 14px",
          background: D.brandXL, border: `1px solid ${D.brand}33`,
          borderRadius: 4,
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <span style={{ fontSize: 12, fontWeight: 500, color: D.tx2 }}>Total estimé (HT)</span>
          <span style={{ fontSize: 18, fontWeight: 700, color: D.brand, fontVariantNumeric: "tabular-nums" }}>
            {fmt(subtotal)} <span style={{ fontSize: 12, fontWeight: 500 }}>FCFA</span>
          </span>
        </div>
      </SectionCard>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// DATA TABLE
// ══════════════════════════════════════════════════════════════════════════════
function InvoiceTable({ invoices, allInvoices, onView, onEdit, onDelete }) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
      <thead>
        <tr style={{ background: D.bgAlt, borderBottom: `2px solid ${D.bdr}` }}>
          {["N° FACTURE", "CLIENT", "TYPE", "DATE", "MONTANT", "ACTIONS"].map((h, i) => (
            <th key={i} style={{
              padding: "9px 14px",
              textAlign: i >= 4 ? "right" : "left",
              fontSize: 11, fontWeight: 600, color: D.tx3,
              textTransform: "uppercase", letterSpacing: "0.07em",
              whiteSpace: "nowrap",
            }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {invoices.map((inv, i) => {
          const realIdx = allInvoices.indexOf(inv);
          const amt = inv.type === "standard"
            ? (inv.items || []).reduce((s, it) => s + (it.quantity || 1) * Number(it.price || 0), 0)
            : 0;
          return (
            <tr
              key={i}
              style={{ borderBottom: `1px solid ${D.bdr}`, transition: "background 0.1s" }}
              onMouseEnter={e => e.currentTarget.style.background = D.bgHov}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <td style={{ padding: "10px 14px" }}>
                <span style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 700, color: D.brand }}>
                  {inv.number}
                </span>
              </td>
              <td style={{ padding: "10px 14px" }}>
                <span style={{ color: inv.client?.name ? D.tx1 : D.tx4, fontStyle: inv.client?.name ? "normal" : "italic" }}>
                  {inv.client?.name || "—"}
                </span>
              </td>
              <td style={{ padding: "10px 14px" }}>
                <Badge type={inv.type} />
              </td>
              <td style={{ padding: "10px 14px", color: D.tx2, whiteSpace: "nowrap" }}>
                {fmtDateDisp(inv.date)}
              </td>
              <td style={{ padding: "10px 14px", textAlign: "right" }}>
                {inv.type === "standard"
                  ? <span style={{ fontWeight: 700, color: D.tx1, fontVariantNumeric: "tabular-nums" }}>
                      {fmt(amt)} <span style={{ fontSize: 11, fontWeight: 400, color: D.tx3 }}>FCFA</span>
                    </span>
                  : <span style={{ fontSize: 11, color: D.tx3, fontStyle: "italic" }}>Essai gratuit</span>
                }
              </td>
              <td style={{ padding: "10px 14px", textAlign: "right" }}>
                <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                  <IconBtn icon={Eye}   onClick={() => onView(realIdx)} title="Aperçu" />
                  <IconBtn icon={Edit2} onClick={() => onEdit(realIdx)} title="Modifier" hoverColor={D.info} hoverBg={D.infoBg} />
                  <IconBtn icon={Trash2} onClick={e => { e.stopPropagation(); onDelete(realIdx); }} title="Supprimer" hoverColor="#DC2626" hoverBg="#FEE2E2" />
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// VIEW: DASHBOARD
// ══════════════════════════════════════════════════════════════════════════════
function DashboardView({ invoices, onNew, onView, onEdit, onDelete }) {
  const total    = invoices.length;
  const revenue  = invoices.filter(i => i.type === "standard").reduce((s, inv) => s + (inv.items || []).reduce((ss, it) => ss + (it.quantity || 1) * Number(it.price || 0), 0), 0);
  const aboCount = invoices.filter(i => i.type === "abonnement").length;
  const stdCount = invoices.filter(i => i.type === "standard").length;
  const recent   = [...invoices].reverse().slice(0, 6);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Page header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: D.tx1, margin: 0 }}>Vue d&apos;ensemble</h1>
          <p style={{ fontSize: 13, color: D.tx3, margin: "4px 0 0" }}>
            Activité de facturation — BUYTICLE ETS
          </p>
        </div>
        <BtnPrimary onClick={onNew} icon={Plus}>Nouvelle facture</BtnPrimary>
      </div>

      {/* Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        <MetricTile icon={FileText}   label="Total factures"      value={total}                   accentColor={D.brand}   sub={`${total} document${total > 1 ? "s" : ""}`} />
        <MetricTile icon={DollarSign} label="Revenus (standard)"  value={`${fmt(revenue)} FCFA`}  accentColor="#0A8F4A"   sub={`${stdCount} facture${stdCount > 1 ? "s" : ""}`} />
        <MetricTile icon={Zap}        label="Abonnements essai"   value={aboCount}                 accentColor="#B45309"   sub="Périodes d'essai actives" />
        <MetricTile icon={BarChart2}  label="Factures standard"   value={stdCount}                 accentColor={D.info}    sub="Prestations facturées" />
      </div>

      {/* Recent invoices */}
      <div style={{ background: D.white, border: `1px solid ${D.bdr}`, borderRadius: 6, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
        {/* Table command bar */}
        <div style={{
          padding: "10px 14px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          borderBottom: `1px solid ${D.bdr}`,
          background: D.bgAlt,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <FileText size={14} color={D.brand} />
            <span style={{ fontSize: 13, fontWeight: 600, color: D.tx1 }}>Factures récentes</span>
            <span style={{
              fontSize: 11, background: D.brandL, color: D.brand,
              padding: "1px 7px", borderRadius: 99, fontWeight: 600,
            }}>{total}</span>
          </div>
          {total > 0 && (
            <button style={{
              fontSize: 12, color: D.brand, background: "none", border: "none",
              cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontWeight: 500,
            }}>Voir tout <ChevronRight size={12} /></button>
          )}
        </div>

        {recent.length === 0 ? (
          <div style={{ padding: "48px 20px", textAlign: "center" }}>
            <div style={{
              width: 48, height: 48, borderRadius: 8,
              background: D.bgAlt, border: `1px solid ${D.bdr}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 14px",
            }}>
              <FileText size={20} color={D.tx4} />
            </div>
            <p style={{ fontSize: 14, color: D.tx2, fontWeight: 500, margin: "0 0 4px" }}>Aucune facture</p>
            <p style={{ fontSize: 12, color: D.tx3, margin: "0 0 16px" }}>Créez votre première facture pour commencer.</p>
            <BtnPrimary onClick={onNew} icon={Plus} small>Créer une facture</BtnPrimary>
          </div>
        ) : (
          <InvoiceTable invoices={recent} allInvoices={invoices} onView={onView} onEdit={onEdit} onDelete={onDelete} />
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// VIEW: INVOICES LIST
// ══════════════════════════════════════════════════════════════════════════════
function InvoicesView({ invoices, filtered, search, setSearch, filterType, setFilter, onNew, onView, onEdit, onDelete }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Page header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: D.tx1, margin: 0 }}>Factures</h1>
          <p style={{ fontSize: 13, color: D.tx3, margin: "4px 0 0" }}>
            {invoices.length} document{invoices.length > 1 ? "s" : ""} au total
          </p>
        </div>
        <BtnPrimary onClick={onNew} icon={Plus}>Nouvelle facture</BtnPrimary>
      </div>

      {/* Data card */}
      <div style={{ background: D.white, border: `1px solid ${D.bdr}`, borderRadius: 6, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>

        {/* Command bar */}
        <div style={{
          padding: "10px 14px",
          background: D.bgAlt, borderBottom: `1px solid ${D.bdr}`,
          display: "flex", alignItems: "center", gap: 10,
        }}>
          {/* Search */}
          <div style={{ position: "relative", flex: "0 0 260px" }}>
            <Search size={13} style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: D.tx3, pointerEvents: "none" }} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher client, numéro…"
              style={{
                width: "100%", height: 30, padding: "0 10px 0 30px",
                border: `1px solid ${D.bdrM}`, borderRadius: 4,
                fontSize: 12, color: D.tx1, background: D.white,
                outline: "none", boxSizing: "border-box",
              }}
              onFocus={e => { e.target.style.borderColor = D.brand; e.target.style.boxShadow = `0 0 0 3px ${D.brand}18`; }}
              onBlur={e => { e.target.style.borderColor = D.bdrM; e.target.style.boxShadow = "none"; }}
            />
          </div>

          {/* Separator */}
          <div style={{ width: 1, height: 20, background: D.bdr }} />

          {/* Type filters */}
          <div style={{ display: "flex", gap: 2 }}>
            {[["all", "Tous"], ["abonnement", "Abonnement"], ["standard", "Standard"]].map(([v, l]) => (
              <button key={v} onClick={() => setFilter(v)} style={{
                height: 28, padding: "0 10px",
                border: `1px solid ${filterType === v ? D.brand : D.bdrM}`,
                borderRadius: 4,
                background: filterType === v ? D.brandL : D.white,
                color: filterType === v ? D.brand : D.tx2,
                fontSize: 12, fontWeight: filterType === v ? 600 : 400,
                cursor: "pointer",
              }}>{l}</button>
            ))}
          </div>

          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 12, color: D.tx3 }}>
            {filtered.length} résultat{filtered.length > 1 ? "s" : ""}
          </span>
        </div>

        {/* Table or empty */}
        {filtered.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center" }}>
            <p style={{ fontSize: 14, color: D.tx2, margin: "0 0 4px", fontWeight: 500 }}>Aucune facture trouvée</p>
            <p style={{ fontSize: 12, color: D.tx3, margin: 0 }}>Modifiez vos critères de recherche ou créez une nouvelle facture.</p>
          </div>
        ) : (
          <InvoiceTable invoices={filtered} allInvoices={invoices} onView={onView} onEdit={onEdit} onDelete={onDelete} />
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN APP
// ══════════════════════════════════════════════════════════════════════════════
const NAV_ITEMS = [
  { id: "dashboard", label: "Tableau de bord", icon: LayoutDashboard, group: "PRINCIPAL" },
  { id: "invoices",  label: "Factures",         icon: FileText,         group: "GESTION" },
  { id: "new",       label: "Nouvelle facture", icon: Plus,             group: "GESTION" },
];

export default function BuyFacturation() {
  const [view,       setView]       = useState("dashboard");
  const [invoices,   setInvoices]   = useState([]);
  const [editIdx,    setEditIdx]    = useState(null);
  const [formType,   setFormType]   = useState("abonnement");
  const [dataAbo,    setDataAbo]    = useState({ ...EMPTY_ABO });
  const [dataStd,    setDataStd]    = useState({ ...EMPTY_STD });
  const [search,     setSearch]     = useState("");
  const [filterType, setFilter]     = useState("all");
  const previewRef = useRef(null);

  const currentData = formType === "abonnement" ? dataAbo : dataStd;

  const nextNum = (t) => {
    const c = String(invoices.length + 1).padStart(3, "0");
    return t === "abonnement" ? `FAC-CAMILLE-2026-${c}` : `FAC-2026-${c}`;
  };

  const openNew = () => {
    setEditIdx(null);
    setFormType("abonnement");
    setDataAbo({ ...EMPTY_ABO, number: nextNum("abonnement") });
    setDataStd({ ...EMPTY_STD, number: nextNum("standard") });
    setView("new");
  };

  const handleEdit = (idx) => {
    const inv = invoices[idx];
    setEditIdx(idx);
    if (inv.type === "abonnement") { setFormType("abonnement"); setDataAbo({ ...inv }); }
    else { setFormType("standard"); setDataStd({ ...inv }); }
    setView("new");
  };

  const handleSave = () => {
    const data = { ...currentData, type: formType };
    if (editIdx !== null) setInvoices(p => p.map((inv, i) => i === editIdx ? data : inv));
    else setInvoices(p => [...p, data]);
    setView("preview");
  };

  const handleView = (idx) => {
    const inv = invoices[idx];
    if (inv.type === "abonnement") { setFormType("abonnement"); setDataAbo({ ...inv }); }
    else { setFormType("standard"); setDataStd({ ...inv }); }
    setView("preview");
  };

  const handleDelete = (idx) => setInvoices(p => p.filter((_, i) => i !== idx));

  const handlePDF = async () => {
    const el = previewRef.current;
    if (!el) return;
    try {
      const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
      const img = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pW = pdf.internal.pageSize.getWidth();
      const pH = pdf.internal.pageSize.getHeight();
      const imgH = pW * (canvas.height / canvas.width);
      if (imgH <= pH) { pdf.addImage(img, "PNG", 0, 0, pW, imgH); }
      else {
        let off = 0;
        while (off < canvas.height) {
          const sh = Math.min(canvas.height - off, canvas.width * (pH / pW));
          const sc = document.createElement("canvas"); sc.width = canvas.width; sc.height = sh;
          sc.getContext("2d").drawImage(canvas, 0, off, canvas.width, sh, 0, 0, canvas.width, sh);
          if (off > 0) pdf.addPage();
          pdf.addImage(sc.toDataURL("image/png"), "PNG", 0, 0, pW, pH);
          off += sh;
        }
      }
      pdf.save(`${currentData.number}.pdf`);
    } catch (e) { alert("Erreur lors de la génération du PDF."); }
  };

  const filtered = invoices.filter(inv => {
    const ms = (inv.client?.name || "").toLowerCase().includes(search.toLowerCase())
            || (inv.number || "").toLowerCase().includes(search.toLowerCase());
    const mt = filterType === "all" || inv.type === filterType;
    return ms && mt;
  });

  const revenue  = invoices.filter(i => i.type === "standard")
    .reduce((s, inv) => s + (inv.items || []).reduce((ss, it) => ss + (it.quantity || 1) * Number(it.price || 0), 0), 0);

  // Breadcrumb labels
  const breadcrumbs = {
    dashboard: ["Facturation", "Tableau de bord"],
    invoices:  ["Facturation", "Factures"],
    new:       ["Facturation", "Factures", editIdx !== null ? "Modifier" : "Nouvelle facture"],
    preview:   ["Facturation", "Factures", "Aperçu"],
  };

  // Group nav items
  const groups = [...new Set(NAV_ITEMS.map(n => n.group))];

  return (
    <div style={{
      display: "flex", height: "100vh",
      fontFamily: "'Inter','Segoe UI',system-ui,-apple-system,sans-serif",
      background: D.bg,
    }}>

      {/* ══ SIDEBAR ══════════════════════════════════════════════════════════ */}
      <aside style={{
        width: 220, background: D.nav,
        display: "flex", flexDirection: "column",
        height: "100vh", position: "sticky", top: 0, flexShrink: 0,
        borderRight: "1px solid rgba(255,255,255,0.04)",
      }}>
        {/* Logo */}
        <div style={{
          height: 52, padding: "0 16px",
          display: "flex", alignItems: "center", gap: 10,
          borderBottom: `1px solid ${D.navSep}`,
          flexShrink: 0,
        }}>
          <div style={{
            width: 30, height: 30, borderRadius: 6,
            background: D.brand,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <FileText size={15} color="#fff" />
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#fff", margin: 0, letterSpacing: "-0.2px" }}>BuyFacturation</p>
            <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", margin: 0 }}>BUYTICLE ETS</p>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: "12px 8px", overflowY: "auto" }}>
          {groups.map(group => (
            <div key={group} style={{ marginBottom: 16 }}>
              <p style={{
                fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.22)",
                textTransform: "uppercase", letterSpacing: "0.12em",
                padding: "4px 8px 6px", margin: 0,
              }}>{group}</p>
              {NAV_ITEMS.filter(n => n.group === group).map(item => {
                const isActive = view === item.id || (item.id === "new" && view === "new");
                return (
                  <button
                    key={item.id}
                    onClick={() => item.id === "new" ? openNew() : setView(item.id)}
                    style={{
                      width: "100%",
                      display: "flex", alignItems: "center", gap: 9,
                      height: 36, padding: "0 10px",
                      borderRadius: 5,
                      border: "none",
                      borderLeft: isActive ? `3px solid ${D.brand}` : "3px solid transparent",
                      background: isActive ? D.navAct : "transparent",
                      color: isActive ? "#fff" : "rgba(255,255,255,0.45)",
                      fontSize: 13, fontWeight: isActive ? 600 : 400,
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 0.12s",
                      marginBottom: 2,
                    }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = D.navHov; if (!isActive) e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; if (!isActive) e.currentTarget.style.color = "rgba(255,255,255,0.45)"; }}
                  >
                    <item.icon size={14} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Summary stats */}
        <div style={{
          margin: "0 8px 8px",
          padding: "10px 12px",
          background: "rgba(255,255,255,0.04)",
          border: `1px solid ${D.navSep}`,
          borderRadius: 6,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Synthèse</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <p style={{ fontSize: 18, fontWeight: 700, color: D.brand, margin: 0 }}>{invoices.length}</p>
              <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", margin: 0 }}>Factures</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.7)", margin: 0 }}>{revenue > 0 ? `${Math.round(revenue / 1000)}K` : "—"}</p>
              <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", margin: 0 }}>FCFA</p>
            </div>
          </div>
        </div>

        {/* Company footer */}
        <div style={{
          padding: "10px 16px",
          borderTop: `1px solid ${D.navSep}`,
          display: "flex", alignItems: "center", gap: 8, flexShrink: 0,
        }}>
          <div style={{
            width: 26, height: 26, borderRadius: 4,
            background: "rgba(221,85,9,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <Building2 size={13} color={D.brand} />
          </div>
          <div style={{ overflow: "hidden" }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.5)", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>BUYTICLE ETS</p>
            <p style={{ fontSize: 10, color: "rgba(255,255,255,0.22)", margin: 0 }}>Douala, Cameroun</p>
          </div>
        </div>
      </aside>

      {/* ══ MAIN ════════════════════════════════════════════════════════════ */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* ── TOPBAR ── */}
        <div style={{
          height: 52, background: D.white,
          borderBottom: `1px solid ${D.bdr}`,
          padding: "0 24px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexShrink: 0,
          boxShadow: "0 1px 0 rgba(0,0,0,0.04)",
        }}>
          {/* Breadcrumb */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {(breadcrumbs[view] || []).map((crumb, i, arr) => (
              <React.Fragment key={i}>
                <span style={{
                  fontSize: 13,
                  color: i === arr.length - 1 ? D.tx1 : D.tx3,
                  fontWeight: i === arr.length - 1 ? 600 : 400,
                }}>{crumb}</span>
                {i < arr.length - 1 && <ChevronRight size={13} color={D.tx4} />}
              </React.Fragment>
            ))}
          </div>

          {/* Topbar actions */}
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {view === "new" && (
              <>
                <BtnSecondary onClick={() => setView(editIdx !== null ? "invoices" : "dashboard")} icon={X}>
                  Annuler
                </BtnSecondary>
                <BtnPrimary onClick={handleSave} icon={Eye}>
                  Enregistrer &amp; Aperçu
                </BtnPrimary>
              </>
            )}
            {view === "preview" && (
              <>
                <BtnSecondary onClick={() => setView("invoices")} icon={ChevronLeft}>
                  Retour
                </BtnSecondary>
                <BtnPrimary onClick={handlePDF} icon={Download}>
                  Télécharger PDF
                </BtnPrimary>
              </>
            )}
          </div>
        </div>

        {/* ── CONTENT ── */}
        <main style={{ flex: 1, overflow: "auto", padding: "24px" }}>

          {/* DASHBOARD */}
          {view === "dashboard" && (
            <DashboardView
              invoices={invoices} onNew={openNew}
              onView={handleView} onEdit={handleEdit} onDelete={handleDelete}
            />
          )}

          {/* INVOICES */}
          {view === "invoices" && (
            <InvoicesView
              invoices={invoices} filtered={filtered}
              search={search} setSearch={setSearch}
              filterType={filterType} setFilter={setFilter}
              onNew={openNew} onView={handleView} onEdit={handleEdit} onDelete={handleDelete}
            />
          )}

          {/* FORM */}
          {view === "new" && (
            <div style={{ maxWidth: 700 }}>
              {/* Type selector */}
              <div style={{
                background: D.white, border: `1px solid ${D.bdr}`,
                borderRadius: 6, padding: "12px 16px", marginBottom: 12,
                boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
              }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: D.tx3, margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.07em" }}>Type de facture</p>
                <div style={{ display: "flex", gap: 8 }}>
                  {[
                    ["abonnement", "Facture d'abonnement", "Période d'essai · Plateforme Camille", Zap],
                    ["standard",   "Facture standard",     "Prestation de services",                Receipt],
                  ].map(([val, label, desc, Icon]) => (
                    <button
                      key={val}
                      onClick={() => setFormType(val)}
                      style={{
                        flex: 1, padding: "10px 14px",
                        border: `2px solid ${formType === val ? D.brand : D.bdrM}`,
                        borderRadius: 5,
                        background: formType === val ? D.brandXL : D.white,
                        cursor: "pointer", textAlign: "left",
                        transition: "all 0.12s",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3 }}>
                        <Icon size={13} color={formType === val ? D.brand : D.tx3} />
                        <span style={{ fontSize: 13, fontWeight: 600, color: formType === val ? D.brand : D.tx1 }}>{label}</span>
                        {formType === val && <Check size={13} color={D.brand} style={{ marginLeft: "auto" }} />}
                      </div>
                      <p style={{ fontSize: 11, color: D.tx3, margin: 0 }}>{desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {formType === "abonnement"
                ? <FormAbonnement d={dataAbo} set={setDataAbo} />
                : <FormStandard  d={dataStd} set={setDataStd} />
              }
            </div>
          )}

          {/* PREVIEW */}
          {view === "preview" && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
              {/* Info strip */}
              <div style={{
                width: "100%", maxWidth: "210mm",
                background: D.white, border: `1px solid ${D.bdr}`,
                borderRadius: 6, padding: "10px 16px",
                display: "flex", alignItems: "center", gap: 12,
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 5,
                  background: D.brandL,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <FileText size={15} color={D.brand} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: D.tx1, margin: 0, fontFamily: "monospace" }}>{currentData.number}</p>
                  <p style={{ fontSize: 12, color: D.tx3, margin: 0 }}>
                    {currentData.client?.name || "Client non renseigné"}
                    {" · "}{fmtDateDisp(currentData.date)}
                  </p>
                </div>
                <Badge type={formType} />
              </div>

              {/* A4 document */}
              <div style={{
                boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
                borderRadius: 2, overflow: "hidden",
              }}>
                <div ref={previewRef}>
                  {formType === "abonnement"
                    ? <PreviewAbonnement d={dataAbo} />
                    : <PreviewStandard  d={dataStd} />
                  }
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
