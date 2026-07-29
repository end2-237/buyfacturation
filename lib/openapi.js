export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "BuyFacturation API",
    version: "1.0.0",
    description:
      "API REST pour créer, lister, télécharger (PDF) et envoyer (email) des factures — BUYTICLE ETS. Utilisable par d'autres applications.",
    contact: { name: "BUYTICLE ETS" },
  },
  servers: [{ url: "/", description: "Serveur courant" }],
  tags: [{ name: "Factures", description: "Gestion des factures" }],
  paths: {
    "/api/invoices": {
      get: {
        tags: ["Factures"],
        summary: "Lister les factures",
        parameters: [
          { name: "type", in: "query", schema: { type: "string", enum: ["standard", "abonnement", "bon_commande"] }, description: "Filtrer par type" },
          { name: "status", in: "query", schema: { type: "string", enum: ["draft", "sent", "paid"] }, description: "Filtrer par statut" },
          { name: "search", in: "query", schema: { type: "string" }, description: "Recherche par n° de facture ou nom du client" },
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 20 } },
        ],
        responses: {
          200: {
            description: "Liste paginée des factures",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    invoices: { type: "array", items: { $ref: "#/components/schemas/Invoice" } },
                    total: { type: "integer" },
                    page: { type: "integer" },
                    limit: { type: "integer" },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Factures"],
        summary: "Créer une facture",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/InvoiceInput" },
              examples: {
                standard: {
                  summary: "Facture standard",
                  value: {
                    type: "standard",
                    number: "FAC-2026-001",
                    date: "2026-06-11",
                    due_date: "2026-07-11",
                    niu: "P070418499910G",
                    client_name: "Acme SARL",
                    client_email: "client@acme.cm",
                    client_phone: "+237 699 00 00 00",
                    client_address: "Akwa, Douala",
                    items: [{ description: "Développement site web", quantity: 1, price: 500000 }],
                    bank_info: "UBA Cameroun — Compte N° 12345",
                  },
                },
                abonnement: {
                  summary: "Facture abonnement",
                  value: {
                    type: "abonnement",
                    number: "FAC-CAMILLE-2026-001",
                    date: "2026-06-11",
                    platform: "Camille",
                    platform_url: "camille.vps.buyticle.com",
                    trial_months: 2,
                    trial_start: "2026-06-11",
                    trial_end: "2026-08-11",
                    statut: "Période d'essai",
                    niu: "En cours",
                    client_name: "Acme SARL",
                    client_email: "client@acme.cm",
                  },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Facture créée", content: { "application/json": { schema: { $ref: "#/components/schemas/Invoice" } } } },
          400: { description: "Données invalides", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },
    "/api/invoices/{id}": {
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
      get: {
        tags: ["Factures"],
        summary: "Récupérer une facture",
        responses: {
          200: { description: "Facture", content: { "application/json": { schema: { $ref: "#/components/schemas/Invoice" } } } },
          404: { description: "Introuvable", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
      put: {
        tags: ["Factures"],
        summary: "Modifier une facture",
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/InvoiceInput" } } } },
        responses: {
          200: { description: "Facture mise à jour", content: { "application/json": { schema: { $ref: "#/components/schemas/Invoice" } } } },
          400: { description: "Données invalides", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
      delete: {
        tags: ["Factures"],
        summary: "Supprimer une facture",
        responses: {
          200: { description: "Supprimée", content: { "application/json": { schema: { type: "object", properties: { message: { type: "string" } } } } } },
        },
      },
    },
    "/api/invoices/{id}/download": {
      get: {
        tags: ["Factures"],
        summary: "Télécharger le PDF",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: {
          200: {
            description: "Fichier PDF de la facture",
            content: { "application/pdf": { schema: { type: "string", format: "binary" } } },
          },
          404: { description: "Introuvable", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },
    "/api/invoices/{id}/send": {
      post: {
        tags: ["Factures"],
        summary: "Envoyer par email",
        description: "Génère le PDF, l'envoie en pièce jointe à client_email, puis passe le statut à 'sent'.",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: {
          200: {
            description: "Envoyée",
            content: { "application/json": { schema: { type: "object", properties: { message: { type: "string" }, status: { type: "string" } } } } },
          },
          404: { description: "Introuvable", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          500: { description: "Erreur d'envoi (SMTP ou email client manquant)", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },
  },
  components: {
    schemas: {
      LineItem: {
        type: "object",
        properties: {
          description: { type: "string" },
          quantity: { type: "number", default: 1 },
          price: { type: "number" },
        },
        required: ["description", "price"],
      },
      InvoiceInput: {
        type: "object",
        required: ["type", "number", "client_name"],
        properties: {
          type: { type: "string", enum: ["standard", "abonnement"] },
          number: { type: "string", description: "Numéro unique de facture" },
          date: { type: "string", format: "date" },
          due_date: { type: "string", format: "date", description: "Échéance (standard)" },
          platform: { type: "string", description: "Abonnement" },
          platform_url: { type: "string", description: "Abonnement" },
          trial_months: { type: "integer", description: "Abonnement" },
          trial_start: { type: "string", format: "date", description: "Abonnement" },
          trial_end: { type: "string", format: "date", description: "Abonnement" },
          statut: { type: "string", description: "Abonnement" },
          niu: { type: "string" },
          client_name: { type: "string" },
          client_address: { type: "string" },
          client_phone: { type: "string" },
          client_email: { type: "string", format: "email" },
          items: { type: "array", items: { $ref: "#/components/schemas/LineItem" }, description: "Standard" },
          bank_info: { type: "string", description: "Standard" },
          status: { type: "string", enum: ["draft", "sent", "paid"], default: "draft" },
        },
      },
      Invoice: {
        allOf: [
          { $ref: "#/components/schemas/InvoiceInput" },
          {
            type: "object",
            properties: {
              id: { type: "string", format: "uuid" },
              created_at: { type: "string", format: "date-time" },
              updated_at: { type: "string", format: "date-time" },
            },
          },
        ],
      },
      Error: { type: "object", properties: { error: { type: "string" } } },
    },
  },
};
