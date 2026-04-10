const mongoose = require('mongoose');

const KhuSchema = new mongoose.Schema(
  {
    ten: { type: String, required: true },
    dia_chi: { type: String, required: true },
    ghi_chu: { type: String },
  },
  { timestamps: true, collection: 'khu' }
);

module.exports = mongoose.model('Khu', KhuSchema);
