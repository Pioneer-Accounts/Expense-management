const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all site expenses
exports.getAllSiteExpenses = async (req, res) => {
  try {
    const siteExpenses = await prisma.siteExpense.findMany({
      include: {
        job: true,
        client: true,
        refund: true
      },
      orderBy: {
        paymentDate: 'desc'
      }
    });
    res.json(siteExpenses);
  } catch (error) {
    console.error('Error fetching site expenses:', error);
    res.status(500).json({ error: 'Failed to fetch site expenses' });
  }
};

// Get site expense by ID
exports.getSiteExpenseById = async (req, res) => {
  try {
    const { id } = req.params;
    const siteExpense = await prisma.siteExpense.findUnique({
      where: { id: parseInt(id) },
      include: {
        job: true,
        client: true,
        refund: true
      }
    });
    
    if (!siteExpense) {
      return res.status(404).json({ error: 'Site expense not found' });
    }
    
    res.json(siteExpense);
  } catch (error) {
    console.error('Error fetching site expense:', error);
    res.status(500).json({ error: 'Failed to fetch site expense' });
  }
};

// Create new site expense
exports.createSiteExpense = async (req, res) => {
  try {
    const { 
      jobId, 
      clientId, 
      siteId, 
      paymentDate, 
      amount, 
      hasRefund, 
      refundFromSite, 
      refundDate, 
      refundAmount 
    } = req.body;
    
    // Start a transaction
    const result = await prisma.$transaction(async (prisma) => {
      // Create site expense
      const siteExpense = await prisma.siteExpense.create({
        data: {
          jobId: parseInt(jobId),
          clientId: parseInt(clientId),
          siteId,
          paymentDate: new Date(paymentDate),
          amount: parseFloat(amount),
        }
      });
      
      // Create refund if needed
      if (hasRefund) {
        await prisma.siteExpenseRefund.create({
          data: {
            siteExpenseId: siteExpense.id,
            refundFromSite: refundFromSite || null,
            refundDate: refundDate ? new Date(refundDate) : null,
            amount: refundAmount ? parseFloat(refundAmount) : 0,
          }
        });
      }
      
      // Return the created site expense with its refund
      return await prisma.siteExpense.findUnique({
        where: { id: siteExpense.id },
        include: {
          job: true,
          client: true,
          refund: true
        }
      });
    });
    
    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating site expense:', error);
    res.status(500).json({ error: 'Failed to create site expense' });
  }
};

// Update site expense
exports.updateSiteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      jobId, 
      clientId, 
      siteId, 
      paymentDate, 
      amount, 
      hasRefund, 
      refundFromSite, 
      refundDate, 
      refundAmount 
    } = req.body;
    
    // Start a transaction
    const result = await prisma.$transaction(async (prisma) => {
      // Update site expense
      const updatedSiteExpense = await prisma.siteExpense.update({
        where: { id: parseInt(id) },
        data: {
          jobId: parseInt(jobId),
          clientId: parseInt(clientId),
          siteId,
          paymentDate: new Date(paymentDate),
          amount: parseFloat(amount),
        }
      });
      
      // Check if refund exists
      const existingRefund = await prisma.siteExpenseRefund.findUnique({
        where: { siteExpenseId: parseInt(id) }
      });
      
      if (hasRefund) {
        // If refund exists, update it; otherwise create it
        if (existingRefund) {
          await prisma.siteExpenseRefund.update({
            where: { id: existingRefund.id },
            data: {
              refundFromSite: refundFromSite || null,
              refundDate: refundDate ? new Date(refundDate) : null,
              amount: refundAmount ? parseFloat(refundAmount) : 0,
            }
          });
        } else {
          await prisma.siteExpenseRefund.create({
            data: {
              siteExpenseId: parseInt(id),
              refundFromSite: refundFromSite || null,
              refundDate: refundDate ? new Date(refundDate) : null,
              amount: refundAmount ? parseFloat(refundAmount) : 0,
            }
          });
        }
      } else if (existingRefund) {
        // If hasRefund is false but a refund exists, delete it
        await prisma.siteExpenseRefund.delete({
          where: { id: existingRefund.id }
        });
      }
      
      // Return the updated site expense with its refund
      return await prisma.siteExpense.findUnique({
        where: { id: parseInt(id) },
        include: {
          job: true,
          client: true,
          refund: true
        }
      });
    });
    
    res.json(result);
  } catch (error) {
    console.error('Error updating site expense:', error);
    res.status(500).json({ error: 'Failed to update site expense' });
  }
};

// Delete site expense
exports.deleteSiteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Start a transaction
    await prisma.$transaction(async (prisma) => {
      // First delete any associated refund
      await prisma.siteExpenseRefund.deleteMany({
        where: { siteExpenseId: parseInt(id) }
      });
      
      // Then delete the site expense
      await prisma.siteExpense.delete({
        where: { id: parseInt(id) }
      });
    });
    
    res.json({ message: 'Site expense deleted successfully' });
  } catch (error) {
    console.error('Error deleting site expense:', error);
    res.status(500).json({ error: 'Failed to delete site expense' });
  }
};

// Get site expenses by job ID
exports.getSiteExpensesByJobId = async (req, res) => {
  try {
    const { jobId } = req.params;
    const siteExpenses = await prisma.siteExpense.findMany({
      where: { jobId: parseInt(jobId) },
      include: {
        job: true,
        client: true,
        refund: true
      }
    });
    res.json(siteExpenses);
  } catch (error) {
    console.error('Error fetching site expenses by job ID:', error);
    res.status(500).json({ error: 'Failed to fetch site expenses' });
  }
};