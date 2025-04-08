const express = require('express');
const router = express.Router();
const materialCodeController = require('../controllers/materialCodeController');

// Get all material codes
router.get('/', materialCodeController.getAllMaterialCodes);

// Get a single material code by ID
router.get('/:id', materialCodeController.getMaterialCodeById);

// Create a new material code
router.post('/', materialCodeController.createMaterialCode);

// Update a material code
router.put('/:id', materialCodeController.updateMaterialCode);

// Delete a material code
router.delete('/:id', materialCodeController.deleteMaterialCode);

module.exports = router;