import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Table, Space, Select, DatePicker, Input, Skeleton, Empty } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import PageHeader from '../../components/PageHeader';
import dayjs from 'dayjs';
import { useHopDongs } from '../../hooks/useHopDong';
import { useKhus } from '../../hooks/useKhu';
import StatusBadge from '../../components/StatusBadge';

const { RangePicker } = DatePicker;

const formatDate = (v) => (v ? dayjs(v).format('DD/MM/YYYY') : '—');
const formatVND = (v) => (v != null ? v.toLocaleString('vi-VN') + ' đ' : '—');

export default function HopDongListPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({});
  const { data: hopDongs = [], isLoading } = useHopDongs(filters);
  const { data: khus = [] } = useKhus();

  const columns = [
    { title: 'Phòng', dataIndex: 'ten_phong', key: 'ten_phong' },
    { title: 'Khu', dataIndex: 'ten_khu', key: 'ten_khu' },
    { title: 'Khách hàng', dataIndex: 'ten_khach_hang', key: 'ten_khach_hang' },
    { title: 'Ngày bắt đầu', dataIndex: 'ngay_bat_dau', key: 'ngay_bat_dau', render: formatDate },
    { title: 'Ngày hết hạn', dataIndex: 'ngay_het_han', key: 'ngay_het_han', render: formatDate },
    { title: 'Giá thuê', dataIndex: 'gia_thue_ky_hop_dong', key: 'gia_thue', align: 'right', render: formatVND },
    {
      title: 'Trạng thái',
      dataIndex: 'trang_thai',
      key: 'trang_thai',
      render: (v) => <StatusBadge status={v} type="hop_dong" />,
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Button size="small" onClick={() => navigate(`/hop-dong/${record._id}`)}>
          Xem chi tiết
        </Button>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Quản lý hợp đồng"
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/hop-dong/tao')}>Ký hợp đồng mới</Button>}
      />

      <Space style={{ marginBottom: 16 }} wrap>
        <Select
          allowClear placeholder="Trạng thái" style={{ width: 160 }}
          options={[
            { value: 'hieu_luc', label: 'Hiệu lực' },
            { value: 'thanh_ly', label: 'Thanh lý' },
            { value: 'huy', label: 'Đã hủy' },
          ]}
          onChange={(v) => setFilters((f) => ({ ...f, trang_thai: v }))}
        />
        <Select
          allowClear placeholder="Khu" style={{ width: 160 }}
          options={khus.map((k) => ({ value: k._id, label: k.ten }))}
          onChange={(v) => setFilters((f) => ({ ...f, khu_id: v }))}
        />
        <RangePicker
          format="DD/MM/YYYY"
          placeholder={['Từ ngày', 'Đến ngày']}
          onChange={(dates) =>
            setFilters((f) => ({
              ...f,
              tu: dates?.[0]?.toISOString(),
              den: dates?.[1]?.toISOString(),
            }))
          }
        />
        <Input
          prefix={<SearchOutlined />}
          placeholder="Tìm phòng / khách hàng"
          allowClear style={{ width: 220 }}
          onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
        />
      </Space>

      {isLoading ? (
        <Skeleton active paragraph={{ rows: 8 }} />
      ) : (
        <Table
          rowKey="_id" dataSource={hopDongs} columns={columns}
          pagination={{ pageSize: 10 }} bordered size="middle"
          onRow={(r) => ({ onClick: () => navigate(`/hop-dong/${r._id}`) })}
          locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không có hợp đồng nào" /> }}
        />
      )}
    </>
  );
}
