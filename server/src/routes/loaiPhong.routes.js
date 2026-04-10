const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/loaiPhong.controller');
const validate = require('../middlewares/validate');
const { loaiPhongCreateSchema, loaiPhongUpdateSchema } = require('../../../shared/schemas/loaiPhong.schema');

router.get('/', ctrl.getAll);
router.post('/', validate(loaiPhongCreateSchema), ctrl.create);
router.put('/:id', validate(loaiPhongUpdateSchema), ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
