const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/xuat.controller');

router.get('/doanh-thu', ctrl.xuatDoanhThu);
router.get('/no', ctrl.xuatNo);
router.get('/cong-suat', ctrl.xuatCongSuat);
router.get('/doanh-thu-theo-phong', ctrl.xuatDoanhThuTheoPhong);

module.exports = router;
