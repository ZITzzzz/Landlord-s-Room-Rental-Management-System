import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';

// Pages — loaded lazily per module as they're built
import KhuPage from './pages/khu/KhuPage';
import LoaiPhongPage from './pages/loaiPhong/LoaiPhongPage';

// Placeholder for unbuilt pages
const Placeholder = ({ title }) => (
  <div style={{ padding: 24 }}>
    <h2>{title}</h2>
    <p>Chức năng đang được phát triển.</p>
  </div>
);

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Placeholder title="Tổng quan" />} />

        {/* Module 1 */}
        <Route path="khu" element={<KhuPage />} />
        <Route path="loai-phong" element={<LoaiPhongPage />} />

        {/* Module 2 */}
        <Route path="phong" element={<Placeholder title="Phòng" />} />
        <Route path="don-gia" element={<Placeholder title="Đơn giá dịch vụ" />} />

        {/* Module 3 */}
        <Route path="khach-hang" element={<Placeholder title="Khách hàng" />} />

        {/* Module 4 */}
        <Route path="dat-coc" element={<Placeholder title="Đặt cọc" />} />

        {/* Module 5 */}
        <Route path="hop-dong" element={<Placeholder title="Hợp đồng" />} />

        {/* Module 6 */}
        <Route path="hoa-don" element={<Placeholder title="Hóa đơn" />} />

        {/* Module 7 */}
        <Route path="thanh-ly" element={<Placeholder title="Thanh lý / Hủy hợp đồng" />} />

        {/* Module 8 */}
        <Route path="sua-chua" element={<Placeholder title="Sửa chữa" />} />

        {/* Module 9 */}
        <Route path="chi-phi-van-hanh" element={<Placeholder title="Chi phí vận hành" />} />

        {/* Module 10 */}
        <Route path="bao-cao" element={<Placeholder title="Thống kê & Báo cáo" />} />
      </Route>
    </Routes>
  );
}
