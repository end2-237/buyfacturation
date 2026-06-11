import mongoose from "mongoose";

const clientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: String,
  phone: String,
  email: String,
});

const lineItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  quantity: { type: Number, default: 1 },
  price: { type: Number, required: true },
});

const invoiceSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["standard", "abonnement"], required: true },
    number: { type: String, required: true, unique: true },
    date: { type: Date, default: Date.now },
    dueDate: Date,

    // Abonnement fields
    platform: String,
    platformUrl: String,
    trialMonths: Number,
    trialStart: Date,
    trialEnd: Date,
    statut: String,

    niu: String,
    client: { type: clientSchema, required: true },

    // Standard fields
    items: [lineItemSchema],
    bankInfo: String,

    status: {
      type: String,
      enum: ["draft", "sent", "paid"],
      default: "draft",
    },
  },
  { timestamps: true }
);

invoiceSchema.virtual("total").get(function () {
  if (this.type === "abonnement") return 0;
  return (this.items || []).reduce((sum, i) => sum + i.quantity * i.price, 0);
});

invoiceSchema.set("toJSON", { virtuals: true });

export default mongoose.model("Invoice", invoiceSchema);
