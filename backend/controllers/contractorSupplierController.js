const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all contractor suppliers
exports.getAllContractorSuppliers = async (req, res) => {
  try {
    const contractorSuppliers = await prisma.contractorSupplier.findMany({
      include: {
        bills: true,
        payments: true,
        paymentStatuses: true
      }
    });
    res.status(200).json(contractorSuppliers);
  } catch (error) {
    console.error('Error fetching contractor suppliers:', error);
    res.status(500).json({ error: 'Failed to fetch contractor suppliers' });
  }
};

// Get contractor supplier by ID
exports.getContractorSupplierById = async (req, res) => {
  try {
    const { id } = req.params;
    const contractorSupplier = await prisma.contractorSupplier.findUnique({
      where: { id: parseInt(id) },
      include: {
        bills: true,
        payments: true,
        paymentStatuses: true
      }
    });
    
    if (!contractorSupplier) {
      return res.status(404).json({ error: 'Contractor supplier not found' });
    }
    
    res.status(200).json(contractorSupplier);
  } catch (error) {
    console.error('Error fetching contractor supplier:', error);
    res.status(500).json({ error: 'Failed to fetch contractor supplier' });
  }
};

// Create a new contractor supplier
exports.createContractorSupplier = async (req, res) => {
  try {
    const { name, code } = req.body;
    
    const newContractorSupplier = await prisma.contractorSupplier.create({
      data: {
        name,
        code
      }
    });
    
    res.status(201).json(newContractorSupplier);
  } catch (error) {
    console.error('Error creating contractor supplier:', error);
    res.status(500).json({ error: 'Failed to create contractor supplier' });
  }
};

// Update a contractor supplier
exports.updateContractorSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code } = req.body;
    
    const updatedContractorSupplier = await prisma.contractorSupplier.update({
      where: { id: parseInt(id) },
      data: {
        name,
        code
      }
    });
    
    res.status(200).json(updatedContractorSupplier);
  } catch (error) {
    console.error('Error updating contractor supplier:', error);
    res.status(500).json({ error: 'Failed to update contractor supplier' });
  }
};

// Delete a contractor supplier
exports.deleteContractorSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.contractorSupplier.delete({
      where: { id: parseInt(id) }
    });
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting contractor supplier:', error);
    res.status(500).json({ error: 'Failed to delete contractor supplier' });
  }
};