const { z } = require('zod');

const chiPhiCreateSchema = z.object({
  khu_id: z.string().optional(),
  thang: z
    .number({ invalid_type_error: 'Tháng phải là số' })
    .min(1, 'Tháng phải từ 1 đến 12')
    .max(12, 'Tháng phải từ 1 đến 12'),
  nam: z
    .number({ invalid_type_error: 'Năm phải là số' })
    .min(2001, 'Năm không hợp lệ'),
  loai: z.enum(['dien_nuoc_tong', 'sua_chua_chung', 'khac'], {
    errorMap: () => ({ message: 'Loại chi phí không hợp lệ' }),
  }),
  so_tien: z
    .number({ invalid_type_error: 'Số tiền phải là số' })
    .positive('Số tiền phải lớn hơn 0'),
  ghi_chu: z.string().optional(),
});

const chiPhiUpdateSchema = z.object({
  loai: z
    .enum(['dien_nuoc_tong', 'sua_chua_chung', 'khac'], {
      errorMap: () => ({ message: 'Loại chi phí không hợp lệ' }),
    })
    .optional(),
  so_tien: z
    .number({ invalid_type_error: 'Số tiền phải là số' })
    .positive('Số tiền phải lớn hơn 0')
    .optional(),
  ghi_chu: z.string().optional(),
});

module.exports = { chiPhiCreateSchema, chiPhiUpdateSchema };
