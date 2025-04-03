const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');

// GET all companies
router.get('/', companyController.getAllCompanies);

// GET company by ID
router.get('/:id', companyController.getCompanyById);

// POST create new company
router.post('/', companyController.createCompany);

// PUT update company
router.put('/:id', companyController.updateCompany);

// DELETE company
router.delete('/:id', companyController.deleteCompany);

module.exports = router;