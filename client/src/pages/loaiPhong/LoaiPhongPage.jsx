import { useState } from 'react';
import {
  Button, Form, Input, InputNumber, Modal, Table, Space, Typography,
  Skeleton, Tag, Select, DatePicker, Card, Divider,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useLoaiPhongs, useCreateLoaiPhong, useUpdateLoaiPhong, useDeleteLoaiPhong } from '../../hooks/useLoaiPhong';
import { useDonGiaCurrent, useCreateDonGia } from '../../hooks/useDonGia';
import ConfirmDeleteModal from '../../components/ConfirmDeleteModal';

const { Title, Text } = Typography;

const SUC_CHUA_COLOR = { 1: 'blue', 2: 'green', 3: 'orange', 4: 'red' };

const LOAI_DV_LABELS = {
  dien: 'Điện (kWh)',
  nuoc: 'Nước (m³)',
  ve_sinh: 'Vệ sinh (người)',
  xe_may: 'Xe máy (xe)',
  xe_dap: 'Xe đạp (xe)',
};

const LOAI_DV_SHARED = ['ve_sinh', 'xe_may', 'xe_dap'];

const formatVND = (v) => (v != null ? v.toLocaleString('vi-VN') + ' đ' : '—');

function DonGiaSection({ loaiPhong }) {
  const { data: donGias = [], isLoading } = useDonGiaCurrent(loaiPhong._id);
  const createMutation = useCreateDonGia();
  const [form] = Form.useForm();
  const [modalOpen, setModalOpen] = useState(false);

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const loai_dv = values.loai_dv;
    // ve_sinh, xe_may, xe_dap are global rates — send loai_phong_id as null
    const loai_phong_id = LOAI_DV_SHARED.includes(loai_dv) ? null : loaiPhong._id;
    await createMutation.mutateAsync({
      loai_phong_id,
      loai_dv,
      don_gia: values.don_gia,
      ngay_ap_dung: values.ngay_ap_dung.toISOString(),
    });
    form.resetFields();
    setModalOpen(false);
  };

  const columns = [
    {
      title: 'Loại dịch vụ',
      dataIndex: 'loai_dv',
      key: 'loai_dv',
      render: (v) => LOAI_DV_LABELS[v] ?? v,
    },
    {
      title: 'Đơn giá',
      dataIndex: 'don_gia',
      key: 'don_gia',
      align: 'right',
      render: (v) => (v != null ? formatVND(v) : <Text type="secondary">Chưa có</Text>),
    },
    {
      title: 'Ngày áp dụng',
      dataIndex: 'ngay_ap_dung',
      key: 'ngay_ap_dung',
      render: (v) => (v ? dayjs(v).format('DD/MM/YYYY') : '—'),
    },
  ];

  return (
    <Card
      size="small"
      title={`Đơn giá dịch vụ — ${loaiPhong.ten}`}
      extra={
        <Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
          Cập nhật đơn giá
        </Button>
      }
      style={{ marginTop: 24 }}
    >
      {isLoading ? (
        <Skeleton active paragraph={{ rows: 3 }} />
      ) : (
        <Table rowKey="loai_dv" dataSource={donGias} columns={columns} pagination={false} size="small" />
      )}

      <Modal
        title="Thêm đơn giá mới"
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => { setModalOpen(false); form.resetFields(); }}
        okText="Lưu"
        cancelText="Hủy"
        confirmLoading={createMutation.isPending}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 8 }}>
          <Form.Item name="loai_dv" label="Loại dịch vụ" rules={[{ required: true, message: 'Vui lòng chọn loại dịch vụ' }]}>
            <Select
              placeholder="Chọn loại dịch vụ"
              options={Object.entries(LOAI_DV_LABELS).map(([value, label]) => ({ value, label }))}
            />
          </Form.Item>
          <Form.Item name="don_gia" label="Đơn giá (VNĐ)" rules={[{ required: true, message: 'Vui lòng nhập đơn giá' }]}>
            <InputNumber
              min={1}
              style={{ width: '100%' }}
              formatter={(v) => v && `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(v) => v.replace(/,/g, '')}
              placeholder="VD: 4000"
            />
          </Form.Item>
          <Form.Item
            name="ngay_ap_dung"
            label="Ngày áp dụng"
            initialValue={dayjs()}
            rules={[{ required: true, message: 'Vui lòng chọn ngày áp dụng' }]}
          >
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}

export default function LoaiPhongPage() {
  const { data: loaiPhongs = [], isLoading } = useLoaiPhongs();
  const createMutation = useCreateLoaiPhong();
  const updateMutation = useUpdateLoaiPhong();
  const deleteMutation = useDeleteLoaiPhong();

  const [form] = Form.useForm();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [selectedLoaiPhong, setSelectedLoaiPhong] = useState(null);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (record) => {
    setEditing(record);
    form.setFieldsValue({ ten: record.ten, suc_chua: record.suc_chua });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    if (editing) {
      await updateMutation.mutateAsync({ id: editing._id, data: values });
    } else {
      await createMutation.mutateAsync(values);
    }
    setModalOpen(false);
  };

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(deleteTarget._id);
    setDeleteTarget(null);
    if (selectedLoaiPhong?._id === deleteTarget._id) setSelectedLoaiPhong(null);
  };

  const columns = [
    {
      title: 'Tên loại phòng',
      dataIndex: 'ten',
      key: 'ten',
      sorter: (a, b) => a.ten.localeCompare(b.ten),
    },
    {
      title: 'Sức chứa (người)',
      dataIndex: 'suc_chua',
      key: 'suc_chua',
      align: 'center',
      sorter: (a, b) => a.suc_chua - b.suc_chua,
      render: (v) => <Tag color={SUC_CHUA_COLOR[v]}>{v} người</Tag>,
    },
    {
      title: 'Thao tác',
      key: 'action',
      align: 'center',
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            onClick={() => setSelectedLoaiPhong(selectedLoaiPhong?._id === record._id ? null : record)}
          >
            {selectedLoaiPhong?._id === record._id ? 'Ẩn đơn giá' : 'Xem đơn giá'}
          </Button>
          <Button icon={<EditOutlined />} size="small" onClick={() => openEdit(record)}>
            Sửa
          </Button>
          <Button icon={<DeleteOutlined />} size="small" danger onClick={() => setDeleteTarget(record)}>
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  if (isLoading) return <Skeleton active paragraph={{ rows: 4 }} />;

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>Quản lý loại phòng</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          Thêm loại phòng
        </Button>
      </div>

      <Table
        rowKey="_id"
        dataSource={loaiPhongs}
        columns={columns}
        pagination={{ pageSize: 10 }}
        bordered
        size="middle"
      />

      {selectedLoaiPhong && (
        <>
          <Divider />
          <DonGiaSection loaiPhong={selectedLoaiPhong} />
        </>
      )}

      {/* Add / Edit Modal */}
      <Modal
        title={editing ? 'Chỉnh sửa loại phòng' : 'Thêm loại phòng mới'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        okText={editing ? 'Lưu' : 'Thêm'}
        cancelText="Hủy"
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 8 }}>
          <Form.Item
            name="ten"
            label="Tên loại phòng"
            rules={[{ required: true, message: 'Vui lòng nhập tên loại phòng' }]}
          >
            <Input placeholder="VD: Phòng đôi" />
          </Form.Item>
          <Form.Item
            name="suc_chua"
            label="Sức chứa (số người)"
            rules={[{ required: true, message: 'Vui lòng nhập sức chứa' }]}
          >
            <InputNumber min={1} max={4} style={{ width: '100%' }} placeholder="1 – 4" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDeleteModal
        open={!!deleteTarget}
        itemName={deleteTarget?.ten}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteMutation.isPending}
      />
    </>
  );
}
