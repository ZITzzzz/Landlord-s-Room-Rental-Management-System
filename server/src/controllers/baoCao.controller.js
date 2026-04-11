const { getCongSuat, getNo, getDoanhThuTheoPhong } = require('../services/baoCao.service');

const getCongSuatHandler = async (req, res, next) => {
  try {
    const { tu, den } = req.query;
    res.json({ success: true, data: await getCongSuat({ tu, den }) });
  } catch (err) { next(err); }
};

const getNoHandler = async (req, res, next) => {
  try {
    res.json({ success: true, data: await getNo() });
  } catch (err) { next(err); }
};

const getDoanhThuTheoPhongHandler = async (req, res, next) => {
  try {
    const { tu, den, khu_id } = req.query;
    res.json({ success: true, data: await getDoanhThuTheoPhong({ tu, den, khu_id }) });
  } catch (err) { next(err); }
};

module.exports = { getCongSuatHandler, getNoHandler, getDoanhThuTheoPhongHandler };
