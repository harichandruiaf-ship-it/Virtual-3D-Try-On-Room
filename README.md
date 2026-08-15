# Virtual 3D Try-On Room

A production-grade virtual fitting room: upload a reference image, get a 3D body model (face, height, proportions, measurements), then browse a catalog and try on clothes. Designed for easy integration with e-commerce via an embeddable widget and headless API.

## Features

- **Upload**: Image (JPEG/PNG/WebP, max 20 MB). Height and optional gender for measurements.
- **Body mesh**: fal.ai **SAM 3D Body** for user GLB (set `FAL_KEY`); placeholder measurements scaled by height (optional AI Sizing API).
- **Garment mesh**: fal.ai **Hyper3D Rodin v2** (`POST /api/catalog/generate-3d`) for dress/product image → GLB; optional attach to a catalog item. Try-on room loads `modelUrl` when set; otherwise procedural + texture. See `/admin/catalog-tools`.
- **3D viewer**: Load user GLB or parametric fallback; orbit controls and lighting.
- **Catalog**: Static catalog + optional sync from merchants (`POST /api/catalog/sync`).
- **Size recommendation**: From model measurements + product size chart; shown on catalog cards and via API.
- **Virtual dressing**: Select items to “try on” (state); recommended size and fit score.
- **Headless API**: Create session, upload, get model, size recommendation, embed URL.
- **Embeddable script**: One script tag + `TryOnRoom.init({ container, productId?, variantId? })` for “Try on” on product pages.
- **E-commerce ready**: Optional `TRYON_API_KEY` and rate limiting for cross-origin embeds; CORS-friendly.

## Quick start

```bash
cp .env.example .env
# Set FAL_KEY for real 3D reconstruction (optional)
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Use **Create my 3D model** to upload a photo and height, then **Go to try-on room** to see the avatar and catalog.

## Environment

| Variable | Description |
|--------|-------------|
| `FAL_KEY` | fal.ai API key for SAM 3D Body (GLB output). Without it, a placeholder model is used. The image is sent to fal as base64, so it works on localhost—no public URL needed. |
| `TRYON_API_KEY` | Optional. When set, cross-origin API calls must send `Authorization: Key <key>`; rate limit applies per key. |

## Headless API

- `POST /api/sessions` – Create session. Body: `{ merchantId?, productId?, variantId? }`. Returns `{ sessionId, status }`.
- `POST /api/sessions/:id/upload` – Upload reference image and run analysis. FormData: `file`, `heightCm` (required), `gender?`. Returns `{ model, status }`.
- `GET /api/sessions/:id` – Session status.
- `GET /api/sessions/:id/model` – Model when status is `ready`.
- `GET /api/products/:id/size-recommendation?model_id=xxx` – Size recommendation for a product.
- `GET /api/embed?product_id=...&variant_id=...&session_id=...` – Returns `{ embedUrl }`.
- `GET /api/catalog?merchant_id=...` – List catalog.
- `POST /api/catalog/sync` – Sync merchant catalog. Body: `{ merchantId, products: CatalogItem[] }`.
- `POST /api/catalog/generate-3d` – Rodin v2 image→GLB. FormData: `file` (image), optional `catalogItemId` to patch that item’s `modelUrl`. Returns `{ modelUrl, seed?, catalogItemId? }`.

## Embed on e-commerce sites

Add the script and a container, then init:

```html
<script src="https://your-tryon-domain.com/embed.js"></script>
<div id="tryon-root"></div>
<script>
  TryOnRoom.init({
    container: '#tryon-root',
    productId: '123',
    variantId: '456',
    buttonText: 'Try on',
    openInNewTab: true
  });
</script>
```

Or open the room programmatically: `TryOnRoom.open({ productId, variantId, openInNewTab: true })`.

## Production checklist

- **Storage**: Replace in-memory session/model stores with PostgreSQL (or similar) and file storage with S3/R2 for uploads and GLBs.
- **Rate limiting**: Replace in-memory rate limit with Redis (or your platform’s limit) for multi-instance deployments.
- **CDN**: Serve `embed.js` and GLB URLs from a CDN; ensure CORS allows merchant origins.
- **GDPR**: Add data retention (e.g. delete uploads after processing); implement session/model deletion and document consent.
- **Catalog sync**: For Shopify/WooCommerce, call `POST /api/catalog/sync` from a cron or webhook with the store’s product list (and optional 3D asset URLs).

## Tech stack

- Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS
- Zustand (state), React Three Fiber + Three.js + drei (3D viewer)
- fal.ai SAM 3D Body (3D mesh), placeholder measurements (optional AI Sizing)
