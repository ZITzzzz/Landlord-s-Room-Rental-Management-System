import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Tabs, Button, Form, Input, InputNumber, DatePicker, Table, Space,
  Typography, Card, Descriptions, Skeleton, Empty, Alert, Select,
} from 'antd';
import { SearchOutlined, FilePdfOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useHopDongs, useThanhLy, useHuyHopDong } from '../../hooks/useHopDong';
import StatusBadge from '../../components/StatusBadge';
import { inThanhLy, inHuy } from '../../api/in.api';
import PageHeader from '../../components/PageHeader';

const { Text } = Typography;
const formatDate = (v) => (v ? dayjs(v).format('DD/MM/YYYY') : '—');
const formatVND = (v) => (v != null ? v.toLocaleString('vi-VN') + ' đ' : '—');

// ─── Settlement Tab ───────────────────────────────────────────────────────────
function ThanhLyTab() {
  const [searchParams] = useSearchParams();
  const [selectedId, setSelectedId] = useState(searchParams.get('hop_dong_id') ?? null);
  const [settledId, setSettledId] = useState(null);
  const [q, setQ] = useState('');
  const [result, setResult] = useState(null);
  const [form] = Form.useForm();
  const thanhLyMutation = useThanhLy();

  const { data: hopDongs = [], isLoading } = useHopDongs({ trang_thai: 'hieu_luc', q: q || undefined });

  const selected = hopDongs.find((hd) => hd._id === selectedId);

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const res = await thanhLyMutation.mutateAsync({
      id: selectedId,
      data: {
        ngay_tra: values.ngay_tra.toISOString(),
        ghi_chu_hu_hong: values.ghi_chu_hu_hong,
        tien_boi_thuong: values.tien_boi_thuong ?? 0,
      },
    });
    setSettledId(selectedId);
    setResult(res);
    form.resetFields();
    setSelectedId(null);
  };

  const hdCols = [
    { title: 'Phòng', dataIndex: 'ten_phong', key: 'ten_phong' },
    { title: 'Khu', dataIndex: 'ten_khu', key: 'ten_khu' },
    { title: 'Khách hàng', dataIndex: 'ten_khach_hang', key: 'ten_khach_hang' },
    { title: 'Hết hạn', dataIndex: 'ngay_het_han', key: 'ngay_het_han', render: formatDate },
    {
      title: 'Chọn',
      key: 'action',
      render: (_, r) => (
        <Button size="small" type={selectedId === r._id ? 'primary' : 'default'}
          onClick={() => { setSelectedId(r._id); setResult(null); form.resetFields(); }}
        >
          {selectedId === r._id ? 'Đang chọn' : 'Chọn'}
        </Button>
      ),
    },
  ];

  const noCols = [
    { title: 'Tháng', key: 'ky', render: (_, r) => `${r.thang}/${r.nam}` },
    { title: 'Tổng tiền', dataIndex: 'tong_tien', key: 'tong_tien', align: 'right', render: formatVND },
  ];

  if (result) {
    return (
      <Card title="Kết quả thanh lý">
        <Descriptions bordered column={1} size="middle">
          <Descriptions.Item label="Tiền đặt cọc">{formatVND(result.tien_dat_coc)}</Descriptions.Item>
          <Descriptions.Item label="Tổng nợ">
            <Text type="danger">{formatVND(result.tong_no)}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Tiền bồi thường">
            <Text type="danger">{formatVND(result.tien_boi_thuong)}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Tiền hoàn cọc">
            <strong style={{ color: '#52c41a', fontSize: 16 }}>{formatVND(result.tien_hoan_coc)}</strong>
          </Descriptions.Item>
        </Descriptions>
        {result.hoa_don_con_no?.length > 0 && (
          <Card size="small" title="Hóa đơn còn nợ" style={{ marginTop: 16 }}>
            <Table rowKey="_id" dataSource={result.hoa_don_con_no} columns={noCols} pagination={false} size="small" />
          </Card>
        )}
        <Space style={{ marginTop: 16 }}>
          {settledId && (
            <Button icon={<FilePdfOutlined />} onClick={() => inThanhLy(settledId)}>In biên bản</Button>
          )}
          <Button type="primary" onClick={() => { setResult(null); setSettledId(null); }}>
            Thanh lý hợp đồng khác
          </Button>
        </Space>
      </Card>
    );
  }

  return (
    <Space direction="vertical" style={{ width: '100%' }} size={16}>
      <Input prefix={<SearchOutlined />} placeholder="Tìm phòng / khách hàng..." allowClear
        style={{ maxWidth: 360 }} onChange={(e) => setQ(e.target.value)}
      />
      {isLoading ? <Skeleton active paragraph={{ rows: 4 }} /> : (
        <Table rowKey="_id" dataSource={hopDongs} columns={hdCols} pagination={{ pageSize: 6 }} size="small" bordered />
      )}

      {selected && (
        <Card title={`Thanh lý hợp đồng — Phòng ${selected.ten_phong}`}>
          <Descriptions bordered column={2} size="small" style={{ marginBottom: 16 }}>
            <Descriptions.Item label="Khách hàng">{selected.ten_khach_hang}</Descriptions.Item>
            <Descriptions.Item label="Giá thuê">{formatVND(selected.gia_thue_ky_hop_dong)}</Descriptions.Item>
            <Descriptions.Item label="Ngày bắt đầu">{formatDate(selected.ngay_bat_dau)}</Descriptions.Item>
            <Descriptions.Item label="Ngày hết hạn">{formatDate(selected.ngay_het_han)}</Descriptions.Item>
          </Descriptions>
          <Form form={form} layout="vertical">
            <Form.Item name="ngay_tra" label="Ngày trả phòng" initialValue={dayjs()}
              rules={[{ required: true, message: 'Bắt buộc' }]}
            >
              <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
            </Form.Item>
            <Form.Item name="tien_boi_thuong" label="Tiền bồi thường hư hỏng (VNĐ)" initialValue={0}>
              <InputNumber min={0} style={{ width: '100%' }}
                formatter={(v) => v && `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(v) => v.replace(/,/g, '')}
              />
            </Form.Item>
            <Form.Item name="ghi_chu_hu_hong" label="Ghi chú hư hỏng">
              <Input.TextArea rows={2} placeholder="Mô tả hư hỏng (nếu có)" />
            </Form.Item>
            <Button type="primary" danger onClick={handleSubmit} loading={thanhLyMutation.isPending}>
              Xác nhận thanh lý
            </Button>
          </Form>
        </Card>
      )}
    </Space>
  );
}

// ─── Cancellation Tab ─────────────────────────────────────────────────────────
function HuyHopDongTab() {
  const [selectedId, setSelectedId] = useState(null);
  const [cancelledId, setCancelledId] = useState(null);
  const [q, setQ] = useState('');
  const [result, setResult] = useState(null);
  const [form] = Form.useForm();
  const huyMutation = useHuyHopDong();

  const { data: hopDongs = [], isLoading } = useHopDongs({ trang_thai: 'hieu_luc', q: q || undefined });

  const selected = hopDongs.find((hd) => hd._id === selectedId);

  const handleSubmit = async () => {
    const values = await form.validateFields();
    try {
      const res = await huyMutation.mutateAsync({ id: selectedId, data: { ly_do_huy: values.ly_do_huy } });
      setCancelledId(selectedId);
      setResult(res);
      form.resetFields();
      setSelectedId(null);
    } catch (_) {}
  };

  const hdCols = [
    { title: 'Phòng', dataIndex: 'ten_phong', key: 'ten_phong' },
    { title: 'Khách hàng', dataIndex: 'ten_khach_hang', key: 'ten_khach_hang' },
    { title: 'Hết hạn', dataIndex: 'ngay_het_han', key: 'ngay_het_han', render: formatDate },
    {
      title: 'Chọn',
      key: 'action',
      render: (_, r) => (
        <Button size="small" type={selectedId === r._id ? 'primary' : 'default'}
          onClick={() => { setSelectedId(r._id); setResult(null); form.resetFields(); }}
        >
          {selectedId === r._id ? 'Đang chọn' : 'Chọn'}
        </Button>
      ),
    },
  ];

  const noCols = [
    { title: 'Tháng', key: 'ky', render: (_, r) => `${r.thang}/${r.nam}` },
    { title: 'Tổng tiền', dataIndex: 'tong_tien', key: 'tong_tien', align: 'right', render: formatVND },
  ];

  if (result) {
    return (
      <Card title="Kết quả hủy hợp đồng">
        <Alert message="Hợp đồng đã được hủy. Tiền đặt cọc bị tịch thu." type="warning" showIcon style={{ marginBottom: 16 }} />
        {result.hoa_don_khong_thanh_toan?.length > 0 && (
          <Card size="small" title="Hóa đơn chưa thanh toán">
            <Table rowKey="_id" dataSource={result.hoa_don_khong_thanh_toan} columns={noCols} pagination={false} size="small" />
          </Card>
        )}
        <Space style={{ marginTop: 16 }}>
          {cancelledId && (
            <Button icon={<FilePdfOutlined />} onClick={() => inHuy(cancelledId)}>In biên bản</Button>
          )}
          <Button type="primary" onClick={() => { setResult(null); setCancelledId(null); }}>
            Hủy hợp đồng khác
          </Button>
        </Space>
      </Card>
    );
  }

  return (
    <Space direction="vertical" style={{ width: '100%' }} size={16}>
      <Alert
        message="Điều kiện hủy hợp đồng: khách hàng có ít nhất 2 tháng nợ liên tiếp. Tiền đặt cọc sẽ bị tịch thu."
        type="warning" showIcon
      />
      <Input prefix={<SearchOutlined />} placeholder="Tìm phòng / khách hàng..." allowClear
        style={{ maxWidth: 360 }} onChange={(e) => setQ(e.target.value)}
      />
      {isLoading ? <Skeleton active paragraph={{ rows: 4 }} /> : (
        <Table rowKey="_id" dataSource={hopDongs} columns={hdCols} pagination={{ pageSize: 6 }} size="small" bordered />
      )}

      {selected && (
        <Card title={`Hủy hợp đồng — Phòng ${selected.ten_phong}`}>
          <Form form={form} layout="vertical">
            <Form.Item name="ly_do_huy" label="Lý do hủy" rules={[{ required: true, message: 'Bắt buộc' }]}>
              <Input.TextArea rows={3} placeholder="Mô tả lý do hủy hợp đồng..." />
            </Form.Item>
            <Button type="primary" danger onClick={handleSubmit} loading={huyMutation.isPending}>
              Xác nhận hủy hợp đồng
            </Button>
          </Form>
        </Card>
      )}
    </Space>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ThanhLyPage() {
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('hop_dong_id') ? 'thanh-ly' : 'thanh-ly';

  const tabItems = [
    { key: 'thanh-ly', label: 'Thanh lý hợp đồng', children: <ThanhLyTab /> },
    { key: 'huy', label: 'Hủy hợp đồng', children: <HuyHopDongTab /> },
  ];

  return (
    <>
      <PageHeader title="Thanh lý & Hủy hợp đồng" />
      <Tabs defaultActiveKey={defaultTab} items={tabItems} />
    </>
  );
}
