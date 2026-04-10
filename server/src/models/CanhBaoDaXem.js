const mongoose = require('mongoose');

const CanhBaoDaXemSchema = new mongoose.Schema(
  {
    loai_canh_bao: {
      type: String,
      required: true,
      enum: ['phong_chua_hd', 'hd_sap_den_han', 'hd_qua_han', 'nguy_co_huy', 'hop_dong_sap_het'],
    },
    tham_chieu_id: { type: mongoose.Schema.Types.ObjectId, required: true },
    ngay_xem: { type: Date, required: true, default: Date.now },
  },
  { collection: 'canh_bao_da_xem' }
);

CanhBaoDaXemSchema.index({ loai_canh_bao: 1, tham_chieu_id: 1, ngay_xem: 1 });

module.exports = mongoose.model('CanhBaoDaXem', CanhBaoDaXemSchema);
