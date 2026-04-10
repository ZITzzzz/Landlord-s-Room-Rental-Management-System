const { z } = require('zod');

const loaiPhongCreateSchema = z.object({
  ten: z.string().min(1, 'Tên loại phòng không được trống'),
  suc_chua: z.number().int().min(1).max(4),
});

const loaiPhongUpdateSchema = z.object({
  ten: z.string().min(1).optional(),
  suc_chua: z.number().int().min(1).max(4).optional(),
});

module.exports = { loaiPhongCreateSchema, loaiPhongUpdateSchema };
