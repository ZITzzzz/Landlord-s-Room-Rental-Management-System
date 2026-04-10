const { z } = require('zod');

const khuCreateSchema = z.object({
  ten: z.string().min(1, 'Tên khu không được trống'),
  dia_chi: z.string().min(1, 'Địa chỉ không được trống'),
  ghi_chu: z.string().optional(),
});

const khuUpdateSchema = z.object({
  ten: z.string().min(1).optional(),
  dia_chi: z.string().min(1).optional(),
  ghi_chu: z.string().optional(),
});

module.exports = { khuCreateSchema, khuUpdateSchema };
