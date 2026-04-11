const service = require('../services/phong.service');

const getAll = async (req, res, next) => {
  try {
    const data = await service.getAll(req.query);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const getTrong = async (req, res, next) => {
  try {
    const data = await service.getTrong(req.query);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const data = await service.getById(req.params.id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const getLichSuGia = async (req, res, next) => {
  try {
    const data = await service.getLichSuGia(req.params.id);
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

const update = async (req, res, next) => {
  try {
    const data = await service.update(req.params.id, req.body);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    await service.remove(req.params.id);
    res.json({ success: true, data: { message: 'Xóa thành công' } });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getTrong, getById, getLichSuGia, create, update, remove };
