const mongoose = require('mongoose');

const NguoiOSchema = new mongoose.Schema(
  {
    hop_dong_id: { type: mongoose.Schema.Types.ObjectId, ref: 'HopDong', required: true },
    ho_ten: { type: String, required: true },
    cmnd: { type: String },
    ngay_bat_dau: { type: Date, required: true },
    ngay_ket_thuc: { type: Date, default: null },
  },
  { collection: 'nguoi_o' }
);

NguoiOSchema.index({ hop_dong_id: 1, ngay_bat_dau: 1 });

module.exports = mongoose.model('NguoiO', NguoiOSchema);
