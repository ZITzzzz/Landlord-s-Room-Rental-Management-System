const service = require('../services/datCoc.service');

const getAll = async (req, res, next) => {
  try {
    const data = await service.getAll(req.query);
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

const huy = async (req, res, next) => {
  try {
    const data = await service.huy(req.params.id, req.body.ly_do_huy);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const getActiveByPhong = async (req, res, next) => {
  try {
    const data = await service.getActiveByPhong(req.params.phong_id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, create, huy, getActiveByPhong };
