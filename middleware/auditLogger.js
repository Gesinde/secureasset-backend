const AuditLog = require('../models/AuditLog');

const logAction = async ({ action, performedBy, targetType, targetId, details }) => {
  try {
    await AuditLog.create({ action, performedBy, targetType, targetId, details });
  } catch (err) {
    console.error('Failed to write audit log:', err.message);
  }
};

module.exports = logAction;
