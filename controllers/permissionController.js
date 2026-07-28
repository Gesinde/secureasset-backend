const Permission = require('../models/Permission');

exports.getPermissions = async (req, res) => {
  try {
    const permissions = await Permission.find().sort({ key: 1 });
    res.json(permissions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
