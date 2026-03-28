# Database Design — Hệ thống quản lí cho thuê phòng trọ

**Database:** MongoDB · **ODM:** Mongoose
**Quy ước:** tên collection viết thường số nhiều (`phongs`, `hopdongs`...), field dùng snake_case.

---

## Sơ đồ quan hệ

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

(*) DatCoc tham chiếu cả Phong và KhachHang

---

## Collections

---

### 1. `khus`

| Field | Type | Ràng buộc | Mô tả |
|---|---|---|---|
| `_id` | ObjectId | PK | |
| `ten` | String | required | Tên khu |
| `dia_chi` | String | required | Địa chỉ |
| `ghi_chu` | String | | Ghi chú tùy chọn |
| `createdAt` | Date | auto | |
| `updatedAt` | Date | auto | |

---

### 2. `loaiphongs`

| Field | Type | Ràng buộc | Mô tả |
|---|---|---|---|
| `_id` | ObjectId | PK | |
| `ten` | String | required, unique | VD: "Phòng 1 người" |
| `suc_chua` | Number | required, 1–4 | Số người tiêu chuẩn |

---

### 3. `phongs`

| Field | Type | Ràng buộc | Mô tả |
|---|---|---|---|
| `_id` | ObjectId | PK | |
| `ten` | String | required | Tên phòng |
| `khu_id` | ObjectId | ref: Khu, required | |
| `loai_phong_id` | ObjectId | ref: LoaiPhong, required | |
| `gia_thue` | Number | required, > 0 | Giá thuê hiện tại (VND) |
| `trang_thai` | String | enum, required | `trong` \| `cho_thue` \| `dat_coc` \| `sua_chua` |
| `chi_so_dien_dau` | Number | default: 0 | Chỉ số điện khi lắp đồng hồ |
| `chi_so_nuoc_dau` | Number | default: 0 | Chỉ số nước khi lắp đồng hồ |

**Indexes:**
```js
{ ten: 1, khu_id: 1 }  // unique
{ khu_id: 1, trang_thai: 1 }
```

**Chuyển trạng thái:**
```
trong ──► cho_thue   (khi ký hợp đồng)
trong ──► dat_coc    (khi đặt cọc)
trong ──► sua_chua   (khi tạo yêu cầu sửa chữa)
dat_coc ──► cho_thue (khi ký hợp đồng từ cọc)
dat_coc ──► trong    (khi hủy đặt cọc)
cho_thue ──► trong   (khi thanh lý / hủy hợp đồng)
sua_chua ──► trong   (khi hoàn thành sửa chữa)
```

---

### 4. `lichsugiathues`

> Append-only — không bao giờ update hay xóa bản ghi cũ.

| Field | Type | Ràng buộc | Mô tả |
|---|---|---|---|
| `_id` | ObjectId | PK | |
| `phong_id` | ObjectId | ref: Phong, required | |
| `gia_cu` | Number | required | Giá trước khi thay đổi |
| `gia_moi` | Number | required | Giá sau khi thay đổi |
| `ngay_ap_dung` | Date | required | Ngày giá mới có hiệu lực |

---

### 5. `dongiadichvus`

> Append-only. Khi lập hóa đơn, lấy bản ghi có `ngay_ap_dung` mới nhất ≤ ngày lập hóa đơn.

| Field | Type | Ràng buộc | Mô tả |
|---|---|---|---|
| `_id` | ObjectId | PK | |
| `loai_phong_id` | ObjectId | ref: LoaiPhong, required | null nếu áp dụng chung |
| `loai_dv` | String | enum, required | `dien` \| `nuoc` \| `ve_sinh` \| `xe_may` \| `xe_dap` |
| `don_gia` | Number | required, > 0 | Đơn giá (VND/đơn vị) |
| `ngay_ap_dung` | Date | required | |

> `ve_sinh`, `xe_may`, `xe_dap` áp dụng đồng nhất mọi phòng → `loai_phong_id = null`
> `dien`, `nuoc` riêng theo loại phòng → `loai_phong_id` có giá trị

**Index:**
```js
{ loai_phong_id: 1, loai_dv: 1, ngay_ap_dung: -1 }
```

---

### 6. `khachhangs`

| Field | Type | Ràng buộc | Mô tả |
|---|---|---|---|
| `_id` | ObjectId | PK | |
| `ho_ten` | String | required | |
| `ngay_sinh` | Date | | |
| `cmnd` | String | required, unique | Số CMND/CCCD |
| `so_dien_thoai` | String | required | |
| `que_quan` | String | | |

**Index:**
```js
{ cmnd: 1 }  // unique
{ ho_ten: "text" }  // text search
```

---

### 7. `datcocs`

| Field | Type | Ràng buộc | Mô tả |
|---|---|---|---|
| `_id` | ObjectId | PK | |
| `phong_id` | ObjectId | ref: Phong, required | |
| `khach_hang_id` | ObjectId | ref: KhachHang, required | |
| `so_tien` | Number | required, > 0 | Tiền đặt cọc |
| `ngay_dat_coc` | Date | required | |
| `trang_thai` | String | enum | `con_hieu_luc` \| `da_chuyen_hop_dong` \| `huy` |
| `ly_do_huy` | String | | Điền khi hủy |

---

### 8. `hopdongs`

| Field | Type | Ràng buộc | Mô tả |
|---|---|---|---|
| `_id` | ObjectId | PK | |
| `phong_id` | ObjectId | ref: Phong, required | |
| `khach_hang_id` | ObjectId | ref: KhachHang, required | |
| `ngay_bat_dau` | Date | required | Không được sớm hơn 30 ngày trước hôm nay |
| `ngay_het_han` | Date | required | Phải sau `ngay_bat_dau` ít nhất 1 tháng |
| `gia_thue_ky_hop_dong` | Number | required | Snapshot giá thuê tại thời điểm ký |
| `tien_dat_coc` | Number | required, > 0 | = 1 tháng tiền thuê |
| `so_nguoi_o` | Number | required, ≥ 1 | Số người ở thực tế khi vào |
| `trang_thai` | String | enum | `hieu_luc` \| `thanh_ly` \| `huy` |
| `ngay_thanh_ly` | Date | | Điền khi thanh lý |
| `ngay_huy` | Date | | Điền khi hủy |
| `ly_do_huy` | String | | |

**Indexes:**
```js
{ phong_id: 1, trang_thai: 1 }
{ khach_hang_id: 1 }
{ ngay_het_han: 1, trang_thai: 1 }  // cho query cảnh báo sắp hết hạn
```

> `gia_thue_ky_hop_dong` là snapshot — lưu giá tại thời điểm ký để tham chiếu hợp đồng in ra, không bị ảnh hưởng khi giá phòng thay đổi sau này.

---

### 9. `lichsugiahans`

| Field | Type | Ràng buộc | Mô tả |
|---|---|---|---|
| `_id` | ObjectId | PK | |
| `hop_dong_id` | ObjectId | ref: HopDong, required | |
| `ngay_gia_han` | Date | required | Ngày thực hiện gia hạn |
| `han_cu` | Date | required | Ngày hết hạn trước đó |
| `han_moi` | Date | required | Ngày hết hạn mới |

---

### 10. `nguoios`

| Field | Type | Ràng buộc | Mô tả |
|---|---|---|---|
| `_id` | ObjectId | PK | |
| `hop_dong_id` | ObjectId | ref: HopDong, required | |
| `ho_ten` | String | required | |
| `cmnd` | String | | |
| `ngay_bat_dau` | Date | required | Ngày bắt đầu ở |
| `ngay_ket_thuc` | Date | | null = đang ở |

**Index:**
```js
{ hop_dong_id: 1, ngay_bat_dau: 1 }
```

> Query số người ở trong tháng T:
> `ngay_bat_dau <= cuoi_thang_T` AND (`ngay_ket_thuc >= dau_thang_T` OR `ngay_ket_thuc = null`)

---

### 11. `hoadons`

| Field | Type | Ràng buộc | Mô tả |
|---|---|---|---|
| `_id` | ObjectId | PK | |
| `hop_dong_id` | ObjectId | ref: HopDong, required | |
| `thang` | Number | required, 1–12 | |
| `nam` | Number | required, > 2000 | |
| `chi_so_dien_cu` | Number | required, ≥ 0 | |
| `chi_so_dien_moi` | Number | required, ≥ `chi_so_dien_cu` | |
| `chi_so_nuoc_cu` | Number | required, ≥ 0 | |
| `chi_so_nuoc_moi` | Number | required, ≥ `chi_so_nuoc_cu` | |
| `so_xe_may` | Number | required, ≥ 0 | |
| `so_xe_dap` | Number | required, ≥ 0 | |
| `don_gia_dien` | Number | required | Snapshot đơn giá tại thời điểm lập |
| `don_gia_nuoc` | Number | required | Snapshot |
| `don_gia_ve_sinh` | Number | required | Snapshot |
| `don_gia_xe_may` | Number | required | Snapshot |
| `don_gia_xe_dap` | Number | required | Snapshot |
| `so_nguoi_o` | Number | required | Snapshot số người ở trong tháng |
| `no_thang_truoc` | Number | default: 0 | Tổng nợ kỳ trước chưa thanh toán |
| `tong_tien` | Number | required | Tổng cộng toàn bộ khoản |
| `trang_thai` | String | enum | `chua_thanh_toan` \| `da_thanh_toan` |
| `ngay_lap` | Date | required | Ngày tạo hóa đơn |
| `han_thanh_toan` | Date | required | = `ngay_lap` + 7 ngày |
| `ngay_thanh_toan` | Date | | Điền khi thanh toán |
| `phuong_thuc` | String | enum | `tien_mat` \| `chuyen_khoan` |
| `ma_giao_dich` | String | | Mã CK ngân hàng (tùy chọn) |

**Indexes:**
```js
{ hop_dong_id: 1, thang: 1, nam: 1 }  // unique
{ trang_thai: 1, han_thanh_toan: 1 }   // cho query cảnh báo quá hạn
```

**Công thức tính `tong_tien`:**
```
tien_phong    = gia_thue × (ngay_o / tong_ngay_thang)  [làm tròn 1.000đ, tháng đầu/cuối]
              = gia_thue  [các tháng giữa]
tien_dien     = (chi_so_dien_moi - chi_so_dien_cu) × don_gia_dien
tien_nuoc     = (chi_so_nuoc_moi - chi_so_nuoc_cu) × don_gia_nuoc
tien_ve_sinh  = so_nguoi_o × don_gia_ve_sinh
tien_xe_may   = so_xe_may × don_gia_xe_may
tien_xe_dap   = so_xe_dap × don_gia_xe_dap
tong_tien     = tien_phong + tien_dien + tien_nuoc + tien_ve_sinh
              + tien_xe_may + tien_xe_dap + no_thang_truoc
```

> Các trường `don_gia_*` và `so_nguoi_o` là **snapshot** — đảm bảo hóa đơn đã lập không thay đổi khi đơn giá cập nhật sau này.

---

### 12. `suachuas`

| Field | Type | Ràng buộc | Mô tả |
|---|---|---|---|
| `_id` | ObjectId | PK | |
| `phong_id` | ObjectId | ref: Phong, required | |
| `mo_ta` | String | required | Mô tả sự cố |
| `ngay_phat_sinh` | Date | required | |
| `chi_phi_du_kien` | Number | ≥ 0 | |
| `chi_phi_thuc_te` | Number | ≥ 0 | Điền khi hoàn thành |
| `trang_thai` | String | enum | `cho_xu_ly` \| `dang_xu_ly` \| `hoan_thanh` |
| `do_kh_gay_ra` | Boolean | default: false | Có thể khấu trừ vào cọc khi thanh lý |

---

### 13. `chiphivanhanhS`

| Field | Type | Ràng buộc | Mô tả |
|---|---|---|---|
| `_id` | ObjectId | PK | |
| `khu_id` | ObjectId | ref: Khu, nullable | null = áp dụng chung |
| `thang` | Number | required, 1–12 | |
| `nam` | Number | required, > 2000 | |
| `loai` | String | enum, required | `dien_nuoc_tong` \| `sua_chua_chung` \| `khac` |
| `so_tien` | Number | required, > 0 | |
| `ghi_chu` | String | | |

---

### 14. `canhbaodaxems`

| Field | Type | Ràng buộc | Mô tả |
|---|---|---|---|
| `_id` | ObjectId | PK | |
| `loai_canh_bao` | String | required | `phong_chua_hd` \| `hd_sap_den_han` \| `hd_qua_han` \| `nguy_co_huy` \| `hop_dong_sap_het` |
| `tham_chieu_id` | ObjectId | required | ID của phòng/hóa đơn/hợp đồng liên quan |
| `ngay_xem` | Date | required | Ngày QL bấm "Đã xem" |

**Index:**
```js
{ loai_canh_bao: 1, tham_chieu_id: 1, ngay_xem: 1 }
```

> Mỗi ngày mở app, lọc bỏ các bản ghi có `ngay_xem = hôm nay`. Nếu điều kiện cảnh báo vẫn còn tồn tại vào hôm sau → cảnh báo hiện lại tự động.

---

## Snapshot pattern

Các trường snapshot được lưu trực tiếp trong document thay vì reference, để bảo toàn dữ liệu lịch sử:

| Document | Trường snapshot | Lý do |
|---|---|---|
| `HopDong` | `gia_thue_ky_hop_dong` | In hợp đồng đúng giá lúc ký dù giá phòng thay đổi sau |
| `HoaDon` | `don_gia_dien/nuoc/ve_sinh/xe_may/xe_dap`, `so_nguoi_o` | Hóa đơn đã lập không bị thay đổi khi đơn giá cập nhật |

---

## Append-only collections

Không bao giờ update hoặc xóa bản ghi trong:

| Collection | Cách query bản ghi hiện tại |
|---|---|
| `dongiadichvus` | `ngay_ap_dung ≤ ngay_lap_hoa_don`, sort `-ngay_ap_dung`, limit 1 |
| `lichsugiathues` | `ngay_ap_dung ≤ ngay_can_biet`, sort `-ngay_ap_dung`, limit 1 |
| `lichsugiahans` | Lấy tất cả theo `hop_dong_id`, sort `ngay_gia_han` |

---

## Queries quan trọng

### Tính số người ở trong tháng
```js
NguoiO.find({
  hop_dong_id: id,
  ngay_bat_dau: { $lte: cuoi_thang },
  $or: [
    { ngay_ket_thuc: null },
    { ngay_ket_thuc: { $gte: dau_thang } }
  ]
})
```

### Lấy đơn giá có hiệu lực
```js
DonGiaDichVu.findOne({
  loai_phong_id: id,   // null cho ve_sinh/xe_may/xe_dap
  loai_dv: 'dien',
  ngay_ap_dung: { $lte: ngay_lap_hoa_don }
}).sort({ ngay_ap_dung: -1 })
```

### Phát hiện KH nợ ≥ 2 tháng liên tiếp
```js
// Lấy hóa đơn chưa thanh toán của 1 hợp đồng, sort theo thang/nam
// Kiểm tra có ≥ 2 bản ghi liên tiếp (tháng kế nhau) không
HoaDon.find({ hop_dong_id: id, trang_thai: 'chua_thanh_toan' })
  .sort({ nam: 1, thang: 1 })
// → kiểm tra (thang[i+1] - thang[i] === 1) hoặc (nam[i+1] - nam[i] === 1 và thang[i+1] === 1 và thang[i] === 12)
```

### Phòng chưa lập hóa đơn tháng này
```js
// Lấy tất cả hop_dong đang hieu_luc
// Với mỗi hop_dong, kiểm tra không có HoaDon với thang=T, nam=Y
HopDong.find({ trang_thai: 'hieu_luc' })
// → filter những hop_dong không có HoaDon (thang, nam) tương ứng
```
