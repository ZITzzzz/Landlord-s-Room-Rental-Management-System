import { useState } from 'react';
import { Layout, Menu } from 'antd';
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
  BuildOutlined,
} from '@ant-design/icons';

const { Sider, Header, Content } = Layout;

const menuItems = [
  { key: '/dashboard', icon: <DashboardOutlined />, label: 'Tổng quan' },
  {
    key: 'danh-muc',
    icon: <AppstoreOutlined />,
    label: 'Danh mục',
    children: [
      { key: '/khu', label: 'Khu' },
      { key: '/loai-phong', label: 'Loại phòng' },
    ],
  },
  { key: '/phong', icon: <HomeOutlined />, label: 'Phòng' },
  { key: '/khach-hang', icon: <TeamOutlined />, label: 'Khách hàng' },
  { key: '/dat-coc', icon: <SafetyOutlined />, label: 'Đặt cọc' },
  { key: '/hop-dong', icon: <FileTextOutlined />, label: 'Hợp đồng' },
  { key: '/hoa-don', icon: <DollarOutlined />, label: 'Hóa đơn' },
  { key: '/sua-chua', icon: <ToolOutlined />, label: 'Sửa chữa' },
  { key: '/chi-phi-van-hanh', icon: <BankOutlined />, label: 'Chi phí vận hành' },
  { key: '/bao-cao', icon: <BarChartOutlined />, label: 'Báo cáo' },
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
        {/* Logo / Brand */}
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          padding: collapsed ? 0 : '0 20px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          overflow: 'hidden',
          flexShrink: 0,
        }}>
          <BuildOutlined style={{ fontSize: 22, color: '#1677ff', flexShrink: 0 }} />
          {!collapsed && (
            <span style={{
              color: '#fff',
              fontWeight: 600,
              fontSize: 14,
              marginLeft: 10,
              whiteSpace: 'nowrap',
              letterSpacing: 0.3,
            }}>
              Quản lý phòng trọ
            </span>
          )}
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          defaultOpenKeys={['danh-muc']}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ borderRight: 0, marginTop: 4 }}
        />
      </Sider>

      <Layout>
        <Header style={{
          background: '#fff',
          padding: '0 24px',
          borderBottom: '1px solid #f0f0f0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          zIndex: 1,
          display: 'flex',
          alignItems: 'center',
        }}>
          <span style={{ fontSize: 16, fontWeight: 600, color: '#262626' }}>
            Hệ thống quản lý cho thuê phòng trọ
          </span>
        </Header>

        <Content style={{
          margin: 24,
          padding: 24,
          background: '#fff',
          borderRadius: 12,
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          minHeight: 360,
        }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
