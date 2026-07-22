const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Minimal read-only user list - powers dropdowns like "pick a transfer recipient."
exports.getUsers = async (req, res) => {
  try {
    const filter = {};
    if (req.query.department) filter.department = req.query.department;
    if (req.query.role) filter.role = req.query.role;

    const users = await User.find(filter).select('name email role department isActive');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// CREATE - system_admin only
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'A user with this email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword, role, department });

    res.status(201).json({
      id: user._id, name: user.name, email: user.email, role: user.role, department: user.department
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE - system_admin only (name, role, department - not password/email here)
exports.updateUser = async (req, res) => {
  try {
    const { name, role, department } = req.body;
    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { name, role, department },
      { new: true }
    ).select('name email role department isActive');

    if (!updated) return res.status(404).json({ message: 'User not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DEACTIVATE / REACTIVATE - system_admin only
exports.setUserActiveStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select('name email role department isActive');

    if (!updated) return res.status(404).json({ message: 'User not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
