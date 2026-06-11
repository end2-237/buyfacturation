import nodemailer from "nodemailer";

export async function sendInvoiceEmail(invoice, pdfBuffer) {
  if (!invoice.client_email) throw new Error("Le client n'a pas d'adresse email.");

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: invoice.client_email,
    subject: `Facture ${invoice.number} — BUYTICLE ETS`,
    html: `
      <p>Bonjour <strong>${invoice.client_name}</strong>,</p>
      <p>Veuillez trouver ci-joint votre facture <strong>${invoice.number}</strong>.</p>
      <p>Cordialement,<br/>BUYTICLE ETS</p>
    `,
    attachments: [{
      filename: `${invoice.number}.pdf`,
      content: pdfBuffer,
      contentType: "application/pdf",
    }],
  });
}
