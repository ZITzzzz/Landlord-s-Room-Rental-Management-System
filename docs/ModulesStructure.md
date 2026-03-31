# Modules Structure — Room Rental Management System

---

## Module Overview

```
shared/
├── schemas/          Shared Zod schemas for client + server

server/src/
├── models/           Mongoose schemas (13 collections)
├── routes/           Express routers
├── controllers/      Receive request → call service → send response
├── services/         Pure business logic (no HTTP awareness)
├── middlewares/      Validation, error handler
└── templates/        HTML templates for PDF

client/src/
├── api/              Axios functions calling REST API
├── hooks/            TanStack Query wrappers
├── pages/            Pages (1 route = 1 page)
└── components/       Reusable UI components
```

---

## SERVER — Module Details

---

### M-S01 · Area

| Layer | File | Responsibility |
|---|---|---|
| Model | `models/Khu.js` | Schema: `ten, dia_chi, ghi_chu` |
| Route | `routes/khu.routes.js` | `GET /api/khu`, `POST`, `PUT /:id`, `DELETE /:id` |
| Controller | `controllers/khu.controller.js` | Parse req, call service, send res |
| Service | `services/khu.service.js` | Validate delete conditions (all rooms `trong`, no unpaid invoices) |

**Dependencies:** `Phong`, `HoaDon`

---

### M-S02 · Room Types & Service Prices

| Layer | File | Responsibility |
|---|---|---|
| Model | `models/LoaiPhong.js` | Schema: `ten, suc_chua` |
| Model | `models/DonGiaDichVu.js` | Schema: `loai_phong_id, loai_dv, don_gia, ngay_ap_dung` |
| Route | `routes/loaiPhong.routes.js` | CRUD room types |
| Route | `routes/donGia.routes.js` | `GET /api/don-gia`, `POST`, `GET /lich-su` |
| Controller | `controllers/loaiPhong.controller.js` | |
| Controller | `controllers/donGia.controller.js` | |
| Service | `services/donGia.service.js` | `getDonGiaHieuLuc(loai_phong_id, loai_dv, ngay)` — fetch the effective price at a given date (used by M-S07) |

**Exported helper:** `getDonGiaHieuLuc()` — used by the Invoice service

---

### M-S03 · Rooms

| Layer | File | Responsibility |
|---|---|---|
| Model | `models/Phong.js` | Schema: `ten, khu_id, loai_phong_id, gia_thue, trang_thai`; unique index `(ten, khu_id)` |
| Model | `models/LichSuGiaThuPhong.js` | Schema: `phong_id, gia_cu, gia_moi, ngay_ap_dung` |
| Route | `routes/phong.routes.js` | CRUD + `GET /trong` + `GET /:id/lich-su-gia` |
| Controller | `controllers/phong.controller.js` | |
| Service | `services/phong.service.js` | When `gia_thue` changes → auto-create `LichSuGiaThuPhong` record; validate name uniqueness; validate delete |

**Room status:** `trong` → `dat_coc` → `cho_thue` → `trong` | `sua_chua` → `trong`

---

### M-S04 · Customers

| Layer | File | Responsibility |
|---|---|---|
| Model | `models/KhachHang.js` | Schema: `ho_ten, ngay_sinh, cmnd, so_dien_thoai, que_quan`; unique index `cmnd` |
| Route | `routes/khachHang.routes.js` | `GET` (search), `GET /:id`, `POST`, `PUT /:id` |
| Controller | `controllers/khachHang.controller.js` | |
| Service | `services/khachHang.service.js` | Aggregate debt per contract when fetching customer detail |

**Dependencies:** `HopDong`, `HoaDon`

---

### M-S05 · Deposits

| Layer | File | Responsibility |
|---|---|---|
| Model | `models/DatCoc.js` | Schema: `phong_id, khach_hang_id, so_tien, ngay_dat_coc, trang_thai, ly_do_huy` |
| Route | `routes/datCoc.routes.js` | `POST /api/dat-coc`, `PUT /:id/huy` |
| Controller | `controllers/datCoc.controller.js` | |
| Service | `services/datCoc.service.js` | Create deposit → change room `trong → dat_coc`; cancel deposit → change room `dat_coc → trong` |

**Dependencies:** `Phong`

---

### M-S06 · Contracts

| Layer | File | Responsibility |
|---|---|---|
| Model | `models/HopDong.js` | Schema: `phong_id, khach_hang_id, ngay_bat_dau, ngay_het_han, gia_thue_tai_thoi_diem_ky, tien_dat_coc, so_nguoi_o, trang_thai, ...` |
| Model | `models/LichSuGiaHan.js` | Schema: `hop_dong_id, ngay_gia_han, han_cu, han_moi` |
| Model | `models/NguoiO.js` | Schema: `hop_dong_id, ho_ten, cmnd, ngay_bat_dau, ngay_ket_thuc` |
| Route | `routes/hopDong.routes.js` | CRUD + `/gia-han` + `/thanh-ly` + `/huy` + `/nguoi-o` |
| Controller | `controllers/hopDong.controller.js` | |
| Service | `services/hopDong.service.js` | Create contract (validate dates, room status, change room `→ cho_thue`, create initial NguoiO); renewal; validation |
| Service | `services/thanhLy.service.js` | `tinhHoanCoc(hop_dong_id, tien_boi_thuong)` = deposit − debt − compensation (min 0); change room `→ trong` |
| Service | `services/huyHopDong.service.js` | Validate ≥ 2 consecutive unpaid invoices; forfeit deposit; change room `→ trong` |

**Exported helper:** `getSoNguoiOTrongThang(hop_dong_id, thang, nam)` — used by Invoice service

**Dependencies:** `Phong`, `KhachHang`, `DatCoc`, `HoaDon`

---

### M-S07 · Invoices

| Layer | File | Responsibility |
|---|---|---|
| Model | `models/HoaDon.js` | Schema: `hop_dong_id, thang, nam, chi_so_dien_cu/moi, chi_so_nuoc_cu/moi, so_xe_may, so_xe_dap, no_thang_truoc, tong_tien, trang_thai, ngay_thanh_toan, phuong_thuc, ma_giao_dich`; unique index `(hop_dong_id, thang, nam)` |
| Route | `routes/hoaDon.routes.js` | `GET`, `GET /cho-lap`, `GET /tinh-truoc`, `POST`, `PUT /:id/thanh-toan` |
| Controller | `controllers/hoaDon.controller.js` | |
| Service | `services/hoaDon.service.js` | Full invoice calculation |

**Calculation logic in `hoaDon.service.js`:**
```
tinhHoaDon(hop_dong, chi_so, so_xe):
  1. getDonGiaHieuLuc()         ← from M-S02
  2. getSoNguoiOTrongThang()    ← from M-S06
  3. tinhTienPhong()            ← pro-rata for first/last month, round to 1,000 VND
  4. electricity = (new - old) × electricity rate
  5. water       = (new - old) × water rate
  6. sanitation  = occupants × sanitation rate
  7. vehicles    = (motorbikes × rate) + (bicycles × rate)
  8. prior debt  = sum of unpaid HoaDon for hop_dong_id
  9. tong_tien   = sum of all above
```

**Dependencies:** `HopDong`, `NguoiO`, `DonGiaDichVu`

---

### M-S08 · Maintenance & Repairs

| Layer | File | Responsibility |
|---|---|---|
| Model | `models/SuaChua.js` | Schema: `phong_id, mo_ta, ngay_phat_sinh, chi_phi_du_kien, chi_phi_thuc_te, trang_thai, do_kh_gay_ra` |
| Route | `routes/suaChua.routes.js` | `GET`, `POST`, `PUT /:id` |
| Controller | `controllers/suaChua.controller.js` | |
| Service | `services/suaChua.service.js` | When `trang_thai → hoan_thanh` and room is `sua_chua` → change room `→ trong` |

**Dependencies:** `Phong`

---

### M-S09 · Operating Costs

| Layer | File | Responsibility |
|---|---|---|
| Model | `models/ChiPhiVanHanh.js` | Schema: `khu_id (nullable), thang, nam, loai, so_tien, ghi_chu` |
| Route | `routes/chiPhi.routes.js` | CRUD |
| Controller | `controllers/chiPhi.controller.js` | |
| Service | `services/chiPhi.service.js` | Validate `so_tien > 0`; aggregate costs by month (used by M-S10) |

---

### M-S10 · Dashboard & Alerts

| Layer | File | Responsibility |
|---|---|---|
| Model | `models/CanhBaoDaXem.js` | Schema: `loai_canh_bao, tham_chieu_id, ngay_xem` |
| Route | `routes/dashboard.routes.js` | `GET /kpi`, `GET /canh-bao`, `PUT /canh-bao/:loai/:id/da-xem` |
| Controller | `controllers/dashboard.controller.js` | |
| Service | `services/dashboard.service.js` | Calculate 4 KPI metrics |
| Service | `services/canhBao.service.js` | 5 alert queries; filter out records already seen today |

**5 alert types in `canhBao.service.js`:**
```
1. phongChuaLapHoaDon()   Room is cho_thue, past end of month, no invoice for this month
2. hoaDonSapDenHan()      Invoice unpaid, deadline - today ≤ 2 days
3. hoaDonQuaHan()         Invoice unpaid, today - creation date > 7 days
4. nguyCoHuyHopDong()     Contract has ≥ 2 consecutive unpaid invoices
5. hopDongSapHetHan()     Active contract, expiry date - today = 30 days
```

**Dependencies:** `Phong`, `HopDong`, `HoaDon`, `ChiPhiVanHanh`

---

### M-S11 · Statistics & Reports

| Layer | File | Responsibility |
|---|---|---|
| Route | `routes/thongKe.routes.js` | `GET /thong-ke`, `GET /thong-ke/:ky/hoa-don` |
| Route | `routes/baoCao.routes.js` | `GET /bao-cao/cong-suat`, `/no`, `/doanh-thu-theo-phong` |
| Controller | `controllers/thongKe.controller.js` | |
| Service | `services/thongKe.service.js` | Aggregate revenue − costs = profit by month/quarter/year |
| Service | `services/baoCao.service.js` | 3 advanced report types |

**Dependencies:** `HoaDon`, `ChiPhiVanHanh`, `Phong`, `HopDong`, `KhachHang`

---

### M-S12 · PDF Printing

| Layer | File | Responsibility |
|---|---|---|
| Route | `routes/in.routes.js` | `GET /in/hop-dong/:id`, `/hoa-don/:id`, `/thanh-ly/:id`, `/huy/:id` |
| Controller | `controllers/in.controller.js` | Fetch complete data, call pdf.service, return file |
| Service | `services/pdf.service.js` | `renderPDF(templateName, data) → Buffer` using Puppeteer |
| Templates | `templates/hopDong.html` | Contract HTML template |
| Templates | `templates/hoaDon.html` | Invoice HTML template |
| Templates | `templates/bienBanThanhLy.html` | Settlement record HTML template |
| Templates | `templates/bienBanHuy.html` | Cancellation record HTML template |

---

### M-S13 · Excel Export

| Layer | File | Responsibility |
|---|---|---|
| Route | `routes/xuat.routes.js` | `GET /xuat/doanh-thu`, `/no`, `/cong-suat` |
| Controller | `controllers/xuat.controller.js` | |
| Service | `services/excel.service.js` | `taoWorkbook(headers, rows)` → Buffer using ExcelJS |

---

### M-S14 · Shared Middlewares

| File | Responsibility |
|---|---|
| `middlewares/validate.js` | Accepts a Zod schema, validates `req.body` / `req.params`, returns 400 on failure |
| `middlewares/errorHandler.js` | Global error handler, logs via Winston, returns `{ success: false, error }` |
| `config/logger.js` | Winston: `error.log` + `combined.log`; Morgan: HTTP request logging |

---

## CLIENT — Module Details

---

### M-C01 · Dashboard

```
pages/Dashboard.jsx
  ├── components/KpiCard.jsx          KPI metric card (occupancy rate, revenue...)
  ├── components/CanhBaoCard.jsx      Alert card (with View Details + Mark as Seen buttons)
  └── hooks/useDashboard.js           useQuery: GET /api/dashboard/kpi + /canh-bao
```

---

### M-C02 · Catalog Management

```
pages/khu/
  ├── DanhSachKhu.jsx                 Area table + inline add/edit form
  └── hooks/useKhu.js

pages/phong/
  ├── DanhSachPhong.jsx               Room table, filter by area/status, color badges
  ├── FormPhong.jsx                   Add/edit room form
  ├── LichSuGiaPhong.jsx              Rent price history table
  └── hooks/usePhong.js

pages/loaiPhong/
  ├── LoaiPhongVaDonGia.jsx           Room type table + service price table
  ├── FormDonGia.jsx                  Update service price form
  └── hooks/useLoaiPhong.js
```

---

### M-C03 · Customers

```
pages/khachHang/
  ├── DanhSachKhachHang.jsx           Table + name/ID search
  ├── ChiTietKhachHang.jsx            Info + contract history + debt per room
  ├── FormKhachHang.jsx               Add/edit form
  └── hooks/useKhachHang.js
```

---

### M-C04 · Deposits & Contracts

```
pages/hopDong/
  ├── DanhSachHopDong.jsx             All contracts table, multi-filter
  ├── ChiTietHopDong.jsx              Detail + Renew / Settle / Cancel buttons
  ├── WizardDatCoc.jsx                Step 1: Find room → Step 2: Enter customer + deposit
  ├── WizardHopDong.jsx               Step 1: Find room → Step 2: Customer → Step 3: Preview → Confirm
  ├── FormGiaHan.jsx                  Renewal form (inline modal)
  └── hooks/useHopDong.js
```

**WizardHopDong steps:**
```
Step 1: PhongSelector    Find vacant/deposited room by date + price
Step 2: KhachHangForm    Find existing customer or add new; enter occupants; fill deposit
Step 3: PreviewHopDong   Display full contract preview
Step 4: Confirm          POST → print PDF
```

---

### M-C05 · Room Occupants

```
pages/nguoiO/
  ├── QuanLiNguoiO.jsx                Select room → occupant table + add/remove
  └── hooks/useNguoiO.js
```

---

### M-C06 · Invoices

```
pages/hoaDon/
  ├── LapHoaDon.jsx                   Rooms without invoice → click → entry form → preview → confirm
  ├── ThanhToanHoaDon.jsx             Find invoice → detail → select method → confirm
  ├── PreviewHoaDon.jsx               Invoice breakdown component (shared)
  └── hooks/useHoaDon.js
```

---

### M-C07 · Settlement & Cancellation

```
pages/thanhLy/
  ├── ThanhLyHopDong.jsx              Find contract (select room if multiple) → enter info → calculate refund → confirm → PDF
  └── HuyHopDong.jsx                  Find contract → show unpaid list → confirm → PDF

hooks/useThanhLy.js
```

---

### M-C08 · Maintenance & Repairs

```
pages/suaChua/
  ├── DanhSachSuaChua.jsx             Table + filter by room/status
  ├── FormSuaChua.jsx                 Create repair request form
  ├── CapNhatTrangThai.jsx            Update status + actual cost
  └── hooks/useSuaChua.js
```

---

### M-C09 · Statistics & Reports

```
pages/thongKe/
  ├── ThongKe.jsx                     Select period → revenue/cost/profit table + Recharts
  ├── ChiTietKy.jsx                   Invoice list for period
  └── hooks/useThongKe.js

pages/baoCao/
  ├── BaoCao.jsx                      Tabs: occupancy / debt / revenue by room
  ├── BaoCaoCongSuat.jsx
  ├── BaoCaoNo.jsx
  ├── BaoCaoDoanhThu.jsx
  └── hooks/useBaoCao.js
```

---

### M-C10 · Operating Costs

```
pages/chiPhi/
  ├── ChiPhiVanHanh.jsx               Cost table + filter by month/area + add/edit/delete form
  └── hooks/useChiPhi.js
```

---

### M-C11 · Shared Components

```
components/
  ├── ConfirmDeleteModal.jsx          Second confirmation dialog (used everywhere for deletions)
  ├── StatusBadge.jsx                 Color badge for room / contract / invoice status
  ├── PhongSelector.jsx               Dropdown to search and select a room (used in contracts, repairs)
  ├── KhachHangSearch.jsx             Search and select customer or add new
  ├── MoneyInput.jsx                  Currency input (VND format, positive numbers only)
  ├── DateRangePicker.jsx             Date range picker (used in filters across multiple pages)
  └── ExportButton.jsx                Export to Excel / PDF button (calls /xuat or /in API)
```

---

### M-C12 · API Layer & Hooks

```
api/
  ├── axiosInstance.js                Base URL, response interceptor (unwrap data/error)
  ├── khu.api.js
  ├── phong.api.js
  ├── khachHang.api.js
  ├── datCoc.api.js
  ├── hopDong.api.js
  ├── hoaDon.api.js
  ├── suaChua.api.js
  ├── chiPhi.api.js
  ├── dashboard.api.js
  ├── thongKe.api.js
  └── in.api.js                       Calls PDF/Excel API, triggers file download

hooks/                                TanStack Query wrappers (useQuery + useMutation)
  ├── useKhu.js
  ├── usePhong.js
  ├── useKhachHang.js
  ├── useHopDong.js
  ├── useHoaDon.js
  ├── useDashboard.js
  └── ...
```

---

## SHARED — Zod Schemas

```
shared/schemas/
  ├── khu.schema.js                   { ten (required), dia_chi, ghi_chu }
  ├── phong.schema.js                 { ten, khu_id, loai_phong_id, gia_thue > 0 }
  ├── khachHang.schema.js             { ho_ten, cmnd (unique), so_dien_thoai (required) }
  ├── hopDong.schema.js               { ngay_bat_dau, ngay_het_han (> bat_dau + 1 month), ... }
  ├── hoaDon.schema.js                { chi_so_dien_moi >= cu, chi_so_nuoc_moi >= cu, ... }
  ├── thanhLy.schema.js               { ngay_tra, tien_boi_thuong >= 0 }
  └── chiPhi.schema.js                { so_tien > 0, thang 1-12, nam > 2000 }
```

Used on server: `validate.js` middleware accepts schema → validates `req.body`
Used on client: `useForm({ resolver: zodResolver(schema) })`

---

## Server Module Dependencies

```
M-S07 Invoice
  └── depends on: M-S02 getDonGiaHieuLuc()
                  M-S06 getSoNguoiOTrongThang()

M-S10 Dashboard / Alerts
  └── depends on: M-S03 Phong
                  M-S06 HopDong, NguoiO
                  M-S07 HoaDon
                  M-S09 ChiPhiVanHanh

M-S11 Statistics
  └── depends on: M-S07 HoaDon
                  M-S09 ChiPhiVanHanh

M-S12 PDF
  └── depends on: M-S06 HopDong (fetch data to inject into template)
                  M-S07 HoaDon

M-S06 Contract (create)
  └── depends on: M-S03 Phong (status transition)
                  M-S05 DatCoc (fetch deposit amount)

M-S06 Settlement / Cancellation
  └── depends on: M-S03 Phong (status transition)
                  M-S07 HoaDon (calculate outstanding debt)
                  M-S08 SuaChua (costs caused by tenant)
```
