import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { AlertCircle, Calendar, Hash, DollarSign, CreditCard } from 'lucide-react';
import Navbar from '../components/Navbar';

const ClientPaymentReceiptForm = () => {
  const { jobId } = useParams();
  const [formData, setFormData] = useState({
    jobId: jobId || '',
    billNo: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMode: 'neft', // Changed from paymentType to paymentMode to match backend
    instrumentNo: '',
    baseAmount: '',
    gst: '',
    tdsDeduction: '',
    gstDeduction: '',
    retentionDeduction: '',
    otherDeduction: '',
    netAmount: ''
  });
  
  const [job, setJob] = useState(null);
  const [payments, setPayments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Payment type options
  const paymentModes = [  // Changed from paymentTypes to paymentModes
    { value: 'cash', label: 'Cash' },
    { value: 'chq', label: 'Cheque' },
    { value: 'dd', label: 'Demand Draft' },
    { value: 'neft', label: 'NEFT' },
    { value: 'rtgs', label: 'RTGS' },
    { value: 'upi', label: 'UPI' },
    { value: 'imps', label: 'IMPS' }
  ];

  // Fetch job details when job ID changes
  useEffect(() => {
    if (formData.jobId) {
      fetchJobDetails(formData.jobId);
    }
  }, [formData.jobId]);

  // Fetch all payments for this job
  useEffect(() => {
    if (formData.jobId) {
      fetchPayments(formData.jobId);
    }
  }, [formData.jobId]);

  const fetchJobDetails = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/jobs/${id}`);
      if (!response.ok) {
        throw new Error('Job not found');
      }
      const data = await response.json();
      setJob(data);
    } catch (err) {
      console.error('Error fetching job:', err);
      setError('Failed to fetch job details. Please check the Job ID.');
      setJob(null);
    }
  };

  const fetchPayments = async (jobId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/payment-receipts?jobId=${jobId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch payments');
      }
      const data = await response.json();
      setPayments(data);
    } catch (err) {
      console.error('Error fetching payments:', err);
      setError('Failed to load payments');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Update form data
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Calculate net amount whenever any amount field changes
    if (['baseAmount', 'gst', 'tdsDeduction', 'gstDeduction', 'retentionDeduction', 'otherDeduction'].includes(name)) {
      calculateNetAmount({
        ...formData,
        [name]: value
      });
    }
  };

  const calculateNetAmount = (data) => {
    const baseAmount = parseFloat(data.baseAmount) || 0;
    const gst = parseFloat(data.gst) || 0;
    const tdsDeduction = parseFloat(data.tdsDeduction) || 0;
    const gstDeduction = parseFloat(data.gstDeduction) || 0;
    const retentionDeduction = parseFloat(data.retentionDeduction) || 0;
    const otherDeduction = parseFloat(data.otherDeduction) || 0;
    
    const totalDeductions = tdsDeduction + gstDeduction + retentionDeduction + otherDeduction;
    const grossAmount = baseAmount + gst;
    const netAmount = grossAmount - totalDeductions;
    
    setFormData(prev => ({
      ...prev,
      netAmount: netAmount.toFixed(2)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.jobId || !formData.billNo || !formData.paymentDate || !formData.baseAmount) {
      setError('Please fill in all required fields');
      return;
    }
    
    if (!job) {
      setError('Please enter a valid Job ID');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const endpoint = isEditing 
        ? `http://localhost:5000/api/payment-receipts/${editId}` 
        : 'http://localhost:5000/api/payment-receipts/';
      
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          jobId: parseInt(formData.jobId),
          clientId: job.clientId, // Add clientId from job object
          userId: parseInt(localStorage.getItem('userId') || '0'), // Add userId from localStorage
          billNo: formData.billNo,
          paymentDate: formData.paymentDate,
          paymentMode: formData.paymentMode,
          chequeOrDdNo: formData.instrumentNo, // Renamed to match backend
          baseAmount: parseFloat(formData.baseAmount),
          gst: parseFloat(formData.gst) || 0, // Changed from gstAmount to gst
          deductions: [
            { type: 'IT_TDS', amount: parseFloat(formData.tdsDeduction) || 0 },
            { type: 'GST_TDS', amount: parseFloat(formData.gstDeduction) || 0 },
            { type: 'SD_RETENTION', amount: parseFloat(formData.retentionDeduction) || 0 },
            { type: 'OTHER', amount: parseFloat(formData.otherDeduction) || 0 }
          ]
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to ${isEditing ? 'update' : 'create'} payment receipt`);
      }
      
      // Reset form and fetch updated payments
      resetForm();
      fetchPayments(formData.jobId);
      
    } catch (err) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} payment receipt:`, err);
      setError(err.message || `Failed to ${isEditing ? 'update' : 'create'} payment receipt. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (payment) => {
    // Extract deduction amounts by type
    const tdsDeduction = payment.deductions.find(d => d.type === 'IT_TDS')?.amount || 0;
    const gstDeduction = payment.deductions.find(d => d.type === 'GST_TDS')?.amount || 0;
    const retentionDeduction = payment.deductions.find(d => d.type === 'SD_RETENTION')?.amount || 0;
    const otherDeduction = payment.deductions.find(d => d.type === 'OTHER')?.amount || 0;
    
    setFormData({
      jobId: payment.jobId.toString(),
      billNo: payment.billNo,
      paymentDate: new Date(payment.paymentDate).toISOString().split('T')[0],
      paymentMode: payment.paymentMode,
      instrumentNo: payment.chequeOrDdNo || '',
      baseAmount: payment.baseAmount.toString(),
      gst: payment.gst.toString(), // Changed from gstAmount to gst
      tdsDeduction: tdsDeduction.toString(),
      gstDeduction: gstDeduction.toString(),
      retentionDeduction: retentionDeduction.toString(),
      otherDeduction: otherDeduction.toString(),
      netAmount: (payment.baseAmount + payment.gst - tdsDeduction - gstDeduction - retentionDeduction - otherDeduction).toFixed(2)
    });
    setIsEditing(true);
    setEditId(payment.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this payment receipt?')) {
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:5000/api/payment-receipts/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete payment receipt');
      }
      
      // Refresh payments list
      fetchPayments(formData.jobId);
      
    } catch (err) {
      console.error('Error deleting payment receipt:', err);
      setError('Failed to delete payment receipt. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      jobId: formData.jobId, // Keep the job ID
      billNo: '',
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMode: 'neft', // Changed from paymentType to paymentMode
      instrumentNo: '',
      baseAmount: '',
      gst: '', // Changed from gstAmount to gst
      tdsDeduction: '',
      gstDeduction: '',
      retentionDeduction: '',
      otherDeduction: '',
      netAmount: ''
    });
    setIsEditing(false);
    setEditId(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      
      <div className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Client Payment Receipt</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Payment Receipt Form */}
          <Card className="lg:col-span-1 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-sky-500/10 to-indigo-600/10 pb-4">
              <CardTitle>{isEditing ? 'Edit Payment Receipt' : 'Record New Payment'}</CardTitle>
            </CardHeader>
            
            <form onSubmit={handleSubmit}>
              <CardContent className="pt-6">
                {error && (
                  <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                  </div>
                )}
                
                <div className="mb-4">
                  <label htmlFor="jobId" className="block text-sm font-medium text-gray-700 mb-1">
                    Job ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="jobId"
                    name="jobId"
                    value={formData.jobId}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter Job ID"
                    required
                  />
                </div>
                
                {job && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
                    <p className="text-sm font-medium text-gray-700">Job: {job.jobNo}</p>
                    <p className="text-sm text-gray-600">Client: {job.client?.name || 'N/A'}</p>
                    <p className="text-sm text-gray-600">Company: {job.company?.name || 'N/A'}</p>
                  </div>
                )}
                
                <div className="mb-4">
                  <label htmlFor="billNo" className="block text-sm font-medium text-gray-700 mb-1">
                    Bill No. <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      id="billNo"
                      name="billNo"
                      value={formData.billNo}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter Bill Number"
                      required
                    />
                  </div>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="paymentDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="date"
                      id="paymentDate"
                      name="paymentDate"
                      value={formData.paymentDate}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="paymentMode" className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Mode <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <select
                      id="paymentMode"
                      name="paymentMode"
                      value={formData.paymentMode}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      {paymentModes.map(mode => (
                        <option key={mode.value} value={mode.value}>{mode.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {(formData.paymentMode === 'chq' || formData.paymentMode === 'dd') && (
                  <div className="mb-4">
                    <label htmlFor="instrumentNo" className="block text-sm font-medium text-gray-700 mb-1">
                      {formData.paymentMode === 'chq' ? 'Cheque' : 'DD'} Number
                    </label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        id="instrumentNo"
                        name="instrumentNo"
                        value={formData.instrumentNo}
                        onChange={handleChange}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={`Enter ${formData.paymentMode === 'chq' ? 'Cheque' : 'DD'} Number`}
                      />
                    </div>
                  </div>
                )}
                
                <div className="mb-4">
                  <label htmlFor="baseAmount" className="block text-sm font-medium text-gray-700 mb-1">
                    Base Amount <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="number"
                      id="baseAmount"
                      name="baseAmount"
                      value={formData.baseAmount}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="gst" className="block text-sm font-medium text-gray-700 mb-1">
                    GST Amount
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="number"
                      id="gst"
                      name="gst"
                      value={formData.gst}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>
                
                <h3 className="font-medium text-gray-700 mb-2 mt-6">Deductions</h3>
                
                <div className="mb-4">
                  <label htmlFor="tdsDeduction" className="block text-sm font-medium text-gray-700 mb-1">
                    TDS Deduction
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="number"
                      id="tdsDeduction"
                      name="tdsDeduction"
                      value={formData.tdsDeduction}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="gstDeduction" className="block text-sm font-medium text-gray-700 mb-1">
                    GST Deduction
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="number"
                      id="gstDeduction"
                      name="gstDeduction"
                      value={formData.gstDeduction}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="retentionDeduction" className="block text-sm font-medium text-gray-700 mb-1">
                    Retention Deduction
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="number"
                      id="retentionDeduction"
                      name="retentionDeduction"
                      value={formData.retentionDeduction}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="otherDeduction" className="block text-sm font-medium text-gray-700 mb-1">
                    Other Deduction
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="number"
                      id="otherDeduction"
                      name="otherDeduction"
                      value={formData.otherDeduction}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>
                
                <div className="mb-4 mt-6 p-3 bg-gray-50 border border-gray-200 rounded">
                  <label htmlFor="netAmount" className="block text-sm font-medium text-gray-700 mb-1">
                    Net Amount Received
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="number"
                      id="netAmount"
                      name="netAmount"
                      value={formData.netAmount}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none font-medium"
                      placeholder="0.00"
                      readOnly
                    />
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-end space-x-2 border-t pt-4">
                {isEditing && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={resetForm}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                )}
                <Button 
                  type="submit" 
                  className="bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : isEditing ? 'Update Payment' : 'Save Payment'}
                </Button>
              </CardFooter>
            </form>
          </Card>
          
          {/* Payments List */}
          <Card className="lg:col-span-2 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-sky-500/10 to-indigo-600/10 pb-4">
              <CardTitle>Payment Receipts</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Bill No
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-4 py-4 text-center text-muted-foreground">
                          {formData.jobId ? 'No payment receipts found for this job' : 'Enter a Job ID to view payment receipts'}
                        </td>
                      </tr>
                    ) : (
                      payments.map((payment) => (
                        <tr key={payment.id} className="border-b hover:bg-muted/50 transition-colors">
                          <td className="px-4 py-4 whitespace-nowrap">
                            {payment.billNo}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            {new Date(payment.paymentDate).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            {paymentModes.find(m => m.value === payment.paymentMode)?.label || payment.paymentMode}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            ₹ {payment.baseAmount.toFixed(2)}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 px-2 text-sky-600 border-sky-600 hover:bg-sky-50"
                                onClick={() => handleEdit(payment)}
                              >
                                Edit
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 px-2 text-red-600 border-red-600 hover:bg-red-50"
                                onClick={() => handleDelete(payment.id)}
                              >
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ClientPaymentReceiptForm;