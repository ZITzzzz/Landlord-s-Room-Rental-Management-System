# Modules Structure — Hệ thống quản lí cho thuê phòng trọ

---

## Tổng quan phân chia module

```
shared/
├── schemas/          Zod schemas dùng chung client + server

server/src/
├── models/           Mongoose schemas (13 collections)
├── routes/           Express routers
├── controllers/      Nhận request → gọi service → trả response
├── services/         Business logic thuần (không biết về HTTP)
├── middlewares/      Validate, error handler
└── templates/        HTML templates cho PDF

client/src/
├── api/              Axios functions gọi REST API
├── hooks/            TanStack Query wrappers
├── pages/            Trang (1 route = 1 page)
└── components/       UI components tái sử dụng
```

---

## SERVER — Chi tiết từng module

---

### M-S01 · Khu nhà trọ

| Tầng | File | Trách nhiệm |
|---|---|---|
| Model | `models/Khu.js` | Schema: `ten, dia_chi, ghi_chu` |
| Route | `routes/khu.routes.js` | `GET /api/khu`, `POST`, `PUT /:id`, `DELETE /:id` |
| Controller | `controllers/khu.controller.js` | Parse req, gọi service, trả res |
| Service | `services/khu.service.js` | Kiểm tra điều kiện xóa (tất cả phòng `trong`, không nợ HĐ) |

**Dependencies:** `Phong`, `HoaDon`

---

### M-S02 · Loại phòng & Đơn giá dịch vụ

| Tầng | File | Trách nhiệm |
|---|---|---|
| Model | `models/LoaiPhong.js` | Schema: `ten, suc_chua` |
| Model | `models/DonGiaDichVu.js` | Schema: `loai_phong_id, loai_dv, don_gia, ngay_ap_dung` |
| Route | `routes/loaiPhong.routes.js` | CRUD loại phòng |
| Route | `routes/donGia.routes.js` | `GET /api/don-gia`, `POST`, `GET /lich-su` |
| Controller | `controllers/loaiPhong.controller.js` | |
| Controller | `controllers/donGia.controller.js` | |
| Service | `services/donGia.service.js` | `getDonGiaHieuLuc(loai_phong_id, loai_dv, ngay)` — lấy đơn giá có hiệu lực tại 1 thời điểm (dùng bởi M-S07) |

**Exported helper:** `getDonGiaHieuLuc()` — dùng bởi HoaDon service

---

### M-S03 · Phòng trọ

| Tầng | File | Trách nhiệm |
|---|---|---|
| Model | `models/Phong.js` | Schema: `ten, khu_id, loai_phong_id, gia_thue, trang_thai`; unique index `(ten, khu_id)` |
| Model | `models/LichSuGiaThuPhong.js` | Schema: `phong_id, gia_cu, gia_moi, ngay_ap_dung` |
| Route | `routes/phong.routes.js` | CRUD + `GET /trong` + `GET /:id/lich-su-gia` |
| Controller | `controllers/phong.controller.js` | |
| Service | `services/phong.service.js` | Khi `gia_thue` thay đổi → tự tạo bản ghi `LichSuGiaThuPhong`; validate tên unique; validate xóa |

**Trạng thái phòng:** `trong` → `dat_coc` → `cho_thue` → `trong` | `sua_chua` → `trong`

---

### M-S04 · Khách hàng

| Tầng | File | Trách nhiệm |
|---|---|---|
| Model | `models/KhachHang.js` | Schema: `ho_ten, ngay_sinh, cmnd, so_dien_thoai, que_quan`; unique index `cmnd` |
| Route | `routes/khachHang.routes.js` | `GET` (search), `GET /:id`, `POST`, `PUT /:id` |
| Controller | `controllers/khachHang.controller.js` | |
| Service | `services/khachHang.service.js` | Tổng hợp nợ theo từng hợp đồng khi lấy chi tiết KH |

**Dependencies:** `HopDong`, `HoaDon`

---

### M-S05 · Đặt cọc

| Tầng | File | Trách nhiệm |
|---|---|---|
| Model | `models/DatCoc.js` | Schema: `phong_id, khach_hang_id, so_tien, ngay_dat_coc, trang_thai, ly_do_huy` |
| Route | `routes/datCoc.routes.js` | `POST /api/dat-coc`, `PUT /:id/huy` |
| Controller | `controllers/datCoc.controller.js` | |
| Service | `services/datCoc.service.js` | Tạo đặt cọc → chuyển phòng `trong → dat_coc`; hủy đặt cọc → chuyển phòng `dat_coc → trong` |

**Dependencies:** `Phong`

---

### M-S06 · Hợp đồng

| Tầng | File | Trách nhiệm |
|---|---|---|
| Model | `models/HopDong.js` | Schema: `phong_id, khach_hang_id, ngay_bat_dau, ngay_het_han, gia_thue_tai_thoi_diem_ky, tien_dat_coc, so_nguoi_o, trang_thai, ...` |
| Model | `models/LichSuGiaHan.js` | Schema: `hop_dong_id, ngay_gia_han, han_cu, han_moi` |
| Model | `models/NguoiO.js` | Schema: `hop_dong_id, ho_ten, cmnd, ngay_bat_dau, ngay_ket_thuc` |
| Route | `routes/hopDong.routes.js` | CRUD + `/gia-han` + `/thanh-ly` + `/huy` + `/nguoi-o` |
| Controller | `controllers/hopDong.controller.js` | |
| Service | `services/hopDong.service.js` | Tạo HĐ (validate ngày, trạng thái phòng, chuyển phòng `→ cho_thue`, tạo NguoiO ban đầu); gia hạn; validate |
| Service | `services/thanhLy.service.js` | `tinhHoanCoc(hop_dong_id, tien_boi_thuong)` = cọc − nợ − bồi thường (min 0); chuyển phòng `→ trong` |
| Service | `services/huyHopDong.service.js` | Validate ≥ 2 HĐ liên tiếp chưa trả; giữ cọc; chuyển phòng `→ trong` |

**Exported helper:** `getSoNguoiOTrongThang(hop_dong_id, thang, nam)` — dùng bởi HoaDon service

**Dependencies:** `Phong`, `KhachHang`, `DatCoc`, `HoaDon`

---

### M-S07 · Hóa đơn

| Tầng | File | Trách nhiệm |
|---|---|---|
| Model | `models/HoaDon.js` | Schema: `hop_dong_id, thang, nam, chi_so_dien_cu/moi, chi_so_nuoc_cu/moi, so_xe_may, so_xe_dap, no_thang_truoc, tong_tien, trang_thai, ngay_thanh_toan, phuong_thuc, ma_giao_dich`; unique index `(hop_dong_id, thang, nam)` |
| Route | `routes/hoaDon.routes.js` | `GET`, `GET /cho-lap`, `GET /tinh-truoc`, `POST`, `PUT /:id/thanh-toan` |
| Controller | `controllers/hoaDon.controller.js` | |
| Service | `services/hoaDon.service.js` | Tính toán hóa đơn đầy đủ |

**Logic tính trong `hoaDon.service.js`:**
```
tinhHoaDon(hop_dong, chi_so, so_xe):
  1. getDonGiaHieuLuc()         ← từ M-S02
  2. getSoNguoiOTrongThang()    ← từ M-S06
  3. tinhTienPhong()            ← pro-rata tháng đầu/cuối, làm tròn 1.000đ
  4. tiền điện = (mới - cũ) × đơn giá điện
  5. tiền nước = (mới - cũ) × đơn giá nước
  6. tiền vệ sinh = số người × đơn giá vệ sinh
  7. tiền xe = (số máy × giá máy) + (số đạp × giá đạp)
  8. nợ cũ = tổng HoaDon chưa thanh toán của hop_dong_id
  9. tong_tien = tổng tất cả
```

**Dependencies:** `HopDong`, `NguoiO`, `DonGiaDichVu`

---

### M-S08 · Sửa chữa & Bảo trì

| Tầng | File | Trách nhiệm |
|---|---|---|
| Model | `models/SuaChua.js` | Schema: `phong_id, mo_ta, ngay_phat_sinh, chi_phi_du_kien, chi_phi_thuc_te, trang_thai, do_kh_gay_ra` |
| Route | `routes/suaChua.routes.js` | `GET`, `POST`, `PUT /:id` |
| Controller | `controllers/suaChua.controller.js` | |
| Service | `services/suaChua.service.js` | Khi `trang_thai → hoan_thanh` và phòng đang `sua_chua` → chuyển phòng `→ trong` |

**Dependencies:** `Phong`

---

### M-S09 · Chi phí vận hành

| Tầng | File | Trách nhiệm |
|---|---|---|
| Model | `models/ChiPhiVanHanh.js` | Schema: `khu_id (nullable), thang, nam, loai, so_tien, ghi_chu` |
| Route | `routes/chiPhi.routes.js` | CRUD |
| Controller | `controllers/chiPhi.controller.js` | |
| Service | `services/chiPhi.service.js` | Validate `so_tien > 0`; tổng hợp chi phí theo tháng (dùng bởi M-S10) |

---

### M-S10 · Dashboard & Cảnh báo

| Tầng | File | Trách nhiệm |
|---|---|---|
| Model | `models/CanhBaoDaXem.js` | Schema: `loai_canh_bao, tham_chieu_id, ngay_xem` |
| Route | `routes/dashboard.routes.js` | `GET /kpi`, `GET /canh-bao`, `PUT /canh-bao/:loai/:id/da-xem` |
| Controller | `controllers/dashboard.controller.js` | |
| Service | `services/dashboard.service.js` | Tính 4 KPI |
| Service | `services/canhBao.service.js` | 5 queries cảnh báo; lọc bỏ bản ghi đã xem hôm nay |

**5 loại cảnh báo trong `canhBao.service.js`:**
```
1. phongChuaLapHoaDon()   Phòng cho_thue, qua cuối tháng, chưa có HĐ tháng này
2. hoaDonSapDenHan()      HoaDon chưa TT, hạn - hôm nay ≤ 2 ngày
3. hoaDonQuaHan()         HoaDon chưa TT, hôm nay - ngay_tao > 7 ngày
4. nguyCoHuyHopDong()     HopDong có ≥ 2 HoaDon liên tiếp chưa TT
5. hopDongSapHetHan()     HopDong hieu_luc, ngay_het_han - hôm nay = 30 ngày
```

**Dependencies:** `Phong`, `HopDong`, `HoaDon`, `ChiPhiVanHanh`

---

### M-S11 · Thống kê & Báo cáo

| Tầng | File | Trách nhiệm |
|---|---|---|
| Route | `routes/thongKe.routes.js` | `GET /thong-ke`, `GET /thong-ke/:ky/hoa-don` |
| Route | `routes/baoCao.routes.js` | `GET /bao-cao/cong-suat`, `/no`, `/doanh-thu-theo-phong` |
| Controller | `controllers/thongKe.controller.js` | |
| Service | `services/thongKe.service.js` | Tổng hợp doanh thu − chi phí = lợi nhuận theo tháng/quý/năm |
| Service | `services/baoCao.service.js` | 3 loại báo cáo nâng cao |

**Dependencies:** `HoaDon`, `ChiPhiVanHanh`, `Phong`, `HopDong`, `KhachHang`

---

### M-S12 · In ấn PDF

| Tầng | File | Trách nhiệm |
|---|---|---|
| Route | `routes/in.routes.js` | `GET /in/hop-dong/:id`, `/hoa-don/:id`, `/thanh-ly/:id`, `/huy/:id` |
| Controller | `controllers/in.controller.js` | Lấy dữ liệu đầy đủ, gọi pdf.service, trả file |
| Service | `services/pdf.service.js` | `renderPDF(templateName, data) → Buffer` dùng Puppeteer |
| Templates | `templates/hopDong.html` | HTML template hợp đồng |
| Templates | `templates/hoaDon.html` | HTML template hóa đơn |
| Templates | `templates/bienBanThanhLy.html` | HTML template biên bản thanh lý |
| Templates | `templates/bienBanHuy.html` | HTML template biên bản hủy |

---

### M-S13 · Xuất Excel

| Tầng | File | Trách nhiệm |
|---|---|---|
| Route | `routes/xuat.routes.js` | `GET /xuat/doanh-thu`, `/no`, `/cong-suat` |
| Controller | `controllers/xuat.controller.js` | |
| Service | `services/excel.service.js` | `taoWorkbook(headers, rows)` → Buffer dùng ExcelJS |

---

### M-S14 · Shared Middlewares

| File | Trách nhiệm |
|---|---|
| `middlewares/validate.js` | Nhận Zod schema, validate `req.body` / `req.params`, trả 400 nếu sai |
| `middlewares/errorHandler.js` | Bắt lỗi toàn cục, log Winston, trả `{ success: false, error }` |
| `config/logger.js` | Winston: `error.log` + `combined.log`; Morgan: HTTP request log |

---

## CLIENT — Chi tiết từng module

---

### M-C01 · Dashboard

```
pages/Dashboard.jsx
  ├── components/KpiCard.jsx          Thẻ số liệu (tỉ lệ lấp đầy, doanh thu...)
  ├── components/CanhBaoCard.jsx      Thẻ cảnh báo (có nút Xem chi tiết + Đã xem)
  └── hooks/useDashboard.js           useQuery: GET /api/dashboard/kpi + /canh-bao
```

---

### M-C02 · Quản lí danh mục

```
pages/khu/
  ├── DanhSachKhu.jsx                 Bảng khu + form thêm/sửa inline
  └── hooks/useKhu.js

pages/phong/
  ├── DanhSachPhong.jsx               Bảng phòng, lọc khu/trạng thái, badge màu
  ├── FormPhong.jsx                   Form thêm/sửa phòng
  ├── LichSuGiaPhong.jsx              Bảng lịch sử giá thuê
  └── hooks/usePhong.js

pages/loaiPhong/
  ├── LoaiPhongVaDonGia.jsx           Bảng loại phòng + bảng đơn giá dịch vụ
  ├── FormDonGia.jsx                  Form cập nhật đơn giá
  └── hooks/useLoaiPhong.js
```

---

### M-C03 · Khách hàng

```
pages/khachHang/
  ├── DanhSachKhachHang.jsx           Bảng + search tên/CMND
  ├── ChiTietKhachHang.jsx            Info + lịch sử HĐ + nợ theo từng phòng
  ├── FormKhachHang.jsx               Form thêm/sửa
  └── hooks/useKhachHang.js
```

---

### M-C04 · Đặt cọc & Hợp đồng

```
pages/hopDong/
  ├── DanhSachHopDong.jsx             Bảng tất cả HĐ, filter đa chiều
  ├── ChiTietHopDong.jsx              Chi tiết + nút Gia hạn / Thanh lý / Hủy
  ├── WizardDatCoc.jsx                Step 1: Tìm phòng → Step 2: Nhập KH + cọc
  ├── WizardHopDong.jsx               Step 1: Tìm phòng → Step 2: Nhập KH → Step 3: Preview → Xác nhận
  ├── FormGiaHan.jsx                  Form gia hạn (inline modal)
  └── hooks/useHopDong.js
```

**WizardHopDong steps:**
```
Step 1: PhongSelector   Tìm phòng trống/đặt cọc theo ngày + mức giá
Step 2: KhachHangForm   Tìm KH đã có hoặc nhập mới; nhập số người ở; điền cọc
Step 3: PreviewHopDong  Hiển thị mẫu hợp đồng đầy đủ
Step 4: Xác nhận        POST → in PDF
```

---

### M-C05 · Người ở trong phòng

```
pages/nguoiO/
  ├── QuanLiNguoiO.jsx                Chọn phòng → bảng người ở + thêm/xóa
  └── hooks/useNguoiO.js
```

---

### M-C06 · Hóa đơn

```
pages/hoaDon/
  ├── LapHoaDon.jsx                   Danh sách phòng chưa lập → click → form nhập → preview → xác nhận
  ├── ThanhToanHoaDon.jsx             Tìm HĐ → chi tiết → chọn phương thức → xác nhận
  ├── PreviewHoaDon.jsx               Component hiển thị breakdown hóa đơn (dùng chung)
  └── hooks/useHoaDon.js
```

---

### M-C07 · Thanh lý & Hủy

```
pages/thanhLy/
  ├── ThanhLyHopDong.jsx              Tìm HĐ (chọn phòng nếu KH nhiều phòng) → nhập → tính hoàn cọc → xác nhận → PDF
  └── HuyHopDong.jsx                  Tìm HĐ → danh sách HĐ chưa trả → xác nhận → PDF

hooks/useThanhLy.js
```

---

### M-C08 · Sửa chữa & Bảo trì

```
pages/suaChua/
  ├── DanhSachSuaChua.jsx             Bảng + lọc phòng/trạng thái
  ├── FormSuaChua.jsx                 Form tạo yêu cầu
  ├── CapNhatTrangThai.jsx            Cập nhật trạng thái + chi phí thực tế
  └── hooks/useSuaChua.js
```

---

### M-C09 · Thống kê & Báo cáo

```
pages/thongKe/
  ├── ThongKe.jsx                     Chọn kỳ → bảng doanh thu/chi phí/lợi nhuận + Recharts
  ├── ChiTietKy.jsx                   Danh sách HĐ trong kỳ
  └── hooks/useThongKe.js

pages/baoCao/
  ├── BaoCao.jsx                      Tabs: công suất / nợ / doanh thu theo phòng
  ├── BaoCaoCongSuat.jsx
  ├── BaoCaoNo.jsx
  ├── BaoCaoDoanhThu.jsx
  └── hooks/useBaoCao.js
```

---

### M-C10 · Chi phí vận hành

```
pages/chiPhi/
  ├── ChiPhiVanHanh.jsx               Bảng chi phí + lọc tháng/khu + form thêm/sửa/xóa
  └── hooks/useChiPhi.js
```

---

### M-C11 · Shared Components

```
components/
  ├── ConfirmDeleteModal.jsx          Dialog xác nhận lần hai (dùng mọi nơi xóa)
  ├── StatusBadge.jsx                 Badge màu trạng thái phòng / hợp đồng / hóa đơn
  ├── PhongSelector.jsx               Dropdown tìm + chọn phòng (dùng ở HĐ, sửa chữa)
  ├── KhachHangSearch.jsx             Search + select KH hoặc nhập mới
  ├── MoneyInput.jsx                  Input nhập tiền (format VND, chỉ nhận số dương)
  ├── DateRangePicker.jsx             Chọn khoảng ngày (dùng ở filter nhiều trang)
  └── ExportButton.jsx                Nút xuất Excel / PDF (gọi API /xuat hoặc /in)
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
  └── in.api.js                       Gọi API PDF/Excel, trigger download file

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
  ├── hopDong.schema.js               { ngay_bat_dau, ngay_het_han (> bat_dau + 1 tháng), ... }
  ├── hoaDon.schema.js                { chi_so_dien_moi >= cu, chi_so_nuoc_moi >= cu, ... }
  ├── thanhLy.schema.js               { ngay_tra, tien_boi_thuong >= 0 }
  └── chiPhi.schema.js                { so_tien > 0, thang 1-12, nam > 2000 }
```

Dùng trong server: `validate.js` middleware nhận schema → kiểm tra `req.body`
Dùng trong client: `useForm({ resolver: zodResolver(schema) })`

---

## Phụ thuộc giữa các module (server)

```
M-S07 HoaDon
  └── depends on: M-S02 getDonGiaHieuLuc()
                  M-S06 getSoNguoiOTrongThang()

M-S10 Dashboard / CanhBao
  └── depends on: M-S03 Phong
                  M-S06 HopDong, NguoiO
                  M-S07 HoaDon
                  M-S09 ChiPhiVanHanh

M-S11 ThongKe
  └── depends on: M-S07 HoaDon
                  M-S09 ChiPhiVanHanh

M-S12 PDF
  └── depends on: M-S06 HopDong (lấy data để inject vào template)
                  M-S07 HoaDon

M-S06 HopDong (tạo)
  └── depends on: M-S03 Phong (chuyển trạng thái)
                  M-S05 DatCoc (lấy tiền cọc)

M-S06 ThanhLy / Huy
  └── depends on: M-S03 Phong (chuyển trạng thái)
                  M-S07 HoaDon (tính nợ tồn đọng)
                  M-S08 SuaChua (chi phí do KH gây ra)
```
