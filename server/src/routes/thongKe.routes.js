const router = require('express').Router();
const { getThongKeHandler, getHoaDonKyHandler } = require('../controllers/thongKe.controller');

router.get('/', getThongKeHandler);
router.get('/:ky/hoa-don', getHoaDonKyHandler);

module.exports = router;
