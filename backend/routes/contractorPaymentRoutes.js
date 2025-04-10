const express = require('express');
const router = express.Router();
const contractorPaymentController = require('../controllers/contractorPaymentController');

// GET all contractor payments
router.get('/', contractorPaymentController.getAllContractorPayments);

// GET contractor payment by ID
router.get('/:id', contractorPaymentController.getContractorPaymentById);

// POST create new contractor payment
router.post('/', contractorPaymentController.createContractorPayment);

// PUT update contractor payment
router.put('/:id', contractorPaymentController.updateContractorPayment);

// DELETE contractor payment
router.delete('/:id', contractorPaymentController.deleteContractorPayment);

// Add these routes to your existing routes file
router.get('/contractor/:contractorId', contractorPaymentController.getPaymentsByContractor);
router.get('/job/:jobId', contractorPaymentController.getPaymentsByJob);
router.get('/summary', contractorPaymentController.getPaymentSummary);
router.get('/recent', contractorPaymentController.getRecentPayments);

module.exports = router;