const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/chiPhi.controller');
const validate = require('../middlewares/validate');
const { chiPhiCreateSchema, chiPhiUpdateSchema } = require('../../../shared/schemas/chiPhi.schema');

router.get('/', ctrl.getAll);
router.post('/', validate(chiPhiCreateSchema), ctrl.create);
router.put('/:id', validate(chiPhiUpdateSchema), ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
