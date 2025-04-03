const express = require('express');
const router = express.Router();
const paymentReceiptController = require('../controllers/paymentReceiptController');

// GET all payment receipts
router.get('/', paymentReceiptController.getAllPaymentReceipts);

// GET payment receipt by ID
router.get('/:id', paymentReceiptController.getPaymentReceiptById);

// POST create new payment receipt
router.post('/', paymentReceiptController.createPaymentReceipt);

// PUT update payment receipt
router.put('/:id', paymentReceiptController.updatePaymentReceipt);

// DELETE payment receipt
router.delete('/:id', paymentReceiptController.deletePaymentReceipt);

module.exports = router;