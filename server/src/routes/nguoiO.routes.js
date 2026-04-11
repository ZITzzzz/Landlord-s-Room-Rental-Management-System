const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/nguoiO.controller');
const validate = require('../middlewares/validate');
const { nguoiOUpdateSchema } = require('../../../shared/schemas/nguoiO.schema');

router.put('/:id', validate(nguoiOUpdateSchema), ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
