const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const { User, Admin } = require('./data/userSchema');
const { Ticket } = require('./data/schema');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  await User.deleteMany({});
  await Admin.deleteMany({});
  await Ticket.deleteMany({});
  console.log('Cleared existing data');

  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const userPasswordHash1 = await bcrypt.hash('priya123', 10);
  const userPasswordHash2 = await bcrypt.hash('rahul123', 10);

  const admin1 = await Admin.create({
    name: 'Adithya Ajith',
    email: 'adithya@theesaanam.com',
    passwordHash: adminPasswordHash,
  });

  const user1 = await User.create({
    name: 'Priya Sharma',
    email: 'priya@theesaanam.com',
    passwordHash: userPasswordHash1,
  });

  const user2 = await User.create({
    name: 'Rahul Dev',
    email: 'rahul@theesaanam.com',
    passwordHash: userPasswordHash2,
  });

  console.log(`Created 1 admin and 2 users`);

  const tickets = [
    {
      title: 'Login page not loading on mobile devices',
      body: 'Several customers have reported that the login page fails to render properly on mobile browsers, specifically Safari on iOS 17. The page shows a blank white screen after the logo loads. This issue started after the last deployment on Friday. Affected users are unable to access their accounts through mobile devices.',
      priority: 'high',
      userId: admin1._id,
      user_email: admin1.email,
    },
    {
      title: 'Dashboard charts showing incorrect monthly data',
      body: 'The revenue charts on the admin dashboard are displaying data from the previous month instead of the current month. The issue seems to be related to timezone handling — the API returns UTC timestamps but the frontend is not converting them to IST before grouping by date. This is causing confusion for the finance team.',
      priority: 'high',
      userId: admin1._id,
      user_email: admin1.email,
    },
    {
      title: 'Add dark mode support to the helpdesk portal',
      body: 'We need to implement a dark mode toggle for the helpdesk portal. Many of our support agents work night shifts and have requested a darker interface to reduce eye strain. The toggle should persist across sessions using localStorage and respect the system preference as the default.',
      priority: 'medium',
      userId: user1._id,
      user_email: user1.email,
    },
    {
      title: 'Email notifications not being sent for new tickets',
      body: 'When a new support ticket is created, the assigned agent should receive an email notification. This feature was working until last week but appears to have stopped. The SMTP logs show connection timeouts. We need to check if the mail server credentials have expired or if there is a network configuration issue.',
      priority: 'high',
      userId: user1._id,
      user_email: user1.email,
    },
    {
      title: 'Improve search functionality with filters',
      body: 'The current ticket search only supports basic text matching on the title field. We need to extend it to support filtering by priority, date range, and status. This will help agents quickly find relevant tickets when handling customer calls. A dropdown filter panel next to the search bar would be ideal.',
      priority: 'medium',
      userId: user2._id,
      user_email: user2.email,
    },
    {
      title: 'Update Terms of Service page content',
      body: 'The legal team has provided updated Terms of Service text that needs to be reflected on the website. The changes mainly involve data privacy clauses related to the new compliance requirements. The updated document has been shared in the project drive. No structural changes needed, just a content swap.',
      priority: 'low',
      userId: user2._id,
      user_email: user2.email,
    },
    {
      title: 'Fix broken pagination on ticket listing page',
      body: 'When there are more than 20 tickets, the pagination controls at the bottom of the ticket list stop working after page 3. Clicking page 4 or higher returns to page 1. This appears to be an off-by-one error in the query offset calculation on the backend.',
      priority: 'medium',
      userId: admin1._id,
      user_email: admin1.email,
    },
    {
      title: 'Customer feedback form submission error',
      body: 'Users are reporting a generic error message when trying to submit the customer feedback form. The form data appears to be sent correctly based on network logs, but the server returns a 422 status. The validation schema on the backend may need to be updated to accept the new optional phone number field.',
      priority: 'low',
      userId: user1._id,
      user_email: user1.email,
    },
  ];

  const createdTickets = await Ticket.create(tickets);
  console.log(`Created ${createdTickets.length} tickets`);

  console.log('\n--- Seed Complete ---');
  console.log('\nDemo Accounts:');
  console.log(`  ${admin1.email} / admin123 (Admin)`);
  console.log(`  ${user1.email}   / priya123 (User)`);
  console.log(`  ${user2.email}   / rahul123 (User)`);

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
