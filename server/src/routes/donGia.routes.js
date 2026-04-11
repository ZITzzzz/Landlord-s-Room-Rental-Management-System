const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/donGia.controller');
const validate = require('../middlewares/validate');
const { donGiaCreateSchema } = require('../../../shared/schemas/donGia.schema');

// NOTE: /lich-su must come before any potential /:id route
router.get('/lich-su', ctrl.getLichSu);
router.get('/', ctrl.getCurrent);
router.post('/', validate(donGiaCreateSchema), ctrl.create);

module.exports = router;
