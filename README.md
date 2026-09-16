# BuyFacturation — API de facturation

API REST + interface web pour **créer, afficher, télécharger (PDF) et envoyer (email)** des factures.
Construit pour **BUYTICLE ETS ** et utilisable par d'autres applications.

**Stack :** Next.js 15 (App Router) · Supabase (PostgreSQL) · @react-pdf/renderer · Nodemailer · déployé sur Vercel.

---

## Sommaire

- [Démarrage rapide](#démarrage-rapide)
- [Variables d'environnement](#variables-denvironnement)
- [Base de données (Supabase)](#base-de-données-supabase)
- [Référence de l'API](#référence-de-lapi)
  - [Créer une facture](#créer-une-facture)
  - [Lister les factures](#lister-les-factures)
  - [Récupérer une facture](#récupérer-une-facture)
  - [Modifier une facture](#modifier-une-facture)
  - [Supprimer une facture](#supprimer-une-facture)
  - [Télécharger le PDF](#télécharger-le-pdf)
  - [Envoyer par email](#envoyer-par-email)
- [Modèle de données](#modèle-de-données)
- [Exemples cURL (Windows / Linux)](#exemples-curl)
- [Intégration depuis une autre app](#intégration-depuis-une-autre-app)
- [Interface web](#interface-web)
- [Déploiement Vercel](#déploiement-vercel)

---

## Démarrage rapide

```bash
# 1. Installer les dépendances
npm install

# 2. Créer le fichier .env.local (voir plus bas)
cp .env.local.example .env.local

# 3. Créer la table dans Supabase (voir section Base de données)

# 4. Lancer en local
npm run dev
# → http://localhost:3000
```

---

## Variables d'environnement

Fichier `.env.local` (local) ou variables Vercel (production) :

| Variable | Description | Exemple |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL du projet Supabase | `https://xxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé publique (anon) | `eyJhbGci...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé service_role (backend, contourne le RLS) | `eyJhbGci...` |
| `SMTP_HOST` | Serveur SMTP | `smtp.gmail.com` |
| `SMTP_PORT` | Port SMTP | `587` |
| `SMTP_SECURE` | TLS direct (true pour 465) | `false` |
| `SMTP_USER` | Utilisateur SMTP | `moi@gmail.com` |
| `SMTP_PASS` | Mot de passe d'application | `xxxx` |
| `SMTP_FROM` | Expéditeur affiché | `BUYTICLE ETS <noreply@buyticle.com>` |

> Les variables SMTP ne sont nécessaires que pour l'endpoint **envoyer par email**.

---

## Base de données (Supabase)

Dans **Supabase → SQL Editor → New query**, colle le contenu de [`supabase/schema.sql`](./supabase/schema.sql) puis **Run**.

Cela crée la table `invoices`, les index et le trigger `updated_at`.

---

## Référence de l'API

Base URL : `https://<ton-app>.vercel.app` (ou `http://localhost:3000` en local).

Toutes les réponses sont en JSON, sauf le téléchargement PDF (`application/pdf`).

### Créer une facture

`POST /api/invoices`

**Body (facture standard) :**
```json
{
  "type": "standard",
  "number": "FAC-2026-001",
  "date": "2026-06-11",
  "due_date": "2026-07-11",
  "niu": "P070418499910G",
  "client_name": "Acme SARL",
  "client_email": "client@acme.cm",
  "client_phone": "+237 699 00 00 00",
  "client_address": "Akwa, Douala",
  "items": [
    { "description": "Développement site web", "quantity": 1, "price": 500000 }
  ],
  "bank_info": "UBA Cameroun — Compte N° 12345"
}
```

**Body (facture abonnement) :**
```json
{
  "type": "abonnement",
  "number": "FAC-CAMILLE-2026-001",
  "date": "2026-06-11",
  "platform": "Camille",
  "platform_url": "camille.vps.buyticle.com",
  "trial_months": 2,
  "trial_start": "2026-06-11",
  "trial_end": "2026-08-11",
  "statut": "Période d'essai",
  "niu": "En cours",
  "client_name": "Acme SARL",
  "client_email": "client@acme.cm"
}
```

**Réponse `201` :** l'objet facture complet avec son `id`.

---

### Lister les factures

`GET /api/invoices`

**Query params (optionnels) :**

| Param | Description |
|-------|-------------|
| `type` | `standard` ou `abonnement` |
| `status` | `draft`, `sent` ou `paid` |
| `search` | recherche sur le n° de facture et le nom du client |
| `page` | page (défaut `1`) |
| `limit` | éléments par page (défaut `20`) |

**Réponse `200` :**
```json
{ "invoices": [ ... ], "total": 42, "page": 1, "limit": 20 }
```

---

### Récupérer une facture

`GET /api/invoices/:id` → l'objet facture, ou `404`.

---

### Modifier une facture

`PUT /api/invoices/:id` → même body que la création (champs à mettre à jour). Renvoie la facture mise à jour.

---

### Supprimer une facture

`DELETE /api/invoices/:id` → `{ "message": "Facture supprimée" }`.

---

### Télécharger le PDF

`GET /api/invoices/:id/download`

Renvoie un fichier **PDF** (`Content-Type: application/pdf`) avec la mise en page BUYTICLE (standard ou abonnement selon le `type`).

---

### Envoyer par email

`POST /api/invoices/:id/send`

Génère le PDF, l'envoie en pièce jointe à `client_email`, puis passe le `status` de la facture à `sent`.

**Réponse `200` :**
```json
{ "message": "Facture envoyée à client@acme.cm", "status": "sent" }
```

> Nécessite les variables `SMTP_*` configurées, et un `client_email` renseigné.

---

## Modèle de données

Table `invoices` :

| Colonne | Type | Notes |
|---------|------|-------|
| `id` | uuid | généré automatiquement |
| `type` | text | `standard` \| `abonnement` |
| `number` | text | **unique** |
| `date` | date | date d'émission |
| `due_date` | date | échéance (standard) |
| `platform`, `platform_url` | text | abonnement |
| `trial_months` | int | abonnement |
| `trial_start`, `trial_end` | date | abonnement |
| `statut` | text | abonnement |
| `niu` | text | identifiant fiscal |
| `client_name` | text | **requis** |
| `client_address`, `client_phone`, `client_email` | text | |
| `items` | jsonb | `[{ description, quantity, price }]` (standard) |
| `bank_info` | text | infos de paiement (standard) |
| `status` | text | `draft` \| `sent` \| `paid` (défaut `draft`) |
| `created_at`, `updated_at` | timestamptz | automatiques |

---

## Exemples cURL

### Linux / macOS

```bash
# Créer
curl -X POST https://<app>.vercel.app/api/invoices \
  -H "Content-Type: application/json" \
  -d '{"type":"standard","number":"FAC-2026-001","date":"2026-06-11","client_name":"Acme SARL","client_email":"client@acme.cm","items":[{"description":"Dev site","quantity":1,"price":500000}]}'

# Lister
curl https://<app>.vercel.app/api/invoices

# Télécharger le PDF
curl https://<app>.vercel.app/api/invoices/<ID>/download --output facture.pdf

# Envoyer par email
curl -X POST https://<app>.vercel.app/api/invoices/<ID>/send
```

### Windows (CMD)

> Sur Windows, échapper les guillemets avec `\"`. Ajouter `-k` si erreur SSL `CRYPT_E_NO_REVOCATION_CHECK`.

```cmd
:: Créer
curl -k -X POST https://<app>.vercel.app/api/invoices -H "Content-Type: application/json" -d "{\"type\":\"standard\",\"number\":\"FAC-2026-001\",\"date\":\"2026-06-11\",\"client_name\":\"Acme SARL\",\"client_email\":\"client@acme.cm\",\"items\":[{\"description\":\"Dev site\",\"quantity\":1,\"price\":500000}]}"

:: Télécharger dans le dossier Téléchargements et ouvrir
curl -k https://<app>.vercel.app/api/invoices/<ID>/download --output "%USERPROFILE%\Downloads\facture.pdf" && start "%USERPROFILE%\Downloads\facture.pdf"
```

---

## Intégration depuis une autre app

L'API est sans état et consommable depuis n'importe quel client (web, mobile, backend).

```js
// Créer une facture depuis une autre application JS
const res = await fetch("https://<app>.vercel.app/api/invoices", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    type: "standard",
    number: "FAC-2026-001",
    date: "2026-06-11",
    client_name: "Acme SARL",
    client_email: "client@acme.cm",
    items: [{ description: "Dev site", quantity: 1, price: 500000 }],
  }),
});
const invoice = await res.json();

// Lien de téléchargement direct du PDF
const pdfUrl = `https://<app>.vercel.app/api/invoices/${invoice.id}/download`;
```

---

## Interface web

| Route | Accès | Description |
|-------|-------|-------------|
| `/login` | public | Connexion (Supabase Auth) |
| `/dashboard` | protégé | Tableau de bord (métriques + factures récentes) |
| `/invoices` | protégé | Liste avec recherche et filtres |
| `/invoices/new` | protégé | Formulaire de création (standard / abonnement) avec aperçu |
| `/invoices/[id]` | protégé | Détail + Télécharger / Envoyer / Lien de paiement |
| `/invoices/[id]/edit` | protégé | Modification |
| `/transactions` | protégé | Vue centralisée des encaissements |
| `/docs` | protégé | Documentation Swagger interactive |
| `/pay/[id]` | **public** | Page de paiement mobile money d'une facture |

---

## Authentification (Supabase Auth)

L'interface admin est protégée par un login email/mot de passe via **Supabase Auth**. L'API REST et les pages `/pay/[id]` restent publiques.

**Créer un compte admin :** Supabase Dashboard → **Authentication → Users → Add user** (email + mot de passe, cocher « Auto Confirm »). Il n'y a pas d'inscription publique.

Le middleware (`middleware.js`) protège `/dashboard`, `/invoices`, `/transactions`, `/docs` et redirige vers `/login`.

---

## Paiement mobile money (PawaPay)

Chaque facture est payable en **MTN MoMo** ou **Orange Money** via PawaPay. La couche paiement est **abstraite** (`lib/payments/`) : PawaPay est un adaptateur, on peut brancher CinetPay plus tard sans toucher au reste.

### Mise en place

1. Exécuter [`supabase/transactions.sql`](./supabase/transactions.sql) dans le SQL Editor (table `transactions` centralisée).
2. Ajouter les variables `PAWAPAY_*` (voir plus bas). Commencer par le **sandbox**.
3. Configurer l'URL de webhook dans le dashboard PawaPay : `https://pay.buyticle.com/api/webhooks/pawapay`.

### Flux

```
Facture → /pay/{id} → client choisit MTN/Orange + numéro
   → POST /api/invoices/{id}/pay  (crée transaction PENDING + appelle PawaPay)
   → push USSD sur le téléphone → client valide
   → PawaPay → POST /api/webhooks/pawapay  (source de vérité → facture PAYÉE)
   → le front poll GET /api/transactions/{id}/status
```

### Endpoints paiement

| Méthode | Route | Accès | Rôle |
|---------|-------|-------|------|
| `POST` | `/api/invoices/{id}/pay` | public | Initier un paiement `{ numero, operateur }` |
| `GET` | `/api/transactions/{id}/status` | public | Polling du statut |
| `POST` | `/api/webhooks/pawapay` | public | Callback PawaPay (confirmation) |

### Variables PawaPay

| Variable | Description |
|----------|-------------|
| `PAWAPAY_API_TOKEN` | Token API (dashboard PawaPay) |
| `PAWAPAY_BASE_URL` | `https://api.sandbox.pawapay.io` (sandbox) ou `https://api.pawapay.io` (prod) |
| `PAWAPAY_WEBHOOK_SECRET` | Secret de vérification du webhook (optionnel) |
| `PAWAPAY_CORRESPONDENT_MTN` | Code opérateur MTN (`MTN_MOMO_CMR`) |
| `PAWAPAY_CORRESPONDENT_ORANGE` | Code opérateur Orange (`ORANGE_CMR`) |
| `PAYMENT_DEFAULT_PROVIDER` | `pawapay` |

> **Source de vérité = le webhook / le statut PawaPay**, jamais le retour immédiat du front. `raw_webhook` est conservé pour l'audit.

---

## Déploiement Vercel

1. Connecter le repo GitHub à Vercel (framework détecté : **Next.js**).
2. Ajouter les [variables d'environnement](#variables-denvironnement) dans **Settings → Environment Variables** (ou importer le fichier `.env`).
3. Déployer.

> Les pages qui lisent la base sont en `force-dynamic` : aucun appel Supabase n'est fait au build, donc le build ne dépend pas des variables d'environnement.

---

## Structure du projet

```
middleware.js                 # protège les routes admin (Supabase Auth)
app/
├── api/
│   ├── invoices/
│   │   ├── route.js          # GET (liste) + POST (créer)
│   │   └── [id]/
│   │       ├── route.js      # GET + PUT + DELETE
│   │       ├── download/     # GET → PDF
│   │       ├── send/         # POST → email
│   │       └── pay/          # POST → initier paiement
│   ├── transactions/[id]/status/  # GET → polling statut
│   ├── webhooks/pawapay/     # POST → callback PawaPay
│   └── openapi/              # spec OpenAPI
├── login/page.js             # connexion
├── dashboard/page.js
├── invoices/ …               # liste / new / [id] / edit
├── transactions/page.js      # vue centralisée
├── pay/[id]/page.js          # page de paiement publique
├── docs/page.js              # Swagger UI
└── layout.js
components/                    # Sidebar, formulaires, aperçus, PaymentForm
lib/
├── supabase.js               # client service-role (API, lazy)
├── supabase/client.js        # client navigateur (auth)
├── supabase/server.js        # client serveur lié aux cookies (auth)
├── payments/
│   ├── provider.js           # interface PaymentProvider
│   ├── pawapay.js            # adaptateur PawaPay
│   └── index.js              # sélecteur de provider
├── invoice-utils.js          # total facture + normalisation numéro
├── pdf.js · email.js · openapi.js
supabase/
├── schema.sql                # table invoices
└── transactions.sql          # table transactions
```
