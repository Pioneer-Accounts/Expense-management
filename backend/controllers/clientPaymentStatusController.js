const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all client payment statuses with additional job and bill information
exports.getAllClientPaymentStatuses = async (req, res) => {
  try {
    const clientPaymentStatuses = await prisma.clientPaymentStatus.findMany({
      include: {
        job: true,
        client: true,
        bill: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // Calculate totals
    const totalAmountPaid = clientPaymentStatuses.reduce((sum, status) => sum + status.amountPaid, 0);
    const totalBalanceDue = clientPaymentStatuses.reduce((sum, status) => sum + status.balanceDue, 0);
    
    res.status(200).json({
      paymentStatuses: clientPaymentStatuses,
      totals: {
        amountPaid: totalAmountPaid,
        balanceDue: totalBalanceDue
      }
    });
  } catch (error) {
    console.error('Error fetching client payment statuses:', error);
    res.status(500).json({ error: 'Failed to fetch client payment statuses' });
  }
};

// Get client payment statuses by job ID
exports.getClientPaymentStatusesByJobId = async (req, res) => {
  try {
    const { jobId } = req.params;
    
    const clientPaymentStatuses = await prisma.clientPaymentStatus.findMany({
      where: {
        jobId: parseInt(jobId)
      },
      include: {
        job: true,
        client: true,
        bill: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // Calculate totals
    const totalAmountPaid = clientPaymentStatuses.reduce((sum, status) => sum + status.amountPaid, 0);
    const totalBalanceDue = clientPaymentStatuses.reduce((sum, status) => sum + status.balanceDue, 0);
    
    res.status(200).json({
      paymentStatuses: clientPaymentStatuses,
      totals: {
        amountPaid: totalAmountPaid,
        balanceDue: totalBalanceDue
      }
    });
  } catch (error) {
    console.error('Error fetching client payment statuses by job ID:', error);
    res.status(500).json({ error: 'Failed to fetch client payment statuses' });
  }
};

// Get client payment status by ID
exports.getClientPaymentStatusById = async (req, res) => {
  try {
    const { id } = req.params;
    const clientPaymentStatus = await prisma.clientPaymentStatus.findUnique({
      where: { id: parseInt(id) },
      include: {
        job: true,
        client: true,
        bill: true
      }
    });
    
    if (!clientPaymentStatus) {
      return res.status(404).json({ error: 'Client payment status not found' });
    }
    
    res.status(200).json(clientPaymentStatus);
  } catch (error) {
    console.error('Error fetching client payment status:', error);
    res.status(500).json({ error: 'Failed to fetch client payment status' });
  }
};

// Create a new client payment status
exports.createClientPaymentStatus = async (req, res) => {
  try {
    const { jobId, clientId, billId, billValue, paymentDate, paymentMode, amountPaid, balanceDue } = req.body;
    
    const newClientPaymentStatus = await prisma.clientPaymentStatus.create({
      data: {
        billValue,
        paymentDate: paymentDate ? new Date(paymentDate) : null,
        paymentMode,
        amountPaid,
        balanceDue,
        job: {
          connect: { id: parseInt(jobId) }
        },
        client: {
          connect: { id: parseInt(clientId) }
        },
        bill: {
          connect: { id: parseInt(billId) }
        }
      },
      include: {
        job: true,
        client: true,
        bill: true
      }
    });
    
    res.status(201).json(newClientPaymentStatus);
  } catch (error) {
    console.error('Error creating client payment status:', error);
    res.status(500).json({ error: 'Failed to create client payment status' });
  }
};

// Update a client payment status
exports.updateClientPaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { jobId, clientId, billId, billValue, paymentDate, paymentMode, amountPaid, balanceDue } = req.body;
    
    const updatedClientPaymentStatus = await prisma.clientPaymentStatus.update({
      where: { id: parseInt(id) },
      data: {
        billValue,
        paymentDate: paymentDate ? new Date(paymentDate) : null,
        paymentMode,
        amountPaid,
        balanceDue,
        job: jobId ? {
          connect: { id: parseInt(jobId) }
        } : undefined,
        client: clientId ? {
          connect: { id: parseInt(clientId) }
        } : undefined,
        bill: billId ? {
          connect: { id: parseInt(billId) }
        } : undefined
      },
      include: {
        job: true,
        client: true,
        bill: true
      }
    });
    
    res.status(200).json(updatedClientPaymentStatus);
  } catch (error) {
    console.error('Error updating client payment status:', error);
    res.status(500).json({ error: 'Failed to update client payment status' });
  }
};

// Delete a client payment status
exports.deleteClientPaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.clientPaymentStatus.delete({
      where: { id: parseInt(id) }
    });
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting client payment status:', error);
    res.status(500).json({ error: 'Failed to delete client payment status' });
  }
};