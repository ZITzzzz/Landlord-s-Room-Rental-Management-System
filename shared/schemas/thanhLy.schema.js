const { z } = require('zod');

const thanhLySchema = z.object({
  ngay_tra: z.coerce.date({ errorMap: () => ({ message: 'Ngày trả phòng không hợp lệ' }) }),
  ghi_chu_hu_hong: z.string().optional(),
  tien_boi_thuong: z.number({ invalid_type_error: 'Tiền bồi thường phải là số' }).int().min(0),
});

module.exports = { thanhLySchema };
