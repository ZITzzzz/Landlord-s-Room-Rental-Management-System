const { getThongKe, getHoaDonKy } = require('../services/thongKe.service');

const getThongKeHandler = async (req, res, next) => {
  try {
    const { loai = 'thang', tu, den } = req.query;
    if (!tu || !den) return res.status(400).json({ success: false, error: 'Thiếu tham số tu/den' });
    res.json({ success: true, data: await getThongKe({ loai, tu, den }) });
  } catch (err) { next(err); }
};

const getHoaDonKyHandler = async (req, res, next) => {
  try {
    res.json({ success: true, data: await getHoaDonKy(req.params.ky) });
  } catch (err) { next(err); }
};

module.exports = { getThongKeHandler, getHoaDonKyHandler };
