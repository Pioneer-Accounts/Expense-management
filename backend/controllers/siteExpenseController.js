const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all site expenses
exports.getAllSiteExpenses = async (req, res) => {
  try {
    const siteExpenses = await prisma.siteExpense.findMany({
      include: {
        job: true,
        client: true,
        refunds: true
      }
    });
    res.status(200).json(siteExpenses);
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
        refunds: true
      }
    });
    
    if (!siteExpense) {
      return res.status(404).json({ error: 'Site expense not found' });
    }
    
    res.status(200).json(siteExpense);
  } catch (error) {
    console.error('Error fetching site expense:', error);
    res.status(500).json({ error: 'Failed to fetch site expense' });
  }
};

// Create a new site expense
exports.createSiteExpense = async (req, res) => {
  try {
    const { jobId, clientId, siteId, paymentDate, campOrName, amount } = req.body;
    
    const newSiteExpense = await prisma.siteExpense.create({
      data: {
        siteId,
        paymentDate: new Date(paymentDate),
        campOrName,
        amount,
        job: {
          connect: { id: parseInt(jobId) }
        },
        client: {
          connect: { id: parseInt(clientId) }
        }
      },
      include: {
        job: true,
        client: true
      }
    });
    
    res.status(201).json(newSiteExpense);
  } catch (error) {
    console.error('Error creating site expense:', error);
    res.status(500).json({ error: 'Failed to create site expense' });
  }
};

// Update a site expense
exports.updateSiteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { jobId, clientId, siteId, paymentDate, campOrName, amount } = req.body;
    
    const updatedSiteExpense = await prisma.siteExpense.update({
      where: { id: parseInt(id) },
      data: {
        siteId,
        paymentDate: paymentDate ? new Date(paymentDate) : undefined,
        campOrName,
        amount,
        job: jobId ? {
          connect: { id: parseInt(jobId) }
        } : undefined,
        client: clientId ? {
          connect: { id: parseInt(clientId) }
        } : undefined
      },
      include: {
        job: true,
        client: true,
        refunds: true
      }
    });
    
    res.status(200).json(updatedSiteExpense);
  } catch (error) {
    console.error('Error updating site expense:', error);
    res.status(500).json({ error: 'Failed to update site expense' });
  }
};

// Delete a site expense
exports.deleteSiteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    
    // First delete related refunds
    await prisma.siteExpenseRefund.deleteMany({
      where: { siteExpenseId: parseInt(id) }
    });
    
    // Then delete the site expense
    await prisma.siteExpense.delete({
      where: { id: parseInt(id) }
    });
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting site expense:', error);
    res.status(500).json({ error: 'Failed to delete site expense' });
  }
};