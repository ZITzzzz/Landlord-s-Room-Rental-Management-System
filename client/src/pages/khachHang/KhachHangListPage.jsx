import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button, Form, Input, Modal, Table, Space, Skeleton, DatePicker, Tag, Empty,
} from 'antd';
import { PlusOutlined, EditOutlined, SearchOutlined } from '@ant-design/icons';
import PageHeader from '../../components/PageHeader';
import dayjs from 'dayjs';
import { useKhachHangs, useCreateKhachHang, useUpdateKhachHang } from '../../hooks/useKhachHang';


export default function KhachHangListPage() {
  const navigate = useNavigate();
  const [rawSearch, setRawSearch] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');

  // Debounce search input 300ms
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(rawSearch), 300);
    return () => clearTimeout(t);
  }, [rawSearch]);

  const { data: khachHangs = [], isLoading } = useKhachHangs(debouncedQ);
  const createMutation = useCreateKhachHang();
  const updateMutation = useUpdateKhachHang();

  const [form] = Form.useForm();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (record) => {
    setEditing(record);
    form.setFieldsValue({
      ho_ten: record.ho_ten,
      cmnd: record.cmnd,
      so_dien_thoai: record.so_dien_thoai,
      ngay_sinh: record.ngay_sinh ? dayjs(record.ngay_sinh) : null,
      que_quan: record.que_quan,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const payload = {
      ...values,
      ngay_sinh: values.ngay_sinh ? values.ngay_sinh.toISOString() : undefined,
    };
    if (editing) {
      const { cmnd: _cmnd, ...updatePayload } = payload;
      await updateMutation.mutateAsync({ id: editing._id, data: updatePayload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    setModalOpen(false);
  };

  const columns = [
    {
      title: 'Họ tên',
      dataIndex: 'ho_ten',
      key: 'ho_ten',
      sorter: (a, b) => a.ho_ten.localeCompare(b.ho_ten),
      render: (v, record) => (
        <a onClick={() => navigate(`/khach-hang/${record._id}`)}>{v}</a>
      ),
    },
    { title: 'CMND/CCCD', dataIndex: 'cmnd', key: 'cmnd' },
    { title: 'Số điện thoại', dataIndex: 'so_dien_thoai', key: 'so_dien_thoai' },
    { title: 'Quê quán', dataIndex: 'que_quan', key: 'que_quan', render: (v) => v || '—' },
    {
      title: 'Phòng đang thuê',
      dataIndex: 'phong_dang_thue',
      key: 'phong_dang_thue',
      render: (arr = []) =>
        arr.length > 0
          ? arr.map((p) => <Tag key={p} color="blue">{p}</Tag>)
          : <span style={{ color: '#999' }}>—</span>,
    },
    {
      title: 'Thao tác',
      key: 'action',
      align: 'center',
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" onClick={() => openEdit(record)}>
            Sửa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Quản lý khách hàng"
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Thêm khách hàng</Button>}
      />

      <Input
        prefix={<SearchOutlined />}
        placeholder="Tìm theo họ tên hoặc CMND/CCCD..."
        allowClear
        value={rawSearch}
        onChange={(e) => setRawSearch(e.target.value)}
        style={{ marginBottom: 16, maxWidth: 400 }}
      />

      {isLoading ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : (
        <Table
          rowKey="_id"
          dataSource={khachHangs}
          columns={columns}
          pagination={{ pageSize: 10 }}
          bordered
          size="middle"
          onRow={(record) => ({ onClick: () => navigate(`/khach-hang/${record._id}`) })}
          rowClassName={() => 'cursor-pointer'}
          locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không có khách hàng nào" /> }}
        />
      )}

      {/* Add / Edit Modal */}
      <Modal
        title={editing ? 'Chỉnh sửa khách hàng' : 'Thêm khách hàng mới'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        okText={editing ? 'Lưu' : 'Thêm'}
        cancelText="Hủy"
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 8 }}>
          <Form.Item name="ho_ten" label="Họ tên" rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}>
            <Input placeholder="Nguyễn Văn A" />
          </Form.Item>
          <Form.Item name="cmnd" label="CMND/CCCD" rules={[{ required: !editing, message: 'Vui lòng nhập CMND/CCCD' }]}>
            <Input placeholder="9–12 chữ số" disabled={!!editing} />
          </Form.Item>
          <Form.Item name="so_dien_thoai" label="Số điện thoại" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}>
            <Input placeholder="0912345678" />
          </Form.Item>
          <Form.Item name="ngay_sinh" label="Ngày sinh">
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Chọn ngày sinh" />
          </Form.Item>
          <Form.Item name="que_quan" label="Quê quán">
            <Input placeholder="Tỉnh/Thành phố" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
