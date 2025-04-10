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
    const { 
      jobId, 
      contractorBillId, 
      contractorSupplierId, 
      billNo, 
      paymentDate, 
      paymentMode, 
      chequeOrDdNo, 
      baseAmount, 
      gst, 
      deductions,
      remarks 
    } = req.body;
    
    // Create the payment with a transaction to ensure all operations succeed or fail together
    const result = await prisma.$transaction(async (prisma) => {
      // Create the contractor payment
      const payment = await prisma.contractorPayment.create({
        data: {
          jobId: parseInt(jobId),
          contractorBillId: parseInt(contractorBillId),
          contractorSupplierId: parseInt(contractorSupplierId),
          billNo,
          paymentDate: new Date(paymentDate),
          paymentMode,
          chequeOrDdNo: chequeOrDdNo || null,
          baseAmount: parseFloat(baseAmount),
          gst: parseFloat(gst),
          // remarks: remarks || '',
          deductions: {
            create: deductions.map(deduction => ({
              type: deduction.type,
              amount: parseFloat(deduction.amount)
            }))
          }
        },
        include: {
          job: true,
          contractorBill: true,
          contractorSupplier: true,
          deductions: true
        }
      });
      
      // Get the bill to update payment status
      const bill = await prisma.contractorBill.findUnique({
        where: { id: parseInt(contractorBillId) }
      });
      
      if (!bill) {
        throw new Error('Contractor bill not found');
      }
      
      // Calculate total deductions
      const totalDeductions = deductions.reduce((sum, deduction) => sum + parseFloat(deduction.amount), 0);
      
      // Calculate amount paid (base amount + GST - deductions)
      const amountPaid = parseFloat(baseAmount) + parseFloat(gst) - totalDeductions;
      
      // Update or create payment status
      const existingStatus = await prisma.contractorPaymentStatus.findFirst({
        where: {
          billId: parseInt(contractorBillId)
        }
      });
      
      if (existingStatus) {
        // Update existing status
        await prisma.contractorPaymentStatus.update({
          where: { id: existingStatus.id },
          data: {
            paymentDate: new Date(paymentDate),
            paymentMode,
            amountPaid: existingStatus.amountPaid + amountPaid,
            balanceDue: bill.amount - (existingStatus.amountPaid + amountPaid)
          }
        });
      } else {
        // Create new status
        await prisma.contractorPaymentStatus.create({
          data: {
            jobId: parseInt(jobId),
            contractorSupplierId: parseInt(contractorSupplierId),
            billId: parseInt(contractorBillId),
            billNo,
            billAmount: bill.amount,
            paymentDate: new Date(paymentDate),
            paymentMode,
            amountPaid,
            balanceDue: bill.amount - amountPaid
          }
        });
      }
      
      return payment;
    });
    
    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating contractor payment:', error);
    res.status(500).json({ error: error.message || 'Failed to create contractor payment' });
  }
};

// Update a contractor payment
exports.updateContractorPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      paymentDate, 
      paymentMode, 
      chequeOrDdNo, 
      baseAmount, 
      gst, 
      deductions,
      remarks 
    } = req.body;
    
    // Update with a transaction to ensure all operations succeed or fail together
    const result = await prisma.$transaction(async (prisma) => {
      // Get the existing payment
      const existingPayment = await prisma.contractorPayment.findUnique({
        where: { id: parseInt(id) },
        include: { deductions: true }
      });
      
      if (!existingPayment) {
        throw new Error('Contractor payment not found');
      }
      
      // Delete existing deductions
      await prisma.contractorDeduction.deleteMany({
        where: { contractorPaymentId: parseInt(id) }
      });
      
      // Update the payment
      const payment = await prisma.contractorPayment.update({
        where: { id: parseInt(id) },
        data: {
          paymentDate: new Date(paymentDate),
          paymentMode,
          chequeOrDdNo: chequeOrDdNo || null,
          baseAmount: parseFloat(baseAmount),
          gst: parseFloat(gst),
          remarks: remarks || null,
          deductions: {
            create: deductions.map(deduction => ({
              type: deduction.type,
              amount: parseFloat(deduction.amount)
            }))
          }
        },
        include: {
          job: true,
          contractorBill: true,
          contractorSupplier: true,
          deductions: true
        }
      });
      
      // Calculate total deductions
      const totalDeductions = deductions.reduce((sum, deduction) => sum + parseFloat(deduction.amount), 0);
      
      // Calculate amount paid (base amount + GST - deductions)
      const amountPaid = parseFloat(baseAmount) + parseFloat(gst) - totalDeductions;
      
      // Calculate the difference in payment amount
      const oldTotalDeductions = existingPayment.deductions.reduce((sum, deduction) => sum + deduction.amount, 0);
      const oldAmountPaid = existingPayment.baseAmount + existingPayment.gst - oldTotalDeductions;
      const paymentDifference = amountPaid - oldAmountPaid;
      
      // Update payment status
      const status = await prisma.contractorPaymentStatus.findFirst({
        where: {
          billId: payment.contractorBillId
        }
      });
      
      if (status) {
        await prisma.contractorPaymentStatus.update({
          where: { id: status.id },
          data: {
            paymentDate: new Date(paymentDate),
            paymentMode,
            amountPaid: status.amountPaid + paymentDifference,
            balanceDue: status.balanceDue - paymentDifference
          }
        });
      }
      
      return payment;
    });
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Error updating contractor payment:', error);
    res.status(500).json({ error: error.message || 'Failed to update contractor payment' });
  }
};

// Delete a contractor payment
exports.deleteContractorPayment = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Delete with a transaction to ensure all operations succeed or fail together
    await prisma.$transaction(async (prisma) => {
      // Get the payment to be deleted
      const payment = await prisma.contractorPayment.findUnique({
        where: { id: parseInt(id) },
        include: { deductions: true }
      });
      
      if (!payment) {
        throw new Error('Contractor payment not found');
      }
      
      // Calculate total deductions
      const totalDeductions = payment.deductions.reduce((sum, deduction) => sum + deduction.amount, 0);
      
      // Calculate amount paid (base amount + GST - deductions)
      const amountPaid = payment.baseAmount + payment.gst - totalDeductions;
      
      // Update payment status
      const status = await prisma.contractorPaymentStatus.findFirst({
        where: {
          billId: payment.contractorBillId
        }
      });
      
      if (status) {
        await prisma.contractorPaymentStatus.update({
          where: { id: status.id },
          data: {
            amountPaid: status.amountPaid - amountPaid,
            balanceDue: status.balanceDue + amountPaid,
            paymentDate: status.amountPaid - amountPaid <= 0 ? null : status.paymentDate,
            paymentMode: status.amountPaid - amountPaid <= 0 ? null : status.paymentMode
          }
        });
      }
      
      // Delete deductions first (to maintain referential integrity)
      await prisma.contractorDeduction.deleteMany({
        where: { contractorPaymentId: parseInt(id) }
      });
      
      // Delete the payment
      await prisma.contractorPayment.delete({
        where: { id: parseInt(id) }
      });
    });
    
    res.status(200).json({ message: 'Contractor payment deleted successfully' });
  } catch (error) {
    console.error('Error deleting contractor payment:', error);
    res.status(500).json({ error: error.message || 'Failed to delete contractor payment' });
  }
};

// Get payments by contractor
exports.getPaymentsByContractor = async (req, res) => {
  try {
    const { contractorId } = req.params;
    
    const payments = await prisma.contractorPayment.findMany({
      where: {
        contractorSupplierId: parseInt(contractorId)
      },
      include: {
        job: true,
        contractorBill: true,
        deductions: true
      },
      orderBy: {
        paymentDate: 'desc'
      }
    });
    
    res.status(200).json(payments);
  } catch (error) {
    console.error('Error fetching contractor payments:', error);
    res.status(500).json({ error: 'Failed to fetch contractor payments' });
  }
};

// Get payments by job
exports.getPaymentsByJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    
    const payments = await prisma.contractorPayment.findMany({
      where: {
        jobId: parseInt(jobId)
      },
      include: {
        contractorSupplier: true,
        contractorBill: true,
        deductions: true
      },
      orderBy: {
        paymentDate: 'desc'
      }
    });
    
    res.status(200).json(payments);
  } catch (error) {
    console.error('Error fetching job payments:', error);
    res.status(500).json({ error: 'Failed to fetch job payments' });
  }
};

// Get payment summary statistics
exports.getPaymentSummary = async (req, res) => {
  try {
    // Get total payments made
    const totalPayments = await prisma.contractorPayment.aggregate({
      _sum: {
        baseAmount: true,
        gst: true
      },
      _count: {
        id: true
      }
    });
    
    // Get total deductions
    const totalDeductions = await prisma.contractorDeduction.aggregate({
      _sum: {
        amount: true
      }
    });
    
    // Get payments by month (for the current year)
    const currentYear = new Date().getFullYear();
    const startDate = new Date(currentYear, 0, 1); // Jan 1st of current year
    const endDate = new Date(currentYear, 11, 31); // Dec 31st of current year
    
    const paymentsByMonth = await prisma.$queryRaw`
      SELECT 
        EXTRACT(MONTH FROM "paymentDate") as month,
        SUM("baseAmount" + "gst") as total
      FROM "ContractorPayment"
      WHERE "paymentDate" BETWEEN ${startDate} AND ${endDate}
      GROUP BY EXTRACT(MONTH FROM "paymentDate")
      ORDER BY month
    `;
    
    // Calculate net amount (total payments - total deductions)
    const totalAmount = (totalPayments._sum.baseAmount || 0) + (totalPayments._sum.gst || 0);
    const totalDeductionAmount = totalDeductions._sum.amount || 0;
    const netAmount = totalAmount - totalDeductionAmount;
    
    res.status(200).json({
      totalPayments: totalPayments._count.id,
      totalAmount,
      totalDeductions: totalDeductionAmount,
      netAmount,
      paymentsByMonth
    });
  } catch (error) {
    console.error('Error fetching payment summary:', error);
    res.status(500).json({ error: 'Failed to fetch payment summary' });
  }
};

// Get recent payments
exports.getRecentPayments = async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    
    const recentPayments = await prisma.contractorPayment.findMany({
      take: parseInt(limit),
      orderBy: {
        paymentDate: 'desc'
      },
      include: {
        job: true,
        contractorSupplier: true,
        deductions: true
      }
    });
    
    res.status(200).json(recentPayments);
  } catch (error) {
    console.error('Error fetching recent payments:', error);
    res.status(500).json({ error: 'Failed to fetch recent payments' });
  }
};