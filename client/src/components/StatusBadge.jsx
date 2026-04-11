import { Tag } from 'antd';

const STATUS_MAP = {
  phong: {
    trong: ['green', 'Trống'],
    cho_thue: ['blue', 'Đang thuê'],
    dat_coc: ['orange', 'Đặt cọc'],
    sua_chua: ['red', 'Sửa chữa'],
  },
  hop_dong: {
    hieu_luc: ['blue', 'Hiệu lực'],
    thanh_ly: ['green', 'Thanh lý'],
    huy: ['red', 'Đã hủy'],
  },
  hoa_don: {
    chua_thanh_toan: ['orange', 'Chưa thanh toán'],
    da_thanh_toan: ['green', 'Đã thanh toán'],
  },
  dat_coc: {
    con_hieu_luc: ['blue', 'Hiệu lực'],
    da_chuyen_hop_dong: ['green', 'Đã ký HĐ'],
    huy: ['red', 'Đã hủy'],
  },
};

export default function StatusBadge({ status, type = 'phong' }) {
  const map = STATUS_MAP[type] ?? {};
  const [color, label] = map[status] ?? ['default', status];
  return <Tag color={color}>{label}</Tag>;
}
