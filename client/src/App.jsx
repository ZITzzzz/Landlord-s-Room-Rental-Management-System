import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';

// Module 1
import KhuPage from './pages/khu/KhuPage';
import LoaiPhongPage from './pages/loaiPhong/LoaiPhongPage';

// Module 2
import PhongPage from './pages/phong/PhongPage';

// Module 3
import KhachHangListPage from './pages/khachHang/KhachHangListPage';
import KhachHangDetailPage from './pages/khachHang/KhachHangDetailPage';

// Module 4
import DatCocWizard from './pages/datCoc/DatCocWizard';

// Module 5
import HopDongListPage from './pages/hopDong/HopDongListPage';
import HopDongDetailPage from './pages/hopDong/HopDongDetailPage';
import HopDongWizard from './pages/hopDong/HopDongWizard';

// Module 6
import HoaDonListPage from './pages/hoaDon/HoaDonListPage';
import LapHoaDonPage from './pages/hoaDon/LapHoaDonPage';

// Module 7
import ThanhLyPage from './pages/thanhLy/ThanhLyPage';

// Module 10
import DashboardPage from './pages/dashboard/DashboardPage';
import BaoCaoPage from './pages/baoCao/BaoCaoPage';

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
        <Route path="dashboard" element={<DashboardPage />} />

        {/* Module 1 */}
        <Route path="khu" element={<KhuPage />} />
        <Route path="loai-phong" element={<LoaiPhongPage />} />

        {/* Module 2 */}
        <Route path="phong" element={<PhongPage />} />

        {/* Module 3 */}
        <Route path="khach-hang" element={<KhachHangListPage />} />
        <Route path="khach-hang/:id" element={<KhachHangDetailPage />} />

        {/* Module 4 */}
        <Route path="dat-coc" element={<DatCocWizard />} />

        {/* Module 5 */}
        <Route path="hop-dong" element={<HopDongListPage />} />
        <Route path="hop-dong/tao" element={<HopDongWizard />} />
        <Route path="hop-dong/:id" element={<HopDongDetailPage />} />

        {/* Module 6 */}
        <Route path="hoa-don" element={<HoaDonListPage />} />
        <Route path="hoa-don/lap" element={<LapHoaDonPage />} />

        {/* Module 7 */}
        <Route path="thanh-ly" element={<ThanhLyPage />} />

        {/* Module 8 */}
        <Route path="sua-chua" element={<Placeholder title="Sửa chữa" />} />

        {/* Module 9 */}
        <Route path="chi-phi-van-hanh" element={<Placeholder title="Chi phí vận hành" />} />

        {/* Module 10 */}
        <Route path="bao-cao" element={<BaoCaoPage />} />
      </Route>
    </Routes>
  );
}
