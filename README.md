# OutFitMaker

OutFitMaker is an AI-assisted fashion storefront. It serves a t-shirt catalog with
live stock, real user accounts and orders, and two machine-learning features:
**Find My Size** (predicts your size from body measurements) and **AI Style Finder**
(upload a photo, get visually similar products).

This repository holds the complete platform — one place for the backend, frontend,
and the files that power the AI service.

## What's in here

| Part | Stack | Where |
| --- | --- | --- |
| Backend API | ASP.NET Core (.NET 10) · EF Core · Identity + JWT · SQL Server | `Outfit_Maker_DotNet/OutFitMaker.API` |
| Storefront | React (Vite) · TypeScript · Tailwind CSS v4 | `outfitmaker-frontend/` |
| AI service | Python · Flask · TensorFlow · scikit-learn | `AI Models/Product Recommendation/` |

## Features

- Shop with gender/collection filters, search, and best-seller views
- Product details show per-size stock — unavailable sizes are disabled
- Cart and checkout that reserve real stock from the database
- Accounts with registration, sign-in, favorites, and order history
- **Find My Size** — body measurements in, size prediction out (RandomForest model)
- **AI Style Finder** — quick visual search over the catalog using ResNet50
  image embeddings and nearest-neighbours
- Orders record a size for every item, validated against stock

## How it fits together

The React app talks to the ASP.NET Core API. The API handles authentication,
orders, favorites, and all data access through EF Core against SQL Server, and
it proxies the two AI features to the small Flask service. That keeps the
machine-learning code isolated from the storefront logic.

## Run it locally

1. **Database** — restore the SQL Server database from `OutFitMaker.bak`
   (local copy). Alternatively, start the API once and it applies the EF
   migrations automatically, then load the catalog with `seed_data.sql` and
   `seed_stock.sql`.
2. **AI service** — start Flask on port 5000:

   ```bash
   cd "AI Models/Product Recommendation"
   pip install -r requirements.txt
   python API.py
   ```

3. **API** — run the `OutFitMaker.API` project (development binds to
   `http://localhost:5111`).
4. **Frontend**:

   ```bash
   cd outfitmaker-frontend
   npm install
   npm run dev      # http://localhost:5173
   ```

## Deployment

- **API** — MonsterASP (Windows hosting, .NET 10). Publish the API project and,
  on the host, set these environment variables: `ConnectionStrings__OutFitMakerConnection`,
  `JWT__Key`, `EncryptionKey__Key`, `AI__PredictionUrl`, `AI__RecommendationUrl`,
  and `Cors__AllowedOrigins__0`. Migrations apply on first start; run
  `seed_data.sql` and `seed_stock.sql` once afterwards.
- **Frontend** — Cloudflare Pages. Build with `npm run build` (output:
  `dist`), set `VITE_API_URL` to the deployed API origin, and keep the
  `public/_redirects` SPA fallback.
- **AI** — Render.com free tier (Docker web service). Point Render at this repo
  with the root directory `AI Models/Product Recommendation`, where it builds the
  `Dockerfile` and serves `/predict`, `/recommend`, and `/health`. A free
  UptimeRobot ping on `/health` keeps the sleeping free instance warm.

## About the AI models

The size classifier and the visual-recommendation models were built as a
separate AI team deliverable (training notebooks live next to the Flask app in
`AI Models/Product Recommendation/`). The work in this repository integrates
those models — wrapping them in HTTP endpoints, feeding them real product data,
and surfacing them in the storefront.

## Author

Full-stack project (graduation): ASP.NET Core API, React storefront, and the
integration of both are mine; the AI models themselves are credited to the AI
team as noted above.