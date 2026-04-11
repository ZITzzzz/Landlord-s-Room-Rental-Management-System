const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/hoaDon.controller');
const validate = require('../middlewares/validate');
const { hoaDonCreateSchema, thanhToanSchema } = require('../../../shared/schemas/hoaDon.schema');

// NOTE: static paths before /:id
router.get('/cho-lap', ctrl.getChoLap);
router.get('/tinh-truoc', ctrl.tinhTruoc);
router.get('/', ctrl.getAll);
router.post('/', validate(hoaDonCreateSchema), ctrl.create);
router.put('/:id/thanh-toan', validate(thanhToanSchema), ctrl.thanhToan);

module.exports = router;
