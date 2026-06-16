const { Schema, model } = require('mongoose');

const PRIORITIES = ['low', 'medium', 'high'];

const ticketSchema = new Schema({
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
  user_email: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'resolved', 'closed'],
    default: 'open',
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'Admin',
    default: null,
  },
  replies: [
    {
      body: { type: String, required: true },
      sender: { type: String, required: true }, // 'user' or 'admin'
      sender_email: { type: String },
      createdAt: { type: Date, default: Date.now },
    }
  ]
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
    user_email: data.user_email,
  });
}

module.exports = {
  Ticket,
  validateTicket,
  buildTicketDocument,
};
