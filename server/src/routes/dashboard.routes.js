const router = require('express').Router();
const { getKPIHandler, getCanhBaoHandler, markSeenHandler } = require('../controllers/dashboard.controller');

router.get('/kpi', getKPIHandler);
router.get('/canh-bao', getCanhBaoHandler);
router.put('/canh-bao/:loai/:id/da-xem', markSeenHandler);

module.exports = router;
