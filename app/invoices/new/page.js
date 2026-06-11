import InvoiceForm from "@/components/InvoiceForm";

export default function NewInvoicePage() {
  return (
    <div>
      <h1 style={{ margin: "0 0 24px", fontSize: 22, fontWeight: "700", color: "#0F1623" }}>Nouvelle facture</h1>
      <InvoiceForm />
    </div>
  );
}
