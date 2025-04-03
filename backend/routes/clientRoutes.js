const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');

// GET all clients
router.get('/', clientController.getAllClients);

// GET client by ID
router.get('/:id', clientController.getClientById);

// POST create new client
router.post('/', clientController.createClient);

// PUT update client
router.put('/:id', clientController.updateClient);

// DELETE client
router.delete('/:id', clientController.deleteClient);

module.exports = router;