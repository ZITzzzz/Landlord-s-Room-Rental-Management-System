const Phong = require('../models/Phong');
const HoaDon = require('../models/HoaDon');

const getCongSuat = async ({ tu, den } = {}) => {
  const phongs = await Phong.find({}).populate('khu_id', 'ten').lean();
  const tong_phong = phongs.length;
  const dang_thue = phongs.filter((p) => p.trang_thai === 'cho_thue').length;

  const tong_quat = {
    tong_phong,
    dang_thue,
    ti_le: tong_phong > 0 ? Math.round((dang_thue / tong_phong) * 100) : 0,
  };

  const khuMap = {};
  phongs.forEach((p) => {
    const khu = p.khu_id;
    if (!khu) return;
    const kid = khu._id.toString();
    if (!khuMap[kid]) {
      khuMap[kid] = { khu_id: khu._id, ten_khu: khu.ten, tong_phong: 0, dang_thue: 0 };
    }
    khuMap[kid].tong_phong++;
    if (p.trang_thai === 'cho_thue') khuMap[kid].dang_thue++;
  });
  const theo_khu = Object.values(khuMap).map((k) => ({
    ...k,
    ti_le: k.tong_phong > 0 ? Math.round((k.dang_thue / k.tong_phong) * 100) : 0,
  }));

  let lich_su_theo_thang = [];
  if (tu && den) {
    const [tuNam, tuThang] = tu.split('-').map(Number);
    const [denNam, denThang] = den.split('-').map(Number);
    const tuSeq = tuNam * 12 + tuThang;
    const denSeq = denNam * 12 + denThang;
    const seqExpr = { $add: [{ $multiply: ['$nam', 12] }, '$thang'] };

    const agg = await HoaDon.aggregate([
      {
        $match: {
          $expr: { $and: [{ $gte: [seqExpr, tuSeq] }, { $lte: [seqExpr, denSeq] }] },
        },
      },
      {
        $group: {
          _id: { nam: '$nam', thang: '$thang' },
          so_hoa_don: { $sum: 1 },
          so_phong_thue: { $addToSet: '$hop_dong_id' },
        },
      },
      { $sort: { '_id.nam': 1, '_id.thang': 1 } },
    ]);

    lich_su_theo_thang = agg.map((r) => ({
      thang: `${r._id.nam}-${String(r._id.thang).padStart(2, '0')}`,
      so_phong_thue: r.so_phong_thue.length,
      ti_le:
        tong_phong > 0 ? Math.round((r.so_phong_thue.length / tong_phong) * 100) : 0,
    }));
  }

  return { tong_quat, theo_khu, lich_su_theo_thang };
};

const getNo = async () => {
  const unpaid = await HoaDon.find({ trang_thai: 'chua_thanh_toan' })
    .populate({
      path: 'hop_dong_id',
      populate: [
        { path: 'phong_id', select: 'ten' },
        { path: 'khach_hang_id', select: 'ho_ten so_dien_thoai' },
      ],
    })
    .sort({ nam: 1, thang: 1 })
    .lean();

  const customerMap = {};
  unpaid.forEach((hd) => {
    const hdObj = hd.hop_dong_id;
    if (!hdObj) return;
    const kh = hdObj.khach_hang_id;
    const phong = hdObj.phong_id;
    const khId = kh?._id?.toString();
    if (!khId) return;

    if (!customerMap[khId]) {
      customerMap[khId] = {
        khach_hang_id: kh._id,
        ten_khach_hang: kh.ho_ten,
        so_dien_thoai: kh.so_dien_thoai,
        tong_no: 0,
        contracts: {},
      };
    }
    const hdId = hdObj._id.toString();
    if (!customerMap[khId].contracts[hdId]) {
      customerMap[khId].contracts[hdId] = {
        hop_dong_id: hdObj._id,
        ten_phong: phong?.ten,
        no: 0,
        months: [],
      };
    }
    customerMap[khId].contracts[hdId].no += hd.tong_tien;
    customerMap[khId].contracts[hdId].months.push({ nam: hd.nam, thang: hd.thang });
    customerMap[khId].tong_no += hd.tong_tien;
  });

  return Object.values(customerMap)
    .sort((a, b) => b.tong_no - a.tong_no)
    .map((c) => ({
      khach_hang_id: c.khach_hang_id,
      ten_khach_hang: c.ten_khach_hang,
      so_dien_thoai: c.so_dien_thoai,
      tong_no: c.tong_no,
      chi_tiet_theo_phong: Object.values(c.contracts).map((inv) => {
        const sorted = inv.months.sort(
          (a, b) => a.nam * 12 + a.thang - (b.nam * 12 + b.thang)
        );
        let maxConsec = 1, cur = 1;
        for (let i = 1; i < sorted.length; i++) {
          const prev = sorted[i - 1].nam * 12 + sorted[i - 1].thang;
          const curr = sorted[i].nam * 12 + sorted[i].thang;
          if (curr - prev === 1) { cur++; maxConsec = Math.max(maxConsec, cur); } else { cur = 1; }
        }
        return {
          hop_dong_id: inv.hop_dong_id,
          ten_phong: inv.ten_phong,
          no: inv.no,
          so_thang_no_lien_tiep: maxConsec,
        };
      }),
    }));
};

const getDoanhThuTheoPhong = async ({ tu, den, khu_id } = {}) => {
  const match = { trang_thai: 'da_thanh_toan' };
  if (tu && den) {
    const [tuNam, tuThang] = tu.split('-').map(Number);
    const [denNam, denThang] = den.split('-').map(Number);
    const seqExpr = { $add: [{ $multiply: ['$nam', 12] }, '$thang'] };
    match.$expr = {
      $and: [
        { $gte: [seqExpr, tuNam * 12 + tuThang] },
        { $lte: [seqExpr, denNam * 12 + denThang] },
      ],
    };
  }

  const hoaDons = await HoaDon.find(match)
    .populate({
      path: 'hop_dong_id',
      populate: { path: 'phong_id', populate: { path: 'khu_id', select: 'ten' } },
    })
    .lean();

  const phongMap = {};
  hoaDons.forEach((hd) => {
    const phong = hd.hop_dong_id?.phong_id;
    if (!phong) return;
    if (khu_id && phong.khu_id?._id?.toString() !== khu_id) return;
    const pid = phong._id.toString();
    if (!phongMap[pid]) {
      phongMap[pid] = {
        phong_id: phong._id,
        ten_phong: phong.ten,
        ten_khu: phong.khu_id?.ten,
        doanh_thu: 0,
      };
    }
    phongMap[pid].doanh_thu += hd.tong_tien;
  });

  return Object.values(phongMap).sort((a, b) => b.doanh_thu - a.doanh_thu);
};

module.exports = { getCongSuat, getNo, getDoanhThuTheoPhong };
