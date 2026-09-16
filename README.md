# OutFitMaker

**AI-powered fashion e-commerce platform** — a full-stack storefront with live
stock, real orders, and two on-device machine-learning features: **Find My Size**
(predicts your fit from body measurements) and **AI Style Finder** (upload a
photo, get visually similar products from the catalog).

> Deployed end-to-end and live: React frontend on Cloudflare, ASP.NET Core API on
> Windows hosting with SQL Server, and a Python Flask AI service in a container.
>
> **🔗 Visit the live site: [outfit-maker.wqorashy.workers.dev](https://outfit-maker.wqorashy.workers.dev)**

---

## Highlights

- **Full-stack delivery** — complete platform in one repo: REST API, SQL schema
  + seed data, React SPA, and the ML service.
- **Real commerce logic** — accounts, favorites, cart/checkout, per-size stock
  that actually decrements, and size validation on every order.
- **Practical ML integration** — a size-prediction model and a visual-similarity
  engine, both wired into real product data and shipped to production.
- **Production engineering** — JWT auth, EF Core migrations, lazy model
  loading to fit a 512 MB memory cap, browser-to-model CORS, CI-friendly
  `wrangler` static deploy, and graceful cold-start handling.
- **Runs on free-tier infrastructure** — designed and optimized to work within
  genuinely constrained hosting (memory, CPU, and idle-sleep limits).

---

## The two AI features

| Feature | How it works |
| --- | --- |
| **Find My Size** | A RandomForest classifier turns weight, age, height, waist, hip, and body-shape measurements into a size recommendation (`XXS`–`XXXL`). |
| **AI Style Finder** | A **MobileNetV2** embedding (GlobalMaxPooling + cosine-normalized) converts a photo into a vector; `k`-nearest-neighbours search returns the closest catalog items. |

The models are served by a small FastAPI/Flask-style HTTP service and are called
**directly from the browser** (CORS), keeping the ML layer fully decoupled from
the storefront and the API.

---

## Architecture

```
┌─────────────────────┐      HTTPS/CORS       ┌──────────────────────┐
│  React + Vite SPA   │ ───────────────────▶ │  Python Flask AI      │
│  (Cloudflare)       │  /predict /recommend │  (TF MobileNetV2 +    │
└──────────┬──────────┘                      │   sklearn container)  │
           │ REST (JSON + JWT)               └──────────────────────┘
           ▼
┌─────────────────────┐
│  ASP.NET Core API   │  EF Core ──▶ SQL Server
│  (.NET 10)          │  Identity + JWT + stock/order logic
└─────────────────────┘
```

---

## Tech stack

| Layer | Technology |
| --- | --- |
| **API** | ASP.NET Core (.NET 10) · EF Core · ASP.NET Identity · JWT · SQL Server |
| **Frontend** | React · TypeScript · Vite · Tailwind CSS v4 · Axios · React Router |
| **AI** | Python · Flask · TensorFlow/Keras (MobileNetV2) · scikit-learn · NumPy |
| **Infrastructure** | Cloudflare (static deploy) · Windows/IIS hosting · Docker container |

---

## Features

- Gender/collection filters, search, and best-seller views
- Product pages with per-size stock levels — unavailable sizes disabled
- Cart and checkout that reserve real stock atomically
- Registration, sign-in, favorites, and order history
- Size prediction and photo-based visual search (see AI table above)
- Responsive, accessible UI across the whole shopping flow

---

## Repository layout

| Path | Contents |
| --- | --- |
| `OutFit_Maker_DotNet/OutFitMaker.API` | ASP.NET Core API, EF Core data layer, migrations, seed scripts |
| `outfitmaker-frontend/` | React + TypeScript storefront (Vite, Tailwind) |
| `AI Models/Product Recommendation/` | Flask service, trained models, Dockerfile, embeddings |

---

## Run locally

```bash
# 1. AI service
cd "AI Models/Product Recommendation"
pip install -r requirements.txt
python API.py                       # http://localhost:5000

# 2. API
# Run OutFitMaker.API in Visual Studio (binds http://localhost:5111).
# EF migrations apply on first start; then load seed_data.sql + seed_stock.sql.

# 3. Frontend
cd outfitmaker-frontend
npm install
npm run dev                        # http://localhost:5173
```

The frontend defaults to the local API; point `VITE_API_URL` at any deployed
origin to switch environments.

---

## Notes

- **Data model** — the size classifier and visual-recommendation models were
  produced as a separately-trained deliverable (notebooks live beside the Flask
  app); the focus of this repo is productionizing them: HTTP endpoints, product
  data integration, and the storefront UX.
- **Sizing model input order** — `weight, age, height, waist, hips, body_shape`
  as defined in `FindSizePage`.

---

## Author

Full-stack project by **Waleed Korashy** — ASP.NET Core API, React storefront,
and end-to-end integration of all three tiers, optimized and deployed on
free-tier infrastructure.