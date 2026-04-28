const mongoose = require('mongoose');
const HoaDon = require('../models/HoaDon');
const HopDong = require('../models/HopDong');
const Phong = require('../models/Phong');
const { getDonGiaHieuLuc } = require('./donGia.service');
const { getSoNguoiOTrongThang } = require('./nguoiO.service');

// Pro-rata rent calculation, rounded to nearest 1,000 VND
const tinhTienPhong = (gia_thue, ngay_bat_dau, ngay_het_han, thang, nam) => {
  const batDau = new Date(ngay_bat_dau);
  const hetHan = new Date(ngay_het_han);
  const daysInMonth = new Date(nam, thang, 0).getDate();

  // First month: contract starts mid-month (after the 1st)
  if (batDau.getFullYear() === nam && batDau.getMonth() === thang - 1 && batDau.getDate() > 1) {
    const daysStayed = daysInMonth - batDau.getDate() + 1;
    return Math.round((gia_thue * daysStayed) / daysInMonth / 1000) * 1000;
  }

  // Last month: contract ends mid-month (before the last day)
  if (hetHan.getFullYear() === nam && hetHan.getMonth() === thang - 1 && hetHan.getDate() < daysInMonth) {
    const daysStayed = hetHan.getDate();
    return Math.round((gia_thue * daysStayed) / daysInMonth / 1000) * 1000;
  }

  return gia_thue;
};

// Get previous meter readings for a contract (from last invoice or room defaults)
const getChiSoCu = async (hop_dong_id, phong) => {
  const lastInvoice = await HoaDon.findOne({ hop_dong_id })
    .sort({ nam: -1, thang: -1 })
    .lean();

  return {
    chi_so_dien_cu: lastInvoice?.chi_so_dien_moi ?? phong.chi_so_dien_dau ?? 0,
    chi_so_nuoc_cu: lastInvoice?.chi_so_nuoc_moi ?? phong.chi_so_nuoc_dau ?? 0,
  };
};

// Full invoice calculation (used by both tinh-truoc and create)
const tinhHoaDon = async (hopDong, phong, thang, nam, chi_so_dien_moi, chi_so_nuoc_moi, so_xe_may, so_xe_dap) => {
  const { chi_so_dien_cu, chi_so_nuoc_cu } = await getChiSoCu(hopDong._id, phong);

  if (chi_so_dien_moi < chi_so_dien_cu) {
    throw Object.assign(new Error('Chỉ số điện mới không được nhỏ hơn chỉ số cũ'), { status: 400 });
  }
  if (chi_so_nuoc_moi < chi_so_nuoc_cu) {
    throw Object.assign(new Error('Chỉ số nước mới không được nhỏ hơn chỉ số cũ'), { status: 400 });
  }

  const ngayLap = new Date(nam, thang - 1, 1); // use first of the month as reference for prices
  const loai_phong_id = phong.loai_phong_id;

  const [dgDien, dgNuoc, dgVeSinh, dgXeMay, dgXeDap] = await Promise.all([
    getDonGiaHieuLuc(loai_phong_id, 'dien', ngayLap),
    getDonGiaHieuLuc(loai_phong_id, 'nuoc', ngayLap),
    getDonGiaHieuLuc(null, 've_sinh', ngayLap),
    getDonGiaHieuLuc(null, 'xe_may', ngayLap),
    getDonGiaHieuLuc(null, 'xe_dap', ngayLap),
  ]);

  if (!dgDien) throw Object.assign(new Error('Chưa thiết lập đơn giá điện cho loại phòng này. Vui lòng vào Quản lý loại phòng để cập nhật.'), { status: 400 });
  if (!dgNuoc) throw Object.assign(new Error('Chưa thiết lập đơn giá nước cho loại phòng này. Vui lòng vào Quản lý loại phòng để cập nhật.'), { status: 400 });

  const don_gia_dien = dgDien.don_gia;
  const don_gia_nuoc = dgNuoc.don_gia;
  const don_gia_ve_sinh = dgVeSinh?.don_gia ?? 0;
  const don_gia_xe_may = dgXeMay?.don_gia ?? 0;
  const don_gia_xe_dap = dgXeDap?.don_gia ?? 0;

  const so_nguoi_o = await getSoNguoiOTrongThang(hopDong._id, thang, nam);

  const tien_phong = tinhTienPhong(hopDong.gia_thue_ky_hop_dong, hopDong.ngay_bat_dau, hopDong.ngay_het_han, thang, nam);
  const tien_dien = (chi_so_dien_moi - chi_so_dien_cu) * don_gia_dien;
  const tien_nuoc = (chi_so_nuoc_moi - chi_so_nuoc_cu) * don_gia_nuoc;
  const tien_ve_sinh = so_nguoi_o * don_gia_ve_sinh;
  const tien_xe_may = so_xe_may * don_gia_xe_may;
  const tien_xe_dap = so_xe_dap * don_gia_xe_dap;

  // Prior debt: sum of all unpaid invoices for this contract
  const noAgg = await HoaDon.aggregate([
    {
      $match: {
        hop_dong_id: new mongoose.Types.ObjectId(hopDong._id),
        trang_thai: 'chua_thanh_toan',
      },
    },
    { $group: { _id: null, total: { $sum: '$tong_tien' } } },
  ]);
  const no_thang_truoc = noAgg[0]?.total ?? 0;

  const tong_tien = tien_phong + tien_dien + tien_nuoc + tien_ve_sinh + tien_xe_may + tien_xe_dap + no_thang_truoc;

  return {
    tien_phong,
    tien_dien,
    tien_nuoc,
    tien_ve_sinh,
    tien_xe_may,
    tien_xe_dap,
    no_thang_truoc,
    tong_tien,
    // Snapshots
    chi_so_dien_cu,
    chi_so_dien_moi,
    chi_so_nuoc_cu,
    chi_so_nuoc_moi,
    don_gia_dien,
    don_gia_nuoc,
    don_gia_ve_sinh,
    don_gia_xe_may,
    don_gia_xe_dap,
    so_nguoi_o,
    so_xe_may,
    so_xe_dap,
    chi_tiet: {
      chi_so_dien_cu, chi_so_dien_moi, don_gia_dien,
      chi_so_nuoc_cu, chi_so_nuoc_moi, don_gia_nuoc,
      so_nguoi_o, don_gia_ve_sinh,
      so_xe_may, don_gia_xe_may,
      so_xe_dap, don_gia_xe_dap,
      gia_thue: hopDong.gia_thue_ky_hop_dong,
      ngay_bat_dau_thue: hopDong.ngay_bat_dau,
    },
  };
};

const getAll = async (filters = {}) => {
  const query = {};
  if (filters.hop_dong_id) query.hop_dong_id = filters.hop_dong_id;
  if (filters.thang) query.thang = Number(filters.thang);
  if (filters.nam) query.nam = Number(filters.nam);
  if (filters.trang_thai) query.trang_thai = filters.trang_thai;

  if (filters.phong_id) {
    const hopDongs = await HopDong.find({ phong_id: filters.phong_id }).select('_id').lean();
    query.hop_dong_id = { $in: hopDongs.map((h) => h._id) };
  }

  const hoaDons = await HoaDon.find(query)
    .populate({
      path: 'hop_dong_id',
      select: 'phong_id khach_hang_id',
      populate: [
        { path: 'phong_id', select: 'ten' },
        { path: 'khach_hang_id', select: 'ho_ten' },
      ],
    })
    .sort({ nam: -1, thang: -1 })
    .lean();

  return hoaDons.map((hd) => ({
    ...hd,
    ten_phong: hd.hop_dong_id?.phong_id?.ten ?? '',
    ten_khach_hang: hd.hop_dong_id?.khach_hang_id?.ho_ten ?? '',
  }));
};

// List active contracts that are missing an invoice for the given month/year
const getChoLap = async (thang, nam) => {
  const hopDongs = await HopDong.find({ trang_thai: 'hieu_luc' })
    .populate({ path: 'phong_id', select: 'ten khu_id chi_so_dien_dau chi_so_nuoc_dau', populate: { path: 'khu_id', select: 'ten' } })
    .populate('khach_hang_id', 'ho_ten')
    .lean();

  const result = [];
  for (const hd of hopDongs) {
    const exists = await HoaDon.exists({ hop_dong_id: hd._id, thang: Number(thang), nam: Number(nam) });
    if (exists) continue;

    const phong = hd.phong_id;
    const { chi_so_dien_cu, chi_so_nuoc_cu } = await getChiSoCu(hd._id, phong);

    result.push({
      hop_dong_id: hd._id,
      phong_id: phong?._id,
      ten_phong: phong?.ten ?? '',
      ten_khu: phong?.khu_id?.ten ?? '',
      ten_khach_hang: hd.khach_hang_id?.ho_ten ?? '',
      chi_so_dien_cu,
      chi_so_nuoc_cu,
      gia_thue: hd.gia_thue_ky_hop_dong,
    });
  }

  return result;
};

// Preview invoice calculation without saving
const tinhTruoc = async (hop_dong_id, thang, nam, chi_so_dien_moi, chi_so_nuoc_moi, so_xe_may, so_xe_dap) => {
  const hopDong = await HopDong.findById(hop_dong_id).lean();
  if (!hopDong) throw Object.assign(new Error('Không tìm thấy hợp đồng'), { status: 404 });

  const phong = await Phong.findById(hopDong.phong_id).lean();
  if (!phong) throw Object.assign(new Error('Không tìm thấy phòng'), { status: 404 });

  return tinhHoaDon(hopDong, phong, Number(thang), Number(nam), Number(chi_so_dien_moi), Number(chi_so_nuoc_moi), Number(so_xe_may), Number(so_xe_dap));
};

const create = async (data) => {
  const hopDong = await HopDong.findById(data.hop_dong_id).lean();
  if (!hopDong) throw Object.assign(new Error('Không tìm thấy hợp đồng'), { status: 404 });

  if (hopDong.trang_thai !== 'hieu_luc') {
    throw Object.assign(new Error('Hợp đồng không còn hiệu lực'), { status: 400 });
  }

  const dup = await HoaDon.exists({ hop_dong_id: data.hop_dong_id, thang: data.thang, nam: data.nam });
  if (dup) throw Object.assign(new Error(`Đã có hóa đơn tháng ${data.thang}/${data.nam}`), { status: 400 });

  const phong = await Phong.findById(hopDong.phong_id).lean();
  if (!phong) throw Object.assign(new Error('Không tìm thấy phòng'), { status: 404 });

  const calc = await tinhHoaDon(
    hopDong, phong, data.thang, data.nam,
    data.chi_so_dien_moi, data.chi_so_nuoc_moi,
    data.so_xe_may, data.so_xe_dap
  );

  const ngayLap = new Date();
  const hanThanhToan = new Date(ngayLap);
  hanThanhToan.setDate(hanThanhToan.getDate() + 7);

  const hoaDon = await HoaDon.create({
    hop_dong_id: data.hop_dong_id,
    thang: data.thang,
    nam: data.nam,
    chi_so_dien_cu: calc.chi_so_dien_cu,
    chi_so_dien_moi: calc.chi_so_dien_moi,
    chi_so_nuoc_cu: calc.chi_so_nuoc_cu,
    chi_so_nuoc_moi: calc.chi_so_nuoc_moi,
    so_xe_may: calc.so_xe_may,
    so_xe_dap: calc.so_xe_dap,
    don_gia_dien: calc.don_gia_dien,
    don_gia_nuoc: calc.don_gia_nuoc,
    don_gia_ve_sinh: calc.don_gia_ve_sinh,
    don_gia_xe_may: calc.don_gia_xe_may,
    don_gia_xe_dap: calc.don_gia_xe_dap,
    so_nguoi_o: calc.so_nguoi_o,
    no_thang_truoc: calc.no_thang_truoc,
    tong_tien: calc.tong_tien,
    trang_thai: 'chua_thanh_toan',
    ngay_lap: ngayLap,
    han_thanh_toan: hanThanhToan,
  });

  return hoaDon;
};

const thanhToan = async (id, data) => {
  const hoaDon = await HoaDon.findById(id);
  if (!hoaDon) throw Object.assign(new Error('Không tìm thấy hóa đơn'), { status: 404 });

  if (hoaDon.trang_thai === 'da_thanh_toan') {
    throw Object.assign(new Error('Hóa đơn đã được thanh toán'), { status: 400 });
  }

  hoaDon.trang_thai = 'da_thanh_toan';
  hoaDon.ngay_thanh_toan = new Date();
  hoaDon.phuong_thuc = data.phuong_thuc;
  if (data.ma_giao_dich) hoaDon.ma_giao_dich = data.ma_giao_dich;
  await hoaDon.save();

  return hoaDon;
};

module.exports = { getAll, getChoLap, tinhTruoc, create, thanhToan };
