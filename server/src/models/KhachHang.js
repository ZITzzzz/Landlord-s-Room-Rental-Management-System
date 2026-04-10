const mongoose = require('mongoose');

const KhachHangSchema = new mongoose.Schema(
  {
    ho_ten: { type: String, required: true },
    ngay_sinh: { type: Date },
    cmnd: { type: String, required: true, unique: true },
    so_dien_thoai: { type: String, required: true },
    que_quan: { type: String },
  },
  { collection: 'khach_hang' }
);

KhachHangSchema.index({ cmnd: 1 }, { unique: true });
KhachHangSchema.index({ ho_ten: 'text' });

module.exports = mongoose.model('KhachHang', KhachHangSchema);
