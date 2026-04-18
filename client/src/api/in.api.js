// Download a file from the server by opening the URL in a new tab (simplest approach for binary streams)
const BASE = '/api';

export const downloadFile = (url) => {
  const a = document.createElement('a');
  a.href = url;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

export const inHopDong = (id) => downloadFile(`${BASE}/in/hop-dong/${id}`);
export const inHoaDon = (id) => downloadFile(`${BASE}/in/hoa-don/${id}`);
export const inThanhLy = (hop_dong_id) => downloadFile(`${BASE}/in/thanh-ly/${hop_dong_id}`);
export const inHuy = (hop_dong_id) => downloadFile(`${BASE}/in/huy/${hop_dong_id}`);

export const xuatDoanhThu = (params) => {
  const qs = new URLSearchParams(params).toString();
  downloadFile(`${BASE}/xuat/doanh-thu?${qs}`);
};
export const xuatNo = () => downloadFile(`${BASE}/xuat/no`);
export const xuatCongSuat = (params) => {
  const qs = new URLSearchParams(params).toString();
  downloadFile(`${BASE}/xuat/cong-suat?${qs}`);
};
export const xuatDoanhThuTheoPhong = (params) => {
  const qs = new URLSearchParams(params).toString();
  downloadFile(`${BASE}/xuat/doanh-thu-theo-phong?${qs}`);
};
