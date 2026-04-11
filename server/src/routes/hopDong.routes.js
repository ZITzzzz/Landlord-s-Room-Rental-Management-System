const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/hopDong.controller');
const validate = require('../middlewares/validate');
const { hopDongCreateSchema, giaHanSchema, huyHopDongSchema } = require('../../../shared/schemas/hopDong.schema');
const { nguoiOCreateSchema } = require('../../../shared/schemas/nguoiO.schema');
const { thanhLySchema } = require('../../../shared/schemas/thanhLy.schema');

router.get('/', ctrl.getAll);
router.post('/', validate(hopDongCreateSchema), ctrl.create);
router.get('/:id', ctrl.getById);
router.put('/:id/gia-han', validate(giaHanSchema), ctrl.giaHan);
router.get('/:id/lich-su-gia-han', ctrl.getLichSuGiaHan);
router.get('/:id/nguoi-o', ctrl.getNguoiO);
router.post('/:id/nguoi-o', validate(nguoiOCreateSchema), ctrl.addNguoiO);
router.post('/:id/thanh-ly', validate(thanhLySchema), ctrl.thanhLy);
router.post('/:id/huy', validate(huyHopDongSchema), ctrl.huyHopDong);

module.exports = router;
