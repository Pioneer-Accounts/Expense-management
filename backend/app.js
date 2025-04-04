const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const companyRoutes = require('./routes/companyRoutes');
const clientRoutes = require('./routes/clientRoutes');
const jobRoutes = require('./routes/jobRoutes');
const clientBillRoutes = require('./routes/clientBillRoutes');
const paymentReceiptRoutes = require('./routes/paymentReceiptRoutes');
const clientPaymentStatusRoutes = require('./routes/clientPaymentStatusRoutes');
const contractorSupplierRoutes = require('./routes/contractorSupplierRoutes');
const contractorBillRoutes = require('./routes/contractorBillRoutes');
const contractorPaymentRoutes = require('./routes/contractorPaymentRoutes');
const contractorPaymentStatusRoutes = require('./routes/contractorPaymentStatusRoutes');
const siteExpenseRoutes = require('./routes/siteExpenseRoutes');
const siteExpenseRefundRoutes = require('./routes/siteExpenseRefundRoutes');
const siteExpenseEnquiryRoutes = require('./routes/siteExpenseEnquiryRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Auth routes
app.use('/api/auth', authRoutes);

// Other routes
app.use('/api/users', userRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/client-bills', clientBillRoutes);
app.use('/api/payment-receipts', paymentReceiptRoutes);
app.use('/api/client-payment-status', clientPaymentStatusRoutes);
app.use('/api/contractor-suppliers', contractorSupplierRoutes);
app.use('/api/contractor-bills', contractorBillRoutes);
app.use('/api/contractor-payments', contractorPaymentRoutes);
app.use('/api/contractor-payment-status', contractorPaymentStatusRoutes);
app.use('/api/site-expenses', siteExpenseRoutes);
app.use('/api/site-expense-refunds', siteExpenseRefundRoutes);
app.use('/api/site-expense-enquiries', siteExpenseEnquiryRoutes);

// Home route
// app.get('/', (req, res) => {
//   res.send('Expense Management API is working');
// });

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

module.exports = app;