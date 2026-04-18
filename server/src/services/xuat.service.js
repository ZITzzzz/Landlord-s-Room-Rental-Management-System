const ExcelJS = require('exceljs');
const { getCongSuat, getNo, getDoanhThuTheoPhong } = require('./baoCao.service');
const { getThongKe } = require('./thongKe.service');

const fmtDate = (d) => {
  if (!d) return '';
  const dt = new Date(d);
  return `${String(dt.getDate()).padStart(2, '0')}/${String(dt.getMonth() + 1).padStart(2, '0')}/${dt.getFullYear()}`;
};

// Helper: create a styled workbook with one sheet
const taoWorkbook = (sheetName, headers, rows) => {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet(sheetName);

  // Header row
  ws.addRow(headers);
  const headerRow = ws.getRow(1);
  headerRow.font = { bold: true };
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9E1F2' } };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
  headerRow.border = {
    bottom: { style: 'thin' },
  };

  // Data rows
  rows.forEach((r) => ws.addRow(r));

  // Auto-width columns
  ws.columns.forEach((col) => {
    let maxLen = 12;
    col.eachCell({ includeEmpty: true }, (cell) => {
      const len = cell.value ? String(cell.value).length : 0;
      if (len > maxLen) maxLen = len;
    });
    col.width = Math.min(maxLen + 2, 50);
  });

  return wb;
};

// ─── Doanh thu ─────────────────────────────────────────────────────────────────
const xuatDoanhThu = async (params) => {
  const rows = await getThongKe(params);
  const headers = ['Kỳ', 'Doanh thu (đ)', 'Chi phí VH (đ)', 'Lợi nhuận (đ)'];
  const data = rows.map((r) => [
    r.ky,
    r.doanh_thu,
    r.chi_phi ?? '',
    r.loi_nhuan ?? '',
  ]);
  return taoWorkbook('Doanh thu', headers, data);
};

// ─── Nợ ────────────────────────────────────────────────────────────────────────
const xuatNo = async () => {
  const customers = await getNo();
  const headers = ['Khách hàng', 'SĐT', 'Phòng', 'Nợ (đ)', 'Tháng nợ liên tiếp'];
  const data = [];
  customers.forEach((c) => {
    c.chi_tiet_theo_phong.forEach((p) => {
      data.push([c.ten_khach_hang, c.so_dien_thoai, p.ten_phong, p.no, p.so_thang_no_lien_tiep]);
    });
  });
  return taoWorkbook('Báo cáo nợ', headers, data);
};

// ─── Công suất ─────────────────────────────────────────────────────────────────
const xuatCongSuat = async (params) => {
  const data = await getCongSuat(params);
  const headers = ['Khu', 'Đang thuê', 'Tổng phòng', 'Tỉ lệ (%)'];
  const rows = (data.theo_khu || []).map((k) => [k.ten_khu, k.dang_thue, k.tong_phong, k.ti_le]);
  return taoWorkbook('Công suất', headers, rows);
};

// ─── Doanh thu theo phòng ───────────────────────────────────────────────────────
const xuatDoanhThuTheoPhong = async (params) => {
  const rows = await getDoanhThuTheoPhong(params);
  const headers = ['Phòng', 'Khu', 'Doanh thu (đ)'];
  const data = rows.map((r) => [r.ten_phong, r.ten_khu, r.doanh_thu]);
  return taoWorkbook('DT theo phòng', headers, data);
};

module.exports = { xuatDoanhThu, xuatNo, xuatCongSuat, xuatDoanhThuTheoPhong };
