# Đặc tả chi tiết hệ thống quản lí cho thuê phòng trọ

## 1. Đặc tả các module chức năng

---

### 1.1 Module: Quản lí khu nhà trọ

**Chức năng:** Thêm, sửa, xóa khu nhà trọ và xem danh sách phòng theo khu.

**Thông tin một khu bao gồm:** tên khu, địa chỉ, ghi chú.

**Luồng nghiệp vụ (Thêm khu):**
1. QL chọn **Quản lí khu** → click **Thêm khu mới**.
2. QL nhập tên khu, địa chỉ → click **Lưu** → hệ thống lưu vào CSDL và thông báo thành công.

**Luồng nghiệp vụ (Sửa / Xóa khu):**
- **Sửa**: QL chọn khu → click **Sửa** → cập nhật thông tin → **Lưu**.
- **Xóa**: Chỉ được xóa khu khi **tất cả phòng trong khu đang ở trạng thái Đang trống** và không có hóa đơn chưa thanh toán. Nếu vi phạm, hệ thống hiện thông báo lỗi. Hệ thống yêu cầu **xác nhận lần hai** trước khi xóa.

---

### 1.2 Module: Quản lí thông tin phòng

**Chức năng:** Thêm, sửa, xóa thông tin phòng và loại phòng; xem lịch sử giá thuê từng phòng.

**Thông tin của một phòng bao gồm:** tên phòng, khu, loại phòng (sức chứa tiêu chuẩn), giá thuê, đơn giá điện, đơn giá nước, trạng thái.

**Luồng nghiệp vụ (Thêm phòng):**
1. QL chọn menu **Quản lí phòng** → click **Thêm phòng mới**.
2. QL chọn khu, nhập tên phòng, chọn loại phòng, nhập giá thuê, đơn giá điện, đơn giá nước.
3. QL click **Lưu** → hệ thống kiểm tra tên phòng không trùng trong cùng khu → lưu vào CSDL, trạng thái mặc định là "Đang trống".

**Luồng nghiệp vụ (Sửa thông tin phòng):**
1. QL chọn menu **Quản lí phòng** → trang quản lí hiện ra.
2. QL chọn **Sửa thông tin phòng** → giao diện tìm phòng theo tên hiện ra.
3. QL nhập tên phòng và click **Tìm kiếm** → danh sách phòng khớp từ khóa hiện ra.
4. QL chọn **Sửa** một phòng → giao diện sửa hiện ra với thông tin hiện tại.
5. QL nhập thông tin mới và click **Cập nhật** → nếu giá thuê thay đổi, hệ thống lưu bản ghi lịch sử giá (giá cũ, giá mới, ngày áp dụng) trước khi lưu; thông báo thành công.

**Luồng nghiệp vụ (Xem lịch sử giá thuê phòng):**
1. QL chọn phòng → click **Lịch sử giá thuê**.
2. Hệ thống hiển thị bảng: Ngày áp dụng – Giá thuê – Ghi chú (nếu có), sắp xếp từ mới nhất đến cũ nhất.

**Luồng nghiệp vụ (Xóa phòng):**
1. QL tìm phòng và click **Xóa**.
2. Hệ thống kiểm tra điều kiện:
   - Phòng đang ở trạng thái **Đang trống**.
   - Không có hóa đơn chưa thanh toán liên quan.
3. Nếu đủ điều kiện: hiện hộp thoại **xác nhận lần hai** → QL xác nhận → hệ thống xóa và thông báo thành công.
4. Nếu không đủ điều kiện: hiện thông báo lỗi mô tả lý do không thể xóa.

**Luồng nghiệp vụ (Quản lí loại phòng):**
- QL có thể **thêm / sửa / xóa loại phòng** (tên loại, sức chứa tiêu chuẩn).
- Chỉ được xóa loại phòng khi **không có phòng nào** đang sử dụng loại đó.

---

### 1.3 Module: Quản lí khách hàng

**Chức năng:** Xem danh sách khách hàng, tìm kiếm và xem lịch sử thuê phòng.

**Luồng nghiệp vụ:**
1. QL chọn menu **Quản lí khách hàng** → danh sách KH hiện ra (họ tên, số CMND/CCCD, số điện thoại, danh sách phòng đang thuê hiện tại).
2. QL nhập từ khóa (tên / số CMND) và click **Tìm kiếm** → danh sách lọc hiện ra.
3. QL click vào 1 KH → hệ thống hiển thị:
   - Thông tin cá nhân (họ tên, ngày sinh, CMND/CCCD, số điện thoại, quê quán).
   - **Lịch sử thuê phòng**: danh sách các hợp đồng đã có, mỗi dòng gồm tên phòng – khu – ngày bắt đầu – ngày kết thúc – trạng thái hợp đồng.
   - **Trạng thái nợ theo từng phòng**: nếu KH đang thuê nhiều phòng, hiển thị nợ riêng cho từng phòng (tên phòng – số tiền nợ – số tháng nợ liên tiếp); hiển thị tổng nợ ở cuối.

---

### 1.4 Module: Đặt cọc giữ phòng

**Chức năng:** Cho phép KH đặt cọc để giữ phòng trước khi vào ở và ký hợp đồng chính thức.

**Luồng nghiệp vụ:**
1. QL chọn **Đặt cọc giữ phòng** → tìm phòng trống theo tên hoặc khu.
2. QL chọn phòng → nhập thông tin KH (tìm KH đã có hoặc nhập mới) và số tiền đặt cọc.
3. QL click **Xác nhận đặt cọc** → hệ thống:
   - Lưu bản ghi đặt cọc (KH, phòng, số tiền, ngày đặt cọc).
   - Chuyển trạng thái phòng thành **"Đã đặt cọc"**.
4. Khi KH đến vào ở: QL chọn phòng "Đã đặt cọc" → tiến hành **Làm hợp đồng** (module 1.5) — hệ thống tự điền số tiền cọc đã nhận.

**Quy tắc:**
- Phòng ở trạng thái "Đã đặt cọc" **không được tạo hợp đồng** cho KH khác cho đến khi hủy đặt cọc.
- QL có thể **hủy đặt cọc** (KH không đến ở): nhập lý do, xử lý hoàn/giữ cọc theo thỏa thuận, chuyển phòng về "Đang trống".

---

### 1.5 Module: Làm hợp đồng cho thuê phòng

**Luồng nghiệp vụ:**
1. QL chọn **Tìm phòng còn trống** → giao diện tìm phòng trống hiện ra (bao gồm cả phòng "Đã đặt cọc").
2. QL nhập ngày bắt đầu ở, ngày hết hạn hợp đồng và mức giá KH chấp nhận → hệ thống hiện danh sách phòng phù hợp (kèm thông tin loại phòng, sức chứa, đơn giá điện/nước).
3. QL chọn 1 phòng theo yêu cầu KH → giao diện nhập thông tin KH hiện ra:
   - Hệ thống cho phép **tìm KH đã có trong hệ thống** (theo CMND/CCCD hoặc tên) để tái sử dụng thông tin; hoặc nhập mới nếu KH chưa tồn tại.
   - Thông tin **người đại diện ký hợp đồng** (bên B): họ tên, ngày sinh, số CMND/CCCD, số điện thoại, quê quán.
   - **Số người ở thực tế** tại thời điểm vào (dùng để tính tiền vệ sinh).
   - **Tiền đặt cọc**: nếu phòng đã ở trạng thái "Đã đặt cọc" thì hệ thống tự điền số tiền cọc đã nhận; ngược lại QL nhập mới.
4. Hệ thống hiển thị **mẫu hợp đồng** đầy đủ thông tin, trong đó ghi rõ số người ở thực tế.
5. KH duyệt và chấp nhận → QL click **Xác nhận** → hệ thống in hợp đồng, tạo danh sách người ở ban đầu, chuyển trạng thái phòng thành "Đang cho thuê" và lưu vào hệ thống.

**Quy tắc validation:**
- Ngày hết hạn phải **sau ngày bắt đầu** ít nhất 1 tháng.
- Ngày bắt đầu không được sớm hơn **30 ngày** trước ngày hiện tại.
- Không được tạo hợp đồng mới cho phòng đang ở trạng thái "Đang cho thuê" hoặc "Đang sửa chữa".

---

### 1.6 Module: Gia hạn hợp đồng

**Luồng nghiệp vụ:**
1. QL chọn **Gia hạn hợp đồng** → tìm hợp đồng theo tên KH / tên phòng; nếu KH đang thuê nhiều phòng thì hiển thị danh sách hợp đồng để QL chọn đúng phòng cần gia hạn.
2. QL chọn hợp đồng cần gia hạn → hệ thống hiển thị thông tin hợp đồng hiện tại.
3. QL nhập **ngày hết hạn mới** (phải sau ngày hết hạn cũ) → click **Xác nhận gia hạn**.
4. Hệ thống lưu ngày hết hạn mới, ghi lại lịch sử gia hạn (ngày gia hạn, ngày hết hạn cũ, ngày hết hạn mới) và thông báo thành công.

---

### 1.7 Module: Lên hóa đơn tháng cho khách hàng

**Luồng nghiệp vụ:**
1. QL chọn **Lên hóa đơn hàng tháng** → hệ thống hiện danh sách phòng đang cho thuê chưa có hóa đơn tháng này.
2. QL click chọn 1 phòng → giao diện nhập chỉ số điện, nước và thông tin xe tháng này hiện ra:
   - **Chỉ số cũ** (điện/nước): hệ thống tự điền từ chỉ số mới của tháng trước.
   - **Chỉ số mới**: QL nhập vào sau khi đi chốt đồng hồ (phải ≥ chỉ số cũ).
   - **Số xe máy** và **số xe đạp**: QL nhập số lượng xe của phòng trong tháng.
3. QL nhập đầy đủ → hệ thống tự tính tiêu thụ và hiển thị **hóa đơn tháng** đầy đủ, bao gồm cả nợ tháng trước (nếu có).
4. QL kiểm tra và click **Xác nhận** → hệ thống lưu hóa đơn và in hóa đơn cho phòng tương ứng.
5. Lặp lại cho đến khi hết phòng.

**Quy tắc tháng đầu / tháng cuối:**
- Tháng đầu tiên (KH vào giữa tháng): tiền phòng = giá thuê × (số ngày ở thực tế / tổng số ngày trong tháng), làm tròn đến 1.000 đồng.
- Tháng cuối (KH trả giữa tháng khi thanh lý): tương tự, tính theo số ngày thực tế ở trong tháng.

---

### 1.8 Module: Thanh toán hàng tháng

**Luồng nghiệp vụ:**
1. KH cầm hóa đơn đến thanh toán, QL chọn **Thanh toán**.
2. Hệ thống hiện giao diện tìm hóa đơn (theo mã hóa đơn / tên KH / tên phòng).
3. QL nhập thông tin và click **Tìm** → hệ thống hiện thông tin hóa đơn tương ứng.
4. QL chọn **phương thức thanh toán**:
   - **Tiền mặt**: QL nhận tiền trực tiếp.
   - **Chuyển khoản**: QL nhập mã giao dịch ngân hàng (tùy chọn, để đối chiếu sau).
5. QL click **Xác nhận đã thanh toán** → hệ thống cập nhật trạng thái hóa đơn thành "Đã thanh toán", ghi lại ngày thanh toán và phương thức thanh toán.
6. QL ký xác nhận vào hóa đơn trả cho KH.

---

### 1.9 Module: Thống kê doanh thu & lợi nhuận

**Luồng nghiệp vụ:**
1. QL chọn menu **Thống kê doanh thu** → hệ thống hiện lựa chọn: theo **tháng / quý / năm**.
2. QL chọn loại thống kê → hệ thống hiện bảng tổng hợp, mỗi dòng gồm:
   - Tên tháng (hoặc quý/năm) – Tổng doanh thu – Tổng chi phí vận hành (nếu có) – Lợi nhuận (= doanh thu − chi phí).
   - Sắp xếp từ gần nhất đến cũ nhất.
   - Nếu chưa có dữ liệu chi phí vận hành cho kỳ đó, cột Chi phí và Lợi nhuận hiển thị "—".
3. QL click vào một dòng → hệ thống hiện **danh sách hóa đơn đã thanh toán** trong khoảng thời gian đó, mỗi dòng gồm:
   - ID hóa đơn – Tên khách hàng – Tên phòng – Tổng tiền – Phương thức thanh toán.

---

### 1.10 Module: Thanh lý hợp đồng

**Luồng nghiệp vụ:**
1. QL chọn **Thanh lý hợp đồng** → giao diện tìm hợp đồng theo tên KH / tên phòng hiện ra.
   - Nếu tìm theo tên KH mà KH đang thuê **nhiều phòng**, hệ thống hiển thị danh sách các hợp đồng đang hiệu lực của KH đó để QL chọn **đúng phòng** cần thanh lý.
2. QL chọn hợp đồng cần thanh lý → hệ thống hiển thị:
   - Thông tin hợp đồng, tiền cọc đang giữ.
   - Các hóa đơn còn nợ chưa thanh toán (nếu có).
3. QL nhập thông tin trả phòng: ngày trả, ghi chú hư hỏng (nếu có) kèm số tiền bồi thường.
4. Hệ thống tự động tính **số tiền hoàn cọc** = Tiền cọc − Nợ tồn đọng − Chi phí bồi thường.
   - Nếu nợ tồn đọng > 0: hệ thống nhắc QL xử lý nợ trước (thu tiền mặt hoặc khấu trừ vào cọc).
   - Số tiền hoàn cọc tối thiểu là 0 (không âm).
5. QL xác nhận → hệ thống in **biên bản thanh lý**, cập nhật trạng thái phòng thành "Đang trống".

---

### 1.11 Module: Hủy hợp đồng

**Điều kiện áp dụng:** KH không thanh toán từ 2 tháng liên tiếp trở lên.

**Luồng nghiệp vụ:**
1. QL chọn **Hủy hợp đồng** (hoặc truy cập từ cảnh báo "Nguy cơ hủy hợp đồng" trên dashboard).
   - Nếu KH đang thuê **nhiều phòng**, hệ thống hiển thị danh sách hợp đồng để QL chọn đúng phòng cần hủy.
2. Hệ thống hiển thị thông tin hợp đồng và danh sách hóa đơn chưa thanh toán.
3. QL xác nhận lý do hủy: "Vi phạm nghĩa vụ thanh toán".
4. QL click **Xác nhận hủy** → hệ thống:
   - Ghi nhận lý do hủy và ngày hủy.
   - **Giữ lại toàn bộ tiền cọc** (không hoàn trả).
   - Chuyển trạng thái phòng về "Đang trống".
   - In **biên bản hủy hợp đồng**.

---

### 1.12 Module: Quản lí người ở trong phòng

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

### 1.13 Module: Quản lí đơn giá dịch vụ

**Chức năng:** Cho phép QL cập nhật đơn giá dịch vụ theo từng loại phòng và theo thời gian.

**Quy tắc:**
- Đơn giá điện/nước **không đồng nhất** — mỗi loại phòng có đơn giá riêng (phòng sức chứa cao có đơn giá điện/nước thấp hơn phòng ít người).
- Đơn giá vệ sinh, xe máy, xe đạp áp dụng **đồng nhất** cho tất cả các phòng.
- Mỗi lần thay đổi đơn giá, hệ thống lưu **lịch sử đơn giá** kèm ngày áp dụng.
- Khi lập hóa đơn, hệ thống tự động áp dụng **đơn giá của loại phòng tương ứng có hiệu lực tại thời điểm lập hóa đơn**.
- QL có thể xem lịch sử thay đổi đơn giá theo từng loại phòng và từng loại dịch vụ.

---

### 1.14 Module: Cảnh báo & dashboard tổng quan

**Chức năng:** Hiển thị KPI tổng quan và các cảnh báo quan trọng ngay trên trang chủ của QL.

**KPI tổng quan (hiển thị dạng thẻ số liệu):**

| Chỉ số | Nội dung |
|---|---|
| Tỉ lệ lấp đầy | Số phòng đang cho thuê / tổng số phòng (%), phân theo từng khu |
| Doanh thu tháng này | Tổng tiền hóa đơn đã thanh toán trong tháng hiện tại |
| Hợp đồng sắp hết hạn | Số hợp đồng còn ≤ 1 tháng đến ngày hết hạn |
| Phòng đang sửa chữa | Số phòng đang ở trạng thái "Đang sửa chữa" |

**Cảnh báo (hiển thị dạng danh sách thẻ, phân nhóm theo loại):**

| Loại cảnh báo | Điều kiện hiển thị |
|---|---|
| Phòng chưa lên hóa đơn | Đã qua ngày cuối tháng mà phòng chưa có hóa đơn |
| Hóa đơn sắp đến hạn | Còn ≤ 2 ngày đến hạn thanh toán |
| Hóa đơn quá hạn | Đã quá 1 tuần chưa thanh toán |
| Nguy cơ hủy hợp đồng | KH có hóa đơn chưa thanh toán ≥ 2 tháng liên tiếp |
| Hợp đồng sắp hết hạn | Còn đúng 1 tháng đến ngày hết hạn hợp đồng |

**Hành động từ cảnh báo:**
- Mỗi thẻ cảnh báo có nút **Xem chi tiết** để chuyển thẳng đến màn hình xử lý liên quan.
- QL có thể **đánh dấu đã xem** một cảnh báo để ẩn khỏi danh sách; cảnh báo sẽ hiện lại nếu điều kiện vẫn còn tồn tại vào ngày hôm sau.

---

### 1.15 Module: Báo cáo nâng cao

**Các loại báo cáo bổ sung dành cho QL:**

1. **Báo cáo công suất phòng**: Số phòng đang cho thuê / tổng số phòng, theo từng khu.
2. **Báo cáo khách hàng nợ**: Danh sách KH còn nợ, tổng nợ, số tháng nợ liên tiếp (đánh dấu đỏ nếu ≥ 2 tháng); nếu KH thuê nhiều phòng thì liệt kê nợ theo từng phòng.
3. **Báo cáo doanh thu theo khu / theo phòng**: So sánh doanh thu giữa các khu, các phòng trong kỳ.
4. **Xuất báo cáo**: Hỗ trợ xuất ra file Excel hoặc PDF.

---

### 1.16 Module: Quản lí sửa chữa & bảo trì

**Chức năng:** QL ghi nhận và theo dõi các sự cố, công việc bảo trì tại từng phòng / khu.

**Luồng nghiệp vụ:**
1. QL tạo yêu cầu sửa chữa: chọn phòng, mô tả sự cố, ngày phát sinh, chi phí dự kiến.
2. QL cập nhật trạng thái: `Chờ xử lý` → `Đang xử lý` → `Hoàn thành`.
3. Khi hoàn thành, QL nhập chi phí thực tế → hệ thống ghi nhận vào lịch sử bảo trì của phòng.
4. Chi phí sửa chữa có thể được **khấu trừ vào tiền cọc** khi thanh lý hợp đồng (nếu do KH gây ra).

---

### 1.17 Module: Danh sách & tìm kiếm hợp đồng

**Chức năng:** Xem toàn bộ hợp đồng trong hệ thống, lọc và tìm kiếm.

**Luồng nghiệp vụ:**
1. QL chọn menu **Danh sách hợp đồng** → hệ thống hiển thị bảng tất cả hợp đồng với các cột: Mã HĐ – Tên KH – Tên phòng – Khu – Ngày bắt đầu – Ngày hết hạn – Trạng thái.
2. QL có thể **lọc** theo:
   - Trạng thái: Đang hiệu lực / Đã thanh lý / Đã hủy.
   - Khu nhà trọ.
   - Khoảng thời gian (ngày bắt đầu hoặc ngày kết thúc).
   - Tên KH hoặc tên phòng (tìm theo từ khóa).
3. QL click vào 1 hợp đồng → hệ thống hiển thị chi tiết hợp đồng và có thể chuyển sang các thao tác liên quan (Gia hạn, Thanh lý, Hủy).

---

### 1.18 Module: Quản lí chi phí vận hành

**Chức năng:** Ghi nhận các khoản chi của chủ trọ để tính lợi nhuận thực.

**Các loại chi phí:**

| Loại chi phí | Mô tả |
|---|---|
| Điện/nước tổng | Tiền điện, nước trả cho nhà cung cấp theo đồng hồ tổng của khu |
| Sửa chữa chung khu | Chi phí bảo trì cơ sở hạ tầng chung (mái, hành lang, v.v.) |
| Chi phí khác | Các khoản chi phát sinh khác (vệ sinh khu, thuế, v.v.) |

**Luồng nghiệp vụ:**
1. QL chọn menu **Chi phí vận hành** → chọn **Thêm chi phí**.
2. QL chọn tháng, loại chi phí, khu (nếu áp dụng), số tiền và ghi chú.
3. QL click **Lưu** → hệ thống ghi nhận và cập nhật dữ liệu lợi nhuận trong module thống kê.
4. QL có thể xem danh sách chi phí theo tháng / khu, sửa hoặc xóa từng khoản.

---

## 2. Quy tắc nghiệp vụ chi tiết

### 2.1 Trạng thái phòng
Phòng có 4 trạng thái rõ ràng:

| Trạng thái | Mô tả | Chuyển sang |
|---|---|---|
| Đang trống | Chưa có KH, sẵn sàng cho thuê | Đang cho thuê (khi ký HĐ), Đã đặt cọc (khi nhận cọc), Đang sửa chữa |
| Đang cho thuê | Có hợp đồng đang hiệu lực | Đang trống (khi thanh lý / hủy HĐ) |
| Đã đặt cọc | Đã nhận cọc, chờ KH vào ở | Đang cho thuê (khi ký HĐ chính thức), Đang trống (khi hủy đặt cọc) |
| Đang sửa chữa | Tạm thời không cho thuê | Đang trống (khi hoàn thành sửa chữa) |

### 2.2 Tiền cọc
- Tiền cọc không được tính vào doanh thu cho đến khi hợp đồng thanh lý.
- Khi thanh lý: hoàn trả đủ nếu không có nợ/hư hỏng; khấu trừ theo thứ tự: nợ hóa đơn → chi phí bồi thường → hoàn phần còn lại.
- Khi hủy hợp đồng (do vi phạm thanh toán): toàn bộ tiền cọc bị giữ lại, không hoàn trả.

### 2.3 Điều chỉnh giá thuê giữa kỳ
- QL tự cập nhật giá thuê mà **không cần xác nhận từ KH** trên hệ thống.
- Khi QL thay đổi giá thuê, hệ thống lưu **ngày áp dụng giá mới** và giá cũ vào bảng lịch sử giá thuê phòng.
- Hóa đơn các tháng trước không bị ảnh hưởng; giá mới chỉ áp dụng từ tháng tiếp theo.

### 2.4 Xử lý nợ quá hạn & hủy hợp đồng
- Không áp dụng lãi suất với hóa đơn quá hạn.
- Nếu KH **không thanh toán từ 2 tháng liên tiếp trở lên**, QL có thể thực hiện **hủy hợp đồng**:
  - Hệ thống ghi nhận lý do hủy: vi phạm nghĩa vụ thanh toán.
  - **Toàn bộ tiền cọc bị giữ lại**, không hoàn trả.
  - Trạng thái phòng chuyển về "Đang trống".
  - Hệ thống in biên bản hủy hợp đồng.
- Khi KH thuê nhiều phòng, việc hủy hợp đồng của 1 phòng **không ảnh hưởng** đến các hợp đồng phòng khác của cùng KH đó.

### 2.5 Validation dữ liệu đầu vào
- Chỉ số điện/nước mới phải **≥ chỉ số cũ**; nếu vi phạm hệ thống hiển thị thông báo lỗi rõ ràng và không cho lưu.
- Ngày hết hạn hợp đồng phải **sau ngày bắt đầu** ít nhất 1 tháng.
- Ngày bắt đầu hợp đồng không được sớm hơn **30 ngày** trước ngày hiện tại (tránh nhập nhầm năm hoặc ngày quá khứ xa).
- Tên phòng phải **duy nhất trong cùng một khu**; hệ thống kiểm tra và báo lỗi nếu trùng.
- Số người ở, số xe máy, số xe đạp phải là **số nguyên không âm**.
- Các trường bắt buộc (họ tên, CMND, số điện thoại KH) không được để trống khi tạo hợp đồng.
- Số tiền chi phí vận hành phải là **số dương**; không được nhập số âm.
