import { Typography } from 'antd';

export default function PageHeader({ title, extra }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
      paddingBottom: 16,
      borderBottom: '1px solid #f0f0f0',
    }}>
      <Typography.Title level={4} style={{ margin: 0 }}>{title}</Typography.Title>
      {extra}
    </div>
  );
}
