const mongoose = require('mongoose');

const PhongSchema = new mongoose.Schema(
  {
    ten: { type: String, required: true },
    khu_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Khu', required: true },
    loai_phong_id: { type: mongoose.Schema.Types.ObjectId, ref: 'LoaiPhong', required: true },
    gia_thue: { type: Number, required: true, min: 1 },
    trang_thai: {
      type: String,
      enum: ['trong', 'cho_thue', 'dat_coc', 'sua_chua'],
      default: 'trong',
    },
    chi_so_dien_dau: { type: Number, default: 0 },
    chi_so_nuoc_dau: { type: Number, default: 0 },
  },
  { collection: 'phong' }
);

PhongSchema.index({ ten: 1, khu_id: 1 }, { unique: true });
PhongSchema.index({ khu_id: 1, trang_thai: 1 });

module.exports = mongoose.model('Phong', PhongSchema);
