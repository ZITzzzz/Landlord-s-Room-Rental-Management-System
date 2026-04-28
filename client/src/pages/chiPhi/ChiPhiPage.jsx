import { useState } from 'react';
import {
  Button, Form, Input, InputNumber, Modal, Table, Space,
  Select, Skeleton,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useKhus } from '../../hooks/useKhu';
import { useChiPhis, useCreateChiPhi, useUpdateChiPhi, useDeleteChiPhi } from '../../hooks/useChiPhi';
import ConfirmDeleteModal from '../../components/ConfirmDeleteModal';
import PageHeader from '../../components/PageHeader';

const formatVND = (v) => (v != null ? v.toLocaleString('vi-VN') + ' đ' : '—');

const LOAI_OPTIONS = [
  { value: 'dien_nuoc_tong', label: 'Điện/nước tổng' },
  { value: 'sua_chua_chung', label: 'Sửa chữa chung' },
  { value: 'khac', label: 'Khác' },
];

const LOAI_LABEL = Object.fromEntries(LOAI_OPTIONS.map((o) => [o.value, o.label]));

const THANG_OPTIONS = Array.from({ length: 12 }, (_, i) => ({
  value: i + 1,
  label: `Tháng ${i + 1}`,
}));

const currentYear = new Date().getFullYear();
const NAM_OPTIONS = Array.from({ length: 5 }, (_, i) => ({
  value: currentYear - i,
  label: `${currentYear - i}`,
}));

// ─── Add / Edit modal ─────────────────────────────────────────────────────────
function ChiPhiModal({ open, editing, onCancel }) {
  const [form] = Form.useForm();
  const { data: khus = [] } = useKhus();
  const createMutation = useCreateChiPhi();
  const updateMutation = useUpdateChiPhi();

  const handleSubmit = async () => {
    const values = await form.validateFields();
    if (editing) {
      await updateMutation.mutateAsync({ id: editing._id, data: values });
    } else {
      await createMutation.mutateAsync(values);
    }
    form.resetFields();
    onCancel();
  };

  const initialValues = editing
    ? { loai: editing.loai, so_tien: editing.so_tien, ghi_chu: editing.ghi_chu }
    : { thang: new Date().getMonth() + 1, nam: currentYear };

  return (
    <Modal
      title={editing ? 'Chỉnh sửa chi phí' : 'Thêm chi phí vận hành'}
      open={open}
      onOk={handleSubmit}
      onCancel={() => { form.resetFields(); onCancel(); }}
      okText={editing ? 'Lưu' : 'Thêm'}
      cancelText="Hủy"
      confirmLoading={createMutation.isPending || updateMutation.isPending}
      destroyOnClose
    >
      <Form form={form} layout="vertical" style={{ marginTop: 8 }} initialValues={initialValues}>
        {!editing && (
          <>
            <Space style={{ width: '100%' }}>
              <Form.Item
                name="thang"
                label="Tháng"
                rules={[{ required: true, message: 'Chọn tháng' }]}
                style={{ flex: 1, minWidth: 130 }}
              >
                <Select options={THANG_OPTIONS} />
              </Form.Item>
              <Form.Item
                name="nam"
                label="Năm"
                rules={[{ required: true, message: 'Chọn năm' }]}
                style={{ flex: 1, minWidth: 120 }}
              >
                <Select options={NAM_OPTIONS} />
              </Form.Item>
            </Space>
            <Form.Item name="khu_id" label="Khu (để trống = toàn bộ)">
              <Select
                allowClear
                placeholder="Tất cả khu"
                options={khus.map((k) => ({ value: k._id, label: k.ten }))}
              />
            </Form.Item>
          </>
        )}
        <Form.Item name="loai" label="Loại chi phí" rules={[{ required: true, message: 'Chọn loại' }]}>
          <Select options={LOAI_OPTIONS} />
        </Form.Item>
        <Form.Item
          name="so_tien"
          label="Số tiền (đ)"
          rules={[{ required: true, message: 'Nhập số tiền' }]}
        >
          <InputNumber
            min={1}
            step={10000}
            formatter={(v) => v && v.toLocaleString('vi-VN')}
            parser={(v) => v.replace(/\./g, '').replace(/,/g, '')}
            style={{ width: '100%' }}
          />
        </Form.Item>
        <Form.Item name="ghi_chu" label="Ghi chú">
          <Input.TextArea rows={2} placeholder="Ghi chú (không bắt buộc)" />
        </Form.Item>
      </Form>
    </Modal>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ChiPhiPage() {
  const [filters, setFilters] = useState({
    thang: new Date().getMonth() + 1,
    nam: currentYear,
  });
  const { data: chiPhis = [], isLoading } = useChiPhis(filters);
  const { data: khus = [] } = useKhus();
  const deleteMutation = useDeleteChiPhi();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (record) => {
    setEditing(record);
    setModalOpen(true);
  };

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(deleteTarget._id);
    setDeleteTarget(null);
  };

  const totalAmount = chiPhis.reduce((sum, c) => sum + c.so_tien, 0);

  const columns = [
    {
      title: 'Tháng',
      key: 'ky',
      render: (_, r) => `${r.thang}/${r.nam}`,
      sorter: (a, b) => a.nam * 12 + a.thang - (b.nam * 12 + b.thang),
    },
    {
      title: 'Khu',
      key: 'ten_khu',
      render: (_, r) => r.ten_khu ?? 'Tất cả',
    },
    {
      title: 'Loại chi phí',
      dataIndex: 'loai',
      key: 'loai',
      render: (v) => LOAI_LABEL[v] ?? v,
      filters: LOAI_OPTIONS.map((o) => ({ text: o.label, value: o.value })),
      onFilter: (val, r) => r.loai === val,
    },
    {
      title: 'Số tiền',
      dataIndex: 'so_tien',
      key: 'so_tien',
      align: 'right',
      render: formatVND,
      sorter: (a, b) => a.so_tien - b.so_tien,
    },
    {
      title: 'Ghi chú',
      dataIndex: 'ghi_chu',
      key: 'ghi_chu',
      render: (v) => v || '—',
      ellipsis: true,
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
      <PageHeader
        title="Chi phí vận hành"
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Thêm chi phí</Button>}
      />

      {/* Filters */}
      <Space style={{ marginBottom: 16 }} wrap>
        <Select
          placeholder="Tháng"
          style={{ width: 130 }}
          allowClear
          defaultValue={filters.thang}
          options={THANG_OPTIONS}
          onChange={(val) => setFilters((f) => ({ ...f, thang: val }))}
        />
        <Select
          placeholder="Năm"
          style={{ width: 110 }}
          allowClear
          defaultValue={filters.nam}
          options={NAM_OPTIONS}
          onChange={(val) => setFilters((f) => ({ ...f, nam: val }))}
        />
        <Select
          allowClear
          placeholder="Lọc theo khu"
          style={{ width: 180 }}
          options={[
            { value: 'null', label: 'Toàn bộ (không có khu)' },
            ...khus.map((k) => ({ value: k._id, label: k.ten })),
          ]}
          onChange={(val) => setFilters((f) => ({ ...f, khu_id: val }))}
        />
      </Space>

      <Table
        rowKey="_id"
        dataSource={chiPhis}
        columns={columns}
        pagination={{ pageSize: 15 }}
        bordered
        size="middle"
        summary={() => (
          <Table.Summary.Row>
            <Table.Summary.Cell colSpan={3} align="right">
              <strong>Tổng</strong>
            </Table.Summary.Cell>
            <Table.Summary.Cell align="right">
              <strong>{formatVND(totalAmount)}</strong>
            </Table.Summary.Cell>
            <Table.Summary.Cell colSpan={2} />
          </Table.Summary.Row>
        )}
      />

      <ChiPhiModal
        open={modalOpen}
        editing={editing}
        onCancel={() => { setModalOpen(false); setEditing(null); }}
      />

      <ConfirmDeleteModal
        open={!!deleteTarget}
        itemName={deleteTarget ? `chi phí ${LOAI_LABEL[deleteTarget.loai]} tháng ${deleteTarget.thang}/${deleteTarget.nam}` : ''}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteMutation.isPending}
      />
    </>
  );
}
