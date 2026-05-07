require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const { connectMySQL, sequelize } = require('./config/mysql_db');
const path = require('path');

// Connect to MySQL
connectMySQL().then(async () => {
  // Sync Database
  try {
    await sequelize.sync({ alter: true });
    console.log('✅ MySQL Tables Synced');

    // Admin Seeding Logic for MySQL
    const User = require('./models_sql/User');
    const admin = await User.findOne({ where: { email: 'admin@consultancyhub.com' } });
    
    if (!admin) {
      console.log('⚠️ No admin account found in MySQL. Seeding default admin...');
      await User.create({
        name: 'Admin',
        email: 'admin@consultancyhub.com',
        password: 'Admin@123',
        role: 'Admin',
        mustChangePassword: false
      });
      console.log('✅ Default admin account created in MySQL.');
    } else {
      console.log('✅ Admin account verified in MySQL.');
    }
  } catch (err) {
    console.error('❌ MySQL Initialization error:', err.message);
  }
});

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://consultancy-hub.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);


const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

app.set('io', io);

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
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
const { Message } = require('./models_sql');

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  
  socket.on('join', (userId) => {
    socket.join(String(userId));
    console.log(`User ${userId} joined their personal room`);
  });

  socket.on('sendMessage', async (data) => {
    try {
      const { sender, receiver, content, _id, createdAt } = data;
      
      const messageJson = { 
        _id: _id || Date.now(), 
        senderId: sender, 
        receiverId: receiver, 
        sender, 
        receiver, 
        content,
        createdAt: createdAt || new Date()
      };

      // Emit to receiver only (sender already updated locally via REST)
      io.to(String(receiver)).emit('receiveMessage', messageJson);
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
