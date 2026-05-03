const mongoose = require('mongoose');
const User = require('./backend/models/User');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config({ path: './backend/.env' });

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

    if (!isMatch) {
        // Try double-hashing check
        const salt = await bcrypt.genSalt(10);
        // We can't easily check double hashing because salt is random
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
};

// Check for the user from the screenshot
testLogin('pugazh@gmail.com', 'Welcome@123'); // Assuming this was the password
