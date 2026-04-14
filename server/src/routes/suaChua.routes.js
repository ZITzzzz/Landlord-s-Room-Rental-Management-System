const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/suaChua.controller');
const validate = require('../middlewares/validate');
const { suaChuaCreateSchema, suaChuaUpdateSchema } = require('../../../shared/schemas/suaChua.schema');

router.get('/', ctrl.getAll);
router.post('/', validate(suaChuaCreateSchema), ctrl.create);
router.put('/:id', validate(suaChuaUpdateSchema), ctrl.update);

module.exports = router;
