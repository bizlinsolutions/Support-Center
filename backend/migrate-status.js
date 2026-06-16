const mongoose = require('mongoose');
const { Ticket } = require('./data/schema');

mongoose.connect('mongodb://localhost:27017/help-desk').then(async () => {
  console.log('Connected to MongoDB');
  
  // Find all tickets that do not have a status field
  const ticketsToUpdate = await Ticket.find({ status: { $exists: false } });
  
  console.log(`Found ${ticketsToUpdate.length} tickets without a status field.`);
  
  if (ticketsToUpdate.length > 0) {
    const result = await Ticket.updateMany(
      { status: { $exists: false } },
      { $set: { status: 'open', assignedTo: null } }
    );
    console.log(`Successfully migrated ${result.modifiedCount} tickets to have default 'open' status!`);
  }
  
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
