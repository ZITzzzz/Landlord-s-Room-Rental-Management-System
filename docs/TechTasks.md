# Tech Tasks — Hệ thống quản lí cho thuê phòng trọ

## Stack công nghệ

| Layer | Công nghệ | Mục đích |
|---|---|---|
| **Frontend** | React + React Router | SPA, điều hướng |
| **UI** | Ant Design | Table, Form, Modal, Badge — sẵn cho hệ thống quản lí |
| **Form & Validate** | React Hook Form + Zod | Quản lí form, validate dùng chung schema với backend |
| **Server state** | TanStack Query (React Query) | Cache, loading, auto-refetch cho dashboard & cảnh báo |
| **Ngày tháng** | Day.js | Tính pro-rata, đếm tháng nợ, kiểm tra 30 ngày |
| **Biểu đồ** | Recharts | Biểu đồ doanh thu, tỉ lệ lấp đầy |
| **Backend** | Node.js + Express | REST API |
| **ODM** | Mongoose | Schema & truy vấn MongoDB |
| **PDF** | Puppeteer | Render hợp đồng, hóa đơn, biên bản từ HTML → PDF |
| **Excel** | ExcelJS | Xuất báo cáo .xlsx |
| **Logging** | Winston + Morgan | Ghi log request & lỗi server ra file |
| **Database** | MongoDB | |
| **Process** | PM2 | Chạy Node.js ổn định, tự restart khi crash |
| **Deploy** | Docker Compose | Đóng gói toàn bộ app, chạy 1 lệnh trên máy LAN |

---

## PHASE 0 — Khởi tạo dự án & Cơ sở dữ liệu

### T0.1 Cấu trúc project
- [ ] Khởi tạo 2 folder: `client/` (React + Vite) và `server/` (Node.js)
- [ ] `server/`: Express + Mongoose + dotenv + cors + nodemon + Winston + Morgan
- [ ] `client/`: Vite + React Router + Ant Design + TanStack Query + React Hook Form + Zod + Day.js + Recharts
- [ ] Cấu hình proxy từ client → server khi dev (vite.config.js)
- [ ] File `.env` cho chuỗi kết nối MongoDB, PORT
- [ ] Zod schemas dùng chung: tạo folder `shared/schemas/` chứa validate rules cho cả 2 phía
- [ ] `docker-compose.yml`: service `mongo`, `server`, `client`
- [ ] `ecosystem.config.js` cho PM2

### T0.2 MongoDB Schemas (Mongoose)

**Khu:**
```
{ ten, dia_chi, ghi_chu }
```

**LoaiPhong:**
```
{ ten, suc_chua: Number(1-4) }
```

**DonGiaDichVu:**
```
{ loai_phong_id, loai_dv: enum[dien|nuoc|ve_sinh|xe_may|xe_dap],
  don_gia, ngay_ap_dung }
```

**Phong:**
```
{ ten, khu_id, loai_phong_id, gia_thue,
  trang_thai: enum[trong|cho_thue|dat_coc|sua_chua] }
// Index: unique(ten, khu_id)
```

**LichSuGiaThuPhong:**
```
{ phong_id, gia_cu, gia_moi, ngay_ap_dung }
```

**KhachHang:**
```
{ ho_ten, ngay_sinh, cmnd, so_dien_thoai, que_quan }
// Index: unique(cmnd)
```

**DatCoc:**
```
{ phong_id, khach_hang_id, so_tien, ngay_dat_coc,
  trang_thai: enum[con_hieu_luc|huy], ly_do_huy }
```

**HopDong:**
```
{ phong_id, khach_hang_id, ngay_bat_dau, ngay_het_han,
  gia_thue_tai_thoi_diem_ky, tien_dat_coc, so_nguoi_o,
  trang_thai: enum[hieu_luc|thanh_ly|huy],
  ngay_thanh_ly, ngay_huy, ly_do_huy }
```

**LichSuGiaHan:**
```
{ hop_dong_id, ngay_gia_han, han_cu, han_moi }
```

**NguoiO:**
```
{ hop_dong_id, ho_ten, cmnd, ngay_bat_dau, ngay_ket_thuc }
```

**HoaDon:**
```
{ hop_dong_id, thang: Number, nam: Number,
  chi_so_dien_cu, chi_so_dien_moi,
  chi_so_nuoc_cu, chi_so_nuoc_moi,
  so_xe_may, so_xe_dap,
  no_thang_truoc,
  tong_tien,
  trang_thai: enum[chua_thanh_toan|da_thanh_toan],
  ngay_thanh_toan,
  phuong_thuc: enum[tien_mat|chuyen_khoan],
  ma_giao_dich }
// Index: unique(hop_dong_id, thang, nam)
```

**SuaChua:**
```
{ phong_id, mo_ta, ngay_phat_sinh,
  chi_phi_du_kien, chi_phi_thuc_te,
  trang_thai: enum[cho_xu_ly|dang_xu_ly|hoan_thanh],
  do_kh_gay_ra: Boolean }
```

**ChiPhiVanHanh:**
```
{ khu_id (nullable), thang, nam,
  loai: enum[dien_nuoc_tong|sua_chua_chung|khac],
  so_tien, ghi_chu }
```

**CanhBaoDaXem:**
```
{ loai_canh_bao, tham_chieu_id, ngay_xem }
```

### T0.3 Seed data
- [ ] Script seed: 2 khu, 2 loại phòng, 5 phòng, 3 KH, đơn giá mẫu, 2 hợp đồng, vài hóa đơn

---

## PHASE 1 — API Backend: Danh mục (Module 4.1, 4.2, 4.13)

### T1.1 API Khu nhà trọ
- [ ] `GET    /api/khu` — danh sách khu (kèm số phòng, số phòng đang thuê)
- [ ] `POST   /api/khu` — thêm khu
- [ ] `PUT    /api/khu/:id` — sửa khu
- [ ] `DELETE /api/khu/:id` — xóa khu (validate: tất cả phòng `trong`, không có hóa đơn chưa thanh toán)

### T1.2 API Loại phòng
- [ ] `GET    /api/loai-phong`
- [ ] `POST   /api/loai-phong`
- [ ] `PUT    /api/loai-phong/:id`
- [ ] `DELETE /api/loai-phong/:id` — validate: không có phòng nào dùng loại này

### T1.3 API Phòng
- [ ] `GET    /api/phong` — lọc theo khu, trạng thái
- [ ] `GET    /api/phong/:id` — chi tiết phòng
- [ ] `POST   /api/phong` — validate unique(ten, khu_id)
- [ ] `PUT    /api/phong/:id` — nếu gia_thue thay đổi → tự tạo bản ghi `LichSuGiaThuPhong`
- [ ] `DELETE /api/phong/:id` — validate trạng thái `trong` + không nợ hóa đơn
- [ ] `GET    /api/phong/:id/lich-su-gia` — lịch sử giá thuê
- [ ] `GET    /api/phong/trong` — danh sách phòng trống/đặt cọc, lọc theo ngày + mức giá (dùng cho màn hình tìm phòng)

### T1.4 API Đơn giá dịch vụ
- [ ] `GET    /api/don-gia` — đơn giá hiện tại theo loại phòng
- [ ] `POST   /api/don-gia` — thêm mức giá mới (tự động lưu lịch sử)
- [ ] `GET    /api/don-gia/lich-su` — lịch sử đơn giá (lọc theo loại phòng, loại dịch vụ)
- [ ] Helper nội bộ: `getDonGiaHieuLuc(loai_phong_id, loai_dv, ngay)` — lấy đơn giá có hiệu lực tại 1 thời điểm

---

## PHASE 2 — API Backend: Khách hàng & Hợp đồng (Module 4.3–4.6, 4.17)

### T2.1 API Khách hàng
- [ ] `GET    /api/khach-hang` — tìm theo tên / CMND (regex)
- [ ] `GET    /api/khach-hang/:id` — chi tiết + lịch sử hợp đồng + nợ theo từng phòng
- [ ] `POST   /api/khach-hang` — validate unique CMND
- [ ] `PUT    /api/khach-hang/:id`

### T2.2 API Đặt cọc
- [ ] `POST   /api/dat-coc` — lưu đặt cọc, chuyển phòng → `dat_coc`
- [ ] `PUT    /api/dat-coc/:id/huy` — hủy đặt cọc, chuyển phòng → `trong`

### T2.3 API Hợp đồng
- [ ] `GET    /api/hop-dong` — lọc theo trạng thái, khu, khoảng thời gian, KH, phòng
- [ ] `GET    /api/hop-dong/:id`
- [ ] `POST   /api/hop-dong` — validate ngày, trạng thái phòng; nếu phòng `dat_coc` thì điền tiền cọc; chuyển phòng → `cho_thue`; tạo bản ghi `NguoiO` ban đầu
- [ ] `PUT    /api/hop-dong/:id/gia-han` — validate ngày mới > ngày cũ; lưu `LichSuGiaHan`
- [ ] `GET    /api/hop-dong/:id/lich-su-gia-han`

### T2.4 API Người ở
- [ ] `GET    /api/hop-dong/:id/nguoi-o`
- [ ] `POST   /api/hop-dong/:id/nguoi-o`
- [ ] `PUT    /api/nguoi-o/:id` — cập nhật ngày kết thúc (khi người ra đi)
- [ ] `DELETE /api/nguoi-o/:id`
- [ ] Helper nội bộ: `getSoNguoiOTrongThang(hop_dong_id, thang, nam)` — tính số người ở trung bình trong tháng (dùng cho lập hóa đơn)

---

## PHASE 3 — API Backend: Hóa đơn & Thanh toán (Module 4.7, 4.8)

### T3.1 API Hóa đơn
- [ ] `GET    /api/hoa-don` — lọc theo phòng, tháng/năm, trạng thái
- [ ] `GET    /api/hoa-don/cho-lap` — danh sách phòng `cho_thue` chưa có hóa đơn tháng này
- [ ] `GET    /api/hoa-don/tinh-truoc` — preview hóa đơn (chưa lưu): nhận vào hop_dong_id + chỉ số điện/nước + số xe → trả về breakdown đầy đủ
- [ ] `POST   /api/hoa-don` — lưu hóa đơn sau khi QL xác nhận; validate chỉ số mới ≥ chỉ số cũ
- [ ] Helper nội bộ: `tinhTienPhong(hop_dong, thang, nam)` — xử lý pro-rata tháng đầu/cuối, làm tròn 1.000đ

### T3.2 API Thanh toán
- [ ] `PUT    /api/hoa-don/:id/thanh-toan` — body: `{ phuong_thuc, ma_giao_dich? }`; validate trạng thái chưa thanh toán

---

## PHASE 4 — API Backend: Thanh lý & Hủy (Module 4.10, 4.11)

### T4.1 API Thanh lý
- [ ] `POST   /api/hop-dong/:id/thanh-ly` — body: `{ ngay_tra, ghi_chu_hu_hong, tien_boi_thuong }`; tính hoàn cọc; chuyển phòng → `trong`; trả về dữ liệu để in biên bản

### T4.2 API Hủy hợp đồng
- [ ] `POST   /api/hop-dong/:id/huy` — validate ≥ 2 hóa đơn liên tiếp chưa thanh toán; giữ cọc; chuyển phòng → `trong`

---

## PHASE 5 — API Backend: Sửa chữa & Chi phí (Module 4.16, 4.18)

### T5.1 API Sửa chữa
- [ ] `GET    /api/sua-chua` — lọc theo phòng, trạng thái
- [ ] `POST   /api/sua-chua`
- [ ] `PUT    /api/sua-chua/:id` — cập nhật trạng thái + chi phí thực tế; khi `hoan_thanh` và phòng đang `sua_chua` → chuyển phòng → `trong`

### T5.2 API Chi phí vận hành
- [ ] `GET    /api/chi-phi` — lọc theo tháng, khu
- [ ] `POST   /api/chi-phi` — validate so_tien > 0
- [ ] `PUT    /api/chi-phi/:id`
- [ ] `DELETE /api/chi-phi/:id`

---

## PHASE 6 — API Backend: Dashboard & Thống kê (Module 4.9, 4.14, 4.15)

### T6.1 API Dashboard
- [ ] `GET /api/dashboard/kpi` — trả về: tỉ lệ lấp đầy theo khu, doanh thu tháng hiện tại, số HĐ sắp hết hạn, số phòng sửa chữa
- [ ] `GET /api/dashboard/canh-bao` — trả về danh sách 5 loại cảnh báo với danh sách phòng/hóa đơn/hợp đồng liên quan
- [ ] `PUT /api/dashboard/canh-bao/:loai/:id/da-xem` — đánh dấu đã xem

### T6.2 API Thống kê
- [ ] `GET /api/thong-ke?loai=thang|quy|nam&tu=...&den=...` — doanh thu, chi phí, lợi nhuận theo kỳ
- [ ] `GET /api/thong-ke/:ky/hoa-don` — danh sách hóa đơn chi tiết trong kỳ

### T6.3 API Báo cáo
- [ ] `GET /api/bao-cao/cong-suat` — tỉ lệ lấp đầy theo khu, lịch sử theo tháng
- [ ] `GET /api/bao-cao/no` — danh sách KH nợ, tổng nợ, số tháng liên tiếp, breakdown theo phòng
- [ ] `GET /api/bao-cao/doanh-thu-theo-phong` — doanh thu từng phòng / khu trong kỳ

---

## PHASE 7 — Frontend React

### T7.1 Layout & Router
- [ ] Layout chung: sidebar navigation + header
- [ ] React Router: định nghĩa tất cả routes
- [ ] Axios instance với base URL + error interceptor

### T7.2 Trang Dashboard
- [ ] 4 thẻ KPI (tỉ lệ lấp đầy, doanh thu tháng, HĐ sắp hết hạn, phòng sửa chữa)
- [ ] Danh sách thẻ cảnh báo phân nhóm, nút Xem chi tiết, nút Đã xem

### T7.3 Quản lí danh mục
- [ ] Trang Quản lí khu (bảng + form thêm/sửa + xóa với confirm dialog)
- [ ] Trang Quản lí phòng (bảng lọc theo khu/trạng thái + badge màu + form + lịch sử giá)
- [ ] Trang Loại phòng & Đơn giá dịch vụ (bảng đơn giá hiện tại + form cập nhật + xem lịch sử)

### T7.4 Khách hàng
- [ ] Trang danh sách KH (search, bảng)
- [ ] Trang chi tiết KH (info + lịch sử HĐ + nợ theo từng phòng)

### T7.5 Hợp đồng
- [ ] Trang danh sách hợp đồng (filter + bảng + click xem chi tiết)
- [ ] Wizard đặt cọc: chọn phòng → nhập KH + số tiền
- [ ] Wizard làm hợp đồng: tìm phòng → nhập KH → preview hợp đồng → xác nhận → in PDF
- [ ] Form gia hạn hợp đồng

### T7.6 Hóa đơn & Thanh toán
- [ ] Trang lên hóa đơn: danh sách phòng chưa lập → click vào phòng → form nhập → preview → xác nhận → in PDF
- [ ] Trang thanh toán: tìm hóa đơn → hiển thị chi tiết → chọn phương thức → xác nhận

### T7.7 Thanh lý & Hủy
- [ ] Form thanh lý: tìm HĐ (nếu KH nhiều phòng → chọn phòng) → nhập thông tin trả → hiển thị tính toán hoàn cọc → xác nhận → in PDF
- [ ] Form hủy hợp đồng: tìm HĐ → hiển thị danh sách hóa đơn chưa trả → xác nhận → in PDF

### T7.8 Người ở & Sửa chữa
- [ ] Trang quản lí người ở theo phòng (danh sách + thêm/xóa + cảnh báo vượt sức chứa)
- [ ] Trang sửa chữa (danh sách + form tạo + cập nhật trạng thái + chi phí thực tế)

### T7.9 Thống kê & Báo cáo
- [ ] Trang thống kê doanh thu (chọn kỳ → bảng doanh thu/chi phí/lợi nhuận → click xem chi tiết hóa đơn)
- [ ] Trang báo cáo nâng cao (công suất, nợ, doanh thu theo phòng)
- [ ] Nút xuất Excel + PDF cho từng báo cáo

### T7.10 Chi phí vận hành
- [ ] Trang chi phí vận hành (bảng lọc theo tháng/khu + form thêm/sửa/xóa)

---

## PHASE 8 — In ấn & Xuất file (NFR-2, NFR-7)

### T8.1 Generate PDF phía server (Puppeteer)
- [ ] Cài Puppeteer, tạo hàm `renderPDF(templateHtml) → Buffer`
- [ ] HTML template cho hợp đồng thuê phòng (dùng dữ liệu inject vào template string)
- [ ] HTML template cho hóa đơn tháng
- [ ] HTML template cho biên bản thanh lý
- [ ] HTML template cho biên bản hủy hợp đồng
- [ ] API endpoint trả về file PDF:
  - `GET /api/in/hop-dong/:id`
  - `GET /api/in/hoa-don/:id`
  - `GET /api/in/thanh-ly/:hop_dong_id`
  - `GET /api/in/huy/:hop_dong_id`

### T8.2 Xuất Excel (ExcelJS)
- [ ] Hàm helper `taoWorkbook(headers, rows)` dùng chung
- [ ] Xuất báo cáo doanh thu: `GET /api/xuat/doanh-thu?format=excel`
- [ ] Xuất báo cáo nợ: `GET /api/xuat/no?format=excel`
- [ ] Xuất báo cáo công suất: `GET /api/xuat/cong-suat?format=excel`

---

## PHASE 9 — Non-functional (NFR)

### T9.1 Index MongoDB
- [ ] `phong`: index `{ khu_id, trang_thai }`
- [ ] `hop_dong`: index `{ khach_hang_id }`, `{ phong_id, trang_thai }`
- [ ] `hoa_don`: index `{ hop_dong_id, thang, nam }` (unique), `{ trang_thai }`
- [ ] `khach_hang`: index unique `{ cmnd }`

### T9.2 Backup & Restore
- [ ] Tính năng backup: `mongodump` → nén → tải file về
- [ ] Tính năng restore: upload file → `mongorestore`
- [ ] Hoặc dùng `mongoexport/import` JSON nếu đơn giản hơn

### T9.3 UX chung
- [ ] Tất cả ô tìm kiếm dùng debounce + LIKE (regex MongoDB)
- [ ] Confirm dialog lần hai cho mọi thao tác xóa quan trọng (dùng `Modal.confirm` của Ant Design)
- [ ] Toast notification cho thành công / thất bại (dùng `message` / `notification` của Ant Design)
- [ ] Loading skeleton khi fetch data (TanStack Query `isLoading`)
- [ ] Error boundary cho React

### T9.4 Logging (Winston + Morgan)
- [ ] Cấu hình Morgan log HTTP request ra console khi dev, ra file khi production
- [ ] Cấu hình Winston: log lỗi server (level `error`) ra `logs/error.log`, log chung ra `logs/combined.log`
- [ ] Middleware xử lý lỗi tập trung (Express error handler) — log trước khi trả 500 về client

### T9.5 Deploy
- [ ] `docker-compose.yml`: 3 service — `mongo` (volume persistent), `server` (build từ Dockerfile), `client` (serve static build qua nginx)
- [ ] `ecosystem.config.js` cho PM2: chạy server với `cluster mode`, tự restart khi crash
- [ ] Script `npm run build` cho client → copy vào `server/public` hoặc serve qua nginx
- [ ] Hướng dẫn cài đặt lần đầu trên máy LAN (1 trang, các lệnh cần chạy)
