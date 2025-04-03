const express = require('express');
const router = express.Router();
const contractorSupplierController = require('../controllers/contractorSupplierController');

// GET all contractor suppliers
router.get('/', contractorSupplierController.getAllContractorSuppliers);

// GET contractor supplier by ID
router.get('/:id', contractorSupplierController.getContractorSupplierById);

// POST create new contractor supplier
router.post('/', contractorSupplierController.createContractorSupplier);

// PUT update contractor supplier
router.put('/:id', contractorSupplierController.updateContractorSupplier);

// DELETE contractor supplier
router.delete('/:id', contractorSupplierController.deleteContractorSupplier);

module.exports = router;