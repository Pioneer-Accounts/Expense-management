const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all payment receipts
exports.getAllPaymentReceipts = async (req, res) => {
  try {
    const paymentReceipts = await prisma.paymentReceipt.findMany({
      include: {
        job: true,
        client: true,
        deductions: true
      }
    });
    res.status(200).json(paymentReceipts);
  } catch (error) {
    console.error('Error fetching payment receipts:', error);
    res.status(500).json({ error: 'Failed to fetch payment receipts' });
  }
};

// Get payment receipt by ID
exports.getPaymentReceiptById = async (req, res) => {
  try {
    const { id } = req.params;
    const paymentReceipt = await prisma.paymentReceipt.findUnique({
      where: { id: parseInt(id) },
      include: {
        job: true,
        client: true,
        deductions: true
      }
    });
    
    if (!paymentReceipt) {
      return res.status(404).json({ error: 'Payment receipt not found' });
    }
    
    res.status(200).json(paymentReceipt);
  } catch (error) {
    console.error('Error fetching payment receipt:', error);
    res.status(500).json({ error: 'Failed to fetch payment receipt' });
  }
};

// Create a new payment receipt
exports.createPaymentReceipt = async (req, res) => {
  try {
    const { 
      jobId, 
      clientId, 
      billNo, 
      paymentDate, 
      paymentMode, 
      chequeOrDdNo, 
      baseAmount, 
      gst, 
      deductions 
    } = req.body;

    console.log('Request body:', req.body); // Add logging to debug

    // Validate required fields
    if (!jobId || !billNo || !paymentDate || !paymentMode || baseAmount === undefined || gst === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if job exists - search by jobNo as string
    const job = await prisma.job.findFirst({
      where: { jobNo: jobId.toString() }
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // If clientId is not provided, use the client from the job
    const finalClientId = clientId || job.clientId;

    // Create payment receipt with deductions
    const newPaymentReceipt = await prisma.paymentReceipt.create({
      data: {
        billNo,
        paymentDate: new Date(paymentDate),
        paymentMode,
        chequeOrDdNo,
        baseAmount: parseFloat(baseAmount),
        gst: parseFloat(gst),
        job: {
          connect: { id: job.id } // Connect using the job's actual ID
        },
        client: {
          connect: { id: parseInt(finalClientId) }
        },
        deductions: {
          create: deductions && Array.isArray(deductions) 
            ? deductions.filter(d => d.amount > 0).map(d => ({
                type: d.type,
                amount: parseFloat(d.amount)
              }))
            : []
        }
      },
      include: {
        job: true,
        client: true,
        deductions: true
      }
    });

    res.status(201).json(newPaymentReceipt);
  } catch (error) {
    console.error('Error creating payment receipt:', error);
    res.status(500).json({ error: 'Failed to create payment receipt', details: error.message });
  }
};

// Update a payment receipt
exports.updatePaymentReceipt = async (req, res) => {
  try {
    const { id } = req.params;
    const { jobId, clientId, userId, billNo, paymentDate, paymentMode, chequeOrDdNo, baseAmount, gst } = req.body;
    
    const updatedPaymentReceipt = await prisma.paymentReceipt.update({
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
        user: true,
        deductions: true
      }
    });
    
    res.status(200).json(updatedPaymentReceipt);
  } catch (error) {
    console.error('Error updating payment receipt:', error);
    res.status(500).json({ error: 'Failed to update payment receipt' });
  }
};

// Delete a payment receipt
exports.deletePaymentReceipt = async (req, res) => {
  try {
    const { id } = req.params;
    
    // First delete related deductions
    await prisma.deduction.deleteMany({
      where: { paymentReceiptId: parseInt(id) }
    });
    
    // Then delete the payment receipt
    await prisma.paymentReceipt.delete({
      where: { id: parseInt(id) }
    });
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting payment receipt:', error);
    res.status(500).json({ error: 'Failed to delete payment receipt' });
  }
};