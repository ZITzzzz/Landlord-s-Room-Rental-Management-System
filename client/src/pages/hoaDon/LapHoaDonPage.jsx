import { useState } from 'react';
import {
  Button, InputNumber, DatePicker, Table, Space, Typography, Card,
  Descriptions, Modal, Form, Select, Skeleton, Empty, Divider, Row, Col, Alert,
} from 'antd';
import dayjs from 'dayjs';
import { useChoLap, useTinhTruoc, useCreateHoaDon } from '../../hooks/useHoaDon';

const { Title, Text } = Typography;
const formatVND = (v) => (v != null ? v.toLocaleString('vi-VN') + ' đ' : '—');

const MONTHS = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: `Tháng ${i + 1}` }));
const thisYear = dayjs().year();
const YEARS = Array.from({ length: 5 }, (_, i) => ({ value: thisYear - i, label: String(thisYear - i) }));

// ─── Invoice entry form + live preview ───────────────────────────────────────
function HoaDonForm({ record, thang, nam, onSuccess, onCancel }) {
  const [form] = Form.useForm();
  const createMutation = useCreateHoaDon();

  const [previewParams, setPreviewParams] = useState(null);
  const { data: preview, isFetching: previewLoading } = useTinhTruoc(previewParams);

  const handlePreview = async () => {
    try {
      const values = await form.validateFields();
      setPreviewParams({
        hop_dong_id: record.hop_dong_id,
        thang, nam,
        chi_so_dien_moi: values.chi_so_dien_moi,
        chi_so_nuoc_moi: values.chi_so_nuoc_moi,
        so_xe_may: values.so_xe_may,
        so_xe_dap: values.so_xe_dap,
      });
    } catch (_) {}
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    await createMutation.mutateAsync({
      hop_dong_id: record.hop_dong_id,
      thang: Number(thang), nam: Number(nam),
      chi_so_dien_moi: values.chi_so_dien_moi,
      chi_so_nuoc_moi: values.chi_so_nuoc_moi,
      so_xe_may: values.so_xe_may,
      so_xe_dap: values.so_xe_dap,
    });
    onSuccess();
  };

  return (
    <Row gutter={24}>
      <Col xs={24} md={12}>
        <Form form={form} layout="vertical">
          <Form.Item label="Chỉ số điện cũ">
            <InputNumber value={record.chi_so_dien_cu} disabled style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="chi_so_dien_moi" label="Chỉ số điện mới"
            rules={[{ required: true, message: 'Bắt buộc' }]}
            initialValue={record.chi_so_dien_cu}
          >
            <InputNumber min={record.chi_so_dien_cu} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="Chỉ số nước cũ">
            <InputNumber value={record.chi_so_nuoc_cu} disabled style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="chi_so_nuoc_moi" label="Chỉ số nước mới"
            rules={[{ required: true, message: 'Bắt buộc' }]}
            initialValue={record.chi_so_nuoc_cu}
          >
            <InputNumber min={record.chi_so_nuoc_cu} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="so_xe_may" label="Số xe máy" initialValue={0}
            rules={[{ required: true, message: 'Bắt buộc' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="so_xe_dap" label="Số xe đạp" initialValue={0}
            rules={[{ required: true, message: 'Bắt buộc' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Space>
            <Button onClick={handlePreview} loading={previewLoading}>Tính trước</Button>
          </Space>
        </Form>
      </Col>

      <Col xs={24} md={12}>
        <Title level={5}>Chi tiết hóa đơn</Title>
        {preview ? (
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Tiền phòng">{formatVND(preview.tien_phong)}</Descriptions.Item>
            <Descriptions.Item label={`Điện (${preview.chi_tiet.chi_so_dien_moi - preview.chi_tiet.chi_so_dien_cu} kWh × ${formatVND(preview.chi_tiet.don_gia_dien)})`}>
              {formatVND(preview.tien_dien)}
            </Descriptions.Item>
            <Descriptions.Item label={`Nước (${preview.chi_tiet.chi_so_nuoc_moi - preview.chi_tiet.chi_so_nuoc_cu} m³ × ${formatVND(preview.chi_tiet.don_gia_nuoc)})`}>
              {formatVND(preview.tien_nuoc)}
            </Descriptions.Item>
            <Descriptions.Item label={`Vệ sinh (${preview.chi_tiet.so_nguoi_o} người × ${formatVND(preview.chi_tiet.don_gia_ve_sinh)})`}>
              {formatVND(preview.tien_ve_sinh)}
            </Descriptions.Item>
            <Descriptions.Item label={`Xe máy (${preview.chi_tiet.so_xe_may} × ${formatVND(preview.chi_tiet.don_gia_xe_may)})`}>
              {formatVND(preview.tien_xe_may)}
            </Descriptions.Item>
            <Descriptions.Item label={`Xe đạp (${preview.chi_tiet.so_xe_dap} × ${formatVND(preview.chi_tiet.don_gia_xe_dap)})`}>
              {formatVND(preview.tien_xe_dap)}
            </Descriptions.Item>
            {preview.no_thang_truoc > 0 && (
              <Descriptions.Item label="Nợ tháng trước">
                <Text type="danger">{formatVND(preview.no_thang_truoc)}</Text>
              </Descriptions.Item>
            )}
            <Descriptions.Item label={<strong>Tổng cộng</strong>}>
              <strong style={{ color: '#1677ff' }}>{formatVND(preview.tong_tien)}</strong>
            </Descriptions.Item>
          </Descriptions>
        ) : (
          <Alert message='Nhấn "Tính trước" để xem chi tiết hóa đơn' type="info" showIcon />
        )}
      </Col>

      <Col xs={24} style={{ marginTop: 16 }}>
        <Space>
          <Button type="primary" onClick={handleSubmit} loading={createMutation.isPending} disabled={!preview}>
            Xác nhận lập hóa đơn
          </Button>
          <Button onClick={onCancel}>Hủy</Button>
        </Space>
      </Col>
    </Row>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function LapHoaDonPage() {
  const [thang, setThang] = useState(dayjs().month() + 1);
  const [nam, setNam] = useState(dayjs().year());
  const [selectedRecord, setSelectedRecord] = useState(null);

  const { data: choLap = [], isLoading } = useChoLap({ thang, nam });

  const columns = [
    { title: 'Phòng', dataIndex: 'ten_phong', key: 'ten_phong' },
    { title: 'Khu', dataIndex: 'ten_khu', key: 'ten_khu' },
    { title: 'Khách hàng', dataIndex: 'ten_khach_hang', key: 'ten_khach_hang' },
    { title: 'Chỉ số điện cũ', dataIndex: 'chi_so_dien_cu', key: 'chi_so_dien_cu', align: 'right' },
    { title: 'Chỉ số nước cũ', dataIndex: 'chi_so_nuoc_cu', key: 'chi_so_nuoc_cu', align: 'right' },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Button type="primary" size="small" onClick={() => setSelectedRecord(record)}>
          Lập hóa đơn
        </Button>
      ),
    },
  ];

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>Lập hóa đơn tháng</Title>
      </div>

      <Space style={{ marginBottom: 16 }}>
        <Select value={thang} options={MONTHS} style={{ width: 130 }} onChange={setThang} />
        <Select value={nam} options={YEARS} style={{ width: 100 }} onChange={setNam} />
      </Space>

      {isLoading ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : choLap.length === 0 ? (
        <Empty description={`Tất cả phòng đã có hóa đơn tháng ${thang}/${nam}`} />
      ) : (
        <Table
          rowKey="hop_dong_id" dataSource={choLap} columns={columns}
          pagination={{ pageSize: 10 }} bordered size="middle"
        />
      )}

      <Modal
        title={`Lập hóa đơn — ${selectedRecord?.ten_phong} — Tháng ${thang}/${nam}`}
        open={!!selectedRecord}
        onCancel={() => setSelectedRecord(null)}
        footer={null}
        width={820}
        destroyOnClose
      >
        {selectedRecord && (
          <HoaDonForm
            record={selectedRecord}
            thang={thang} nam={nam}
            onSuccess={() => setSelectedRecord(null)}
            onCancel={() => setSelectedRecord(null)}
          />
        )}
      </Modal>
    </>
  );
}
