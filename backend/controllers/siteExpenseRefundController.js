const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all site expense refunds
exports.getAllSiteExpenseRefunds = async (req, res) => {
  try {
    const siteExpenseRefunds = await prisma.siteExpenseRefund.findMany({
      include: {
        siteExpense: {
          include: {
            job: true,
            client: true
          }
        }
      },
      orderBy: {
        refundDate: 'desc'
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

// Create new site expense refund
exports.createSiteExpenseRefund = async (req, res) => {
  try {
    const { 
      siteExpenseId, 
      refundDate, 
      campOrName, 
      amount 
    } = req.body;
    
    // Validate required fields
    if (!siteExpenseId || !refundDate || !campOrName || amount === undefined) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    // Check if site expense exists
    const siteExpense = await prisma.siteExpense.findUnique({
      where: { id: parseInt(siteExpenseId) }
    });
    
    if (!siteExpense) {
      return res.status(404).json({ error: 'Site expense not found' });
    }
    
    // Check if refund amount is valid
    const totalRefundedAmount = await prisma.siteExpenseRefund.aggregate({
      where: { siteExpenseId: parseInt(siteExpenseId) },
      _sum: { amount: true }
    });
    
    const currentTotalRefunded = totalRefundedAmount._sum.amount || 0;
    const newRefundAmount = parseFloat(amount);
    
    if (currentTotalRefunded + newRefundAmount > siteExpense.amount) {
      return res.status(400).json({ 
        error: 'Total refund amount cannot exceed the original expense amount' 
      });
    }
    
    // Create site expense refund
    const siteExpenseRefund = await prisma.siteExpenseRefund.create({
      data: {
        siteExpenseId: parseInt(siteExpenseId),
        refundDate: new Date(refundDate),
        campOrName,
        amount: newRefundAmount
      },
      include: {
        siteExpense: {
          include: {
            job: true,
            client: true
          }
        }
      }
    });
    
    res.status(201).json(siteExpenseRefund);
  } catch (error) {
    console.error('Error creating site expense refund:', error);
    res.status(500).json({ error: 'Failed to create site expense refund' });
  }
};

// Update site expense refund
exports.updateSiteExpenseRefund = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      siteExpenseId, 
      refundDate, 
      campOrName, 
      amount 
    } = req.body;
    
    // Validate required fields
    if (!siteExpenseId || !refundDate || !campOrName || amount === undefined) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    // Check if site expense refund exists
    const existingRefund = await prisma.siteExpenseRefund.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!existingRefund) {
      return res.status(404).json({ error: 'Site expense refund not found' });
    }
    
    // Check if site expense exists
    const siteExpense = await prisma.siteExpense.findUnique({
      where: { id: parseInt(siteExpenseId) }
    });
    
    if (!siteExpense) {
      return res.status(404).json({ error: 'Site expense not found' });
    }
    
    // Check if refund amount is valid
    const totalRefundedAmount = await prisma.siteExpenseRefund.aggregate({
      where: { 
        siteExpenseId: parseInt(siteExpenseId),
        id: { not: parseInt(id) } // Exclude current refund
      },
      _sum: { amount: true }
    });
    
    const currentTotalRefunded = totalRefundedAmount._sum.amount || 0;
    const newRefundAmount = parseFloat(amount);
    
    if (currentTotalRefunded + newRefundAmount > siteExpense.amount) {
      return res.status(400).json({ 
        error: 'Total refund amount cannot exceed the original expense amount' 
      });
    }
    
    // Update site expense refund
    const updatedRefund = await prisma.siteExpenseRefund.update({
      where: { id: parseInt(id) },
      data: {
        siteExpenseId: parseInt(siteExpenseId),
        refundDate: new Date(refundDate),
        campOrName,
        amount: newRefundAmount
      },
      include: {
        siteExpense: {
          include: {
            job: true,
            client: true
          }
        }
      }
    });
    
    res.status(200).json(updatedRefund);
  } catch (error) {
    console.error('Error updating site expense refund:', error);
    res.status(500).json({ error: 'Failed to update site expense refund' });
  }
};

// Delete site expense refund
exports.deleteSiteExpenseRefund = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if site expense refund exists
    const existingRefund = await prisma.siteExpenseRefund.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!existingRefund) {
      return res.status(404).json({ error: 'Site expense refund not found' });
    }
    
    // Delete site expense refund
    await prisma.siteExpenseRefund.delete({
      where: { id: parseInt(id) }
    });
    
    res.status(200).json({ message: 'Site expense refund deleted successfully' });
  } catch (error) {
    console.error('Error deleting site expense refund:', error);
    res.status(500).json({ error: 'Failed to delete site expense refund' });
  }
};

// Get refunds by site expense ID
exports.getRefundsBySiteExpenseId = async (req, res) => {
  try {
    const { siteExpenseId } = req.params;
    
    const refunds = await prisma.siteExpenseRefund.findMany({
      where: { siteExpenseId: parseInt(siteExpenseId) },
      include: {
        siteExpense: {
          include: {
            job: true,
            client: true
          }
        }
      },
      orderBy: {
        refundDate: 'desc'
      }
    });
    
    res.status(200).json(refunds);
  } catch (error) {
    console.error('Error fetching refunds by site expense ID:', error);
    res.status(500).json({ error: 'Failed to fetch refunds' });
  }
};