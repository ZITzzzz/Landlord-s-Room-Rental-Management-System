# Architecture — Room Rental Management System

---

## 1. Overview

```
Browser (LAN)
  └── React SPA (Vite · Ant Design · TanStack Query · React Hook Form · Zod · Day.js · Recharts)
        │ HTTP REST /api
        ▼
  Node.js / Express
  Morgan → Router → validate(Zod) → Controller → Service → Mongoose
  Puppeteer (PDF) · ExcelJS · Winston (logging)
        │ Mongoose ODM
        ▼
  MongoDB  —  13 collections · ObjectId refs · indexes
```

**Key traits:** 3-layer architecture · single-user · LAN · no internet required · Zod schemas shared between client and server

---

## 2. Directory Structure

```
├── client/src/
│   ├── api/          Axios functions (1 file per domain)
│   ├── hooks/        TanStack Query wrappers
│   ├── pages/        1 folder/domain → 1 file/route
│   ├── components/   Reusable UI (StatusBadge, ConfirmDeleteModal, ...)
│   └── utils/        ngayThang.js (Day.js), format.js
│
├── server/src/
│   ├── models/       Mongoose schemas (13 files)
│   ├── routes/       Express routers
│   ├── controllers/  Receive req → call service → send res
│   ├── services/     Pure business logic (no HTTP awareness)
│   ├── middlewares/  validate.js · errorHandler.js
│   ├── templates/    HTML for Puppeteer (hopDong, hoaDon, thanhLy, huy)
│   └── config/       db.js · logger.js
│
├── shared/schemas/   Shared Zod schemas
├── docker-compose.yml
└── .env
```

> For per-module file details (models, routes, controllers, services, pages, hooks) see [ModulesStructure.md](./ModulesStructure.md)

---

## 3. MongoDB Collections & Relationships

```
Khu ──1:N──► Phong ──1:N──► LichSuGiaThuPhong
                │
                ├──1:N──► DatCoc ◄──── KhachHang
                │
                └──1:N──► HopDong ◄─── KhachHang
                               │
                               ├──1:N──► LichSuGiaHan
                               ├──1:N──► NguoiO
                               └──1:N──► HoaDon

LoaiPhong ──1:N──► Phong
          └──1:N──► DonGiaDichVu   (append-only, always fetch the most recent record by date)

Phong ──1:N──► SuaChua
Khu   ──1:N──► ChiPhiVanHanh (nullable khu_id)
```

**Indexes:**

| Collection | Index |
|---|---|
| Phong | `{ ten, khu_id }` unique · `{ khu_id, trang_thai }` |
| HopDong | `{ phong_id, trang_thai }` · `{ khach_hang_id }` |
| HoaDon | `{ hop_dong_id, thang, nam }` unique · `{ trang_thai }` |
| KhachHang | `{ cmnd }` unique |
| DonGiaDichVu | `{ loai_phong_id, loai_dv, ngay_ap_dung }` |

> `DonGiaDichVu` and `LichSuGiaThuPhong` are append-only — old records are never updated, preserving the accuracy of previously issued invoices.

---

## 4. REST API

Prefix `/api` · Response format: `{ success, data }` or `{ success, error }`

```
# Catalog
GET|POST              /api/khu
GET|PUT|DELETE        /api/khu/:id
GET|POST              /api/loai-phong
GET|PUT|DELETE        /api/loai-phong/:id
GET|POST|PUT|DELETE   /api/phong/:id
GET                   /api/phong/trong          ?ngay_bat_dau&ngay_het_han&gia_max
GET                   /api/phong/:id/lich-su-gia
GET|POST              /api/don-gia
GET                   /api/don-gia/lich-su

# Customers & Contracts
GET|POST|PUT          /api/khach-hang/:id        ?q= (search name/ID number)
POST                  /api/dat-coc
PUT                   /api/dat-coc/:id/huy
GET|POST              /api/hop-dong              ?trang_thai&khu_id&tu&den&q
GET                   /api/hop-dong/:id
PUT                   /api/hop-dong/:id/gia-han
POST                  /api/hop-dong/:id/thanh-ly
POST                  /api/hop-dong/:id/huy
GET|POST              /api/hop-dong/:id/nguoi-o
PUT|DELETE            /api/nguoi-o/:id

# Invoices
GET                   /api/hoa-don/cho-lap       rooms missing invoice this month
GET                   /api/hoa-don/tinh-truoc    preview (not yet saved)
GET|POST              /api/hoa-don
PUT                   /api/hoa-don/:id/thanh-toan

# Maintenance & Costs
GET|POST|PUT          /api/sua-chua/:id
GET|POST|PUT|DELETE   /api/chi-phi/:id

# Dashboard & Statistics
GET                   /api/dashboard/kpi
GET                   /api/dashboard/canh-bao
PUT                   /api/dashboard/canh-bao/:loai/:id/da-xem
GET                   /api/thong-ke              ?loai=thang|quy|nam&tu&den
GET                   /api/thong-ke/:ky/hoa-don
GET                   /api/bao-cao/cong-suat|no|doanh-thu-theo-phong

# Print & Export
GET                   /api/in/hop-dong|hoa-don|thanh-ly|huy/:id   → PDF
GET                   /api/xuat/doanh-thu|no|cong-suat            → Excel
```

---

## 5. Backend Pipeline

```
Request → Morgan → cors → express.json → Router
  → validate(Zod) → Controller → Service → Mongoose → DB
  → errorHandler (log via Winston → return 4xx/5xx)
```

**Service layer** contains all business logic; controllers only parse the request and send the response:

```
POST /api/hoa-don  →  hoaDon.service.tinhHoaDon()
  1. getDonGiaHieuLuc(loai_phong, ngay)
  2. getSoNguoiOTrongThang(hop_dong_id, thang, nam)
  3. tinhTienPhong()   — pro-rata + round to nearest 1,000 VND
  4. tinhNo()          — sum of all unpaid invoices
  5. save HoaDon
```

---

## 6. Frontend: Routes & State

```
/                    Dashboard (KPIs + alerts)
/khu                 Area management
/phong               Room list
/loai-phong          Room types & service prices
/khach-hang          Customer list
/khach-hang/:id      Customer detail
/hop-dong            Contract list
/hop-dong/dat-coc    Deposit wizard
/hop-dong/moi        New contract wizard
/hop-dong/:id        Contract detail
/hoa-don/lap         Create monthly invoice
/hoa-don/thanh-toan  Payment processing
/thanh-ly            Contract settlement
/huy                 Contract cancellation
/nguoi-o             Occupant management
/sua-chua            Maintenance & repairs
/thong-ke            Revenue statistics
/bao-cao             Advanced reports
/chi-phi             Operating costs
```

| State type | Tool |
|---|---|
| Server data | TanStack Query — cache, auto-refetch, automatic loading state |
| Forms | React Hook Form + Zod resolver |
| UI state (modal, tab, filter) | useState / useReducer |

---

## 7. Main Business Flows

**Create invoice:**
```
Select room → GET /hoa-don/tinh-truoc → Preview → POST /hoa-don → GET /in/hoa-don/:id (PDF)
```

**Settlement:**
```
Find contract → Enter damages → Preview deposit refund → POST /hop-dong/:id/thanh-ly → PDF record
```

**Dashboard alerts:**
```
Open app → GET /dashboard/kpi + /canh-bao → Render cards → Click "Mark as seen" → PUT /da-xem
```

---

## 8. Deployment

```
LAN Server
  ├── nginx      :80   serves React build  →  proxies /api → server
  ├── server     :3001 Node.js + PM2
  └── mongo      :27017 volume ./data/db
```

```yaml
# docker-compose.yml
services:
  mongo:   image: mongo:7  |  volumes: [./data/db:/data/db]
  server:  build: ./server  |  env_file: .env  |  depends_on: [mongo]
  client:  build: ./client  |  ports: ["80:80"]  |  depends_on: [server]
```

Backup: `mongodump` → compress → save to `./backups/` (manual).

---

## 9. Technical Decisions

| Decision | Reason |
|---|---|
| MongoDB | Flexible schema for multi-type price history; no joins needed |
| Shared Zod schemas | Validate once, used on both sides — prevents client/server desync |
| TanStack Query | Auto-refetch for alerts; eliminates fetch/loading/error boilerplate |
| Puppeteer PDF | HTML/CSS templates are easier to maintain than pdfkit; output matches browser print exactly |
| Append-only price history | Never modify old records — previously issued invoices are never retroactively changed |
| Service layer | Business logic decoupled from HTTP — easy to test and reuse |
| Day.js | Pro-rata calculation, consecutive debt month counting, 30-day expiry checks — avoids timezone bugs |
