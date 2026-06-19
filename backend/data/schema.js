const { Schema, model } = require('mongoose');

const PRIORITIES = ['low', 'medium', 'high'];

const ticketSchema = new Schema({
  publicId: {
    type: String,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
  priority: {
    type: String,
    required: true,
    enum: PRIORITIES,
  },
  userCollection: {
    type: String,
    enum: ['User', 'Admin'],
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    refPath: 'userCollection',
    required: true,
  },
  user_email: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['open', 'in progress', 'closed'],
    default: 'open',
  },
  assignedToCollection: {
    type: String,
    enum: ['User', 'Admin'],
    default: 'Admin',
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    refPath: 'assignedToCollection',
    default: null,
  },
  assignedToEmail: {
    type: String,
    default: null,
  },
  resolvedAt: {
    type: Date,
    default: null,
  },
  closedAt: {
    type: Date,
    default: null,
  },
  comments: [
    {
      authorName: String,
      authorEmail: String,
      body: String,
      createdAt: { type: Date, default: Date.now },
    }
  ],
  attachments: [
    {
      name: String,
      data: String,
      mimeType: String,
    }
  ]
}, {
  timestamps: true
});

const generatePublicId = (prefix) => {
  return prefix + '-' + Math.random().toString(36).substring(2, 8).toUpperCase() + Math.floor(Math.random() * 1000);
};

ticketSchema.pre('save', async function () {
  if (!this.publicId) {
    this.publicId = generatePublicId('TKT');
  }
});

const Ticket = model('Ticket', ticketSchema);

function validateTicket(data) {
  const ticket = new Ticket(data);
  const validationError = ticket.validateSync();

  if (!validationError) return { valid: true };

  const errors = Object.values(validationError.errors).map((e) => e.message);
  return { valid: false, errors };
}

function buildTicketDocument(data) {
  return new Ticket({
    title: data.title,
    body: data.body,
    priority: data.priority,
    userCollection: data.userCollection,
    userId: data.userId,
    user_email: data.user_email,
    status: data.status || 'open',
    attachments: data.attachments || [],
  });
}

module.exports = {
  Ticket,
  validateTicket,
  buildTicketDocument,
};
