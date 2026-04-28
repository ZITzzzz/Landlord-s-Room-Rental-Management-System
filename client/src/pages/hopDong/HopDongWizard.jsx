import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Steps, Button, Form, Input, InputNumber, DatePicker, Table, Space,
  Typography, Card, Descriptions, Divider, Row, Col, Skeleton,
} from 'antd';
import { PlusOutlined, DeleteOutlined, SearchOutlined, UserAddOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { usePhongsTrong } from '../../hooks/usePhong';
import { useKhachHangSearch, useCreateKhachHang } from '../../hooks/useKhachHang';
import { useCreateHopDong } from '../../hooks/useHopDong';
import { useDatCocByPhong } from '../../hooks/useDatCoc';
import StatusBadge from '../../components/StatusBadge';

const { Title, Text } = Typography;
const formatVND = (v) => (v != null ? v.toLocaleString('vi-VN') + ' đ' : '—');

// ─── Step 1: Pick room ────────────────────────────────────────────────────────
function StepChonPhong({ selected, onSelect }) {
  const { data: phongs = [], isLoading } = usePhongsTrong();

  const cols = [
    { title: 'Phòng', dataIndex: 'ten', key: 'ten' },
    { title: 'Khu', dataIndex: 'ten_khu', key: 'ten_khu' },
    { title: 'Loại', dataIndex: 'ten_loai_phong', key: 'ten_loai_phong' },
    { title: 'Giá thuê', dataIndex: 'gia_thue', key: 'gia_thue', align: 'right', render: formatVND },
    { title: 'Trạng thái', dataIndex: 'trang_thai', key: 'tt', render: (v) => <StatusBadge status={v} type="phong" /> },
  ];

  return isLoading ? <Skeleton active paragraph={{ rows: 5 }} /> : (
    <Table rowKey="_id" dataSource={phongs} columns={cols} pagination={{ pageSize: 8 }} size="small" bordered
      rowSelection={{ type: 'radio', selectedRowKeys: selected ? [selected._id] : [], onChange: (_, rows) => onSelect(rows[0] ?? null) }}
      onRow={(r) => ({ onClick: () => onSelect(r) })}
    />
  );
}

// ─── Step 2: Customer + occupants + dates ─────────────────────────────────────
function StepKhachHangVaThongTin({ selectedKhachHang, onSelectKhachHang, phong, form }) {
  const [rawSearch, setRawSearch] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newKhForm] = Form.useForm();
  const createKhMutation = useCreateKhachHang();

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(rawSearch), 300);
    return () => clearTimeout(t);
  }, [rawSearch]);

  // Khi chọn khách hàng, tự động đặt làm người ở đầu tiên
  useEffect(() => {
    if (!selectedKhachHang) return;
    const current = form.getFieldValue('nguoi_o_ban_dau') ?? [];
    form.setFieldValue('nguoi_o_ban_dau', [
      { ho_ten: selectedKhachHang.ho_ten, cmnd: selectedKhachHang.cmnd ?? '' },
      ...current.slice(1),
    ]);
  }, [selectedKhachHang]);

  const { data: khachHangs = [], isLoading } = useKhachHangSearch(debouncedQ);

  const handleAddKhachHang = async () => {
    const values = await newKhForm.validateFields();
    const kh = await createKhMutation.mutateAsync({
      ...values,
      ngay_sinh: values.ngay_sinh ? values.ngay_sinh.toISOString() : undefined,
    });
    onSelectKhachHang(kh);
    newKhForm.resetFields();
    setShowAddForm(false);
  };

  const khCols = [
    { title: 'Họ tên', dataIndex: 'ho_ten', key: 'ho_ten' },
    { title: 'CMND', dataIndex: 'cmnd', key: 'cmnd' },
    { title: 'SĐT', dataIndex: 'so_dien_thoai', key: 'sdt' },
  ];

  return (
    <Row gutter={24}>
      <Col xs={24} md={12}>
        <Title level={5}>Khách hàng thuê</Title>
        <Input prefix={<SearchOutlined />} placeholder="Tìm khách hàng..." allowClear
          value={rawSearch} onChange={(e) => setRawSearch(e.target.value)} style={{ marginBottom: 8 }}
        />
        {isLoading ? <Skeleton active paragraph={{ rows: 3 }} /> : (
          <Table rowKey="_id" dataSource={khachHangs} columns={khCols} pagination={{ pageSize: 5 }} size="small" bordered
            rowSelection={{ type: 'radio', selectedRowKeys: selectedKhachHang ? [selectedKhachHang._id] : [], onChange: (_, rows) => onSelectKhachHang(rows[0] ?? null) }}
            onRow={(r) => ({ onClick: () => onSelectKhachHang(r) })}
          />
        )}
        <Button type="link" icon={<UserAddOutlined />} onClick={() => setShowAddForm(!showAddForm)} style={{ paddingLeft: 0 }}>
          {showAddForm ? 'Ẩn form' : 'Thêm khách hàng mới'}
        </Button>
        {showAddForm && (
          <Card size="small" style={{ marginTop: 8 }}>
            <Form form={newKhForm} layout="vertical" size="small">
              <Form.Item name="ho_ten" label="Họ tên" rules={[{ required: true, message: 'Bắt buộc' }]}><Input /></Form.Item>
              <Form.Item name="cmnd" label="CMND/CCCD" rules={[{ required: true, message: 'Bắt buộc' }]}><Input /></Form.Item>
              <Form.Item name="so_dien_thoai" label="SĐT" rules={[{ required: true, message: 'Bắt buộc' }]}><Input /></Form.Item>
              <Button type="primary" size="small" loading={createKhMutation.isPending} onClick={handleAddKhachHang}>
                Lưu
              </Button>
            </Form>
          </Card>
        )}
      </Col>

      <Col xs={24} md={12}>
        <Title level={5}>Thông tin hợp đồng</Title>
        {phong && (
          <Descriptions bordered size="small" column={1} style={{ marginBottom: 16 }}>
            <Descriptions.Item label="Phòng">{phong.ten} — {phong.ten_khu}</Descriptions.Item>
            <Descriptions.Item label="Giá thuê">{formatVND(phong.gia_thue)}</Descriptions.Item>
          </Descriptions>
        )}
        <Form.Item name="ngay_bat_dau" label="Ngày bắt đầu" initialValue={dayjs()}
          rules={[{ required: true, message: 'Bắt buộc' }]}
        >
          <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
        </Form.Item>
        <Form.Item name="ngay_het_han" label="Ngày hết hạn"
          rules={[{ required: true, message: 'Bắt buộc' }]}
        >
          <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
        </Form.Item>
        <Form.Item name="tien_dat_coc" label="Tiền đặt cọc (VNĐ)"
          initialValue={phong?.gia_thue}
          rules={[{ required: true, message: 'Bắt buộc' }]}
        >
          <InputNumber min={1} style={{ width: '100%' }}
            formatter={(v) => v && `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={(v) => v.replace(/,/g, '')}
          />
        </Form.Item>
        <Form.Item name="so_nguoi_o" label="Số người ở tối đa" initialValue={1}
          rules={[{ required: true, message: 'Bắt buộc' }]}
        >
          <InputNumber min={1} max={10} style={{ width: '100%' }} />
        </Form.Item>

        <Divider orientation="left" style={{ fontSize: 13 }}>Người ở ban đầu</Divider>
        <Form.List name="nguoi_o_ban_dau" initialValue={[{ ho_ten: '', cmnd: '' }]}>
          {(fields, { add, remove }) => (
            <>
              {fields.map((field) => (
                <Space key={field.key} align="start" style={{ marginBottom: 4 }}>
                  <Form.Item {...field} name={[field.name, 'ho_ten']}
                    rules={[{ required: true, message: 'Nhập tên' }]} style={{ marginBottom: 0 }}
                  >
                    <Input placeholder="Họ tên" style={{ width: 160 }} />
                  </Form.Item>
                  <Form.Item {...field} name={[field.name, 'cmnd']} style={{ marginBottom: 0 }}>
                    <Input placeholder="CMND (tùy chọn)" style={{ width: 160 }} />
                  </Form.Item>
                  {fields.length > 1 && (
                    <Button danger size="small" icon={<DeleteOutlined />} onClick={() => remove(field.name)} />
                  )}
                </Space>
              ))}
              <Button type="dashed" size="small" icon={<PlusOutlined />} onClick={() => add({ ho_ten: '', cmnd: '' })}>
                Thêm người ở
              </Button>
            </>
          )}
        </Form.List>
      </Col>
    </Row>
  );
}

// ─── Step 3: Confirm ──────────────────────────────────────────────────────────
function StepXacNhan({ phong, khachHang, values }) {
  const formatDate = (v) => (v ? dayjs(v).format('DD/MM/YYYY') : '—');
  return (
    <Card>
      <Title level={5}>Xác nhận thông tin hợp đồng</Title>
      <Descriptions bordered column={1} size="middle">
        <Descriptions.Item label="Phòng">{phong?.ten} — {phong?.ten_khu}</Descriptions.Item>
        <Descriptions.Item label="Khách hàng">{khachHang?.ho_ten} — CMND: {khachHang?.cmnd}</Descriptions.Item>
        <Descriptions.Item label="Ngày bắt đầu">{formatDate(values?.ngay_bat_dau)}</Descriptions.Item>
        <Descriptions.Item label="Ngày hết hạn">{formatDate(values?.ngay_het_han)}</Descriptions.Item>
        <Descriptions.Item label="Giá thuê (snapshot)">{formatVND(phong?.gia_thue)}</Descriptions.Item>
        <Descriptions.Item label="Tiền đặt cọc">{formatVND(values?.tien_dat_coc)}</Descriptions.Item>
        <Descriptions.Item label="Số người ở">{values?.so_nguoi_o}</Descriptions.Item>
        <Descriptions.Item label="Người ở ban đầu">
          {values?.nguoi_o_ban_dau?.map((no, i) => (
            <div key={i}>{no.ho_ten}{no.cmnd ? ` (${no.cmnd})` : ''}</div>
          ))}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
}

// ─── Main Wizard ──────────────────────────────────────────────────────────────
export default function HopDongWizard() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedPhong, setSelectedPhong] = useState(null);
  const [selectedKhachHang, setSelectedKhachHang] = useState(null);
  // Lưu giá trị form vào state khi chuyển bước để tránh mất dữ liệu khi Form.Item unmount
  const [confirmedValues, setConfirmedValues] = useState(null);
  const [form] = Form.useForm();
  const createMutation = useCreateHopDong();

  // Khi chọn phòng đặt cọc, tự fetch deposit và pre-select khách hàng
  const datCocPhongId = selectedPhong?.trang_thai === 'dat_coc' ? selectedPhong._id : null;
  const { data: datCocData } = useDatCocByPhong(datCocPhongId);
  useEffect(() => {
    if (datCocData?.khach_hang_id) {
      setSelectedKhachHang(datCocData.khach_hang_id);
    }
  }, [datCocData]);

  const goNext = async () => {
    if (currentStep === 0 && selectedPhong) { setCurrentStep(1); return; }
    if (currentStep === 1) {
      if (!selectedKhachHang) return;
      try {
        const values = await form.validateFields(['ngay_bat_dau', 'ngay_het_han', 'tien_dat_coc', 'so_nguoi_o', 'nguoi_o_ban_dau']);
        setConfirmedValues(values);
        setCurrentStep(2);
      } catch {
        // form.validateFields tự hiển thị lỗi trên từng field
      }
    }
  };

  const handleConfirm = async () => {
    try {
      await createMutation.mutateAsync({
        phong_id: selectedPhong._id,
        khach_hang_id: selectedKhachHang._id,
        ngay_bat_dau: confirmedValues.ngay_bat_dau.toISOString(),
        ngay_het_han: confirmedValues.ngay_het_han.toISOString(),
        tien_dat_coc: confirmedValues.tien_dat_coc,
        so_nguoi_o: confirmedValues.so_nguoi_o,
        nguoi_o_ban_dau: (confirmedValues.nguoi_o_ban_dau ?? []).filter((no) => no.ho_ten),
      });
      navigate('/hop-dong');
    } catch {
      // axiosInstance hiển thị toast lỗi từ API
    }
  };

  const canNext = (currentStep === 0 && !!selectedPhong) || (currentStep === 1 && !!selectedKhachHang);
  const stepItems = [{ title: 'Chọn phòng' }, { title: 'Khách hàng & thông tin' }, { title: 'Xác nhận' }];

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24, gap: 16 }}>
        <Button onClick={() => navigate(-1)}>Quay lại</Button>
        <Title level={4} style={{ margin: 0 }}>Ký hợp đồng mới</Title>
      </div>

      <Steps current={currentStep} items={stepItems} style={{ marginBottom: 32 }} />

      <Form form={form} layout="vertical">
        {currentStep === 0 && <StepChonPhong selected={selectedPhong} onSelect={setSelectedPhong} />}
        {currentStep === 1 && (
          <StepKhachHangVaThongTin
            selectedKhachHang={selectedKhachHang}
            onSelectKhachHang={setSelectedKhachHang}
            phong={selectedPhong}
            form={form}
          />
        )}
        {currentStep === 2 && (
          <StepXacNhan phong={selectedPhong} khachHang={selectedKhachHang} values={confirmedValues} />
        )}
      </Form>

      <Divider />
      <Space style={{ justifyContent: 'flex-end', width: '100%', display: 'flex' }}>
        {currentStep > 0 && <Button onClick={() => setCurrentStep((s) => s - 1)}>Quay lại</Button>}
        {currentStep < 2 && <Button type="primary" onClick={goNext} disabled={!canNext}>Tiếp theo</Button>}
        {currentStep === 2 && (
          <Button type="primary" onClick={handleConfirm} loading={createMutation.isPending}>
            Xác nhận ký hợp đồng
          </Button>
        )}
      </Space>
    </>
  );
}
