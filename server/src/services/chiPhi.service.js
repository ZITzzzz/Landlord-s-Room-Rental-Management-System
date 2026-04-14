const ChiPhiVanHanh = require('../models/ChiPhiVanHanh');

const getAll = async ({ thang, nam, khu_id } = {}) => {
  const filter = {};
  if (thang) filter.thang = Number(thang);
  if (nam) filter.nam = Number(nam);
  if (khu_id === 'null') {
    filter.khu_id = null;
  } else if (khu_id) {
    filter.khu_id = khu_id;
  }

  const items = await ChiPhiVanHanh.find(filter)
    .sort({ nam: -1, thang: -1 })
    .populate({ path: 'khu_id', select: 'ten' })
    .lean();

  return items.map((item) => ({
    ...item,
    ten_khu: item.khu_id?.ten ?? null,
  }));
};

const create = async (data) => {
  const payload = { ...data };
  if (!payload.khu_id) payload.khu_id = null;

  const item = await ChiPhiVanHanh.create(payload);
  return item;
};

const update = async (id, data) => {
  const item = await ChiPhiVanHanh.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!item) throw Object.assign(new Error('Không tìm thấy chi phí'), { status: 404 });
  return item;
};

const remove = async (id) => {
  const item = await ChiPhiVanHanh.findByIdAndDelete(id);
  if (!item) throw Object.assign(new Error('Không tìm thấy chi phí'), { status: 404 });
};

module.exports = { getAll, create, update, remove };
