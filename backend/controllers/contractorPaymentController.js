const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all contractor payments
exports.getAllContractorPayments = async (req, res) => {
  try {
    const contractorPayments = await prisma.contractorPayment.findMany({
      include: {
        job: true,
        contractorBill: true,
        contractorSupplier: true,
        deductions: true
      }
    });
    res.status(200).json(contractorPayments);
  } catch (error) {
    console.error('Error fetching contractor payments:', error);
    res.status(500).json({ error: 'Failed to fetch contractor payments' });
  }
};

// Get contractor payment by ID
exports.getContractorPaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    const contractorPayment = await prisma.contractorPayment.findUnique({
      where: { id: parseInt(id) },
      include: {
        job: true,
        contractorBill: true,
        contractorSupplier: true,
        deductions: true
      }
    });
    
    if (!contractorPayment) {
      return res.status(404).json({ error: 'Contractor payment not found' });
    }
    
    res.status(200).json(contractorPayment);
  } catch (error) {
    console.error('Error fetching contractor payment:', error);
    res.status(500).json({ error: 'Failed to fetch contractor payment' });
  }
};

// Create a new contractor payment
exports.createContractorPayment = async (req, res) => {
  try {
    const { jobId, contractorBillId, contractorSupplierId, billNo, paymentDate, paymentMode, chequeOrDdNo, baseAmount, gst, deductions } = req.body;
    
    const newContractorPayment = await prisma.contractorPayment.create({
      data: {
        billNo,
        paymentDate: new Date(paymentDate),
        paymentMode,
        chequeOrDdNo,
        baseAmount,
        gst,
        job: {
          connect: { id: parseInt(jobId) }
        },
        contractorBill: {
          connect: { id: parseInt(contractorBillId) }
        },
        contractorSupplier: {
          connect: { id: parseInt(contractorSupplierId) }
        },
        deductions: {
          create: deductions || []
        }
      },
      include: {
        job: true,
        contractorBill: true,
        contractorSupplier: true,
        deductions: true
      }
    });
    
    res.status(201).json(newContractorPayment);
  } catch (error) {
    console.error('Error creating contractor payment:', error);
    res.status(500).json({ error: 'Failed to create contractor payment' });
  }
};

// Update a contractor payment
exports.updateContractorPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { jobId, contractorBillId, contractorSupplierId, billNo, paymentDate, paymentMode, chequeOrDdNo, baseAmount, gst } = req.body;
    
    const updatedContractorPayment = await prisma.contractorPayment.update({
      where: { id: parseInt(id) },
      data: {
        billNo,
        paymentDate: paymentDate ? new Date(paymentDate) : undefined,
        paymentMode,
        chequeOrDdNo,
        baseAmount,
        gst,
        job: jobId ? {
          connect: { id: parseInt(jobId) }
        } : undefined,
        contractorBill: contractorBillId ? {
          connect: { id: parseInt(contractorBillId) }
        } : undefined,
        contractorSupplier: contractorSupplierId ? {
          connect: { id: parseInt(contractorSupplierId) }
        } : undefined
      },
      include: {
        job: true,
        contractorBill: true,
        contractorSupplier: true,
        deductions: true
      }
    });
    
    res.status(200).json(updatedContractorPayment);
  } catch (error) {
    console.error('Error updating contractor payment:', error);
    res.status(500).json({ error: 'Failed to update contractor payment' });
  }
};

// Delete a contractor payment
exports.deleteContractorPayment = async (req, res) => {
  try {
    const { id } = req.params;
    
    // First delete related deductions
    await prisma.contractorDeduction.deleteMany({
      where: { contractorPaymentId: parseInt(id) }
    });
    
    // Then delete the contractor payment
    await prisma.contractorPayment.delete({
      where: { id: parseInt(id) }
    });
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting contractor payment:', error);
    res.status(500).json({ error: 'Failed to delete contractor payment' });
  }
};