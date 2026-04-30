import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import LoginPage from './pages/login/LoginPage';
import PrivateRoute from './components/PrivateRoute';

// Module 1
import KhuPage from './pages/khu/KhuPage';
import LoaiPhongPage from './pages/loaiPhong/LoaiPhongPage';

// Module 2
import PhongPage from './pages/phong/PhongPage';

// Module 3
import KhachHangListPage from './pages/khachHang/KhachHangListPage';
import KhachHangDetailPage from './pages/khachHang/KhachHangDetailPage';

// Module 4
import DatCocListPage from './pages/datCoc/DatCocListPage';
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

// Module 8
import SuaChuaPage from './pages/suaChua/SuaChuaPage';

// Module 9
import ChiPhiPage from './pages/chiPhi/ChiPhiPage';

// Module 10
import DashboardPage from './pages/dashboard/DashboardPage';
import BaoCaoPage from './pages/baoCao/BaoCaoPage';


export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<PrivateRoute><MainLayout /></PrivateRoute>}>
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

        {/* Module 4 — /dat-coc/tao before /dat-coc to avoid :id match */}
        <Route path="dat-coc/tao" element={<DatCocWizard />} />
        <Route path="dat-coc" element={<DatCocListPage />} />

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
        <Route path="sua-chua" element={<SuaChuaPage />} />

        {/* Module 9 */}
        <Route path="chi-phi-van-hanh" element={<ChiPhiPage />} />

        {/* Module 10 */}
        <Route path="bao-cao" element={<BaoCaoPage />} />
      </Route>
    </Routes>
  );
}
