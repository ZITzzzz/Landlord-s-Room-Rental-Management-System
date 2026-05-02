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
  LogoutOutlined,
} from '@ant-design/icons';
import { Button } from 'antd';

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

const handleLogout = (navigate) => {
  localStorage.removeItem('token');
  navigate('/login', { replace: true });
};

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
        style={{
          background: '#001529',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          height: '100vh',
          overflow: 'auto',
          zIndex: 100,
        }}
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

      <Layout style={{ marginLeft: collapsed ? 80 : 220, transition: 'margin-left 0.2s' }}>
        <Header style={{
          background: '#fff',
          padding: '0 24px',
          borderBottom: '1px solid #f0f0f0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          zIndex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: 16, fontWeight: 600, color: '#262626' }}>
            Hệ thống quản lý cho thuê phòng trọ
          </span>
          <Button
            icon={<LogoutOutlined />}
            type="text"
            onClick={() => handleLogout(navigate)}
          >
            Đăng xuất
          </Button>
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
