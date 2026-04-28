module.exports = (req, res, next) => {
  const key = process.env.ADMIN_KEY;
  if (key && req.headers['x-admin-key'] !== key) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Admin key required' });
  }
  next();
};
