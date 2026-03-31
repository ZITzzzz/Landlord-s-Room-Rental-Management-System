# Database Design — Room Rental Management System

**Database:** MongoDB · **ODM:** Mongoose
**Conventions:** collection names in lowercase plural (`phongs`, `hopdongs`...), fields in snake_case.

---

## Relationship Diagram

```
Khu ──────────────────1:N──► Phong ◄──────────────── LoaiPhong
                               │ 1:N                      │ 1:N
                               │                          ▼
                     ┌─────────┼──────────┐         DonGiaDichVu
                     │         │          │
                     ▼         ▼          ▼
              DatCoc(*)   HopDong    SuaChua
              KhachHang◄──┤   │
                           │   ├──1:N──► LichSuGiaHan
                           │   ├──1:N──► NguoiO
                           │   └──1:N──► HoaDon
                           ▼
                    LichSuGiaThuPhong

Khu ──────────────────1:N──► ChiPhiVanHanh (khu_id nullable)
```

(*) DatCoc references both Phong and KhachHang

---

## Collections

---

### 1. `khus`

| Field | Type | Constraint | Description |
|---|---|---|---|
| `_id` | ObjectId | PK | |
| `ten` | String | required | Area name |
| `dia_chi` | String | required | Address |
| `ghi_chu` | String | | Optional notes |
| `createdAt` | Date | auto | |
| `updatedAt` | Date | auto | |

---

### 2. `loaiphongs`

| Field | Type | Constraint | Description |
|---|---|---|---|
| `_id` | ObjectId | PK | |
| `ten` | String | required, unique | E.g. "Single Room" |
| `suc_chua` | Number | required, 1–4 | Standard capacity |

---

### 3. `phongs`

| Field | Type | Constraint | Description |
|---|---|---|---|
| `_id` | ObjectId | PK | |
| `ten` | String | required | Room name |
| `khu_id` | ObjectId | ref: Khu, required | |
| `loai_phong_id` | ObjectId | ref: LoaiPhong, required | |
| `gia_thue` | Number | required, > 0 | Current rent (VND) |
| `trang_thai` | String | enum, required | `trong` \| `cho_thue` \| `dat_coc` \| `sua_chua` |
| `chi_so_dien_dau` | Number | default: 0 | Initial electricity reading when meter installed |
| `chi_so_nuoc_dau` | Number | default: 0 | Initial water reading when meter installed |

**Indexes:**
```js
{ ten: 1, khu_id: 1 }  // unique
{ khu_id: 1, trang_thai: 1 }
```

**Status transitions:**
```
trong    ──► cho_thue   (on contract signing)
trong    ──► dat_coc    (on deposit)
trong    ──► sua_chua   (on repair request creation)
dat_coc  ──► cho_thue   (on contract signing from deposit)
dat_coc  ──► trong      (on deposit cancellation)
cho_thue ──► trong      (on settlement / contract cancellation)
sua_chua ──► trong      (on repair completion)
```

---

### 4. `lichsugiathues`

> Append-only — records are never updated or deleted.

| Field | Type | Constraint | Description |
|---|---|---|---|
| `_id` | ObjectId | PK | |
| `phong_id` | ObjectId | ref: Phong, required | |
| `gia_cu` | Number | required | Price before the change |
| `gia_moi` | Number | required | Price after the change |
| `ngay_ap_dung` | Date | required | Date the new price takes effect |

---

### 5. `dongiadichvus`

> Append-only. When creating an invoice, fetch the record with the most recent `ngay_ap_dung` ≤ invoice date.

| Field | Type | Constraint | Description |
|---|---|---|---|
| `_id` | ObjectId | PK | |
| `loai_phong_id` | ObjectId | ref: LoaiPhong, required | null if applied to all room types |
| `loai_dv` | String | enum, required | `dien` \| `nuoc` \| `ve_sinh` \| `xe_may` \| `xe_dap` |
| `don_gia` | Number | required, > 0 | Unit price (VND/unit) |
| `ngay_ap_dung` | Date | required | |

> `ve_sinh`, `xe_may`, `xe_dap` apply uniformly to all rooms → `loai_phong_id = null`
> `dien`, `nuoc` vary by room type → `loai_phong_id` has a value

**Index:**
```js
{ loai_phong_id: 1, loai_dv: 1, ngay_ap_dung: -1 }
```

---

### 6. `khachhangs`

| Field | Type | Constraint | Description |
|---|---|---|---|
| `_id` | ObjectId | PK | |
| `ho_ten` | String | required | Full name |
| `ngay_sinh` | Date | | Date of birth |
| `cmnd` | String | required, unique | National ID number |
| `so_dien_thoai` | String | required | Phone number |
| `que_quan` | String | | Hometown |

**Indexes:**
```js
{ cmnd: 1 }         // unique
{ ho_ten: "text" }  // text search
```

---

### 7. `datcocs`

| Field | Type | Constraint | Description |
|---|---|---|---|
| `_id` | ObjectId | PK | |
| `phong_id` | ObjectId | ref: Phong, required | |
| `khach_hang_id` | ObjectId | ref: KhachHang, required | |
| `so_tien` | Number | required, > 0 | Deposit amount |
| `ngay_dat_coc` | Date | required | |
| `trang_thai` | String | enum | `con_hieu_luc` \| `da_chuyen_hop_dong` \| `huy` |
| `ly_do_huy` | String | | Filled when cancelled |

---

### 8. `hopdongs`

| Field | Type | Constraint | Description |
|---|---|---|---|
| `_id` | ObjectId | PK | |
| `phong_id` | ObjectId | ref: Phong, required | |
| `khach_hang_id` | ObjectId | ref: KhachHang, required | |
| `ngay_bat_dau` | Date | required | Cannot be earlier than 30 days before today |
| `ngay_het_han` | Date | required | Must be at least 1 month after `ngay_bat_dau` |
| `gia_thue_ky_hop_dong` | Number | required | Snapshot of rent at time of signing |
| `tien_dat_coc` | Number | required, > 0 | = 1 month's rent |
| `so_nguoi_o` | Number | required, ≥ 1 | Actual occupants at move-in |
| `trang_thai` | String | enum | `hieu_luc` \| `thanh_ly` \| `huy` |
| `ngay_thanh_ly` | Date | | Filled on settlement |
| `ngay_huy` | Date | | Filled on cancellation |
| `ly_do_huy` | String | | Cancellation reason |

**Indexes:**
```js
{ phong_id: 1, trang_thai: 1 }
{ khach_hang_id: 1 }
{ ngay_het_han: 1, trang_thai: 1 }  // for expiry alert query
```

> `gia_thue_ky_hop_dong` is a snapshot — stores the price at signing so printed contracts are accurate even after room rent changes.

---

### 9. `lichsugiahans`

| Field | Type | Constraint | Description |
|---|---|---|---|
| `_id` | ObjectId | PK | |
| `hop_dong_id` | ObjectId | ref: HopDong, required | |
| `ngay_gia_han` | Date | required | Date the renewal was performed |
| `han_cu` | Date | required | Previous expiry date |
| `han_moi` | Date | required | New expiry date |

---

### 10. `nguoios`

| Field | Type | Constraint | Description |
|---|---|---|---|
| `_id` | ObjectId | PK | |
| `hop_dong_id` | ObjectId | ref: HopDong, required | |
| `ho_ten` | String | required | Full name |
| `cmnd` | String | | National ID number |
| `ngay_bat_dau` | Date | required | Move-in date |
| `ngay_ket_thuc` | Date | | null = currently residing |

**Index:**
```js
{ hop_dong_id: 1, ngay_bat_dau: 1 }
```

> Query occupants in month T:
> `ngay_bat_dau <= end_of_month_T` AND (`ngay_ket_thuc >= start_of_month_T` OR `ngay_ket_thuc = null`)

---

### 11. `hoadons`

| Field | Type | Constraint | Description |
|---|---|---|---|
| `_id` | ObjectId | PK | |
| `hop_dong_id` | ObjectId | ref: HopDong, required | |
| `thang` | Number | required, 1–12 | Month |
| `nam` | Number | required, > 2000 | Year |
| `chi_so_dien_cu` | Number | required, ≥ 0 | Old electricity reading |
| `chi_so_dien_moi` | Number | required, ≥ `chi_so_dien_cu` | New electricity reading |
| `chi_so_nuoc_cu` | Number | required, ≥ 0 | Old water reading |
| `chi_so_nuoc_moi` | Number | required, ≥ `chi_so_nuoc_cu` | New water reading |
| `so_xe_may` | Number | required, ≥ 0 | Motorbike count |
| `so_xe_dap` | Number | required, ≥ 0 | Bicycle count |
| `don_gia_dien` | Number | required | Snapshot of electricity rate at invoice creation |
| `don_gia_nuoc` | Number | required | Snapshot |
| `don_gia_ve_sinh` | Number | required | Snapshot |
| `don_gia_xe_may` | Number | required | Snapshot |
| `don_gia_xe_dap` | Number | required | Snapshot |
| `so_nguoi_o` | Number | required | Snapshot of occupant count for the month |
| `no_thang_truoc` | Number | default: 0 | Total unpaid balance from previous period |
| `tong_tien` | Number | required | Grand total of all charges |
| `trang_thai` | String | enum | `chua_thanh_toan` \| `da_thanh_toan` |
| `ngay_lap` | Date | required | Invoice creation date |
| `han_thanh_toan` | Date | required | = `ngay_lap` + 7 days |
| `ngay_thanh_toan` | Date | | Filled on payment |
| `phuong_thuc` | String | enum | `tien_mat` \| `chuyen_khoan` |
| `ma_giao_dich` | String | | Bank transfer reference (optional) |

**Indexes:**
```js
{ hop_dong_id: 1, thang: 1, nam: 1 }  // unique
{ trang_thai: 1, han_thanh_toan: 1 }   // for overdue alert query
```

**Formula for `tong_tien`:**
```
rent_fee      = gia_thue × (days_stayed / total_days_in_month)  [rounded to 1,000 VND, first/last month]
              = gia_thue  [full months in between]
electricity   = (chi_so_dien_moi - chi_so_dien_cu) × don_gia_dien
water         = (chi_so_nuoc_moi - chi_so_nuoc_cu) × don_gia_nuoc
sanitation    = so_nguoi_o × don_gia_ve_sinh
motorbike     = so_xe_may × don_gia_xe_may
bicycle       = so_xe_dap × don_gia_xe_dap
tong_tien     = rent_fee + electricity + water + sanitation
              + motorbike + bicycle + no_thang_truoc
```

> `don_gia_*` and `so_nguoi_o` fields are **snapshots** — they ensure issued invoices remain unchanged when prices are updated later.

---

### 12. `suachuas`

| Field | Type | Constraint | Description |
|---|---|---|---|
| `_id` | ObjectId | PK | |
| `phong_id` | ObjectId | ref: Phong, required | |
| `mo_ta` | String | required | Issue description |
| `ngay_phat_sinh` | Date | required | Date the issue occurred |
| `chi_phi_du_kien` | Number | ≥ 0 | Estimated cost |
| `chi_phi_thuc_te` | Number | ≥ 0 | Actual cost; filled when completed |
| `trang_thai` | String | enum | `cho_xu_ly` \| `dang_xu_ly` \| `hoan_thanh` |
| `do_kh_gay_ra` | Boolean | default: false | If true, may be deducted from deposit at settlement |

---

### 13. `chiphivanhanhS`

| Field | Type | Constraint | Description |
|---|---|---|---|
| `_id` | ObjectId | PK | |
| `khu_id` | ObjectId | ref: Khu, nullable | null = applies to all areas |
| `thang` | Number | required, 1–12 | Month |
| `nam` | Number | required, > 2000 | Year |
| `loai` | String | enum, required | `dien_nuoc_tong` \| `sua_chua_chung` \| `khac` |
| `so_tien` | Number | required, > 0 | Amount (VND) |
| `ghi_chu` | String | | Notes |

---

### 14. `canhbaodaxems`

| Field | Type | Constraint | Description |
|---|---|---|---|
| `_id` | ObjectId | PK | |
| `loai_canh_bao` | String | required | `phong_chua_hd` \| `hd_sap_den_han` \| `hd_qua_han` \| `nguy_co_huy` \| `hop_dong_sap_het` |
| `tham_chieu_id` | ObjectId | required | ID of the related room/invoice/contract |
| `ngay_xem` | Date | required | Date the manager clicked "Mark as seen" |

**Index:**
```js
{ loai_canh_bao: 1, tham_chieu_id: 1, ngay_xem: 1 }
```

> Each time the app opens, filter out records where `ngay_xem = today`. If the alert condition still exists the next day, the alert reappears automatically.

---

## Snapshot Pattern

Snapshot fields are stored directly in the document instead of being referenced, to preserve historical accuracy:

| Document | Snapshot fields | Reason |
|---|---|---|
| `HopDong` | `gia_thue_ky_hop_dong` | Printed contracts show the correct price at signing, even if room rent changes later |
| `HoaDon` | `don_gia_dien/nuoc/ve_sinh/xe_may/xe_dap`, `so_nguoi_o` | Issued invoices are not affected when prices are updated |

---

## Append-Only Collections

Records in these collections are never updated or deleted:

| Collection | How to query the current record |
|---|---|
| `dongiadichvus` | `ngay_ap_dung ≤ invoice_date`, sort `-ngay_ap_dung`, limit 1 |
| `lichsugiathues` | `ngay_ap_dung ≤ query_date`, sort `-ngay_ap_dung`, limit 1 |
| `lichsugiahans` | Fetch all by `hop_dong_id`, sort by `ngay_gia_han` |

---

## Important Queries

### Count occupants in a month
```js
NguoiO.find({
  hop_dong_id: id,
  ngay_bat_dau: { $lte: end_of_month },
  $or: [
    { ngay_ket_thuc: null },
    { ngay_ket_thuc: { $gte: start_of_month } }
  ]
})
```

### Fetch effective service price
```js
DonGiaDichVu.findOne({
  loai_phong_id: id,   // null for ve_sinh/xe_may/xe_dap
  loai_dv: 'dien',
  ngay_ap_dung: { $lte: invoice_date }
}).sort({ ngay_ap_dung: -1 })
```

### Detect customer with debt ≥ 2 consecutive months
```js
// Fetch unpaid invoices for a contract, sorted by month/year
// Check whether ≥ 2 consecutive records exist (adjacent months)
HoaDon.find({ hop_dong_id: id, trang_thai: 'chua_thanh_toan' })
  .sort({ nam: 1, thang: 1 })
// → check (thang[i+1] - thang[i] === 1) or (nam[i+1] - nam[i] === 1 && thang[i+1] === 1 && thang[i] === 12)
```

### Rooms missing an invoice for the current month
```js
// Fetch all active contracts
// For each contract, check there is no HoaDon with thang=T, nam=Y
HopDong.find({ trang_thai: 'hieu_luc' })
// → filter contracts that have no matching HoaDon for (thang, nam)
```
