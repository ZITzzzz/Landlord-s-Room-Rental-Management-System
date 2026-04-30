import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button, Table, Space, Select, Skeleton, Empty,
} from 'antd';
import { PlusOutlined, FileTextOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import HuyDatCocModal from '../../components/HuyDatCocModal';
import { useDatCocs } from '../../hooks/useDatCoc';

const formatVND = (v) => (v != null ? v.toLocaleString('vi-VN') + ' đ' : '—');

const TRANG_THAI_OPTIONS = [
  { value: 'con_hieu_luc', label: 'Còn hiệu lực' },
  { value: 'da_chuyen_hop_dong', label: 'Đã chuyển HĐ' },
  { value: 'huy', label: 'Đã hủy' },
];

export default function DatCocListPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ trang_thai: 'con_hieu_luc' });
  const [huyTarget, setHuyTarget] = useState(null);

  const { data: datCocs = [], isLoading } = useDatCocs(filters);

  const columns = [
    {
      title: 'Phòng',
      key: 'phong',
      render: (_, r) => r.phong_id?.ten ?? '—',
      sorter: (a, b) => (a.phong_id?.ten ?? '').localeCompare(b.phong_id?.ten ?? ''),
    },
    {
      title: 'Khu',
      key: 'khu',
      render: (_, r) => r.phong_id?.khu_id?.ten ?? '—',
    },
    {
      title: 'Khách hàng',
      key: 'khach_hang',
      render: (_, r) => (
        <a onClick={() => navigate(`/khach-hang/${r.khach_hang_id?._id}`)}>
          {r.khach_hang_id?.ho_ten ?? '—'}
        </a>
      ),
    },
    {
      title: 'SĐT',
      key: 'sdt',
      render: (_, r) => r.khach_hang_id?.so_dien_thoai ?? '—',
    },
    {
      title: 'Số tiền cọc',
      dataIndex: 'so_tien',
      key: 'so_tien',
      align: 'right',
      render: formatVND,
      sorter: (a, b) => a.so_tien - b.so_tien,
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'ngay_dat_coc',
      key: 'ngay_dat_coc',
      render: (v) => dayjs(v).format('DD/MM/YYYY'),
      sorter: (a, b) => new Date(a.ngay_dat_coc) - new Date(b.ngay_dat_coc),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'trang_thai',
      key: 'trang_thai',
      align: 'center',
      render: (v) => <StatusBadge status={v} type="dat_coc" />,
    },
    {
      title: 'Thao tác',
      key: 'action',
      align: 'center',
      render: (_, record) =>
        record.trang_thai === 'con_hieu_luc' ? (
          <Space>
            <Button
              size="small"
              type="primary"
              icon={<FileTextOutlined />}
              onClick={() => navigate('/hop-dong/tao', { state: { phong_id: record.phong_id?._id } })}
            >
              Ký hợp đồng
            </Button>
            <Button size="small" danger onClick={() => setHuyTarget(record)}>
              Hủy đặt cọc
            </Button>
          </Space>
        ) : null,
    },
  ];

  return (
    <>
      <PageHeader
        title="Quản lý đặt cọc"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/dat-coc/tao')}>
            Đặt cọc mới
          </Button>
        }
      />

      <Space style={{ marginBottom: 16 }} wrap>
        <Select
          value={filters.trang_thai ?? null}
          allowClear
          placeholder="Tất cả trạng thái"
          style={{ width: 180 }}
          options={TRANG_THAI_OPTIONS}
          onChange={(v) => setFilters((f) => ({ ...f, trang_thai: v }))}
        />
      </Space>

      {isLoading ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : (
        <Table
          rowKey="_id"
          dataSource={datCocs}
          columns={columns}
          pagination={{ pageSize: 10 }}
          bordered
          size="middle"
          locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không có đặt cọc nào" /> }}
        />
      )}

      <HuyDatCocModal
        open={!!huyTarget}
        phong_id={huyTarget?.phong_id?._id}
        onSuccess={() => setHuyTarget(null)}
        onCancel={() => setHuyTarget(null)}
      />
    </>
  );
}
