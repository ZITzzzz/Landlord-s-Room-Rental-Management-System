const { z } = require('zod');

const suaChuaCreateSchema = z.object({
  phong_id: z.string().min(1, 'Vui lòng chọn phòng'),
  mo_ta: z.string().min(1, 'Vui lòng nhập mô tả'),
  ngay_phat_sinh: z.coerce.date({ errorMap: () => ({ message: 'Ngày phát sinh không hợp lệ' }) }),
  chi_phi_du_kien: z
    .number({ invalid_type_error: 'Chi phí phải là số' })
    .min(0, 'Chi phí không được âm')
    .optional(),
  do_kh_gay_ra: z.boolean().optional(),
});

const suaChuaUpdateSchema = z.object({
  trang_thai: z.enum(['cho_xu_ly', 'dang_xu_ly', 'hoan_thanh']).optional(),
  chi_phi_thuc_te: z
    .number({ invalid_type_error: 'Chi phí phải là số' })
    .min(0, 'Chi phí không được âm')
    .optional(),
  mo_ta: z.string().min(1, 'Mô tả không được rỗng').optional(),
});

module.exports = { suaChuaCreateSchema, suaChuaUpdateSchema };
