const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all site expense refunds
exports.getAllSiteExpenseRefunds = async (req, res) => {
  try {
    const siteExpenseRefunds = await prisma.siteExpenseRefund.findMany({
      include: {
        siteExpense: true
      }
    });
    res.status(200).json(siteExpenseRefunds);
  } catch (error) {
    console.error('Error fetching site expense refunds:', error);
    res.status(500).json({ error: 'Failed to fetch site expense refunds' });
  }
};

// Get site expense refund by ID
exports.getSiteExpenseRefundById = async (req, res) => {
  try {
    const { id } = req.params;
    const siteExpenseRefund = await prisma.siteExpenseRefund.findUnique({
      where: { id: parseInt(id) },
      include: {
        siteExpense: {
          include: {
            job: true,
            client: true
          }
        }
      }
    });
    
    if (!siteExpenseRefund) {
      return res.status(404).json({ error: 'Site expense refund not found' });
    }
    
    res.status(200).json(siteExpenseRefund);
  } catch (error) {
    console.error('Error fetching site expense refund:', error);
    res.status(500).json({ error: 'Failed to fetch site expense refund' });
  }
};

// Create a new site expense refund
exports.createSiteExpenseRefund = async (req, res) => {
  try {
    const { siteExpenseId, refundDate, campOrName, amount } = req.body;
    
    const newSiteExpenseRefund = await prisma.siteExpenseRefund.create({
      data: {
        refundDate: new Date(refundDate),
        campOrName,
        amount,
        siteExpense: {
          connect: { id: parseInt(siteExpenseId) }
        }
      },
      include: {
        siteExpense: true
      }
    });
    
    res.status(201).json(newSiteExpenseRefund);
  } catch (error) {
    console.error('Error creating site expense refund:', error);
    res.status(500).json({ error: 'Failed to create site expense refund' });
  }
};

// Update a site expense refund
exports.updateSiteExpenseRefund = async (req, res) => {
  try {
    const { id } = req.params;
    const { siteExpenseId, refundDate, campOrName, amount } = req.body;
    
    const updatedSiteExpenseRefund = await prisma.siteExpenseRefund.update({
      where: { id: parseInt(id) },
      data: {
        refundDate: refundDate ? new Date(refundDate) : undefined,
        campOrName,
        amount,
        siteExpense: siteExpenseId ? {
          connect: { id: parseInt(siteExpenseId) }
        } : undefined
      },
      include: {
        siteExpense: true
      }
    });
    
    res.status(200).json(updatedSiteExpenseRefund);
  } catch (error) {
    console.error('Error updating site expense refund:', error);
    res.status(500).json({ error: 'Failed to update site expense refund' });
  }
};

// Delete a site expense refund
exports.deleteSiteExpenseRefund = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.siteExpenseRefund.delete({
      where: { id: parseInt(id) }
    });
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting site expense refund:', error);
    res.status(500).json({ error: 'Failed to delete site expense refund' });
  }
};