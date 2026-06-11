import Invoice from "../models/invoice.model.js";
import { generatePdf } from "../services/pdf.service.js";
import { sendInvoiceEmail } from "../services/email.service.js";

// GET /api/invoices
export async function listInvoices(req, res) {
  const { type, status, search, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (type) filter.type = type;
  if (status) filter.status = status;
  if (search) {
    filter.$or = [
      { number: { $regex: search, $options: "i" } },
      { "client.name": { $regex: search, $options: "i" } },
    ];
  }

  const [invoices, total] = await Promise.all([
    Invoice.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit)),
    Invoice.countDocuments(filter),
  ]);

  res.json({ invoices, total, page: Number(page), limit: Number(limit) });
}

// GET /api/invoices/:id
export async function getInvoice(req, res) {
  const inv = await Invoice.findById(req.params.id);
  if (!inv) return res.status(404).json({ error: "Facture introuvable" });
  res.json(inv);
}

// POST /api/invoices
export async function createInvoice(req, res) {
  const inv = await Invoice.create(req.body);
  res.status(201).json(inv);
}

// PUT /api/invoices/:id
export async function updateInvoice(req, res) {
  const inv = await Invoice.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!inv) return res.status(404).json({ error: "Facture introuvable" });
  res.json(inv);
}

// DELETE /api/invoices/:id
export async function deleteInvoice(req, res) {
  const inv = await Invoice.findByIdAndDelete(req.params.id);
  if (!inv) return res.status(404).json({ error: "Facture introuvable" });
  res.json({ message: "Facture supprimée" });
}

// GET /api/invoices/:id/download
export async function downloadInvoice(req, res) {
  const inv = await Invoice.findById(req.params.id);
  if (!inv) return res.status(404).json({ error: "Facture introuvable" });

  const pdf = await generatePdf(inv);
  res.set({
    "Content-Type": "application/pdf",
    "Content-Disposition": `attachment; filename="${inv.number}.pdf"`,
    "Content-Length": pdf.length,
  });
  res.send(pdf);
}

// POST /api/invoices/:id/send
export async function sendInvoice(req, res) {
  const inv = await Invoice.findById(req.params.id);
  if (!inv) return res.status(404).json({ error: "Facture introuvable" });

  const pdf = await generatePdf(inv);
  await sendInvoiceEmail(inv, pdf);

  inv.status = "sent";
  await inv.save();

  res.json({ message: `Facture envoyée à ${inv.client.email}`, status: inv.status });
}
