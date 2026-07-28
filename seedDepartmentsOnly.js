require('dotenv').config();
const mongoose = require('mongoose');
const Department = require('./models/Department');

const departmentNames = [
  'Economics', 'Political Science', 'Sociology', 'Mass Communication',
  'Accounting', 'Business Administration', 'Banking and Finance',
  'Computer Science', 'Biology', 'Chemistry', 'Physics',
  'Microbiology', 'Biochemistry', 'Mathematics', 'Management Sciences'
];

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected. Seeding departments (upsert, non-destructive)...');

  for (const name of departmentNames) {
    await Department.findOneAndUpdate({ name }, { name }, { upsert: true, new: true });
    console.log(`Upserted department: ${name}`);
  }

  console.log('Department seeding complete.');
  process.exit();
};

run();
