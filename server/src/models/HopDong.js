const mongoose = require('mongoose');

const HopDongSchema = new mongoose.Schema(
  {
    phong_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Phong', required: true },
    khach_hang_id: { type: mongoose.Schema.Types.ObjectId, ref: 'KhachHang', required: true },
    ngay_bat_dau: { type: Date, required: true },
    ngay_het_han: { type: Date, required: true },
    gia_thue_ky_hop_dong: { type: Number, required: true },
    tien_dat_coc: { type: Number, required: true, min: 1 },
    so_nguoi_o: { type: Number, required: true, min: 1 },
    trang_thai: {
      type: String,
      enum: ['hieu_luc', 'thanh_ly', 'huy'],
      default: 'hieu_luc',
    },
    ngay_thanh_ly: { type: Date },
    ngay_huy: { type: Date },
    ly_do_huy: { type: String },
  },
  { collection: 'hop_dong' }
);

HopDongSchema.index({ phong_id: 1, trang_thai: 1 });
HopDongSchema.index({ khach_hang_id: 1 });
HopDongSchema.index({ ngay_het_han: 1, trang_thai: 1 });

module.exports = mongoose.model('HopDong', HopDongSchema);
