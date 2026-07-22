const Asset = require('../models/Asset');
const MaintenanceRequest = require('../models/MaintenanceRequest');
const SecurityIncident = require('../models/SecurityIncident');
const Transfer = require('../models/Transfer');
const User = require('../models/User');

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
