const Phong = require('../models/Phong');
const HopDong = require('../models/HopDong');
const HoaDon = require('../models/HoaDon');
const Khu = require('../models/Khu');
const CanhBaoDaXem = require('../models/CanhBaoDaXem');

const getKPI = async () => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const [phongs, khus, doanhThuAgg, soSapHet, soSuaChua] = await Promise.all([
    Phong.find({}).select('khu_id trang_thai').lean(),
    Khu.find({}).select('ten').lean(),
    HoaDon.aggregate([
      {
        $match: {
          trang_thai: 'da_thanh_toan',
          ngay_thanh_toan: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      { $group: { _id: null, total: { $sum: '$tong_tien' } } },
    ]),
    HopDong.countDocuments({
      trang_thai: 'hieu_luc',
      ngay_het_han: { $gte: now, $lte: in30Days },
    }),
    Phong.countDocuments({ trang_thai: 'sua_chua' }),
  ]);

  const khuMap = {};
  khus.forEach((k) => {
    khuMap[k._id.toString()] = { ten_khu: k.ten, tong: 0, thue: 0 };
  });
  phongs.forEach((p) => {
    const kid = p.khu_id.toString();
    if (khuMap[kid]) {
      khuMap[kid].tong++;
      if (p.trang_thai === 'cho_thue') khuMap[kid].thue++;
    }
  });

  const ti_le_lap_day = Object.entries(khuMap).map(([khu_id, v]) => ({
    khu_id,
    ten_khu: v.ten_khu,
    so_phong_thue: v.thue,
    tong_so_phong: v.tong,
    ti_le: v.tong > 0 ? Math.round((v.thue / v.tong) * 100) : 0,
  }));

  return {
    ti_le_lap_day,
    doanh_thu_thang_nay: doanhThuAgg[0]?.total ?? 0,
    so_hop_dong_sap_het_han: soSapHet,
    so_phong_dang_sua_chua: soSuaChua,
  };
};

const getCanhBao = async () => {
  const now = new Date();
  const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const seenToday = await CanhBaoDaXem.find({ ngay_xem: { $gte: todayStart } }).lean();
  const seenSet = new Set(
    seenToday.map((s) => `${s.loai_canh_bao}:${s.tham_chieu_id.toString()}`)
  );
  const notSeen = (loai, id) => !seenSet.has(`${loai}:${id.toString()}`);

  // 1. Empty rooms (trong)
  const phongsTrong = await Phong.find({ trang_thai: 'trong' })
    .populate('khu_id', 'ten')
    .lean();
  const phong_chua_hd = phongsTrong
    .filter((p) => notSeen('phong_chua_hd', p._id))
    .map((p) => ({ phong_id: p._id, ten_phong: p.ten, ten_khu: p.khu_id?.ten }));

  // 2. Invoices due in ≤3 days
  const hdSapDenHan = await HoaDon.find({
    trang_thai: 'chua_thanh_toan',
    han_thanh_toan: { $gte: now, $lte: in3Days },
  })
    .populate({ path: 'hop_dong_id', populate: { path: 'phong_id', select: 'ten' } })
    .lean();
  const hd_sap_den_han = hdSapDenHan
    .filter((hd) => notSeen('hd_sap_den_han', hd._id))
    .map((hd) => ({
      hoa_don_id: hd._id,
      ten_phong: hd.hop_dong_id?.phong_id?.ten,
      so_tien: hd.tong_tien,
      han_thanh_toan: hd.han_thanh_toan,
    }));

  // 3. Overdue invoices
  const hdQuaHan = await HoaDon.find({
    trang_thai: 'chua_thanh_toan',
    han_thanh_toan: { $lt: now },
  })
    .populate({ path: 'hop_dong_id', populate: { path: 'phong_id', select: 'ten' } })
    .lean();
  const hd_qua_han = hdQuaHan
    .filter((hd) => notSeen('hd_qua_han', hd._id))
    .map((hd) => ({
      hoa_don_id: hd._id,
      ten_phong: hd.hop_dong_id?.phong_id?.ten,
      so_tien: hd.tong_tien,
      so_ngay_qua_han: Math.floor((now - new Date(hd.han_thanh_toan)) / 86400000),
    }));

  // 4. Contracts at risk (≥2 consecutive unpaid months)
  const activeContracts = await HopDong.find({ trang_thai: 'hieu_luc' })
    .populate('phong_id', 'ten')
    .populate('khach_hang_id', 'ho_ten')
    .lean();

  const nguy_co_huy = [];
  for (const hd of activeContracts) {
    if (!notSeen('nguy_co_huy', hd._id)) continue;
    const unpaid = await HoaDon.find({ hop_dong_id: hd._id, trang_thai: 'chua_thanh_toan' })
      .sort({ nam: 1, thang: 1 })
      .lean();
    if (unpaid.length < 2) continue;
    let maxConsec = 1, cur = 1;
    for (let i = 1; i < unpaid.length; i++) {
      const prev = unpaid[i - 1].nam * 12 + unpaid[i - 1].thang;
      const curr = unpaid[i].nam * 12 + unpaid[i].thang;
      if (curr - prev === 1) { cur++; maxConsec = Math.max(maxConsec, cur); } else { cur = 1; }
    }
    if (maxConsec >= 2) {
      nguy_co_huy.push({
        hop_dong_id: hd._id,
        ten_phong: hd.phong_id?.ten,
        ten_khach_hang: hd.khach_hang_id?.ho_ten,
        so_thang_no: unpaid.length,
      });
    }
  }

  // 5. Contracts already expired (past ngay_het_han, still hieu_luc)
  const hdDaHetHan = await HopDong.find({
    trang_thai: 'hieu_luc',
    ngay_het_han: { $lt: now },
  })
    .populate('phong_id', 'ten')
    .populate('khach_hang_id', 'ho_ten')
    .lean();
  const hd_da_het_han = hdDaHetHan
    .filter((hd) => notSeen('hd_da_het_han', hd._id))
    .map((hd) => ({
      hop_dong_id: hd._id,
      ten_phong: hd.phong_id?.ten,
      ten_khach_hang: hd.khach_hang_id?.ho_ten,
      ngay_het_han: hd.ngay_het_han,
    }));

  // 6. Contracts expiring within 30 days
  const hdSapHet = await HopDong.find({
    trang_thai: 'hieu_luc',
    ngay_het_han: { $gte: now, $lte: in30Days },
  })
    .populate('phong_id', 'ten')
    .populate('khach_hang_id', 'ho_ten')
    .lean();
  const hop_dong_sap_het = hdSapHet
    .filter((hd) => notSeen('hop_dong_sap_het', hd._id))
    .map((hd) => ({
      hop_dong_id: hd._id,
      ten_phong: hd.phong_id?.ten,
      ten_khach_hang: hd.khach_hang_id?.ho_ten,
      ngay_het_han: hd.ngay_het_han,
    }));

  return { phong_chua_hd, hd_sap_den_han, hd_qua_han, nguy_co_huy, hd_da_het_han, hop_dong_sap_het };
};

const markSeen = async (loai, id) => {
  const record = await CanhBaoDaXem.create({
    loai_canh_bao: loai,
    tham_chieu_id: id,
    ngay_xem: new Date(),
  });
  return record;
};

module.exports = { getKPI, getCanhBao, markSeen };
