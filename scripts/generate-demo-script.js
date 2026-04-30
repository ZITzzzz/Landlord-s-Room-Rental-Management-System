'use strict';
// Tạo file DOCX kịch bản demo cho khách hàng
// Chạy: node scripts/generate-demo-script.js
// Output: docs/demo-script.docx

const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, WidthType, BorderStyle,
  PageBreak, ShadingType, TableLayoutType,
} = require('docx');
const fs = require('fs');
const path = require('path');

// ─── Màu sắc & style ────────────────────────────────────────────────────────
const COLOR = {
  primary:   '1677FF', // xanh Ant Design
  heading1:  '003366', // xanh đậm section
  heading2:  '0055AA',
  labelBg:   'EBF3FF', // nền cột nhãn
  rowAlt:    'F8FAFF', // hàng xen kẽ
  accent:    'FF4D4F', // đỏ cảnh báo
  gray:      '888888',
  border:    'C0D4F0',
  white:     'FFFFFF',
};

// ─── Helper: paragraph đơn giản ─────────────────────────────────────────────
function para(text, opts = {}) {
  return new Paragraph({
    alignment: opts.center ? AlignmentType.CENTER : AlignmentType.LEFT,
    spacing: { before: opts.spaceBefore ?? 0, after: opts.spaceAfter ?? 80 },
    children: [
      new TextRun({
        text,
        bold:   opts.bold   ?? false,
        italics: opts.italic ?? false,
        color:  opts.color  ?? '000000',
        size:   (opts.size  ?? 11) * 2,
        font:   'Times New Roman',
      }),
    ],
  });
}

// ─── Helper: heading ─────────────────────────────────────────────────────────
function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 320, after: 120 },
    children: [new TextRun({
      text, bold: true, color: COLOR.heading1, size: 28, font: 'Times New Roman',
    })],
  });
}
function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 100 },
    children: [new TextRun({
      text, bold: true, color: COLOR.heading2, size: 24, font: 'Times New Roman',
    })],
  });
}
function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 160, after: 80 },
    children: [new TextRun({
      text, bold: true, color: COLOR.primary, size: 22, font: 'Times New Roman',
    })],
  });
}

// ─── Helper: ngắt trang ──────────────────────────────────────────────────────
function pageBreak() {
  return new Paragraph({ children: [new PageBreak()] });
}

// ─── Helper: đường kẻ ngang ──────────────────────────────────────────────────
function hrLine() {
  return new Paragraph({
    spacing: { before: 80, after: 80 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: COLOR.border } },
    children: [new TextRun({ text: '' })],
  });
}

// ─── Helper: bullet ─────────────────────────────────────────────────────────
function bullet(text, indent = 0) {
  return new Paragraph({
    spacing: { before: 40, after: 40 },
    indent: { left: 360 + indent * 360 },
    children: [
      new TextRun({ text: '• ', bold: true, color: COLOR.primary, size: 22, font: 'Times New Roman' }),
      new TextRun({ text, size: 22, font: 'Times New Roman' }),
    ],
  });
}

// ─── Helper: bảng 2 cột cho 1 bước demo ────────────────────────────────────
// fields = [{ label, value, accent? }]
function stepTable(stepNo, title, fields) {
  const cellBorder = {
    top:    { style: BorderStyle.SINGLE, size: 4, color: COLOR.border },
    bottom: { style: BorderStyle.SINGLE, size: 4, color: COLOR.border },
    left:   { style: BorderStyle.SINGLE, size: 4, color: COLOR.border },
    right:  { style: BorderStyle.SINGLE, size: 4, color: COLOR.border },
  };

  // Header row
  const headerRow = new TableRow({
    children: [
      new TableCell({
        width: { size: 100, type: WidthType.PERCENTAGE },
        columnSpan: 2,
        shading: { type: ShadingType.SOLID, color: COLOR.primary, fill: COLOR.primary },
        borders: cellBorder,
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        children: [new Paragraph({
          children: [new TextRun({
            text: `BƯỚC ${stepNo} — ${title}`,
            bold: true, color: COLOR.white, size: 22, font: 'Times New Roman',
          })],
        })],
      }),
    ],
  });

  // Data rows
  const dataRows = fields.map((f, i) => new TableRow({
    children: [
      new TableCell({
        width: { size: 20, type: WidthType.PERCENTAGE },
        shading: { type: ShadingType.SOLID, color: COLOR.labelBg, fill: COLOR.labelBg },
        borders: cellBorder,
        margins: { top: 60, bottom: 60, left: 120, right: 120 },
        children: [new Paragraph({
          children: [new TextRun({
            text: f.label, bold: true, size: 20, font: 'Times New Roman', color: COLOR.heading2,
          })],
        })],
      }),
      new TableCell({
        width: { size: 80, type: WidthType.PERCENTAGE },
        shading: {
          type: ShadingType.SOLID,
          color: i % 2 === 0 ? COLOR.white : COLOR.rowAlt,
          fill:  i % 2 === 0 ? COLOR.white : COLOR.rowAlt,
        },
        borders: cellBorder,
        margins: { top: 60, bottom: 60, left: 120, right: 120 },
        children: [new Paragraph({
          children: [new TextRun({
            text: f.value,
            size: 20,
            font: 'Times New Roman',
            color: f.accent ? COLOR.accent : '222222',
            bold: !!f.bold,
          })],
        })],
      }),
    ],
  }));

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    rows: [headerRow, ...dataRows],
  });
}

// ─── Helper: bảng trạng thái phòng ─────────────────────────────────────────
function statusTable() {
  const cellBorder = {
    top:    { style: BorderStyle.SINGLE, size: 4, color: COLOR.border },
    bottom: { style: BorderStyle.SINGLE, size: 4, color: COLOR.border },
    left:   { style: BorderStyle.SINGLE, size: 4, color: COLOR.border },
    right:  { style: BorderStyle.SINGLE, size: 4, color: COLOR.border },
  };
  const rows = [
    ['Trạng thái', 'Ý nghĩa', 'Chuyển sang'],
    ['trong (Trống)', 'Phòng chưa có người thuê', 'dat_coc | cho_thue | sua_chua'],
    ['dat_coc (Đặt cọc)', 'Khách đã cọc, chờ ký HĐ', 'cho_thue | trong (hủy cọc)'],
    ['cho_thue (Đang thuê)', 'Hợp đồng đang hiệu lực', 'trong (thanh lý / hủy HĐ)'],
    ['sua_chua (Sửa chữa)', 'Phòng đang bảo trì', 'trong (hoàn thành sửa)'],
  ];
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: rows.map((row, ri) => new TableRow({
      children: row.map((cell) => new TableCell({
        borders: cellBorder,
        shading: {
          type: ShadingType.SOLID,
          color: ri === 0 ? COLOR.primary : (ri % 2 === 0 ? COLOR.rowAlt : COLOR.white),
          fill:  ri === 0 ? COLOR.primary : (ri % 2 === 0 ? COLOR.rowAlt : COLOR.white),
        },
        margins: { top: 60, bottom: 60, left: 120, right: 120 },
        children: [new Paragraph({
          children: [new TextRun({
            text: cell,
            bold: ri === 0,
            color: ri === 0 ? COLOR.white : '222222',
            size: 20,
            font: 'Times New Roman',
          })],
        })],
      })),
    })),
  });
}

// ════════════════════════════════════════════════════════════════════════════
// NỘI DUNG TÀI LIỆU
// ════════════════════════════════════════════════════════════════════════════

function buildDocument() {
  const today = new Date().toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });

  const children = [];

  // ── TRANG BÌA ─────────────────────────────────────────────────────────────
  children.push(
    para('', { spaceAfter: 400 }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 200 },
      children: [new TextRun({
        text: 'HỆ THỐNG QUẢN LÝ CHO THUÊ PHÒNG TRỌ',
        bold: true, color: COLOR.heading1, size: 52, font: 'Times New Roman',
      })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 160 },
      children: [new TextRun({
        text: 'Room Rental Management System',
        italics: true, color: COLOR.gray, size: 28, font: 'Times New Roman',
      })],
    }),
    hrLine(),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 160 },
      children: [new TextRun({
        text: 'KỊCH BẢN DEMO', bold: true, color: COLOR.primary, size: 48, font: 'Times New Roman',
      })],
    }),
    para('', { spaceAfter: 160 }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: `Phiên bản 1.0   |   Ngày: ${today}`, size: 22, color: COLOR.gray, font: 'Times New Roman' })],
    }),
    para('', { spaceAfter: 160 }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({
        text: 'Tài liệu này hướng dẫn trình bày demo hệ thống theo từng bước,\nkèm thao tác cụ thể và kết quả mong đợi.',
        italics: true, size: 22, color: COLOR.gray, font: 'Times New Roman',
      })],
    }),
    pageBreak(),
  );

  // ── GIỚI THIỆU ────────────────────────────────────────────────────────────
  children.push(
    h1('I. GIỚI THIỆU HỆ THỐNG'),
    para('Hệ thống Quản lý Cho thuê Phòng trọ là ứng dụng web nội bộ (LAN), hỗ trợ chủ nhà trọ quản lý toàn bộ vòng đời của phòng trọ — từ đặt cọc, ký hợp đồng, lập hóa đơn hàng tháng, đến thanh lý và báo cáo tổng hợp.', { size: 11 }),

    h2('Công nghệ sử dụng'),
    bullet('Frontend: React + Ant Design (giao diện người dùng)'),
    bullet('Backend: Node.js / Express (xử lý nghiệp vụ)'),
    bullet('Cơ sở dữ liệu: MongoDB (14 collections)'),

    h2('Yêu cầu môi trường demo'),
    bullet('Trình duyệt: Chrome / Edge / Firefox (phiên bản mới nhất)'),
    bullet('URL truy cập: http://localhost:5173'),
    bullet('Server phải đang chạy: npm run dev (cổng 3001 + 5173)'),
    bullet('MongoDB đang kết nối và đã có dữ liệu mẫu (chạy: node scripts/seed.js)'),

    h2('Modules trong hệ thống'),
    bullet('Dashboard — Tổng quan KPI và cảnh báo thông minh'),
    bullet('Quản lý Khu / Loại phòng / Phòng — Danh mục cơ bản'),
    bullet('Quản lý Khách hàng — Tìm kiếm, thêm, xem chi tiết'),
    bullet('Đặt cọc — Wizard 3 bước đặt giữ phòng'),
    bullet('Hợp đồng — Ký, gia hạn, quản lý người ở'),
    bullet('Hóa đơn — Lập tháng, tính trước, thanh toán'),
    bullet('Thanh lý / Hủy hợp đồng — Tính hoàn cọc'),
    bullet('Sửa chữa — Quản lý bảo trì phòng'),
    bullet('Chi phí vận hành — Ghi nhận chi phí chung'),
    bullet('Báo cáo — Doanh thu, công suất, công nợ'),
    pageBreak(),
  );

  // ── PHẦN 1: DASHBOARD ─────────────────────────────────────────────────────
  children.push(
    h1('II. CÁC BƯỚC DEMO CHI TIẾT'),
    h2('PHẦN 1 — Dashboard & Cảnh báo thông minh'),
    para('Điểm bắt đầu của demo. Cho khách hàng thấy toàn cảnh hệ thống chỉ trong một màn hình.'),

    stepTable(1, 'Mở trang Dashboard', [
      { label: 'Thao tác', value: 'Mở trình duyệt → nhập địa chỉ http://localhost:5173 → nhấn Enter' },
      { label: 'Màn hình', value: 'Trang Dashboard hiện ra với 4 thẻ KPI ở trên cùng' },
      { label: 'Kết quả', value: 'Thấy: Doanh thu tháng này | HĐ sắp hết hạn | Phòng đang sửa | Tổng phòng đang thuê (x/tổng)' },
      { label: 'Điểm nhấn', value: 'Biểu đồ cột bên dưới cho thấy % lấp đầy từng Khu — trực quan tức thì', bold: true },
    ]),

    para('', { spaceAfter: 120 }),
    stepTable(2, 'Xem cảnh báo tự động', [
      { label: 'Thao tác', value: 'Cuộn xuống phần "Cảnh báo" trên Dashboard' },
      { label: 'Màn hình', value: 'Danh sách cảnh báo chia thành 5 nhóm: phòng trống, hóa đơn quá hạn, sắp đến hạn, nguy cơ hủy HĐ, HĐ sắp hết hạn' },
      { label: 'Kết quả', value: 'Hóa đơn quá hạn hiển thị màu đỏ + số ngày trễ. Mỗi cảnh báo có nút hành động nhanh (Xem, Thanh toán, Gia hạn...)' },
      { label: 'Lưu ý', value: 'Click "Đã xem" để ẩn cảnh báo đó — hệ thống ghi nhận và không hiện lại' },
    ]),
    pageBreak(),
  );

  // ── PHẦN 2: DANH MỤC ──────────────────────────────────────────────────────
  children.push(
    h2('PHẦN 2 — Cấu hình danh mục (Khu / Loại phòng / Phòng)'),
    para('Cài đặt ban đầu — chỉ làm 1 lần khi khởi tạo hệ thống.'),

    stepTable(3, 'Thêm khu trọ mới', [
      { label: 'Thao tác', value: 'Menu trái → "Khu trọ" → click nút "+ Thêm khu"' },
      { label: 'Nhập liệu', value: 'Tên khu: "Khu A" | Địa chỉ: "123 Nguyễn Văn A, Q.1" | Ghi chú: (tùy chọn)' },
      { label: 'Kết quả', value: 'Khu mới xuất hiện trong danh sách. Cột "Tổng phòng" và "Đang thuê" ban đầu = 0' },
    ]),

    para('', { spaceAfter: 120 }),
    stepTable(4, 'Thêm loại phòng & cài giá dịch vụ', [
      { label: 'Thao tác', value: 'Menu → "Loại phòng" → click "+ Thêm loại phòng"' },
      { label: 'Nhập liệu', value: 'Tên loại: "Phòng Đơn" | Sức chứa tối đa: 2 người → Lưu' },
      { label: 'Cài giá', value: 'Click "Cập nhật giá" bên cạnh loại vừa tạo → nhập giá điện: 3.500đ/kWh, nước: 15.000đ/m³, ngày áp dụng: hôm nay' },
      { label: 'Kết quả', value: 'Giá dịch vụ được lưu. Hệ thống tự chọn giá đúng theo ngày khi tính hóa đơn' },
      { label: 'Lưu ý', value: 'Lịch sử giá được bảo toàn — thay đổi giá không ảnh hưởng hóa đơn cũ', bold: true },
    ]),

    para('', { spaceAfter: 120 }),
    stepTable(5, 'Thêm phòng mới', [
      { label: 'Thao tác', value: 'Menu → "Phòng" → click "+ Thêm phòng"' },
      { label: 'Nhập liệu', value: 'Khu: "Khu A" | Loại phòng: "Phòng Đơn" | Tên phòng: "P101" | Giá thuê: 3.500.000 đ/tháng' },
      { label: 'Kết quả', value: 'Phòng P101 xuất hiện với badge trạng thái màu xám "Trống"' },
      { label: 'Màn hình', value: 'Danh sách phòng có thể lọc theo Khu hoặc Trạng thái (Trống / Đặt cọc / Đang thuê / Sửa chữa)' },
    ]),
    pageBreak(),
  );

  // ── PHẦN 3: KHÁCH HÀNG ────────────────────────────────────────────────────
  children.push(
    h2('PHẦN 3 — Quản lý khách hàng'),

    stepTable(6, 'Tìm kiếm khách hàng', [
      { label: 'Thao tác', value: 'Menu → "Khách hàng" → gõ tên hoặc số CCCD vào ô tìm kiếm' },
      { label: 'Kết quả', value: 'Danh sách lọc real-time (delay 300ms). Mỗi dòng hiện: Họ tên | CCCD | SĐT | Phòng đang thuê (nếu có)' },
      { label: 'Điểm nhấn', value: 'Tag màu xanh hiển thị phòng đang thuê ngay trên danh sách — không cần mở chi tiết', bold: true },
    ]),

    para('', { spaceAfter: 120 }),
    stepTable(7, 'Thêm khách hàng mới', [
      { label: 'Thao tác', value: 'Click "+ Thêm khách hàng" → điền form' },
      { label: 'Nhập liệu', value: 'Họ tên: "Nguyễn Văn Minh" | CCCD: "079200012345" | SĐT: "0912345678" | Ngày sinh: 01/01/2000 | Quê quán: Hà Nội' },
      { label: 'Kết quả', value: 'Khách hàng được lưu và xuất hiện trong danh sách' },
      { label: 'Lưu ý', value: 'Số CCCD là duy nhất — hệ thống báo lỗi nếu trùng' },
    ]),

    para('', { spaceAfter: 120 }),
    stepTable(8, 'Xem chi tiết khách hàng', [
      { label: 'Thao tác', value: 'Click vào tên khách hàng bất kỳ trong danh sách' },
      { label: 'Màn hình', value: '3 phần: Thông tin cá nhân | Lịch sử hợp đồng | Công nợ theo phòng' },
      { label: 'Kết quả', value: 'Thấy toàn bộ lịch sử thuê phòng và tổng nợ hiện tại của khách' },
      { label: 'Điểm nhấn', value: 'Cột "Nợ liên tiếp" highlight đỏ nếu ≥2 tháng — cảnh báo rủi ro cho chủ nhà', bold: true },
    ]),
    pageBreak(),
  );

  // ── PHẦN 4: ĐẶT CỌC ──────────────────────────────────────────────────────
  children.push(
    h2('PHẦN 4 — Đặt cọc phòng (Wizard 3 bước)'),
    para('Kịch bản: Anh Nguyễn Văn Minh muốn đặt cọc phòng P101 - Khu A, tiền cọc 1 tháng = 3.500.000đ.'),

    stepTable(9, 'Bước 1 — Chọn phòng trống', [
      { label: 'Thao tác', value: 'Menu → "Đặt cọc" → Wizard hiện ra ở Bước 1' },
      { label: 'Màn hình', value: 'Bảng danh sách phòng đang trống. Có thể lọc theo giá thuê tối đa' },
      { label: 'Thao tác', value: 'Click vào dòng phòng P101 - Khu A (hoặc chọn radio button)' },
      { label: 'Kết quả', value: 'Phòng P101 được chọn (highlight). Nút "Tiếp theo" sáng lên' },
    ]),

    para('', { spaceAfter: 120 }),
    stepTable(10, 'Bước 2 — Chọn khách & nhập thông tin cọc', [
      { label: 'Thao tác', value: 'Click "Tiếp theo" → chuyển sang Bước 2' },
      { label: 'Màn hình', value: 'Cột trái: tìm kiếm khách hàng. Cột phải: thông tin phòng + form cọc' },
      { label: 'Tìm khách', value: 'Gõ "Minh" vào ô tìm kiếm → chọn "Nguyễn Văn Minh" từ danh sách' },
      { label: 'Nhập cọc', value: 'Số tiền: 3.500.000 | Ngày đặt cọc: hôm nay (mặc định)' },
      { label: 'Lưu ý', value: 'Nếu khách chưa có trong hệ thống: click "Thêm khách hàng mới" → điền form nhanh ngay tại đây' },
    ]),

    para('', { spaceAfter: 120 }),
    stepTable(11, 'Bước 3 — Xác nhận đặt cọc', [
      { label: 'Thao tác', value: 'Click "Tiếp theo" → Bước 3 hiển thị bảng tóm tắt' },
      { label: 'Màn hình', value: 'Bảng xác nhận: Phòng P101 | Giá thuê 3.500.000đ | Khách Nguyễn Văn Minh | Cọc 3.500.000đ | Ngày cọc hôm nay' },
      { label: 'Thao tác', value: 'Click "Xác nhận đặt cọc"' },
      { label: 'Kết quả', value: 'Toast "Đặt cọc thành công!" xuất hiện. Phòng P101 chuyển sang trạng thái màu cam "Đặt cọc"', bold: true },
    ]),
    pageBreak(),
  );

  // ── PHẦN 5: HỢP ĐỒNG ──────────────────────────────────────────────────────
  children.push(
    h2('PHẦN 5 — Ký hợp đồng thuê phòng (Wizard 3 bước)'),
    para('Kịch bản: Anh Minh đã cọc xong, nay ký hợp đồng chính thức thuê P101 từ 01/05/2026 đến 30/04/2027.'),

    stepTable(12, 'Bước 1 — Chọn phòng', [
      { label: 'Thao tác', value: 'Menu → "Hợp đồng" → click "+ Tạo hợp đồng"' },
      { label: 'Màn hình', value: 'Bảng hiện phòng trạng thái Trống và Đặt cọc. Phòng P101 đang màu cam "Đặt cọc"' },
      { label: 'Thao tác', value: 'Chọn phòng P101' },
    ]),

    para('', { spaceAfter: 120 }),
    stepTable(13, 'Bước 2 — Thông tin hợp đồng & người ở', [
      { label: 'Thao tác', value: 'Click "Tiếp theo" → Bước 2' },
      { label: 'Chọn khách', value: 'Tìm và chọn "Nguyễn Văn Minh"' },
      { label: 'Hợp đồng', value: 'Ngày bắt đầu: 01/05/2026 | Ngày hết hạn: 30/04/2027 | Tiền cọc: 3.500.000 (tự điền từ đặt cọc) | Số người ở tối đa: 2' },
      { label: 'Người ở', value: 'Mục "Người ở ban đầu": Nhập "Nguyễn Văn Minh" + CCCD. Click "+ Thêm" để thêm người ở thứ 2 nếu có' },
      { label: 'Lưu ý', value: 'Phải có ít nhất 1 người ở. Danh sách người ở ảnh hưởng đến phí vệ sinh hàng tháng', bold: true },
    ]),

    para('', { spaceAfter: 120 }),
    stepTable(14, 'Bước 3 — Xác nhận ký hợp đồng', [
      { label: 'Thao tác', value: 'Click "Tiếp theo" → xem bảng tóm tắt đầy đủ → click "Xác nhận ký hợp đồng"' },
      { label: 'Kết quả 1', value: 'Hợp đồng được tạo. Phòng P101 chuyển sang màu xanh "Đang thuê"', bold: true },
      { label: 'Kết quả 2', value: 'Chuyển về danh sách hợp đồng → click vào hợp đồng vừa tạo để xem chi tiết' },
      { label: 'Điểm nhấn', value: 'Tab "Người ở", "Hóa đơn chưa TT", "Lịch sử gia hạn" — quản lý đầy đủ từ 1 màn hình' },
    ]),
    pageBreak(),
  );

  // ── PHẦN 6: HÓA ĐƠN ──────────────────────────────────────────────────────
  children.push(
    h2('PHẦN 6 — Quản lý hóa đơn hàng tháng'),
    para('Kịch bản: Lập hóa đơn tháng 5/2026 cho phòng P101 — điện tăng 80 kWh, nước tăng 5 m³, 1 xe máy.'),

    stepTable(15, 'Lập hóa đơn tháng', [
      { label: 'Thao tác', value: 'Menu → "Hóa đơn" → click "+ Lập hóa đơn"' },
      { label: 'Chọn kỳ', value: 'Chọn Tháng: 5 | Năm: 2026 → bảng hiện các phòng sẵn sàng lập hóa đơn' },
      { label: 'Thao tác', value: 'Tìm phòng P101 → click "Lập hóa đơn"' },
      { label: 'Nhập liệu', value: 'Chỉ số điện mới: [số cũ + 80] | Chỉ số nước mới: [số cũ + 5] | Số xe máy: 1 | Số xe đạp: 0' },
      { label: 'Thao tác', value: 'Click "Tính trước" → xem bảng chi tiết bên phải' },
      { label: 'Kết quả', value: 'Hiển thị: Tiền phòng | Tiền điện | Tiền nước | Vệ sinh | Xe máy | Nợ cũ (nếu có) | TỔNG CỘNG', bold: true },
      { label: 'Thao tác', value: 'Click "Xác nhận lập hóa đơn" → hóa đơn được tạo' },
    ]),

    para('', { spaceAfter: 120 }),
    stepTable(16, 'Thanh toán hóa đơn', [
      { label: 'Thao tác', value: 'Menu → "Hóa đơn" → tìm hóa đơn P101 tháng 5 → click "Thanh toán"' },
      { label: 'Modal', value: 'Hiện thông tin hóa đơn + form chọn phương thức thanh toán' },
      { label: 'Nhập liệu', value: 'Phương thức: Chuyển khoản | Mã giao dịch: "TXN20260510" (tùy chọn)' },
      { label: 'Kết quả', value: 'Hóa đơn chuyển sang trạng thái "Đã thanh toán" (badge xanh). Ngày thanh toán được ghi lại' },
    ]),

    para('', { spaceAfter: 120 }),
    stepTable(17, 'In PDF hóa đơn', [
      { label: 'Thao tác', value: 'Ở danh sách hóa đơn → click icon máy in trên dòng hóa đơn đã thanh toán' },
      { label: 'Kết quả', value: 'File PDF hóa đơn tải về / mở tab mới với đầy đủ thông tin: phòng, tháng, chỉ số, bảng chi tiết, tổng tiền' },
    ]),
    pageBreak(),
  );

  // ── PHẦN 7: NGƯỜI Ở ───────────────────────────────────────────────────────
  children.push(
    h2('PHẦN 7 — Quản lý người ở (giữa kỳ hợp đồng)'),
    para('Kịch bản: Giữa tháng, anh Minh có thêm người bạn cùng ở. Cần cập nhật danh sách.'),

    stepTable(18, 'Xem danh sách người ở', [
      { label: 'Thao tác', value: 'Menu → "Hợp đồng" → click vào HĐ phòng P101 → tab "Người ở"' },
      { label: 'Màn hình', value: 'Bảng danh sách: Họ tên | CCCD | Ngày vào | Ngày ra (hoặc "Đang ở" — tag xanh)' },
    ]),

    para('', { spaceAfter: 120 }),
    stepTable(19, 'Thêm người ở mới', [
      { label: 'Thao tác', value: 'Click "+ Thêm người ở" → điền form: Họ tên "Trần Thị Lan" | CCCD (tùy chọn)' },
      { label: 'Kết quả', value: 'Người ở mới xuất hiện trong danh sách. Hệ thống tự tính phí vệ sinh dựa trên số người thực tế mỗi tháng', bold: true },
    ]),

    para('', { spaceAfter: 120 }),
    stepTable(20, 'Ghi nhận người ở rời đi', [
      { label: 'Thao tác', value: 'Tìm dòng "Trần Thị Lan" → click "Ngày ra" → chọn ngày rời' },
      { label: 'Kết quả', value: 'Cột "Ngày ra" hiển thị ngày rời. Tháng sau phí vệ sinh tự giảm theo số người còn lại' },
    ]),
    pageBreak(),
  );

  // ── PHẦN 8: GIA HẠN ───────────────────────────────────────────────────────
  children.push(
    h2('PHẦN 8 — Gia hạn hợp đồng'),
    para('Kịch bản: Hợp đồng P101 sắp hết hạn 30/04/2027. Anh Minh muốn ở thêm 6 tháng.'),

    stepTable(21, 'Gia hạn hợp đồng', [
      { label: 'Thao tác', value: 'Mở chi tiết HĐ phòng P101 → click nút "Gia hạn"' },
      { label: 'Modal', value: 'Hiện: Ngày hết hạn hiện tại: 30/04/2027 | Ô nhập: Ngày hết hạn mới' },
      { label: 'Nhập liệu', value: 'Ngày hết hạn mới: 31/10/2027 → click "Xác nhận"' },
      { label: 'Kết quả', value: 'Tab "Lịch sử gia hạn" ghi lại: Ngày gia hạn | Hạn cũ | Hạn mới. Hợp đồng tiếp tục hiệu lực' },
    ]),
    pageBreak(),
  );

  // ── PHẦN 9: SỬA CHỮA ─────────────────────────────────────────────────────
  children.push(
    h2('PHẦN 9 — Quản lý sửa chữa bảo trì'),
    para('Kịch bản: Phòng P201 (đang trống) cần sửa điều hoà. Đưa vào bảo trì, xong lại cho thuê.'),

    stepTable(22, 'Tạo yêu cầu sửa chữa', [
      { label: 'Thao tác', value: 'Menu → "Sửa chữa" → click "+ Tạo yêu cầu"' },
      { label: 'Nhập liệu', value: 'Phòng: P201 | Mô tả: "Điều hoà không lạnh, cần vệ sinh + nạp gas" | Chi phí dự kiến: 500.000 | Ngày phát sinh: hôm nay' },
      { label: 'Kết quả', value: 'Yêu cầu được tạo ở trạng thái "Chờ xử lý". Phòng P201 chuyển sang màu đỏ "Sửa chữa"', accent: true },
    ]),

    para('', { spaceAfter: 120 }),
    stepTable(23, 'Cập nhật hoàn thành sửa chữa', [
      { label: 'Thao tác', value: 'Tìm yêu cầu P201 → click "Cập nhật" → chọn Trạng thái: "Hoàn thành" | Chi phí thực tế: 450.000' },
      { label: 'Kết quả', value: 'Phòng P201 tự động chuyển về trạng thái màu xám "Trống" — sẵn sàng cho thuê lại', bold: true },
    ]),
    pageBreak(),
  );

  // ── PHẦN 10: CHI PHÍ VẬN HÀNH ────────────────────────────────────────────
  children.push(
    h2('PHẦN 10 — Ghi nhận chi phí vận hành'),
    para('Kịch bản: Tháng 5/2026 phát sinh tiền điện khu vực chung 800.000đ và sửa cầu thang 1.200.000đ.'),

    stepTable(24, 'Thêm chi phí vận hành', [
      { label: 'Thao tác', value: 'Menu → "Chi phí vận hành" → click "+ Thêm chi phí"' },
      { label: 'Chi phí 1', value: 'Tháng/Năm: 5/2026 | Khu: (để trống = tất cả khu) | Loại: Điện nước tổng | Số tiền: 800.000 | Ghi chú: "Điện hành lang tháng 5"' },
      { label: 'Chi phí 2', value: 'Thêm tiếp: Loại: Sửa chữa chung | Số tiền: 1.200.000 | Ghi chú: "Sửa cầu thang tầng 2"' },
      { label: 'Kết quả', value: 'Tổng chi phí tháng 5 = 2.000.000đ. Dùng trong báo cáo lợi nhuận cuối tháng' },
    ]),
    pageBreak(),
  );

  // ── PHẦN 11: THANH LÝ ────────────────────────────────────────────────────
  children.push(
    h2('PHẦN 11 — Thanh lý hợp đồng'),
    para('Kịch bản: Anh Minh trả phòng P101 đúng hạn, không hư hỏng. Hoàn lại tiền cọc.'),

    stepTable(25, 'Chọn hợp đồng cần thanh lý', [
      { label: 'Thao tác', value: 'Menu → "Thanh lý/Hủy" → Tab "Thanh lý" → tìm "Nguyễn Văn Minh" hoặc "P101"' },
      { label: 'Thao tác', value: 'Click "Chọn" bên cạnh hợp đồng → form thanh lý xuất hiện bên dưới' },
      { label: 'Nhập liệu', value: 'Ngày trả phòng: hôm nay | Tiền bồi thường: 0 | Ghi chú hư hỏng: (để trống)' },
    ]),

    para('', { spaceAfter: 120 }),
    stepTable(26, 'Xác nhận thanh lý & in biên bản', [
      { label: 'Thao tác', value: 'Click "Xác nhận thanh lý"' },
      { label: 'Kết quả', value: 'Hệ thống tính: Cọc 3.500.000 − Nợ tháng (0) − Bồi thường (0) = Hoàn cọc 3.500.000đ', bold: true },
      { label: 'Màn hình', value: 'Thẻ kết quả hiện số tiền hoàn cọc màu xanh. Nếu có nợ → trừ trực tiếp vào cọc, hiện số dư còn lại' },
      { label: 'In PDF', value: 'Click "In biên bản thanh lý" → PDF biên bản đầy đủ chữ ký tải về' },
      { label: 'Kết quả', value: 'Phòng P101 quay về trạng thái "Trống" — sẵn sàng cho khách mới', accent: false, bold: true },
    ]),
    pageBreak(),
  );

  // ── PHẦN 12: HỦY HĐ ──────────────────────────────────────────────────────
  children.push(
    h2('PHẦN 12 — Hủy hợp đồng (trường hợp vi phạm)'),
    para('Kịch bản: Khách phòng P301 bỏ đi mà không báo, nợ 3 tháng liên tiếp. Chủ nhà tịch thu cọc.'),

    stepTable(27, 'Kiểm tra điều kiện hủy', [
      { label: 'Thao tác', value: 'Menu → "Thanh lý/Hủy" → Tab "Hủy hợp đồng"' },
      { label: 'Màn hình', value: 'Cảnh báo đỏ: "Điều kiện hủy: ≥2 tháng nợ liên tiếp. Tiền cọc bị tịch thu"' },
      { label: 'Thao tác', value: 'Tìm và chọn hợp đồng phòng P301' },
    ]),

    para('', { spaceAfter: 120 }),
    stepTable(28, 'Xác nhận hủy hợp đồng', [
      { label: 'Nhập liệu', value: 'Lý do hủy: "Khách bỏ đi không báo, nợ 3 tháng tiền phòng"' },
      { label: 'Thao tác', value: 'Click nút đỏ "Xác nhận hủy hợp đồng"' },
      { label: 'Kết quả', value: 'Thông báo: "Hợp đồng đã hủy. Tiền cọc bị tịch thu." Bảng kê các tháng nợ hiển thị', accent: true },
      { label: 'In PDF', value: 'Click "In biên bản hủy" → tài liệu pháp lý ghi rõ lý do và số tháng nợ' },
      { label: 'Kết quả', value: 'Phòng P301 về trạng thái "Trống". Hợp đồng lưu trạng thái "Đã hủy"' },
    ]),
    pageBreak(),
  );

  // ── PHẦN 13: BÁO CÁO ─────────────────────────────────────────────────────
  children.push(
    h2('PHẦN 13 — Báo cáo & Thống kê'),
    para('Tổng hợp toàn bộ hoạt động kinh doanh. 4 tab báo cáo, có xuất Excel.'),

    stepTable(29, 'Báo cáo doanh thu', [
      { label: 'Thao tác', value: 'Menu → "Báo cáo" → Tab "Thống kê doanh thu"' },
      { label: 'Bộ lọc', value: 'Chọn kỳ: Theo tháng | Từ: 01/2026 | Đến: 05/2026 → xem biểu đồ' },
      { label: 'Biểu đồ', value: 'Cột 3 màu: Xanh = Doanh thu | Đỏ = Chi phí vận hành | Xanh lá = Lợi nhuận' },
      { label: 'Bảng', value: 'Mỗi tháng: Doanh thu | Chi phí | Lợi nhuận | Có thể mở rộng xem chi tiết hóa đơn' },
      { label: 'Xuất Excel', value: 'Click "Xuất Excel" → file .xlsx tải về với đầy đủ số liệu', bold: true },
    ]),

    para('', { spaceAfter: 120 }),
    stepTable(30, 'Báo cáo công suất phòng', [
      { label: 'Thao tác', value: 'Tab "Báo cáo công suất"' },
      { label: 'Màn hình', value: 'Thẻ tổng quan: Tổng phòng | Đang thuê | % Lấp đầy toàn hệ thống' },
      { label: 'Điểm nhấn', value: 'Bảng theo Khu: % lấp đầy màu xanh (≥80%) | vàng (50-79%) | đỏ (<50%)', bold: true },
      { label: 'Biểu đồ', value: 'Đường xu hướng công suất theo tháng — thấy được mùa cao điểm / thấp điểm' },
    ]),

    para('', { spaceAfter: 120 }),
    stepTable(31, 'Báo cáo công nợ', [
      { label: 'Thao tác', value: 'Tab "Báo cáo công nợ"' },
      { label: 'Màn hình', value: 'Danh sách khách hàng đang nợ: Tên | SĐT | Tổng nợ (đỏ đậm)' },
      { label: 'Mở rộng', value: 'Click vào dòng → xem chi tiết nợ từng phòng + số tháng nợ liên tiếp' },
      { label: 'Điểm nhấn', value: 'Tag đỏ "X tháng liên tiếp" — giúp chủ nhà ưu tiên xử lý các trường hợp nguy cơ cao', accent: true, bold: true },
    ]),

    para('', { spaceAfter: 120 }),
    stepTable(32, 'Doanh thu theo phòng', [
      { label: 'Thao tác', value: 'Tab "Doanh thu theo phòng" → chọn khu và khoảng thời gian' },
      { label: 'Biểu đồ', value: 'Thanh ngang top 15 phòng doanh thu cao nhất — phòng nào sinh lời tốt nhất' },
      { label: 'Xuất Excel', value: 'Click "Xuất Excel" → báo cáo đầy đủ tất cả phòng theo doanh thu giảm dần' },
    ]),
    pageBreak(),
  );

  // ── PHỤ LỤC ───────────────────────────────────────────────────────────────
  children.push(
    h1('III. PHỤ LỤC'),
    h2('A. Sơ đồ trạng thái phòng'),
    para('Phòng trọ có 4 trạng thái. Hệ thống tự động chuyển đổi theo nghiệp vụ, không cho phép chuyển sai luồng.', { spaceAfter: 160 }),
    statusTable(),

    para('', { spaceAfter: 160 }),
    h2('B. Tóm tắt nghiệp vụ quan trọng'),
    bullet('Giá dịch vụ (điện, nước, vệ sinh...) có lịch sử — thay đổi giá không ảnh hưởng hóa đơn cũ'),
    bullet('Giá thuê phòng trong hợp đồng là snapshot — không thay đổi dù phòng cập nhật giá mới'),
    bullet('Tiền cọc khi thanh lý = Cọc − Tổng nợ − Bồi thường (tối thiểu 0, không âm)'),
    bullet('Hủy hợp đồng chỉ được khi ≥2 tháng nợ liên tiếp. Cọc bị tịch thu toàn bộ'),
    bullet('Xóa khu / phòng: chỉ khi toàn bộ phòng trong khu đang trống và không có nợ'),

    para('', { spaceAfter: 160 }),
    h2('C. Liên hệ hỗ trợ'),
    bullet('URL hệ thống: http://localhost:5173 (LAN nội bộ)'),
    bullet('API Backend: http://localhost:3001/api'),
    bullet('Kiểm tra kết nối: http://localhost:3001/api/health'),
  );

  // ─── BUILD DOCUMENT ───────────────────────────────────────────────────────
  return new Document({
    creator: 'Room Rental Management System',
    title: 'Kịch bản Demo — Hệ thống Quản lý Cho thuê Phòng trọ',
    description: 'Tài liệu hướng dẫn demo từng bước cho khách hàng',
    styles: {
      default: {
        document: {
          run: { font: 'Times New Roman', size: 22 },
        },
      },
    },
    sections: [{
      properties: {
        page: {
          margin: { top: 1080, bottom: 1080, left: 1260, right: 1080 },
        },
      },
      children,
    }],
  });
}

// ─── MAIN ────────────────────────────────────────────────────────────────────
async function main() {
  const outDir = path.join(__dirname, '..', 'docs');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const outPath = path.join(outDir, 'demo-script.docx');
  const doc = buildDocument();
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outPath, buffer);
  console.log(`✓ Đã tạo: ${outPath}`);
}

main().catch((err) => { console.error(err); process.exit(1); });
