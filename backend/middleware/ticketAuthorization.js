const { Ticket } = require('../data/schema');

async function authorizeTicketOwner(req, res, next) {
  try {
    let ticket;
    if (req.user && req.user.role === 'admin') {
      ticket = await Ticket.findById(req.params.id);
    } else {
      ticket = await Ticket.findOne({ _id: req.params.id, user_email: req.user.email });
    }

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    req.ticket = ticket;
    return next();
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { authorizeTicketOwner };
