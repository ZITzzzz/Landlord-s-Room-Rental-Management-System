const DatCoc = require('../models/DatCoc');
const Phong = require('../models/Phong');

const create = async (data) => {
  const phong = await Phong.findById(data.phong_id);
  if (!phong) throw Object.assign(new Error('Không tìm thấy phòng'), { status: 404 });

  if (phong.trang_thai !== 'trong') {
    throw Object.assign(new Error('Phòng không ở trạng thái trống'), { status: 400 });
  }

  const datCoc = await DatCoc.create({ ...data, trang_thai: 'con_hieu_luc' });
  await Phong.findByIdAndUpdate(data.phong_id, { trang_thai: 'dat_coc' });

  return datCoc;
};

const huy = async (id, ly_do_huy) => {
  const datCoc = await DatCoc.findById(id);
  if (!datCoc) throw Object.assign(new Error('Không tìm thấy đặt cọc'), { status: 404 });

  if (datCoc.trang_thai !== 'con_hieu_luc') {
    throw Object.assign(new Error('Đặt cọc này không còn hiệu lực'), { status: 400 });
  }

  await DatCoc.findByIdAndUpdate(id, { trang_thai: 'huy', ly_do_huy });
  await Phong.findByIdAndUpdate(datCoc.phong_id, { trang_thai: 'trong' });

  return { message: 'Hủy đặt cọc thành công' };
};

const getActiveByPhong = async (phong_id) => {
  const datCoc = await DatCoc.findOne({ phong_id, trang_thai: 'con_hieu_luc' }).lean();
  if (!datCoc) throw Object.assign(new Error('Không tìm thấy đặt cọc hiệu lực cho phòng này'), { status: 404 });
  return datCoc;
};

module.exports = { create, huy, getActiveByPhong };
