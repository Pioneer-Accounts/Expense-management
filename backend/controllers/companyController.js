const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all companies
exports.getAllCompanies = async (req, res) => {
  try {
    const companies = await prisma.company.findMany();
    res.status(200).json(companies);
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
};

// Get company by ID
exports.getCompanyById = async (req, res) => {
  try {
    const { id } = req.params;
    const company = await prisma.company.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }
    
    res.status(200).json(company);
  } catch (error) {
    console.error('Error fetching company:', error);
    res.status(500).json({ error: 'Failed to fetch company' });
  }
};

// Create a new company
exports.createCompany = async (req, res) => {
  try {
    const { name } = req.body;
    const newCompany = await prisma.company.create({
      data: { name }
    });
    
    res.status(201).json(newCompany);
  } catch (error) {
    console.error('Error creating company:', error);
    res.status(500).json({ error: 'Failed to create company' });
  }
};

// Update a company
exports.updateCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const updatedCompany = await prisma.company.update({
      where: { id: parseInt(id) },
      data: { name }
    });
    
    res.status(200).json(updatedCompany);
  } catch (error) {
    console.error('Error updating company:', error);
    res.status(500).json({ error: 'Failed to update company' });
  }
};

// Delete a company
exports.deleteCompany = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.company.delete({
      where: { id: parseInt(id) }
    });
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting company:', error);
    res.status(500).json({ error: 'Failed to delete company' });
  }
};