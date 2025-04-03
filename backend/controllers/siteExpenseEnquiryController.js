const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all site expense enquiries
exports.getAllSiteExpenseEnquiries = async (req, res) => {
  try {
    const siteExpenseEnquiries = await prisma.siteExpenseEnquiry.findMany({
      include: {
        job: true,
        client: true
      }
    });
    res.status(200).json(siteExpenseEnquiries);
  } catch (error) {
    console.error('Error fetching site expense enquiries:', error);
    res.status(500).json({ error: 'Failed to fetch site expense enquiries' });
  }
};

// Get site expense enquiry by ID
exports.getSiteExpenseEnquiryById = async (req, res) => {
  try {
    const { id } = req.params;
    const siteExpenseEnquiry = await prisma.siteExpenseEnquiry.findUnique({
      where: { id: parseInt(id) },
      include: {
        job: true,
        client: true
      }
    });
    
    if (!siteExpenseEnquiry) {
      return res.status(404).json({ error: 'Site expense enquiry not found' });
    }
    
    res.status(200).json(siteExpenseEnquiry);
  } catch (error) {
    console.error('Error fetching site expense enquiry:', error);
    res.status(500).json({ error: 'Failed to fetch site expense enquiry' });
  }
};

// Create a new site expense enquiry
exports.createSiteExpenseEnquiry = async (req, res) => {
  try {
    const { jobId, clientId, date, site, campOrName, amount } = req.body;
    
    const newSiteExpenseEnquiry = await prisma.siteExpenseEnquiry.create({
      data: {
        date: new Date(date),
        site,
        campOrName,
        amount,
        job: {
          connect: { id: parseInt(jobId) }
        },
        client: {
          connect: { id: parseInt(clientId) }
        }
      },
      include: {
        job: true,
        client: true
      }
    });
    
    res.status(201).json(newSiteExpenseEnquiry);
  } catch (error) {
    console.error('Error creating site expense enquiry:', error);
    res.status(500).json({ error: 'Failed to create site expense enquiry' });
  }
};

// Update a site expense enquiry
exports.updateSiteExpenseEnquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const { jobId, clientId, date, site, campOrName, amount } = req.body;
    
    const updatedSiteExpenseEnquiry = await prisma.siteExpenseEnquiry.update({
      where: { id: parseInt(id) },
      data: {
        date: date ? new Date(date) : undefined,
        site,
        campOrName,
        amount,
        job: jobId ? {
          connect: { id: parseInt(jobId) }
        } : undefined,
        client: clientId ? {
          connect: { id: parseInt(clientId) }
        } : undefined
      },
      include: {
        job: true,
        client: true
      }
    });
    
    res.status(200).json(updatedSiteExpenseEnquiry);
  } catch (error) {
    console.error('Error updating site expense enquiry:', error);
    res.status(500).json({ error: 'Failed to update site expense enquiry' });
  }
};

// Delete a site expense enquiry
exports.deleteSiteExpenseEnquiry = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.siteExpenseEnquiry.delete({
      where: { id: parseInt(id) }
    });
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting site expense enquiry:', error);
    res.status(500).json({ error: 'Failed to delete site expense enquiry' });
  }
};