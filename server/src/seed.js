require('dotenv').config();
const mongoose = require('mongoose');
const Khu = require('./models/Khu');
const LoaiPhong = require('./models/LoaiPhong');
const Phong = require('./models/Phong');
const KhachHang = require('./models/KhachHang');
const DonGiaDichVu = require('./models/DonGiaDichVu');
const HopDong = require('./models/HopDong');
const NguoiO = require('./models/NguoiO');
const HoaDon = require('./models/HoaDon');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // Clear all collections
  await Promise.all([
    Khu.deleteMany({}),
    LoaiPhong.deleteMany({}),
    Phong.deleteMany({}),
    KhachHang.deleteMany({}),
    DonGiaDichVu.deleteMany({}),
    HopDong.deleteMany({}),
    NguoiO.deleteMany({}),
    HoaDon.deleteMany({}),
  ]);

  // 2 Khu
  const [khuA, khuB] = await Khu.create([
    { ten: 'Khu A', dia_chi: '123 Đường Láng, Hà Nội', ghi_chu: 'Khu chính' },
    { ten: 'Khu B', dia_chi: '456 Trần Duy Hưng, Hà Nội' },
  ]);

  // 2 Loại phòng
  const [loaiDon, loaiDoi] = await LoaiPhong.create([
    { ten: 'Phòng đơn', suc_chua: 1 },
    { ten: 'Phòng đôi', suc_chua: 2 },
  ]);

  // Đơn giá dịch vụ
  const ngayApDung = new Date('2024-01-01');
  await DonGiaDichVu.create([
    { loai_phong_id: loaiDon._id, loai_dv: 'dien', don_gia: 3500, ngay_ap_dung: ngayApDung },
    { loai_phong_id: loaiDon._id, loai_dv: 'nuoc', don_gia: 15000, ngay_ap_dung: ngayApDung },
    { loai_phong_id: loaiDoi._id, loai_dv: 'dien', don_gia: 3500, ngay_ap_dung: ngayApDung },
    { loai_phong_id: loaiDoi._id, loai_dv: 'nuoc', don_gia: 15000, ngay_ap_dung: ngayApDung },
    { loai_phong_id: null, loai_dv: 've_sinh', don_gia: 20000, ngay_ap_dung: ngayApDung },
    { loai_phong_id: null, loai_dv: 'xe_may', don_gia: 100000, ngay_ap_dung: ngayApDung },
    { loai_phong_id: null, loai_dv: 'xe_dap', don_gia: 50000, ngay_ap_dung: ngayApDung },
  ]);

  // 5 phòng
  const [p1, p2, p3, p4, p5] = await Phong.create([
    { ten: 'P101', khu_id: khuA._id, loai_phong_id: loaiDon._id, gia_thue: 2500000, chi_so_dien_dau: 100, chi_so_nuoc_dau: 50 },
    { ten: 'P102', khu_id: khuA._id, loai_phong_id: loaiDoi._id, gia_thue: 3500000, chi_so_dien_dau: 200, chi_so_nuoc_dau: 80 },
    { ten: 'P201', khu_id: khuA._id, loai_phong_id: loaiDon._id, gia_thue: 2500000, chi_so_dien_dau: 150, chi_so_nuoc_dau: 60 },
    { ten: 'P101', khu_id: khuB._id, loai_phong_id: loaiDoi._id, gia_thue: 3800000, chi_so_dien_dau: 300, chi_so_nuoc_dau: 90 },
    { ten: 'P102', khu_id: khuB._id, loai_phong_id: loaiDon._id, gia_thue: 2800000, chi_so_dien_dau: 120, chi_so_nuoc_dau: 55 },
  ]);

  // 3 khách hàng
  const [kh1, kh2, kh3] = await KhachHang.create([
    { ho_ten: 'Nguyễn Văn An', cmnd: '001234567890', so_dien_thoai: '0912345678', ngay_sinh: new Date('1990-05-15'), que_quan: 'Hà Nội' },
    { ho_ten: 'Trần Thị Bình', cmnd: '001234567891', so_dien_thoai: '0923456789', ngay_sinh: new Date('1995-08-20'), que_quan: 'Nam Định' },
    { ho_ten: 'Lê Văn Cường', cmnd: '001234567892', so_dien_thoai: '0934567890', ngay_sinh: new Date('1988-12-01'), que_quan: 'Thái Bình' },
  ]);

  // 2 hợp đồng + cập nhật trạng thái phòng
  const ngayBatDau1 = new Date('2024-02-01');
  const ngayHetHan1 = new Date('2025-02-01');
  const hd1 = await HopDong.create({
    phong_id: p1._id,
    khach_hang_id: kh1._id,
    ngay_bat_dau: ngayBatDau1,
    ngay_het_han: ngayHetHan1,
    gia_thue_ky_hop_dong: 2500000,
    tien_dat_coc: 2500000,
    so_nguoi_o: 1,
    trang_thai: 'hieu_luc',
  });
  await Phong.findByIdAndUpdate(p1._id, { trang_thai: 'cho_thue' });

  const ngayBatDau2 = new Date('2024-03-01');
  const ngayHetHan2 = new Date('2025-03-01');
  const hd2 = await HopDong.create({
    phong_id: p2._id,
    khach_hang_id: kh2._id,
    ngay_bat_dau: ngayBatDau2,
    ngay_het_han: ngayHetHan2,
    gia_thue_ky_hop_dong: 3500000,
    tien_dat_coc: 3500000,
    so_nguoi_o: 2,
    trang_thai: 'hieu_luc',
  });
  await Phong.findByIdAndUpdate(p2._id, { trang_thai: 'cho_thue' });

  // Người ở
  await NguoiO.create([
    { hop_dong_id: hd1._id, ho_ten: 'Nguyễn Văn An', cmnd: '001234567890', ngay_bat_dau: ngayBatDau1 },
    { hop_dong_id: hd2._id, ho_ten: 'Trần Thị Bình', cmnd: '001234567891', ngay_bat_dau: ngayBatDau2 },
    { hop_dong_id: hd2._id, ho_ten: 'Trần Văn Em', ngay_bat_dau: ngayBatDau2 },
  ]);

  // Một số hóa đơn cho hd1
  const ngayLap = new Date('2024-04-01');
  await HoaDon.create([
    {
      hop_dong_id: hd1._id,
      thang: 3, nam: 2024,
      chi_so_dien_cu: 100, chi_so_dien_moi: 185,
      chi_so_nuoc_cu: 50, chi_so_nuoc_moi: 65,
      so_xe_may: 1, so_xe_dap: 0,
      don_gia_dien: 3500, don_gia_nuoc: 15000,
      don_gia_ve_sinh: 20000, don_gia_xe_may: 100000, don_gia_xe_dap: 50000,
      so_nguoi_o: 1,
      no_thang_truoc: 0,
      tong_tien: 2500000 + 85 * 3500 + 15 * 15000 + 20000 + 100000,
      trang_thai: 'da_thanh_toan',
      ngay_lap: ngayLap,
      han_thanh_toan: new Date('2024-04-08'),
      ngay_thanh_toan: new Date('2024-04-05'),
      phuong_thuc: 'tien_mat',
    },
    {
      hop_dong_id: hd1._id,
      thang: 4, nam: 2024,
      chi_so_dien_cu: 185, chi_so_dien_moi: 265,
      chi_so_nuoc_cu: 65, chi_so_nuoc_moi: 78,
      so_xe_may: 1, so_xe_dap: 0,
      don_gia_dien: 3500, don_gia_nuoc: 15000,
      don_gia_ve_sinh: 20000, don_gia_xe_may: 100000, don_gia_xe_dap: 50000,
      so_nguoi_o: 1,
      no_thang_truoc: 0,
      tong_tien: 2500000 + 80 * 3500 + 13 * 15000 + 20000 + 100000,
      trang_thai: 'chua_thanh_toan',
      ngay_lap: new Date('2024-05-01'),
      han_thanh_toan: new Date('2024-05-08'),
    },
  ]);

  console.log('Seed data created successfully');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
