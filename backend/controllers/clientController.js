const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all clients
exports.getAllClients = async (req, res) => {
  try {
    const clients = await prisma.client.findMany();
    res.status(200).json(clients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ error: 'Failed to fetch clients' });
  }
};

// Get client by ID
exports.getClientById = async (req, res) => {
  try {
    const { id } = req.params;
    const client = await prisma.client.findUnique({
      where: { id: parseInt(id) },
      include: {
        jobs: true,
        clientBills: true,
        paymentReceipts: true
      }
    });
    
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    
    res.status(200).json(client);
  } catch (error) {
    console.error('Error fetching client:', error);
    res.status(500).json({ error: 'Failed to fetch client' });
  }
};

// Create a new client
exports.createClient = async (req, res) => {
  try {
    const { name } = req.body;
    const newClient = await prisma.client.create({
      data: { name }
    });
    
    res.status(201).json(newClient);
  } catch (error) {
    console.error('Error creating client:', error);
    res.status(500).json({ error: 'Failed to create client' });
  }
};

// Update a client
exports.updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const updatedClient = await prisma.client.update({
      where: { id: parseInt(id) },
      data: { name }
    });
    
    res.status(200).json(updatedClient);
  } catch (error) {
    console.error('Error updating client:', error);
    res.status(500).json({ error: 'Failed to update client' });
  }
};

// Delete a client
exports.deleteClient = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.client.delete({
      where: { id: parseInt(id) }
    });
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting client:', error);
    res.status(500).json({ error: 'Failed to delete client' });
  }
};