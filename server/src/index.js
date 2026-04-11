require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');
const logger = require('./config/logger');
const { morganMiddleware } = require('./config/logger');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Connect DB
connectDB();

// Middleware pipeline
app.use(morganMiddleware);
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(helmet());
app.use(express.json());

// Routes (will be added per module)
app.use('/api/khu', require('./routes/khu.routes'));
app.use('/api/loai-phong', require('./routes/loaiPhong.routes'));
app.use('/api/phong', require('./routes/phong.routes'));
app.use('/api/don-gia', require('./routes/donGia.routes'));
app.use('/api/khach-hang', require('./routes/khachHang.routes'));
app.use('/api/dat-coc', require('./routes/datCoc.routes'));
app.use('/api/hop-dong', require('./routes/hopDong.routes'));
app.use('/api/nguoi-o', require('./routes/nguoiO.routes'));
app.use('/api/hoa-don', require('./routes/hoaDon.routes'));

// Health check
app.get('/api/health', (req, res) => res.json({ success: true, data: 'OK' }));

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
