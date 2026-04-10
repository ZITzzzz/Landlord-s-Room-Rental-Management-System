const mongoose = require('mongoose');

const HoaDonSchema = new mongoose.Schema(
  {
    hop_dong_id: { type: mongoose.Schema.Types.ObjectId, ref: 'HopDong', required: true },
    thang: { type: Number, required: true, min: 1, max: 12 },
    nam: { type: Number, required: true, min: 2001 },
    chi_so_dien_cu: { type: Number, required: true, min: 0 },
    chi_so_dien_moi: { type: Number, required: true, min: 0 },
    chi_so_nuoc_cu: { type: Number, required: true, min: 0 },
    chi_so_nuoc_moi: { type: Number, required: true, min: 0 },
    so_xe_may: { type: Number, required: true, min: 0 },
    so_xe_dap: { type: Number, required: true, min: 0 },
    // Snapshots at invoice creation
    don_gia_dien: { type: Number, required: true },
    don_gia_nuoc: { type: Number, required: true },
    don_gia_ve_sinh: { type: Number, required: true },
    don_gia_xe_may: { type: Number, required: true },
    don_gia_xe_dap: { type: Number, required: true },
    so_nguoi_o: { type: Number, required: true },
    no_thang_truoc: { type: Number, default: 0 },
    tong_tien: { type: Number, required: true },
    trang_thai: {
      type: String,
      enum: ['chua_thanh_toan', 'da_thanh_toan'],
      default: 'chua_thanh_toan',
    },
    ngay_lap: { type: Date, required: true },
    han_thanh_toan: { type: Date, required: true },
    ngay_thanh_toan: { type: Date },
    phuong_thuc: { type: String, enum: ['tien_mat', 'chuyen_khoan'] },
    ma_giao_dich: { type: String },
  },
  { collection: 'hoa_don' }
);

HoaDonSchema.index({ hop_dong_id: 1, thang: 1, nam: 1 }, { unique: true });
HoaDonSchema.index({ trang_thai: 1, han_thanh_toan: 1 });

module.exports = mongoose.model('HoaDon', HoaDonSchema);
