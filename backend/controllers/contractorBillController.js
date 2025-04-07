const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all contractor bills
exports.getAllContractorBills = async (req, res) => {
  try {
    const contractorBills = await prisma.contractorBill.findMany({
      include: {
        job: true,
        client: true,
        contractorSupplier: true,
        payments: true,
        paymentStatuses: true
      }
    });
    res.status(200).json(contractorBills);
  } catch (error) {
    console.error('Error fetching contractor bills:', error);
    res.status(500).json({ error: 'Failed to fetch contractor bills' });
  }
};

// Get contractor bill by ID
exports.getContractorBillById = async (req, res) => {
  try {
    const { id } = req.params;
    const contractorBill = await prisma.contractorBill.findUnique({
      where: { id: parseInt(id) },
      include: {
        job: true,
        client: true,
        contractorSupplier: true,
        payments: true,
        paymentStatuses: true
      }
    });
    
    if (!contractorBill) {
      return res.status(404).json({ error: 'Contractor bill not found' });
    }
    
    res.status(200).json(contractorBill);
  } catch (error) {
    console.error('Error fetching contractor bill:', error);
    res.status(500).json({ error: 'Failed to fetch contractor bill' });
  }
};

// Create a new contractor bill
exports.createContractorBill = async (req, res) => {
  try {
    const { jobId, contractorSupplierId, billNo, billDate, baseAmount, gst } = req.body;
    
    // Validate required fields
    if (!jobId || !contractorSupplierId || !billNo || !billDate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Parse and validate date
    const parsedDate = new Date(billDate);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }
    
    // Calculate total amount
    const numBaseAmount = parseFloat(baseAmount) || 0;
    const numGst = parseFloat(gst) || 0;
    const totalAmount = numBaseAmount + numGst;
    
    // Get client ID from job
    const job = await prisma.job.findUnique({
      where: { id: parseInt(jobId) },
      select: { clientId: true }
    });
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    const newContractorBill = await prisma.contractorBill.create({
      data: {
        billNo,
        date: parsedDate,
        amount: totalAmount,
        baseAmount: numBaseAmount,
        gst: numGst,
        job: {
          connect: {
            id: parseInt(jobId)
          }
        },
        client: {
          connect: {
            id: job.clientId
          }
        },
        contractorSupplier: {
          connect: {
            id: parseInt(contractorSupplierId)
          }
        }
      },
      include: {
        job: true,
        client: true,
        contractorSupplier: true
      }
    });
    
    res.status(201).json(newContractorBill);
  } catch (error) {
    console.error('Error creating contractor bill:', error);
    res.status(500).json({ error: 'Failed to create contractor bill' });
  }
};

// Update a contractor bill
exports.updateContractorBill = async (req, res) => {
  try {
    const { id } = req.params;
    const { jobId, clientId, contractorSupplierId, billNo, date, amount, baseAmount, gst } = req.body;
    
    const updatedContractorBill = await prisma.contractorBill.update({
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
        contractorSupplier: contractorSupplierId ? {
          connect: { id: parseInt(contractorSupplierId) }
        } : undefined
      },
      include: {
        job: true,
        client: true,
        contractorSupplier: true
      }
    });
    
    res.status(200).json(updatedContractorBill);
  } catch (error) {
    console.error('Error updating contractor bill:', error);
    res.status(500).json({ error: 'Failed to update contractor bill' });
  }
};

// Delete a contractor bill
exports.deleteContractorBill = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.contractorBill.delete({
      where: { id: parseInt(id) }
    });
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting contractor bill:', error);
    res.status(500).json({ error: 'Failed to delete contractor bill' });
  }
};