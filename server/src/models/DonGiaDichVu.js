const mongoose = require('mongoose');

const DonGiaDichVuSchema = new mongoose.Schema(
  {
    loai_phong_id: { type: mongoose.Schema.Types.ObjectId, ref: 'LoaiPhong', default: null },
    loai_dv: {
      type: String,
      required: true,
      enum: ['dien', 'nuoc', 've_sinh', 'xe_may', 'xe_dap'],
    },
    don_gia: { type: Number, required: true, min: 1 },
    ngay_ap_dung: { type: Date, required: true },
  },
  { collection: 'don_gia_dich_vu' }
);

DonGiaDichVuSchema.index({ loai_phong_id: 1, loai_dv: 1, ngay_ap_dung: -1 });

module.exports = mongoose.model('DonGiaDichVu', DonGiaDichVuSchema);
