const express = require('express');
const router = express.Router();
const clientBillController = require('../controllers/clientBillController');

// GET all client bills
router.get('/', clientBillController.getAllClientBills);

// GET client bill by ID
router.get('/:id', clientBillController.getClientBillById);

// POST create new client bill
router.post('/create', clientBillController.createClientBill);

// PUT update client bill
router.put('/:id', clientBillController.updateClientBill);

// DELETE client bill
router.delete('/:id', clientBillController.deleteClientBill);

module.exports = router;