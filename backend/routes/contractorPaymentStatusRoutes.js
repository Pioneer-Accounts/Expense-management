const express = require('express');
const router = express.Router();
const contractorPaymentStatusController = require('../controllers/contractorPaymentStatusController');

// GET all contractor payment statuses
router.get('/', contractorPaymentStatusController.getAllContractorPaymentStatuses);

// GET contractor payment status by ID
router.get('/:id', contractorPaymentStatusController.getContractorPaymentStatusById);

// POST create new contractor payment status
router.post('/', contractorPaymentStatusController.createContractorPaymentStatus);

// PUT update contractor payment status
router.put('/:id', contractorPaymentStatusController.updateContractorPaymentStatus);

// DELETE contractor payment status
router.delete('/:id', contractorPaymentStatusController.deleteContractorPaymentStatus);

module.exports = router;