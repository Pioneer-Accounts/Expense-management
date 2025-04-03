const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all contractor payment statuses
exports.getAllContractorPaymentStatuses = async (req, res) => {
  try {
    const contractorPaymentStatuses = await prisma.contractorPaymentStatus.findMany({
      include: {
        job: true,
        contractorSupplier: true,
        bill: true
      }
    });
    res.status(200).json(contractorPaymentStatuses);
  } catch (error) {
    console.error('Error fetching contractor payment statuses:', error);
    res.status(500).json({ error: 'Failed to fetch contractor payment statuses' });
  }
};

// Get contractor payment status by ID
exports.getContractorPaymentStatusById = async (req, res) => {
  try {
    const { id } = req.params;
    const contractorPaymentStatus = await prisma.contractorPaymentStatus.findUnique({
      where: { id: parseInt(id) },
      include: {
        job: true,
        contractorSupplier: true,
        bill: true
      }
    });
    
    if (!contractorPaymentStatus) {
      return res.status(404).json({ error: 'Contractor payment status not found' });
    }
    
    res.status(200).json(contractorPaymentStatus);
  } catch (error) {
    console.error('Error fetching contractor payment status:', error);
    res.status(500).json({ error: 'Failed to fetch contractor payment status' });
  }
};

// Create a new contractor payment status
exports.createContractorPaymentStatus = async (req, res) => {
  try {
    const { jobId, contractorSupplierId, billId, billNo, billAmount, paymentDate, paymentMode, amountPaid, balanceDue } = req.body;
    
    const newContractorPaymentStatus = await prisma.contractorPaymentStatus.create({
      data: {
        billNo,
        billAmount,
        paymentDate: paymentDate ? new Date(paymentDate) : null,
        paymentMode,
        amountPaid,
        balanceDue,
        job: {
          connect: { id: parseInt(jobId) }
        },
        contractorSupplier: {
          connect: { id: parseInt(contractorSupplierId) }
        },
        bill: {
          connect: { id: parseInt(billId) }
        }
      },
      include: {
        job: true,
        contractorSupplier: true,
        bill: true
      }
    });
    
    res.status(201).json(newContractorPaymentStatus);
  } catch (error) {
    console.error('Error creating contractor payment status:', error);
    res.status(500).json({ error: 'Failed to create contractor payment status' });
  }
};

// Update a contractor payment status
exports.updateContractorPaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { jobId, contractorSupplierId, billId, billNo, billAmount, paymentDate, paymentMode, amountPaid, balanceDue } = req.body;
    
    const updatedContractorPaymentStatus = await prisma.contractorPaymentStatus.update({
      where: { id: parseInt(id) },
      data: {
        billNo,
        billAmount,
        paymentDate: paymentDate ? new Date(paymentDate) : undefined,
        paymentMode,
        amountPaid,
        balanceDue,
        job: jobId ? {
          connect: { id: parseInt(jobId) }
        } : undefined,
        contractorSupplier: contractorSupplierId ? {
          connect: { id: parseInt(contractorSupplierId) }
        } : undefined,
        bill: billId ? {
          connect: { id: parseInt(billId) }
        } : undefined
      },
      include: {
        job: true,
        contractorSupplier: true,
        bill: true
      }
    });
    
    res.status(200).json(updatedContractorPaymentStatus);
  } catch (error) {
    console.error('Error updating contractor payment status:', error);
    res.status(500).json({ error: 'Failed to update contractor payment status' });
  }
};

// Delete a contractor payment status
exports.deleteContractorPaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.contractorPaymentStatus.delete({
      where: { id: parseInt(id) }
    });
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting contractor payment status:', error);
    res.status(500).json({ error: 'Failed to delete contractor payment status' });
  }
};