const HoaDon = require('../models/HoaDon');
const ChiPhiVanHanh = require('../models/ChiPhiVanHanh');

// Parse "YYYY-MM" → { nam, thang }
const parseYM = (s) => {
  const [nam, thang] = s.split('-').map(Number);
  return { nam, thang };
};

const getThongKe = async ({ loai, tu, den }) => {
  const { nam: tuNam, thang: tuThang } = parseYM(tu);
  const { nam: denNam, thang: denThang } = parseYM(den);
  const tuSeq = tuNam * 12 + tuThang;
  const denSeq = denNam * 12 + denThang;

  const seqExpr = { $add: [{ $multiply: ['$nam', 12] }, '$thang'] };
  const rangeMatch = {
    $expr: { $and: [{ $gte: [seqExpr, tuSeq] }, { $lte: [seqExpr, denSeq] }] },
  };

  const [dtRows, cpRows] = await Promise.all([
    HoaDon.aggregate([
      { $match: { trang_thai: 'da_thanh_toan', ...rangeMatch } },
      { $group: { _id: { nam: '$nam', thang: '$thang' }, doanh_thu: { $sum: '$tong_tien' } } },
    ]),
    ChiPhiVanHanh.aggregate([
      { $match: rangeMatch },
      { $group: { _id: { nam: '$nam', thang: '$thang' }, chi_phi: { $sum: '$so_tien' } } },
    ]),
  ]);

  const dtMap = {};
  dtRows.forEach((r) => { dtMap[`${r._id.nam}-${r._id.thang}`] = r.doanh_thu; });
  const cpMap = {};
  cpRows.forEach((r) => { cpMap[`${r._id.nam}-${r._id.thang}`] = r.chi_phi; });

  const monthList = [];
  for (let y = tuNam; y <= denNam; y++) {
    const fromM = y === tuNam ? tuThang : 1;
    const toM = y === denNam ? denThang : 12;
    for (let m = fromM; m <= toM; m++) {
      monthList.push({ nam: y, thang: m });
    }
  }

  if (loai === 'thang') {
    return monthList.map(({ nam, thang }) => {
      const key = `${nam}-${thang}`;
      const doanh_thu = dtMap[key] ?? 0;
      const chi_phi = cpMap[key] ?? 0;
      return {
        ky: `${nam}-${String(thang).padStart(2, '0')}`,
        doanh_thu,
        chi_phi,
        loi_nhuan: doanh_thu - chi_phi,
      };
    });
  }

  if (loai === 'quy') {
    // Group months into quarters per year
    const qMap = {};
    monthList.forEach(({ nam, thang }) => {
      const q = Math.ceil(thang / 3);
      const key = `${nam}-Q${q}`;
      if (!qMap[key]) qMap[key] = { ky: key, doanh_thu: 0, chi_phi: 0 };
      qMap[key].doanh_thu += dtMap[`${nam}-${thang}`] ?? 0;
      qMap[key].chi_phi += cpMap[`${nam}-${thang}`] ?? 0;
    });
    return Object.values(qMap).map((r) => ({ ...r, loi_nhuan: r.doanh_thu - r.chi_phi }));
  }

  // loai === 'nam'
  const yMap = {};
  monthList.forEach(({ nam, thang }) => {
    const key = `${nam}`;
    if (!yMap[key]) yMap[key] = { ky: key, doanh_thu: 0, chi_phi: 0 };
    yMap[key].doanh_thu += dtMap[`${nam}-${thang}`] ?? 0;
    yMap[key].chi_phi += cpMap[`${nam}-${thang}`] ?? 0;
  });
  return Object.values(yMap).map((r) => ({ ...r, loi_nhuan: r.doanh_thu - r.chi_phi }));
};

const getHoaDonKy = async (ky) => {
  let match = { trang_thai: 'da_thanh_toan' };

  if (ky.includes('-Q')) {
    const [namStr, qStr] = ky.split('-Q');
    const q = parseInt(qStr);
    const thangStart = (q - 1) * 3 + 1;
    const thangEnd = q * 3;
    match.nam = parseInt(namStr);
    match.$expr = {
      $and: [{ $gte: ['$thang', thangStart] }, { $lte: ['$thang', thangEnd] }],
    };
  } else if (ky.includes('-')) {
    const [nam, thang] = ky.split('-').map(Number);
    match.nam = nam;
    match.thang = thang;
  } else {
    match.nam = parseInt(ky);
  }

  const hoaDons = await HoaDon.find(match)
    .populate({
      path: 'hop_dong_id',
      populate: [
        { path: 'phong_id', select: 'ten' },
        { path: 'khach_hang_id', select: 'ho_ten' },
      ],
    })
    .sort({ ngay_thanh_toan: -1 })
    .lean();

  return hoaDons.map((hd) => ({
    hoa_don_id: hd._id,
    ten_khach_hang: hd.hop_dong_id?.khach_hang_id?.ho_ten,
    ten_phong: hd.hop_dong_id?.phong_id?.ten,
    thang: hd.thang,
    nam: hd.nam,
    tong_tien: hd.tong_tien,
    phuong_thuc: hd.phuong_thuc,
    ngay_thanh_toan: hd.ngay_thanh_toan,
  }));
};

module.exports = { getThongKe, getHoaDonKy };
