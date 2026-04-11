const { z } = require('zod');

const datCocCreateSchema = z.object({
  phong_id: z.string().min(1, 'Vui lòng chọn phòng'),
  khach_hang_id: z.string().min(1, 'Vui lòng chọn khách hàng'),
  so_tien: z.number({ invalid_type_error: 'Số tiền phải là số' }).positive('Số tiền phải lớn hơn 0').int('Số tiền phải là số nguyên'),
  ngay_dat_coc: z.coerce.date({ errorMap: () => ({ message: 'Ngày đặt cọc không hợp lệ' }) }),
});

const datCocHuySchema = z.object({
  ly_do_huy: z.string().min(1, 'Vui lòng nhập lý do hủy'),
});

module.exports = { datCocCreateSchema, datCocHuySchema };
