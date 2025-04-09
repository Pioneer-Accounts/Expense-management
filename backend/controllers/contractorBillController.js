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
        materialCode: true, // Include material code
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
        materialCode: true, // Include material code
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
    const { 
      jobId, 
      contractorSupplierId, 
      materialCodeId, // New field
      billNo, 
      billDate, 
      baseAmount, 
      gst 
    } = req.body;
    
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
    
    // Create data object
    const billData = {
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
    };
    
    // Add material code if provided
    if (materialCodeId) {
      billData.materialCode = {
        connect: {
          id: parseInt(materialCodeId)
        }
      };
    }
    
    const newContractorBill = await prisma.contractorBill.create({
      data: billData,
      include: {
        job: true,
        client: true,
        contractorSupplier: true,
        materialCode: true // Include material code in response
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
    const { 
      jobId, 
      clientId, 
      contractorSupplierId, 
      materialCodeId, // New field
      billNo, 
      date,
      amount, 
      baseAmount, 
      gst 
    } = req.body;
    
    // Create update data object
    const updateData = {};
    
    // Add fields if they exist in the request
    if (billNo) updateData.billNo = billNo;
    if (date) updateData.date = new Date(date);
    if (amount !== undefined) updateData.amount = parseFloat(amount);
    if (baseAmount !== undefined) updateData.baseAmount = parseFloat(baseAmount);
    if (gst !== undefined) updateData.gst = parseFloat(gst);
    
    // Add relations if they exist in the request
    if (jobId) {
      updateData.job = {
        connect: { id: parseInt(jobId) }
      };
    }
    
    if (clientId) {
      updateData.client = {
        connect: { id: parseInt(clientId) }
      };
    }
    
    if (contractorSupplierId) {
      updateData.contractorSupplier = {
        connect: { id: parseInt(contractorSupplierId) }
      };
    }
    
    // Handle material code - can be connected, disconnected, or unchanged
    if (materialCodeId !== undefined) {
      if (materialCodeId) {
        updateData.materialCode = {
          connect: { id: parseInt(materialCodeId) }
        };
      } else {
        // If materialCodeId is null or empty string, disconnect the relation
        updateData.materialCode = {
          disconnect: true
        };
      }
    }
    
    const updatedContractorBill = await prisma.contractorBill.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        job: true,
        client: true,
        contractorSupplier: true,
        materialCode: true // Include material code in response
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

// Get contractors for a specific job
exports.getContractorsForJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    
    // Find all contractor bills for this job
    const contractorBills = await prisma.contractorBill.findMany({
      where: {
        jobId: parseInt(jobId)
      },
      include: {
        contractorSupplier: true
      }
    });
    
    // Extract unique contractors
    const uniqueContractors = [];
    const contractorIds = new Set();
    
    contractorBills.forEach(bill => {
      if (!contractorIds.has(bill.contractorSupplierId)) {
        contractorIds.add(bill.contractorSupplierId);
        uniqueContractors.push(bill.contractorSupplier);
      }
    });
    
    res.status(200).json(uniqueContractors);
  } catch (error) {
    console.error('Error fetching contractors for job:', error);
    res.status(500).json({ error: 'Failed to fetch contractors for job' });
  }
};