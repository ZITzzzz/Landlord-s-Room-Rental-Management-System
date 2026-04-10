const mongoose = require('mongoose');

const LichSuGiaHanSchema = new mongoose.Schema(
  {
    hop_dong_id: { type: mongoose.Schema.Types.ObjectId, ref: 'HopDong', required: true },
    ngay_gia_han: { type: Date, required: true },
    han_cu: { type: Date, required: true },
    han_moi: { type: Date, required: true },
  },
  { collection: 'lich_su_gia_han' }
);

module.exports = mongoose.model('LichSuGiaHan', LichSuGiaHanSchema);
