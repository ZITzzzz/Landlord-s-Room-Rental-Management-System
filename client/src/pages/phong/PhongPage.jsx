import { useState } from 'react';
import {
  Button, Form, Input, InputNumber, Modal, Table, Space,
  Skeleton, Select, Drawer, Empty,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, HistoryOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { usePhongs, useCreatePhong, useUpdatePhong, useDeletePhong, useLichSuGia } from '../../hooks/usePhong';
import { useKhus } from '../../hooks/useKhu';
import { useLoaiPhongs } from '../../hooks/useLoaiPhong';
import ConfirmDeleteModal from '../../components/ConfirmDeleteModal';
import StatusBadge from '../../components/StatusBadge';
import HuyDatCocModal from '../../components/HuyDatCocModal';
import PageHeader from '../../components/PageHeader';

const formatVND = (v) => (v != null ? v.toLocaleString('vi-VN') + ' đ' : '—');

function LichSuGiaDrawer({ phong, onClose }) {
  const { data: lichSu = [], isLoading } = useLichSuGia(phong?._id);

  const columns = [
    { title: 'Giá cũ', dataIndex: 'gia_cu', key: 'gia_cu', render: formatVND },
    { title: 'Giá mới', dataIndex: 'gia_moi', key: 'gia_moi', render: formatVND },
    {
      title: 'Ngày áp dụng',
      dataIndex: 'ngay_ap_dung',
      key: 'ngay_ap_dung',
      render: (v) => dayjs(v).format('DD/MM/YYYY'),
    },
  ];

  return (
    <Drawer
      title={`Lịch sử giá thuê — ${phong?.ten ?? ''}`}
      open={!!phong}
      onClose={onClose}
      width={480}
    >
      {isLoading ? (
        <Skeleton active />
      ) : (
        <Table rowKey="_id" dataSource={lichSu} columns={columns} pagination={false} size="small" />
      )}
    </Drawer>
  );
}

export default function PhongPage() {
  const [filters, setFilters] = useState({});
  const { data: phongs = [], isLoading } = usePhongs(filters);
  const { data: khus = [] } = useKhus();
  const { data: loaiPhongs = [] } = useLoaiPhongs();
  const createMutation = useCreatePhong();
  const updateMutation = useUpdatePhong();
  const deleteMutation = useDeletePhong();

  const [form] = Form.useForm();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [historyPhong, setHistoryPhong] = useState(null);
  const [huyDatCocPhong, setHuyDatCocPhong] = useState(null); // { _id, datCocId? } — we fetch via phong

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (record) => {
    setEditing(record);
    form.setFieldsValue({
      ten: record.ten,
      loai_phong_id: record.loai_phong_id?._id ?? record.loai_phong_id,
      gia_thue: record.gia_thue,
    });
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
      title: 'Tên phòng',
      dataIndex: 'ten',
      key: 'ten',
      sorter: (a, b) => a.ten.localeCompare(b.ten),
    },
    { title: 'Khu', dataIndex: 'ten_khu', key: 'ten_khu' },
    { title: 'Loại phòng', dataIndex: 'ten_loai_phong', key: 'ten_loai_phong' },
    {
      title: 'Sức chứa',
      dataIndex: 'suc_chua',
      key: 'suc_chua',
      align: 'center',
      render: (v) => (v != null ? `${v} người` : '—'),
    },
    {
      title: 'Giá thuê',
      dataIndex: 'gia_thue',
      key: 'gia_thue',
      align: 'right',
      sorter: (a, b) => a.gia_thue - b.gia_thue,
      render: formatVND,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'trang_thai',
      key: 'trang_thai',
      align: 'center',
      render: (v) => <StatusBadge status={v} type="phong" />,
    },
    {
      title: 'Thao tác',
      key: 'action',
      align: 'center',
      render: (_, record) => (
        <Space>
          <Button icon={<HistoryOutlined />} size="small" onClick={() => setHistoryPhong(record)}>
            Lịch sử giá
          </Button>
          <Button icon={<EditOutlined />} size="small" onClick={() => openEdit(record)}>
            Sửa
          </Button>
          {record.trang_thai === 'dat_coc' && (
            <Button size="small" danger onClick={() => setHuyDatCocPhong(record)}>
              Hủy đặt cọc
            </Button>
          )}
          <Button icon={<DeleteOutlined />} size="small" danger onClick={() => setDeleteTarget(record)}>
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  if (isLoading) return <Skeleton active paragraph={{ rows: 8 }} />;

  return (
    <>
      <PageHeader
        title="Quản lý phòng"
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Thêm phòng</Button>}
      />

      {/* Filter bar */}
      <Space style={{ marginBottom: 16 }} wrap>
        <Select
          allowClear
          placeholder="Lọc theo khu"
          style={{ width: 180 }}
          options={khus.map((k) => ({ value: k._id, label: k.ten }))}
          onChange={(v) => setFilters((f) => ({ ...f, khu_id: v }))}
        />
        <Select
          allowClear
          placeholder="Lọc theo trạng thái"
          style={{ width: 180 }}
          options={[
            { value: 'trong', label: 'Trống' },
            { value: 'cho_thue', label: 'Đang thuê' },
            { value: 'dat_coc', label: 'Đặt cọc' },
            { value: 'sua_chua', label: 'Sửa chữa' },
          ]}
          onChange={(v) => setFilters((f) => ({ ...f, trang_thai: v }))}
        />
      </Space>

      <Table
        rowKey="_id"
        dataSource={phongs}
        columns={columns}
        pagination={{ pageSize: 10 }}
        bordered
        size="middle"
        locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không có phòng nào" /> }}
      />

      {/* Add / Edit Modal */}
      <Modal
        title={editing ? 'Chỉnh sửa phòng' : 'Thêm phòng mới'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        okText={editing ? 'Lưu' : 'Thêm'}
        cancelText="Hủy"
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 8 }}>
          <Form.Item name="ten" label="Tên phòng" rules={[{ required: true, message: 'Vui lòng nhập tên phòng' }]}>
            <Input placeholder="VD: P101" />
          </Form.Item>
          {!editing && (
            <Form.Item name="khu_id" label="Khu" rules={[{ required: true, message: 'Vui lòng chọn khu' }]}>
              <Select
                placeholder="Chọn khu"
                options={khus.map((k) => ({ value: k._id, label: k.ten }))}
              />
            </Form.Item>
          )}
          <Form.Item name="loai_phong_id" label="Loại phòng" rules={[{ required: true, message: 'Vui lòng chọn loại phòng' }]}>
            <Select
              placeholder="Chọn loại phòng"
              options={loaiPhongs.map((lp) => ({ value: lp._id, label: `${lp.ten} (${lp.suc_chua} người)` }))}
            />
          </Form.Item>
          <Form.Item name="gia_thue" label="Giá thuê (VNĐ/tháng)" rules={[{ required: true, message: 'Vui lòng nhập giá thuê' }]}>
            <InputNumber
              min={1}
              style={{ width: '100%' }}
              formatter={(v) => v && `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(v) => v.replace(/,/g, '')}
              placeholder="VD: 3000000"
            />
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

      <HuyDatCocModal
        open={!!huyDatCocPhong}
        phong_id={huyDatCocPhong?._id}
        onSuccess={() => setHuyDatCocPhong(null)}
        onCancel={() => setHuyDatCocPhong(null)}
      />

      {/* Rent price history Drawer */}
      <LichSuGiaDrawer phong={historyPhong} onClose={() => setHistoryPhong(null)} />
    </>
  );
}
