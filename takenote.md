# Session Notes — Modules 2–7

**Date:** 2026-04-11
**Goal:** Implement Modules 2–7 end-to-end (Rooms, Service Prices, Customers, Deposits, Contracts, Invoices, Settlement, Cancellation).

---

## MODULE 2 — Rooms & Service Prices (COMPLETE)

### Backend
| File | Responsibility |
|---|---|
| `shared/schemas/donGia.schema.js` | `donGiaCreateSchema` — `z.coerce.date()` for `ngay_ap_dung`; append-only, no update schema |
| `shared/schemas/phong.schema.js` | `phongCreateSchema` + `phongUpdateSchema` — `khu_id` excluded from update |
| `services/donGia.service.js` | **`getDonGiaHieuLuc(loai_phong_id, loai_dv, ngay)`** — exported helper used by M6 invoice service; `getDonGiaCurrent`, `getLichSu`, `create` |
| `services/phong.service.js` | `getAll`, `getTrong` (attaches don_gia_dien/nuoc), `getById`, `getLichSuGia`, `create` (catch 11000→400), `update` (auto-append `LichSuGiaThuPhong` on rent change), `remove` |
| `controllers/phong.controller.js` | 7 functions |
| `controllers/donGia.controller.js` | `getCurrent`, `getLichSu`, `create` |
| `routes/phong.routes.js` | `/trong` before `/:id`; `/:id/lich-su-gia` before `/:id` |
| `routes/donGia.routes.js` | `/lich-su` before `/` |

### Frontend
| File | Responsibility |
|---|---|
| `components/StatusBadge.jsx` | Color badges for `phong`, `hop_dong`, `hoa_don`, `dat_coc` |
| `api/phong.api.js`, `hooks/usePhong.js` | Full CRUD + usePhongsTrong + useLichSuGia |
| `api/donGia.api.js`, `hooks/useDonGia.js` | Current prices + history + create |
| `pages/phong/PhongPage.jsx` | Filter, table, add/edit modal, price-history Drawer, "Hủy đặt cọc" button |
| `pages/loaiPhong/LoaiPhongPage.jsx` (updated) | Added `DonGiaSection` — current prices per loai_phong + new price modal; `ve_sinh`/`xe_may`/`xe_dap` → `loai_phong_id: null` |

---

## MODULE 3 — Customers (COMPLETE)

### Backend
| File | Responsibility |
|---|---|
| `shared/schemas/khachHang.schema.js` | Create + Update — `cmnd` excluded from update schema |
| `services/khachHang.service.js` | `getAll(q)` regex search + `phong_dang_thue`; `getById` deep populate + debt aggregate; `create` unique cmnd check; `update` |
| `controllers/khachHang.controller.js` | No `remove` handler |
| `routes/khachHang.routes.js` | GET, GET/:id, POST, PUT/:id |

### Frontend
| File | Responsibility |
|---|---|
| `api/khachHang.api.js`, `hooks/useKhachHang.js` | `useKhachHangSearch` alias exported for wizard reuse |
| `pages/khachHang/KhachHangListPage.jsx` | Debounced 300ms search, table, add/edit modal (CMND disabled in edit) |
| `pages/khachHang/KhachHangDetailPage.jsx` | `/khach-hang/:id` — Descriptions + contract history + debt table |

---

## MODULE 4 — Deposits (COMPLETE)

### Backend
| File | Responsibility |
|---|---|
| `shared/schemas/datCoc.schema.js` | `datCocCreateSchema` + `datCocHuySchema` |
| `services/datCoc.service.js` | `create` (trong→dat_coc), `huy` (dat_coc→trong), `getActiveByPhong` |
| `controllers/datCoc.controller.js`, `routes/datCoc.routes.js` | `GET /phong/:phong_id` before `/:id` |

### Frontend
| File | Responsibility |
|---|---|
| `api/datCoc.api.js`, `hooks/useDatCoc.js` | Create + cancel mutations |
| `components/HuyDatCocModal.jsx` | Accepts `phong_id`, fetches active deposit, cancels with reason |
| `pages/datCoc/DatCocWizard.jsx` | 3-step wizard (room → customer+deposit → confirm) |

---

## MODULE 5 — Contracts & Occupants (COMPLETE)

### Backend
| File | Responsibility |
|---|---|
| `shared/schemas/hopDong.schema.js` | `hopDongCreateSchema` (with `nguoi_o_ban_dau` array), `giaHanSchema`, `huyHopDongSchema` |
| `shared/schemas/nguoiO.schema.js` | `nguoiOCreateSchema` + `nguoiOUpdateSchema` |
| `services/nguoiO.service.js` | **`getSoNguoiOTrongThang(hop_dong_id, thang, nam)`** — exported helper used by M6 invoice; `getByHopDong`, `create`, `update`, `remove` |
| `services/hopDong.service.js` | `getAll` (filter by trang_thai/khu_id/dates/q), `getById` (full populate + nguoi_o + unpaid invoices + lich_su_gia_han), `create` (snapshot `gia_thue_ky_hop_dong`, room→`cho_thue`, convert deposit if `dat_coc`, insert NguoiO), `giaHan` (save `LichSuGiaHan`), `getLichSuGiaHan` |
| `controllers/hopDong.controller.js` | Contract CRUD + occupant sub-routes + thanhLy + huyHopDong |
| `controllers/nguoiO.controller.js` | `update` (set end date), `remove` |
| `routes/hopDong.routes.js` | Includes `/:id/nguoi-o`, `/:id/gia-han`, `/:id/lich-su-gia-han`, `/:id/thanh-ly`, `/:id/huy` |
| `routes/nguoiO.routes.js` | `PUT /:id`, `DELETE /:id` |

### Frontend
| File | Responsibility |
|---|---|
| `api/hopDong.api.js`, `hooks/useHopDong.js` | Full set including useThanhLy, useHuyHopDong, occupant mutations |
| `pages/hopDong/HopDongListPage.jsx` | Filters: trang_thai/khu/date range/search; row click → detail |
| `pages/hopDong/HopDongDetailPage.jsx` | `/hop-dong/:id` — Descriptions + Tabs: người ở (CRUD) / hóa đơn chưa TT / lich sử gia hạn; "Gia hạn" modal; button to Thanh lý page |
| `pages/hopDong/HopDongWizard.jsx` | `/hop-dong/tao` — 3-step: room picker → customer+occupant list+dates → confirm |

---

## MODULE 6 — Invoices & Payments (COMPLETE)

### Backend
| File | Responsibility |
|---|---|
| `shared/schemas/hoaDon.schema.js` | `hoaDonCreateSchema` (body only has `moi` values) + `thanhToanSchema` |
| `services/hoaDon.service.js` | `tinhTienPhong` — pro-rata rounded to 1,000 VND; `tinhHoaDon` — full calculation using `getDonGiaHieuLuc` (M2) + `getSoNguoiOTrongThang` (M5); `getAll`, `getChoLap` (active contracts missing invoice), `tinhTruoc` (preview without saving), `create` (validates chi_so_moi >= cu), `thanhToan` |
| `controllers/hoaDon.controller.js` | 5 handlers |
| `routes/hoaDon.routes.js` | `/cho-lap` and `/tinh-truoc` before `/` |

### Frontend
| File | Responsibility |
|---|---|
| `api/hoaDon.api.js`, `hooks/useHoaDon.js` | `useChoLap`, `useTinhTruoc` (live preview query), `useCreateHoaDon`, `useThanhToan` |
| `pages/hoaDon/LapHoaDonPage.jsx` | Month/year picker → rooms without invoice → click → entry form → "Tính trước" live preview → confirm |
| `pages/hoaDon/HoaDonListPage.jsx` | Filter by trang_thai/thang/nam; overdue dates shown in red; "Thanh toán" button → modal with payment method |

---

## MODULE 7 — Settlement & Cancellation (COMPLETE)

### Backend
| File | Responsibility |
|---|---|
| `shared/schemas/thanhLy.schema.js` | `thanhLySchema` — `ngay_tra`, `ghi_chu_hu_hong?`, `tien_boi_thuong >= 0` |
| `services/thanhLy.service.js` | `thanhLy` — calculates `tien_hoan_coc = max(0, coc - no - boi_thuong)`, transitions room→`trong`; `huyHopDong` — validates ≥2 consecutive unpaid months, forfeits deposit, transitions room→`trong` |

Routes/controllers already merged into `hopDong.routes.js` and `hopDong.controller.js`.

### Frontend
| File | Responsibility |
|---|---|
| `pages/thanhLy/ThanhLyPage.jsx` | `/thanh-ly` — Tabs: "Thanh lý" (search active contract → form: ngay_tra + tien_boi_thuong → shows coc/no/hoan_coc calculation); "Hủy hợp đồng" (search → reason input → confirm); result cards after success |

---

## Route Order Notes (critical)

- `phong.routes.js`: `/trong` → `/:id/lich-su-gia` → `/:id`
- `donGia.routes.js`: `/lich-su` → `/`
- `datCoc.routes.js`: `/phong/:phong_id` → `/` → `/:id/huy`
- `hoaDon.routes.js`: `/cho-lap` → `/tinh-truoc` → `/` → `/:id/thanh-toan`
- `App.jsx`: `/hop-dong/tao` before `/hop-dong/:id`; `/hoa-don/lap` before `/hoa-don` (or child route — use explicit paths)

---

## Cross-Module Exports

| Exported helper | From | Used by |
|---|---|---|
| `getDonGiaHieuLuc(loai_phong_id, loai_dv, ngay)` | `donGia.service.js` | `hoaDon.service.js` (M6) |
| `getSoNguoiOTrongThang(hop_dong_id, thang, nam)` | `nguoiO.service.js` | `hoaDon.service.js` (M6) |
| `useKhachHangSearch` | `useKhachHang.js` | `DatCocWizard` (M4), `HopDongWizard` (M5) |
| `usePhongsTrong` | `usePhong.js` | `DatCocWizard` (M4), `HopDongWizard` (M5) |

---

## Query Invalidation Map (full)

| Mutation | Invalidates |
|---|---|
| createPhong / deletePhong | `['phongs']`, `['khus']` |
| updatePhong | `['phongs']`, `['phong', id]`, `['lichSuGia', id]` |
| createDonGia | `['donGia', loai_phong_id]`, `['donGiaLichSu']` |
| createKhachHang | `['khachHangs']` |
| updateKhachHang | `['khachHangs']`, `['khachHang', id]` |
| createDatCoc | `['phongs']`, `['phongsTrong']`, `['khachHang', khach_hang_id]` |
| huyDatCoc | `['phongs']`, `['phongsTrong']`, `['khachHangs']` |
| createHopDong | `['hopDongs']`, `['phongs']`, `['phongsTrong']` |
| giaHan | `['hopDong', id]` |
| addNguoiO / updateNguoiO / deleteNguoiO | `['hopDong', hop_dong_id]` |
| thanhLy / huyHopDong | `['hopDongs']`, `['hopDong', id]`, `['phongs']` |
| createHoaDon | `['hoaDons']`, `['hoaDonChoLap']`, `['hopDong']` |
| thanhToan | `['hoaDons']`, `['hopDong']` |

---

## Manual Test Checklist — Module 5

- [ ] `POST /api/hop-dong` on deposited room → sets DatCoc to `da_chuyen_hop_dong`
- [ ] `POST /api/hop-dong` with `ngay_bat_dau` > 30 days ago → 400
- [ ] `POST /api/hop-dong` with `ngay_het_han < ngay_bat_dau + 1 month` → 400
- [ ] `GET /api/hop-dong/:id` returns nguoi_o + hoa_don_chua_thanh_toan + lich_su_gia_han
- [ ] `PUT /api/hop-dong/:id/gia-han` with earlier date → 400
- [ ] NguoiO: add, set end date, delete all work from detail page
- [ ] HopDongWizard: selected room pre-fills deposit amount

## Manual Test Checklist — Module 6

- [ ] `GET /api/hoa-don/cho-lap?thang=X&nam=Y` excludes contracts with existing invoice
- [ ] `GET /api/hoa-don/tinh-truoc` returns full breakdown without saving
- [ ] `POST /api/hoa-don` with chi_so_moi < chi_so_cu → 400
- [ ] `POST /api/hoa-don` duplicate (hop_dong_id, thang, nam) → 400
- [ ] `PUT /api/hoa-don/:id/thanh-toan` on already-paid invoice → 400
- [ ] LapHoaDonPage "Tính trước" fires live preview; "Xác nhận" saves
- [ ] HoaDonListPage overdue dates appear red; payment modal clears invoice

## Manual Test Checklist — Module 7

- [ ] `POST /api/hop-dong/:id/thanh-ly` returns tien_hoan_coc = max(0, coc - no - boi_thuong)
- [ ] Settlement transitions room back to `trong`
- [ ] `POST /api/hop-dong/:id/huy` without 2 consecutive unpaid → 400
- [ ] Cancellation with valid consecutive months → room → `trong`, deposit forfeited
- [ ] ThanhLyPage result card shows correct calculation
- [ ] HuyHopDong tab shows warning about deposit forfeiture

---

## How to Run

```bash
npm run dev
# → client: http://localhost:5173
# → server: http://localhost:3001
```

## Next Steps

- **MODULE 8** — Repairs (`/sua-chua`); depends on M2 (rooms)
- **MODULE 9** — Operating Costs (`/chi-phi-van-hanh`)
- **MODULE 10** — Dashboard & Alerts + Statistics & Reports
