import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Button, Card, Descriptions, Table, Space, Typography, Skeleton, Modal,
  Form, Input, DatePicker, Tag, Empty, Tabs, Popconfirm,
} from 'antd';
import { ArrowLeftOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useHopDongById, useGiaHanHopDong, useAddNguoiO, useUpdateNguoiO, useDeleteNguoiO } from '../../hooks/useHopDong';
import StatusBadge from '../../components/StatusBadge';

const { Title, Text } = Typography;
const formatDate = (v) => (v ? dayjs(v).format('DD/MM/YYYY') : '—');
const formatVND = (v) => (v != null ? v.toLocaleString('vi-VN') + ' đ' : '—');

export default function HopDongDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: hd, isLoading } = useHopDongById(id);
  const giaHanMutation = useGiaHanHopDong();
  const addNguoiOMutation = useAddNguoiO();
  const updateNguoiOMutation = useUpdateNguoiO();
  const deleteNguoiOMutation = useDeleteNguoiO();

  const [giaHanOpen, setGiaHanOpen] = useState(false);
  const [addNguoiOOpen, setAddNguoiOOpen] = useState(false);
  const [setNgayKetThucTarget, setSetNgayKetThucTarget] = useState(null);
  const [giaHanForm] = Form.useForm();
  const [nguoiOForm] = Form.useForm();
  const [ngayKetThucForm] = Form.useForm();

  if (isLoading) return <Skeleton active paragraph={{ rows: 12 }} />;
  if (!hd) return null;

  const isActive = hd.trang_thai === 'hieu_luc';

  const handleGiaHan = async () => {
    const values = await giaHanForm.validateFields();
    await giaHanMutation.mutateAsync({ id, data: { han_moi: values.han_moi.toISOString() } });
    setGiaHanOpen(false);
    giaHanForm.resetFields();
  };

  const handleAddNguoiO = async () => {
    const values = await nguoiOForm.validateFields();
    await addNguoiOMutation.mutateAsync({
      hop_dong_id: id,
      data: { ...values, ngay_bat_dau: values.ngay_bat_dau.toISOString() },
    });
    setAddNguoiOOpen(false);
    nguoiOForm.resetFields();
  };

  const handleSetNgayKetThuc = async () => {
    const values = await ngayKetThucForm.validateFields();
    await updateNguoiOMutation.mutateAsync({
      id: setNgayKetThucTarget._id,
      hop_dong_id: id,
      data: { ngay_ket_thuc: values.ngay_ket_thuc.toISOString() },
    });
    setSetNgayKetThucTarget(null);
    ngayKetThucForm.resetFields();
  };

  const nguoiOColumns = [
    { title: 'Họ tên', dataIndex: 'ho_ten', key: 'ho_ten' },
    { title: 'CMND/CCCD', dataIndex: 'cmnd', key: 'cmnd', render: (v) => v || '—' },
    { title: 'Ngày bắt đầu', dataIndex: 'ngay_bat_dau', key: 'ngay_bat_dau', render: formatDate },
    {
      title: 'Ngày kết thúc',
      dataIndex: 'ngay_ket_thuc',
      key: 'ngay_ket_thuc',
      render: (v) => v ? formatDate(v) : <Tag color="green">Đang ở</Tag>,
    },
    isActive && {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space>
          {!record.ngay_ket_thuc && (
            <Button size="small" icon={<EditOutlined />} onClick={() => {
              setSetNgayKetThucTarget(record);
              ngayKetThucForm.resetFields();
            }}>
              Ngày ra
            </Button>
          )}
          <Popconfirm
            title="Xóa người ở này?"
            onConfirm={() => deleteNguoiOMutation.mutate({ id: record._id, hop_dong_id: id })}
            okText="Xóa" cancelText="Hủy" okButtonProps={{ danger: true }}
          >
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ].filter(Boolean);

  const hoaDonColumns = [
    { title: 'Tháng', key: 'ky', render: (_, r) => `${r.thang}/${r.nam}` },
    { title: 'Tổng tiền', dataIndex: 'tong_tien', key: 'tong_tien', align: 'right', render: formatVND },
    { title: 'Hạn TT', dataIndex: 'han_thanh_toan', key: 'han_tt', render: formatDate },
    { title: 'Trạng thái', dataIndex: 'trang_thai', key: 'tt', render: (v) => <StatusBadge status={v} type="hoa_don" /> },
  ];

  const lichSuGiaHanColumns = [
    { title: 'Ngày gia hạn', dataIndex: 'ngay_gia_han', key: 'ngay_gia_han', render: formatDate },
    { title: 'Hạn cũ', dataIndex: 'han_cu', key: 'han_cu', render: formatDate },
    { title: 'Hạn mới', dataIndex: 'han_moi', key: 'han_moi', render: formatDate },
  ];

  const tabItems = [
    {
      key: 'nguoi-o',
      label: `Người ở (${hd.nguoi_o?.length ?? 0})`,
      children: (
        <>
          {isActive && (
            <Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => setAddNguoiOOpen(true)} style={{ marginBottom: 12 }}>
              Thêm người ở
            </Button>
          )}
          {hd.nguoi_o?.length > 0 ? (
            <Table rowKey="_id" dataSource={hd.nguoi_o} columns={nguoiOColumns} pagination={false} size="small" bordered />
          ) : (
            <Empty description="Chưa có người ở" />
          )}
        </>
      ),
    },
    {
      key: 'hoa-don',
      label: `Hóa đơn chưa TT (${hd.hoa_don_chua_thanh_toan?.length ?? 0})`,
      children: hd.hoa_don_chua_thanh_toan?.length > 0 ? (
        <Table rowKey="_id" dataSource={hd.hoa_don_chua_thanh_toan} columns={hoaDonColumns} pagination={false} size="small" bordered />
      ) : (
        <Empty description="Không có hóa đơn chưa thanh toán" />
      ),
    },
    {
      key: 'gia-han',
      label: `Lịch sử gia hạn (${hd.lich_su_gia_han?.length ?? 0})`,
      children: hd.lich_su_gia_han?.length > 0 ? (
        <Table rowKey="_id" dataSource={hd.lich_su_gia_han} columns={lichSuGiaHanColumns} pagination={false} size="small" bordered />
      ) : (
        <Empty description="Chưa có lần gia hạn nào" />
      ),
    },
  ];

  return (
    <>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>Quay lại</Button>
      </Space>

      <Card
        title={<Title level={4} style={{ margin: 0 }}>Hợp đồng — {hd.ten_phong} ({hd.ten_khu})</Title>}
        extra={
          isActive && (
            <Space>
              <Button onClick={() => { giaHanForm.resetFields(); setGiaHanOpen(true); }}>Gia hạn</Button>
              <Button danger onClick={() => navigate(`/thanh-ly?hop_dong_id=${id}`)}>Thanh lý / Hủy</Button>
            </Space>
          )
        }
        style={{ marginBottom: 24 }}
      >
        <Descriptions bordered column={2} size="middle">
          <Descriptions.Item label="Phòng">{hd.ten_phong}</Descriptions.Item>
          <Descriptions.Item label="Khu">{hd.ten_khu}</Descriptions.Item>
          <Descriptions.Item label="Khách hàng">{hd.khach_hang?.ho_ten}</Descriptions.Item>
          <Descriptions.Item label="SĐT">{hd.khach_hang?.so_dien_thoai}</Descriptions.Item>
          <Descriptions.Item label="Ngày bắt đầu">{formatDate(hd.ngay_bat_dau)}</Descriptions.Item>
          <Descriptions.Item label="Ngày hết hạn">{formatDate(hd.ngay_het_han)}</Descriptions.Item>
          <Descriptions.Item label="Giá thuê">{formatVND(hd.gia_thue_ky_hop_dong)}</Descriptions.Item>
          <Descriptions.Item label="Tiền đặt cọc">{formatVND(hd.tien_dat_coc)}</Descriptions.Item>
          <Descriptions.Item label="Số người ở">{hd.so_nguoi_o}</Descriptions.Item>
          <Descriptions.Item label="Trạng thái">
            <StatusBadge status={hd.trang_thai} type="hop_dong" />
          </Descriptions.Item>
          {hd.ngay_thanh_ly && <Descriptions.Item label="Ngày thanh lý">{formatDate(hd.ngay_thanh_ly)}</Descriptions.Item>}
          {hd.ngay_huy && <Descriptions.Item label="Ngày hủy">{formatDate(hd.ngay_huy)}</Descriptions.Item>}
          {hd.ly_do_huy && <Descriptions.Item label="Lý do hủy" span={2}>{hd.ly_do_huy}</Descriptions.Item>}
        </Descriptions>
      </Card>

      <Tabs items={tabItems} />

      {/* Renewal Modal */}
      <Modal title="Gia hạn hợp đồng" open={giaHanOpen}
        onOk={handleGiaHan} onCancel={() => setGiaHanOpen(false)}
        okText="Xác nhận" cancelText="Hủy"
        confirmLoading={giaHanMutation.isPending} destroyOnClose
      >
        <Form form={giaHanForm} layout="vertical" style={{ marginTop: 8 }}>
          <Text type="secondary">Hạn hiện tại: {formatDate(hd.ngay_het_han)}</Text>
          <Form.Item name="han_moi" label="Ngày hết hạn mới"
            rules={[{ required: true, message: 'Vui lòng chọn ngày' }]}
            style={{ marginTop: 12 }}
          >
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY"
              disabledDate={(d) => d && d <= dayjs(hd.ngay_het_han)}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Add occupant Modal */}
      <Modal title="Thêm người ở" open={addNguoiOOpen}
        onOk={handleAddNguoiO} onCancel={() => setAddNguoiOOpen(false)}
        okText="Thêm" cancelText="Hủy"
        confirmLoading={addNguoiOMutation.isPending} destroyOnClose
      >
        <Form form={nguoiOForm} layout="vertical" style={{ marginTop: 8 }}>
          <Form.Item name="ho_ten" label="Họ tên" rules={[{ required: true, message: 'Bắt buộc' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="cmnd" label="CMND/CCCD"><Input /></Form.Item>
          <Form.Item name="ngay_bat_dau" label="Ngày bắt đầu" initialValue={dayjs()}
            rules={[{ required: true, message: 'Bắt buộc' }]}
          >
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Set end date Modal */}
      <Modal title={`Ngày kết thúc — ${setNgayKetThucTarget?.ho_ten}`}
        open={!!setNgayKetThucTarget}
        onOk={handleSetNgayKetThuc}
        onCancel={() => setSetNgayKetThucTarget(null)}
        okText="Lưu" cancelText="Hủy"
        confirmLoading={updateNguoiOMutation.isPending} destroyOnClose
      >
        <Form form={ngayKetThucForm} layout="vertical" style={{ marginTop: 8 }}>
          <Form.Item name="ngay_ket_thuc" label="Ngày kết thúc"
            rules={[{ required: true, message: 'Vui lòng chọn ngày' }]}
          >
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
