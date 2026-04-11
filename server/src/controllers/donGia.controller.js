const service = require('../services/donGia.service');

const getCurrent = async (req, res, next) => {
  try {
    const data = await service.getDonGiaCurrent(req.query.loai_phong_id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const getLichSu = async (req, res, next) => {
  try {
    const data = await service.getLichSu(req.query.loai_phong_id, req.query.loai_dv);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const data = await service.create(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

module.exports = { getCurrent, getLichSu, create };
