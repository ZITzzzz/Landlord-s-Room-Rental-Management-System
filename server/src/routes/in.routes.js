const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/in.controller');

router.get('/hop-dong/:id', ctrl.inHopDong);
router.get('/hoa-don/:id', ctrl.inHoaDon);
router.get('/thanh-ly/:hop_dong_id', ctrl.inThanhLy);
router.get('/huy/:hop_dong_id', ctrl.inHuy);

module.exports = router;
