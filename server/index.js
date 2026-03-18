import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET || 'study-club-secret-123';

// ─── Schemas ──────────────────────────────────────────────────

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  avatar: { type: String, default: '👤' },
  createdAt: { type: Date, default: Date.now },
});

const RequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  secretCode: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

const MessageSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: String,
  userRole: String,
  userAvatar: String,
  text: { type: String, required: true },
  replyTo: {
    id: String,
    userName: String,
    text: String
  },
  isPinned: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const TaskSchema = new mongoose.Schema({
  id: String,
  name: String,
  completed: { type: Boolean, default: null },
  myFeedback: { type: String, default: '' },
  friendFeedback: { type: String, default: '' },
});

const DaySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  id: String,
  date: { type: String, required: true },
  tasks: [TaskSchema],
});

const User = mongoose.model('User', userSchema);
const Request = mongoose.model('Request', RequestSchema);
const Message = mongoose.model('Message', MessageSchema);
const Day = mongoose.model('Day', DaySchema);

// ─── Auth Middleware ──────────────────────────────────────────

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// ─── Routes ───────────────────────────────────────────────────

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 12);

    // First user is Admin (optional logic or just preset one in .env)
    const count = await User.countDocuments();
    const role = count === 0 ? 'admin' : 'user';
    const status = role === 'admin' ? 'approved' : 'pending';

    const newUser = new User({ name, email, password: hashedPassword, role, status });
    await newUser.save();

    res.status(201).json({ message: 'Registration successful. Please login.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        avatar: user.avatar
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── Club Routes ─────────────────────────────────────────────

// Get my request status
app.get('/api/club/my-request', authenticate, async (req, res) => {
  try {
    const request = await Request.findOne({ userId: req.user.id });
    res.json(request);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Join Club Request
app.post('/api/club/join', authenticate, async (req, res) => {
  try {
    const { name, secretCode } = req.body;
    if (secretCode !== '29354546') {
      return res.status(400).json({ message: 'Invalid Secret Code' });
    }

    const existingRequest = await Request.findOne({ userId: req.user.id });
    if (existingRequest) {
      existingRequest.name = name;
      existingRequest.status = 'pending';
      await existingRequest.save();
      return res.json({ message: 'Join request updated! Awaiting approval.' });
    }

    const newRequest = new Request({
      userId: req.user.id,
      name,
      secretCode,
      status: 'pending'
    });
    await newRequest.save();

    res.json({ message: 'Join request sent! Waiting for Admin approval.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Get all requests
app.get('/api/admin/requests', authenticate, isAdmin, async (req, res) => {
  try {
    const requests = await Request.find({ status: 'pending' });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Handle request
app.post('/api/admin/handle-request', authenticate, isAdmin, async (req, res) => {
  try {
    const { requestId, action } = req.body; // action: 'approve' or 'reject'
    const request = await Request.findById(requestId);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    if (action === 'approve') {
      request.status = 'approved';
      await User.findByIdAndUpdate(request.userId, { status: 'approved' });
    } else {
      request.status = 'rejected';
      await User.findByIdAndUpdate(request.userId, { status: 'rejected' });
    }

    await request.save();
    res.json({ message: `Request ${action}d successfully` });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Club: Get all members (Visible to all approved users)
app.get('/api/club/members', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.status !== 'approved') {
      return res.status(403).json({ message: 'Access denied. Account not approved.' });
    }
    const members = await User.find({ status: 'approved' }).select('-password');
    res.json(members);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Get all members
app.get('/api/admin/members', authenticate, isAdmin, async (req, res) => {
  try {
    const members = await User.find({ status: 'approved' });
    res.json(members);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Remove member
app.delete('/api/admin/member/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user.role === 'admin') return res.status(400).json({ message: 'Cannot remove admin' });

    await User.findByIdAndDelete(req.params.id);
    await Request.findOneAndDelete({ userId: req.params.id });
    res.json({ message: 'Member removed successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// User: Get profile/status
app.get('/api/user/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// User: Update profile
// ─── Chat Routes ─────────────────────────────────────────────

// Get all messages
app.get('/api/chat/messages', authenticate, async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: 1 }).limit(100);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Send message
app.post('/api/chat/message', authenticate, async (req, res) => {
  try {
    const { text, replyTo } = req.body;
    const user = await User.findById(req.user.id);

    const newMessage = new Message({
      userId: user._id,
      userName: user.name,
      userRole: user.role,
      userAvatar: user.avatar,
      text,
      replyTo
    });

    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete message (Admin or sender)
app.delete('/api/chat/message/:id', authenticate, async (req, res) => {
  try {
    const msg = await Message.findById(req.params.id);
    if (!msg) return res.status(404).json({ message: 'Message not found' });

    if (req.user.role === 'admin' || msg.userId.toString() === req.user.id) {
      await Message.findByIdAndDelete(req.params.id);
      return res.json({ message: 'Message deleted' });
    }

    res.status(403).json({ message: 'Unauthorized' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Pin message (Admin only)
app.post('/api/chat/pin-message', authenticate, isAdmin, async (req, res) => {
  try {
    const { messageId } = req.body;
    // Unpin all first
    await Message.updateMany({}, { isPinned: false });
    // Pin new one if id provided
    if (messageId) {
      await Message.findByIdAndUpdate(messageId, { isPinned: true });
    }
    res.json({ message: 'Pin updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/user/update-profile', authenticate, async (req, res) => {
  try {
    const { name } = req.body;
    const user = await User.findByIdAndUpdate(req.user.id, { name }, { new: true }).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── Task Management Routes ───────────────────────────────────

// Save/Setup plan
app.post('/api/club/setup-plan', authenticate, async (req, res) => {
  try {
    const { memberId, days } = req.body;
    
    // Only admin or the user themselves can setup their plan
    if (req.user.role !== 'admin' && req.user.id !== memberId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Delete existing days for this member to avoid duplicates
    await Day.deleteMany({ userId: memberId });

    // Insert new days
    const formattedDays = days.map(d => ({
      ...d,
      userId: memberId
    }));
    await Day.insertMany(formattedDays);

    res.json({ message: 'Study plan setup successfully' });
  } catch (err) {
    console.error('Task setup error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all tasks (for members display)
app.get('/api/club/tasks', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.status !== 'approved') return res.status(403).json({ message: 'Not approved' });
    
    const tasks = await Day.find();
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update single task status/feedback
app.put('/api/club/task/update', authenticate, async (req, res) => {
  try {
    const { memberId, dayId, taskId, field, value } = req.body;

    // Permissions: 
    // - Users can update their own task completion and myFeedback
    // - Friends/Admin can update friendFeedback
    const isOwner = req.user.id === memberId;
    const isAdmin = req.user.role === 'admin';

    const day = await Day.findOne({ userId: memberId, id: dayId });
    if (!day) return res.status(404).json({ message: 'Day not found' });

    const task = day.tasks.find(t => t.id === taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (field === 'completed' || field === 'myFeedback') {
      if (!isOwner && !isAdmin) return res.status(403).json({ message: 'Unauthorized' });
      task[field] = value;
    } else if (field === 'friendFeedback') {
      // Allow others (approved members) to leave feedback
      task[field] = value;
    }

    await day.save();
    res.json({ message: 'Task updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Global task rename
app.put('/api/club/task/rename-global', authenticate, async (req, res) => {
  try {
    const { memberId, oldName, newName } = req.body;
    if (req.user.id !== memberId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const today = new Date().toISOString().split('T')[0];
    
    // Update all future days' tasks
    const days = await Day.find({ userId: memberId });
    for (const day of days) {
      if (day.date >= today) {
        let changed = false;
        day.tasks = day.tasks.map(t => {
          if (t.name === oldName) {
            changed = true;
            return { ...t, name: newName };
          }
          return t;
        });
        if (changed) await day.save();
      }
    }

    res.json({ message: 'Tasks renamed globally' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Granular updates
app.post('/api/club/day/add', authenticate, isAdmin, async (req, res) => {
  try {
    const { memberId } = req.body;
    const dateStr = new Date().toISOString().split('T')[0];
    
    const newDay = new Day({
      userId: memberId,
      id: Math.random().toString(36).substring(2, 11),
      date: dateStr,
      tasks: []
    });
    await newDay.save();
    res.json(newDay);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/club/day/:memberId/:dayId', authenticate, isAdmin, async (req, res) => {
  try {
    await Day.findOneAndDelete({ userId: req.params.memberId, id: req.params.dayId });
    res.json({ message: 'Day deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/club/task/add', authenticate, isAdmin, async (req, res) => {
  try {
    const { memberId, dayId, name } = req.body;
    const day = await Day.findOne({ userId: memberId, id: dayId });
    if (!day) return res.status(404).json({ message: 'Day not found' });

    const newTask = {
      id: Math.random().toString(36).substring(2, 11),
      name,
      completed: null,
      myFeedback: '',
      friendFeedback: ''
    };
    day.tasks.push(newTask);
    await day.save();
    res.json(newTask);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/club/task/update-info', authenticate, isAdmin, async (req, res) => {
  try {
    const { memberId, dayId, taskId, updates } = req.body;
    const day = await Day.findOne({ userId: memberId, id: dayId });
    if (!day) return res.status(404).json({ message: 'Day not found' });

    const task = day.tasks.find(t => t.id === taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (updates.name) task.name = updates.name;
    
    await day.save();
    res.json({ message: 'Task updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/club/task/:memberId/:dayId/:taskId', authenticate, isAdmin, async (req, res) => {
  try {
    const day = await Day.findOne({ userId: req.params.memberId, id: req.params.dayId });
    if (!day) return res.status(404).json({ message: 'Day not found' });

    day.tasks = day.tasks.filter(t => t.id !== req.params.taskId);
    await day.save();
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Serve static files from the React frontend app
const distPath = path.join(process.cwd(), 'dist');
app.use(express.static(distPath));

// Anything that doesn't match the above API routes, send back index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

if (MONGODB_URI) {
  mongoose.connect(MONGODB_URI)
    .then(() => {
      console.log('Connected to MongoDB Atlas');
      app.listen(PORT, '0.0.0.0', () => console.log(`Server running on all interfaces (0.0.0.0) at port ${PORT}`));
    })
    .catch(err => console.error('MongoDB connection error:', err));
} else {
  console.warn('MONGODB_URI not found in environment. Please check .env');
  app.listen(PORT, '0.0.0.0', () => console.log(`Server running on all interfaces (0.0.0.0) at port ${PORT} (Disconnected from DB)`));
}
