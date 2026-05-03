const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const path = require('path');

// Load env vars
dotenv.config();

// Connect to database
connectDB().then(async () => {
  // Admin Seeding Logic
  const User = require('./models/User');
  const bcrypt = require('bcryptjs');
  try {
    const admin = await User.findOne({ email: 'admin@consultancyhub.com' });
    if (!admin) {
      console.log('⚠️ No admin account found. Seeding default admin...');
      await User.create({
        name: 'Admin',
        email: 'admin@consultancyhub.com',
        password: 'Admin@123',
        role: 'Admin',
        mustChangePassword: false
      });
      console.log('✅ Default admin account created successfully.');
    } else {
      // Ensure the default admin has the correct password (fix for previous double-hashing)
      admin.password = 'Admin@123';
      await admin.save();
      console.log('✅ Admin account verified and password synced.');
    }
  } catch (err) {
    console.error('❌ Admin seeding error:', err.message);
  }
});

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.set('io', io);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Make uploads folder static
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.get("/", (req, res) => {
  res.send("Backend is working 🚀");
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/posts', require('./routes/postRoutes'));
app.use('/api/jobs', require('./routes/jobRoutes'));
app.use('/api/connections', require('./routes/connectionRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Socket.io logic
const Message = require('./models/Message');

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  
  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their personal room`);
  });

  socket.on('sendMessage', async (data) => {
    try {
      const { sender, receiver, content } = data;
      const message = await Message.create({ sender, receiver, content });
      
      // Emit to receiver
      io.to(receiver).emit('receiveMessage', message);
      // Emit back to sender so they can update UI without HTTP refetch
      io.to(sender).emit('receiveMessage', message);
    } catch (error) {
      console.error('Socket message error:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));
