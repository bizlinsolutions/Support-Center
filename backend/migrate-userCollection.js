/**
 * Migration script: backfill "userCollection" on existing Ticket documents.
 *
 * Checks whether each ticket's userId exists in the User or Admin collection
 * and sets userCollection accordingly.
 *
 * Usage:  node migrate-userCollection.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

async function migrate() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI is not defined in .env');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  const db = mongoose.connection.db;
  const ticketsCol = db.collection('tickets');
  const usersCol = db.collection('users');
  const adminsCol = db.collection('admins');

  // Get all tickets (we re-check all, not just missing ones, to fix any wrong values)
  const tickets = await ticketsCol.find({}).toArray();
  console.log(`Found ${tickets.length} total ticket(s)`);

  let updatedCount = 0;

  for (const ticket of tickets) {
    const userId = ticket.userId;
    if (!userId) continue;

    // Check which collection the userId actually lives in
    const isAdmin = await adminsCol.findOne({ _id: userId });
    const correctCollection = isAdmin ? 'Admin' : 'User';

    if (ticket.userCollection !== correctCollection) {
      await ticketsCol.updateOne(
        { _id: ticket._id },
        { $set: { userCollection: correctCollection } }
      );
      updatedCount++;
    }
  }

  console.log(`Updated ${updatedCount} ticket(s) with correct userCollection`);

  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
