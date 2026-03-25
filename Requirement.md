# Đặc tả yêu cầu hệ thống quản lí cho thuê phòng trọ

## 1. Tổng quan

Hệ thống hỗ trợ chủ nhà trọ quản lí nhiều khu nhà trọ, mỗi khu có nhiều phòng với mức giá thuê riêng. Hệ thống phục vụ nghiệp vụ từ ký hợp đồng, lập hóa đơn hàng tháng, thanh toán đến thống kê doanh thu.

---

## 2. Các thực thể chính

| Thực thể | Mô tả |
|---|---|
| **Chủ nhà trọ (Quản lí - QL)** | Người sở hữu, vận hành hệ thống (duy nhất 1 tài khoản) |
| **Khu nhà trọ** | Một chủ có thể có nhiều khu |
| **Loại phòng** | Phân loại phòng theo sức chứa (1–4 người); mỗi loại có giá thuê và đơn giá điện/nước riêng |
| **Phòng trọ** | Thuộc một khu, thuộc một loại phòng |
| **Khách hàng (KH)** | Có thể thuê nhiều phòng ở nhiều thời điểm khác nhau |
| **Hợp đồng thuê** | Ràng buộc giữa KH và một phòng, có ngày bắt đầu và ngày hết hạn |
| **Hóa đơn tháng** | Tổng hợp các khoản phải trả trong tháng của một phòng |

---

## 3. Quy tắc nghiệp vụ

### 3.1 Phòng trọ & Loại phòng
- Mỗi phòng thuộc một **loại phòng** với sức chứa tiêu chuẩn từ 1 đến 4 người.
- Phòng sức chứa cao hơn có **giá thuê cao hơn** nhưng **đơn giá điện/nước thấp hơn** so với phòng ít người.
- Mỗi phòng được gắn **đồng hồ điện và đồng hồ nước riêng**.
- Một phòng có thể được thuê bởi nhiều khách hàng ở nhiều thời điểm khác nhau (thuê nối tiếp).

### 3.2 Hợp đồng & đặt cọc
- Khi làm hợp đồng, khách hàng phải đặt cọc đúng bằng tiền thuê **1 tháng** tại thời điểm ký hợp đồng.
- Hợp đồng có **ngày bắt đầu** và **ngày hết hạn** xác định.
- Trước khi hết hạn hợp đồng **1 tháng**, hệ thống tự động hiển thị cảnh báo để QL liên hệ KH gia hạn hoặc thanh lý.
- Hợp đồng ghi rõ: thông tin bên A (chủ nhà), bên B (khách hàng đại diện), phòng thuê, ngày bắt đầu, ngày hết hạn, giá thuê khởi điểm, tiền đặt cọc, đơn giá các dịch vụ (điện, nước, vệ sinh, xe máy, xe đạp), số người ở thực tế.

### 3.3 Hóa đơn hàng tháng
Mỗi hóa đơn bao gồm các khoản, mỗi khoản trên một dòng (số lượng – đơn giá – thành tiền):

| Khoản thu | Cách tính |
|---|---|
| Tiền phòng | Giá thuê tháng hiện tại |
| Tiền điện | Theo công tơ điện (ghi chỉ số cũ, chỉ số mới, đơn giá, thành tiền) |
| Tiền nước | Theo công tơ nước (ghi chỉ số cũ, chỉ số mới, đơn giá, thành tiền) |
| Tiền vệ sinh | Tính theo số người ở thực tế trong tháng — **bắt buộc mọi phòng** |
| Tiền gửi xe máy | Tính theo đầu xe — **bắt buộc mọi phòng** |
| Tiền gửi xe đạp | Tính theo đầu xe — **bắt buộc mọi phòng** |
| Nợ tháng trước | Hóa đơn tháng trước chưa thanh toán (ghi 0 nếu không có) |
| **Tổng cộng** | Tổng tất cả các khoản trên |

- Chủ trọ chốt số điện, nước từng phòng vào **ngày cuối tháng** rồi lập hóa đơn.
- Khách hàng phải thanh toán **trong vòng 1 tuần** kể từ ngày nhận hóa đơn.
- **Không áp dụng lãi suất** khi quá hạn; thay vào đó áp dụng quy tắc hủy hợp đồng tại mục 5.4.

### 3.4 Thanh toán
- Hóa đơn phải được thanh toán **đủ toàn bộ số tiền trong một lần**, không chấp nhận trả thiếu.
- Khi KH thanh toán, QL cập nhật trạng thái hóa đơn thành "Đã thanh toán" và ký xác nhận vào hóa đơn của KH.

---

## 4. Các module chức năng

### 4.1 Module: Quản lí thông tin phòng

**Chức năng:** Thêm, sửa, xóa thông tin phòng và loại phòng.

**Thông tin của một phòng bao gồm:** tên phòng, khu, loại phòng (sức chứa tiêu chuẩn), giá thuê, đơn giá điện, đơn giá nước, trạng thái.

**Luồng nghiệp vụ (Sửa thông tin phòng):**
1. QL chọn menu **Quản lí phòng** → trang quản lí hiện ra.
2. QL chọn **Sửa thông tin phòng** → giao diện tìm phòng theo tên hiện ra.
3. QL nhập tên phòng và click **Tìm kiếm** → danh sách phòng khớp từ khóa hiện ra.
4. QL chọn **Sửa** một phòng → giao diện sửa hiện ra với thông tin hiện tại.
5. QL nhập thông tin mới và click **Cập nhật** → hệ thống lưu vào CSDL và thông báo thành công.

---

### 4.2 Module: Làm hợp đồng cho thuê phòng

**Luồng nghiệp vụ:**
1. QL chọn **Tìm phòng còn trống** → giao diện tìm phòng trống hiện ra.
2. QL nhập ngày bắt đầu ở, ngày hết hạn hợp đồng và mức giá KH chấp nhận → hệ thống hiện danh sách phòng trống phù hợp (kèm thông tin loại phòng, sức chứa, đơn giá điện/nước).
3. QL chọn 1 phòng theo yêu cầu KH → giao diện nhập thông tin KH hiện ra:
   - Thông tin **người đại diện ký hợp đồng** (bên B): họ tên, ngày sinh, số CMND/CCCD, số điện thoại, quê quán.
   - **Số người ở thực tế** tại thời điểm vào (dùng để tính tiền vệ sinh).
4. Hệ thống hiển thị **mẫu hợp đồng** đầy đủ thông tin, trong đó ghi rõ số người ở thực tế.
5. KH duyệt và chấp nhận → QL click **Xác nhận** → hệ thống in hợp đồng, tạo danh sách người ở ban đầu và lưu vào hệ thống.

---

### 4.3 Module: Lên hóa đơn tháng cho khách hàng

**Luồng nghiệp vụ:**
1. QL chọn **Lên hóa đơn hàng tháng** → hệ thống hiện danh sách phòng chưa có hóa đơn tháng này.
2. QL click chọn 1 phòng → giao diện nhập chỉ số điện, nước tháng này hiện ra, trong đó:
   - **Chỉ số cũ** (điện/nước): hệ thống tự điền từ chỉ số mới của tháng trước.
   - **Chỉ số mới**: QL nhập vào sau khi đi chốt đồng hồ.
3. QL nhập chỉ số mới → hệ thống tự tính tiêu thụ và hiển thị **hóa đơn tháng** đầy đủ (xem mục 3.3).
4. QL click **Xác nhận** → hệ thống in hóa đơn cho phòng tương ứng.
5. Lặp lại cho đến khi hết phòng.

---

### 4.4 Module: Thanh toán hàng tháng

**Luồng nghiệp vụ:**
1. KH cầm hóa đơn đến thanh toán, QL chọn **Thanh toán**.
2. Hệ thống hiện giao diện tìm hóa đơn (theo mã hóa đơn / tên KH / tên phòng).
3. QL nhập thông tin và click **Tìm** → hệ thống hiện thông tin hóa đơn tương ứng.
4. QL nhận tiền và click **Xác nhận đã thanh toán** → hệ thống cập nhật thành công.
5. QL ký xác nhận vào hóa đơn trả cho KH.

---

### 4.5 Module: Thống kê doanh thu

**Luồng nghiệp vụ:**
1. QL chọn menu **Thống kê doanh thu** → hệ thống hiện lựa chọn: theo **tháng / quý / năm**.
2. QL chọn loại thống kê → hệ thống hiện bảng doanh thu, mỗi dòng gồm:
   - Tên tháng (hoặc quý/năm) – Tổng doanh thu.
   - Sắp xếp từ gần nhất đến cũ nhất.
3. QL click vào một dòng → hệ thống hiện **danh sách hóa đơn đã thanh toán** trong khoảng thời gian đó, mỗi dòng gồm:
   - ID hóa đơn – Tên khách hàng – Tên phòng – Tổng tiền.

---

### 4.6 Module: Thanh lý hợp đồng 

**Luồng nghiệp vụ:**
1. QL chọn **Thanh lý hợp đồng** → giao diện tìm hợp đồng theo tên KH / tên phòng hiện ra.
2. QL chọn hợp đồng cần thanh lý → hệ thống hiển thị:
   - Thông tin hợp đồng, tiền cọc đang giữ.
   - Các hóa đơn còn nợ chưa thanh toán (nếu có).
3. QL nhập thông tin trả phòng: ngày trả, ghi chú hư hỏng (nếu có) kèm số tiền bồi thường.
4. Hệ thống tự động tính **số tiền hoàn cọc** = Tiền cọc − Nợ tồn đọng − Chi phí bồi thường.
5. QL xác nhận → hệ thống in **biên bản thanh lý**, cập nhật trạng thái phòng thành "Đang trống".

---

### 4.7 Module: Quản lí người ở trong phòng

**Chức năng:** Theo dõi danh sách người thực tế đang ở trong mỗi phòng để tính tiền vệ sinh chính xác.

**Quy tắc:**
- Một phòng chỉ có **1 người đại diện ký hợp đồng**, nhưng số người ở thực tế có thể nhiều hơn.
- Mỗi loại phòng có **sức chứa tiêu chuẩn từ 1 đến 4 người**. Hệ thống hiển thị cảnh báo nếu số người ở vượt sức chứa tiêu chuẩn, nhưng **QL vẫn có thể cho phép** (ví dụ: 2 người ở phòng tiêu chuẩn 1 người do hoàn cảnh).
- Danh sách người ở được khởi tạo từ bước ký hợp đồng và có thể cập nhật bất kỳ lúc nào.

**Luồng nghiệp vụ:**
1. QL chọn phòng → xem danh sách người đang ở (họ tên, số CMND/CCCD, ngày bắt đầu ở).
2. QL có thể **thêm / xóa người ở** kèm ngày bắt đầu / kết thúc.
3. Khi lập hóa đơn tháng, hệ thống tự động lấy số người ở thực tế trong tháng để tính tiền vệ sinh.

---

### 4.8 Module: Quản lí đơn giá dịch vụ 

**Chức năng:** Cho phép QL cập nhật đơn giá dịch vụ theo từng loại phòng và theo thời gian.

**Quy tắc:**
- Đơn giá điện/nước **không đồng nhất** — mỗi loại phòng có đơn giá riêng (phòng sức chứa cao có đơn giá điện/nước thấp hơn phòng ít người).
- Đơn giá vệ sinh, xe máy, xe đạp áp dụng **đồng nhất** cho tất cả các phòng.
- Mỗi lần thay đổi đơn giá, hệ thống lưu **lịch sử đơn giá** kèm ngày áp dụng.
- Khi lập hóa đơn, hệ thống tự động áp dụng **đơn giá của loại phòng tương ứng có hiệu lực tại thời điểm lập hóa đơn**.
- QL có thể xem lịch sử thay đổi đơn giá theo từng loại phòng và từng loại dịch vụ.

---

### 4.9 Module: Cảnh báo & nhắc nhở 

**Chức năng:** Hiển thị các cảnh báo quan trọng ngay trên trang chủ / dashboard của QL.

| Loại cảnh báo | Điều kiện hiển thị |
|---|---|
| Phòng chưa lên hóa đơn | Đã qua ngày cuối tháng mà phòng chưa có hóa đơn |
| Hóa đơn sắp đến hạn | Còn ≤ 2 ngày đến hạn thanh toán |
| Hóa đơn quá hạn | Đã quá 1 tuần chưa thanh toán |
| Nguy cơ hủy hợp đồng | KH có hóa đơn chưa thanh toán ≥ 2 tháng liên tiếp |
| Hợp đồng sắp hết hạn | Còn đúng 1 tháng đến ngày hết hạn hợp đồng |

---

### 4.10 Module: Báo cáo nâng cao 

**Các loại báo cáo bổ sung dành cho QL:**

1. **Báo cáo công suất phòng**: Số phòng đang cho thuê / tổng số phòng, theo từng khu.
2. **Báo cáo khách hàng nợ**: Danh sách KH còn nợ, tổng nợ, số tháng nợ liên tiếp (đánh dấu đỏ nếu ≥ 2 tháng).
3. **Báo cáo doanh thu theo khu / theo phòng**: So sánh doanh thu giữa các khu, các phòng trong kỳ.
4. **Xuất báo cáo**: Hỗ trợ xuất ra file Excel hoặc PDF.

---

### 4.11 Module: Quản lí sửa chữa & bảo trì 

**Chức năng:** QL ghi nhận và theo dõi các sự cố, công việc bảo trì tại từng phòng / khu.

**Luồng nghiệp vụ:**
1. QL tạo yêu cầu sửa chữa: chọn phòng, mô tả sự cố, ngày phát sinh, chi phí dự kiến.
2. QL cập nhật trạng thái: `Chờ xử lý` → `Đang xử lý` → `Hoàn thành`.
3. Khi hoàn thành, QL nhập chi phí thực tế → hệ thống ghi nhận vào lịch sử bảo trì của phòng.
4. Chi phí sửa chữa có thể được **khấu trừ vào tiền cọc** khi thanh lý hợp đồng (nếu do KH gây ra).

---

## 5. Quy tắc nghiệp vụ 

### 5.1 Trạng thái phòng
Phòng có 4 trạng thái rõ ràng:

| Trạng thái | Mô tả |
|---|---|
| Đang trống | Chưa có KH, sẵn sàng cho thuê |
| Đang cho thuê | Có hợp đồng đang hiệu lực |
| Đã đặt cọc | Đã nhận cọc, chờ KH vào ở |
| Đang sửa chữa | Tạm thời không cho thuê |

### 5.2 Tiền cọc
- Tiền cọc không được tính vào doanh thu cho đến khi hợp đồng thanh lý.
- Khi thanh lý: hoàn trả đủ nếu không có nợ/hư hỏng; khấu trừ theo thứ tự: nợ hóa đơn → chi phí bồi thường → hoàn phần còn lại.

### 5.3 Điều chỉnh giá thuê giữa kỳ
- QL tự cập nhật giá thuê mà **không cần xác nhận từ KH** trên hệ thống.
- Khi QL thay đổi giá thuê, hệ thống lưu **ngày áp dụng giá mới**.
- Hóa đơn các tháng trước không bị ảnh hưởng; giá mới chỉ áp dụng từ tháng tiếp theo.

### 5.4 Xử lý nợ quá hạn & hủy hợp đồng
- Không áp dụng lãi suất với hóa đơn quá hạn.
- Nếu KH **không thanh toán từ 2 tháng liên tiếp trở lên**, QL có thể thực hiện **hủy hợp đồng**:
  - Hệ thống ghi nhận lý do hủy: vi phạm nghĩa vụ thanh toán.
  - **Toàn bộ tiền cọc bị giữ lại**, không hoàn trả.
  - Trạng thái phòng chuyển về "Đang trống".
  - Hệ thống in biên bản hủy hợp đồng.

---

## 6. Yêu cầu phi chức năng

| # | Yêu cầu |
|---|---|
| NFR-1 | Hệ thống lưu trữ toàn bộ dữ liệu vào cơ sở dữ liệu quan hệ (CSDL). |
| NFR-2 | Hệ thống hỗ trợ in hợp đồng, biên bản thanh lý và hóa đơn. |
| NFR-3 | Giao diện hỗ trợ tìm kiếm phòng theo tên (tìm kiếm theo từ khóa con). |
| NFR-4 | Hệ thống tự động phát hiện và cảnh báo KH có hóa đơn chưa thanh toán ≥ 2 tháng liên tiếp. |
| NFR-5 | Lưu lịch sử thay đổi đơn giá dịch vụ và giá thuê phòng. |
| NFR-6 | Dashboard hiển thị cảnh báo theo thời gian thực khi QL đăng nhập. |
| NFR-7 | Hỗ trợ xuất báo cáo ra file Excel / PDF. |
