const mongoose = require('mongoose');

const ChiPhiVanHanhSchema = new mongoose.Schema(
  {
    khu_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Khu', default: null },
    thang: { type: Number, required: true, min: 1, max: 12 },
    nam: { type: Number, required: true, min: 2001 },
    loai: {
      type: String,
      required: true,
      enum: ['dien_nuoc_tong', 'sua_chua_chung', 'khac'],
    },
    so_tien: { type: Number, required: true, min: 1 },
    ghi_chu: { type: String },
  },
  { collection: 'chi_phi_van_hanh' }
);

module.exports = mongoose.model('ChiPhiVanHanh', ChiPhiVanHanhSchema);
