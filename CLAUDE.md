# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Room Rental Management System — a single-user LAN web app for managing room rentals (Vietnamese: quản lí cho thuê phòng trọ). No internet access required.

## Development Commands

From the repo root:

```bash
npm run dev          # Run client (Vite :5173) + server (nodemon :3001) concurrently
npm run lint         # ESLint across client + server
node scripts/seed.js # Seed MongoDB with sample data (reads server/.env)
```

Server only:
```bash
cd server && npm run dev    # nodemon src/index.js
cd server && npm run seed   # Alternative seed path (uses src/seed.js)
```

Client only:
```bash
cd client && npm run dev    # Vite dev server
```

Production (Docker):
```bash
docker compose up -d        # Start mongo + server + client (nginx)
docker compose down
```

Production (PM2):
```bash
pm2 start ecosystem.config.js   # Runs server/src/index.js as 'room-rental-server'
```

`.env` lives in `server/.env` (not repo root).

## Architecture

**3-tier stack:**
```
React SPA (Vite + Ant Design + TanStack Query + React Hook Form + Zod)
  │ HTTP REST /api
Node.js / Express
  Morgan → Router → validate(Zod) → Controller → Service → Mongoose
  Puppeteer (PDF) · ExcelJS · Winston
  │ Mongoose ODM
MongoDB (14 collections)
```

**Request pipeline:** `Morgan → cors → helmet → express.json → Router → validate(Zod) → Controller → Service → Mongoose → DB → errorHandler`

All errors are caught by the global `errorHandler` middleware and returned as `{ success: false, error }`. All successful responses return `{ success, data }`.

## Directory Structure

```
├── client/src/
│   ├── api/           Axios functions — 1 file per domain (e.g. hopDong.api.js)
│   ├── hooks/         TanStack Query wrappers (useQuery + useMutation)
│   ├── pages/         1 folder per domain, 1 file per route
│   ├── components/    Shared UI: StatusBadge, ConfirmDeleteModal, PhongSelector, etc.
│   └── utils/         ngayThang.js (Day.js helpers), format.js
│
├── server/src/
│   ├── models/        Mongoose schemas (14 files)
│   ├── routes/        Express routers
│   ├── controllers/   Parse req → call service → send res (no business logic here)
│   ├── services/      All business logic (no HTTP awareness)
│   ├── middlewares/   validate.js (Zod) · errorHandler.js
│   └── config/        db.js · logger.js (Winston + Morgan)
│
├── scripts/           seed.js (sample data) · generate-report.js
│
├── shared/schemas/    Zod schemas shared between client and server
└── docs/              Design documents (architecture, DB design, module specs)
```

## Key Patterns

### Shared Zod Schemas
Schemas in `shared/schemas/` are imported by both sides:
- **Server**: `middlewares/validate.js` accepts a schema, validates `req.body`/`req.params`, returns 400 on failure
- **Client**: `useForm({ resolver: zodResolver(schema) })` from React Hook Form

Never duplicate validation logic — write it once in `shared/schemas/`.

### Service Layer
Controllers are thin (parse request, call service, send response). All business logic lives in services. Services are pure — no access to `req`/`res`. This is especially important for complex flows like invoice calculation (`hoaDon.service.js`) which cross multiple modules.

### Append-Only Collections
`DonGiaDichVu` and `LichSuGiaThuPhong` are **never updated or deleted**. To get the current effective price, query with `ngay_ap_dung ≤ target_date`, sort `-ngay_ap_dung`, limit 1.

### Snapshot Fields
`HopDong.gia_thue_ky_hop_dong` and all `don_gia_*` / `so_nguoi_o` fields in `HoaDon` are snapshots captured at creation time. Do not recompute them from current data — they preserve historical accuracy of printed documents.

### Axios Instance
All API calls go through `api/axiosInstance.js` which unwraps `data`/`error` from responses and centralizes error toasts. Never use `fetch` or raw `axios` directly in components.

### TanStack Query
Server state (data from API) is managed by TanStack Query, not local state. After mutations, invalidate the relevant query keys so the UI updates automatically.

## Cross-Module Dependencies

The Invoice service (`hoaDon.service.js`) depends on two exported helpers:
- `getDonGiaHieuLuc(loai_phong_id, loai_dv, ngay)` from `services/donGia.service.js` (M-S02)
- `getSoNguoiOTrongThang(hop_dong_id, thang, nam)` from `services/hopDong.service.js` (M-S06)

Settlement and cancellation are both in `thanhLy.service.js` — there is no separate `huyHopDong.service.js`. Both trigger room status transitions (`cho_thue → trong`) and access `HoaDon` to calculate outstanding debt.

## Pending Modules (models exist, routes not yet registered)

The following have Mongoose models and Zod schemas but no routes wired into `server/src/index.js`:
- **M-S08 Repairs** — `SuaChua` model, `suaChua.schema.js`; room `trong → sua_chua → trong`
- **M-S09 Operating Costs** — `ChiPhiVanHanh` model; `khu_id` nullable (null = all areas)
- **M-S12 PDF Printing** — Puppeteer dep installed; `server/src/templates/` not created yet
- **M-S13 Excel Export** — ExcelJS dep installed; no service/route yet

When implementing these, register routes in `server/src/index.js` and follow existing patterns.

## Route Ordering Rules

Within Express router files, specific route ordering is required to prevent `/:id` from swallowing named paths:

- `phong.routes.js`: `/trong` → `/:id/lich-su-gia` → `/:id`
- `donGia.routes.js`: `/lich-su` → `/`
- `datCoc.routes.js`: `/phong/:phong_id` → `/` → `/:id/huy`
- `hoaDon.routes.js`: `/cho-lap` → `/tinh-truoc` → `/` → `/:id/thanh-toan`
- `App.jsx` (client): `/hop-dong/tao` before `/hop-dong/:id`; `/hoa-don/lap` before `/hoa-don`

## Room Status Machine

```
trong    → cho_thue   (contract signing)
trong    → dat_coc    (deposit)
trong    → sua_chua   (repair request)
dat_coc  → cho_thue   (contract from deposit)
dat_coc  → trong      (deposit cancellation)
cho_thue → trong      (settlement or cancellation)
sua_chua → trong      (repair completion)
```

Status transitions are enforced in the service layer, not controllers.

## MongoDB Conventions

- Collection names: lowercase plural (`phongs`, `hopdongs`, `hoadons`)
- Field names: `snake_case`
- All refs use `ObjectId`
- `khu_id` is nullable on `ChiPhiVanHanh` (null = applies to all areas)
- `loai_phong_id` is nullable on `DonGiaDichVu` for shared service types (`ve_sinh`, `xe_may`, `xe_dap`)

## Environment Variables

Managed via `server/.env` (never committed). Key vars:
- `MONGODB_URI` — MongoDB connection string
- `PORT` — Express server port (default 3001)
- `CLIENT_URL` — Origin for CORS (dev: `http://localhost:5173`)

In Docker Compose, these are injected via `environment:` in `docker-compose.yml`.
