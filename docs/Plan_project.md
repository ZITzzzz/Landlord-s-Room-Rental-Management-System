# Project Implementation Plan — Room Rental Management System

> All API responses follow the envelope: `{ success: true, data: ... }` on success, `{ success: false, error: string }` on failure.
> All IDs are MongoDB ObjectId strings.

---

## PHASE 0 — Project Initialization & Database

### T0.1 Project Structure
- [ ] Initialize 2 folders: `client/` (React + Vite) and `server/` (Node.js)
- [ ] `server/`: Express + Mongoose + dotenv + cors + nodemon + Winston + Morgan
- [ ] `client/`: Vite + React Router + Ant Design + TanStack Query + React Hook Form + Zod + Day.js + Recharts
- [ ] Configure proxy from client → server in dev mode (vite.config.js)
- [ ] `.env` file for MongoDB connection string and PORT
- [ ] Shared Zod schemas: create `shared/schemas/` folder containing validation rules for both sides
- [ ] `docker-compose.yml`: services `mongo`, `server`, `client`
- [ ] `ecosystem.config.js` for PM2

### T0.2 MongoDB Schemas (Mongoose)

**Khu:**
```ts
interface Khu {
  _id: ObjectId
  ten: string          // required
  dia_chi: string      // required
  ghi_chu?: string
  createdAt: Date
  updatedAt: Date
}
```

**LoaiPhong:**
```ts
interface LoaiPhong {
  _id: ObjectId
  ten: string          // required, unique
  suc_chua: number     // required, 1–4
}
```

**DonGiaDichVu:**
```ts
interface DonGiaDichVu {
  _id: ObjectId
  loai_phong_id: ObjectId | null  // null → applies to all room types
  loai_dv: 'dien' | 'nuoc' | 've_sinh' | 'xe_may' | 'xe_dap'
  don_gia: number      // required, > 0
  ngay_ap_dung: Date   // required
}
// Index: { loai_phong_id, loai_dv, ngay_ap_dung: -1 }
```

**Phong:**
```ts
interface Phong {
  _id: ObjectId
  ten: string          // required
  khu_id: ObjectId     // required
  loai_phong_id: ObjectId  // required
  gia_thue: number     // required, > 0
  trang_thai: 'trong' | 'cho_thue' | 'dat_coc' | 'sua_chua'
  chi_so_dien_dau: number  // default: 0
  chi_so_nuoc_dau: number  // default: 0
}
// Index: unique { ten, khu_id }; { khu_id, trang_thai }
```

**LichSuGiaThuPhong:**
```ts
interface LichSuGiaThuPhong {
  _id: ObjectId
  phong_id: ObjectId   // required
  gia_cu: number       // required
  gia_moi: number      // required
  ngay_ap_dung: Date   // required
}
// Append-only
```

**KhachHang:**
```ts
interface KhachHang {
  _id: ObjectId
  ho_ten: string       // required
  ngay_sinh?: Date
  cmnd: string         // required, unique
  so_dien_thoai: string  // required
  que_quan?: string
}
// Index: unique { cmnd }; text { ho_ten }
```

**DatCoc:**
```ts
interface DatCoc {
  _id: ObjectId
  phong_id: ObjectId
  khach_hang_id: ObjectId
  so_tien: number      // required, > 0
  ngay_dat_coc: Date   // required
  trang_thai: 'con_hieu_luc' | 'da_chuyen_hop_dong' | 'huy'
  ly_do_huy?: string
}
```

**HopDong:**
```ts
interface HopDong {
  _id: ObjectId
  phong_id: ObjectId
  khach_hang_id: ObjectId
  ngay_bat_dau: Date   // not earlier than 30 days before today
  ngay_het_han: Date   // at least 1 month after ngay_bat_dau
  gia_thue_ky_hop_dong: number  // snapshot at signing
  tien_dat_coc: number // required, > 0; = 1 month rent
  so_nguoi_o: number   // required, >= 1
  trang_thai: 'hieu_luc' | 'thanh_ly' | 'huy'
  ngay_thanh_ly?: Date
  ngay_huy?: Date
  ly_do_huy?: string
}
// Index: { phong_id, trang_thai }; { khach_hang_id }; { ngay_het_han, trang_thai }
```

**LichSuGiaHan:**
```ts
interface LichSuGiaHan {
  _id: ObjectId
  hop_dong_id: ObjectId
  ngay_gia_han: Date
  han_cu: Date
  han_moi: Date
}
```

**NguoiO:**
```ts
interface NguoiO {
  _id: ObjectId
  hop_dong_id: ObjectId
  ho_ten: string       // required
  cmnd?: string
  ngay_bat_dau: Date   // required
  ngay_ket_thuc?: Date // null = currently residing
}
// Index: { hop_dong_id, ngay_bat_dau }
```

**HoaDon:**
```ts
interface HoaDon {
  _id: ObjectId
  hop_dong_id: ObjectId
  thang: number        // 1–12
  nam: number          // > 2000
  chi_so_dien_cu: number   // >= 0
  chi_so_dien_moi: number  // >= chi_so_dien_cu
  chi_so_nuoc_cu: number   // >= 0
  chi_so_nuoc_moi: number  // >= chi_so_nuoc_cu
  so_xe_may: number    // >= 0
  so_xe_dap: number    // >= 0
  // Snapshots at invoice creation
  don_gia_dien: number
  don_gia_nuoc: number
  don_gia_ve_sinh: number
  don_gia_xe_may: number
  don_gia_xe_dap: number
  so_nguoi_o: number
  no_thang_truoc: number   // default: 0
  tong_tien: number
  trang_thai: 'chua_thanh_toan' | 'da_thanh_toan'
  ngay_lap: Date
  han_thanh_toan: Date     // ngay_lap + 7 days
  ngay_thanh_toan?: Date
  phuong_thuc?: 'tien_mat' | 'chuyen_khoan'
  ma_giao_dich?: string
}
// Index: unique { hop_dong_id, thang, nam }; { trang_thai, han_thanh_toan }
```

**SuaChua:**
```ts
interface SuaChua {
  _id: ObjectId
  phong_id: ObjectId
  mo_ta: string        // required
  ngay_phat_sinh: Date // required
  chi_phi_du_kien?: number  // >= 0
  chi_phi_thuc_te?: number  // >= 0; filled on completion
  trang_thai: 'cho_xu_ly' | 'dang_xu_ly' | 'hoan_thanh'
  do_kh_gay_ra: boolean     // default: false
}
```

**ChiPhiVanHanh:**
```ts
interface ChiPhiVanHanh {
  _id: ObjectId
  khu_id?: ObjectId    // null = all areas
  thang: number        // 1–12
  nam: number          // > 2000
  loai: 'dien_nuoc_tong' | 'sua_chua_chung' | 'khac'
  so_tien: number      // required, > 0
  ghi_chu?: string
}
```

**CanhBaoDaXem:**
```ts
interface CanhBaoDaXem {
  _id: ObjectId
  loai_canh_bao: 'phong_chua_hd' | 'hd_sap_den_han' | 'hd_qua_han' | 'nguy_co_huy' | 'hop_dong_sap_het'
  tham_chieu_id: ObjectId
  ngay_xem: Date
}
// Index: { loai_canh_bao, tham_chieu_id, ngay_xem }
```

### T0.3 Seed Data
- [ ] Seed script: 2 areas, 2 room types, 5 rooms, 3 customers, sample service prices, 2 contracts, several invoices

---

## PHASE 1 — Backend API: Catalog (Modules 4.1, 4.2, 4.13)

### T1.1 Area API

```
GET /api/khu
```
```ts
// Query: none
// Response
{ success: true, data: Array<Khu & { so_phong: number, so_phong_dang_thue: number }> }
```

```
POST /api/khu
```
```ts
// Request body
{ ten: string, dia_chi: string, ghi_chu?: string }
// Response
{ success: true, data: Khu }
```

```
PUT /api/khu/:id
```
```ts
// Request body
{ ten?: string, dia_chi?: string, ghi_chu?: string }
// Response
{ success: true, data: Khu }
```

```
DELETE /api/khu/:id
```
```ts
// Validates: all rooms in area have trang_thai = 'trong', no unpaid invoices
// Response
{ success: true, data: { message: 'Deleted successfully' } }
// Error 400: { success: false, error: 'Area still has active or rented rooms' }
```

---

### T1.2 Room Type API

```
GET /api/loai-phong
```
```ts
{ success: true, data: LoaiPhong[] }
```

```
POST /api/loai-phong
```
```ts
// Request body
{ ten: string, suc_chua: number }  // suc_chua: 1–4
// Response
{ success: true, data: LoaiPhong }
```

```
PUT /api/loai-phong/:id
```
```ts
// Request body
{ ten?: string, suc_chua?: number }
// Response
{ success: true, data: LoaiPhong }
```

```
DELETE /api/loai-phong/:id
```
```ts
// Validates: no rooms currently using this room type
// Response
{ success: true, data: { message: 'Deleted successfully' } }
// Error 400: { success: false, error: 'Room type is in use by existing rooms' }
```

---

### T1.3 Room API

```
GET /api/phong
```
```ts
// Query params
{ khu_id?: string, trang_thai?: 'trong'|'cho_thue'|'dat_coc'|'sua_chua' }
// Response
{ success: true, data: Array<Phong & { ten_khu: string, ten_loai_phong: string, suc_chua: number }> }
```

```
GET /api/phong/trong
```
```ts
// Query params
{ ngay_bat_dau?: string, ngay_het_han?: string, gia_max?: number }
// Response — vacant or deposited rooms matching filters
{ success: true, data: Array<Phong & { ten_khu: string, ten_loai_phong: string, suc_chua: number, don_gia_dien: number, don_gia_nuoc: number }> }
```

```
GET /api/phong/:id
```
```ts
{ success: true, data: Phong & { ten_khu: string, ten_loai_phong: string, suc_chua: number } }
```

```
GET /api/phong/:id/lich-su-gia
```
```ts
{ success: true, data: LichSuGiaThuPhong[] }  // sorted newest first
```

```
POST /api/phong
```
```ts
// Request body
{ ten: string, khu_id: string, loai_phong_id: string, gia_thue: number }
// Validates: unique (ten, khu_id)
// Response
{ success: true, data: Phong }
// Error 400: { success: false, error: 'Room name already exists in this area' }
```

```
PUT /api/phong/:id
```
```ts
// Request body
{ ten?: string, loai_phong_id?: string, gia_thue?: number }
// Side effect: if gia_thue changes → create LichSuGiaThuPhong record
// Response
{ success: true, data: Phong }
```

```
DELETE /api/phong/:id
```
```ts
// Validates: trang_thai = 'trong', no unpaid invoices
// Response
{ success: true, data: { message: 'Deleted successfully' } }
// Error 400: { success: false, error: 'Room is not vacant' | 'Room has unpaid invoices' }
```

---

### T1.4 Service Price API

```
GET /api/don-gia
```
```ts
// Query params
{ loai_phong_id?: string }
// Response — current effective price per service type per room type
{ success: true, data: DonGiaDichVu[] }
```

```
POST /api/don-gia
```
```ts
// Request body
{ loai_phong_id?: string, loai_dv: string, don_gia: number, ngay_ap_dung: string }
// Append-only: always inserts a new record
// Response
{ success: true, data: DonGiaDichVu }
```

```
GET /api/don-gia/lich-su
```
```ts
// Query params
{ loai_phong_id?: string, loai_dv?: string }
// Response — all price records sorted by ngay_ap_dung desc
{ success: true, data: DonGiaDichVu[] }
```

**Internal helper:**
```ts
getDonGiaHieuLuc(loai_phong_id: string | null, loai_dv: string, ngay: Date): Promise<number>
// Returns the don_gia of the most recent record where ngay_ap_dung <= ngay
```

---

## PHASE 2 — Backend API: Customers & Contracts (Modules 4.3–4.6, 4.17)

### T2.1 Customer API

```
GET /api/khach-hang
```
```ts
// Query params
{ q?: string }  // regex search on ho_ten and cmnd
// Response
{ success: true, data: Array<KhachHang & { phong_dang_thue: string[] }> }
```

```
GET /api/khach-hang/:id
```
```ts
{ success: true, data: KhachHang & {
    hop_dong_lich_su: Array<HopDong & { ten_phong: string, ten_khu: string }>,
    no_theo_phong: Array<{ phong_id: string, ten_phong: string, tong_no: number, so_thang_no: number }>
  }
}
```

```
POST /api/khach-hang
```
```ts
// Request body
{ ho_ten: string, cmnd: string, so_dien_thoai: string, ngay_sinh?: string, que_quan?: string }
// Validates: unique cmnd
// Response
{ success: true, data: KhachHang }
// Error 400: { success: false, error: 'ID number already exists' }
```

```
PUT /api/khach-hang/:id
```
```ts
// Request body — all optional
{ ho_ten?: string, so_dien_thoai?: string, ngay_sinh?: string, que_quan?: string }
// Response
{ success: true, data: KhachHang }
```

---

### T2.2 Deposit API

```
POST /api/dat-coc
```
```ts
// Request body
{ phong_id: string, khach_hang_id: string, so_tien: number, ngay_dat_coc: string }
// Validates: room trang_thai = 'trong'
// Side effect: room trang_thai → 'dat_coc'
// Response
{ success: true, data: DatCoc }
// Error 400: { success: false, error: 'Room is not vacant' }
```

```
PUT /api/dat-coc/:id/huy
```
```ts
// Request body
{ ly_do_huy: string }
// Side effect: room trang_thai → 'trong'; DatCoc.trang_thai → 'huy'
// Response
{ success: true, data: DatCoc }
```

---

### T2.3 Contract API

```
GET /api/hop-dong
```
```ts
// Query params
{ trang_thai?: 'hieu_luc'|'thanh_ly'|'huy', khu_id?: string, tu?: string, den?: string, q?: string }
// Response
{ success: true, data: Array<HopDong & { ten_phong: string, ten_khu: string, ten_khach_hang: string }> }
```

```
GET /api/hop-dong/:id
```
```ts
{ success: true, data: HopDong & {
    ten_phong: string,
    ten_khu: string,
    khach_hang: KhachHang,
    nguoi_o: NguoiO[],
    hoa_don_chua_thanh_toan: HoaDon[]
  }
}
```

```
POST /api/hop-dong
```
```ts
// Request body
{
  phong_id: string,
  khach_hang_id: string,
  ngay_bat_dau: string,
  ngay_het_han: string,     // >= ngay_bat_dau + 1 month
  tien_dat_coc: number,
  so_nguoi_o: number,
  nguoi_o_ban_dau: Array<{ ho_ten: string, cmnd?: string }>
}
// Validates: room is 'trong' or 'dat_coc'; ngay_bat_dau not before 30 days ago
// Side effects:
//   room trang_thai → 'cho_thue'
//   if room was 'dat_coc' → DatCoc.trang_thai = 'da_chuyen_hop_dong'
//   create NguoiO records from nguoi_o_ban_dau
//   snapshot gia_thue_ky_hop_dong from current Phong.gia_thue
// Response
{ success: true, data: HopDong }
```

```
PUT /api/hop-dong/:id/gia-han
```
```ts
// Request body
{ han_moi: string }  // must be after current ngay_het_han
// Side effect: save LichSuGiaHan record
// Response
{ success: true, data: HopDong & { lich_su_gia_han: LichSuGiaHan[] } }
// Error 400: { success: false, error: 'New expiry must be after current expiry' }
```

```
GET /api/hop-dong/:id/lich-su-gia-han
```
```ts
{ success: true, data: LichSuGiaHan[] }
```

---

### T2.4 Occupant API

```
GET /api/hop-dong/:id/nguoi-o
```
```ts
{ success: true, data: NguoiO[] }
```

```
POST /api/hop-dong/:id/nguoi-o
```
```ts
// Request body
{ ho_ten: string, cmnd?: string, ngay_bat_dau: string }
// Response
{ success: true, data: NguoiO }
```

```
PUT /api/nguoi-o/:id
```
```ts
// Request body
{ ngay_ket_thuc: string }
// Response
{ success: true, data: NguoiO }
```

```
DELETE /api/nguoi-o/:id
```
```ts
{ success: true, data: { message: 'Deleted successfully' } }
```

**Internal helper:**
```ts
getSoNguoiOTrongThang(hop_dong_id: string, thang: number, nam: number): Promise<number>
// Count NguoiO where ngay_bat_dau <= end_of_month AND (ngay_ket_thuc >= start_of_month OR ngay_ket_thuc = null)
```

---

## PHASE 3 — Backend API: Invoices & Payments (Modules 4.7, 4.8)

### T3.1 Invoice API

```
GET /api/hoa-don
```
```ts
// Query params
{ hop_dong_id?: string, phong_id?: string, thang?: number, nam?: number, trang_thai?: string }
// Response
{ success: true, data: Array<HoaDon & { ten_phong: string, ten_khach_hang: string }> }
```

```
GET /api/hoa-don/cho-lap
```
```ts
// Query params
{ thang: number, nam: number }
// Response — active contracts missing an invoice for the given month
{ success: true, data: Array<{
    hop_dong_id: string,
    phong_id: string,
    ten_phong: string,
    ten_khu: string,
    ten_khach_hang: string,
    chi_so_dien_cu: number,  // from last invoice, or chi_so_dien_dau
    chi_so_nuoc_cu: number
  }>
}
```

```
GET /api/hoa-don/tinh-truoc
```
```ts
// Query params
{ hop_dong_id: string, thang: number, nam: number,
  chi_so_dien_moi: number, chi_so_nuoc_moi: number,
  so_xe_may: number, so_xe_dap: number }
// Response — full invoice breakdown (not saved to DB)
{ success: true, data: {
    tien_phong: number,
    tien_dien: number,
    tien_nuoc: number,
    tien_ve_sinh: number,
    tien_xe_may: number,
    tien_xe_dap: number,
    no_thang_truoc: number,
    tong_tien: number,
    chi_tiet: {
      chi_so_dien_cu: number, chi_so_dien_moi: number, don_gia_dien: number,
      chi_so_nuoc_cu: number, chi_so_nuoc_moi: number, don_gia_nuoc: number,
      so_nguoi_o: number, don_gia_ve_sinh: number,
      so_xe_may: number, don_gia_xe_may: number,
      so_xe_dap: number, don_gia_xe_dap: number,
      gia_thue: number, ngay_bat_dau_thue: string
    }
  }
}
```

```
POST /api/hoa-don
```
```ts
// Request body
{
  hop_dong_id: string,
  thang: number,
  nam: number,
  chi_so_dien_moi: number,  // >= chi_so_dien_cu
  chi_so_nuoc_moi: number,  // >= chi_so_nuoc_cu
  so_xe_may: number,
  so_xe_dap: number
}
// Validates: chi_so_*_moi >= chi_so_*_cu; no duplicate (hop_dong_id, thang, nam)
// Side effect: snapshots don_gia_*, so_nguoi_o, no_thang_truoc at creation time
// Response
{ success: true, data: HoaDon }
// Error 400: { success: false, error: 'New meter reading cannot be less than old reading' }
```

**Internal helper:**
```ts
tinhTienPhong(hop_dong: HopDong, thang: number, nam: number): number
// Full month → return gia_thue as-is
// First month (ngay_bat_dau is mid-month) → gia_thue × (days_stayed / total_days) rounded to 1,000
// Last month (ngay_het_han is mid-month) → same formula
```

---

### T3.2 Payment API

```
PUT /api/hoa-don/:id/thanh-toan
```
```ts
// Request body
{ phuong_thuc: 'tien_mat' | 'chuyen_khoan', ma_giao_dich?: string }
// Validates: trang_thai = 'chua_thanh_toan'
// Side effect: trang_thai → 'da_thanh_toan', ngay_thanh_toan = now
// Response
{ success: true, data: HoaDon }
// Error 400: { success: false, error: 'Invoice already paid' }
```

---

## PHASE 4 — Backend API: Settlement & Cancellation (Modules 4.10, 4.11)

### T4.1 Settlement API

```
POST /api/hop-dong/:id/thanh-ly
```
```ts
// Request body
{ ngay_tra: string, ghi_chu_hu_hong?: string, tien_boi_thuong: number }
// Validates: contract trang_thai = 'hieu_luc'
// Side effects:
//   HopDong.trang_thai → 'thanh_ly', HopDong.ngay_thanh_ly = ngay_tra
//   Phong.trang_thai → 'trong'
// Response
{ success: true, data: {
    hop_dong: HopDong,
    tien_dat_coc: number,
    tong_no: number,
    tien_boi_thuong: number,
    tien_hoan_coc: number,    // = max(0, tien_dat_coc - tong_no - tien_boi_thuong)
    hoa_don_con_no: HoaDon[]
  }
}
```

---

### T4.2 Contract Cancellation API

```
POST /api/hop-dong/:id/huy
```
```ts
// Request body
{ ly_do_huy: string }
// Validates: >= 2 consecutive unpaid invoices exist
// Side effects:
//   HopDong.trang_thai → 'huy', HopDong.ngay_huy = now
//   Phong.trang_thai → 'trong'
//   deposit is forfeited (no refund)
// Response
{ success: true, data: {
    hop_dong: HopDong,
    hoa_don_khong_thanh_toan: HoaDon[]
  }
}
// Error 400: { success: false, error: 'Cancellation requires >= 2 consecutive unpaid months' }
```

---

## PHASE 5 — Backend API: Repairs & Costs (Modules 4.16, 4.18)

### T5.1 Repair API

```
GET /api/sua-chua
```
```ts
// Query params
{ phong_id?: string, trang_thai?: 'cho_xu_ly'|'dang_xu_ly'|'hoan_thanh' }
// Response
{ success: true, data: Array<SuaChua & { ten_phong: string, ten_khu: string }> }
```

```
POST /api/sua-chua
```
```ts
// Request body
{ phong_id: string, mo_ta: string, ngay_phat_sinh: string, chi_phi_du_kien?: number, do_kh_gay_ra?: boolean }
// Response
{ success: true, data: SuaChua }
```

```
PUT /api/sua-chua/:id
```
```ts
// Request body
{ trang_thai?: string, chi_phi_thuc_te?: number, mo_ta?: string }
// Side effect: if trang_thai → 'hoan_thanh' and Phong.trang_thai = 'sua_chua' → Phong.trang_thai = 'trong'
// Response
{ success: true, data: SuaChua }
```

---

### T5.2 Operating Cost API

```
GET /api/chi-phi
```
```ts
// Query params
{ thang?: number, nam?: number, khu_id?: string }
// Response
{ success: true, data: Array<ChiPhiVanHanh & { ten_khu?: string }> }
```

```
POST /api/chi-phi
```
```ts
// Request body
{ khu_id?: string, thang: number, nam: number, loai: string, so_tien: number, ghi_chu?: string }
// Validates: so_tien > 0
// Response
{ success: true, data: ChiPhiVanHanh }
```

```
PUT /api/chi-phi/:id
```
```ts
// Request body — all optional
{ so_tien?: number, ghi_chu?: string, loai?: string }
// Response
{ success: true, data: ChiPhiVanHanh }
```

```
DELETE /api/chi-phi/:id
```
```ts
{ success: true, data: { message: 'Deleted successfully' } }
```

---

## PHASE 6 — Backend API: Dashboard & Statistics (Modules 4.9, 4.14, 4.15)

### T6.1 Dashboard API

```
GET /api/dashboard/kpi
```
```ts
{ success: true, data: {
    ti_le_lap_day: Array<{ khu_id: string, ten_khu: string, ti_le: number, so_phong_thue: number, tong_so_phong: number }>,
    doanh_thu_thang_nay: number,
    so_hop_dong_sap_het_han: number,
    so_phong_dang_sua_chua: number
  }
}
```

```
GET /api/dashboard/canh-bao
```
```ts
{ success: true, data: {
    phong_chua_hd: Array<{ phong_id: string, ten_phong: string, ten_khu: string }>,
    hd_sap_den_han: Array<{ hoa_don_id: string, ten_phong: string, so_tien: number, han_thanh_toan: string }>,
    hd_qua_han: Array<{ hoa_don_id: string, ten_phong: string, so_tien: number, so_ngay_qua_han: number }>,
    nguy_co_huy: Array<{ hop_dong_id: string, ten_phong: string, ten_khach_hang: string, so_thang_no: number }>,
    hop_dong_sap_het: Array<{ hop_dong_id: string, ten_phong: string, ten_khach_hang: string, ngay_het_han: string }>
  }
}
```

```
PUT /api/dashboard/canh-bao/:loai/:id/da-xem
```
```ts
// Params: loai = alert type key, id = tham_chieu_id
// Side effect: insert CanhBaoDaXem record with ngay_xem = today
// Response
{ success: true, data: CanhBaoDaXem }
```

---

### T6.2 Statistics API

```
GET /api/thong-ke
```
```ts
// Query params
{ loai: 'thang'|'quy'|'nam', tu: string, den: string }
// Response
{ success: true, data: Array<{
    ky: string,           // e.g. "2024-03" | "2024-Q1" | "2024"
    doanh_thu: number,
    chi_phi: number | null,
    loi_nhuan: number | null
  }>
}
```

```
GET /api/thong-ke/:ky/hoa-don
```
```ts
// Params: ky = period string
// Response
{ success: true, data: Array<{
    hoa_don_id: string,
    ten_khach_hang: string,
    ten_phong: string,
    tong_tien: number,
    phuong_thuc: string,
    ngay_thanh_toan: string
  }>
}
```

---

### T6.3 Reports API

```
GET /api/bao-cao/cong-suat
```
```ts
// Query params
{ tu?: string, den?: string }
// Response
{ success: true, data: {
    tong_quat: { tong_phong: number, dang_thue: number, ti_le: number },
    theo_khu: Array<{ khu_id: string, ten_khu: string, tong_phong: number, dang_thue: number, ti_le: number }>,
    lich_su_theo_thang: Array<{ thang: string, ti_le: number }>
  }
}
```

```
GET /api/bao-cao/no
```
```ts
{ success: true, data: Array<{
    khach_hang_id: string,
    ten_khach_hang: string,
    so_dien_thoai: string,
    tong_no: number,
    chi_tiet_theo_phong: Array<{
      hop_dong_id: string,
      ten_phong: string,
      no: number,
      so_thang_no_lien_tiep: number
    }>
  }>
}
```

```
GET /api/bao-cao/doanh-thu-theo-phong
```
```ts
// Query params
{ tu: string, den: string, khu_id?: string }
// Response
{ success: true, data: Array<{
    phong_id: string,
    ten_phong: string,
    ten_khu: string,
    doanh_thu: number
  }>
}
```

---

## PHASE 7 — React Frontend

### T7.1 Layout & Router
- [ ] Shared layout: sidebar navigation + header
- [ ] React Router: define all routes
- [ ] Axios instance with base URL + error interceptor

### T7.2 Dashboard Page
- [ ] 4 KPI cards (occupancy rate, monthly revenue, expiring contracts, rooms under repair)
- [ ] Grouped alert cards with View Details and Mark as Seen buttons

### T7.3 Catalog Management
- [ ] Area Management page (table + add/edit form + delete with confirm dialog)
- [ ] Room Management page (table filtered by area/status + color badges + form + price history)
- [ ] Room Types & Service Prices page (current price table + update form + view history)

### T7.4 Customers
- [ ] Customer list page (search, table)
- [ ] Customer detail page (info + contract history + debt per room)

### T7.5 Contracts
- [ ] Contract list page (filter + table + click to view detail)
- [ ] Deposit wizard: select room → enter customer + deposit amount
- [ ] Contract wizard: find room → enter customer → preview contract → confirm → print PDF
- [ ] Contract renewal form

### T7.6 Invoices & Payments
- [ ] Invoice creation page: rooms without invoice → click → entry form → preview → confirm → print PDF
- [ ] Payment page: find invoice → show detail → select payment method → confirm

### T7.7 Settlement & Cancellation
- [ ] Settlement form: find contract (select room if multiple) → enter move-out info → deposit refund calculation → confirm → print PDF
- [ ] Cancellation form: find contract → show unpaid invoice list → confirm → print PDF

### T7.8 Occupants & Repairs
- [ ] Occupant management page per room (list + add/remove + over-capacity warning)
- [ ] Repair management page (list + create form + update status + actual cost)

### T7.9 Statistics & Reports
- [ ] Revenue statistics page (select period → revenue/cost/profit table → click to view invoice detail)
- [ ] Advanced reports page (occupancy, debt, revenue by room)
- [ ] Export to Excel + PDF button for each report

### T7.10 Operating Costs
- [ ] Operating costs page (table filtered by month/area + add/edit/delete form)

---

## PHASE 8 — Print & Export (NFR-2, NFR-7)

### T8.1 PDF Generation (Puppeteer)

```
GET /api/in/hop-dong/:id
GET /api/in/hoa-don/:id
GET /api/in/thanh-ly/:hop_dong_id
GET /api/in/huy/:hop_dong_id
```
```ts
// Response: PDF file stream
// Headers: Content-Type: application/pdf
//          Content-Disposition: attachment; filename="<type>_<id>.pdf"
```

- [ ] `renderPDF(templateName: string, data: object): Promise<Buffer>` using Puppeteer
- [ ] HTML template: rental contract
- [ ] HTML template: monthly invoice
- [ ] HTML template: settlement record
- [ ] HTML template: cancellation record

---

### T8.2 Excel Export (ExcelJS)

```
GET /api/xuat/doanh-thu?format=excel&tu=...&den=...
GET /api/xuat/no?format=excel
GET /api/xuat/cong-suat?format=excel&tu=...&den=...
```
```ts
// Response: Excel file stream
// Headers: Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
//          Content-Disposition: attachment; filename="<report>_<date>.xlsx"
```

- [ ] Shared helper `taoWorkbook(headers: string[], rows: any[][]): Workbook`

---

## PHASE 9 — Non-Functional Requirements (NFR)

### T9.1 MongoDB Indexes
- [ ] `phong`: `{ khu_id, trang_thai }`
- [ ] `hop_dong`: `{ khach_hang_id }`, `{ phong_id, trang_thai }`
- [ ] `hoa_don`: unique `{ hop_dong_id, thang, nam }`, `{ trang_thai, han_thanh_toan }`
- [ ] `khach_hang`: unique `{ cmnd }`

### T9.2 Backup & Restore
- [ ] `GET /api/backup` → run `mongodump`, compress via Archiver, stream `.tar.gz` to client
- [ ] `POST /api/restore` → Multer receives `.tar.gz` file, run `mongorestore`

### T9.3 General UX
- [ ] All search inputs use debounce + MongoDB regex
- [ ] Second confirmation dialog for all important deletes (`Modal.confirm`)
- [ ] Toast notifications for success / failure (`message` / `notification`)
- [ ] Loading skeleton while fetching (TanStack Query `isLoading`)
- [ ] React error boundary

### T9.4 Logging (Winston + Morgan)
- [ ] Morgan: log HTTP requests to console in dev, to file in production
- [ ] Winston: `logs/error.log` (errors only) + `logs/combined.log` (all levels)
- [ ] Centralized Express error handler: log → return `{ success: false, error }`

### T9.5 Deployment
- [ ] `docker-compose.yml`: 3 services — `mongo` (persistent volume), `server`, `client` (nginx)
- [ ] `ecosystem.config.js` for PM2: cluster mode, auto-restart on crash
- [ ] `npm run build` for client → serve via nginx
- [ ] First-time setup guide for LAN machine (commands to run)
