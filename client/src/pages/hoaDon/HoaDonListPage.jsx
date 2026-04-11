import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button, Table, Space, Typography, Select, Modal, Form, Skeleton, Descriptions, Tag,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useHoaDons, useThanhToan } from '../../hooks/useHoaDon';
import StatusBadge from '../../components/StatusBadge';

const { Title, Text } = Typography;
const formatDate = (v) => (v ? dayjs(v).format('DD/MM/YYYY') : '—');
const formatVND = (v) => (v != null ? v.toLocaleString('vi-VN') + ' đ' : '—');

const MONTHS = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: `T${i + 1}` }));
const thisYear = dayjs().year();
const YEARS = Array.from({ length: 5 }, (_, i) => ({ value: thisYear - i, label: String(thisYear - i) }));

function ThanhToanModal({ hoaDon, onClose }) {
  const [form] = Form.useForm();
  const thanhToanMutation = useThanhToan();

  const handleOk = async () => {
    const values = await form.validateFields();
    await thanhToanMutation.mutateAsync({ id: hoaDon._id, data: values });
    onClose();
  };

  return (
    <Modal
      title={`Thanh toán hóa đơn — ${hoaDon?.ten_phong}`}
      open={!!hoaDon} onOk={handleOk} onCancel={onClose}
      okText="Xác nhận thanh toán" cancelText="Hủy"
      confirmLoading={thanhToanMutation.isPending} destroyOnClose
    >
      {hoaDon && (
        <>
          <Descriptions bordered column={1} size="small" style={{ marginBottom: 16 }}>
            <Descriptions.Item label="Tháng">{hoaDon.thang}/{hoaDon.nam}</Descriptions.Item>
            <Descriptions.Item label="Khách hàng">{hoaDon.ten_khach_hang}</Descriptions.Item>
            <Descriptions.Item label="Tổng tiền">
              <strong style={{ color: '#1677ff' }}>{formatVND(hoaDon.tong_tien)}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Hạn thanh toán">
              {formatDate(hoaDon.han_thanh_toan)}
            </Descriptions.Item>
          </Descriptions>
          <Form form={form} layout="vertical">
            <Form.Item name="phuong_thuc" label="Phương thức thanh toán"
              rules={[{ required: true, message: 'Vui lòng chọn phương thức' }]}
            >
              <Select options={[
                { value: 'tien_mat', label: 'Tiền mặt' },
                { value: 'chuyen_khoan', label: 'Chuyển khoản' },
              ]} placeholder="Chọn phương thức" />
            </Form.Item>
            <Form.Item name="ma_giao_dich" label="Mã giao dịch (tùy chọn)">
              <Form.Item noStyle shouldUpdate={(prev, curr) => prev.phuong_thuc !== curr.phuong_thuc}>
                {({ getFieldValue }) =>
                  getFieldValue('phuong_thuc') === 'chuyen_khoan'
                    ? <input placeholder="Mã giao dịch chuyển khoản" style={{ width: '100%', padding: '4px 8px', border: '1px solid #d9d9d9', borderRadius: 6 }} />
                    : null
                }
              </Form.Item>
            </Form.Item>
          </Form>
        </>
      )}
    </Modal>
  );
}

export default function HoaDonListPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ trang_thai: 'chua_thanh_toan' });
  const [thanhToanTarget, setThanhToanTarget] = useState(null);
  const { data: hoaDons = [], isLoading } = useHoaDons(filters);

  const columns = [
    { title: 'Phòng', dataIndex: 'ten_phong', key: 'ten_phong' },
    { title: 'Khách hàng', dataIndex: 'ten_khach_hang', key: 'ten_khach_hang' },
    { title: 'Tháng', key: 'ky', render: (_, r) => `${r.thang}/${r.nam}` },
    { title: 'Tổng tiền', dataIndex: 'tong_tien', key: 'tong_tien', align: 'right', render: formatVND },
    { title: 'Ngày lập', dataIndex: 'ngay_lap', key: 'ngay_lap', render: formatDate },
    { title: 'Hạn TT', dataIndex: 'han_thanh_toan', key: 'han_tt', render: (v) => {
      const isOverdue = dayjs(v).isBefore(dayjs(), 'day');
      return <span style={{ color: isOverdue && filters.trang_thai === 'chua_thanh_toan' ? '#f5222d' : undefined }}>{formatDate(v)}</span>;
    }},
    { title: 'Trạng thái', dataIndex: 'trang_thai', key: 'tt', render: (v) => <StatusBadge status={v} type="hoa_don" /> },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) =>
        record.trang_thai === 'chua_thanh_toan' ? (
          <Button size="small" type="primary" onClick={() => setThanhToanTarget(record)}>Thanh toán</Button>
        ) : (
          <Text type="secondary" style={{ fontSize: 12 }}>{formatDate(record.ngay_thanh_toan)}</Text>
        ),
    },
  ];

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>Quản lý hóa đơn</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/hoa-don/lap')}>
          Lập hóa đơn
        </Button>
      </div>

      <Space style={{ marginBottom: 16 }} wrap>
        <Select
          value={filters.trang_thai ?? null}
          allowClear placeholder="Trạng thái" style={{ width: 180 }}
          options={[
            { value: 'chua_thanh_toan', label: 'Chưa thanh toán' },
            { value: 'da_thanh_toan', label: 'Đã thanh toán' },
          ]}
          onChange={(v) => setFilters((f) => ({ ...f, trang_thai: v }))}
        />
        <Select allowClear placeholder="Tháng" style={{ width: 100 }} options={MONTHS}
          onChange={(v) => setFilters((f) => ({ ...f, thang: v }))}
        />
        <Select allowClear placeholder="Năm" style={{ width: 100 }} options={YEARS}
          onChange={(v) => setFilters((f) => ({ ...f, nam: v }))}
        />
      </Space>

      {isLoading ? (
        <Skeleton active paragraph={{ rows: 8 }} />
      ) : (
        <Table rowKey="_id" dataSource={hoaDons} columns={columns} pagination={{ pageSize: 10 }} bordered size="middle" />
      )}

      <ThanhToanModal hoaDon={thanhToanTarget} onClose={() => setThanhToanTarget(null)} />
    </>
  );
}
