const express = require('express');
const router = express.Router();
const siteExpenseRefundController = require('../controllers/siteExpenseRefundController');

// GET all site expense refunds
router.get('/', siteExpenseRefundController.getAllSiteExpenseRefunds);

// GET site expense refund by ID
router.get('/:id', siteExpenseRefundController.getSiteExpenseRefundById);

// POST create new site expense refund
router.post('/', siteExpenseRefundController.createSiteExpenseRefund);

// PUT update site expense refund
router.put('/:id', siteExpenseRefundController.updateSiteExpenseRefund);

// DELETE site expense refund
router.delete('/:id', siteExpenseRefundController.deleteSiteExpenseRefund);

module.exports = router;