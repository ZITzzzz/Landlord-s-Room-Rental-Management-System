const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const HopDong = require('../models/HopDong');
const HoaDon = require('../models/HoaDon');
const NguoiO = require('../models/NguoiO');
const Phong = require('../models/Phong');

const BASE_HTML = fs.readFileSync(path.join(__dirname, '../templates/base.html'), 'utf8');

const fmt = (n) => (n != null ? n.toLocaleString('vi-VN') : '—');
const fmtDate = (d) => {
  if (!d) return '—';
  const dt = new Date(d);
  return `${String(dt.getDate()).padStart(2, '0')}/${String(dt.getMonth() + 1).padStart(2, '0')}/${dt.getFullYear()}`;
};
const today = () => fmtDate(new Date());

const renderPDF = async (html) => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const buffer = await page.pdf({ format: 'A4', printBackground: true, margin: { top: '10mm', bottom: '10mm', left: '10mm', right: '10mm' } });
    return buffer;
  } finally {
    await browser.close();
  }
};

const buildPage = (content) => BASE_HTML.replace('{{CONTENT}}', content);

// ─── Hop Dong PDF ──────────────────────────────────────────────────────────────
const hopDongPDF = async (id) => {
  const hd = await HopDong.findById(id)
    .populate({ path: 'phong_id', populate: { path: 'khu_id', select: 'ten dia_chi' } })
    .populate('khach_hang_id')
    .lean();
  if (!hd) throw Object.assign(new Error('Không tìm thấy hợp đồng'), { status: 404 });

  const nguoiO = await NguoiO.find({ hop_dong_id: id, ngay_ket_thuc: null }).lean();
  const phong = hd.phong_id;
  const kh = hd.khach_hang_id;

  const nguoiORows = nguoiO.map((n, i) => `
    <tr><td>${i + 1}</td><td>${n.ho_ten}</td><td>${n.cmnd || '—'}</td><td>${fmtDate(n.ngay_bat_dau)}</td></tr>
  `).join('');

  const content = `
    <div class="header-org">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
    <div class="subtitle">Độc lập – Tự do – Hạnh phúc</div>
    <h1>Hợp đồng thuê phòng</h1>
    <div class="date-line">Ngày lập: ${today()}</div>

    <div class="section-title">I. THÔNG TIN PHÒNG</div>
    <table class="info">
      <tr><td>Tên phòng:</td><td>${phong?.ten || '—'}</td></tr>
      <tr><td>Khu:</td><td>${phong?.khu_id?.ten || '—'}</td></tr>
      <tr><td>Địa chỉ:</td><td>${phong?.khu_id?.dia_chi || '—'}</td></tr>
      <tr><td>Giá thuê/tháng:</td><td>${fmt(hd.gia_thue_ky_hop_dong)} đ</td></tr>
    </table>

    <div class="section-title">II. THÔNG TIN KHÁCH HÀNG</div>
    <table class="info">
      <tr><td>Họ tên:</td><td>${kh?.ho_ten || '—'}</td></tr>
      <tr><td>CMND/CCCD:</td><td>${kh?.cmnd || '—'}</td></tr>
      <tr><td>Số điện thoại:</td><td>${kh?.so_dien_thoai || '—'}</td></tr>
      <tr><td>Quê quán:</td><td>${kh?.que_quan || '—'}</td></tr>
    </table>

    <div class="section-title">III. ĐIỀU KHOẢN HỢP ĐỒNG</div>
    <table class="info">
      <tr><td>Ngày bắt đầu:</td><td>${fmtDate(hd.ngay_bat_dau)}</td></tr>
      <tr><td>Ngày hết hạn:</td><td>${fmtDate(hd.ngay_het_han)}</td></tr>
      <tr><td>Tiền đặt cọc:</td><td>${fmt(hd.tien_dat_coc)} đ</td></tr>
      <tr><td>Số người ở:</td><td>${hd.so_nguoi_o}</td></tr>
    </table>

    ${nguoiO.length > 0 ? `
    <div class="section-title">IV. DANH SÁCH NGƯỜI Ở</div>
    <table class="data">
      <tr><th>#</th><th>Họ tên</th><th>CMND/CCCD</th><th>Ngày bắt đầu</th></tr>
      ${nguoiORows}
    </table>` : ''}

    <div class="sig-row">
      <div class="sig-box">
        <p>BÊN CHO THUÊ</p>
        <p class="note">(Ký, ghi rõ họ tên)</p>
        <div class="sig-line"></div>
      </div>
      <div class="sig-box">
        <p>BÊN THUÊ</p>
        <p class="note">(Ký, ghi rõ họ tên)</p>
        <div class="sig-line"></div>
        <div class="sig-name">${kh?.ho_ten || ''}</div>
      </div>
    </div>
  `;

  return renderPDF(buildPage(content));
};

// ─── Hoa Don PDF ───────────────────────────────────────────────────────────────
const hoaDonPDF = async (id) => {
  const hd = await HoaDon.findById(id)
    .populate({
      path: 'hop_dong_id',
      populate: [
        { path: 'phong_id', select: 'ten', populate: { path: 'khu_id', select: 'ten' } },
        { path: 'khach_hang_id', select: 'ho_ten so_dien_thoai' },
      ],
    })
    .lean();
  if (!hd) throw Object.assign(new Error('Không tìm thấy hóa đơn'), { status: 404 });

  const phong = hd.hop_dong_id?.phong_id;
  const kh = hd.hop_dong_id?.khach_hang_id;

  const tienDien = (hd.chi_so_dien_moi - hd.chi_so_dien_cu) * hd.don_gia_dien;
  const tienNuoc = (hd.chi_so_nuoc_moi - hd.chi_so_nuoc_cu) * hd.don_gia_nuoc;
  const tienVeSinh = hd.so_nguoi_o * hd.don_gia_ve_sinh;
  const tienXeMay = hd.so_xe_may * hd.don_gia_xe_may;
  const tienXeDap = hd.so_xe_dap * hd.don_gia_xe_dap;
  const tienPhong = hd.tong_tien - tienDien - tienNuoc - tienVeSinh - tienXeMay - tienXeDap - (hd.no_thang_truoc || 0);

  const content = `
    <div class="header-org">HÓA ĐƠN TIỀN PHÒNG</div>
    <h1>Tháng ${hd.thang}/${hd.nam}</h1>
    <div class="date-line">Ngày lập: ${fmtDate(hd.ngay_lap)}</div>

    <table class="info">
      <tr><td>Phòng:</td><td>${phong?.ten || '—'} — ${phong?.khu_id?.ten || '—'}</td></tr>
      <tr><td>Khách hàng:</td><td>${kh?.ho_ten || '—'}</td></tr>
      <tr><td>Số điện thoại:</td><td>${kh?.so_dien_thoai || '—'}</td></tr>
      <tr><td>Hạn thanh toán:</td><td>${fmtDate(hd.han_thanh_toan)}</td></tr>
    </table>

    <table class="data">
      <tr><th>Khoản</th><th>Chi tiết</th><th style="text-align:right">Thành tiền</th></tr>
      <tr>
        <td>Tiền phòng</td>
        <td>Giá thuê: ${fmt(hd.hop_dong_id?.gia_thue_ky_hop_dong)} đ</td>
        <td class="right">${fmt(tienPhong)} đ</td>
      </tr>
      <tr>
        <td>Điện</td>
        <td>Chỉ số: ${hd.chi_so_dien_cu} → ${hd.chi_so_dien_moi} (${hd.chi_so_dien_moi - hd.chi_so_dien_cu} kWh × ${fmt(hd.don_gia_dien)} đ)</td>
        <td class="right">${fmt(tienDien)} đ</td>
      </tr>
      <tr>
        <td>Nước</td>
        <td>Chỉ số: ${hd.chi_so_nuoc_cu} → ${hd.chi_so_nuoc_moi} (${hd.chi_so_nuoc_moi - hd.chi_so_nuoc_cu} m³ × ${fmt(hd.don_gia_nuoc)} đ)</td>
        <td class="right">${fmt(tienNuoc)} đ</td>
      </tr>
      <tr>
        <td>Vệ sinh</td>
        <td>${hd.so_nguoi_o} người × ${fmt(hd.don_gia_ve_sinh)} đ</td>
        <td class="right">${fmt(tienVeSinh)} đ</td>
      </tr>
      ${hd.so_xe_may > 0 ? `<tr>
        <td>Xe máy</td>
        <td>${hd.so_xe_may} xe × ${fmt(hd.don_gia_xe_may)} đ</td>
        <td class="right">${fmt(tienXeMay)} đ</td>
      </tr>` : ''}
      ${hd.so_xe_dap > 0 ? `<tr>
        <td>Xe đạp</td>
        <td>${hd.so_xe_dap} xe × ${fmt(hd.don_gia_xe_dap)} đ</td>
        <td class="right">${fmt(tienXeDap)} đ</td>
      </tr>` : ''}
      ${hd.no_thang_truoc > 0 ? `<tr>
        <td>Nợ tháng trước</td>
        <td></td>
        <td class="right">${fmt(hd.no_thang_truoc)} đ</td>
      </tr>` : ''}
      <tr class="total-row">
        <td colspan="2">TỔNG CỘNG</td>
        <td class="right">${fmt(hd.tong_tien)} đ</td>
      </tr>
    </table>

    ${hd.trang_thai === 'da_thanh_toan' ? `
    <table class="info">
      <tr><td>Trạng thái:</td><td><strong>ĐÃ THANH TOÁN</strong></td></tr>
      <tr><td>Ngày thanh toán:</td><td>${fmtDate(hd.ngay_thanh_toan)}</td></tr>
      <tr><td>Phương thức:</td><td>${hd.phuong_thuc === 'tien_mat' ? 'Tiền mặt' : 'Chuyển khoản'}</td></tr>
      ${hd.ma_giao_dich ? `<tr><td>Mã giao dịch:</td><td>${hd.ma_giao_dich}</td></tr>` : ''}
    </table>` : ''}

    <div class="sig-row">
      <div class="sig-box">
        <p>BÊN CHO THUÊ</p>
        <p class="note">(Ký, ghi rõ họ tên)</p>
        <div class="sig-line"></div>
      </div>
      <div class="sig-box">
        <p>BÊN THUÊ</p>
        <p class="note">(Ký, ghi rõ họ tên)</p>
        <div class="sig-line"></div>
        <div class="sig-name">${kh?.ho_ten || ''}</div>
      </div>
    </div>
  `;

  return renderPDF(buildPage(content));
};

// ─── Thanh Ly PDF ──────────────────────────────────────────────────────────────
const thanhLyPDF = async (hop_dong_id) => {
  const hd = await HopDong.findById(hop_dong_id)
    .populate({ path: 'phong_id', select: 'ten', populate: { path: 'khu_id', select: 'ten' } })
    .populate('khach_hang_id')
    .lean();
  if (!hd) throw Object.assign(new Error('Không tìm thấy hợp đồng'), { status: 404 });

  const unpaidInvoices = await HoaDon.find({ hop_dong_id, trang_thai: 'chua_thanh_toan' }).sort({ nam: 1, thang: 1 }).lean();
  const tong_no = unpaidInvoices.reduce((s, h) => s + h.tong_tien, 0);
  const phong = hd.phong_id;
  const kh = hd.khach_hang_id;

  const noRows = unpaidInvoices.map((h) => `
    <tr><td>${h.thang}/${h.nam}</td><td class="right">${fmt(h.tong_tien)} đ</td></tr>
  `).join('');

  const content = `
    <div class="header-org">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
    <div class="subtitle">Độc lập – Tự do – Hạnh phúc</div>
    <h1>Biên bản thanh lý hợp đồng</h1>
    <div class="date-line">Ngày thanh lý: ${fmtDate(hd.ngay_thanh_ly)}</div>

    <div class="section-title">I. THÔNG TIN HỢP ĐỒNG</div>
    <table class="info">
      <tr><td>Phòng:</td><td>${phong?.ten || '—'} — ${phong?.khu_id?.ten || '—'}</td></tr>
      <tr><td>Khách hàng:</td><td>${kh?.ho_ten || '—'}</td></tr>
      <tr><td>CMND/CCCD:</td><td>${kh?.cmnd || '—'}</td></tr>
      <tr><td>Ngày bắt đầu thuê:</td><td>${fmtDate(hd.ngay_bat_dau)}</td></tr>
      <tr><td>Ngày hết hạn HĐ:</td><td>${fmtDate(hd.ngay_het_han)}</td></tr>
    </table>

    <div class="section-title">II. QUYẾT TOÁN</div>
    <table class="info">
      <tr><td>Tiền đặt cọc:</td><td>${fmt(hd.tien_dat_coc)} đ</td></tr>
      <tr><td>Tổng nợ hóa đơn:</td><td>${fmt(tong_no)} đ</td></tr>
    </table>

    ${unpaidInvoices.length > 0 ? `
    <table class="data">
      <tr><th>Tháng</th><th style="text-align:right">Số tiền</th></tr>
      ${noRows}
    </table>` : ''}

    <div class="sig-row">
      <div class="sig-box">
        <p>BÊN CHO THUÊ</p>
        <p class="note">(Ký, ghi rõ họ tên)</p>
        <div class="sig-line"></div>
      </div>
      <div class="sig-box">
        <p>BÊN THUÊ</p>
        <p class="note">(Ký, ghi rõ họ tên)</p>
        <div class="sig-line"></div>
        <div class="sig-name">${kh?.ho_ten || ''}</div>
      </div>
    </div>
  `;

  return renderPDF(buildPage(content));
};

// ─── Huy Hop Dong PDF ──────────────────────────────────────────────────────────
const huyHopDongPDF = async (hop_dong_id) => {
  const hd = await HopDong.findById(hop_dong_id)
    .populate({ path: 'phong_id', select: 'ten', populate: { path: 'khu_id', select: 'ten' } })
    .populate('khach_hang_id')
    .lean();
  if (!hd) throw Object.assign(new Error('Không tìm thấy hợp đồng'), { status: 404 });

  const unpaid = await HoaDon.find({ hop_dong_id, trang_thai: 'chua_thanh_toan' }).sort({ nam: 1, thang: 1 }).lean();
  const phong = hd.phong_id;
  const kh = hd.khach_hang_id;

  const noRows = unpaid.map((h) => `
    <tr><td>${h.thang}/${h.nam}</td><td class="right">${fmt(h.tong_tien)} đ</td></tr>
  `).join('');

  const content = `
    <div class="header-org">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
    <div class="subtitle">Độc lập – Tự do – Hạnh phúc</div>
    <h1>Biên bản hủy hợp đồng thuê phòng</h1>
    <div class="date-line">Ngày hủy: ${fmtDate(hd.ngay_huy)}</div>

    <div class="section-title">I. THÔNG TIN HỢP ĐỒNG</div>
    <table class="info">
      <tr><td>Phòng:</td><td>${phong?.ten || '—'} — ${phong?.khu_id?.ten || '—'}</td></tr>
      <tr><td>Khách hàng:</td><td>${kh?.ho_ten || '—'}</td></tr>
      <tr><td>CMND/CCCD:</td><td>${kh?.cmnd || '—'}</td></tr>
      <tr><td>Ngày bắt đầu thuê:</td><td>${fmtDate(hd.ngay_bat_dau)}</td></tr>
      <tr><td>Lý do hủy:</td><td>${hd.ly_do_huy || '—'}</td></tr>
    </table>

    <div class="section-title">II. HÓA ĐƠN CHƯA THANH TOÁN</div>
    ${unpaid.length > 0 ? `
    <table class="data">
      <tr><th>Tháng</th><th style="text-align:right">Số tiền</th></tr>
      ${noRows}
      <tr class="total-row">
        <td>Tổng nợ (tịch thu cọc)</td>
        <td class="right">${fmt(unpaid.reduce((s, h) => s + h.tong_tien, 0))} đ</td>
      </tr>
    </table>` : '<p>Không có hóa đơn chưa thanh toán.</p>'}

    <p class="note">* Tiền đặt cọc bị tịch thu theo điều khoản hợp đồng.</p>

    <div class="sig-row">
      <div class="sig-box">
        <p>BÊN CHO THUÊ</p>
        <p class="note">(Ký, ghi rõ họ tên)</p>
        <div class="sig-line"></div>
      </div>
      <div class="sig-box">
        <p>BÊN THUÊ</p>
        <p class="note">(Ký, ghi rõ họ tên)</p>
        <div class="sig-line"></div>
        <div class="sig-name">${kh?.ho_ten || ''}</div>
      </div>
    </div>
  `;

  return renderPDF(buildPage(content));
};

module.exports = { hopDongPDF, hoaDonPDF, thanhLyPDF, huyHopDongPDF };
