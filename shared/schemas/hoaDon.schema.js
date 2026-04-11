const { z } = require('zod');

const hoaDonCreateSchema = z.object({
  hop_dong_id: z.string().min(1, 'Vui lòng chọn hợp đồng'),
  thang: z.number({ invalid_type_error: 'Tháng phải là số' }).int().min(1).max(12),
  nam: z.number({ invalid_type_error: 'Năm phải là số' }).int().min(2001),
  chi_so_dien_moi: z.number({ invalid_type_error: 'Chỉ số điện phải là số' }).int().min(0),
  chi_so_nuoc_moi: z.number({ invalid_type_error: 'Chỉ số nước phải là số' }).int().min(0),
  so_xe_may: z.number({ invalid_type_error: 'Số xe máy phải là số' }).int().min(0),
  so_xe_dap: z.number({ invalid_type_error: 'Số xe đạp phải là số' }).int().min(0),
});

const thanhToanSchema = z.object({
  phuong_thuc: z.enum(['tien_mat', 'chuyen_khoan'], {
    errorMap: () => ({ message: 'Phương thức thanh toán không hợp lệ' }),
  }),
  ma_giao_dich: z.string().optional(),
});

module.exports = { hoaDonCreateSchema, thanhToanSchema };
