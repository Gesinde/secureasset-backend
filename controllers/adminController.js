const Asset = require('../models/Asset');
const MaintenanceRequest = require('../models/MaintenanceRequest');
const SecurityIncident = require('../models/SecurityIncident');
const Transfer = require('../models/Transfer');
const User = require('../models/User');

const Permission = require('../models/Permission');
const Department = require('../models/Department');

exports.getStats = async (req, res) => {
  try {
    const [
      totalAssets,
      assetsByStatusRaw,
      assetsByCategoryRaw,
      maintenanceByStatusRaw,
      openSecurityIncidents,
      pendingTransfers,
      totalUsers,
      activeUsers
    ] = await Promise.all([
      Asset.countDocuments(),
      Asset.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Asset.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
      MaintenanceRequest.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      SecurityIncident.countDocuments({ status: { $ne: 'resolved' } }),
      Transfer.countDocuments({ status: { $nin: ['completed', 'rejected'] } }),
      User.countDocuments(),
      User.countDocuments({ isActive: { $ne: false } })
    ]);

    const toObject = (arr) => arr.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {});

    res.json({
      totalAssets,
      assetsByStatus: toObject(assetsByStatusRaw),
      assetsByCategory: assetsByCategoryRaw.map((c) => ({ name: c._id, count: c.count })),
      maintenanceByStatus: toObject(maintenanceByStatusRaw),
      openSecurityIncidents,
      pendingTransfers,
      totalUsers,
      activeUsers
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// One-time bootstrap endpoints - safe to call multiple times (upsert-based, non-destructive).
// Intentionally NOT gated by checkPermission (that would be circular: can't check
// permissions for the endpoint that creates permissions in the first place).

exports.bootstrapPermissions = async (req, res) => {
  try {
    const permissions = [
      { key: 'asset.create', description: 'Create a new asset', allowedRoles: ['system_admin'] },
      { key: 'asset.update', description: 'Edit an asset', allowedRoles: ['system_admin', 'department_head'] },
      { key: 'asset.delete', description: 'Delete an asset', allowedRoles: ['system_admin'] },
      { key: 'asset.regenerate-qr', description: "Regenerate an asset's QR code", allowedRoles: ['system_admin'] },
      { key: 'maintenance.create', description: 'Raise a maintenance request', allowedRoles: ['system_admin', 'department_head', 'department_staff', 'maintenance_officer'] },
      { key: 'maintenance.update', description: 'Update a maintenance request', allowedRoles: ['system_admin', 'maintenance_officer', 'maintenance_technician'] },
      { key: 'audit.view', description: 'View the audit log', allowedRoles: ['system_admin', 'auditor'] },
      { key: 'security.create', description: 'Report a security incident', allowedRoles: ['system_admin', 'security_officer'] },
      { key: 'security.view', description: 'View security incidents', allowedRoles: ['system_admin', 'security_officer', 'auditor'] },
      { key: 'security.update', description: 'Update a security incident', allowedRoles: ['system_admin', 'security_officer'] },
      { key: 'transfer.create', description: 'Request an asset transfer', allowedRoles: ['system_admin', 'department_head', 'department_staff'] },
      { key: 'user.create', description: 'Create a user', allowedRoles: ['system_admin'] },
      { key: 'user.update', description: 'Edit a user', allowedRoles: ['system_admin'] },
      { key: 'user.status', description: 'Deactivate/reactivate a user', allowedRoles: ['system_admin'] },
      { key: 'department.create', description: 'Create a department', allowedRoles: ['system_admin'] },
      { key: 'department.update', description: 'Edit a department', allowedRoles: ['system_admin'] },
      { key: 'department.status', description: 'Deactivate/reactivate a department', allowedRoles: ['system_admin'] },
      { key: 'admin.stats', description: 'View admin analytics dashboard', allowedRoles: ['system_admin'] },
      { key: 'auditsession.create', description: 'Open an audit session', allowedRoles: ['system_admin', 'auditor'] },
      { key: 'auditsession.mine', description: 'View own open audit session', allowedRoles: ['system_admin', 'auditor'] },
      { key: 'auditsession.view', description: 'View all audit sessions', allowedRoles: ['system_admin', 'auditor'] },
      { key: 'auditsession.close', description: 'Close an audit session', allowedRoles: ['system_admin', 'auditor'] },
      { key: 'map.view', description: 'View the security incident map', allowedRoles: ['system_admin', 'security_officer', 'auditor'] },
    ];

    const results = [];
    for (const p of permissions) {
      await Permission.findOneAndUpdate({ key: p.key }, p, { upsert: true, new: true });
      results.push(p.key);
    }

    res.json({ message: 'Permissions bootstrapped successfully', count: results.length, keys: results });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.bootstrapDepartments = async (req, res) => {
  try {
    const departmentNames = [
      'Economics', 'Political Science', 'Sociology', 'Mass Communication',
      'Accounting', 'Business Administration', 'Banking and Finance',
      'Computer Science', 'Biology', 'Chemistry', 'Physics',
      'Microbiology', 'Biochemistry', 'Mathematics', 'Management Sciences'
    ];

    const results = [];
    for (const name of departmentNames) {
      await Department.findOneAndUpdate({ name }, { name }, { upsert: true, new: true });
      results.push(name);
    }

    res.json({ message: 'Departments bootstrapped successfully', count: results.length, names: results });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
