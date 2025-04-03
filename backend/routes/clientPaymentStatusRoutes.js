const express = require('express');
const router = express.Router();
const clientPaymentStatusController = require('../controllers/clientPaymentStatusController');

// GET all client payment statuses
router.get('/', clientPaymentStatusController.getAllClientPaymentStatuses);

// GET client payment status by ID
router.get('/:id', clientPaymentStatusController.getClientPaymentStatusById);

// POST create new client payment status
router.post('/', clientPaymentStatusController.createClientPaymentStatus);

// PUT update client payment status
router.put('/:id', clientPaymentStatusController.updateClientPaymentStatus);

// DELETE client payment status
router.delete('/:id', clientPaymentStatusController.deleteClientPaymentStatus);

module.exports = router;