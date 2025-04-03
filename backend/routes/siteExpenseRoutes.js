const express = require('express');
const router = express.Router();
const siteExpenseController = require('../controllers/siteExpenseController');

// GET all site expenses
router.get('/', siteExpenseController.getAllSiteExpenses);

// GET site expense by ID
router.get('/:id', siteExpenseController.getSiteExpenseById);

// POST create new site expense
router.post('/', siteExpenseController.createSiteExpense);

// PUT update site expense
router.put('/:id', siteExpenseController.updateSiteExpense);

// DELETE site expense
router.delete('/:id', siteExpenseController.deleteSiteExpense);

module.exports = router;