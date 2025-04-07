const express = require('express');
const router = express.Router();
const contractorController = require('../controllers/contractorController');

// GET all contractors
router.get('/', contractorController.getAllContractors);

// GET contractor by ID
router.get('/:id', contractorController.getContractorById);

// POST create new contractor
router.post('/', contractorController.createContractor);

// PUT update contractor
router.put('/:id', contractorController.updateContractor);

// DELETE contractor
router.delete('/:id', contractorController.deleteContractor);

module.exports = router;