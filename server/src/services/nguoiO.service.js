const NguoiO = require('../models/NguoiO');

/**
 * Count occupants active during a given month.
 * Exported and used by hoaDon.service.
 */
const getSoNguoiOTrongThang = async (hop_dong_id, thang, nam) => {
  const startOfMonth = new Date(nam, thang - 1, 1);
  const endOfMonth = new Date(nam, thang, 0, 23, 59, 59, 999);

  const count = await NguoiO.countDocuments({
    hop_dong_id,
    ngay_bat_dau: { $lte: endOfMonth },
    $or: [{ ngay_ket_thuc: null }, { ngay_ket_thuc: { $gte: startOfMonth } }],
  });

  return count;
};

const getByHopDong = async (hop_dong_id) => {
  return NguoiO.find({ hop_dong_id }).sort({ ngay_bat_dau: 1 }).lean();
};

const create = async (hop_dong_id, data) => {
  return NguoiO.create({ ...data, hop_dong_id });
};

const update = async (id, data) => {
  const nguoiO = await NguoiO.findByIdAndUpdate(id, data, { new: true });
  if (!nguoiO) throw Object.assign(new Error('Không tìm thấy người ở'), { status: 404 });
  return nguoiO;
};

const remove = async (id) => {
  const nguoiO = await NguoiO.findByIdAndDelete(id);
  if (!nguoiO) throw Object.assign(new Error('Không tìm thấy người ở'), { status: 404 });
};

module.exports = { getSoNguoiOTrongThang, getByHopDong, create, update, remove };
