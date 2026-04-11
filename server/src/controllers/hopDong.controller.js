const service = require('../services/hopDong.service');
const nguoiOService = require('../services/nguoiO.service');
const thanhLyService = require('../services/thanhLy.service');

// ── Contract ─────────────────────────────────────────────────────────────────

const getAll = async (req, res, next) => {
  try {
    const data = await service.getAll(req.query);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    const data = await service.getById(req.params.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const data = await service.create(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
};

const giaHan = async (req, res, next) => {
  try {
    const data = await service.giaHan(req.params.id, req.body.han_moi);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const getLichSuGiaHan = async (req, res, next) => {
  try {
    const data = await service.getLichSuGiaHan(req.params.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

// ── Occupants ────────────────────────────────────────────────────────────────

const getNguoiO = async (req, res, next) => {
  try {
    const data = await nguoiOService.getByHopDong(req.params.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const addNguoiO = async (req, res, next) => {
  try {
    const data = await nguoiOService.create(req.params.id, req.body);
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
};

// ── Settlement & Cancellation ─────────────────────────────────────────────────

const thanhLy = async (req, res, next) => {
  try {
    const data = await thanhLyService.thanhLy(req.params.id, req.body);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const huyHopDong = async (req, res, next) => {
  try {
    const data = await thanhLyService.huyHopDong(req.params.id, req.body.ly_do_huy);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

module.exports = { getAll, getById, create, giaHan, getLichSuGiaHan, getNguoiO, addNguoiO, thanhLy, huyHopDong };
