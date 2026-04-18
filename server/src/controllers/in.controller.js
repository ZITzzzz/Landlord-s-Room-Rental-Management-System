const pdfService = require('../services/pdf.service');

const sendPDF = (buffer, filename, res) => {
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(buffer);
};

const inHopDong = async (req, res, next) => {
  try {
    const buffer = await pdfService.hopDongPDF(req.params.id);
    sendPDF(buffer, `hop-dong-${req.params.id}.pdf`, res);
  } catch (err) { next(err); }
};

const inHoaDon = async (req, res, next) => {
  try {
    const buffer = await pdfService.hoaDonPDF(req.params.id);
    sendPDF(buffer, `hoa-don-${req.params.id}.pdf`, res);
  } catch (err) { next(err); }
};

const inThanhLy = async (req, res, next) => {
  try {
    const buffer = await pdfService.thanhLyPDF(req.params.hop_dong_id);
    sendPDF(buffer, `thanh-ly-${req.params.hop_dong_id}.pdf`, res);
  } catch (err) { next(err); }
};

const inHuy = async (req, res, next) => {
  try {
    const buffer = await pdfService.huyHopDongPDF(req.params.hop_dong_id);
    sendPDF(buffer, `huy-hop-dong-${req.params.hop_dong_id}.pdf`, res);
  } catch (err) { next(err); }
};

module.exports = { inHopDong, inHoaDon, inThanhLy, inHuy };
