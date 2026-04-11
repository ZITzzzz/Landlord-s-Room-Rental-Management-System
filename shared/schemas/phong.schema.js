const { z } = require('zod');

const phongCreateSchema = z.object({
  ten: z.string().min(1, 'Tên phòng không được trống'),
  khu_id: z.string().min(1, 'Vui lòng chọn khu'),
  loai_phong_id: z.string().min(1, 'Vui lòng chọn loại phòng'),
  gia_thue: z.number({ invalid_type_error: 'Giá thuê phải là số' }).positive('Giá thuê phải lớn hơn 0').int('Giá thuê phải là số nguyên'),
});

// khu_id is intentionally excluded — area cannot be changed after creation
const phongUpdateSchema = z.object({
  ten: z.string().min(1).optional(),
  loai_phong_id: z.string().min(1).optional(),
  gia_thue: z.number().positive().int().optional(),
});

module.exports = { phongCreateSchema, phongUpdateSchema };
