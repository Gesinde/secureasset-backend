const Department = require('../models/Department');

// Anyone logged in can read the list (needed for dropdowns everywhere)
exports.getDepartments = async (req, res) => {
  try {
    const filter = req.query.includeInactive === 'true' ? {} : { isActive: true };
    const departments = await Department.find(filter).sort({ name: 1 });
    res.json(departments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// system_admin only
exports.createDepartment = async (req, res) => {
  try {
    const { name } = req.body;
    const existing = await Department.findOne({ name });
    if (existing) return res.status(400).json({ message: 'A department with this name already exists.' });

    const department = await Department.create({ name });
    res.status(201).json(department);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// system_admin only
exports.updateDepartment = async (req, res) => {
  try {
    const { name } = req.body;
    const updated = await Department.findByIdAndUpdate(req.params.id, { name }, { new: true });
    if (!updated) return res.status(404).json({ message: 'Department not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// system_admin only - deactivate rather than delete, same pattern as User
exports.setDepartmentActiveStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    const updated = await Department.findByIdAndUpdate(req.params.id, { isActive }, { new: true });
    if (!updated) return res.status(404).json({ message: 'Department not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
