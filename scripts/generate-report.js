const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow,
  TableCell, WidthType, AlignmentType, BorderStyle, ShadingType,
  PageBreak, TableOfContents,
} = require('docx');
const fs = require('fs');
const path = require('path');

// ─── Helpers ─────────────────────────────────────────────────────────────────

const h1 = (text) =>
  new Paragraph({ text, heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 } });

const h2 = (text) =>
  new Paragraph({ text, heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 150 } });

const h3 = (text) =>
  new Paragraph({ text, heading: HeadingLevel.HEADING_3, spacing: { before: 200, after: 100 } });

const para = (text, opts = {}) =>
  new Paragraph({
    children: [new TextRun({ text, size: 24, ...opts })],
    spacing: { before: 80, after: 80 },
  });

const bullet = (text) =>
  new Paragraph({
    children: [new TextRun({ text, size: 24 })],
    bullet: { level: 0 },
    spacing: { before: 60, after: 60 },
  });

const bold = (text) =>
  new Paragraph({
    children: [new TextRun({ text, bold: true, size: 24 })],
    spacing: { before: 80, after: 80 },
  });

const pageBreak = () =>
  new Paragraph({ children: [new PageBreak()] });

const HEADER_SHADING = { fill: '1677FF', type: ShadingType.CLEAR, color: 'FFFFFF' };
const NO_BORDER = { style: BorderStyle.SINGLE, size: 1, color: 'DDDDDD' };

const makeTable = (headers, rows) => {
  const headerRow = new TableRow({
    children: headers.map(
      (h) =>
        new TableCell({
          children: [
            new Paragraph({
              children: [new TextRun({ text: h, bold: true, color: 'FFFFFF', size: 22 })],
              alignment: AlignmentType.CENTER,
            }),
          ],
          shading: HEADER_SHADING,
          borders: { top: NO_BORDER, bottom: NO_BORDER, left: NO_BORDER, right: NO_BORDER },
        })
    ),
    tableHeader: true,
  });

  const dataRows = rows.map(
    (row, ri) =>
      new TableRow({
        children: row.map(
          (cell) =>
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: String(cell), size: 22 })], spacing: { before: 40, after: 40 } })],
              shading: ri % 2 === 1 ? { fill: 'F5F7FA', type: ShadingType.CLEAR } : undefined,
              borders: { top: NO_BORDER, bottom: NO_BORDER, left: NO_BORDER, right: NO_BORDER },
            })
        ),
      })
  );

  return new Table({
    rows: [headerRow, ...dataRows],
    width: { size: 100, type: WidthType.PERCENTAGE },
    margins: { top: 60, bottom: 60, left: 80, right: 80 },
  });
};

// ─── Document Sections ───────────────────────────────────────────────────────

const coverPage = () => [
  new Paragraph({ spacing: { before: 2000 } }),
  new Paragraph({
    children: [new TextRun({ text: 'BÁO CÁO DỰ ÁN', bold: true, size: 56, color: '1677FF' })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
  }),
  new Paragraph({
    children: [new TextRun({ text: 'HỆ THỐNG QUẢN LÝ CHO THUÊ PHÒNG TRỌ', bold: true, size: 40 })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 400 },
  }),
  new Paragraph({
    children: [new TextRun({ text: 'Room Rental Management System', size: 28, color: '666666', italics: true })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 600 },
  }),
  new Paragraph({
    children: [new TextRun({ text: 'Công nghệ sử dụng:', bold: true, size: 24 })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 120 },
  }),
  new Paragraph({
    children: [new TextRun({ text: 'React 18  ·  Node.js / Express  ·  MongoDB  ·  Ant Design 5  ·  Docker', size: 24, color: '444444' })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 800 },
  }),
  new Paragraph({
    children: [new TextRun({ text: 'Ngày hoàn thành: 11/04/2026', size: 24, color: '666666' })],
    alignment: AlignmentType.CENTER,
  }),
  pageBreak(),
];

const overviewSection = () => [
  h1('1. TỔNG QUAN HỆ THỐNG'),
  h2('1.1 Mô tả'),
  para('Hệ thống Quản lý Cho thuê Phòng trọ là ứng dụng web nội bộ (LAN) dành cho chủ trọ quản lý toàn bộ hoạt động cho thuê phòng. Hệ thống hoạt động không cần internet, một người dùng, không có xác thực đăng nhập.'),
  h2('1.2 Mục tiêu'),
  bullet('Quản lý khu trọ, loại phòng và phòng'),
  bullet('Theo dõi vòng đời phòng: trống → đặt cọc → có hợp đồng → thanh lý'),
  bullet('Lập và quản lý hóa đơn hàng tháng (điện, nước, gửi xe, vệ sinh)'),
  bullet('Thống kê doanh thu, chi phí, lợi nhuận'),
  bullet('Dashboard cảnh báo: hóa đơn quá hạn, hợp đồng sắp hết, nguy cơ hủy HĐ'),
  h2('1.3 Phạm vi chức năng'),
  makeTable(
    ['Module', 'Chức năng', 'Trạng thái'],
    [
      ['M0', 'Khởi tạo dự án (cấu trúc, Docker, Zod schemas)', '✅ Hoàn thành'],
      ['M1', 'Quản lý Khu & Loại phòng', '✅ Hoàn thành'],
      ['M2', 'Quản lý Phòng & Đơn giá dịch vụ', '✅ Hoàn thành'],
      ['M3', 'Quản lý Khách hàng', '✅ Hoàn thành'],
      ['M4', 'Đặt cọc phòng', '✅ Hoàn thành'],
      ['M5', 'Hợp đồng & Người ở', '✅ Hoàn thành'],
      ['M6', 'Hóa đơn & Thanh toán', '✅ Hoàn thành'],
      ['M7', 'Thanh lý & Hủy hợp đồng', '✅ Hoàn thành'],
      ['M8', 'Sửa chữa phòng', '⏳ Chưa làm'],
      ['M9', 'Chi phí vận hành', '⏳ Chưa làm'],
      ['M10', 'Dashboard & Thống kê / Báo cáo', '✅ Hoàn thành'],
    ]
  ),
];

const architectureSection = () => [
  pageBreak(),
  h1('2. KIẾN TRÚC HỆ THỐNG'),
  h2('2.1 Sơ đồ 3 tầng'),
  makeTable(
    ['Tầng', 'Công nghệ', 'Vai trò'],
    [
      ['Frontend (Presentation)', 'React 18 + Vite + Ant Design 5', 'SPA, giao diện người dùng, quản lý state với TanStack Query v5'],
      ['Backend (Application)', 'Node.js + Express + Mongoose', 'REST API, xử lý nghiệp vụ, validate Zod, Winston logger'],
      ['Database (Data)', 'MongoDB (Mongoose ODM)', '13 collections, append-only patterns, snapshot fields'],
    ]
  ),
  new Paragraph({ spacing: { before: 200 } }),
  h2('2.2 Tech Stack chi tiết'),
  makeTable(
    ['Layer', 'Thư viện / Công nghệ', 'Phiên bản'],
    [
      ['Frontend', 'React', '^18.3.1'],
      ['Frontend', 'Ant Design', '^5.18.0'],
      ['Frontend', 'TanStack Query', '^5.40.0'],
      ['Frontend', 'React Hook Form + Zod', '^7.52 / ^3.23'],
      ['Frontend', 'Recharts', '^2.12.7'],
      ['Frontend', 'Day.js + Axios', '^1.11 / ^1.7'],
      ['Backend', 'Express', 'latest'],
      ['Backend', 'Mongoose', 'latest'],
      ['Backend', 'Zod (shared schemas)', '^3.23.8'],
      ['Backend', 'Winston + Morgan', 'latest'],
      ['Backend', 'Puppeteer (PDF)', 'planned'],
      ['Backend', 'ExcelJS (Excel)', 'planned'],
      ['DevOps', 'Docker Compose', '–'],
      ['DevOps', 'PM2 (ecosystem.config.js)', '–'],
      ['DevOps', 'Nginx (client serve)', '–'],
    ]
  ),
  new Paragraph({ spacing: { before: 200 } }),
  h2('2.3 Request Pipeline'),
  para('Mọi request đều đi qua pipeline chuẩn hóa:'),
  bullet('Morgan (HTTP logging)'),
  bullet('cors (cho phép origin client)'),
  bullet('helmet (HTTP security headers)'),
  bullet('express.json (parse body)'),
  bullet('Router → validate(Zod) → Controller → Service → Mongoose → DB'),
  bullet('Global errorHandler: trả về { success: false, error: "..." }'),
  para('Mọi response thành công: { success: true, data: ... }'),
  h2('2.4 Cấu trúc thư mục'),
  makeTable(
    ['Đường dẫn', 'Mô tả'],
    [
      ['client/src/api/', 'Axios functions – 1 file per domain (hopDong.api.js, ...)'],
      ['client/src/hooks/', 'TanStack Query wrappers (useQuery + useMutation)'],
      ['client/src/pages/', '1 thư mục/domain, 1 file/route'],
      ['client/src/components/', 'Shared UI: StatusBadge, HuyDatCocModal, ...'],
      ['server/src/models/', 'Mongoose schemas (13 files)'],
      ['server/src/routes/', 'Express routers'],
      ['server/src/controllers/', 'Parse req → call service → send res (no business logic)'],
      ['server/src/services/', 'Toàn bộ business logic (không biết về HTTP)'],
      ['server/src/middlewares/', 'validate.js (Zod) · errorHandler.js'],
      ['server/src/config/', 'db.js · logger.js (Winston + Morgan)'],
      ['shared/schemas/', 'Zod schemas dùng chung giữa client và server'],
      ['docs/', 'Tài liệu thiết kế (8 files)'],
    ]
  ),
];

const databaseSection = () => [
  pageBreak(),
  h1('3. THIẾT KẾ CƠ SỞ DỮ LIỆU'),
  para('MongoDB với 13 collections. Quy ước: tên collection chữ thường + số nhiều, tên trường snake_case.'),
  h2('3.1 Quan hệ giữa các collection'),
  bullet('Khu 1:N Phong (một khu có nhiều phòng)'),
  bullet('LoaiPhong 1:N Phong (một loại phòng có nhiều phòng)'),
  bullet('Phong 1:N DatCoc, HopDong, SuaChua, LichSuGiaThuPhong'),
  bullet('KhachHang 1:N DatCoc, HopDong'),
  bullet('HopDong 1:N NguoiO, HoaDon, LichSuGiaHan'),
  bullet('LoaiPhong 1:N DonGiaDichVu (loai_phong_id nullable cho dịch vụ chung)'),
  bullet('Khu 1:N ChiPhiVanHanh (khu_id nullable cho chi phí toàn bộ)'),
  new Paragraph({ spacing: { before: 200 } }),
  h2('3.2 Chi tiết các collection'),

  h3('phongs'),
  makeTable(
    ['Trường', 'Kiểu', 'Ràng buộc'],
    [
      ['_id', 'ObjectId', 'PK'],
      ['ten', 'String', 'required; unique cùng khu_id'],
      ['khu_id', 'ObjectId → Khu', 'required'],
      ['loai_phong_id', 'ObjectId → LoaiPhong', 'required'],
      ['gia_thue', 'Number', 'required, > 0'],
      ['trang_thai', 'String', 'enum: trong|cho_thue|dat_coc|sua_chua'],
      ['chi_so_dien_dau', 'Number', 'default: 0'],
      ['chi_so_nuoc_dau', 'Number', 'default: 0'],
    ]
  ),
  new Paragraph({ spacing: { before: 160 } }),

  h3('hop_dong'),
  makeTable(
    ['Trường', 'Kiểu', 'Ràng buộc'],
    [
      ['phong_id', 'ObjectId → Phong', 'required'],
      ['khach_hang_id', 'ObjectId → KhachHang', 'required'],
      ['ngay_bat_dau', 'Date', 'required'],
      ['ngay_het_han', 'Date', 'required'],
      ['gia_thue_ky_hop_dong', 'Number', 'snapshot giá thuê lúc ký'],
      ['tien_dat_coc', 'Number', 'required, = 1 tháng thuê'],
      ['so_nguoi_o', 'Number', 'required, ≥ 1'],
      ['trang_thai', 'String', 'enum: hieu_luc|thanh_ly|huy'],
    ]
  ),
  new Paragraph({ spacing: { before: 160 } }),

  h3('hoa_don'),
  makeTable(
    ['Trường', 'Kiểu', 'Ghi chú'],
    [
      ['hop_dong_id', 'ObjectId → HopDong', 'required'],
      ['thang, nam', 'Number', 'kỳ hóa đơn; unique(hop_dong_id, thang, nam)'],
      ['chi_so_dien_cu/moi', 'Number', 'chỉ số công tơ'],
      ['chi_so_nuoc_cu/moi', 'Number', 'chỉ số đồng hồ nước'],
      ['so_xe_may, so_xe_dap', 'Number', 'số lượng xe gửi'],
      ['don_gia_*', 'Number', 'snapshot đơn giá tại thời điểm lập'],
      ['so_nguoi_o', 'Number', 'snapshot số người ở trong tháng'],
      ['no_thang_truoc', 'Number', 'cộng dồn từ các HĐ chưa thanh toán'],
      ['tong_tien', 'Number', 'tổng tất cả khoản'],
      ['trang_thai', 'String', 'enum: chua_thanh_toan|da_thanh_toan'],
    ]
  ),
  new Paragraph({ spacing: { before: 160 } }),

  h3('Các collection phụ'),
  makeTable(
    ['Collection', 'Mục đích', 'Đặc điểm'],
    [
      ['khachhangs', 'Hồ sơ khách hàng', 'cmnd unique; không xóa được'],
      ['datcoc', 'Đặt cọc giữ phòng', 'Trạng thái: con_hieu_luc → da_chuyen_hop_dong/huy'],
      ['nguoio', 'Người ở trong HĐ', 'ngay_ket_thuc null = đang ở'],
      ['donggiadichvu', 'Đơn giá dịch vụ', 'Append-only; ngay_ap_dung; loai_phong_id nullable'],
      ['lichsugiathuphong', 'Lịch sử giá thuê phòng', 'Append-only; tự động ghi khi đổi giá'],
      ['lichsugiahan', 'Lịch sử gia hạn HĐ', 'Ghi mỗi lần gia hạn'],
      ['suachua', 'Yêu cầu sửa chữa phòng', 'Kích hoạt chuyển trạng thái phòng → sua_chua'],
      ['chiphivanhanh', 'Chi phí vận hành hàng tháng', 'khu_id nullable (null = áp dụng toàn bộ)'],
      ['canhbaodaxem', 'Theo dõi cảnh báo đã xem', 'Index: (loai_canh_bao, tham_chieu_id, ngay_xem)'],
    ]
  ),
];

const modulesSection = () => [
  pageBreak(),
  h1('4. CHI TIẾT CÁC MODULE ĐÃ TRIỂN KHAI'),

  h2('Module 0 — Khởi tạo dự án'),
  bullet('Cấu trúc thư mục đầy đủ: client/, server/, shared/schemas/, docs/'),
  bullet('Docker Compose: 3 service (mongo, server, client/nginx)'),
  bullet('PM2 config (ecosystem.config.js) cho production'),
  bullet('Vite proxy: /api → http://localhost:3001'),
  bullet('Shared Zod schemas: validate một lần, dùng cả server (middleware) lẫn client (React Hook Form)'),
  bullet('Winston logger + Morgan HTTP logging'),

  h2('Module 1 — Quản lý Khu & Loại phòng'),
  makeTable(
    ['Thành phần', 'File', 'Chức năng'],
    [
      ['BE Service', 'khu.service.js', 'CRUD khu; tổng hợp số phòng theo trạng thái'],
      ['BE Service', 'loaiPhong.service.js', 'CRUD loại phòng'],
      ['FE Page', 'KhuPage.jsx', 'Danh sách khu, add/edit modal, xóa'],
      ['FE Page', 'LoaiPhongPage.jsx', 'Danh sách loại phòng + DonGiaSection (M2)'],
    ]
  ),

  h2('Module 2 — Phòng & Đơn giá dịch vụ'),
  bullet('Backend: append-only DonGiaDichVu với ngay_ap_dung — lấy giá hiệu lực bằng query sort -ngay_ap_dung limit 1'),
  bullet('getDonGiaHieuLuc(loai_phong_id, loai_dv, ngay) — hàm export, được dùng lại bởi M6'),
  bullet('Tự động ghi LichSuGiaThuPhong khi đổi gia_thue phòng'),
  bullet('Xóa phòng: chỉ được khi trang_thai = trong và không có hóa đơn chưa thanh toán'),
  bullet('Frontend: PhongPage với filter khu/trạng thái, Drawer lịch sử giá, nút Hủy đặt cọc'),
  bullet('Frontend: StatusBadge component dùng chung cho phong/hop_dong/hoa_don/dat_coc'),

  h2('Module 3 — Khách hàng'),
  bullet('Search: regex trên ho_ten và cmnd, debounce 300ms trên FE'),
  bullet('CMND bất biến: loại khỏi khachHangUpdateSchema (enforce ở schema-level, không ở controller)'),
  bullet('getById: deep populate phong_id → khu_id + aggregation tổng nợ theo phòng'),
  bullet('FE KhachHangDetailPage: lịch sử hợp đồng + bảng nợ theo phòng'),

  h2('Module 4 — Đặt cọc'),
  bullet('Luồng trạng thái: trong → dat_coc (khi đặt cọc) → trong (hủy) / cho_thue (ký HĐ)'),
  bullet('Tiền đặt cọc = 1 tháng thuê'),
  bullet('getActiveByPhong(phong_id) — API riêng để HuyDatCocModal tự fetch active deposit'),
  bullet('DatCocWizard: 3 bước (chọn phòng → khách hàng+tiền cọc → xác nhận)'),

  h2('Module 5 — Hợp đồng & Người ở'),
  bullet('Snapshot gia_thue_ky_hop_dong và tien_dat_coc lúc tạo HĐ'),
  bullet('Khi ký HĐ từ phòng đặt cọc: DatCoc tự động chuyển → da_chuyen_hop_dong'),
  bullet('Validate: ngay_bat_dau ≤ 30 ngày trước hôm nay; ngay_het_han ≥ ngay_bat_dau + 1 tháng'),
  bullet('getSoNguoiOTrongThang(hop_dong_id, thang, nam) — hàm export, dùng bởi M6'),
  bullet('NguoiO: thêm/sửa ngày kết thúc/xóa từ HopDongDetailPage'),
  bullet('FE HopDongWizard: 3 bước (chọn phòng trống → Form.List người ở + ngày → xác nhận)'),

  h2('Module 6 — Hóa đơn & Thanh toán'),
  para('Công thức tính tiền phòng pro-rata:'),
  bullet('Tháng đầu (vào sau ngày 1): (ngày_ở / tổng_ngày_tháng) × giá_thuê, làm tròn 1,000đ'),
  bullet('Tháng cuối (ra trước ngày cuối): (ngày_đến_khi_kết_thúc / tổng_ngày_tháng) × giá_thuê'),
  bullet('Các tháng giữa: tính nguyên tháng'),
  para('6 khoản trong hóa đơn:'),
  makeTable(
    ['Khoản', 'Cách tính'],
    [
      ['Tiền phòng', 'Pro-rata hoặc nguyên tháng theo gia_thue_ky_hop_dong'],
      ['Điện', '(chi_so_dien_moi - chi_so_dien_cu) × don_gia_dien'],
      ['Nước', '(chi_so_nuoc_moi - chi_so_nuoc_cu) × don_gia_nuoc'],
      ['Vệ sinh', 'so_nguoi_o_trong_thang × don_gia_ve_sinh'],
      ['Xe máy', 'so_xe_may × don_gia_xe_may'],
      ['Xe đạp', 'so_xe_dap × don_gia_xe_dap'],
    ]
  ),
  new Paragraph({ spacing: { before: 120 } }),
  bullet('chi_so_cu lấy từ hóa đơn tháng trước hoặc Phong.chi_so_*_dau (nếu là HĐ đầu tiên)'),
  bullet('Tất cả đơn giá và so_nguoi_o được snapshot tại thời điểm lập HĐ'),
  bullet('tinhTruoc: preview không lưu — FE disable nút Xác nhận cho đến khi có preview'),

  h2('Module 7 — Thanh lý & Hủy hợp đồng'),
  bullet('Thanh lý: tien_hoan_coc = max(0, tien_dat_coc − tong_no − tien_boi_thuong)'),
  bullet('Thanh lý chuyển phòng → trong, ghi ngay_tra và ghi_chu_hu_hong'),
  bullet('Hủy HĐ: kiểm tra ≥ 2 tháng nợ liên tiếp bằng (nam × 12 + thang) arithmetic'),
  bullet('Hủy: tiền đặt cọc bị tịch thu, phòng → trong'),
  bullet('FE ThanhLyPage: 2 tab (Thanh lý / Hủy HĐ), hỗ trợ ?hop_dong_id= từ HopDongDetailPage'),

  h2('Module 10 — Dashboard & Thống kê / Báo cáo'),
  para('Dashboard KPI:'),
  makeTable(
    ['KPI', 'Nguồn dữ liệu'],
    [
      ['Doanh thu tháng này', 'SUM(HoaDon.tong_tien) WHERE da_thanh_toan AND ngay_thanh_toan trong tháng'],
      ['HĐ sắp hết hạn', 'COUNT(HopDong) WHERE hieu_luc AND ngay_het_han ≤ now + 30 ngày'],
      ['Phòng sửa chữa', 'COUNT(Phong) WHERE trang_thai = sua_chua'],
      ['Tỉ lệ lấp đầy', 'GROUP BY khu: so_phong_thue / tong_so_phong'],
    ]
  ),
  new Paragraph({ spacing: { before: 120 } }),
  para('5 loại cảnh báo (lọc qua CanhBaoDaXem đã xem hôm nay):'),
  bullet('Phòng trống chưa có hợp đồng'),
  bullet('Hóa đơn quá hạn thanh toán'),
  bullet('Hóa đơn sắp đến hạn (≤ 3 ngày)'),
  bullet('Nguy cơ hủy hợp đồng (≥ 2 tháng nợ liên tiếp)'),
  bullet('Hợp đồng sắp hết hạn (30 ngày)'),
  para('Thống kê & Báo cáo (4 tab):'),
  bullet('Thống kê doanh thu: theo tháng/quý/năm, BarChart 3 series, drill-down hóa đơn'),
  bullet('Công suất phòng: tổng quát + theo khu, LineChart xu hướng theo tháng'),
  bullet('Báo cáo nợ: expandable table khách hàng → chi tiết phòng + tháng nợ liên tiếp'),
  bullet('Doanh thu theo phòng: filter khu + khoảng tháng, horizontal BarChart top 15'),
];

const dependenciesSection = () => [
  pageBreak(),
  h1('5. PHỤ THUỘC GIỮA CÁC MODULE'),

  h2('5.1 Cross-module exported functions'),
  makeTable(
    ['Hàm export', 'Từ service', 'Được dùng bởi', 'Mục đích'],
    [
      ['getDonGiaHieuLuc(loai_phong_id, loai_dv, ngay)', 'donGia.service.js', 'hoaDon.service.js', 'Lấy đơn giá hiệu lực tại ngày lập HĐ'],
      ['getSoNguoiOTrongThang(hop_dong_id, thang, nam)', 'nguoiO.service.js', 'hoaDon.service.js', 'Đếm người ở trong tháng (overlapping dates)'],
    ]
  ),
  new Paragraph({ spacing: { before: 200 } }),

  h2('5.2 Cross-module React hooks'),
  makeTable(
    ['Hook', 'Từ file', 'Được dùng bởi'],
    [
      ['useKhachHangSearch', 'useKhachHang.js', 'DatCocWizard (M4), HopDongWizard (M5)'],
      ['usePhongsTrong', 'usePhong.js', 'DatCocWizard (M4), HopDongWizard (M5)'],
    ]
  ),
  new Paragraph({ spacing: { before: 200 } }),

  h2('5.3 Máy trạng thái phòng'),
  makeTable(
    ['Từ trạng thái', 'Sang trạng thái', 'Trigger'],
    [
      ['trong', 'dat_coc', 'Tạo đặt cọc (M4)'],
      ['trong', 'cho_thue', 'Ký hợp đồng không qua đặt cọc (M5)'],
      ['trong', 'sua_chua', 'Tạo yêu cầu sửa chữa (M8)'],
      ['dat_coc', 'cho_thue', 'Ký hợp đồng từ đặt cọc (M5)'],
      ['dat_coc', 'trong', 'Hủy đặt cọc (M4)'],
      ['cho_thue', 'trong', 'Thanh lý hoặc Hủy hợp đồng (M7)'],
      ['sua_chua', 'trong', 'Hoàn thành sửa chữa (M8)'],
    ]
  ),
];

const apiSection = () => [
  pageBreak(),
  h1('6. DANH SÁCH API ENDPOINTS'),

  h2('Khu — /api/khu'),
  makeTable(['Method', 'Path', 'Mô tả'], [
    ['GET', '/api/khu', 'Lấy danh sách tất cả khu'],
    ['POST', '/api/khu', 'Tạo khu mới'],
    ['PUT', '/api/khu/:id', 'Cập nhật khu'],
    ['DELETE', '/api/khu/:id', 'Xóa khu'],
  ]),
  new Paragraph({ spacing: { before: 160 } }),

  h2('Loại phòng — /api/loai-phong'),
  makeTable(['Method', 'Path', 'Mô tả'], [
    ['GET', '/api/loai-phong', 'Lấy danh sách loại phòng'],
    ['POST', '/api/loai-phong', 'Tạo loại phòng mới'],
    ['PUT', '/api/loai-phong/:id', 'Cập nhật loại phòng'],
    ['DELETE', '/api/loai-phong/:id', 'Xóa loại phòng'],
  ]),
  new Paragraph({ spacing: { before: 160 } }),

  h2('Phòng — /api/phong'),
  makeTable(['Method', 'Path', 'Mô tả'], [
    ['GET', '/api/phong', 'Danh sách phòng (filter: khu_id, trang_thai)'],
    ['GET', '/api/phong/trong', 'Phòng đang trống (kèm đơn giá hiện tại)'],
    ['GET', '/api/phong/:id', 'Chi tiết phòng'],
    ['GET', '/api/phong/:id/lich-su-gia', 'Lịch sử giá thuê'],
    ['POST', '/api/phong', 'Tạo phòng mới'],
    ['PUT', '/api/phong/:id', 'Cập nhật phòng'],
    ['DELETE', '/api/phong/:id', 'Xóa phòng (chỉ khi trống)'],
  ]),
  new Paragraph({ spacing: { before: 160 } }),

  h2('Đơn giá — /api/don-gia'),
  makeTable(['Method', 'Path', 'Mô tả'], [
    ['GET', '/api/don-gia', 'Đơn giá hiện tại (theo loai_phong_id, loai_dv)'],
    ['GET', '/api/don-gia/lich-su', 'Lịch sử đơn giá'],
    ['POST', '/api/don-gia', 'Thêm mức giá mới (append-only)'],
  ]),
  new Paragraph({ spacing: { before: 160 } }),

  h2('Khách hàng — /api/khach-hang'),
  makeTable(['Method', 'Path', 'Mô tả'], [
    ['GET', '/api/khach-hang', 'Danh sách (filter: q search)'],
    ['GET', '/api/khach-hang/:id', 'Chi tiết + lịch sử HĐ + nợ theo phòng'],
    ['POST', '/api/khach-hang', 'Tạo khách hàng'],
    ['PUT', '/api/khach-hang/:id', 'Cập nhật (không đổi CMND)'],
  ]),
  new Paragraph({ spacing: { before: 160 } }),

  h2('Đặt cọc — /api/dat-coc'),
  makeTable(['Method', 'Path', 'Mô tả'], [
    ['GET', '/api/dat-coc/phong/:phong_id', 'Đặt cọc còn hiệu lực của phòng'],
    ['POST', '/api/dat-coc', 'Tạo đặt cọc (phòng → dat_coc)'],
    ['PUT', '/api/dat-coc/:id/huy', 'Hủy đặt cọc (phòng → trong)'],
  ]),
  new Paragraph({ spacing: { before: 160 } }),

  h2('Hợp đồng — /api/hop-dong'),
  makeTable(['Method', 'Path', 'Mô tả'], [
    ['GET', '/api/hop-dong', 'Danh sách (filter: trang_thai, khu_id, dates, q)'],
    ['GET', '/api/hop-dong/:id', 'Chi tiết + người ở + HĐ chưa TT + lịch sử gia hạn'],
    ['POST', '/api/hop-dong', 'Tạo hợp đồng (kèm nguoi_o_ban_dau)'],
    ['PUT', '/api/hop-dong/:id/gia-han', 'Gia hạn hợp đồng'],
    ['GET', '/api/hop-dong/:id/lich-su-gia-han', 'Lịch sử gia hạn'],
    ['POST', '/api/hop-dong/:id/nguoi-o', 'Thêm người ở'],
    ['PUT', '/api/hop-dong/:id/thanh-ly', 'Thanh lý hợp đồng'],
    ['PUT', '/api/hop-dong/:id/huy', 'Hủy hợp đồng'],
  ]),
  new Paragraph({ spacing: { before: 160 } }),

  h2('Người ở — /api/nguoi-o'),
  makeTable(['Method', 'Path', 'Mô tả'], [
    ['PUT', '/api/nguoi-o/:id', 'Cập nhật ngày kết thúc'],
    ['DELETE', '/api/nguoi-o/:id', 'Xóa người ở'],
  ]),
  new Paragraph({ spacing: { before: 160 } }),

  h2('Hóa đơn — /api/hoa-don'),
  makeTable(['Method', 'Path', 'Mô tả'], [
    ['GET', '/api/hoa-don', 'Danh sách (filter: trang_thai, thang, nam)'],
    ['GET', '/api/hoa-don/cho-lap', 'HĐ đang thuê chưa có hóa đơn tháng này'],
    ['GET', '/api/hoa-don/tinh-truoc', 'Preview tính tiền không lưu'],
    ['POST', '/api/hoa-don', 'Lập hóa đơn'],
    ['PUT', '/api/hoa-don/:id/thanh-toan', 'Ghi nhận thanh toán'],
  ]),
  new Paragraph({ spacing: { before: 160 } }),

  h2('Dashboard — /api/dashboard'),
  makeTable(['Method', 'Path', 'Mô tả'], [
    ['GET', '/api/dashboard/kpi', '4 KPI: doanh thu tháng, HĐ sắp hết, phòng SC, tỉ lệ lấp đầy'],
    ['GET', '/api/dashboard/canh-bao', '5 loại cảnh báo (lọc đã xem hôm nay)'],
    ['PUT', '/api/dashboard/canh-bao/:loai/:id/da-xem', 'Đánh dấu đã xem cảnh báo'],
  ]),
  new Paragraph({ spacing: { before: 160 } }),

  h2('Thống kê — /api/thong-ke'),
  makeTable(['Method', 'Path', 'Mô tả'], [
    ['GET', '/api/thong-ke', 'Doanh thu/Chi phí/Lợi nhuận (params: loai, tu, den)'],
    ['GET', '/api/thong-ke/:ky/hoa-don', 'DS hóa đơn đã thanh toán của kỳ'],
  ]),
  new Paragraph({ spacing: { before: 160 } }),

  h2('Báo cáo — /api/bao-cao'),
  makeTable(['Method', 'Path', 'Mô tả'], [
    ['GET', '/api/bao-cao/cong-suat', 'Công suất phòng (tổng quát + theo khu + lịch sử tháng)'],
    ['GET', '/api/bao-cao/no', 'Nợ theo khách hàng + chi tiết theo phòng'],
    ['GET', '/api/bao-cao/doanh-thu-theo-phong', 'Doanh thu từng phòng (filter: tu, den, khu_id)'],
  ]),
];

const patternsSection = () => [
  pageBreak(),
  h1('7. CÁC PATTERN KỸ THUẬT NỔI BẬT'),

  h2('7.1 Shared Zod Schemas'),
  para('Tất cả validation logic được viết một lần trong shared/schemas/ và dùng ở cả hai đầu:'),
  bullet('Server: middlewares/validate.js nhận schema, validate req.body, trả 400 nếu lỗi'),
  bullet('Client: useForm({ resolver: zodResolver(schema) }) từ React Hook Form'),
  para('Ví dụ: khachHangUpdateSchema loại trường cmnd để enforce CMND bất biến ở schema-level.'),

  h2('7.2 Append-Only Collections'),
  para('DonGiaDichVu và LichSuGiaThuPhong không bao giờ được UPDATE hay DELETE.'),
  bullet('Để lấy giá hiệu lực: query ngay_ap_dung ≤ target_date, sort -ngay_ap_dung, limit 1'),
  bullet('Bảo toàn toàn bộ lịch sử thay đổi giá'),

  h2('7.3 Snapshot Fields'),
  para('Các trường snapshot được ghi tại thời điểm tạo, không bao giờ recompute:'),
  bullet('HopDong.gia_thue_ky_hop_dong — giá thuê lúc ký HĐ'),
  bullet('HoaDon.don_gia_* — tất cả đơn giá tại thời điểm lập HĐ'),
  bullet('HoaDon.so_nguoi_o — số người ở trong tháng tại thời điểm lập HĐ'),
  para('Mục đích: in lại hóa đơn cũ vẫn chính xác dù đơn giá đã thay đổi.'),

  h2('7.4 TanStack Query Invalidation Map'),
  makeTable(
    ['Mutation', 'Invalidate keys'],
    [
      ['createPhong / deletePhong', "['phongs'], ['khus']"],
      ['updatePhong', "['phongs'], ['phong', id], ['lichSuGia', id]"],
      ['createDonGia', "['donGia', loai_phong_id], ['donGiaLichSu']"],
      ['createKhachHang', "['khachHangs']"],
      ['createDatCoc', "['phongs'], ['phongsTrong'], ['khachHang', id]"],
      ['huyDatCoc', "['phongs'], ['phongsTrong'], ['khachHangs']"],
      ['createHopDong', "['hopDongs'], ['phongs'], ['phongsTrong']"],
      ['thanhLy / huyHopDong', "['hopDongs'], ['hopDong', id], ['phongs']"],
      ['createHoaDon', "['hoaDons'], ['hoaDonChoLap'], ['hopDong']"],
      ['thanhToan', "['hoaDons'], ['hopDong']"],
      ['markSeen', "['canhBao']"],
    ]
  ),

  h2('7.5 Express Route Ordering'),
  para('Static paths PHẢI khai báo trước param paths để tránh bị capture nhầm:'),
  bullet('/api/phong/trong → /api/phong/:id/lich-su-gia → /api/phong/:id'),
  bullet('/api/don-gia/lich-su → /api/don-gia/'),
  bullet('/api/dat-coc/phong/:phong_id → /api/dat-coc/:id/huy'),
  bullet('/api/hoa-don/cho-lap → /api/hoa-don/tinh-truoc → /api/hoa-don/:id/thanh-toan'),
  para('React Router v6: /hop-dong/tao phải khai báo trước /hop-dong/:id trong App.jsx.'),
];

const statusSection = () => [
  pageBreak(),
  h1('8. TRẠNG THÁI DỰ ÁN & BƯỚC TIẾP THEO'),

  h2('8.1 Tổng kết tiến độ'),
  makeTable(
    ['Hạng mục', 'Chi tiết', 'Trạng thái'],
    [
      ['Kiến trúc & thiết kế', '3-tier stack, 13 Mongoose models, 8 docs thiết kế', '✅'],
      ['Module 0-1', 'Bootstrap, Docker, Khu, LoaiPhong', '✅'],
      ['Module 2', 'Phòng, Đơn giá, StatusBadge', '✅'],
      ['Module 3', 'Khách hàng, search, detail page', '✅'],
      ['Module 4', 'Đặt cọc, DatCocWizard, HuyDatCocModal', '✅'],
      ['Module 5', 'Hợp đồng, NguoiO, Wizard, Detail', '✅'],
      ['Module 6', 'Hóa đơn, tinhTruoc, Thanh toán', '✅'],
      ['Module 7', 'Thanh lý, Hủy HĐ', '✅'],
      ['Module 8', 'Sửa chữa phòng', '⏳ Chưa làm'],
      ['Module 9', 'Chi phí vận hành', '⏳ Chưa làm'],
      ['Module 10', 'Dashboard, Thống kê, Báo cáo', '✅'],
    ]
  ),
  new Paragraph({ spacing: { before: 200 } }),

  h2('8.2 Module chưa triển khai'),
  bold('Module 8 — Sửa chữa phòng'),
  bullet('Backend: SuaChua model đã có; cần service/controller/routes'),
  bullet('Luồng: tạo yêu cầu → phòng → sua_chua → hoàn thành → phòng → trong'),
  bullet('Frontend: SuaChuaPage, danh sách yêu cầu, form tạo mới'),
  bold('Module 9 — Chi phí vận hành'),
  bullet('Backend: ChiPhiVanHanh model đã có; cần CRUD service/controller/routes'),
  bullet('khu_id nullable: null = chi phí áp dụng toàn bộ'),
  bullet('Frontend: ChiPhiVanHanhPage, filter theo khu + tháng'),
  bullet('Liên kết với Module 10: dùng cho tính lợi nhuận trong thống kê'),
];

// ─── Build & Write ────────────────────────────────────────────────────────────

const doc = new Document({
  creator: 'Room Rental Management System',
  title: 'Báo cáo Dự án Hệ thống Quản lý Cho thuê Phòng trọ',
  description: 'Tổng hợp toàn bộ quá trình thiết kế và phát triển hệ thống',
  styles: {
    default: {
      document: { run: { font: 'Times New Roman', size: 24 } },
    },
    paragraphStyles: [
      {
        id: 'Heading1',
        name: 'Heading 1',
        run: { bold: true, size: 36, color: '1677FF', font: 'Times New Roman' },
        paragraph: { spacing: { before: 400, after: 200 } },
      },
      {
        id: 'Heading2',
        name: 'Heading 2',
        run: { bold: true, size: 28, color: '333333', font: 'Times New Roman' },
        paragraph: { spacing: { before: 300, after: 150 } },
      },
      {
        id: 'Heading3',
        name: 'Heading 3',
        run: { bold: true, size: 26, color: '555555', font: 'Times New Roman' },
        paragraph: { spacing: { before: 200, after: 100 } },
      },
    ],
  },
  sections: [
    {
      children: [
        ...coverPage(),
        ...overviewSection(),
        ...architectureSection(),
        ...databaseSection(),
        ...modulesSection(),
        ...dependenciesSection(),
        ...apiSection(),
        ...patternsSection(),
        ...statusSection(),
      ],
    },
  ],
});

const outDir = path.join(__dirname, '..', 'docx');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

Packer.toBuffer(doc).then((buffer) => {
  const outPath = path.join(outDir, 'BaoCaoDuAn.docx');
  fs.writeFileSync(outPath, buffer);
  console.log(`✅ Đã tạo: ${outPath}`);
  console.log(`   Kích thước: ${(buffer.length / 1024).toFixed(1)} KB`);
});
