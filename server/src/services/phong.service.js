const Phong = require('../models/Phong');
const LichSuGiaThuPhong = require('../models/LichSuGiaThuPhong');
const HopDong = require('../models/HopDong');
const HoaDon = require('../models/HoaDon');
const { getDonGiaHieuLuc } = require('./donGia.service');

const LOAI_DV_PHONG = ['dien', 'nuoc'];

const getAll = async (filters = {}) => {
  const query = {};
  if (filters.khu_id) query.khu_id = filters.khu_id;
  if (filters.trang_thai) query.trang_thai = filters.trang_thai;

  const phongs = await Phong.find(query)
    .populate('khu_id', 'ten')
    .populate('loai_phong_id', 'ten suc_chua')
    .sort({ createdAt: -1 })
    .lean();

  return phongs.map((p) => ({
    ...p,
    ten_khu: p.khu_id?.ten ?? '',
    ten_loai_phong: p.loai_phong_id?.ten ?? '',
    suc_chua: p.loai_phong_id?.suc_chua ?? null,
  }));
};

/**
 * Vacant or deposited rooms — used by wizards to pick a room for deposit/contract.
 * Attaches current effective dien/nuoc service prices.
 */
const getTrong = async (filters = {}) => {
  const query = { trang_thai: { $in: ['trong', 'dat_coc'] } };
  if (filters.gia_max) query.gia_thue = { $lte: Number(filters.gia_max) };

  const phongs = await Phong.find(query)
    .populate('khu_id', 'ten')
    .populate('loai_phong_id', 'ten suc_chua')
    .lean();

  const now = new Date();
  const result = await Promise.all(
    phongs.map(async (p) => {
      const [dien, nuoc] = await Promise.all(
        LOAI_DV_PHONG.map((loai_dv) =>
          getDonGiaHieuLuc(p.loai_phong_id?._id ?? null, loai_dv, now)
        )
      );
      return {
        ...p,
        ten_khu: p.khu_id?.ten ?? '',
        ten_loai_phong: p.loai_phong_id?.ten ?? '',
        suc_chua: p.loai_phong_id?.suc_chua ?? null,
        don_gia_dien: dien?.don_gia ?? null,
        don_gia_nuoc: nuoc?.don_gia ?? null,
      };
    })
  );
  return result;
};

const getById = async (id) => {
  const phong = await Phong.findById(id)
    .populate('khu_id', 'ten')
    .populate('loai_phong_id', 'ten suc_chua')
    .lean();
  if (!phong) throw Object.assign(new Error('Không tìm thấy phòng'), { status: 404 });
  return {
    ...phong,
    ten_khu: phong.khu_id?.ten ?? '',
    ten_loai_phong: phong.loai_phong_id?.ten ?? '',
    suc_chua: phong.loai_phong_id?.suc_chua ?? null,
  };
};

const getLichSuGia = async (phong_id) => {
  return LichSuGiaThuPhong.find({ phong_id }).sort({ ngay_ap_dung: -1 }).lean();
};

const create = async (data) => {
  try {
    const phong = await Phong.create(data);
    return phong;
  } catch (err) {
    if (err.code === 11000) {
      throw Object.assign(new Error('Tên phòng đã tồn tại trong khu này'), { status: 400 });
    }
    throw err;
  }
};

const update = async (id, data) => {
  const phong = await Phong.findById(id);
  if (!phong) throw Object.assign(new Error('Không tìm thấy phòng'), { status: 404 });

  // If rent price changed, record history before saving
  if (data.gia_thue !== undefined && data.gia_thue !== phong.gia_thue) {
    await LichSuGiaThuPhong.create({
      phong_id: id,
      gia_cu: phong.gia_thue,
      gia_moi: data.gia_thue,
      ngay_ap_dung: new Date(),
    });
  }

  Object.assign(phong, data);
  await phong.save();
  return phong;
};

const remove = async (id) => {
  const phong = await Phong.findById(id);
  if (!phong) throw Object.assign(new Error('Không tìm thấy phòng'), { status: 404 });

  if (phong.trang_thai !== 'trong') {
    throw Object.assign(new Error('Chỉ có thể xóa phòng đang trống'), { status: 400 });
  }

  const hopDongs = await HopDong.find({ phong_id: id, trang_thai: 'hieu_luc' }).lean();
  if (hopDongs.length > 0) {
    const hopDongIds = hopDongs.map((h) => h._id);
    const unpaid = await HoaDon.countDocuments({
      hop_dong_id: { $in: hopDongIds },
      trang_thai: 'chua_thanh_toan',
    });
    if (unpaid > 0) {
      throw Object.assign(new Error('Phòng còn hóa đơn chưa thanh toán'), { status: 400 });
    }
  }

  await Phong.findByIdAndDelete(id);
};

module.exports = { getAll, getTrong, getById, getLichSuGia, create, update, remove };
