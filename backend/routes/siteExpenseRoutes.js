const express = require('express');
const router = express.Router();
const siteExpenseController = require('../controllers/siteExpenseController');

// Get all site expenses
router.get('/', siteExpenseController.getAllSiteExpenses);

// Get site expense by ID
router.get('/:id', siteExpenseController.getSiteExpenseById);

// Create new site expense
router.post('/', siteExpenseController.createSiteExpense);

// Update site expense
router.put('/:id', siteExpenseController.updateSiteExpense);

// Delete site expense
router.delete('/:id', siteExpenseController.deleteSiteExpense);

// Get site expenses by job ID
router.get('/job/:jobId', siteExpenseController.getSiteExpensesByJobId);

module.exports = router;