const mongoose = require('mongoose');
const { Ticket } = require('./backend/data/schema');

mongoose.connect('mongodb://localhost:27017/help-desk').then(async () => {
  console.log('Connected');
  const ticket = await Ticket.findOne({});
  if (!ticket) {
    console.log('No tickets found');
    process.exit(0);
  }
  console.log('Found ticket:', ticket._id, ticket.status);
  
  const updated = await Ticket.findByIdAndUpdate(ticket._id, { status: 'in_progress' }, { new: true });
  console.log('Updated ticket:', updated.status);
  process.exit(0);
});
