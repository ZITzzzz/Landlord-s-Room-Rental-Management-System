const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/khachHang.controller');
const validate = require('../middlewares/validate');
const { khachHangCreateSchema, khachHangUpdateSchema } = require('../../../shared/schemas/khachHang.schema');

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', validate(khachHangCreateSchema), ctrl.create);
router.put('/:id', validate(khachHangUpdateSchema), ctrl.update);

module.exports = router;
