import { useState } from 'react';
import { Button, Form, Input, Modal, Table, Space, Typography, Skeleton } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useKhus, useCreateKhu, useUpdateKhu, useDeleteKhu } from '../../hooks/useKhu';
import ConfirmDeleteModal from '../../components/ConfirmDeleteModal';

const { Title } = Typography;

export default function KhuPage() {
  const { data: khus = [], isLoading } = useKhus();
  const createMutation = useCreateKhu();
  const updateMutation = useUpdateKhu();
  const deleteMutation = useDeleteKhu();

  const [form] = Form.useForm();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null); // null = create mode
  const [deleteTarget, setDeleteTarget] = useState(null);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (record) => {
    setEditing(record);
    form.setFieldsValue({ ten: record.ten, dia_chi: record.dia_chi, ghi_chu: record.ghi_chu });
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
      title: 'Tên khu',
      dataIndex: 'ten',
      key: 'ten',
      sorter: (a, b) => a.ten.localeCompare(b.ten),
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'dia_chi',
      key: 'dia_chi',
    },
    {
      title: 'Ghi chú',
      dataIndex: 'ghi_chu',
      key: 'ghi_chu',
      render: (v) => v || '—',
    },
    {
      title: 'Số phòng',
      dataIndex: 'so_phong',
      key: 'so_phong',
      align: 'center',
      sorter: (a, b) => a.so_phong - b.so_phong,
    },
    {
      title: 'Đang thuê',
      dataIndex: 'so_phong_dang_thue',
      key: 'so_phong_dang_thue',
      align: 'center',
      sorter: (a, b) => a.so_phong_dang_thue - b.so_phong_dang_thue,
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

  if (isLoading) return <Skeleton active paragraph={{ rows: 6 }} />;

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>Quản lý khu</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          Thêm khu
        </Button>
      </div>

      <Table
        rowKey="_id"
        dataSource={khus}
        columns={columns}
        pagination={{ pageSize: 10 }}
        bordered
        size="middle"
      />

      {/* Add / Edit Modal */}
      <Modal
        title={editing ? 'Chỉnh sửa khu' : 'Thêm khu mới'}
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
            label="Tên khu"
            rules={[{ required: true, message: 'Vui lòng nhập tên khu' }]}
          >
            <Input placeholder="VD: Khu A" />
          </Form.Item>
          <Form.Item
            name="dia_chi"
            label="Địa chỉ"
            rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
          >
            <Input placeholder="VD: 123 Đường Láng, Hà Nội" />
          </Form.Item>
          <Form.Item name="ghi_chu" label="Ghi chú">
            <Input.TextArea rows={3} placeholder="Ghi chú (không bắt buộc)" />
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
