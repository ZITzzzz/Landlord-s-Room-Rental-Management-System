const service = require('../services/hoaDon.service');

const getAll = async (req, res, next) => {
  try {
    const data = await service.getAll(req.query);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const getChoLap = async (req, res, next) => {
  try {
    const { thang, nam } = req.query;
    const data = await service.getChoLap(thang, nam);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const tinhTruoc = async (req, res, next) => {
  try {
    const { hop_dong_id, thang, nam, chi_so_dien_moi, chi_so_nuoc_moi, so_xe_may, so_xe_dap } = req.query;
    const data = await service.tinhTruoc(hop_dong_id, thang, nam, chi_so_dien_moi, chi_so_nuoc_moi, so_xe_may, so_xe_dap);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const data = await service.create(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
};

const thanhToan = async (req, res, next) => {
  try {
    const data = await service.thanhToan(req.params.id, req.body);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

module.exports = { getAll, getChoLap, tinhTruoc, create, thanhToan };
