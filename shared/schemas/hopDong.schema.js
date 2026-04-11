const { z } = require('zod');

const hopDongCreateSchema = z.object({
  phong_id: z.string().min(1, 'Vui lòng chọn phòng'),
  khach_hang_id: z.string().min(1, 'Vui lòng chọn khách hàng'),
  ngay_bat_dau: z.coerce.date({ errorMap: () => ({ message: 'Ngày bắt đầu không hợp lệ' }) }),
  ngay_het_han: z.coerce.date({ errorMap: () => ({ message: 'Ngày hết hạn không hợp lệ' }) }),
  tien_dat_coc: z.number({ invalid_type_error: 'Tiền đặt cọc phải là số' }).positive('Tiền đặt cọc phải lớn hơn 0').int(),
  so_nguoi_o: z.number({ invalid_type_error: 'Số người ở phải là số' }).int().min(1, 'Phải có ít nhất 1 người ở'),
  nguoi_o_ban_dau: z
    .array(z.object({ ho_ten: z.string().min(1, 'Tên người ở không được trống'), cmnd: z.string().optional() }))
    .min(1, 'Phải có ít nhất 1 người ở ban đầu'),
});

const giaHanSchema = z.object({
  han_moi: z.coerce.date({ errorMap: () => ({ message: 'Ngày gia hạn không hợp lệ' }) }),
});

const huyHopDongSchema = z.object({
  ly_do_huy: z.string().min(1, 'Vui lòng nhập lý do hủy'),
});

module.exports = { hopDongCreateSchema, giaHanSchema, huyHopDongSchema };
