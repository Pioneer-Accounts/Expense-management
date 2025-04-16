import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { AlertCircle, Calendar, Hash, DollarSign } from 'lucide-react';
import Navbar from '../components/Navbar';

const ClientBillForm = () => {
  const { jobNo } = useParams();
  const [formData, setFormData] = useState({
    jobNo: jobNo || '',
    billHeading: '',
    date: new Date().toISOString().split('T')[0],
    billNo: '',
    baseAmount: '',
    gstAmount: '',
    totalAmount: ''
  });
  
  const [job, setJob] = useState(null);
  const [bills, setBills] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Fetch job details when job ID changes
  useEffect(() => {
    if (formData.jobNo) {
      fetchJobDetails(formData.jobNo);
    }
  }, [formData.jobNo]);

  // Fetch all bills for this job
  useEffect(() => {
    if (formData.jobNo) {
      fetchBills(formData.jobNo);
    }
  }, [formData.jobNo]);

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

  const fetchBills = async (jobNo) => {
    try {
      const response = await fetch(`http://localhost:5000/api/client-bills?jobNo=${jobNo}`);
      if (!response.ok) {
        throw new Error('Failed to fetch bills');
      }
      const data = await response.json();
      setBills(data);
    } catch (err) {
      console.error('Error fetching bills:', err);
      setError('Failed to load bills');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'baseAmount' || name === 'gstAmount') {
      const baseAmount = name === 'baseAmount' ? parseFloat(value) || 0 : parseFloat(formData.baseAmount) || 0;
      const gstAmount = name === 'gstAmount' ? parseFloat(value) || 0 : parseFloat(formData.gstAmount) || 0;
      const totalAmount = (baseAmount + gstAmount).toFixed(2);
      
      setFormData(prev => ({
        ...prev,
        [name]: value,
        totalAmount
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.jobNo || !formData.billHeading || !formData.date || !formData.billNo || !formData.baseAmount) {
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
        ? `http://localhost:5000/api/client-bills/${editId}` 
        : 'http://localhost:5000/api/client-bills/create';
      
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          jobNo: formData.jobNo,
          billHeading: formData.billHeading,
          date: formData.date,
          billNo: formData.billNo,
          baseAmount: parseFloat(formData.baseAmount),
          gst: parseFloat(formData.gstAmount) || 0,
          amount: parseFloat(formData.totalAmount)
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to ${isEditing ? 'update' : 'create'} bill`);
      }
      
      // Reset form and fetch updated bills
      resetForm();
      fetchBills(formData.jobNo);
      
    } catch (err) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} bill:`, err);
      setError(`Failed to ${isEditing ? 'update' : 'create'} bill. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (bill) => {
    setFormData({
      jobNo: bill.jobNo,
      billHeading: bill.billHeading,
      date: new Date(bill.date).toISOString().split('T')[0],
      billNo: bill.billNo,
      baseAmount: bill.baseAmount.toString(),
      gstAmount: bill.gstAmount.toString(),
      totalAmount: bill.totalAmount.toString()
    });
    setIsEditing(true);
    setEditId(bill.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this bill?')) {
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:5000/api/bills/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete bill');
      }
      
      // Refresh bills list
      fetchBills(formData.jobNo);
      
    } catch (err) {
      console.error('Error deleting bill:', err);
      setError('Failed to delete bill. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      jobNo: formData.jobNo, // Keep the job ID
      billHeading: '',
      date: new Date().toISOString().split('T')[0],
      billNo: '',
      baseAmount: '',
      gstAmount: '',
      totalAmount: ''
    });
    setIsEditing(false);
    setEditId(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      
      <div className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Client Bill Entry</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bill Entry Form */}
          <Card className="lg:col-span-1 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-sky-500/10 to-indigo-600/10 pb-4">
              <CardTitle>{isEditing ? 'Edit Bill' : 'Create New Bill'}</CardTitle>
            </CardHeader>
            
            <form onSubmit={handleSubmit}>
              <CardContent className="pt-6">
                {error && (
                  <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                  </div>
                )}
                
                <div className="mb-4">
                  <label htmlFor="jobNo" className="block text-sm font-medium text-gray-700 mb-1">
                    Job ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="jobNo"
                    name="jobNo"
                    value={formData.jobNo}
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
                  <label htmlFor="billHeading" className="block text-sm font-medium text-gray-700 mb-1">
                    Bill Heading <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="billHeading"
                    name="billHeading"
                    value={formData.billHeading}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter Bill Heading"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="date"
                      id="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                
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
                  <label htmlFor="gstAmount" className="block text-sm font-medium text-gray-700 mb-1">
                    GST Amount
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="number"
                      id="gstAmount"
                      name="gstAmount"
                      value={formData.gstAmount}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="totalAmount" className="block text-sm font-medium text-gray-700 mb-1">
                    Total Amount
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="number"
                      id="totalAmount"
                      name="totalAmount"
                      value={formData.totalAmount}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none"
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
                  {isSubmitting ? 'Saving...' : isEditing ? 'Update Bill' : 'Save Bill'}
                </Button>
              </CardFooter>
            </form>
          </Card>
          
          {/* Bills List */}
          <Card className="lg:col-span-2 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-sky-500/10 to-indigo-600/10 pb-4">
              <CardTitle>Bills List</CardTitle>
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
                        Heading
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Date
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
                    {bills.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-4 py-4 text-center text-muted-foreground">
                          {formData.jobNo ? 'No bills found for this job' : 'Enter a Job ID to view bills'}
                        </td>
                      </tr>
                    ) : (
                      bills.map((bill) => (
                        <tr key={bill.id} className="border-b hover:bg-muted/50 transition-colors">
                          <td className="px-4 py-4 whitespace-nowrap">
                            {bill.billNo}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            {bill.billHeading}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            {new Date(bill.date).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            ₹ {bill.amount.toFixed(2)}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 px-2 text-sky-600 border-sky-600 hover:bg-sky-50"
                                onClick={() => handleEdit(bill)}
                              >
                                Edit
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 px-2 text-red-600 border-red-600 hover:bg-red-50"
                                onClick={() => handleDelete(bill.id)}
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

export default ClientBillForm;