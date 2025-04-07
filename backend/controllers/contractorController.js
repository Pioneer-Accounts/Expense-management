const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all contractors
exports.getAllContractors = async (req, res) => {
  try {
    const contractors = await prisma.contractorSupplier.findMany();
    res.status(200).json(contractors);
  } catch (error) {
    console.error('Error fetching contractors:', error);
    res.status(500).json({ error: 'Failed to fetch contractors' });
  }
};

// Get contractor by ID
exports.getContractorById = async (req, res) => {
  try {
    const { id } = req.params;
    const contractor = await prisma.contractorSupplier.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!contractor) {
      return res.status(404).json({ error: 'Contractor not found' });
    }
    
    res.status(200).json(contractor);
  } catch (error) {
    console.error('Error fetching contractor:', error);
    res.status(500).json({ error: 'Failed to fetch contractor' });
  }
};

// Create a new contractor
exports.createContractor = async (req, res) => {
  try {
    const { name, code, contactPerson, phone } = req.body;
    
    // Check if code already exists
    const existingContractor = await prisma.contractorSupplier.findUnique({
      where: { code }
    });
    
    if (existingContractor) {
      return res.status(400).json({ error: 'Contractor code already exists' });
    }
    
    const newContractor = await prisma.contractorSupplier.create({
      data: {
        name,
        code,
        contactPerson,
        phone
      }
    });
    
    res.status(201).json(newContractor);
  } catch (error) {
    console.error('Error creating contractor:', error);
    res.status(500).json({ error: 'Failed to create contractor' });
  }
};

// Update contractor
exports.updateContractor = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, contactPerson, phone } = req.body;
    
    // Check if contractor exists
    const contractor = await prisma.contractorSupplier.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!contractor) {
      return res.status(404).json({ error: 'Contractor not found' });
    }
    
    // Check if code already exists (if code is being changed)
    if (code !== contractor.code) {
      const existingContractor = await prisma.contractorSupplier.findUnique({
        where: { code }
      });
      
      if (existingContractor) {
        return res.status(400).json({ error: 'Contractor code already exists' });
      }
    }
    
    const updatedContractor = await prisma.contractorSupplier.update({
      where: { id: parseInt(id) },
      data: {
        name,
        code,
        contactPerson,
        phone
      }
    });
    
    res.status(200).json(updatedContractor);
  } catch (error) {
    console.error('Error updating contractor:', error);
    res.status(500).json({ error: 'Failed to update contractor' });
  }
};

// Delete contractor
exports.deleteContractor = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if contractor exists
    const contractor = await prisma.contractorSupplier.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!contractor) {
      return res.status(404).json({ error: 'Contractor not found' });
    }
    
    await prisma.contractorSupplier.delete({
      where: { id: parseInt(id) }
    });
    
    res.status(200).json({ message: 'Contractor deleted successfully' });
  } catch (error) {
    console.error('Error deleting contractor:', error);
    res.status(500).json({ error: 'Failed to delete contractor' });
  }
};