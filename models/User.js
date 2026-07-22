const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: [
      'system_admin',
      'department_head',
      'department_staff',
      'auditor',
      'maintenance_officer',
      'maintenance_technician',
      'security_officer'
    ],
    required: true
  },
  department: { type: String }, // relevant for department_head/department_staff
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
