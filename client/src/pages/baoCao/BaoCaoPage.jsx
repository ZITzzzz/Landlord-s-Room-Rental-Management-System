import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Tabs, Typography, Select, Space, Table, Button, Modal, Card, Descriptions,
  Skeleton, Empty, Tag, Row, Col, Statistic,
} from 'antd';
import dayjs from 'dayjs';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
  LineChart, Line, CartesianGrid,
} from 'recharts';
import { FileExcelOutlined } from '@ant-design/icons';
import { useThongKe, useHoaDonKy } from '../../hooks/useThongKe';
import { useCongSuat, useNo, useDoanhThuTheoPhong } from '../../hooks/useBaoCao';
import { useKhus } from '../../hooks/useKhu';
import { xuatDoanhThu, xuatNo, xuatCongSuat, xuatDoanhThuTheoPhong } from '../../api/in.api';

const { Title, Text } = Typography;
const formatVND = (v) => (v != null ? v.toLocaleString('vi-VN') + ' đ' : '—');
const formatDate = (v) => (v ? dayjs(v).format('DD/MM/YYYY') : '—');

const thisYear = dayjs().year();
const thisMonth = dayjs().month() + 1;
const MONTHS = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1).padStart(2, '0'),
  label: `T${i + 1}`,
}));
const YEARS = Array.from({ length: 5 }, (_, i) => ({
  value: String(thisYear - i),
  label: String(thisYear - i),
}));

// ─── Tab 1: Thống kê doanh thu ────────────────────────────────────────────────
function ThongKeTab() {
  const [loai, setLoai] = useState('thang');
  const [tuThang, setTuThang] = useState(String(thisMonth).padStart(2, '0'));
  const [tuNam, setTuNam] = useState(String(thisYear));
  const [denThang, setDenThang] = useState(String(thisMonth).padStart(2, '0'));
  const [denNam, setDenNam] = useState(String(thisYear));
  const [selectedKy, setSelectedKy] = useState(null);

  const params = {
    loai,
    tu: `${tuNam}-${tuThang}`,
    den: `${denNam}-${denThang}`,
  };
  const { data: rows = [], isLoading } = useThongKe(params);
  const { data: invoices = [], isLoading: invLoading } = useHoaDonKy(selectedKy);

  const columns = [
    { title: 'Kỳ', dataIndex: 'ky', key: 'ky' },
    {
      title: 'Doanh thu',
      dataIndex: 'doanh_thu',
      key: 'doanh_thu',
      align: 'right',
      render: formatVND,
    },
    {
      title: 'Chi phí VH',
      dataIndex: 'chi_phi',
      key: 'chi_phi',
      align: 'right',
      render: formatVND,
    },
    {
      title: 'Lợi nhuận',
      dataIndex: 'loi_nhuan',
      key: 'loi_nhuan',
      align: 'right',
      render: (v) => (
        <Text type={v >= 0 ? 'success' : 'danger'}>{formatVND(v)}</Text>
      ),
    },
    {
      title: 'Chi tiết',
      key: 'action',
      render: (_, r) => (
        <Button type="link" size="small" onClick={() => setSelectedKy(r.ky)}>
          Hóa đơn
        </Button>
      ),
    },
  ];

  const invColumns = [
    { title: 'Phòng', dataIndex: 'ten_phong', key: 'ten_phong' },
    { title: 'Khách hàng', dataIndex: 'ten_khach_hang', key: 'ten_khach_hang' },
    { title: 'Tháng', key: 'ky', render: (_, r) => `${r.thang}/${r.nam}` },
    { title: 'Tổng tiền', dataIndex: 'tong_tien', key: 'tong_tien', align: 'right', render: formatVND },
    {
      title: 'Phương thức',
      dataIndex: 'phuong_thuc',
      key: 'phuong_thuc',
      render: (v) =>
        v === 'tien_mat' ? <Tag>Tiền mặt</Tag> : <Tag color="blue">Chuyển khoản</Tag>,
    },
    { title: 'Ngày TT', dataIndex: 'ngay_thanh_toan', key: 'ngay_thanh_toan', render: formatDate },
  ];

  return (
    <Space direction="vertical" style={{ width: '100%' }} size={16}>
      <Space wrap>
        <Select
          value={loai}
          onChange={setLoai}
          style={{ width: 130 }}
          options={[
            { value: 'thang', label: 'Theo tháng' },
            { value: 'quy', label: 'Theo quý' },
            { value: 'nam', label: 'Theo năm' },
          ]}
        />
        <Text>Từ</Text>
        <Select value={tuThang} options={MONTHS} style={{ width: 80 }} onChange={setTuThang} />
        <Select value={tuNam} options={YEARS} style={{ width: 90 }} onChange={setTuNam} />
        <Text>đến</Text>
        <Select value={denThang} options={MONTHS} style={{ width: 80 }} onChange={setDenThang} />
        <Select value={denNam} options={YEARS} style={{ width: 90 }} onChange={setDenNam} />
      </Space>

      {isLoading ? (
        <Skeleton active paragraph={{ rows: 5 }} />
      ) : rows.length === 0 ? (
        <Empty description="Không có dữ liệu" />
      ) : (
        <>
          <Button icon={<FileExcelOutlined />} onClick={() => xuatDoanhThu(params)} style={{ alignSelf: 'flex-start' }}>
            Xuất Excel
          </Button>
          <Card size="small">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={rows} barSize={30}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="ky" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(v) => (v / 1_000_000).toFixed(0) + 'M'} />
                <Tooltip formatter={(v) => formatVND(v)} />
                <Legend />
                <Bar dataKey="doanh_thu" name="Doanh thu" fill="#1677ff" radius={[3, 3, 0, 0]} />
                <Bar dataKey="chi_phi" name="Chi phí" fill="#ff7875" radius={[3, 3, 0, 0]} />
                <Bar dataKey="loi_nhuan" name="Lợi nhuận" fill="#52c41a" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
          <Table
            rowKey="ky"
            dataSource={rows}
            columns={columns}
            pagination={false}
            bordered
            size="small"
          />
        </>
      )}

      <Modal
        title={`Hóa đơn kỳ ${selectedKy}`}
        open={!!selectedKy}
        onCancel={() => setSelectedKy(null)}
        footer={null}
        width={820}
        destroyOnClose
      >
        {invLoading ? (
          <Skeleton active paragraph={{ rows: 5 }} />
        ) : (
          <Table
            rowKey="hoa_don_id"
            dataSource={invoices}
            columns={invColumns}
            pagination={{ pageSize: 10 }}
            size="small"
            bordered
          />
        )}
      </Modal>
    </Space>
  );
}

// ─── Tab 2: Báo cáo công suất ─────────────────────────────────────────────────
function CongSuatTab() {
  const [tuThang, setTuThang] = useState(String(thisMonth).padStart(2, '0'));
  const [tuNam, setTuNam] = useState(String(thisYear));
  const [denThang, setDenThang] = useState(String(thisMonth).padStart(2, '0'));
  const [denNam, setDenNam] = useState(String(thisYear));

  const params = {
    tu: `${tuNam}-${tuThang}`,
    den: `${denNam}-${denThang}`,
  };
  const { data, isLoading } = useCongSuat(params);

  const khuCols = [
    { title: 'Khu', dataIndex: 'ten_khu', key: 'ten_khu' },
    { title: 'Đang thuê', dataIndex: 'dang_thue', key: 'dang_thue', align: 'right' },
    { title: 'Tổng phòng', dataIndex: 'tong_phong', key: 'tong_phong', align: 'right' },
    {
      title: 'Tỉ lệ',
      dataIndex: 'ti_le',
      key: 'ti_le',
      align: 'right',
      render: (v) => (
        <Tag color={v >= 80 ? 'success' : v >= 50 ? 'warning' : 'error'}>{v}%</Tag>
      ),
    },
  ];

  const lichSuCols = [
    { title: 'Tháng', dataIndex: 'thang', key: 'thang' },
    { title: 'Số phòng thuê', dataIndex: 'so_phong_thue', key: 'so_phong_thue', align: 'right' },
    {
      title: 'Tỉ lệ',
      dataIndex: 'ti_le',
      key: 'ti_le',
      align: 'right',
      render: (v) => `${v}%`,
    },
  ];

  return (
    <Space direction="vertical" style={{ width: '100%' }} size={16}>
      <Space wrap>
        <Text>Lịch sử từ</Text>
        <Select value={tuThang} options={MONTHS} style={{ width: 80 }} onChange={setTuThang} />
        <Select value={tuNam} options={YEARS} style={{ width: 90 }} onChange={setTuNam} />
        <Text>đến</Text>
        <Select value={denThang} options={MONTHS} style={{ width: 80 }} onChange={setDenThang} />
        <Select value={denNam} options={YEARS} style={{ width: 90 }} onChange={setDenNam} />
      </Space>

      {isLoading ? (
        <Skeleton active paragraph={{ rows: 5 }} />
      ) : !data ? null : (
        <>
          <Button icon={<FileExcelOutlined />} onClick={() => xuatCongSuat(params)} style={{ alignSelf: 'flex-start' }}>
            Xuất Excel
          </Button>
          <Row gutter={16}>
            <Col span={8}>
              <Card>
                <Statistic title="Tổng số phòng" value={data.tong_quat?.tong_phong} />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic title="Đang thuê" value={data.tong_quat?.dang_thue} />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title="Tỉ lệ lấp đầy"
                  value={data.tong_quat?.ti_le}
                  suffix="%"
                  valueStyle={{
                    color: data.tong_quat?.ti_le >= 80 ? '#52c41a' : '#faad14',
                  }}
                />
              </Card>
            </Col>
          </Row>

          <Table
            rowKey="khu_id"
            dataSource={data.theo_khu}
            columns={khuCols}
            pagination={false}
            bordered
            size="small"
            title={() => <strong>Theo khu</strong>}
          />

          {data.lich_su_theo_thang?.length > 0 && (
            <>
              <Card size="small" title="Xu hướng lấp đầy theo tháng">
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={data.lich_su_theo_thang}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="thang" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                    <Tooltip formatter={(v) => `${v}%`} />
                    <Line type="monotone" dataKey="ti_le" name="Tỉ lệ %" stroke="#1677ff" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
              <Table
                rowKey="thang"
                dataSource={data.lich_su_theo_thang}
                columns={lichSuCols}
                pagination={{ pageSize: 12 }}
                bordered
                size="small"
              />
            </>
          )}
        </>
      )}
    </Space>
  );
}

// ─── Tab 3: Báo cáo nợ ───────────────────────────────────────────────────────
function NoTab() {
  const { data = [], isLoading } = useNo();

  const expandedCols = [
    { title: 'Phòng', dataIndex: 'ten_phong', key: 'ten_phong' },
    { title: 'Số tiền nợ', dataIndex: 'no', key: 'no', align: 'right', render: formatVND },
    {
      title: 'Tháng nợ liên tiếp',
      dataIndex: 'so_thang_no_lien_tiep',
      key: 'so_thang',
      render: (v) => (
        <Tag color={v >= 2 ? 'red' : 'orange'}>{v} tháng</Tag>
      ),
    },
  ];

  const columns = [
    { title: 'Khách hàng', dataIndex: 'ten_khach_hang', key: 'ten_khach_hang' },
    { title: 'SĐT', dataIndex: 'so_dien_thoai', key: 'so_dien_thoai' },
    {
      title: 'Tổng nợ',
      dataIndex: 'tong_no',
      key: 'tong_no',
      align: 'right',
      render: (v) => <Text type="danger">{formatVND(v)}</Text>,
    },
  ];

  return isLoading ? (
    <Skeleton active paragraph={{ rows: 6 }} />
  ) : data.length === 0 ? (
    <Empty description="Không có khách hàng nào đang nợ" />
  ) : (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Button icon={<FileExcelOutlined />} onClick={() => xuatNo()} style={{ alignSelf: 'flex-start' }}>
        Xuất Excel
      </Button>
    <Table
      rowKey="khach_hang_id"
      dataSource={data}
      columns={columns}
      pagination={{ pageSize: 10 }}
      bordered
      size="middle"
      expandable={{
        expandedRowRender: (r) => (
          <Table
            rowKey="hop_dong_id"
            dataSource={r.chi_tiet_theo_phong}
            columns={expandedCols}
            pagination={false}
            size="small"
          />
        ),
      }}
    />
    </Space>
  );
}

// ─── Tab 4: Doanh thu theo phòng ──────────────────────────────────────────────
function DoanhThuTheoPhongTab() {
  const [tuThang, setTuThang] = useState(String(thisMonth).padStart(2, '0'));
  const [tuNam, setTuNam] = useState(String(thisYear));
  const [denThang, setDenThang] = useState(String(thisMonth).padStart(2, '0'));
  const [denNam, setDenNam] = useState(String(thisYear));
  const [khu_id, setKhuId] = useState(undefined);

  const { data: khus = [] } = useKhus();
  const params = { tu: `${tuNam}-${tuThang}`, den: `${denNam}-${denThang}`, khu_id };
  const { data = [], isLoading } = useDoanhThuTheoPhong(params);

  const columns = [
    { title: 'Phòng', dataIndex: 'ten_phong', key: 'ten_phong' },
    { title: 'Khu', dataIndex: 'ten_khu', key: 'ten_khu' },
    {
      title: 'Doanh thu',
      dataIndex: 'doanh_thu',
      key: 'doanh_thu',
      align: 'right',
      render: formatVND,
    },
  ];

  return (
    <Space direction="vertical" style={{ width: '100%' }} size={16}>
      <Space wrap>
        <Select
          allowClear
          placeholder="Tất cả khu"
          style={{ width: 160 }}
          options={khus.map((k) => ({ value: k._id, label: k.ten }))}
          onChange={setKhuId}
        />
        <Text>Từ</Text>
        <Select value={tuThang} options={MONTHS} style={{ width: 80 }} onChange={setTuThang} />
        <Select value={tuNam} options={YEARS} style={{ width: 90 }} onChange={setTuNam} />
        <Text>đến</Text>
        <Select value={denThang} options={MONTHS} style={{ width: 80 }} onChange={setDenThang} />
        <Select value={denNam} options={YEARS} style={{ width: 90 }} onChange={setDenNam} />
      </Space>

      {isLoading ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : data.length === 0 ? (
        <Empty description="Không có dữ liệu trong khoảng thời gian này" />
      ) : (
        <>
          <Button icon={<FileExcelOutlined />} onClick={() => xuatDoanhThuTheoPhong(params)} style={{ alignSelf: 'flex-start' }}>
            Xuất Excel
          </Button>
          <Card size="small">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.slice(0, 15)} barSize={30} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tickFormatter={(v) => (v / 1_000_000).toFixed(0) + 'M'} />
                <YAxis dataKey="ten_phong" type="category" width={70} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => formatVND(v)} />
                <Bar dataKey="doanh_thu" name="Doanh thu" fill="#1677ff" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
          <Table
            rowKey="phong_id"
            dataSource={data}
            columns={columns}
            pagination={{ pageSize: 10 }}
            bordered
            size="small"
          />
        </>
      )}
    </Space>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function BaoCaoPage() {
  const tabItems = [
    { key: 'thong-ke', label: 'Thống kê doanh thu', children: <ThongKeTab /> },
    { key: 'cong-suat', label: 'Công suất phòng', children: <CongSuatTab /> },
    { key: 'no', label: 'Báo cáo nợ', children: <NoTab /> },
    { key: 'doanh-thu-phong', label: 'Doanh thu theo phòng', children: <DoanhThuTheoPhongTab /> },
  ];

  return (
    <>
      <Title level={4} style={{ marginBottom: 16 }}>Thống kê & Báo cáo</Title>
      <Tabs defaultActiveKey="thong-ke" items={tabItems} />
    </>
  );
}
