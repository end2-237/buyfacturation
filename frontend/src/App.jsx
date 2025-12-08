import React, { useState, useRef } from "react";
import {
  FileText,
  Download,
  Printer,
  Plus,
  Trash2,
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Hash,
  Eye,
  Search,
  Edit,
  DollarSign,
} from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const Sidebar = ({ activeTab, setActiveTab, stats }) => {
  const menuItems = [
    { id: "create", label: "Nouvelle Facture", icon: Plus },
    { id: "invoices", label: "Factures", icon: FileText },
    { id: "preview", label: "Aperçu PDF", icon: Eye },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-orange-500 to-amber-600 p-2.5 rounded-xl shadow-lg">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">BuyFacturation</h1>
            <p className="text-xs text-gray-500">by Buyticle</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-4 border border-orange-100">
          <div className="flex items-center gap-3">
            <div className="bg-orange-500 p-2 rounded-lg">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Total Factures</p>
              <p className="text-xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100">
          <div className="flex items-center gap-3">
            <div className="bg-green-500 p-2 rounded-lg">
              <DollarSign className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Revenus Total</p>
              <p className="text-lg font-bold text-gray-900">
                {stats.revenue.toLocaleString()} FCFA
              </p>
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeTab === item.id
                ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4">
          <p className="text-xs text-gray-600 mb-2">Version 1.0.0</p>
          <p className="text-xs text-gray-500">© 2024 Buyticle</p>
        </div>
      </div>
    </aside>
  );
};

const InputField = ({ icon: Icon, label, error, ...props }) => (
  <div className="space-y-2">
    {label && (
      <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-orange-500" />}
        {label}
      </label>
    )}
    <input
      {...props}
      className={`w-full px-4 py-2.5 border ${
        error ? "border-red-300" : "border-gray-200"
      } rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all bg-white placeholder-gray-400`}
    />
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

const InfoSection = ({ title, data, onChange, prefix, icon: Icon }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5 hover:border-orange-200 transition-all">
    <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
      <div className="bg-gradient-to-br from-orange-500 to-amber-500 p-2 rounded-lg">
        <Icon className="w-5 h-5 text-white" />
      </div>
      <h3 className="text-lg font-bold text-gray-900">{title}</h3>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <InputField
        icon={prefix === "company" ? Building2 : User}
        label="Nom complet"
        value={data.name}
        onChange={(e) => onChange(prefix, "name", e.target.value)}
        placeholder="Entrez le nom"
      />
      <InputField
        icon={Mail}
        label="Email"
        type="email"
        value={data.email}
        onChange={(e) => onChange(prefix, "email", e.target.value)}
        placeholder="email@exemple.com"
      />
      <InputField
        icon={Phone}
        label="Téléphone"
        value={data.phone}
        onChange={(e) => onChange(prefix, "phone", e.target.value)}
        placeholder="+237 XXX XXX XXX"
      />
      <InputField
        icon={MapPin}
        label="Adresse"
        value={data.address}
        onChange={(e) => onChange(prefix, "address", e.target.value)}
        placeholder="Adresse complète"
      />
    </div>
  </div>
);

const ItemRow = ({ item, index, onChange, onRemove }) => (
  <div className="grid grid-cols-12 gap-3 items-center p-4 bg-gradient-to-r from-gray-50 to-gray-50/50 rounded-lg border border-gray-200 hover:border-orange-200 transition-all group">
    <div className="col-span-5">
      <input
        type="text"
        value={item.description}
        onChange={(e) => onChange(index, "description", e.target.value)}
        placeholder="Description du service"
        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 bg-white"
      />
    </div>
    <div className="col-span-2">
      <input
        type="number"
        value={item.quantity}
        onChange={(e) =>
          onChange(index, "quantity", parseFloat(e.target.value) || 0)
        }
        placeholder="Quantité"
        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 bg-white"
        min="0"
      />
    </div>
    <div className="col-span-2">
      <input
        type="number"
        value={item.price}
        onChange={(e) =>
          onChange(index, "price", parseFloat(e.target.value) || 0)
        }
        placeholder="Prix unitaire"
        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 bg-white"
        min="0"
      />
    </div>
    <div className="col-span-2">
      <div className="px-3 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg font-bold text-center text-sm shadow-sm">
        {(item.quantity * item.price).toLocaleString()} FCFA
      </div>
    </div>
    <div className="col-span-1">
      <button
        onClick={() => onRemove(index)}
        className="w-full p-2.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
      >
        <Trash2 className="w-5 h-5 mx-auto" />
      </button>
    </div>
  </div>
);

const ItemsSection = ({ items, onChange, onAdd, onRemove }) => {
  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  );
  const tax = subtotal * 0.1925;
  const total = subtotal + tax;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-orange-500 to-amber-500 p-2 rounded-lg">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">
            Articles & Services
          </h3>
        </div>
        <button
          onClick={onAdd}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all flex items-center gap-2 text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Ajouter
        </button>
      </div>

      <div className="space-y-3">
        {items.map((item, index) => (
          <ItemRow
            key={index}
            item={item}
            index={index}
            onChange={onChange}
            onRemove={onRemove}
          />
        ))}
      </div>

      <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-6 border border-orange-100">
        <div className="space-y-3">
          <div className="flex justify-between items-center text-gray-700">
            <span className="font-medium">Sous-total</span>
            <span className="font-bold text-lg">
              {subtotal.toLocaleString()} FCFA
            </span>
          </div>
          <div className="flex justify-between items-center text-gray-700">
            <span className="font-medium">TVA (19.25%)</span>
            <span className="font-bold text-lg">{tax.toFixed(2)} FCFA</span>
          </div>
          <div className="pt-3 border-t-2 border-orange-300 flex justify-between items-center">
            <span className="text-xl font-bold text-gray-900">Total</span>
            <span className="text-2xl font-bold text-orange-600">
              {total.toFixed(2).toLocaleString()} FCFA
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const CreateInvoice = ({ formData, setFormData, onSaveAndPreview }) => {
  const handleInfoChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData((prev) => ({ ...prev, items: newItems }));
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { description: "", quantity: 1, price: 0 }],
    }));
  };

  const removeItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-3">
            <button
              onClick={() =>
                setFormData((prev) => ({ ...prev, docType: "invoice" }))
              }
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                formData.docType === "invoice"
                  ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Facture
            </button>
            <button
              onClick={() =>
                setFormData((prev) => ({ ...prev, docType: "quote" }))
              }
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                formData.docType === "quote"
                  ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Devis
            </button>
          </div>

          <div className="flex gap-3">
            <InputField
              icon={Hash}
              value={formData.number}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, number: e.target.value }))
              }
              placeholder="Numéro"
            />
            <InputField
              icon={Calendar}
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, date: e.target.value }))
              }
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InfoSection
          title="Votre Entreprise"
          data={formData.company}
          onChange={handleInfoChange}
          prefix="company"
          icon={Building2}
        />
        <InfoSection
          title="Informations Client"
          data={formData.client}
          onChange={handleInfoChange}
          prefix="client"
          icon={User}
        />
      </div>

      <ItemsSection
        items={formData.items}
        onChange={handleItemChange}
        onAdd={addItem}
        onRemove={removeItem}
      />

      <div className="flex justify-end gap-3">
        <button
          onClick={onSaveAndPreview}
          className="px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-bold hover:from-orange-600 hover:to-amber-600 transition-all flex items-center gap-3 shadow-lg text-lg"
        >
          <Eye className="w-6 h-6" />
          Enregistrer et Prévisualiser
        </button>
      </div>
    </div>
  );
};

const InvoiceList = ({ invoices, onView, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || inv.docType === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher par client ou numéro..."
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 bg-white"
          >
            <option value="all">Tous les documents</option>
            <option value="invoice">Factures</option>
            <option value="quote">Devis</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredInvoices.map((invoice, index) => {
          const total =
            invoice.items.reduce(
              (sum, item) => sum + item.quantity * item.price,
              0
            ) * 1.1925;

          return (
            <div
              key={index}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:border-orange-300 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        invoice.docType === "invoice"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {invoice.docType === "invoice" ? "Facture" : "Devis"}
                    </span>
                    <span className="text-sm font-bold text-gray-900">
                      {invoice.number}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-700">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="font-semibold">
                        {invoice.client.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{invoice.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        <span className="font-bold text-orange-600">
                          {total.toFixed(2).toLocaleString()} FCFA
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onView(invoice)}
                    className="px-4 py-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-all flex items-center gap-2 font-medium"
                  >
                    <Eye className="w-4 h-4" />
                    Voir
                  </button>
                  <button
                    onClick={() => onEdit(invoice)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Edit className="w-5 h-5 text-gray-600" />
                  </button>
                  <button
                    onClick={() => onDelete(index)}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5 text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredInvoices.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Aucune facture trouvée</p>
        </div>
      )}
    </div>
  );
};

const PDFPreview = ({ formData, onDownload, onPrint }) => {
  const subtotal = formData.items.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  );
  const tax = subtotal * 0.1925;
  const total = subtotal + tax;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Aperçu du Document</h2>
        <div className="flex gap-3">
          <button
            onClick={onDownload}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-amber-600 transition-all flex items-center gap-2 shadow-md"
          >
            <Download className="w-5 h-5" />
            Télécharger PDF
          </button>
          <button
            onClick={onPrint}
            className="px-6 py-3 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-800 transition-all flex items-center gap-2 shadow-md"
          >
            <Printer className="w-5 h-5" />
            Imprimer
          </button>
        </div>
      </div>

      <div
        className="bg-white rounded-xl border border-gray-200 shadow-2xl overflow-hidden"
        id="pdf-content"
      >
        <div className="p-12 bg-white">
          <div className="flex justify-between items-start mb-10 pb-6 border-b-4 border-orange-500">
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-2">
                BuyFacturation
              </h1>
              <p className="text-gray-600 font-medium">by Buyticle</p>
            </div>
            <div className="text-right">
              <h2 className="text-4xl font-bold text-gray-900 mb-3">
                {formData.docType === "invoice" ? "FACTURE" : "DEVIS"}
              </h2>
              <p className="text-gray-600 font-semibold">
                N° {formData.number}
              </p>
              <p className="text-gray-600">Date: {formData.date}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-10 mb-10">
            <div>
              <h3 className="font-bold text-orange-600 mb-4 text-lg">De:</h3>
              <div className="text-gray-700 space-y-2">
                <p className="font-bold text-gray-900 text-lg">
                  {formData.company.name}
                </p>
                <p>{formData.company.email}</p>
                <p>{formData.company.phone}</p>
                <p>{formData.company.address}</p>
              </div>
            </div>
            <div>
              <h3 className="font-bold text-orange-600 mb-4 text-lg">Pour:</h3>
              <div className="text-gray-700 space-y-2">
                <p className="font-bold text-gray-900 text-lg">
                  {formData.client.name}
                </p>
                <p>{formData.client.email}</p>
                <p>{formData.client.phone}</p>
                <p>{formData.client.address}</p>
              </div>
            </div>
          </div>

          <div className="mb-10">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-orange-500 to-amber-500 text-white">
                  <th className="text-left p-4 font-bold rounded-tl-lg">
                    Description
                  </th>
                  <th className="text-center p-4 font-bold">Qté</th>
                  <th className="text-right p-4 font-bold">Prix Unit.</th>
                  <th className="text-right p-4 font-bold rounded-tr-lg">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {formData.items.map((item, index) => (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="p-4 text-gray-800">{item.description}</td>
                    <td className="text-center p-4 text-gray-800">
                      {item.quantity}
                    </td>
                    <td className="text-right p-4 text-gray-800">
                      {item.price.toLocaleString()} FCFA
                    </td>
                    <td className="text-right p-4 font-bold text-gray-900">
                      {(item.quantity * item.price).toLocaleString()} FCFA
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end mb-10">
            <div className="w-96 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-6 border-2 border-orange-200">
              <div className="space-y-3">
                <div className="flex justify-between text-gray-700">
                  <span className="font-semibold">Sous-total:</span>
                  <span className="font-bold text-lg">
                    {subtotal.toLocaleString()} FCFA
                  </span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span className="font-semibold">TVA (19.25%):</span>
                  <span className="font-bold text-lg">
                    {tax.toFixed(2)} FCFA
                  </span>
                </div>
                <div className="pt-3 border-t-2 border-orange-400 flex justify-between">
                  <span className="text-xl font-bold text-gray-900">
                    Total:
                  </span>
                  <span className="text-3xl font-bold text-orange-600">
                    {total.toFixed(2).toLocaleString()} FCFA
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t-2 border-gray-300 pt-6 text-center text-gray-600">
            <p className="font-semibold mb-2">Merci pour votre confiance !</p>
            <p className="text-sm">
              BuyFacturation by Buyticle - Solution de facturation
              professionnelle
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const PrintableDocument = React.forwardRef(({ formData }, ref) => {
  const subtotal = formData.items.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  );
  const tax = subtotal * 0.1925;
  const total = subtotal + tax;

  return (
    <div ref={ref} className="hidden print:block">
      <div
        className="p-12 bg-white"
        style={{ minHeight: "297mm", width: "210mm" }}
      >
        <div className="flex justify-between items-start mb-8 pb-6 border-b-4 border-orange-500">
          <div>
            <h1 className="text-4xl font-bold text-orange-600 mb-2">
              BuyFacturation
            </h1>
            <p className="text-gray-600">by Buyticle</p>
          </div>
          <div className="text-right">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {formData.docType === "invoice" ? "FACTURE" : "DEVIS"}
            </h2>
            <p className="text-gray-600">N° {formData.number}</p>
            <p className="text-gray-600">Date: {formData.date}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="font-bold text-orange-600 mb-3 text-lg">De:</h3>
            <div className="text-gray-600 space-y-1">
              <p className="font-semibold text-gray-800">
                {formData.company.name}
              </p>
              <p>{formData.company.email}</p>
              <p>{formData.company.phone}</p>
              <p>{formData.company.address}</p>
            </div>
          </div>
          <div>
            <h3 className="font-bold text-orange-600 mb-3 text-lg">Pour:</h3>
            <div className="text-gray-600 space-y-1">
              <p className="font-semibold text-gray-800">
                {formData.client.name}
              </p>
              <p>{formData.client.email}</p>
              <p>{formData.client.phone}</p>
              <p>{formData.client.address}</p>
            </div>
          </div>
        </div>

        <table className="w-full mb-8">
          <thead>
            <tr className="bg-gradient-to-r from-orange-500 to-amber-500text-white">
              <th className="text-left p-3">Description</th>
              <th className="text-center p-3">Quantité</th>
              <th className="text-right p-3">Prix unitaire</th>
              <th className="text-right p-3">Total</th>
            </tr>
          </thead>
          <tbody>
            {formData.items.map((item, index) => (
              <tr key={index} className="border-b border-gray-200">
                <td className="p-3">{item.description}</td>
                <td className="text-center p-3">{item.quantity}</td>
                <td className="text-right p-3">
                  {item.price.toLocaleString()} FCFA
                </td>
                <td className="text-right p-3 font-semibold">
                  {(item.quantity * item.price).toLocaleString()} FCFA
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end mb-8">
          <div className="w-80 space-y-2">
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Sous-total:</span>
              <span className="font-semibold">
                {subtotal.toLocaleString()} FCFA
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600">TVA (19.25%):</span>
              <span className="font-semibold">{tax.toFixed(2)} FCFA</span>
            </div>
            <div className="flex justify-between py-3 border-t-2 border-orange-500 text-xl font-bold text-orange-700">
              <span>Total:</span>
              <span>{total.toFixed(2).toLocaleString()} FCFA</span>
            </div>
          </div>
        </div>

        <div className="border-t-2 border-gray-300 pt-6 text-center text-gray-600 text-sm">
          <p>Merci pour votre confiance !</p>
          <p className="mt-2">
            BuyFacturation by Buyticle - Solution de facturation professionnelle
          </p>
        </div>
      </div>
    </div>
  );
});

export default function BuyFacturation() {
  const [activeTab, setActiveTab] = useState("create");
  const [invoices, setInvoices] = useState([]);
  const [formData, setFormData] = useState({
    docType: "invoice",
    number: `INV-${Date.now().toString().slice(-6)}`,
    date: new Date().toISOString().split("T")[0],
    company: {
      name: "Buyticle",
      email: "contact@buyticle.com",
      phone: "+237 XXX XXX XXX",
      address: "Yaoundé, Cameroun",
    },
    client: {
      name: "",
      email: "",
      phone: "",
      address: "",
    },
    items: [
      { description: "Développement site web", quantity: 1, price: 500000 },
    ],
  });

  const printRef = useRef();

  const calculateStats = () => {
    const total = invoices.length;
    const revenue = invoices.reduce((sum, inv) => {
      const invTotal =
        inv.items.reduce((s, item) => s + item.quantity * item.price, 0) *
        1.1925;
      return sum + invTotal;
    }, 0);
    return { total, revenue };
  };

  const handleSaveAndPreview = () => {
    const exists = invoices.findIndex((inv) => inv.number === formData.number);
    if (exists >= 0) {
      const newInvoices = [...invoices];
      newInvoices[exists] = formData;
      setInvoices(newInvoices);
    } else {
      setInvoices([...invoices, formData]);
    }
    setActiveTab("preview");
  };

  const handleViewInvoice = (invoice) => {
    setFormData(invoice);
    setActiveTab("preview");
  };

  const handleEditInvoice = (invoice) => {
    setFormData(invoice);
    setActiveTab("create");
  };

  const handleDeleteInvoice = (index) => {
    setInvoices(invoices.filter((_, i) => i !== index));
  };

  const generateQRCode = (data) => {
    // Génération simple d'un QR code avec une API publique
    const qrData = encodeURIComponent(
      JSON.stringify({
        type: data.docType,
        number: data.number,
        date: data.date,
        total:
          data.items.reduce(
            (sum, item) => sum + item.quantity * item.price,
            0
          ) * 1.1925,
        client: data.client.name,
      })
    );
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${qrData}`;
  };

  const loadImageAsBase64 = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = (err) => reject(err);
      img.src = url;
    });
  };

  const handleDownload = async () => {
    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Fonction pour formater les nombres
      const formatNumber = (num) => {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
      };

      // ==================== EN-TÊTE ====================
      // Bande orange
      pdf.setFillColor(249, 115, 22);
      pdf.rect(0, 0, pageWidth, 45, "F");

      // Logo et nom
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(28);
      pdf.setFont(undefined, "bold");
      pdf.text("BuyFacturation", 15, 22);

      pdf.setFontSize(9);
      pdf.setFont(undefined, "normal");
      pdf.text("by Buyticle", 15, 28);

      // Type de document
      pdf.setFontSize(26);
      pdf.setFont(undefined, "bold");
      const docTitle = formData.docType === "invoice" ? "FACTURE" : "DEVIS";
      pdf.text(docTitle, pageWidth - 15, 22, { align: "right" });

      pdf.setFontSize(9);
      pdf.setFont(undefined, "normal");
      pdf.text(`N° ${formData.number}`, pageWidth - 15, 29, { align: "right" });
      pdf.text(`Date: ${formData.date}`, pageWidth - 15, 35, {
        align: "right",
      });

      // ==================== INFORMATIONS ====================
      let y = 60;

      // Colonne Entreprise
      pdf.setTextColor(249, 115, 22);
      pdf.setFontSize(10);
      pdf.setFont(undefined, "bold");
      pdf.text("ÉMETTEUR", 15, y);

      y += 6;
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(11);
      pdf.setFont(undefined, "bold");
      pdf.text(formData.company.name, 15, y);

      y += 5;
      pdf.setFont(undefined, "normal");
      pdf.setFontSize(9);
      pdf.text(formData.company.email, 15, y);
      y += 4.5;
      pdf.text(formData.company.phone, 15, y);
      y += 4.5;
      pdf.text(formData.company.address, 15, y);

      // Colonne Client
      y = 60;
      const clientX = 110;

      pdf.setTextColor(249, 115, 22);
      pdf.setFontSize(10);
      pdf.setFont(undefined, "bold");
      pdf.text("CLIENT", clientX, y);

      y += 6;
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(11);
      pdf.setFont(undefined, "bold");
      pdf.text(formData.client.name, clientX, y);

      y += 5;
      pdf.setFont(undefined, "normal");
      pdf.setFontSize(9);
      pdf.text(formData.client.email, clientX, y);
      y += 4.5;
      pdf.text(formData.client.phone, clientX, y);
      y += 4.5;
      pdf.text(formData.client.address, clientX, y);

      // ==================== TABLEAU ====================
      y = 100;

      // En-tête du tableau
      pdf.setFillColor(249, 115, 22);
      pdf.rect(15, y, pageWidth - 30, 9, "F");

      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(9);
      pdf.setFont(undefined, "bold");

      // Colonnes bien espacées
      const col1 = 18; // Description
      const col2 = 130; // Quantité
      const col3 = 158; // Prix unitaire
      const col4 = 186; // Total

      pdf.text("Description", col1, y + 6);
      pdf.text("Qté", col2, y + 6, { align: "center" });
      pdf.text("Prix Unit.", col3, y + 6, { align: "right" });
      pdf.text("Total", col4, y + 6, { align: "right" });

      y += 13;

      // Lignes du tableau
      pdf.setTextColor(0, 0, 0);
      pdf.setFont(undefined, "normal");
      pdf.setFontSize(9);

      formData.items.forEach((item, index) => {
        const itemTotal = item.quantity * item.price;

        // Description (max 55 caractères)
        const desc =
          item.description.length > 55
            ? item.description.substring(0, 52) + "..."
            : item.description;

        pdf.text(desc, col1, y);
        pdf.text(item.quantity.toString(), col2, y, { align: "center" });
        pdf.text(`${formatNumber(item.price)}`, col3, y, { align: "right" });
        pdf.setFont(undefined, "bold");
        pdf.text(`${formatNumber(itemTotal)}`, col4, y, { align: "right" });
        pdf.setFont(undefined, "normal");

        y += 7;

        // Ligne de séparation
        if (index < formData.items.length - 1) {
          pdf.setDrawColor(220, 220, 220);
          pdf.setLineWidth(0.1);
          pdf.line(15, y - 2, pageWidth - 15, y - 2);
        }
      });

      // Bordure du tableau
      pdf.setDrawColor(200, 200, 200);
      pdf.setLineWidth(0.3);
      pdf.rect(15, 100, pageWidth - 30, y - 102);

      // ==================== TOTAUX ====================
      const subtotal = formData.items.reduce(
        (sum, item) => sum + item.quantity * item.price,
        0
      );
      const tax = subtotal * 0.1925;
      const total = subtotal + tax;

      y += 10;

      // Encadré des totaux
      const boxY = y;
      const boxHeight = 32;

      pdf.setFillColor(250, 250, 250);
      pdf.rect(pageWidth - 80, boxY, 65, boxHeight, "F");
      pdf.setDrawColor(200, 200, 200);
      pdf.rect(pageWidth - 80, boxY, 65, boxHeight);

      y += 6;
      pdf.setFontSize(9);
      pdf.setTextColor(80, 80, 80);
      pdf.setFont(undefined, "normal");
      pdf.text("Sous-total:", pageWidth - 75, y);
      pdf.setFont(undefined, "bold");
      pdf.setTextColor(0, 0, 0);
      pdf.text(`${formatNumber(subtotal)} FCFA`, pageWidth - 18, y, {
        align: "right",
      });

      y += 7;
      pdf.setFont(undefined, "normal");
      pdf.setTextColor(80, 80, 80);
      pdf.text("TVA (19.25%):", pageWidth - 75, y);
      pdf.setFont(undefined, "bold");
      pdf.setTextColor(0, 0, 0);
      pdf.text(
        `${formatNumber(Math.round(tax * 100) / 100)} FCFA`,
        pageWidth - 18,
        y,
        { align: "right" }
      );

      y += 9;
      pdf.setDrawColor(249, 115, 22);
      pdf.setLineWidth(0.5);
      pdf.line(pageWidth - 77, y - 4, pageWidth - 17, y - 4);

      pdf.setFontSize(12);
      pdf.setFont(undefined, "bold");
      pdf.setTextColor(249, 115, 22);
      pdf.text("TOTAL:", pageWidth - 75, y);
      pdf.text(
        `${formatNumber(Math.round(total * 100) / 100)} FCFA`,
        pageWidth - 18,
        y,
        { align: "right" }
      );

      // ==================== QR CODE ====================
      const qrY = boxY - 2;
      const qrSize = 35;

      const qrURL = generateQRCode(formData);

      try {
        const qrBase64 = await loadImageAsBase64(qrURL);

        pdf.addImage(qrBase64, "PNG", 15, qrY, qrSize, qrSize);
      } catch (err) {
        console.error("Erreur QR:", err);
        pdf.setFontSize(8);
        pdf.text("QR indisponible", 18, qrY + 10);
      }

      // ==================== PIED DE PAGE ====================
      const footerY = pageHeight - 25;

      // Ligne de séparation
      pdf.setDrawColor(220, 220, 220);
      pdf.setLineWidth(0.3);
      pdf.line(15, footerY, pageWidth - 15, footerY);

      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.setFont(undefined, "normal");
      pdf.text("Merci pour votre confiance !", pageWidth / 2, footerY + 6, {
        align: "center",
      });

      pdf.setFontSize(7);
      pdf.setTextColor(130, 130, 130);
      pdf.text(
        "BuyFacturation by Buyticle - Solution de facturation professionnelle",
        pageWidth / 2,
        footerY + 11,
        { align: "center" }
      );

      // Informations légales
      pdf.setFontSize(6);
      pdf.setTextColor(150, 150, 150);
      pdf.text(
        `Document généré le ${new Date().toLocaleDateString(
          "fr-FR"
        )} - Facture ${formData.number}`,
        pageWidth / 2,
        footerY + 16,
        { align: "center" }
      );

      // ==================== SAUVEGARDER ====================
      const fileName = `${
        formData.docType === "invoice" ? "Facture" : "Devis"
      }_${formData.number}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error("Erreur lors de la génération du PDF:", error);
      alert("Erreur lors de la génération du PDF. Veuillez réessayer.");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        stats={calculateStats()}
      />

      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          {activeTab === "create" && (
            <CreateInvoice
              formData={formData}
              setFormData={setFormData}
              onSaveAndPreview={handleSaveAndPreview}
            />
          )}

          {activeTab === "invoices" && (
            <InvoiceList
              invoices={invoices}
              onView={handleViewInvoice}
              onEdit={handleEditInvoice}
              onDelete={handleDeleteInvoice}
            />
          )}

          {activeTab === "preview" && (
            <PDFPreview
              formData={formData}
              onDownload={handleDownload}
              onPrint={handlePrint}
            />
          )}
        </div>
      </main>

      <PrintableDocument ref={printRef} formData={formData} />
    </div>
  );
}
