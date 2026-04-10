const mongoose = require('mongoose');

const DatCocSchema = new mongoose.Schema(
  {
    phong_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Phong', required: true },
    khach_hang_id: { type: mongoose.Schema.Types.ObjectId, ref: 'KhachHang', required: true },
    so_tien: { type: Number, required: true, min: 1 },
    ngay_dat_coc: { type: Date, required: true },
    trang_thai: {
      type: String,
      enum: ['con_hieu_luc', 'da_chuyen_hop_dong', 'huy'],
      default: 'con_hieu_luc',
    },
    ly_do_huy: { type: String },
  },
  { collection: 'dat_coc' }
);

module.exports = mongoose.model('DatCoc', DatCocSchema);
