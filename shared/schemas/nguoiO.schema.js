const { z } = require('zod');

const nguoiOCreateSchema = z.object({
  ho_ten: z.string().min(1, 'Tên người ở không được trống'),
  cmnd: z.string().optional(),
  ngay_bat_dau: z.coerce.date({ errorMap: () => ({ message: 'Ngày bắt đầu không hợp lệ' }) }),
});

const nguoiOUpdateSchema = z.object({
  ngay_ket_thuc: z.coerce.date({ errorMap: () => ({ message: 'Ngày kết thúc không hợp lệ' }) }),
});

module.exports = { nguoiOCreateSchema, nguoiOUpdateSchema };
