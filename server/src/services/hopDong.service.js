const HopDong = require('../models/HopDong');
const LichSuGiaHan = require('../models/LichSuGiaHan');
const NguoiO = require('../models/NguoiO');
const HoaDon = require('../models/HoaDon');
const Phong = require('../models/Phong');
const DatCoc = require('../models/DatCoc');

const getAll = async (filters = {}) => {
  const query = {};
  if (filters.trang_thai) query.trang_thai = filters.trang_thai;
  if (filters.khu_id) {
    // Filter by khu via phong
    const phongs = await Phong.find({ khu_id: filters.khu_id }).select('_id').lean();
    query.phong_id = { $in: phongs.map((p) => p._id) };
  }
  if (filters.tu || filters.den) {
    query.ngay_bat_dau = {};
    if (filters.tu) query.ngay_bat_dau.$gte = new Date(filters.tu);
    if (filters.den) query.ngay_bat_dau.$lte = new Date(filters.den);
  }

  let hopDongs = await HopDong.find(query)
    .populate({ path: 'phong_id', select: 'ten khu_id', populate: { path: 'khu_id', select: 'ten' } })
    .populate('khach_hang_id', 'ho_ten')
    .sort({ createdAt: -1 })
    .lean();

  // Search by customer name or room name
  if (filters.q) {
    const q = filters.q.toLowerCase();
    hopDongs = hopDongs.filter(
      (hd) =>
        hd.phong_id?.ten?.toLowerCase().includes(q) ||
        hd.khach_hang_id?.ho_ten?.toLowerCase().includes(q)
    );
  }

  return hopDongs.map((hd) => ({
    ...hd,
    ten_phong: hd.phong_id?.ten ?? '',
    ten_khu: hd.phong_id?.khu_id?.ten ?? '',
    ten_khach_hang: hd.khach_hang_id?.ho_ten ?? '',
  }));
};

const getById = async (id) => {
  const hopDong = await HopDong.findById(id)
    .populate({ path: 'phong_id', select: 'ten khu_id', populate: { path: 'khu_id', select: 'ten' } })
    .populate('khach_hang_id')
    .lean();
  if (!hopDong) throw Object.assign(new Error('Không tìm thấy hợp đồng'), { status: 404 });

  const nguoi_o = await NguoiO.find({ hop_dong_id: id }).sort({ ngay_bat_dau: 1 }).lean();
  const hoa_don_chua_thanh_toan = await HoaDon.find({ hop_dong_id: id, trang_thai: 'chua_thanh_toan' })
    .sort({ nam: 1, thang: 1 })
    .lean();
  const lich_su_gia_han = await LichSuGiaHan.find({ hop_dong_id: id }).sort({ ngay_gia_han: -1 }).lean();

  return {
    ...hopDong,
    ten_phong: hopDong.phong_id?.ten ?? '',
    ten_khu: hopDong.phong_id?.khu_id?.ten ?? '',
    khach_hang: hopDong.khach_hang_id,
    nguoi_o,
    hoa_don_chua_thanh_toan,
    lich_su_gia_han,
  };
};

const create = async (data) => {
  const phong = await Phong.findById(data.phong_id);
  if (!phong) throw Object.assign(new Error('Không tìm thấy phòng'), { status: 404 });

  if (!['trong', 'dat_coc'].includes(phong.trang_thai)) {
    throw Object.assign(new Error('Phòng không ở trạng thái có thể ký hợp đồng'), { status: 400 });
  }

  const ngay_bat_dau = new Date(data.ngay_bat_dau);
  const ngay_het_han = new Date(data.ngay_het_han);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  if (ngay_bat_dau < thirtyDaysAgo) {
    throw Object.assign(new Error('Ngày bắt đầu không được trước 30 ngày'), { status: 400 });
  }

  const minHetHan = new Date(ngay_bat_dau);
  minHetHan.setMonth(minHetHan.getMonth() + 1);
  if (ngay_het_han < minHetHan) {
    throw Object.assign(new Error('Ngày hết hạn phải sau ngày bắt đầu ít nhất 1 tháng'), { status: 400 });
  }

  const hopDong = await HopDong.create({
    phong_id: data.phong_id,
    khach_hang_id: data.khach_hang_id,
    ngay_bat_dau,
    ngay_het_han,
    gia_thue_ky_hop_dong: phong.gia_thue, // snapshot at signing time
    tien_dat_coc: data.tien_dat_coc,
    so_nguoi_o: data.so_nguoi_o,
    trang_thai: 'hieu_luc',
  });

  // Room → cho_thue
  await Phong.findByIdAndUpdate(data.phong_id, { trang_thai: 'cho_thue' });

  // If room had an active deposit, mark it as converted
  if (phong.trang_thai === 'dat_coc') {
    await DatCoc.findOneAndUpdate(
      { phong_id: data.phong_id, trang_thai: 'con_hieu_luc' },
      { trang_thai: 'da_chuyen_hop_dong' }
    );
  }

  // Create initial occupants
  if (data.nguoi_o_ban_dau?.length > 0) {
    await NguoiO.insertMany(
      data.nguoi_o_ban_dau.map((no) => ({
        hop_dong_id: hopDong._id,
        ho_ten: no.ho_ten,
        cmnd: no.cmnd ?? undefined,
        ngay_bat_dau,
      }))
    );
  }

  return hopDong;
};

const giaHan = async (id, han_moi) => {
  const hopDong = await HopDong.findById(id);
  if (!hopDong) throw Object.assign(new Error('Không tìm thấy hợp đồng'), { status: 404 });

  if (hopDong.trang_thai !== 'hieu_luc') {
    throw Object.assign(new Error('Chỉ có thể gia hạn hợp đồng đang hiệu lực'), { status: 400 });
  }

  const hanMoiDate = new Date(han_moi);
  if (hanMoiDate <= hopDong.ngay_het_han) {
    throw Object.assign(new Error('Ngày hết hạn mới phải sau ngày hết hạn hiện tại'), { status: 400 });
  }

  await LichSuGiaHan.create({
    hop_dong_id: id,
    ngay_gia_han: new Date(),
    han_cu: hopDong.ngay_het_han,
    han_moi: hanMoiDate,
  });

  hopDong.ngay_het_han = hanMoiDate;
  await hopDong.save();

  const lich_su_gia_han = await LichSuGiaHan.find({ hop_dong_id: id }).sort({ ngay_gia_han: -1 }).lean();
  return { ...hopDong.toObject(), lich_su_gia_han };
};

const getLichSuGiaHan = async (id) => {
  return LichSuGiaHan.find({ hop_dong_id: id }).sort({ ngay_gia_han: -1 }).lean();
};

module.exports = { getAll, getById, create, giaHan, getLichSuGiaHan };
