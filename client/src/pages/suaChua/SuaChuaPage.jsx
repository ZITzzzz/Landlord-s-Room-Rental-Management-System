import { useState } from 'react';
import {
  Button, Form, Input, InputNumber, Modal, Table, Space, Typography,
  Select, DatePicker, Checkbox, Skeleton, Descriptions,
} from 'antd';
import { PlusOutlined, EditOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { usePhongs } from '../../hooks/usePhong';
import { useSuaChuas, useCreateSuaChua, useUpdateSuaChua } from '../../hooks/useSuaChua';
import StatusBadge from '../../components/StatusBadge';

const { Title } = Typography;

const formatVND = (v) => (v != null ? v.toLocaleString('vi-VN') + ' đ' : '—');

const TRANG_THAI_OPTIONS = [
  { value: 'cho_xu_ly', label: 'Chờ xử lý' },
  { value: 'dang_xu_ly', label: 'Đang xử lý' },
  { value: 'hoan_thanh', label: 'Hoàn thành' },
];

const LOAI_LABELS = {
  dien_nuoc_tong: 'Điện/nước tổng',
  sua_chua_chung: 'Sửa chữa chung',
  khac: 'Khác',
};

// ─── Create modal ─────────────────────────────────────────────────────────────
function CreateModal({ open, onCancel, isPending }) {
  const [form] = Form.useForm();
  const { data: phongs = [], isLoading: loadingPhong } = usePhongs({ trang_thai: 'trong' });
  const createMutation = useCreateSuaChua();

  const handleSubmit = async () => {
    const values = await form.validateFields();
    await createMutation.mutateAsync({
      ...values,
      ngay_phat_sinh: values.ngay_phat_sinh.toDate(),
    });
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title="Tạo yêu cầu sửa chữa"
      open={open}
      onOk={handleSubmit}
      onCancel={() => { form.resetFields(); onCancel(); }}
      okText="Tạo"
      cancelText="Hủy"
      confirmLoading={createMutation.isPending}
      destroyOnClose
    >
      <Form form={form} layout="vertical" style={{ marginTop: 8 }}>
        <Form.Item name="phong_id" label="Phòng" rules={[{ required: true, message: 'Vui lòng chọn phòng' }]}>
          <Select
            loading={loadingPhong}
            placeholder="Chọn phòng trống"
            showSearch
            filterOption={(input, option) =>
              option.label.toLowerCase().includes(input.toLowerCase())
            }
            options={phongs.map((p) => ({
              value: p._id,
              label: `${p.ten} — ${p.ten_khu}`,
            }))}
          />
        </Form.Item>
        <Form.Item name="mo_ta" label="Mô tả" rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}>
          <Input.TextArea rows={3} placeholder="Mô tả sự cố, hư hỏng cần sửa chữa..." />
        </Form.Item>
        <Form.Item
          name="ngay_phat_sinh"
          label="Ngày phát sinh"
          initialValue={dayjs()}
          rules={[{ required: true, message: 'Vui lòng chọn ngày' }]}
        >
          <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="chi_phi_du_kien" label="Chi phí dự kiến (đ)">
          <InputNumber
            min={0}
            step={10000}
            formatter={(v) => v && v.toLocaleString('vi-VN')}
            parser={(v) => v.replace(/\./g, '').replace(/,/g, '')}
            style={{ width: '100%' }}
            placeholder="0"
          />
        </Form.Item>
        <Form.Item name="do_kh_gay_ra" valuePropName="checked" initialValue={false}>
          <Checkbox>Do khách hàng gây ra</Checkbox>
        </Form.Item>
      </Form>
    </Modal>
  );
}

// ─── Update modal ─────────────────────────────────────────────────────────────
function UpdateModal({ record, onCancel }) {
  const [form] = Form.useForm();
  const updateMutation = useUpdateSuaChua();

  const handleSubmit = async () => {
    const values = await form.validateFields();
    await updateMutation.mutateAsync({ id: record._id, data: values });
    onCancel();
  };

  return (
    <Modal
      title={`Cập nhật — ${record?.ten_phong ?? ''}`}
      open={!!record}
      onOk={handleSubmit}
      onCancel={onCancel}
      okText="Lưu"
      cancelText="Hủy"
      confirmLoading={updateMutation.isPending}
      destroyOnClose
    >
      {record && (
        <>
          <Descriptions size="small" column={1} bordered style={{ marginBottom: 16 }}>
            <Descriptions.Item label="Mô tả">{record.mo_ta}</Descriptions.Item>
            <Descriptions.Item label="Phòng">{record.ten_phong} — {record.ten_khu}</Descriptions.Item>
            <Descriptions.Item label="Ngày phát sinh">
              {dayjs(record.ngay_phat_sinh).format('DD/MM/YYYY')}
            </Descriptions.Item>
            <Descriptions.Item label="Chi phí dự kiến">
              {formatVND(record.chi_phi_du_kien)}
            </Descriptions.Item>
          </Descriptions>
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              trang_thai: record.trang_thai,
              chi_phi_thuc_te: record.chi_phi_thuc_te,
              mo_ta: record.mo_ta,
            }}
          >
            <Form.Item name="trang_thai" label="Trạng thái">
              <Select options={TRANG_THAI_OPTIONS} />
            </Form.Item>
            <Form.Item name="chi_phi_thuc_te" label="Chi phí thực tế (đ)">
              <InputNumber
                min={0}
                step={10000}
                formatter={(v) => v && v.toLocaleString('vi-VN')}
                parser={(v) => v.replace(/\./g, '').replace(/,/g, '')}
                style={{ width: '100%' }}
              />
            </Form.Item>
            <Form.Item name="mo_ta" label="Mô tả">
              <Input.TextArea rows={3} />
            </Form.Item>
          </Form>
        </>
      )}
    </Modal>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function SuaChuaPage() {
  const [filters, setFilters] = useState({});
  const { data: suaChuas = [], isLoading } = useSuaChuas(filters);
  const { data: phongs = [] } = usePhongs();

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  const columns = [
    {
      title: 'Phòng',
      key: 'phong',
      render: (_, r) => `${r.ten_phong} — ${r.ten_khu}`,
    },
    {
      title: 'Mô tả',
      dataIndex: 'mo_ta',
      key: 'mo_ta',
      ellipsis: true,
    },
    {
      title: 'Ngày phát sinh',
      dataIndex: 'ngay_phat_sinh',
      key: 'ngay_phat_sinh',
      render: (v) => dayjs(v).format('DD/MM/YYYY'),
      sorter: (a, b) => new Date(a.ngay_phat_sinh) - new Date(b.ngay_phat_sinh),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'trang_thai',
      key: 'trang_thai',
      render: (v) => <StatusBadge status={v} type="sua_chua" />,
      filters: TRANG_THAI_OPTIONS.map((o) => ({ text: o.label, value: o.value })),
      onFilter: (val, r) => r.trang_thai === val,
    },
    {
      title: 'Chi phí DK',
      dataIndex: 'chi_phi_du_kien',
      key: 'chi_phi_du_kien',
      align: 'right',
      render: formatVND,
    },
    {
      title: 'Chi phí TT',
      dataIndex: 'chi_phi_thuc_te',
      key: 'chi_phi_thuc_te',
      align: 'right',
      render: formatVND,
    },
    {
      title: 'Do KH',
      dataIndex: 'do_kh_gay_ra',
      key: 'do_kh_gay_ra',
      align: 'center',
      render: (v) => (v ? 'Có' : 'Không'),
    },
    {
      title: 'Thao tác',
      key: 'action',
      align: 'center',
      render: (_, record) => (
        <Button
          icon={<EditOutlined />}
          size="small"
          onClick={() => setEditTarget(record)}
          disabled={record.trang_thai === 'hoan_thanh'}
        >
          Cập nhật
        </Button>
      ),
    },
  ];

  if (isLoading) return <Skeleton active paragraph={{ rows: 6 }} />;

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>Quản lý sửa chữa</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
          Tạo yêu cầu
        </Button>
      </div>

      {/* Filters */}
      <Space style={{ marginBottom: 16 }} wrap>
        <Select
          allowClear
          placeholder="Lọc theo phòng"
          style={{ width: 200 }}
          showSearch
          filterOption={(input, option) =>
            option.label.toLowerCase().includes(input.toLowerCase())
          }
          options={phongs.map((p) => ({ value: p._id, label: `${p.ten} — ${p.ten_khu}` }))}
          onChange={(val) => setFilters((f) => ({ ...f, phong_id: val }))}
        />
        <Select
          allowClear
          placeholder="Lọc theo trạng thái"
          style={{ width: 180 }}
          options={TRANG_THAI_OPTIONS}
          onChange={(val) => setFilters((f) => ({ ...f, trang_thai: val }))}
        />
      </Space>

      <Table
        rowKey="_id"
        dataSource={suaChuas}
        columns={columns}
        pagination={{ pageSize: 10 }}
        bordered
        size="middle"
      />

      <CreateModal
        open={createOpen}
        onCancel={() => setCreateOpen(false)}
      />

      <UpdateModal
        record={editTarget}
        onCancel={() => setEditTarget(null)}
      />
    </>
  );
}
