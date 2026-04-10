import { useState } from 'react';
import { Button, Form, Input, InputNumber, Modal, Table, Space, Typography, Skeleton, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useLoaiPhongs, useCreateLoaiPhong, useUpdateLoaiPhong, useDeleteLoaiPhong } from '../../hooks/useLoaiPhong';
import ConfirmDeleteModal from '../../components/ConfirmDeleteModal';

const { Title } = Typography;

const SUC_CHUA_COLOR = { 1: 'blue', 2: 'green', 3: 'orange', 4: 'red' };

export default function LoaiPhongPage() {
  const { data: loaiPhongs = [], isLoading } = useLoaiPhongs();
  const createMutation = useCreateLoaiPhong();
  const updateMutation = useUpdateLoaiPhong();
  const deleteMutation = useDeleteLoaiPhong();

  const [form] = Form.useForm();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

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
      render: (v) => (
        <Tag color={SUC_CHUA_COLOR[v]}>{v} người</Tag>
      ),
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
          <Button
            icon={<DeleteOutlined />}
            size="small"
            danger
            onClick={() => setDeleteTarget(record)}
          >
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
