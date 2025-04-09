const express = require('express');
const router = express.Router();
const contractorBillController = require('../controllers/contractorBillController');

// GET all contractor bills
router.get('/', contractorBillController.getAllContractorBills);

// GET contractor bill by ID
router.get('/:id', contractorBillController.getContractorBillById);

// GET contractors for a specific job
router.get('/job/:jobId/contractors', contractorBillController.getContractorsForJob);

// POST create new contractor bill
router.post('/', contractorBillController.createContractorBill);

// PUT update contractor bill
router.put('/:id', contractorBillController.updateContractorBill);

// DELETE contractor bill
router.delete('/:id', contractorBillController.deleteContractorBill);

module.exports = router;