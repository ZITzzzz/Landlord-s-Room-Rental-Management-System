import { useNavigate } from 'react-router-dom';
import {
  Card, Col, Row, Statistic, Typography, Skeleton, Button, List, Tag, Space,
  Divider, Empty, Badge,
} from 'antd';
import {
  HomeOutlined, DollarOutlined, ClockCircleOutlined, ToolOutlined,
  BellOutlined, EyeOutlined, ReloadOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { useKPI, useCanhBao, useMarkSeen } from '../../hooks/useDashboard';
import PageHeader from '../../components/PageHeader';

const { Title, Text } = Typography;
const formatVND = (v) => (v != null ? v.toLocaleString('vi-VN') + ' đ' : '—');
const formatDate = (v) => (v ? dayjs(v).format('DD/MM/YYYY') : '—');

// ─── KPI Section ──────────────────────────────────────────────────────────────
function KPISection() {
  const { data, isLoading } = useKPI();

  if (isLoading) return <Skeleton active paragraph={{ rows: 3 }} />;
  if (!data) return null;

  const chartData = (data.ti_le_lap_day || []).map((k) => ({
    name: k.ten_khu,
    'Đang thuê': k.so_phong_thue,
    'Tổng phòng': k.tong_so_phong - k.so_phong_thue,
    ti_le: k.ti_le,
  }));

  return (
    <>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card bordered>
            <Statistic
              title="Doanh thu tháng này"
              value={data.doanh_thu_thang_nay}
              formatter={(v) => formatVND(v)}
              prefix={<DollarOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered>
            <Statistic
              title="HĐ sắp hết hạn (30 ngày)"
              value={data.so_hop_dong_sap_het_han}
              suffix="hợp đồng"
              prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: data.so_hop_dong_sap_het_han > 0 ? '#faad14' : undefined }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered>
            <Statistic
              title="Phòng đang sửa chữa"
              value={data.so_phong_dang_sua_chua}
              suffix="phòng"
              prefix={<ToolOutlined style={{ color: '#ff4d4f' }} />}
              valueStyle={{ color: data.so_phong_dang_sua_chua > 0 ? '#ff4d4f' : undefined }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered>
            <Statistic
              title="Tổng phòng đang thuê"
              value={(data.ti_le_lap_day || []).reduce((s, k) => s + k.so_phong_thue, 0)}
              suffix={`/ ${(data.ti_le_lap_day || []).reduce((s, k) => s + k.tong_so_phong, 0)} phòng`}
              prefix={<HomeOutlined style={{ color: '#1677ff' }} />}
              valueStyle={{ color: '#1677ff' }}
            />
          </Card>
        </Col>
      </Row>

      {chartData.length > 0 && (
        <Card title="Tỉ lệ lấp đầy theo khu" style={{ marginBottom: 24 }}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} barSize={40}>
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
              <Tooltip formatter={(v, name) => name === 'ti_le' ? `${v}%` : `${v} phòng`} />
              <Bar dataKey="ti_le" name="Tỉ lệ %" fill="#1677ff" radius={[4, 4, 0, 0]}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={_.ti_le >= 80 ? '#52c41a' : _.ti_le >= 50 ? '#faad14' : '#ff4d4f'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}
    </>
  );
}

// ─── Alert Item ───────────────────────────────────────────────────────────────
function AlertItem({ item, loai, idField, onSeen, children }) {
  const markSeen = useMarkSeen();
  return (
    <List.Item
      actions={[
        <Button
          key="seen"
          size="small"
          icon={<EyeOutlined />}
          loading={markSeen.isPending}
          onClick={() => { onSeen?.(); markSeen.mutate({ loai, id: item[idField] }); }}
        >
          Đã xem
        </Button>,
      ]}
    >
      {children}
    </List.Item>
  );
}

// ─── Alerts Section ───────────────────────────────────────────────────────────
function AlertsSection() {
  const navigate = useNavigate();
  const { data, isLoading, refetch, isFetching } = useCanhBao();

  if (isLoading) return <Skeleton active paragraph={{ rows: 6 }} />;
  if (!data) return null;

  const total =
    (data.phong_chua_hd?.length || 0) +
    (data.hd_sap_den_han?.length || 0) +
    (data.hd_qua_han?.length || 0) +
    (data.nguy_co_huy?.length || 0) +
    (data.hop_dong_sap_het?.length || 0);

  return (
    <Card
      title={
        <Space>
          <BellOutlined />
          <span>Cảnh báo</span>
          {total > 0 && <Badge count={total} />}
        </Space>
      }
      extra={
        <Button icon={<ReloadOutlined />} size="small" loading={isFetching} onClick={() => refetch()}>
          Làm mới
        </Button>
      }
    >
      {total === 0 && <Empty description="Không có cảnh báo nào" />}

      {data.phong_chua_hd?.length > 0 && (
        <>
          <Title level={5} style={{ color: '#595959' }}>
            <Tag color="default">Phòng trống chưa có hợp đồng</Tag>
            ({data.phong_chua_hd.length})
          </Title>
          <List
            size="small"
            dataSource={data.phong_chua_hd}
            renderItem={(item) => (
              <AlertItem item={item} loai="phong_chua_hd" idField="phong_id">
                <Space>
                  <Text>
                    <strong>{item.ten_phong}</strong> — {item.ten_khu}
                  </Text>
                  <Button
                    type="link"
                    size="small"
                    onClick={() => navigate(`/dat-coc`)}
                  >
                    Đặt cọc
                  </Button>
                </Space>
              </AlertItem>
            )}
          />
          <Divider style={{ margin: '12px 0' }} />
        </>
      )}

      {data.hd_qua_han?.length > 0 && (
        <>
          <Title level={5}>
            <Tag color="red">Hóa đơn quá hạn</Tag>
            ({data.hd_qua_han.length})
          </Title>
          <List
            size="small"
            dataSource={data.hd_qua_han}
            renderItem={(item) => (
              <AlertItem item={item} loai="hd_qua_han" idField="hoa_don_id">
                <Space wrap>
                  <Text>
                    <strong>{item.ten_phong}</strong> — {formatVND(item.so_tien)}
                  </Text>
                  <Tag color="red">Quá hạn {item.so_ngay_qua_han} ngày</Tag>
                  <Button
                    type="link"
                    size="small"
                    onClick={() => navigate('/hoa-don')}
                  >
                    Xem
                  </Button>
                </Space>
              </AlertItem>
            )}
          />
          <Divider style={{ margin: '12px 0' }} />
        </>
      )}

      {data.hd_sap_den_han?.length > 0 && (
        <>
          <Title level={5}>
            <Tag color="orange">Hóa đơn sắp đến hạn (≤3 ngày)</Tag>
            ({data.hd_sap_den_han.length})
          </Title>
          <List
            size="small"
            dataSource={data.hd_sap_den_han}
            renderItem={(item) => (
              <AlertItem item={item} loai="hd_sap_den_han" idField="hoa_don_id">
                <Space wrap>
                  <Text>
                    <strong>{item.ten_phong}</strong> — {formatVND(item.so_tien)}
                  </Text>
                  <Text type="secondary">Hạn: {formatDate(item.han_thanh_toan)}</Text>
                </Space>
              </AlertItem>
            )}
          />
          <Divider style={{ margin: '12px 0' }} />
        </>
      )}

      {data.nguy_co_huy?.length > 0 && (
        <>
          <Title level={5}>
            <Tag color="volcano">Nguy cơ hủy hợp đồng</Tag>
            ({data.nguy_co_huy.length})
          </Title>
          <List
            size="small"
            dataSource={data.nguy_co_huy}
            renderItem={(item) => (
              <AlertItem item={item} loai="nguy_co_huy" idField="hop_dong_id">
                <Space wrap>
                  <Text>
                    <strong>{item.ten_phong}</strong> — {item.ten_khach_hang}
                  </Text>
                  <Tag color="volcano">Nợ {item.so_thang_no} tháng</Tag>
                  <Button
                    type="link"
                    size="small"
                    onClick={() => navigate(`/thanh-ly`)}
                  >
                    Xử lý
                  </Button>
                </Space>
              </AlertItem>
            )}
          />
          <Divider style={{ margin: '12px 0' }} />
        </>
      )}

      {data.hop_dong_sap_het?.length > 0 && (
        <>
          <Title level={5}>
            <Tag color="blue">Hợp đồng sắp hết hạn (30 ngày)</Tag>
            ({data.hop_dong_sap_het.length})
          </Title>
          <List
            size="small"
            dataSource={data.hop_dong_sap_het}
            renderItem={(item) => (
              <AlertItem item={item} loai="hop_dong_sap_het" idField="hop_dong_id">
                <Space wrap>
                  <Text>
                    <strong>{item.ten_phong}</strong> — {item.ten_khach_hang}
                  </Text>
                  <Text type="secondary">Hết hạn: {formatDate(item.ngay_het_han)}</Text>
                  <Button
                    type="link"
                    size="small"
                    onClick={() => navigate(`/hop-dong/${item.hop_dong_id}`)}
                  >
                    Chi tiết
                  </Button>
                </Space>
              </AlertItem>
            )}
          />
        </>
      )}
    </Card>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  return (
    <>
      <PageHeader title="Tổng quan" />
      <KPISection />
      <AlertsSection />
    </>
  );
}
