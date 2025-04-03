const express = require('express');
const router = express.Router();
const siteExpenseEnquiryController = require('../controllers/siteExpenseEnquiryController');

// GET all site expense enquiries
router.get('/', siteExpenseEnquiryController.getAllSiteExpenseEnquiries);

// GET site expense enquiry by ID
router.get('/:id', siteExpenseEnquiryController.getSiteExpenseEnquiryById);

// POST create new site expense enquiry
router.post('/', siteExpenseEnquiryController.createSiteExpenseEnquiry);

// PUT update site expense enquiry
router.put('/:id', siteExpenseEnquiryController.updateSiteExpenseEnquiry);

// DELETE site expense enquiry
router.delete('/:id', siteExpenseEnquiryController.deleteSiteExpenseEnquiry);

module.exports = router;