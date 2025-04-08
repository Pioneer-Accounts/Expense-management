const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all material codes
exports.getAllMaterialCodes = async (req, res) => {
  try {
    const materialCodes = await prisma.materialCode.findMany({
      orderBy: {
        code: 'asc'
      }
    });
    res.status(200).json(materialCodes);
  } catch (error) {
    console.error('Error fetching material codes:', error);
    res.status(500).json({ error: 'Failed to fetch material codes' });
  }
};

// Get a single material code by ID
exports.getMaterialCodeById = async (req, res) => {
  try {
    const { id } = req.params;
    const materialCode = await prisma.materialCode.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!materialCode) {
      return res.status(404).json({ error: 'Material code not found' });
    }
    
    res.status(200).json(materialCode);
  } catch (error) {
    console.error('Error fetching material code:', error);
    res.status(500).json({ error: 'Failed to fetch material code' });
  }
};

// Create a new material code
exports.createMaterialCode = async (req, res) => {
  try {
    const { code, description, unit } = req.body;
    
    // Validate required fields
    if (!code || !description) {
      return res.status(400).json({ error: 'Code and description are required' });
    }
    
    // Check if code already exists
    const existingCode = await prisma.materialCode.findFirst({
      where: { code }
    });
    
    if (existingCode) {
      return res.status(400).json({ error: 'Material code already exists' });
    }
    
    const newMaterialCode = await prisma.materialCode.create({
      data: {
        code,
        description,
        unit
      }
    });
    
    res.status(201).json(newMaterialCode);
  } catch (error) {
    console.error('Error creating material code:', error);
    res.status(500).json({ error: 'Failed to create material code' });
  }
};

// Update a material code
exports.updateMaterialCode = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, description, unit } = req.body;
    
    // Validate required fields
    if (!code || !description) {
      return res.status(400).json({ error: 'Code and description are required' });
    }
    
    // Check if the code already exists (excluding the current record)
    const existingCode = await prisma.materialCode.findFirst({
      where: {
        code,
        id: { not: parseInt(id) }
      }
    });
    
    if (existingCode) {
      return res.status(400).json({ error: 'Material code already exists' });
    }
    
    const updatedMaterialCode = await prisma.materialCode.update({
      where: { id: parseInt(id) },
      data: {
        code,
        description,
        unit
      }
    });
    
    res.status(200).json(updatedMaterialCode);
  } catch (error) {
    console.error('Error updating material code:', error);
    res.status(500).json({ error: 'Failed to update material code' });
  }
};

// Delete a material code
exports.deleteMaterialCode = async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.materialCode.delete({
      where: { id: parseInt(id) }
    });
    
    res.status(200).json({ message: 'Material code deleted successfully' });
  } catch (error) {
    console.error('Error deleting material code:', error);
    res.status(500).json({ error: 'Failed to delete material code' });
  }
};