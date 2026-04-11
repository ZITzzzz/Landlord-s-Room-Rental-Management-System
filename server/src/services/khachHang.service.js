const mongoose = require('mongoose');
const KhachHang = require('../models/KhachHang');
const HopDong = require('../models/HopDong');
const HoaDon = require('../models/HoaDon');
const Phong = require('../models/Phong');

const getAll = async (q) => {
  const filter = {};
  if (q) {
    filter.$or = [
      { ho_ten: { $regex: q, $options: 'i' } },
      { cmnd: { $regex: q, $options: 'i' } },
    ];
  }

  const khachHangs = await KhachHang.find(filter).sort({ ho_ten: 1 }).lean();

  const result = await Promise.all(
    khachHangs.map(async (kh) => {
      const hopDongs = await HopDong.find({ khach_hang_id: kh._id, trang_thai: 'hieu_luc' })
        .populate('phong_id', 'ten')
        .lean();
      const phong_dang_thue = hopDongs.map((hd) => hd.phong_id?.ten).filter(Boolean);
      return { ...kh, phong_dang_thue };
    })
  );

  return result;
};

const getById = async (id) => {
  const kh = await KhachHang.findById(id).lean();
  if (!kh) throw Object.assign(new Error('Không tìm thấy khách hàng'), { status: 404 });

  // Contract history with room name and area name
  const hopDongs = await HopDong.find({ khach_hang_id: id })
    .populate({ path: 'phong_id', select: 'ten khu_id', populate: { path: 'khu_id', select: 'ten' } })
    .sort({ ngay_bat_dau: -1 })
    .lean();

  const hop_dong_lich_su = hopDongs.map((hd) => ({
    ...hd,
    ten_phong: hd.phong_id?.ten ?? '',
    ten_khu: hd.phong_id?.khu_id?.ten ?? '',
  }));

  // Debt aggregation: unpaid invoices grouped by room
  const khachHangObjId = new mongoose.Types.ObjectId(id);
  const debtAgg = await HoaDon.aggregate([
    { $match: { trang_thai: 'chua_thanh_toan' } },
    {
      $lookup: {
        from: 'hop_dong',
        localField: 'hop_dong_id',
        foreignField: '_id',
        as: 'hd',
      },
    },
    { $unwind: '$hd' },
    { $match: { 'hd.khach_hang_id': khachHangObjId } },
    {
      $group: {
        _id: '$hd.phong_id',
        tong_no: { $sum: '$tong_tien' },
        so_thang_no: { $sum: 1 },
      },
    },
  ]);

  const no_theo_phong = await Promise.all(
    debtAgg.map(async (item) => {
      const phong = await Phong.findById(item._id).select('ten').lean();
      return {
        phong_id: item._id,
        ten_phong: phong?.ten ?? '',
        tong_no: item.tong_no,
        so_thang_no: item.so_thang_no,
      };
    })
  );

  return { ...kh, hop_dong_lich_su, no_theo_phong };
};

const create = async (data) => {
  const exists = await KhachHang.findOne({ cmnd: data.cmnd }).lean();
  if (exists) {
    throw Object.assign(new Error('CMND/CCCD đã tồn tại'), { status: 400 });
  }
  return KhachHang.create(data);
};

const update = async (id, data) => {
  const kh = await KhachHang.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!kh) throw Object.assign(new Error('Không tìm thấy khách hàng'), { status: 404 });
  return kh;
};

module.exports = { getAll, getById, create, update };
