const mongoose = require('mongoose');

const SuaChuaSchema = new mongoose.Schema(
  {
    phong_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Phong', required: true },
    mo_ta: { type: String, required: true },
    ngay_phat_sinh: { type: Date, required: true },
    chi_phi_du_kien: { type: Number, min: 0 },
    chi_phi_thuc_te: { type: Number, min: 0 },
    trang_thai: {
      type: String,
      enum: ['cho_xu_ly', 'dang_xu_ly', 'hoan_thanh'],
      default: 'cho_xu_ly',
    },
    do_kh_gay_ra: { type: Boolean, default: false },
    ngay_hoan_thanh: { type: Date, default: null },
  },
  { collection: 'sua_chua' }
);

module.exports = mongoose.model('SuaChua', SuaChuaSchema);
