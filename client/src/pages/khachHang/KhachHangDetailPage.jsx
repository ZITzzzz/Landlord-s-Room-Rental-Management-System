import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Button, Descriptions, Form, Input, Modal, Table, Typography,
  Skeleton, Empty, DatePicker, Tag, Space, Card,
} from 'antd';
import { ArrowLeftOutlined, EditOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useKhachHangById, useUpdateKhachHang } from '../../hooks/useKhachHang';
import StatusBadge from '../../components/StatusBadge';

const { Title } = Typography;

const formatVND = (v) => (v != null ? v.toLocaleString('vi-VN') + ' đ' : '—');
const formatDate = (v) => (v ? dayjs(v).format('DD/MM/YYYY') : '—');

export default function KhachHangDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: kh, isLoading } = useKhachHangById(id);
  const updateMutation = useUpdateKhachHang();

  const [form] = Form.useForm();
  const [editOpen, setEditOpen] = useState(false);

  const openEdit = () => {
    form.setFieldsValue({
      ho_ten: kh.ho_ten,
      so_dien_thoai: kh.so_dien_thoai,
      ngay_sinh: kh.ngay_sinh ? dayjs(kh.ngay_sinh) : null,
      que_quan: kh.que_quan,
    });
    setEditOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    await updateMutation.mutateAsync({
      id,
      data: { ...values, ngay_sinh: values.ngay_sinh ? values.ngay_sinh.toISOString() : undefined },
    });
    setEditOpen(false);
  };

  const hopDongColumns = [
    { title: 'Phòng', dataIndex: 'ten_phong', key: 'ten_phong' },
    { title: 'Khu', dataIndex: 'ten_khu', key: 'ten_khu' },
    { title: 'Ngày bắt đầu', dataIndex: 'ngay_bat_dau', key: 'ngay_bat_dau', render: formatDate },
    { title: 'Ngày hết hạn', dataIndex: 'ngay_het_han', key: 'ngay_het_han', render: formatDate },
    {
      title: 'Trạng thái',
      dataIndex: 'trang_thai',
      key: 'trang_thai',
      render: (v) => <StatusBadge status={v} type="hop_dong" />,
    },
  ];

  const noColumns = [
    { title: 'Phòng', dataIndex: 'ten_phong', key: 'ten_phong' },
    { title: 'Số tháng nợ', dataIndex: 'so_thang_no', key: 'so_thang_no', align: 'center' },
    { title: 'Tổng nợ', dataIndex: 'tong_no', key: 'tong_no', align: 'right', render: formatVND },
  ];

  if (isLoading) return <Skeleton active paragraph={{ rows: 10 }} />;
  if (!kh) return null;

  return (
    <>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
          Quay lại
        </Button>
      </Space>

      <Card
        title={<Title level={4} style={{ margin: 0 }}>{kh.ho_ten}</Title>}
        extra={
          <Button icon={<EditOutlined />} onClick={openEdit}>
            Chỉnh sửa
          </Button>
        }
        style={{ marginBottom: 24 }}
      >
        <Descriptions bordered column={2} size="middle">
          <Descriptions.Item label="Họ tên">{kh.ho_ten}</Descriptions.Item>
          <Descriptions.Item label="CMND/CCCD">{kh.cmnd}</Descriptions.Item>
          <Descriptions.Item label="Số điện thoại">{kh.so_dien_thoai}</Descriptions.Item>
          <Descriptions.Item label="Ngày sinh">{formatDate(kh.ngay_sinh)}</Descriptions.Item>
          <Descriptions.Item label="Quê quán" span={2}>{kh.que_quan || '—'}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="Lịch sử hợp đồng" style={{ marginBottom: 24 }}>
        {kh.hop_dong_lich_su?.length > 0 ? (
          <Table
            rowKey="_id"
            dataSource={kh.hop_dong_lich_su}
            columns={hopDongColumns}
            pagination={false}
            size="small"
            bordered
          />
        ) : (
          <Empty description="Chưa có hợp đồng nào" />
        )}
      </Card>

      <Card title="Công nợ theo phòng">
        {kh.no_theo_phong?.length > 0 ? (
          <Table
            rowKey="phong_id"
            dataSource={kh.no_theo_phong}
            columns={noColumns}
            pagination={false}
            size="small"
            bordered
          />
        ) : (
          <Empty description="Không có công nợ" />
        )}
      </Card>

      {/* Edit Modal */}
      <Modal
        title="Chỉnh sửa thông tin khách hàng"
        open={editOpen}
        onOk={handleSubmit}
        onCancel={() => setEditOpen(false)}
        okText="Lưu"
        cancelText="Hủy"
        confirmLoading={updateMutation.isPending}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 8 }}>
          <Form.Item name="ho_ten" label="Họ tên" rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="CMND/CCCD">
            <Input value={kh.cmnd} disabled />
          </Form.Item>
          <Form.Item name="so_dien_thoai" label="Số điện thoại" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="ngay_sinh" label="Ngày sinh">
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>
          <Form.Item name="que_quan" label="Quê quán">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
