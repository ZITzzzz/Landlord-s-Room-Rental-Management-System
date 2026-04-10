const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/khu.controller');
const validate = require('../middlewares/validate');
const { khuCreateSchema, khuUpdateSchema } = require('../../../shared/schemas/khu.schema');

router.get('/', ctrl.getAll);
router.post('/', validate(khuCreateSchema), ctrl.create);
router.put('/:id', validate(khuUpdateSchema), ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
