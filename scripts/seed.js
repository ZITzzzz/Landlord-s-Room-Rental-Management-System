require('../server/node_modules/dotenv').config({ path: require('path').join(__dirname, '../server/.env') });
// Fallback: also try root .env
if (!process.env.MONGODB_URI) require('../server/node_modules/dotenv').config({ path: require('path').join(__dirname, '../.env') });

const mongoose = require('../server/node_modules/mongoose');

// Models
const Khu = require('../server/src/models/Khu');
const LoaiPhong = require('../server/src/models/LoaiPhong');
const DonGiaDichVu = require('../server/src/models/DonGiaDichVu');
const Phong = require('../server/src/models/Phong');
const KhachHang = require('../server/src/models/KhachHang');
const DatCoc = require('../server/src/models/DatCoc');
const HopDong = require('../server/src/models/HopDong');
const NguoiO = require('../server/src/models/NguoiO');
const HoaDon = require('../server/src/models/HoaDon');
const ChiPhiVanHanh = require('../server/src/models/ChiPhiVanHanh');

// ─── Helpers ──────────────────────────────────────────────────────────────────

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[rand(0, arr.length - 1)];
const roundK = (n) => Math.round(n / 1000) * 1000;

const HO = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Đặng', 'Bùi'];
const TEN_DEM = ['Văn', 'Thị', 'Minh', 'Quốc', 'Anh', 'Thu', 'Hồng', 'Đức', 'Thành', 'Kim'];
const TEN = ['An', 'Bình', 'Chi', 'Dung', 'Em', 'Giang', 'Hà', 'Lan', 'Mai', 'Nam',
             'Nga', 'Oanh', 'Phúc', 'Quân', 'Sơn', 'Tâm', 'Uyên', 'Vân', 'Xuân', 'Yến'];

const randomName = () => `${pick(HO)} ${pick(TEN_DEM)} ${pick(TEN)}`;
const randomPhone = () => `09${rand(10000000, 99999999)}`;
const randomDOB = () => new Date(rand(1975, 2000), rand(0, 11), rand(1, 28));

const addMonths = (date, n) => {
  const d = new Date(date);
  d.setMonth(d.getMonth() + n);
  return d;
};

const daysInMonth = (year, month) => new Date(year, month, 0).getDate();

// Tính tiền phòng pro-rata
const tinhTienPhong = (gia, batDau, thang, nam) => {
  const ngayTrongThang = daysInMonth(nam, thang);
  const isFirstMonth = batDau.getFullYear() === nam && batDau.getMonth() === thang - 1;
  if (!isFirstMonth) return gia;
  if (batDau.getDate() === 1) return gia;
  const daysStayed = ngayTrongThang - batDau.getDate() + 1;
  return roundK((gia * daysStayed) / ngayTrongThang);
};

// ─── Main seed ────────────────────────────────────────────────────────────────

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB connected\n');

  // ── STEP 1: LoaiPhong ──
  const loaiPhongDefs = [
    { ten: '1 người', suc_chua: 1 },
    { ten: '2 người', suc_chua: 2 },
    { ten: '4 người', suc_chua: 4 },
  ];
  const loaiPhongs = [];
  let lpCreated = 0, lpReused = 0;
  for (const def of loaiPhongDefs) {
    let lp = await LoaiPhong.findOne({ ten: def.ten });
    if (!lp) { lp = await LoaiPhong.create(def); lpCreated++; } else { lpReused++; }
    loaiPhongs.push(lp);
  }
  console.log(`✅ LoaiPhong: created ${lpCreated}, reused ${lpReused}`);

  // ── STEP 2: DonGiaDichVu ──
  const now = new Date();
  const GIA = {
    dien:      [3500, 3800, 3200],   // per loaiPhong index
    nuoc:      [15000, 14000, 13000],
    ve_sinh:   25000,
    xe_may:    80000,
    xe_dap:    20000,
  };

  let dgCreated = 0, dgReused = 0;
  for (let i = 0; i < loaiPhongs.length; i++) {
    for (const loai_dv of ['dien', 'nuoc']) {
      const existing = await DonGiaDichVu.findOne({ loai_phong_id: loaiPhongs[i]._id, loai_dv });
      if (!existing) {
        await DonGiaDichVu.create({
          loai_phong_id: loaiPhongs[i]._id,
          loai_dv,
          don_gia: loai_dv === 'dien' ? GIA.dien[i] : GIA.nuoc[i],
          ngay_ap_dung: new Date('2024-01-01'),
        });
        dgCreated++;
      } else { dgReused++; }
    }
  }
  for (const loai_dv of ['ve_sinh', 'xe_may', 'xe_dap']) {
    const existing = await DonGiaDichVu.findOne({ loai_phong_id: null, loai_dv });
    if (!existing) {
      await DonGiaDichVu.create({
        loai_phong_id: null,
        loai_dv,
        don_gia: GIA[loai_dv],
        ngay_ap_dung: new Date('2024-01-01'),
      });
      dgCreated++;
    } else { dgReused++; }
  }
  console.log(`✅ DonGiaDichVu: created ${dgCreated}, reused ${dgReused}`);

  // Helper: lấy đơn giá hiệu lực
  const getDonGia = async (loai_phong_id, loai_dv) => {
    const dg = await DonGiaDichVu.findOne({
      loai_phong_id: loai_phong_id || null,
      loai_dv,
      ngay_ap_dung: { $lte: now },
    }).sort({ ngay_ap_dung: -1 });
    return dg?.don_gia ?? 0;
  };

  // ── STEP 3: Khu mới ──
  const khuSuffix = Date.now().toString().slice(-6);
  const khu = await Khu.create({
    ten: `Khu Demo ${khuSuffix}`,
    dia_chi: `${rand(1, 999)} Đường Lê Lợi, Q.${rand(1, 12)}, TP.HCM`,
  });
  console.log(`✅ Khu: "${khu.ten}"`);

  // ── STEP 4: 12 Phòng ──
  const phongDefs = [
    ...Array.from({ length: 4 }, (_, i) => ({
      ten: `P10${i + 1}`, loai: loaiPhongs[0],
      gia_thue: rand(1800, 2200) * 1000,
    })),
    ...Array.from({ length: 4 }, (_, i) => ({
      ten: `P20${i + 1}`, loai: loaiPhongs[1],
      gia_thue: rand(2800, 3200) * 1000,
    })),
    ...Array.from({ length: 4 }, (_, i) => ({
      ten: `P40${i + 1}`, loai: loaiPhongs[2],
      gia_thue: rand(4500, 5000) * 1000,
    })),
  ];

  const phongs = await Promise.all(phongDefs.map((p) =>
    Phong.create({
      ten: p.ten,
      khu_id: khu._id,
      loai_phong_id: p.loai._id,
      gia_thue: p.gia_thue,
      trang_thai: 'trong',
      chi_so_dien_dau: rand(100, 500),
      chi_so_nuoc_dau: rand(10, 100),
    })
  ));
  console.log(`✅ Phong: ${phongs.length} phòng`);

  // ── STEP 5: 10 KhachHang ──
  const khachHangs = [];
  const usedCmnd = new Set();
  while (khachHangs.length < 10) {
    const cmnd = String(rand(100000000, 999999999));
    if (usedCmnd.has(cmnd)) continue;
    const existing = await KhachHang.findOne({ cmnd });
    if (existing) { usedCmnd.add(cmnd); continue; }
    usedCmnd.add(cmnd);
    const kh = await KhachHang.create({
      ho_ten: randomName(),
      cmnd,
      so_dien_thoai: randomPhone(),
      ngay_sinh: randomDOB(),
      que_quan: pick(['Hà Nội', 'TP.HCM', 'Đà Nẵng', 'Cần Thơ', 'Huế', 'Nghệ An']),
    });
    khachHangs.push(kh);
  }
  console.log(`✅ KhachHang: ${khachHangs.length} người`);

  // ── STEP 6: 2 DatCoc ──
  const phongDatCoc = phongs.slice(0, 2);
  let datCocCount = 0;
  for (let i = 0; i < 2; i++) {
    const kh = khachHangs[i];
    const phong = phongDatCoc[i];
    await DatCoc.create({
      phong_id: phong._id,
      khach_hang_id: kh._id,
      so_tien: phong.gia_thue,
      ngay_dat_coc: addMonths(now, -rand(1, 3)),
      trang_thai: 'con_hieu_luc',
    });
    await Phong.findByIdAndUpdate(phong._id, { trang_thai: 'dat_coc' });
    datCocCount++;
  }
  console.log(`✅ DatCoc: ${datCocCount}`);

  // ── STEP 7: 6 HopDong ──
  const phongChoThue = phongs.slice(2, 8);
  const hopDongs = [];
  let nguoiOCount = 0;

  for (let i = 0; i < phongChoThue.length; i++) {
    const phong = phongChoThue[i];
    const kh = khachHangs[i + 2];
    const monthsBack = rand(2, 6);
    const ngay_bat_dau = addMonths(now, -monthsBack);
    ngay_bat_dau.setDate(1); // đơn giản hóa: bắt đầu ngày 1
    const ngay_het_han = addMonths(ngay_bat_dau, rand(6, 12));
    const soNguoi = phong.loai_phong_id.equals(loaiPhongs[2]._id) ? rand(2, 4) : rand(1, 2);

    const hd = await HopDong.create({
      phong_id: phong._id,
      khach_hang_id: kh._id,
      ngay_bat_dau,
      ngay_het_han,
      gia_thue_ky_hop_dong: phong.gia_thue,
      tien_dat_coc: phong.gia_thue,
      so_nguoi_o: soNguoi,
      trang_thai: 'hieu_luc',
    });

    // NguoiO
    const nguoiOList = [];
    for (let n = 0; n < soNguoi; n++) {
      const nguoiO = await NguoiO.create({
        hop_dong_id: hd._id,
        ho_ten: n === 0 ? kh.ho_ten : randomName(),
        cmnd: n === 0 ? kh.cmnd : undefined,
        ngay_bat_dau,
        ngay_ket_thuc: null,
      });
      nguoiOList.push(nguoiO);
      nguoiOCount++;
    }

    await Phong.findByIdAndUpdate(phong._id, { trang_thai: 'cho_thue' });
    hopDongs.push({ hd, phong, soNguoi, ngay_bat_dau, monthsBack });
  }
  console.log(`✅ HopDong: ${hopDongs.length} (+ ${nguoiOCount} NguoiO)`);

  // ── STEP 8: HoaDon ──
  let hdTT = 0, hdChuaTT = 0;

  for (const { hd, phong, soNguoi, ngay_bat_dau, monthsBack } of hopDongs) {
    const loaiPhong = await LoaiPhong.findById(phong.loai_phong_id);

    const donGiaDien = await getDonGia(phong.loai_phong_id, 'dien');
    const donGiaNuoc = await getDonGia(phong.loai_phong_id, 'nuoc');
    const donGiaVeSinh = await getDonGia(null, 've_sinh');
    const donGiaXeMay = await getDonGia(null, 'xe_may');
    const donGiaXeDap = await getDonGia(null, 'xe_dap');

    let chiSoDienCu = phong.chi_so_dien_dau;
    let chiSoNuocCu = phong.chi_so_nuoc_dau;

    for (let m = 0; m <= monthsBack; m++) {
      const invoiceDate = addMonths(ngay_bat_dau, m);
      const thang = invoiceDate.getMonth() + 1;
      const nam = invoiceDate.getFullYear();

      // Không tạo hóa đơn cho tháng tương lai
      if (nam > now.getFullYear() || (nam === now.getFullYear() && thang > now.getMonth() + 1)) break;

      const chiSoDienMoi = chiSoDienCu + rand(80, 200);
      const chiSoNuocMoi = chiSoNuocCu + rand(5, 20);
      const soXeMay = rand(0, loaiPhong.suc_chua);
      const soXeDap = rand(0, 1);

      const tienPhong = tinhTienPhong(hd.gia_thue_ky_hop_dong, ngay_bat_dau, thang, nam);
      const tienDien = (chiSoDienMoi - chiSoDienCu) * donGiaDien;
      const tienNuoc = (chiSoNuocMoi - chiSoNuocCu) * donGiaNuoc;
      const tienVeSinh = soNguoi * donGiaVeSinh;
      const tienXeMay = soXeMay * donGiaXeMay;
      const tienXeDap = soXeDap * donGiaXeDap;
      const tongTien = tienPhong + tienDien + tienNuoc + tienVeSinh + tienXeMay + tienXeDap;

      const ngayLap = new Date(nam, thang - 1, 28);
      const hanTT = new Date(nam, thang, 7); // 7 ngày sau cuối tháng

      // Tháng cuối (tháng hiện tại) → chua_thanh_toan
      const isLatestMonth = nam === now.getFullYear() && thang === now.getMonth() + 1;
      // 30% cơ hội cũng chua_thanh_toan cho tháng trước
      const chuaTT = isLatestMonth || (!isLatestMonth && m === monthsBack - 1 && Math.random() < 0.3);

      const hoaDonData = {
        hop_dong_id: hd._id,
        thang,
        nam,
        chi_so_dien_cu: chiSoDienCu,
        chi_so_dien_moi: chiSoDienMoi,
        chi_so_nuoc_cu: chiSoNuocCu,
        chi_so_nuoc_moi: chiSoNuocMoi,
        so_xe_may: soXeMay,
        so_xe_dap: soXeDap,
        don_gia_dien: donGiaDien,
        don_gia_nuoc: donGiaNuoc,
        don_gia_ve_sinh: donGiaVeSinh,
        don_gia_xe_may: donGiaXeMay,
        don_gia_xe_dap: donGiaXeDap,
        so_nguoi_o: soNguoi,
        no_thang_truoc: 0,
        tong_tien: tongTien,
        ngay_lap: ngayLap,
        han_thanh_toan: hanTT,
        trang_thai: chuaTT ? 'chua_thanh_toan' : 'da_thanh_toan',
        ...(chuaTT ? {} : {
          ngay_thanh_toan: new Date(nam, thang - 1, rand(28, 30)),
          phuong_thuc: pick(['tien_mat', 'chuyen_khoan']),
        }),
      };

      await HoaDon.create(hoaDonData);
      if (chuaTT) hdChuaTT++; else hdTT++;

      chiSoDienCu = chiSoDienMoi;
      chiSoNuocCu = chiSoNuocMoi;
    }
  }
  console.log(`✅ HoaDon: ${hdTT + hdChuaTT} (${hdTT} đã TT, ${hdChuaTT} chưa TT)`);

  // ── STEP 9: ChiPhiVanHanh (3 tháng gần nhất) ──
  let cpCount = 0;
  for (let m = 2; m >= 0; m--) {
    const d = addMonths(now, -m);
    const thang = d.getMonth() + 1;
    const nam = d.getFullYear();

    await ChiPhiVanHanh.create({
      khu_id: null,
      thang, nam,
      loai: 'dien_nuoc_tong',
      so_tien: rand(2, 5) * 1_000_000,
      ghi_chu: `Tiền điện nước tổng tháng ${thang}/${nam}`,
    });
    cpCount++;

    if (Math.random() > 0.4) {
      await ChiPhiVanHanh.create({
        khu_id: khu._id,
        thang, nam,
        loai: 'khac',
        so_tien: rand(500, 2000) * 1000,
        ghi_chu: `Chi phí vận hành ${khu.ten} tháng ${thang}/${nam}`,
      });
      cpCount++;
    }
  }
  console.log(`✅ ChiPhiVanHanh: ${cpCount} khoản`);

  console.log('\n🎉 Seed hoàn thành!');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('❌ Seed thất bại:', err.message);
  process.exit(1);
});
