const service = require('../services/nguoiO.service');

const update = async (req, res, next) => {
  try {
    const data = await service.update(req.params.id, req.body);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    await service.remove(req.params.id);
    res.json({ success: true, data: { message: 'Xóa thành công' } });
  } catch (err) { next(err); }
};

module.exports = { update, remove };
