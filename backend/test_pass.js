const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const testLogin = async (email, password) => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.log('User not found');
      process.exit(1);
    }

    console.log(`User found: ${user.name}`);
    console.log(`Hashed password in DB: ${user.password}`);
    
    const isMatch = await bcrypt.compare(password, user.password);
    console.log(`Password match result: ${isMatch}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

testLogin('pugazh@gmail.com', 'Welcome@123');
