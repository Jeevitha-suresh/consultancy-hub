const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const resetAndTest = async (email, password) => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found');
      process.exit(1);
    }

    console.log(`Manually resetting password for ${user.name} to: ${password}`);
    user.password = password;
    await user.save();
    console.log('Save complete');

    const updatedUser = await User.findOne({ email }).select('+password');
    console.log(`New hash in DB: ${updatedUser.password}`);
    
    const isMatch = await bcrypt.compare(password, updatedUser.password);
    console.log(`Verification check: ${isMatch}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

resetAndTest('pugazh@gmail.com', 'Welcome@123');
