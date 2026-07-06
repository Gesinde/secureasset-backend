require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const roles = [
  'system_admin',
  'department_head',
  'department_staff',
  'auditor',
  'maintenance_officer',
  'maintenance_technician',
  'security_officer'
];

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected. Seeding users...');

  await User.deleteMany({}); // clean slate each time you run this

  for (const role of roles) {
    const hashedPassword = await bcrypt.hash('password123', 10);
    await User.create({
      name: role.replace('_', ' '),
      email: `${role}@crawford.edu.ng`,
      password: hashedPassword,
      role,
      department: 'Computer Science'
    });
    console.log(`Created: ${role}`);
  }

  console.log('Seeding complete.');
  process.exit();
};

seed();
