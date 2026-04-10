import { useState } from 'react';
import { Layout, Menu, Typography } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  HomeOutlined,
  TeamOutlined,
  FileTextOutlined,
  DollarOutlined,
  ToolOutlined,
  BarChartOutlined,
  BankOutlined,
  AppstoreOutlined,
  SafetyOutlined,
} from '@ant-design/icons';

const { Sider, Header, Content } = Layout;
const { Title } = Typography;

const menuItems = [
  {
    key: '/dashboard',
    icon: <DashboardOutlined />,
    label: 'Tổng quan',
  },
  {
    key: 'danh-muc',
    icon: <AppstoreOutlined />,
    label: 'Danh mục',
    children: [
      { key: '/khu', label: 'Khu' },
      { key: '/loai-phong', label: 'Loại phòng' },
    ],
  },
  {
    key: '/phong',
    icon: <HomeOutlined />,
    label: 'Phòng',
  },
  {
    key: '/khach-hang',
    icon: <TeamOutlined />,
    label: 'Khách hàng',
  },
  {
    key: '/dat-coc',
    icon: <SafetyOutlined />,
    label: 'Đặt cọc',
  },
  {
    key: '/hop-dong',
    icon: <FileTextOutlined />,
    label: 'Hợp đồng',
  },
  {
    key: '/hoa-don',
    icon: <DollarOutlined />,
    label: 'Hóa đơn',
  },
  {
    key: '/sua-chua',
    icon: <ToolOutlined />,
    label: 'Sửa chữa',
  },
  {
    key: '/chi-phi-van-hanh',
    icon: <BankOutlined />,
    label: 'Chi phí vận hành',
  },
  {
    key: '/bao-cao',
    icon: <BarChartOutlined />,
    label: 'Báo cáo',
  },
];

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const selectedKey = location.pathname;

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={220}
        style={{ background: '#001529' }}
      >
        <div style={{ padding: '16px', textAlign: 'center' }}>
          {!collapsed && (
            <Title level={5} style={{ color: '#fff', margin: 0, fontSize: 13 }}>
              Quản lý phòng trọ
            </Title>
          )}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          defaultOpenKeys={['danh-muc']}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>

      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px', borderBottom: '1px solid #f0f0f0' }}>
          <Title level={4} style={{ margin: 0, lineHeight: '64px' }}>
            Hệ thống quản lý cho thuê phòng trọ
          </Title>
        </Header>
        <Content style={{ margin: 24, padding: 24, background: '#fff', borderRadius: 8, minHeight: 360 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
