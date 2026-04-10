const Khu = require('../models/Khu');
const Phong = require('../models/Phong');
const HoaDon = require('../models/HoaDon');

const getAll = async () => {
  const khus = await Khu.find().sort({ createdAt: -1 }).lean();

  const result = await Promise.all(
    khus.map(async (khu) => {
      const phongs = await Phong.find({ khu_id: khu._id }).lean();
      const so_phong = phongs.length;
      const so_phong_dang_thue = phongs.filter((p) => p.trang_thai === 'cho_thue').length;
      return { ...khu, so_phong, so_phong_dang_thue };
    })
  );

  return result;
};

const create = async (data) => {
  const khu = await Khu.create(data);
  return khu;
};

const update = async (id, data) => {
  const khu = await Khu.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!khu) throw Object.assign(new Error('Không tìm thấy khu'), { status: 404 });
  return khu;
};

const remove = async (id) => {
  const phongs = await Phong.find({ khu_id: id }).lean();
  const hasActive = phongs.some((p) => p.trang_thai !== 'trong');
  if (hasActive) {
    throw Object.assign(new Error('Khu vẫn còn phòng đang hoạt động hoặc cho thuê'), { status: 400 });
  }

  // Check unpaid invoices through active contracts
  const phongIds = phongs.map((p) => p._id);
  const HopDong = require('../models/HopDong');
  const hopDongs = await HopDong.find({ phong_id: { $in: phongIds }, trang_thai: 'hieu_luc' }).lean();
  const hopDongIds = hopDongs.map((h) => h._id);
  const unpaid = await HoaDon.countDocuments({ hop_dong_id: { $in: hopDongIds }, trang_thai: 'chua_thanh_toan' });
  if (unpaid > 0) {
    throw Object.assign(new Error('Khu vẫn còn hóa đơn chưa thanh toán'), { status: 400 });
  }

  await Khu.findByIdAndDelete(id);
};

module.exports = { getAll, create, update, remove };
