const { Ticket } = require('../data/schema');

async function authorizeTicketOwner(req, res, next) {
  try {
    const ticket = await Ticket.findOne({ publicId: req.params.id });

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Admins can access any ticket
    if (req.user && req.user.role === 'admin') {
      req.ticket = ticket;
      return next();
    }

    // Non-admin users can only access their own tickets
    if (ticket.userId.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    req.ticket = ticket;
    return next();
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { authorizeTicketOwner };
