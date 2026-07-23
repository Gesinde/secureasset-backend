const AuditSession = require('../models/AuditSession');

// OPEN - auditor, system_admin. Only one open session per user at a time.
exports.openSession = async (req, res) => {
  try {
    const existing = await AuditSession.findOne({ openedBy: req.user.id, status: 'open' });
    if (existing) {
      return res.status(400).json({ message: 'You already have an open audit session', session: existing });
    }

    const session = await AuditSession.create({
      openedBy: req.user.id,
      department: req.body.department || undefined,
      status: 'open'
    });

    res.status(201).json(session);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET my current open session (if any) - powers the Scan page's "session active" indicator
exports.getMyOpenSession = async (req, res) => {
  try {
    const session = await AuditSession.findOne({ openedBy: req.user.id, status: 'open' });
    res.json(session || null);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// LIST - system_admin, auditor
exports.getSessions = async (req, res) => {
  try {
    const filter = req.user.role === 'auditor' ? { openedBy: req.user.id } : {};
    const sessions = await AuditSession.find(filter)
      .populate('openedBy', 'name role')
      .sort({ startedAt: -1 });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// CLOSE - only the person who opened it, or system_admin
exports.closeSession = async (req, res) => {
  try {
    const session = await AuditSession.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found' });
    if (session.status === 'closed') return res.status(400).json({ message: 'Session already closed' });

    if (req.user.role !== 'system_admin' && session.openedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden: not your session' });
    }

    session.status = 'closed';
    session.closedAt = new Date();
    await session.save();

    res.json(session);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
