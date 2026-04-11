const DonGiaDichVu = require('../models/DonGiaDichVu');

const LOAI_DV_ALL = ['dien', 'nuoc', 've_sinh', 'xe_may', 'xe_dap'];

/**
 * Get the effective price for a service type at a given date.
 * Exported and used by phong.service (getTrong) and later hoaDon.service.
 */
const getDonGiaHieuLuc = async (loai_phong_id, loai_dv, ngay) => {
  const record = await DonGiaDichVu.findOne({
    loai_phong_id: loai_phong_id ?? null,
    loai_dv,
    ngay_ap_dung: { $lte: ngay },
  })
    .sort({ ngay_ap_dung: -1 })
    .lean();
  return record;
};

/**
 * Get the current effective price for every service type for a room type.
 */
const getDonGiaCurrent = async (loai_phong_id) => {
  const now = new Date();
  const results = await Promise.all(
    LOAI_DV_ALL.map(async (loai_dv) => {
      const record = await getDonGiaHieuLuc(loai_phong_id ?? null, loai_dv, now);
      return { loai_dv, don_gia: record?.don_gia ?? null, ngay_ap_dung: record?.ngay_ap_dung ?? null };
    })
  );
  return results;
};

/**
 * Get full price history, optionally filtered by service type.
 */
const getLichSu = async (loai_phong_id, loai_dv) => {
  const filter = { loai_phong_id: loai_phong_id ?? null };
  if (loai_dv) filter.loai_dv = loai_dv;
  return DonGiaDichVu.find(filter).sort({ ngay_ap_dung: -1 }).lean();
};

/**
 * Append a new price record (never update existing ones).
 */
const create = async (data) => {
  const record = await DonGiaDichVu.create({
    ...data,
    loai_phong_id: data.loai_phong_id ?? null,
  });
  return record;
};

module.exports = { getDonGiaHieuLuc, getDonGiaCurrent, getLichSu, create };
