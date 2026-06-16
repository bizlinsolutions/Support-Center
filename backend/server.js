//Import frameworks
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
const { Admin } = require('./data/adminSchema');
const { authenticateToken } = require('./middleware/auth');
const { authenticateAdmin } = require('./middleware/adminAuth');
const { authorizeTicketOwner } = require('./middleware/ticketAuthorization');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/help-desk')
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

function createAdminAccessToken(admin) {
  return jwt.sign(
    {
      adminId: admin._id.toString(),
      email: admin.email,
      name: admin.name,
      role: 'admin',
    },
    ACCESS_TOKEN_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
}

function createAdminRefreshToken(admin) {
  return jwt.sign(
    { adminId: admin._id.toString(), role: 'admin' },
    REFRESH_TOKEN_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );
}

async function seedDefaultAdmin() {
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@helpdesk.com').trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123456';
  const existingAdmin = await Admin.findOne({ email: adminEmail });
  if (existingAdmin) return;

  const passwordHash = await bcrypt.hash(adminPassword, 10);
  await Admin.create({
    name: 'Admin',
    email: adminEmail,
    passwordHash,
  });
  console.log(`Default admin created: ${adminEmail}`);
}

mongoose.connection.once('open', () => {
  seedDefaultAdmin().catch((err) => console.error('Admin seed error:', err));
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
      },
    });
  } catch (error) {
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

app.post('/admin/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const admin = await Admin.findOne({ email: normalizedEmail });
    if (!admin) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    const accessToken = createAdminAccessToken(admin);
    const refreshToken = createAdminRefreshToken(admin);

    return res.json({
      accessToken,
      refreshToken,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: 'Unable to login as admin' });
  }
});

app.post('/admin/auth/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token is required' });
    }

    const payload = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
    if (payload.role !== 'admin') {
      return res.status(403).json({ error: 'Invalid admin refresh token' });
    }

    const admin = await Admin.findById(payload.adminId);
    if (!admin) {
      return res.status(403).json({ error: 'Invalid admin refresh token' });
    }

    return res.json({
      accessToken: createAdminAccessToken(admin),
      refreshToken: createAdminRefreshToken(admin),
    });
  } catch (error) {
    return res.status(403).json({ error: 'Invalid admin refresh token' });
  }
});

app.post('/admin/auth/logout', async (req, res) => {
  try {
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: 'Unable to logout' });
  }
});

app.get('/admin/stats', authenticateAdmin, async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    let ticketCountQuery = {};
    if (req.admin.email !== 'admin@helpdesk.com') {
      ticketCountQuery = { assignedTo: req.admin.adminId };
    }
    const ticketCount = await Ticket.countDocuments(ticketCountQuery);
    res.json({ userCount, ticketCount });
  } catch (error) {
    res.status(500).json({ error: 'Unable to load stats' });
  }
});

app.get('/admin/list-admins', authenticateAdmin, async (req, res) => {
  try {
    if (req.admin.email !== 'admin@helpdesk.com') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const admins = await Admin.find({}, 'name email _id');
    res.json(admins);
  } catch (error) {
    res.status(500).json({ error: 'Unable to fetch admins' });
  }
});

app.get('/admin/users', authenticateAdmin, async (req, res) => {
  try {
    const users = await User.find().select('name email createdAt').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Unable to load users' });
  }
});

app.delete('/admin/users/:id', authenticateAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    await Ticket.deleteMany({ user_email: user.email });
    res.status(200).json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Unable to delete user' });
  }
});

// To get tickets of each admin
app.get('/admin/users/:id/tickets', authenticateAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('name email');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let ticketQuery = { user_email: user.email };
    if (req.admin.email !== 'admin@helpdesk.com') {
      ticketQuery.assignedTo = req.admin.adminId;
    }

    const tickets = await Ticket.find(ticketQuery).sort({ _id: -1 });
    res.json({ user, tickets });
  } catch (error) {
    res.status(500).json({ error: 'Unable to load user tickets' });
  }
});

// All tickets are visible to super admin
app.get('/admin/tickets', authenticateAdmin, async (req, res) => {
  try {
    let query = {};
    if (req.admin.email !== 'admin@helpdesk.com') {
      query = { assignedTo: req.admin.adminId };
    }
    const tickets = await Ticket.find(query).sort({ _id: -1 });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: 'Unable to load tickets' });
  }
});

app.get('/admin/tickets/:id', authenticateAdmin, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id).populate('assignedTo', 'name email');
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    if (req.admin.email !== 'admin@helpdesk.com' && ticket.assignedTo?._id?.toString() !== req.admin.adminId) {
      return res.status(403).json({ error: 'Not authorized to view this ticket' });
    }
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ error: 'Unable to load ticket' });
  }
});

app.put('/admin/tickets/:id', authenticateAdmin, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const { title, body, priority } = req.body;
    const payload = {
      title: title ?? ticket.title,
      body: body ?? ticket.body,
      priority: priority ?? ticket.priority,
      user_email: ticket.user_email,
    };

    const validation = validateTicket(payload);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.errors.join(', ') });
    }

    ticket.title = payload.title;
    ticket.body = payload.body;
    ticket.priority = payload.priority;
    await ticket.save();

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ error: 'Unable to update ticket' });
  }
});

app.delete('/admin/tickets/:id', authenticateAdmin, async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndDelete(req.params.id);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    res.status(200).json({ message: 'Ticket deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Unable to delete ticket' });
  }
});

app.patch('/admin/tickets/:id/status', authenticateAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['open', 'in_progress', 'resolved', 'closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status provided.' });
    }

    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ error: 'Unable to update ticket status' });
  }
});

app.patch('/admin/tickets/:id/assign', authenticateAdmin, async (req, res) => {
  try {
    if (req.admin.email !== 'admin@helpdesk.com') {
      return res.status(403).json({ error: 'Only super admin can assign tickets' });
    }

    const { adminId } = req.body;
    
    // Allow assigning to null (unassigned)
    const newAssignment = adminId ? adminId : null;

    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { assignedTo: newAssignment },
      { new: true }
    ).populate('assignedTo', 'name email');

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ error: 'Unable to assign admin' });
  }
});

app.post('/admin/tickets/:id/replies', authenticateAdmin, async (req, res) => {
  try {
    const { body } = req.body;
    if (!body) {
      return res.status(400).json({ error: 'Reply body is required' });
    }
    
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    ticket.replies.push({
      body,
      sender: 'admin',
      sender_email: req.admin.email, 
    });

    await ticket.save();
    res.status(201).json(ticket);
  } catch (error) {
    res.status(500).json({ error: 'Unable to add reply' });
  }
});

app.get('/tickets', authenticateToken, async (req, res) => {
  try {
    const all = await Ticket.find({ user_email: req.user.email });
    res.json(all);
  } catch (error) {
    res.status(500).json({ error });
  }
});

app.get('/tickets/:id', authenticateToken, authorizeTicketOwner, async (req, res) => {
  try {
    res.json(req.ticket);
  } catch (error) {
    res.status(500).json({ error });
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
    res.status(500).json({ error });
  }
});

app.delete('/tickets/:id', authenticateToken, authorizeTicketOwner, async (req, res) => {
  try {
    await Ticket.findByIdAndDelete(req.ticket._id);
    res.status(200).json({ message: 'Ticket deleted' });
  } catch (error) {
    res.status(500).json({ error });
  }
});

app.post('/tickets/:id/replies', authenticateToken, authorizeTicketOwner, async (req, res) => {
  try {
    const { body } = req.body;
    if (!body) {
      return res.status(400).json({ error: 'Reply body is required' });
    }

    const ticket = req.ticket; // set by authorizeTicketOwner
    ticket.replies.push({
      body,
      sender: 'user',
      sender_email: req.user.email,
    });

    await ticket.save();
    res.status(201).json(ticket);
  } catch (error) {
    res.status(500).json({ error: 'Unable to add reply' });
  }
});

app.listen(4000, () => console.log('Backend running on http://localhost:4000'));
