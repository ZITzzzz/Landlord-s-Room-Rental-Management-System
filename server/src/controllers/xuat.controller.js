const xuatService = require('../services/xuat.service');

const sendExcel = async (wb, filename, res) => {
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  await wb.xlsx.write(res);
  res.end();
};

const xuatDoanhThu = async (req, res, next) => {
  try {
    const wb = await xuatService.xuatDoanhThu(req.query);
    await sendExcel(wb, `doanh-thu-${Date.now()}.xlsx`, res);
  } catch (err) { next(err); }
};

const xuatNo = async (req, res, next) => {
  try {
    const wb = await xuatService.xuatNo();
    await sendExcel(wb, `bao-cao-no-${Date.now()}.xlsx`, res);
  } catch (err) { next(err); }
};

const xuatCongSuat = async (req, res, next) => {
  try {
    const wb = await xuatService.xuatCongSuat(req.query);
    await sendExcel(wb, `cong-suat-${Date.now()}.xlsx`, res);
  } catch (err) { next(err); }
};

const xuatDoanhThuTheoPhong = async (req, res, next) => {
  try {
    const wb = await xuatService.xuatDoanhThuTheoPhong(req.query);
    await sendExcel(wb, `dt-theo-phong-${Date.now()}.xlsx`, res);
  } catch (err) { next(err); }
};

module.exports = { xuatDoanhThu, xuatNo, xuatCongSuat, xuatDoanhThuTheoPhong };
