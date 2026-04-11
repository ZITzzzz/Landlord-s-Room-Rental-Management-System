const { z } = require('zod');

const khachHangCreateSchema = z.object({
  ho_ten: z.string().min(1, 'Họ tên không được trống'),
  cmnd: z.string().min(9, 'CMND/CCCD phải có ít nhất 9 ký tự').max(12, 'CMND/CCCD tối đa 12 ký tự'),
  so_dien_thoai: z.string().min(9, 'Số điện thoại không hợp lệ'),
  ngay_sinh: z.coerce.date().optional(),
  que_quan: z.string().optional(),
});

// cmnd is intentionally excluded — cannot be updated after creation
const khachHangUpdateSchema = z.object({
  ho_ten: z.string().min(1).optional(),
  so_dien_thoai: z.string().min(9).optional(),
  ngay_sinh: z.coerce.date().optional(),
  que_quan: z.string().optional(),
});

module.exports = { khachHangCreateSchema, khachHangUpdateSchema };
