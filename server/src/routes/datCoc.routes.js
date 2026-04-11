const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/datCoc.controller');
const validate = require('../middlewares/validate');
const { datCocCreateSchema, datCocHuySchema } = require('../../../shared/schemas/datCoc.schema');

// NOTE: /phong/:phong_id must come before /:id
router.get('/phong/:phong_id', ctrl.getActiveByPhong);
router.post('/', validate(datCocCreateSchema), ctrl.create);
router.put('/:id/huy', validate(datCocHuySchema), ctrl.huy);

module.exports = router;
