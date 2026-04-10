const mongoose = require('mongoose');

const LichSuGiaThuPhongSchema = new mongoose.Schema(
  {
    phong_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Phong', required: true },
    gia_cu: { type: Number, required: true },
    gia_moi: { type: Number, required: true },
    ngay_ap_dung: { type: Date, required: true },
  },
  { collection: 'lich_su_gia_thu_phong' }
);

// Append-only — no updates or deletes
module.exports = mongoose.model('LichSuGiaThuPhong', LichSuGiaThuPhongSchema);
