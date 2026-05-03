const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');

const checkOrCreateAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected\n');

    // Check if admin exists
    const admin = await User.findOne({ role: 'Admin' });

    if (admin) {
      console.log('✅ Admin account FOUND:');
      console.log('   Name  :', admin.name);
      console.log('   Email :', admin.email);
      console.log('   Role  :', admin.role);
      console.log('\n👉 Use this email to log in at http://localhost:5173/login');
    } else {
      console.log('⚠️  No admin account found. Creating one now...\n');

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Admin@123', salt);

      const newAdmin = await User.create({
        name: 'Admin',
        email: 'admin@consultancyhub.com',
        password: hashedPassword,
        role: 'Admin',
        mustChangePassword: false
      });

      console.log('✅ Admin account CREATED:');
      console.log('   Name    :', newAdmin.name);
      console.log('   Email   :', newAdmin.email);
      console.log('   Password: Admin@123');
      console.log('   Role    :', newAdmin.role);
      console.log('\n👉 Log in at http://localhost:5173/login');
      console.log('⚠️  Please change this password after first login via Admin → My Password tab.');
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
};

checkOrCreateAdmin();
