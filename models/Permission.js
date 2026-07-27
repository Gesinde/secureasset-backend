const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true }, // e.g. 'asset.create'
  description: { type: String },
  allowedRoles: [{ type: String }],
});

module.exports = mongoose.model('Permission', permissionSchema);
