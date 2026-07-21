const User = require('../models/User');

// Minimal read-only user list - powers dropdowns like "pick a transfer recipient."
// Day 6 will EXTEND this same file with create/update/deactivate for full
// Admin User Management, rather than building a separate controller.
exports.getUsers = async (req, res) => {
  try {
    const filter = {};
    if (req.query.department) filter.department = req.query.department;
    if (req.query.role) filter.role = req.query.role;

    const users = await User.find(filter).select('name email role department');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
