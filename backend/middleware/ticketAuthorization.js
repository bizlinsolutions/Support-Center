const { Ticket } = require('../data/schema');

async function authorizeTicketOwner(req, res, next) {
  try {
    const ticket = await Ticket.findOne({ _id: req.params.id, user_email: req.user.email });
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    req.ticket = ticket;
    return next();
  } catch (error) {
    return res.status(500).json({ error });
  }
}

module.exports = { authorizeTicketOwner };
