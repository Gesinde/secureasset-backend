require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Asset = require('./models/Asset');

const roles = [
  'system_admin',
  'department_head',
  'department_staff',
  'auditor',
  'maintenance_officer',
  'maintenance_technician',
  'security_officer'
];

// A second department_head and department_staff pair in a different department,
// needed to test Transfers/Borrowing across departments
const extraUsers = [
  { name: 'management head', email: 'management_head@crawford.edu.ng', role: 'department_head', department: 'Management Sciences' },
  { name: 'management staff', email: 'management_staff@crawford.edu.ng', role: 'department_staff', department: 'Management Sciences' },
];

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected. Seeding...');

  await User.deleteMany({});
  await Asset.deleteMany({});

  const createdUsers = {};

  for (const role of roles) {
    const hashedPassword = await bcrypt.hash('password123', 10);
    const user = await User.create({
      name: role.replace('_', ' '),
      email: `${role}@crawford.edu.ng`,
      password: hashedPassword,
      role,
      department: 'Computer Science'
    });
    createdUsers[role] = user;
    console.log(`Created user: ${role}`);
  }

  for (const u of extraUsers) {
    const hashedPassword = await bcrypt.hash('password123', 10);
    const user = await User.create({ ...u, password: hashedPassword });
    createdUsers[u.email] = user;
    console.log(`Created user: ${u.email}`);
  }

  const assets = [
    {
      name: 'HP LaserJet Printer', category: 'Electronics', serialNumber: 'HP-2024-001',
      assetTag: 'CU-CS-0001', department: 'Computer Science', location: 'CS Lab 1',
      status: 'available', condition: 'good', purchaseDate: new Date('2023-01-15'),
      purchaseValue: 250000, vendor: 'HP Nigeria', warrantyExpiry: new Date('2026-01-15'),
      description: 'Departmental network printer', createdBy: createdUsers.system_admin._id
    },
    {
      name: 'Dell Projector', category: 'Electronics', serialNumber: 'DEL-2024-002',
      assetTag: 'CU-CS-0002', department: 'Computer Science', location: 'Lecture Hall 2',
      status: 'available', condition: 'excellent', purchaseDate: new Date('2024-03-10'),
      purchaseValue: 180000, vendor: 'Dell Nigeria', warrantyExpiry: new Date('2027-03-10'),
      description: 'Portable lecture hall projector', createdBy: createdUsers.system_admin._id
    },
    {
      name: 'Conference Room Table', category: 'Furniture', serialNumber: 'FRN-2024-003',
      assetTag: 'CU-MGT-0001', department: 'Management Sciences', location: 'Admin Block Room 3',
      status: 'in_use', condition: 'fair', purchaseDate: new Date('2021-06-01'),
      purchaseValue: 95000, vendor: 'Local Furniture Co', warrantyExpiry: null,
      description: 'Large oval meeting table', createdBy: createdUsers.system_admin._id
    },
  ];

  for (const a of assets) {
    await Asset.create(a);
    console.log(`Created asset: ${a.name}`);
  }

  console.log('Seeding complete.');
  process.exit();
};

seed();
