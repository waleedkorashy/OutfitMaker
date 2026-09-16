# OutFitMaker Frontend

Premium AI-powered fashion e-commerce frontend for the OutFitMaker platform.

Built with **Vite + React + TypeScript + Tailwind CSS v4**.

## Features

- **Home** — editorial hero + AI feature introduction + best sellers
- **Shop** — product listing with gender & unique-piece filters and search
- **Categories** — browse by gender / collection
- **Product Details** — imagery, size selector, add to cart, wishlist, related styles
- **AI Style Finder** — upload a clothing photo; ResNet50-based visual similarity finds matching products
- **Find My Size** — body measurements → ML size prediction
- **Favorites** — heart to save products (requires sign-in)
- **Cart** — slide-out drawer with quantity controls and checkout

## Tech / architecture

- `src/services/` — axios layer wrapping the real ASP.NET API endpoints (no invented contracts)
- `src/context/` — Auth, Cart, Favorites providers
- `src/utils/imageHelper.ts` — single source of truth for image URL normalization
  (handles Windows backslashes, bare filenames, absolute URLs, and a fallback image)
- `src/components/ui/` — reusable ProductCard, loading/error/empty states, favorite buttons

## Getting started

### 1. Run the backend

The frontend talks to the ASP.NET Core API which, in turn, proxies to the Python AI service.

- Restore the SQL database from `OutFitMaker.bak`, or run the API once so its
  EF migrations create the schema, then run `seed_data.sql` and `seed_stock.sql`
  to load the catalog.
- Run the `OutFitMaker.API` project on `http://localhost:5111`.
- Ensure the AI service is running on port `5000` (as the backend expects).

### 2. Run the frontend

```bash
cd outfitmaker-frontend
npm install
npm run dev
```

Open http://localhost:5173

### API base URL

The API base defaults to `http://localhost:5111`. Override with an env var:

```
VITE_API_URL=https://your-api.example.com
```

Create a `.env.local` file to override without touching version-controlled files.

## Preview / build

```bash
npm run build   # type-check + production build
npm run preview
```

## Conventions

- **Do not** create fake API endpoints — every service call maps to a real controller route.
- **Do not** expose raw AI image filenames — always route through `resolveImageUrl()`.
- All user-facing errors are friendly; raw exceptions are never shown.
