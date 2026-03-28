# Yêu cầu hệ thống quản lí cho thuê phòng trọ

## 1. Tổng quan

Hệ thống hỗ trợ chủ nhà trọ quản lí nhiều khu nhà trọ, mỗi khu có nhiều phòng với mức giá thuê riêng. Hệ thống phục vụ nghiệp vụ từ ký hợp đồng, lập hóa đơn hàng tháng, thanh toán đến thống kê doanh thu. Hệ thống chỉ có **1 người dùng duy nhất là chủ trọ**, sử dụng nội bộ, không yêu cầu xác thực đăng nhập.

---

## 2. Các thực thể chính

| Thực thể | Mô tả |
|---|---|
| **Chủ nhà trọ (Quản lí - QL)** | Người sở hữu, vận hành hệ thống; duy nhất 1 người dùng, không yêu cầu đăng nhập |
| **Khu nhà trọ** | Một chủ có thể có nhiều khu; mỗi khu có tên và địa chỉ riêng |
| **Loại phòng** | Phân loại phòng theo sức chứa (1–4 người); mỗi loại có giá thuê và đơn giá điện/nước riêng |
| **Phòng trọ** | Thuộc một khu, thuộc một loại phòng |
| **Khách hàng (KH)** | Có thể thuê nhiều phòng ở nhiều thời điểm khác nhau; mỗi KH có thể đang thuê nhiều phòng tại 1 thời điểm |
| **Hợp đồng thuê** | Ràng buộc giữa KH và một phòng, có ngày bắt đầu và ngày hết hạn |
| **Hóa đơn tháng** | Tổng hợp các khoản phải trả trong tháng của một phòng |
| **Chi phí vận hành** | Các khoản chi của chủ trọ (điện nước tổng, sửa chữa chung khu, v.v.) dùng để tính lợi nhuận |

---

## 3. Quy tắc nghiệp vụ cấp cao

### 3.1 Phòng trọ & Loại phòng
- Mỗi phòng thuộc một **loại phòng** với sức chứa tiêu chuẩn từ 1 đến 4 người.
- Phòng sức chứa cao hơn có **giá thuê cao hơn** nhưng **đơn giá điện/nước thấp hơn** so với phòng ít người.
- Mỗi phòng được gắn **đồng hồ điện và đồng hồ nước riêng**.
- Một phòng có thể được thuê bởi nhiều khách hàng ở nhiều thời điểm khác nhau (thuê nối tiếp).
- Tên phòng phải **duy nhất trong cùng một khu**.
- Chỉ được xóa phòng khi phòng đang ở trạng thái **Đang trống** và không có hóa đơn chưa thanh toán.
- Mỗi lần thay đổi **giá thuê của một phòng cụ thể**, hệ thống lưu lịch sử giá (ngày áp dụng, giá cũ, giá mới); giá mới chỉ áp dụng từ hóa đơn tháng tiếp theo.

### 3.2 Hợp đồng & đặt cọc
- KH có thể **đặt cọc trước** để giữ phòng mà chưa vào ở ngay; khi đó phòng chuyển sang trạng thái "Đã đặt cọc". Khi KH vào ở, QL mới ký hợp đồng chính thức và phòng chuyển sang "Đang cho thuê".
- Khi làm hợp đồng, khách hàng phải đặt cọc đúng bằng tiền thuê **1 tháng** tại thời điểm ký hợp đồng.
- Hợp đồng có **ngày bắt đầu** và **ngày hết hạn** xác định. Ngày bắt đầu không được sớm hơn **30 ngày** trước ngày hiện tại.
- Trước khi hết hạn hợp đồng **1 tháng**, hệ thống tự động hiển thị cảnh báo để QL liên hệ KH gia hạn hoặc thanh lý.
- Hợp đồng ghi rõ: thông tin bên A (chủ nhà), bên B (khách hàng đại diện), phòng thuê, ngày bắt đầu, ngày hết hạn, giá thuê khởi điểm, tiền đặt cọc, đơn giá các dịch vụ (điện, nước, vệ sinh, xe máy, xe đạp), số người ở thực tế.
- QL có thể **gia hạn hợp đồng** bằng cách cập nhật ngày hết hạn mới; hợp đồng gốc được lưu lại lịch sử.

### 3.3 Hóa đơn hàng tháng
Mỗi hóa đơn bao gồm các khoản, mỗi khoản trên một dòng (số lượng – đơn giá – thành tiền):

| Khoản thu | Cách tính |
|---|---|
| Tiền phòng | Giá thuê tháng hiện tại (tính tròn tháng; tháng đầu/cuối tính theo số ngày thực tế nếu vào/ra giữa tháng) |
| Tiền điện | Theo công tơ điện (ghi chỉ số cũ, chỉ số mới, đơn giá, thành tiền) |
| Tiền nước | Theo công tơ nước (ghi chỉ số cũ, chỉ số mới, đơn giá, thành tiền) |
| Tiền vệ sinh | Tính theo số người ở thực tế trong tháng — **bắt buộc mọi phòng** |
| Tiền gửi xe máy | Tính theo số lượng xe do QL nhập khi lập hóa đơn — **bắt buộc mọi phòng** |
| Tiền gửi xe đạp | Tính theo số lượng xe do QL nhập khi lập hóa đơn — **bắt buộc mọi phòng** |
| Nợ tháng trước | Hóa đơn tháng trước chưa thanh toán (ghi 0 nếu không có) |
| **Tổng cộng** | Tổng tất cả các khoản trên |

- Chủ trọ chốt số điện, nước từng phòng vào **ngày cuối tháng** rồi lập hóa đơn.
- Khách hàng phải thanh toán **trong vòng 1 tuần** kể từ ngày nhận hóa đơn.
- **Không áp dụng lãi suất** khi quá hạn; thay vào đó áp dụng quy tắc hủy hợp đồng (xem mục 3.5).
- Chỉ số điện/nước mới phải **lớn hơn hoặc bằng** chỉ số cũ; hệ thống báo lỗi nếu nhập sai.

### 3.4 Thanh toán
- Hóa đơn phải được thanh toán **đủ toàn bộ số tiền trong một lần**, không chấp nhận trả thiếu.
- Khi KH thanh toán, QL ghi nhận **phương thức thanh toán** (tiền mặt hoặc chuyển khoản); nếu chuyển khoản thì có thể nhập thêm mã giao dịch để đối chiếu.
- Hệ thống cập nhật trạng thái hóa đơn thành "Đã thanh toán" và ghi lại ngày thanh toán.

### 3.5 Hủy hợp đồng
- QL có thể hủy hợp đồng khi KH **không thanh toán từ 2 tháng liên tiếp trở lên**.
- Khi hủy: toàn bộ tiền cọc bị giữ lại, hệ thống in biên bản hủy hợp đồng, trạng thái phòng chuyển về "Đang trống".
- Khi KH thuê nhiều phòng, hủy hợp đồng của 1 phòng **không ảnh hưởng** đến các hợp đồng phòng khác của cùng KH đó.

### 3.6 Chi phí vận hành
- QL có thể ghi nhận các **chi phí vận hành** theo tháng: tiền điện/nước tổng trả cho nhà cung cấp, chi phí sửa chữa chung khu, chi phí khác.
- Chi phí vận hành được dùng để tính **lợi nhuận thực** trong module thống kê: Lợi nhuận = Doanh thu thu được − Chi phí vận hành.
- Chi phí vận hành **không liên kết trực tiếp** vào hóa đơn KH; chỉ dùng cho mục đích thống kê nội bộ.

---

## 4. Danh sách module chức năng

| Module | Mô tả |
|---|---|
| **4.1 Quản lí khu nhà trọ** | Thêm, sửa, xóa khu; xem danh sách phòng theo khu |
| **4.2 Quản lí thông tin phòng** | Thêm, sửa, xóa thông tin phòng và loại phòng; xem lịch sử giá thuê từng phòng |
| **4.3 Quản lí khách hàng** | Xem danh sách KH, tìm kiếm, xem lịch sử thuê phòng và nợ theo từng phòng của từng KH |
| **4.4 Đặt cọc giữ phòng** | Ghi nhận đặt cọc trước khi ký hợp đồng, chuyển phòng sang trạng thái "Đã đặt cọc" |
| **4.5 Làm hợp đồng cho thuê phòng** | Tìm phòng trống hoặc phòng đã đặt cọc, nhập thông tin KH, tạo và in hợp đồng |
| **4.6 Gia hạn hợp đồng** | Cập nhật ngày hết hạn mới, lưu lịch sử gia hạn |
| **4.7 Lên hóa đơn tháng** | Nhập chỉ số điện/nước, số lượng xe, tính và in hóa đơn hàng tháng |
| **4.8 Thanh toán hàng tháng** | Tra cứu, xác nhận thanh toán hóa đơn và ghi nhận phương thức thanh toán |
| **4.9 Thống kê doanh thu & lợi nhuận** | Thống kê theo tháng/quý/năm; hiển thị doanh thu, chi phí và lợi nhuận nếu có dữ liệu chi phí |
| **4.10 Thanh lý hợp đồng** | Kết thúc hợp đồng, tính hoàn cọc, in biên bản; hỗ trợ chọn đúng phòng khi KH thuê nhiều phòng |
| **4.11 Hủy hợp đồng** | Hủy hợp đồng do vi phạm nghĩa vụ thanh toán, giữ cọc, in biên bản |
| **4.12 Quản lí người ở trong phòng** | Theo dõi danh sách người thực tế để tính tiền vệ sinh |
| **4.13 Quản lí đơn giá dịch vụ** | Cập nhật và lưu lịch sử đơn giá theo loại phòng |
| **4.14 Cảnh báo & dashboard tổng quan** | Dashboard hiển thị KPI tổng quan (tỉ lệ lấp đầy, doanh thu tháng, v.v.) và cảnh báo theo thời gian thực |
| **4.15 Báo cáo nâng cao** | Báo cáo công suất, nợ, doanh thu theo khu/phòng, xuất Excel/PDF |
| **4.16 Quản lí sửa chữa & bảo trì** | Ghi nhận, theo dõi sự cố và chi phí bảo trì từng phòng |
| **4.17 Danh sách & tìm kiếm hợp đồng** | Xem toàn bộ hợp đồng (đang hiệu lực / đã thanh lý / đã hủy), lọc và tìm kiếm |
| **4.18 Quản lí chi phí vận hành** | Ghi nhận chi phí điện nước tổng, sửa chữa chung và các khoản chi khác theo tháng |

---

## 5. Yêu cầu phi chức năng

| # | Yêu cầu |
|---|---|
| NFR-1 | Hệ thống lưu trữ toàn bộ dữ liệu vào cơ sở dữ liệu quan hệ (CSDL). |
| NFR-2 | Hệ thống hỗ trợ in hợp đồng, biên bản thanh lý, biên bản hủy và hóa đơn. |
| NFR-3 | Giao diện hỗ trợ tìm kiếm phòng theo tên (tìm kiếm theo từ khóa con). |
| NFR-4 | Hệ thống tự động phát hiện và cảnh báo KH có hóa đơn chưa thanh toán ≥ 2 tháng liên tiếp. |
| NFR-5 | Lưu lịch sử thay đổi đơn giá dịch vụ (theo loại phòng) và lịch sử thay đổi giá thuê của từng phòng cụ thể. |
| NFR-6 | Dashboard hiển thị cảnh báo và KPI tổng quan theo thời gian thực khi QL mở ứng dụng. |
| NFR-7 | Hỗ trợ xuất báo cáo ra file Excel / PDF. |
| NFR-8 | Hệ thống là ứng dụng **web nội bộ** xây dựng trên React (frontend), Node.js/Express (backend), MongoDB (database); chạy trên mạng LAN, không yêu cầu kết nối internet. |
| NFR-9 | Hệ thống hỗ trợ sao lưu (backup) và khôi phục (restore) dữ liệu thủ công. |
| NFR-10 | Thời gian phản hồi của các thao tác tra cứu thông thường không vượt quá 3 giây. |
| NFR-11 | Mọi thao tác xóa dữ liệu quan trọng (phòng, hợp đồng, khu) phải yêu cầu xác nhận lần hai trước khi thực hiện. |
