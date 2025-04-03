const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all jobs
exports.getAllJobs = async (req, res) => {
  try {
    const jobs = await prisma.job.findMany({
      include: {
        user: true,
        client: true,
        company: true
      }
    });
    res.status(200).json(jobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
};

// Get job by ID
exports.getJobById = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await prisma.job.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: true,
        client: true,
        company: true,
        clientBills: true,
        paymentReceipts: true,
        contractorBills: true,
        siteExpenses: true
      }
    });
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    res.status(200).json(job);
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({ error: 'Failed to fetch job' });
  }
};

// Create a new job
exports.createJob = async (req, res) => {
  try {
    const { userId, clientId, companyId, jobNo, site, workOrderValue } = req.body;
    
    const newJob = await prisma.job.create({
      data: {
        jobNo,
        site,
        workOrderValue,
        user: {
          connect: { id: parseInt(userId) }
        },
        client: {
          connect: { id: parseInt(clientId) }
        },
        company: {
          connect: { id: parseInt(companyId) }
        }
      },
      include: {
        user: true,
        client: true,
        company: true
      }
    });
    
    res.status(201).json(newJob);
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ error: 'Failed to create job' });
  }
};

// Update a job
exports.updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, clientId, companyId, jobNo, site, workOrderValue } = req.body;
    
    const updatedJob = await prisma.job.update({
      where: { id: parseInt(id) },
      data: {
        jobNo,
        site,
        workOrderValue,
        user: userId ? {
          connect: { id: parseInt(userId) }
        } : undefined,
        client: clientId ? {
          connect: { id: parseInt(clientId) }
        } : undefined,
        company: companyId ? {
          connect: { id: parseInt(companyId) }
        } : undefined
      },
      include: {
        user: true,
        client: true,
        company: true
      }
    });
    
    res.status(200).json(updatedJob);
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({ error: 'Failed to update job' });
  }
};

// Delete a job
exports.deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.job.delete({
      where: { id: parseInt(id) }
    });
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ error: 'Failed to delete job' });
  }
};