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

| Route | Description |
|-------|-------------|
| `/dashboard` | Tableau de bord (métriques + factures récentes) |
| `/invoices` | Liste avec recherche et filtres |
| `/invoices/new` | Formulaire de création (standard / abonnement) avec aperçu |
| `/invoices/[id]` | Détail + aperçu + boutons Télécharger / Envoyer |
| `/invoices/[id]/edit` | Modification |

---

## Déploiement Vercel

1. Connecter le repo GitHub à Vercel (framework détecté : **Next.js**).
2. Ajouter les [variables d'environnement](#variables-denvironnement) dans **Settings → Environment Variables** (ou importer le fichier `.env`).
3. Déployer.

> Les pages qui lisent la base sont en `force-dynamic` : aucun appel Supabase n'est fait au build, donc le build ne dépend pas des variables d'environnement.

---

## Structure du projet

```
app/
├── api/invoices/
│   ├── route.js              # GET (liste) + POST (créer)
│   └── [id]/
│       ├── route.js          # GET + PUT + DELETE
│       ├── download/route.js # GET → PDF
│       └── send/route.js     # POST → email
├── dashboard/page.js
├── invoices/
│   ├── page.js               # liste
│   ├── new/page.js
│   └── [id]/
│       ├── page.js           # détail
│       └── edit/page.js
└── layout.js
components/                    # Sidebar, formulaire, aperçus, actions
lib/
├── supabase.js               # client Supabase (lazy)
├── pdf.js                    # génération PDF (@react-pdf/renderer)
└── email.js                  # envoi email (Nodemailer)
supabase/schema.sql           # schéma de la base
```
