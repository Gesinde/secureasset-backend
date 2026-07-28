require('dotenv').config();
const mongoose = require('mongoose');
const Permission = require('./models/Permission');

// This mirrors EXACTLY what your checkRole([...]) arrays currently say in each
// route file, so migrating to database-backed permissions changes nothing
// behaviorally on day one.
const permissions = [
  { key: 'asset.create', description: 'Create a new asset', allowedRoles: ['system_admin'] },
  { key: 'asset.update', description: 'Edit an asset', allowedRoles: ['system_admin', 'department_head'] },
  { key: 'asset.delete', description: 'Delete an asset', allowedRoles: ['system_admin'] },
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
  { key: 'asset.regenerate-qr', description: 'Regenerate an asset\'s QR code', allowedRoles: ['system_admin'] },
];

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected. Seeding permissions...');

  for (const p of permissions) {
    await Permission.findOneAndUpdate({ key: p.key }, p, { upsert: true, new: true });
    console.log(`Upserted permission: ${p.key}`);
  }

  console.log('Permission seeding complete.');
  process.exit();
};

run();
