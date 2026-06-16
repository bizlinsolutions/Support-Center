const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const {
  Ticket,
  validateTicket,
  buildTicketDocument,
} = require('./data/schema');
const { User } = require('./data/userSchema');
const { authenticateToken } = require('./middleware/auth');
const { authorizeTicketOwner } = require('./middleware/ticketAuthorization');
const { requireAdmin } = require('./middleware/adminAuth');

// Ticket Query helper (supporting pagination, sorting, search & filters)
async function getTicketsWithQuery(req, queryBase = {}) {
  const { priority, status, search, sortBy = 'createdAt', sortOrder = 'desc', page = 1, limit = 10 } = req.query;
  const query = { ...queryBase };

  if (priority) query.priority = priority;
  if (status) query.status = status;
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { body: { $regex: search, $options: 'i' } },
    ];
  }

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 10;
  const skip = (pageNum - 1) * limitNum;

  const total = await Ticket.countDocuments(query);
  const tickets = await Ticket.find(query)
    .sort(sortOptions)
    .skip(skip)
    .limit(limitNum);

  return {
    tickets,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum),
    }
  };
}

const app = express();
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  credentials: true,
}));
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
if (!ACCESS_TOKEN_SECRET || !REFRESH_TOKEN_SECRET) {
  throw new Error('Missing ACCESS_TOKEN_SECRET or REFRESH_TOKEN_SECRET in environment');
}
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

function createAccessToken(user) {
  return jwt.sign(
    {
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    },
    ACCESS_TOKEN_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
}

function createRefreshToken(user) {
  return jwt.sign(
    { userId: user._id.toString() },
    REFRESH_TOKEN_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );
}

app.get('/health', async (req, res) => {
  try {
    const dbState = mongoose.connection.readyState;
    const dbStatus = dbState === 1 ? 'connected' : 'disconnected';
    if (dbState !== 1) {
      throw new Error('Database is not connected');
    }
    await mongoose.connection.db.admin().ping();
    res.status(200).json({
      status: 'healthy',
      database: dbStatus,
      uptime: process.uptime(),
      timestamp: new Date(),
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      database: 'error',
      error: error.message,
      timestamp: new Date(),
    });
  }
});

app.post('/auth/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
    });

    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);

    return res.status(201).json({
      message: 'User created successfully',
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: 'Unable to sign up user' });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (user.isActive === false) {
      return res.status(401).json({ error: 'Your account has been deactivated' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);

    return res.json({
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('[Login Error]', error);
    return res.status(500).json({ error: 'Unable to login' });
  }
});

app.post('/auth/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token is required' });
    }

    const payload = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
    const user = await User.findById(payload.userId);
    if (!user) {
      return res.status(403).json({ error: 'Invalid refresh token' });
    }

    const newAccessToken = createAccessToken(user);
    const newRefreshToken = createRefreshToken(user);

    console.log(`[Auth] Refresh token used for user: ${payload.userId}`);

    return res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    return res.status(403).json({ error: 'Invalid refresh token' });
  }
});

app.post('/auth/logout', async (req, res) => {
  try {
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: 'Unable to logout' });
  }
});

app.get('/tickets', authenticateToken, async (req, res) => {
  try {
    const result = await getTicketsWithQuery(req, { user_email: req.user.email });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/tickets/:id', authenticateToken, authorizeTicketOwner, async (req, res) => {
  try {
    res.json(req.ticket);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/tickets', authenticateToken, async (req, res) => {
  try {
    const payload = { ...req.body, user_email: req.user.email };
    const validation = validateTicket(payload);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.errors.join(', ') });
    }
    const newTicket = buildTicketDocument(payload);
    await newTicket.save();

    res.status(201).json(newTicket);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/tickets/:id', authenticateToken, authorizeTicketOwner, async (req, res) => {
  try {
    await Ticket.findByIdAndDelete(req.ticket._id);
    res.status(200).json({ message: 'Ticket deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      const [tickets, users] = await Promise.all([
        Ticket.find({}),
        User.find({}).select('-passwordHash'),
      ]);
      return res.json({
        role: 'admin',
        tickets,
        users,
      });
    } else {
      const tickets = await Ticket.find({ user_email: req.user.email });
      return res.json({
        role: 'user',
        tickets,
      });
    }
  } catch (error) {
    console.error('[Dashboard Error]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Admin Routes ────────────────────────────────────────

app.get('/admin/tickets', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await getTicketsWithQuery(req, {});
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/admin/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const users = await User.find({}).select('-passwordHash');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/admin/users/:id/tickets', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const result = await getTicketsWithQuery(req, { user_email: user.email });
    res.json({ user, ...result });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.patch('/admin/users/:id/make-admin', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (user.role === 'admin') {
      return res.status(400).json({ error: 'User is already an admin' });
    }
    user.role = 'admin';
    await user.save();
    return res.json({ message: 'User promoted to admin', user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User Management Routes
app.patch('/admin/users/:id/toggle-active', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.role === 'admin' && user._id.toString() === req.user.userId) {
      return res.status(400).json({ error: 'You cannot deactivate yourself' });
    }
    user.isActive = !user.isActive;
    await user.save();
    res.json({ message: `User is now ${user.isActive ? 'active' : 'inactive'}`, user });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.patch('/admin/users/:id/reset-password', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const passwordHash = await bcrypt.hash(newPassword, 10);
    user.passwordHash = passwordHash;
    await user.save();
    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/admin/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.role === 'admin') {
      return res.status(400).json({ error: 'Admins cannot be deleted directly' });
    }
    await Ticket.deleteMany({ user_email: user.email });
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User and all associated tickets deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Profile route
app.patch('/users/profile', authenticateToken, async (req, res) => {
  try {
    const { name, password } = req.body;
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (name) {
      user.name = name.trim();
    }
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
      }
      user.passwordHash = await bcrypt.hash(password, 10);
    }
    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Ticket status, comments, assign agents
app.patch('/tickets/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['open', 'in progress', 'closed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

    if (req.user.role !== 'admin' && ticket.user_email !== req.user.email) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    ticket.status = status;
    if (status === 'resolved') {
      ticket.resolvedAt = new Date();
    } else if (status === 'closed') {
      ticket.closedAt = new Date();
    }
    await ticket.save();

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.patch('/tickets/:id/assign', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { assignedToEmail } = req.body;
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

    let assignedToUser = null;
    if (assignedToEmail) {
      assignedToUser = await User.findOne({ email: assignedToEmail });
      if (!assignedToUser) {
        return res.status(400).json({ error: 'Agent not found' });
      }
    }

    ticket.assignedTo = assignedToUser ? assignedToUser._id : null;
    ticket.assignedToEmail = assignedToUser ? assignedToUser.email : null;
    await ticket.save();

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/tickets/:id/comments', authenticateToken, async (req, res) => {
  try {
    const { body } = req.body;
    if (!body || body.trim() === '') {
      return res.status(400).json({ error: 'Comment body is required' });
    }
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

    if (req.user.role !== 'admin' && ticket.user_email !== req.user.email) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const newComment = {
      authorName: req.user.name || req.user.email,
      authorEmail: req.user.email,
      body: body.trim(),
      createdAt: new Date(),
    };

    ticket.comments.push(newComment);
    await ticket.save();

    res.status(201).json(ticket);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
