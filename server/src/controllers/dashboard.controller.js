const { getKPI, getCanhBao, markSeen } = require('../services/dashboard.service');

const getKPIHandler = async (req, res, next) => {
  try {
    res.json({ success: true, data: await getKPI() });
  } catch (err) { next(err); }
};

const getCanhBaoHandler = async (req, res, next) => {
  try {
    res.json({ success: true, data: await getCanhBao() });
  } catch (err) { next(err); }
};

const markSeenHandler = async (req, res, next) => {
  try {
    const { loai, id } = req.params;
    res.json({ success: true, data: await markSeen(loai, id) });
  } catch (err) { next(err); }
};

module.exports = { getKPIHandler, getCanhBaoHandler, markSeenHandler };
