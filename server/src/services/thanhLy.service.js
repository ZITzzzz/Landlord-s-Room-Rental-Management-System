const HopDong = require('../models/HopDong');
const HoaDon = require('../models/HoaDon');
const Phong = require('../models/Phong');

const thanhLy = async (hop_dong_id, data) => {
  const hopDong = await HopDong.findById(hop_dong_id).lean();
  if (!hopDong) throw Object.assign(new Error('Không tìm thấy hợp đồng'), { status: 404 });

  if (hopDong.trang_thai !== 'hieu_luc') {
    throw Object.assign(new Error('Chỉ có thể thanh lý hợp đồng đang hiệu lực'), { status: 400 });
  }

  const hoa_don_con_no = await HoaDon.find({ hop_dong_id, trang_thai: 'chua_thanh_toan' })
    .sort({ nam: 1, thang: 1 })
    .lean();

  const tong_no = hoa_don_con_no.reduce((sum, hd) => sum + hd.tong_tien, 0);
  const tien_dat_coc = hopDong.tien_dat_coc;
  const tien_boi_thuong = data.tien_boi_thuong ?? 0;
  const tien_hoan_coc = Math.max(0, tien_dat_coc - tong_no - tien_boi_thuong);

  await HopDong.findByIdAndUpdate(hop_dong_id, {
    trang_thai: 'thanh_ly',
    ngay_thanh_ly: new Date(data.ngay_tra),
  });

  await Phong.findByIdAndUpdate(hopDong.phong_id, { trang_thai: 'trong' });

  const updatedHopDong = await HopDong.findById(hop_dong_id).lean();

  return { hop_dong: updatedHopDong, tien_dat_coc, tong_no, tien_boi_thuong, tien_hoan_coc, hoa_don_con_no };
};

const huyHopDong = async (hop_dong_id, ly_do_huy) => {
  const hopDong = await HopDong.findById(hop_dong_id).lean();
  if (!hopDong) throw Object.assign(new Error('Không tìm thấy hợp đồng'), { status: 404 });

  if (hopDong.trang_thai !== 'hieu_luc') {
    throw Object.assign(new Error('Chỉ có thể hủy hợp đồng đang hiệu lực'), { status: 400 });
  }

  // Check for >= 2 consecutive unpaid months
  const unpaid = await HoaDon.find({ hop_dong_id, trang_thai: 'chua_thanh_toan' })
    .sort({ nam: 1, thang: 1 })
    .lean();

  let hasConsecutive = false;
  for (let i = 0; i < unpaid.length - 1; i++) {
    const curr = unpaid[i].nam * 12 + unpaid[i].thang;
    const next = unpaid[i + 1].nam * 12 + unpaid[i + 1].thang;
    if (next - curr === 1) { hasConsecutive = true; break; }
  }

  if (!hasConsecutive) {
    throw Object.assign(
      new Error('Cần ít nhất 2 tháng nợ liên tiếp để hủy hợp đồng'),
      { status: 400 }
    );
  }

  await HopDong.findByIdAndUpdate(hop_dong_id, {
    trang_thai: 'huy',
    ngay_huy: new Date(),
    ly_do_huy,
  });

  await Phong.findByIdAndUpdate(hopDong.phong_id, { trang_thai: 'trong' });

  const updatedHopDong = await HopDong.findById(hop_dong_id).lean();

  return { hop_dong: updatedHopDong, hoa_don_khong_thanh_toan: unpaid };
};

module.exports = { thanhLy, huyHopDong };
