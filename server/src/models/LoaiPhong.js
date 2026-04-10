const mongoose = require('mongoose');

const LoaiPhongSchema = new mongoose.Schema(
  {
    ten: { type: String, required: true, unique: true },
    suc_chua: { type: Number, required: true, min: 1, max: 4 },
  },
  { collection: 'loai_phong' }
);

module.exports = mongoose.model('LoaiPhong', LoaiPhongSchema);
