const SuaChua = require('../models/SuaChua');
const Phong = require('../models/Phong');

const getAll = async ({ phong_id, trang_thai } = {}) => {
  const filter = {};
  if (phong_id) filter.phong_id = phong_id;
  if (trang_thai) filter.trang_thai = trang_thai;

  const items = await SuaChua.find(filter)
    .sort({ ngay_phat_sinh: -1 })
    .populate({ path: 'phong_id', select: 'ten khu_id', populate: { path: 'khu_id', select: 'ten' } })
    .lean();

  return items.map((item) => ({
    ...item,
    ten_phong: item.phong_id?.ten ?? '—',
    ten_khu: item.phong_id?.khu_id?.ten ?? '—',
  }));
};

const create = async (data) => {
  const phong = await Phong.findById(data.phong_id);
  if (!phong) throw Object.assign(new Error('Không tìm thấy phòng'), { status: 404 });

  if (phong.trang_thai !== 'trong') {
    throw Object.assign(
      new Error('Chỉ có thể tạo yêu cầu sửa chữa cho phòng đang trống'),
      { status: 400 }
    );
  }

  const suaChua = await SuaChua.create({ ...data, trang_thai: 'cho_xu_ly' });
  await Phong.findByIdAndUpdate(data.phong_id, { trang_thai: 'sua_chua' });

  return suaChua;
};

const update = async (id, data) => {
  const suaChua = await SuaChua.findById(id);
  if (!suaChua) throw Object.assign(new Error('Không tìm thấy yêu cầu sửa chữa'), { status: 404 });

  // When marking complete, transition room back to 'trong' and record completion date
  if (data.trang_thai === 'hoan_thanh' && suaChua.trang_thai !== 'hoan_thanh') {
    const phong = await Phong.findById(suaChua.phong_id);
    if (phong && phong.trang_thai === 'sua_chua') {
      await Phong.findByIdAndUpdate(suaChua.phong_id, { trang_thai: 'trong' });
    }
    data.ngay_hoan_thanh = new Date();
  }

  const updated = await SuaChua.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  return updated;
};

module.exports = { getAll, create, update };
