const router = require('express').Router();
const { getCongSuatHandler, getNoHandler, getDoanhThuTheoPhongHandler } = require('../controllers/baoCao.controller');

router.get('/cong-suat', getCongSuatHandler);
router.get('/no', getNoHandler);
router.get('/doanh-thu-theo-phong', getDoanhThuTheoPhongHandler);

module.exports = router;
