const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all client bills
exports.getAllClientBills = async (req, res) => {
  try {
    const clientBills = await prisma.clientBill.findMany({
      include: {
        job: true,
        client: true,
        user: true
      }
    });
    res.status(200).json(clientBills);
  } catch (error) {
    console.error('Error fetching client bills:', error);
    res.status(500).json({ error: 'Failed to fetch client bills' });
  }
};

// Get client bill by ID
exports.getClientBillById = async (req, res) => {
  try {
    const { id } = req.params;
    const clientBill = await prisma.clientBill.findUnique({
      where: { id: parseInt(id) },
      include: {
        job: true,
        client: true,
        user: true,
        paymentStatuses: true
      }
    });
    
    if (!clientBill) {
      return res.status(404).json({ error: 'Client bill not found' });
    }
    
    res.status(200).json(clientBill);
  } catch (error) {
    console.error('Error fetching client bill:', error);
    res.status(500).json({ error: 'Failed to fetch client bill' });
  }
};

// Create a new client bill
exports.createClientBill = async (req, res) => {
  try {
    const { jobId, clientId, userId, billNo, date, amount, baseAmount, gst } = req.body;
    
    const newClientBill = await prisma.clientBill.create({
      data: {
        billNo,
        date: new Date(date),
        amount,
        baseAmount,
        gst,
        job: {
          connect: { id: parseInt(jobId) }
        },
        client: {
          connect: { id: parseInt(clientId) }
        },
        user: {
          connect: { id: parseInt(userId) }
        }
      },
      include: {
        job: true,
        client: true,
        user: true
      }
    });
    
    res.status(201).json(newClientBill);
  } catch (error) {
    console.error('Error creating client bill:', error);
    res.status(500).json({ error: 'Failed to create client bill' });
  }
};

// Update a client bill
exports.updateClientBill = async (req, res) => {
  try {
    const { id } = req.params;
    const { jobId, clientId, userId, billNo, date, amount, baseAmount, gst } = req.body;
    
    const updatedClientBill = await prisma.clientBill.update({
      where: { id: parseInt(id) },
      data: {
        billNo,
        date: date ? new Date(date) : undefined,
        amount,
        baseAmount,
        gst,
        job: jobId ? {
          connect: { id: parseInt(jobId) }
        } : undefined,
        client: clientId ? {
          connect: { id: parseInt(clientId) }
        } : undefined,
        user: userId ? {
          connect: { id: parseInt(userId) }
        } : undefined
      },
      include: {
        job: true,
        client: true,
        user: true
      }
    });
    
    res.status(200).json(updatedClientBill);
  } catch (error) {
    console.error('Error updating client bill:', error);
    res.status(500).json({ error: 'Failed to update client bill' });
  }
};

// Delete a client bill
exports.deleteClientBill = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.clientBill.delete({
      where: { id: parseInt(id) }
    });
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting client bill:', error);
    res.status(500).json({ error: 'Failed to delete client bill' });
  }
};