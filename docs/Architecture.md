# Architecture — Hệ thống quản lí cho thuê phòng trọ

---

## 1. Tổng quan

```
Trình duyệt (LAN)
  └── React SPA (Vite · Ant Design · TanStack Query · React Hook Form · Zod · Day.js · Recharts)
        │ HTTP REST /api
        ▼
  Node.js / Express
  Morgan → Router → validate(Zod) → Controller → Service → Mongoose
  Puppeteer (PDF) · ExcelJS · Winston (log)
        │ Mongoose ODM
        ▼
  MongoDB  —  13 collections · ObjectId refs · indexes
```

**Đặc điểm:** 3 tầng · single-user · LAN · không cần internet · Zod schema dùng chung client + server

---

## 2. Cấu trúc thư mục

```
├── client/src/
│   ├── api/          Axios functions (1 file/domain)
│   ├── hooks/        TanStack Query wrappers
│   ├── pages/        1 folder/domain → 1 file/route
│   ├── components/   UI tái sử dụng (StatusBadge, ConfirmDeleteModal, ...)
│   └── utils/        ngayThang.js (Day.js), format.js
│
├── server/src/
│   ├── models/       Mongoose schemas (13 files)
│   ├── routes/       Express routers
│   ├── controllers/  Nhận req → gọi service → trả res
│   ├── services/     Business logic thuần
│   ├── middlewares/  validate.js · errorHandler.js
│   ├── templates/    HTML cho Puppeteer (hopDong, hoaDon, thanhLy, huy)
│   └── config/       db.js · logger.js
│
├── shared/schemas/   Zod schemas dùng chung
├── docker-compose.yml
└── .env
```

> Chi tiết từng module (models, routes, controllers, services, pages, hooks): xem [ModulesStructure.md](./ModulesStructure.md)

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
          └──1:N──► DonGiaDichVu   (append-only, lấy bản ghi mới nhất theo ngày)

Phong ──1:N──► SuaChua
Khu   ──1:N──► ChiPhiVanHanh (nullable)
```

**Indexes:**

| Collection | Index |
|---|---|
| Phong | `{ ten, khu_id }` unique · `{ khu_id, trang_thai }` |
| HopDong | `{ phong_id, trang_thai }` · `{ khach_hang_id }` |
| HoaDon | `{ hop_dong_id, thang, nam }` unique · `{ trang_thai }` |
| KhachHang | `{ cmnd }` unique |
| DonGiaDichVu | `{ loai_phong_id, loai_dv, ngay_ap_dung }` |

> `DonGiaDichVu` và `LichSuGiaThuPhong` là append-only — không update bản ghi cũ để bảo toàn tính chính xác hóa đơn đã lập.

---

## 4. REST API

Prefix `/api` · Response: `{ success, data }` hoặc `{ success, error }`

```
# Danh mục
GET|POST              /api/khu
GET|PUT|DELETE        /api/khu/:id
GET|POST              /api/loai-phong
GET|PUT|DELETE        /api/loai-phong/:id
GET|POST|PUT|DELETE   /api/phong/:id
GET                   /api/phong/trong          ?ngay_bat_dau&ngay_het_han&gia_max
GET                   /api/phong/:id/lich-su-gia
GET|POST              /api/don-gia
GET                   /api/don-gia/lich-su

# Khách hàng & Hợp đồng
GET|POST|PUT          /api/khach-hang/:id        ?q= (tìm tên/CMND)
POST                  /api/dat-coc
PUT                   /api/dat-coc/:id/huy
GET|POST              /api/hop-dong              ?trang_thai&khu_id&tu&den&q
GET                   /api/hop-dong/:id
PUT                   /api/hop-dong/:id/gia-han
POST                  /api/hop-dong/:id/thanh-ly
POST                  /api/hop-dong/:id/huy
GET|POST              /api/hop-dong/:id/nguoi-o
PUT|DELETE            /api/nguoi-o/:id

# Hóa đơn
GET                   /api/hoa-don/cho-lap       phòng chưa lập HĐ tháng này
GET                   /api/hoa-don/tinh-truoc    preview (chưa lưu)
GET|POST              /api/hoa-don
PUT                   /api/hoa-don/:id/thanh-toan

# Sửa chữa & Chi phí
GET|POST|PUT          /api/sua-chua/:id
GET|POST|PUT|DELETE   /api/chi-phi/:id

# Dashboard & Thống kê
GET                   /api/dashboard/kpi
GET                   /api/dashboard/canh-bao
PUT                   /api/dashboard/canh-bao/:loai/:id/da-xem
GET                   /api/thong-ke              ?loai=thang|quy|nam&tu&den
GET                   /api/thong-ke/:ky/hoa-don
GET                   /api/bao-cao/cong-suat|no|doanh-thu-theo-phong

# In & Xuất
GET                   /api/in/hop-dong|hoa-don|thanh-ly|huy/:id   → PDF
GET                   /api/xuat/doanh-thu|no|cong-suat            → Excel
```

---

## 5. Backend Pipeline

```
Request → Morgan → cors → express.json → Router
  → validate(Zod) → Controller → Service → Mongoose → DB
  → errorHandler (log Winston → trả 4xx/5xx)
```

**Service layer** chứa toàn bộ business logic, controller chỉ parse req / trả res:

```
POST /api/hoa-don  →  hoaDon.service.tinhHoaDon()
  1. getDonGiaHieuLuc(loai_phong, ngay)
  2. getSoNguoiOTrongThang(hop_dong_id, thang, nam)
  3. tinhTienPhong()   — pro-rata + làm tròn 1.000đ
  4. tinhNo()          — tổng HĐ chưa trả
  5. lưu HoaDon
```

---

## 6. Frontend: Routes & State

```
/                 Dashboard (KPI + cảnh báo)
/khu              Quản lí khu
/phong            Danh sách phòng
/loai-phong       Loại phòng & đơn giá
/khach-hang       Danh sách khách hàng
/khach-hang/:id   Chi tiết KH
/hop-dong         Danh sách hợp đồng
/hop-dong/dat-coc Wizard đặt cọc
/hop-dong/moi     Wizard làm hợp đồng
/hop-dong/:id     Chi tiết hợp đồng
/hoa-don/lap      Lên hóa đơn tháng
/hoa-don/thanh-toan Thanh toán
/thanh-ly         Thanh lý hợp đồng
/huy              Hủy hợp đồng
/nguoi-o          Quản lí người ở
/sua-chua         Sửa chữa & bảo trì
/thong-ke         Thống kê doanh thu
/bao-cao          Báo cáo nâng cao
/chi-phi          Chi phí vận hành
```

| Loại state | Công cụ |
|---|---|
| Data từ server | TanStack Query — cache, refetch, loading tự động |
| Form | React Hook Form + Zod resolver |
| UI (modal, tab, filter) | useState / useReducer |

---

## 7. Luồng nghiệp vụ chính

**Lập hóa đơn:**
```
Chọn phòng → GET /hoa-don/tinh-truoc → Preview → POST /hoa-don → GET /in/hoa-don/:id (PDF)
```

**Thanh lý:**
```
Tìm HĐ → Nhập bồi thường → Preview hoàn cọc → POST /hop-dong/:id/thanh-ly → PDF biên bản
```

**Dashboard cảnh báo:**
```
Mở app → GET /dashboard/kpi + /canh-bao → Render thẻ → Click "Đã xem" → PUT /da-xem
```

---

## 8. Deployment

```
Máy chủ LAN
  ├── nginx      :80   serve React build  →  proxy /api → server
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

Backup: `mongodump` → nén → lưu `./backups/` (thủ công).

---

## 9. Quyết định kỹ thuật

| Quyết định | Lý do |
|---|---|
| MongoDB | Schema linh hoạt cho lịch sử giá nhiều loại; không cần join |
| Zod shared schema | Validate 1 lần, dùng cả 2 phía — tránh lỗi bất đồng bộ |
| TanStack Query | Auto-refetch cảnh báo; bỏ boilerplate fetch/loading/error |
| Puppeteer PDF | Template HTML/CSS dễ chỉnh hơn pdfkit; output như in từ trình duyệt |
| Append-only lịch sử giá | Không sửa bản ghi cũ — hóa đơn đã lập không bị thay đổi hồi tố |
| Service layer | Business logic tách khỏi HTTP — dễ test, dễ tái sử dụng |
| Day.js | Tính pro-rata, đếm tháng nợ, kiểm tra 30 ngày — tránh bug timezone |
