const LoaiPhong = require('../models/LoaiPhong');
const Phong = require('../models/Phong');

const getAll = async () => LoaiPhong.find().sort({ ten: 1 }).lean();

const create = async (data) => {
  const loaiPhong = await LoaiPhong.create(data);
  return loaiPhong;
};

const update = async (id, data) => {
  const loaiPhong = await LoaiPhong.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!loaiPhong) throw Object.assign(new Error('Không tìm thấy loại phòng'), { status: 404 });
  return loaiPhong;
};

const remove = async (id) => {
  const inUse = await Phong.countDocuments({ loai_phong_id: id });
  if (inUse > 0) {
    throw Object.assign(new Error('Loại phòng đang được sử dụng bởi các phòng hiện có'), { status: 400 });
  }
  await LoaiPhong.findByIdAndDelete(id);
};

module.exports = { getAll, create, update, remove };
