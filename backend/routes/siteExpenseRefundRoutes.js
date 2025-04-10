const express = require('express');
const router = express.Router();
const siteExpenseRefundController = require('../controllers/siteExpenseRefundController');

// Get all site expense refunds
router.get('/', siteExpenseRefundController.getAllSiteExpenseRefunds);

// Get site expense refund by ID
router.get('/:id', siteExpenseRefundController.getSiteExpenseRefundById);

// Create new site expense refund
router.post('/', siteExpenseRefundController.createSiteExpenseRefund);

// Update site expense refund
router.put('/:id', siteExpenseRefundController.updateSiteExpenseRefund);

// Delete site expense refund
router.delete('/:id', siteExpenseRefundController.deleteSiteExpenseRefund);

// Get refunds by site expense ID
router.get('/expense/:siteExpenseId', siteExpenseRefundController.getRefundsBySiteExpenseId);

module.exports = router;