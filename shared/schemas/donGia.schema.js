const { z } = require('zod');

const donGiaCreateSchema = z.object({
  loai_phong_id: z.string().nullable().optional(),
  loai_dv: z.enum(['dien', 'nuoc', 've_sinh', 'xe_may', 'xe_dap'], {
    errorMap: () => ({ message: 'Loại dịch vụ không hợp lệ' }),
  }),
  don_gia: z.number({ invalid_type_error: 'Đơn giá phải là số' }).positive('Đơn giá phải lớn hơn 0').int('Đơn giá phải là số nguyên'),
  ngay_ap_dung: z.coerce.date({ errorMap: () => ({ message: 'Ngày áp dụng không hợp lệ' }) }),
});

module.exports = { donGiaCreateSchema };
