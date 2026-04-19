import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Steps, Button, Form, Input, InputNumber, DatePicker, Table, Space,
  Typography, Card, Descriptions, Skeleton, Divider, Row, Col, message,
} from 'antd';
import { SearchOutlined, UserAddOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { usePhongsTrong } from '../../hooks/usePhong';
import { useKhachHangSearch, useCreateKhachHang } from '../../hooks/useKhachHang';
import { useCreateDatCoc } from '../../hooks/useDatCoc';
import StatusBadge from '../../components/StatusBadge';

const { Title, Text } = Typography;

const formatVND = (v) => (v != null ? v.toLocaleString('vi-VN') + ' đ' : '—');

// ─── Step 1: Pick a vacant room ──────────────────────────────────────────────
function StepChonPhong({ selected, onSelect }) {
  const [giaMax, setGiaMax] = useState(undefined);
  const { data: phongs = [], isLoading } = usePhongsTrong({ gia_max: giaMax });

  const columns = [
    { title: 'Tên phòng', dataIndex: 'ten', key: 'ten' },
    { title: 'Khu', dataIndex: 'ten_khu', key: 'ten_khu' },
    { title: 'Loại phòng', dataIndex: 'ten_loai_phong', key: 'ten_loai_phong' },
    { title: 'Sức chứa', dataIndex: 'suc_chua', key: 'suc_chua', align: 'center', render: (v) => v ? `${v} người` : '—' },
    { title: 'Giá thuê', dataIndex: 'gia_thue', key: 'gia_thue', align: 'right', render: formatVND },
    {
      title: 'Trạng thái',
      dataIndex: 'trang_thai',
      key: 'trang_thai',
      render: (v) => <StatusBadge status={v} type="phong" />,
    },
  ];

  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <Text>Giá thuê tối đa (để trống = tất cả): </Text>
        <InputNumber
          min={1}
          style={{ width: 180, marginLeft: 8 }}
          formatter={(v) => v && `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={(v) => v.replace(/,/g, '')}
          placeholder="VNĐ"
          onChange={(v) => setGiaMax(v || undefined)}
          allowClear
        />
      </div>
      {isLoading ? (
        <Skeleton active paragraph={{ rows: 5 }} />
      ) : (
        <Table
          rowKey="_id"
          dataSource={phongs}
          columns={columns}
          pagination={{ pageSize: 8 }}
          size="small"
          bordered
          rowSelection={{
            type: 'radio',
            selectedRowKeys: selected ? [selected._id] : [],
            onChange: (_, rows) => onSelect(rows[0] ?? null),
          }}
          onRow={(record) => ({ onClick: () => onSelect(record) })}
        />
      )}
    </>
  );
}

// ─── Step 2: Pick/create customer + deposit details ──────────────────────────
function StepKhachHang({ selectedKhachHang, onSelectKhachHang, phong, form }) {
  const [rawSearch, setRawSearch] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newKhForm] = Form.useForm();
  const createKhMutation = useCreateKhachHang();

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(rawSearch), 300);
    return () => clearTimeout(t);
  }, [rawSearch]);

  const { data: khachHangs = [], isLoading } = useKhachHangSearch(debouncedQ);

  const handleAddKhachHang = async () => {
    const values = await newKhForm.validateFields();
    const newKh = await createKhMutation.mutateAsync({
      ...values,
      ngay_sinh: values.ngay_sinh ? values.ngay_sinh.toISOString() : undefined,
    });
    onSelectKhachHang(newKh);
    newKhForm.resetFields();
    setShowAddForm(false);
    setRawSearch('');
  };

  const khColumns = [
    { title: 'Họ tên', dataIndex: 'ho_ten', key: 'ho_ten' },
    { title: 'CMND/CCCD', dataIndex: 'cmnd', key: 'cmnd' },
    { title: 'SĐT', dataIndex: 'so_dien_thoai', key: 'so_dien_thoai' },
  ];

  return (
    <Row gutter={24}>
      <Col xs={24} md={12}>
        <Title level={5}>Chọn khách hàng</Title>
        <Input
          prefix={<SearchOutlined />}
          placeholder="Tìm theo họ tên hoặc CMND..."
          allowClear
          value={rawSearch}
          onChange={(e) => setRawSearch(e.target.value)}
          style={{ marginBottom: 8 }}
        />
        {isLoading ? (
          <Skeleton active paragraph={{ rows: 3 }} />
        ) : (
          <Table
            rowKey="_id"
            dataSource={khachHangs}
            columns={khColumns}
            pagination={{ pageSize: 5 }}
            size="small"
            bordered
            rowSelection={{
              type: 'radio',
              selectedRowKeys: selectedKhachHang ? [selectedKhachHang._id] : [],
              onChange: (_, rows) => onSelectKhachHang(rows[0] ?? null),
            }}
            onRow={(record) => ({ onClick: () => onSelectKhachHang(record) })}
          />
        )}
        <Button
          type="link"
          icon={<UserAddOutlined />}
          onClick={() => setShowAddForm(!showAddForm)}
          style={{ paddingLeft: 0, marginTop: 4 }}
        >
          {showAddForm ? 'Ẩn form' : 'Thêm khách hàng mới'}
        </Button>
        {showAddForm && (
          <Card size="small" style={{ marginTop: 8 }}>
            <Form form={newKhForm} layout="vertical" size="small">
              <Form.Item name="ho_ten" label="Họ tên" rules={[{ required: true, message: 'Bắt buộc' }]}>
                <Input />
              </Form.Item>
              <Form.Item name="cmnd" label="CMND/CCCD" rules={[{ required: true, message: 'Bắt buộc' }]}>
                <Input />
              </Form.Item>
              <Form.Item name="so_dien_thoai" label="SĐT" rules={[{ required: true, message: 'Bắt buộc' }]}>
                <Input />
              </Form.Item>
              <Form.Item name="ngay_sinh" label="Ngày sinh">
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
              <Button
                type="primary"
                size="small"
                loading={createKhMutation.isPending}
                onClick={handleAddKhachHang}
              >
                Lưu khách hàng
              </Button>
            </Form>
          </Card>
        )}
      </Col>

      <Col xs={24} md={12}>
        <Title level={5}>Thông tin đặt cọc</Title>
        {phong && (
          <Descriptions bordered size="small" column={1} style={{ marginBottom: 16 }}>
            <Descriptions.Item label="Phòng">{phong.ten} — {phong.ten_khu}</Descriptions.Item>
            <Descriptions.Item label="Giá thuê">{formatVND(phong.gia_thue)}</Descriptions.Item>
          </Descriptions>
        )}
        <Form.Item
          name="so_tien"
          label="Số tiền đặt cọc (VNĐ)"
          rules={[{ required: true, message: 'Vui lòng nhập số tiền' }]}
        >
          <InputNumber
            min={1}
            style={{ width: '100%' }}
            formatter={(v) => v && `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={(v) => v.replace(/,/g, '')}
            placeholder="VD: 3000000"
          />
        </Form.Item>
        <Form.Item
          name="ngay_dat_coc"
          label="Ngày đặt cọc"
          initialValue={dayjs()}
          rules={[{ required: true, message: 'Vui lòng chọn ngày' }]}
        >
          <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
        </Form.Item>
      </Col>
    </Row>
  );
}

// ─── Step 3: Review and confirm ──────────────────────────────────────────────
function StepXacNhan({ phong, khachHang, soTien, ngayDatCoc }) {
  return (
    <Card>
      <Title level={5}>Xác nhận thông tin đặt cọc</Title>
      <Descriptions bordered column={1} size="middle">
        <Descriptions.Item label="Phòng">
          {phong?.ten} — {phong?.ten_khu} ({phong?.ten_loai_phong})
        </Descriptions.Item>
        <Descriptions.Item label="Giá thuê">{formatVND(phong?.gia_thue)}</Descriptions.Item>
        <Descriptions.Item label="Khách hàng">
          {khachHang?.ho_ten} — CMND: {khachHang?.cmnd} — SĐT: {khachHang?.so_dien_thoai}
        </Descriptions.Item>
        <Descriptions.Item label="Số tiền đặt cọc">{formatVND(soTien)}</Descriptions.Item>
        <Descriptions.Item label="Ngày đặt cọc">
          {ngayDatCoc ? dayjs(ngayDatCoc).format('DD/MM/YYYY') : '—'}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
}

// ─── Main Wizard ─────────────────────────────────────────────────────────────
export default function DatCocWizard() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedPhong, setSelectedPhong] = useState(null);
  const [selectedKhachHang, setSelectedKhachHang] = useState(null);
  // Lưu giá trị form vào state khi chuyển từ bước 1 → 2 để tránh mất dữ liệu khi Form.Item unmount
  const [confirmedValues, setConfirmedValues] = useState(null);
  const [form] = Form.useForm();
  const createDatCocMutation = useCreateDatCoc();

  const goNext = async () => {
    if (currentStep === 0) {
      if (!selectedPhong) return;
      setCurrentStep(1);
    } else if (currentStep === 1) {
      if (!selectedKhachHang) {
        message.warning('Vui lòng chọn khách hàng');
        return;
      }
      try {
        const values = await form.validateFields(['so_tien', 'ngay_dat_coc']);
        setConfirmedValues(values);
        setCurrentStep(2);
      } catch {
        // form.validateFields tự hiển thị lỗi trên từng field
      }
    }
  };

  const goPrev = () => setCurrentStep((s) => s - 1);

  const handleConfirm = async () => {
    try {
      await createDatCocMutation.mutateAsync({
        phong_id: selectedPhong._id,
        khach_hang_id: selectedKhachHang._id,
        so_tien: confirmedValues.so_tien,
        ngay_dat_coc: confirmedValues.ngay_dat_coc.toISOString(),
      });
      message.success('Đặt cọc thành công!');
      navigate('/phong');
    } catch {
      // axiosInstance đã hiển thị toast lỗi từ API
    }
  };

  const steps = [
    { title: 'Chọn phòng' },
    { title: 'Khách hàng & cọc' },
    { title: 'Xác nhận' },
  ];

  const stepContent = [
    <StepChonPhong key="0" selected={selectedPhong} onSelect={setSelectedPhong} />,
    <StepKhachHang
      key="1"
      selectedKhachHang={selectedKhachHang}
      onSelectKhachHang={setSelectedKhachHang}
      phong={selectedPhong}
      form={form}
    />,
    <StepXacNhan
      key="2"
      phong={selectedPhong}
      khachHang={selectedKhachHang}
      soTien={confirmedValues?.so_tien}
      ngayDatCoc={confirmedValues?.ngay_dat_coc}
    />,
  ];

  const canNext =
    (currentStep === 0 && !!selectedPhong) ||
    (currentStep === 1 && !!selectedKhachHang);

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24, gap: 16 }}>
        <Button onClick={() => navigate(-1)}>Quay lại</Button>
        <Title level={4} style={{ margin: 0 }}>Đặt cọc phòng</Title>
      </div>

      <Steps current={currentStep} items={steps} style={{ marginBottom: 32 }} />

      <Form form={form} layout="vertical">
        {stepContent[currentStep]}
      </Form>

      <Divider />

      <Space style={{ justifyContent: 'flex-end', width: '100%', display: 'flex' }}>
        {currentStep > 0 && (
          <Button onClick={goPrev}>Quay lại</Button>
        )}
        {currentStep < 2 && (
          <Button type="primary" onClick={goNext} disabled={!canNext}>
            Tiếp theo
          </Button>
        )}
        {currentStep === 2 && (
          <Button
            type="primary"
            onClick={handleConfirm}
            loading={createDatCocMutation.isPending}
          >
            Xác nhận đặt cọc
          </Button>
        )}
      </Space>
    </>
  );
}
