const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/phong.controller');
const validate = require('../middlewares/validate');
const { phongCreateSchema, phongUpdateSchema } = require('../../../shared/schemas/phong.schema');

// NOTE: /trong must come before /:id to avoid Express treating "trong" as an ID
router.get('/trong', ctrl.getTrong);
router.get('/', ctrl.getAll);
router.get('/:id/lich-su-gia', ctrl.getLichSuGia);
router.get('/:id', ctrl.getById);
router.post('/', validate(phongCreateSchema), ctrl.create);
router.put('/:id', validate(phongUpdateSchema), ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
