import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash, Search, Download, Filter } from 'lucide-react';
import Navbar from '../components/Navbar';

const ContractorPaymentsListPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [contractors, setContractors] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [filterContractor, setFilterContractor] = useState('');
  const [filterJob, setFilterJob] = useState('');
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch payments
        const paymentsResponse = await fetch('http://localhost:5000/api/contractor-payments');
        if (!paymentsResponse.ok) throw new Error('Failed to fetch payments');
        const paymentsData = await paymentsResponse.json();
        setPayments(paymentsData);
        
        // Fetch contractors
        const contractorsResponse = await fetch('http://localhost:5000/api/contractors');
        if (!contractorsResponse.ok) throw new Error('Failed to fetch contractors');
        const contractorsData = await contractorsResponse.json();
        setContractors(contractorsData);
        
        // Fetch jobs
        const jobsResponse = await fetch('http://localhost:5000/api/jobs');
        if (!jobsResponse.ok) throw new Error('Failed to fetch jobs');
        const jobsData = await jobsResponse.json();
        setJobs(jobsData);
      } catch (err) {
        setError(err.message || 'An error occurred while loading data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this payment?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/contractor-payments/${id}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete payment');
        }
        
        // Remove the deleted payment from the state
        setPayments(payments.filter(payment => payment.id !== id));
      } catch (err) {
        setError(err.message || 'Failed to delete payment');
        console.error(err);
      }
    }
  };
  
  // Format currency values
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amount);
  };
  
  // Format date values
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };
  
  // Calculate total amount (base + GST)
  const calculateTotalAmount = (payment) => {
    return payment.baseAmount + payment.gst;
  };
  
  // Calculate total deductions
  const calculateTotalDeductions = (payment) => {
    return payment.deductions.reduce((total, deduction) => total + deduction.amount, 0);
  };
  
  // Calculate net amount (total - deductions)
  const calculateNetAmount = (payment) => {
    const totalAmount = calculateTotalAmount(payment);
    const totalDeductions = calculateTotalDeductions(payment);
    return totalAmount - totalDeductions;
  };
  
  // Get contractor name by ID
  const getContractorName = (contractorId) => {
    const contractor = contractors.find(c => c.id === contractorId);
    return contractor ? contractor.name : 'Unknown';
  };
  
  // Get job number by ID
  const getJobNumber = (jobId) => {
    const job = jobs.find(j => j.id === jobId);
    return job ? job.jobNo : 'Unknown';
  };
  
  // Filter payments based on search term and filters
  const filteredPayments = payments.filter(payment => {
    const contractorName = payment.contractorSupplier?.name || getContractorName(payment.contractorSupplierId);
    const jobNo = payment.job?.jobNo || getJobNumber(payment.jobId);
    const billNo = payment.billNo || '';
    
    const matchesSearch = 
      contractorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      jobNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      billNo.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesContractorFilter = !filterContractor || payment.contractorSupplierId === parseInt(filterContractor);
    const matchesJobFilter = !filterJob || payment.jobId === parseInt(filterJob);
    
    return matchesSearch && matchesContractorFilter && matchesJobFilter;
  });
  
  // Sort payments by date (newest first)
  const sortedPayments = [...filteredPayments].sort((a, b) => 
    new Date(b.paymentDate) - new Date(a.paymentDate)
  );
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Contractor Payments</h1>
          <Link to="/contractor-payments/new">
            <button className="bg-primary text-white px-4 py-2 rounded-md flex items-center hover:bg-primary/90">
              <Plus className="h-5 w-5 mr-1" />
              Add Payment
            </button>
          </Link>
        </div>
        
        {error && (
          <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg">
            {error}
          </div>
        )}
        
        {/* Search and Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by contractor, job, or bill no..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-2">
              <div className="w-full md:w-48">
                <select
                  value={filterContractor}
                  onChange={(e) => setFilterContractor(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">All Contractors</option>
                  {contractors.map(contractor => (
                    <option key={contractor.id} value={contractor.id}>
                      {contractor.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="w-full md:w-48">
                <select
                  value={filterJob}
                  onChange={(e) => setFilterJob(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">All Jobs</option>
                  {jobs.map(job => (
                    <option key={job.id} value={job.id}>
                      {job.jobNo}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
        
        {/* Payments Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {sortedPayments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Job
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contractor
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bill No
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment Mode
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Deductions
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Net Amount
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedPayments.map((payment) => {
                    const totalAmount = calculateTotalAmount(payment);
                    const totalDeductions = calculateTotalDeductions(payment);
                    const netAmount = calculateNetAmount(payment);
                    
                    return (
                      <tr key={payment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(payment.paymentDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {payment.job?.jobNo || getJobNumber(payment.jobId)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {payment.contractorSupplier?.name || getContractorName(payment.contractorSupplierId)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {payment.billNo}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className="px-2 py-1 text-xs font-medium rounded-full capitalize">
                            {payment.paymentMode.replace('_', ' ')}
                            {payment.chequeOrDdNo && ` (${payment.chequeOrDdNo})`}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex flex-col">
                            <span>Base: {formatCurrency(payment.baseAmount)}</span>
                            <span>GST: {formatCurrency(payment.gst)}</span>
                            <span className="font-medium">Total: {formatCurrency(totalAmount)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {payment.deductions.length > 0 ? (
                            <div className="flex flex-col">
                              {payment.deductions.map((deduction, idx) => (
                                <span key={idx} className="text-xs">
                                  {deduction.type.replace(/_/g, ' ')}: {formatCurrency(deduction.amount)}
                                </span>
                              ))}
                              <span className="font-medium text-red-600">
                                Total: {formatCurrency(totalDeductions)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-500">No deductions</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(netAmount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <Link to={`/contractor-payments/${payment.id}`}>
                              <button className="text-blue-600 hover:text-blue-900">
                                <Edit className="h-5 w-5" />
                              </button>
                            </Link>
                            <button 
                              onClick={() => handleDelete(payment.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-gray-500">No payments found. {searchTerm && 'Try adjusting your search.'}</p>
            </div>
          )}
        </div>
        
        {/* Summary Section */}
        {sortedPayments.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-medium mb-4">Payment Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Total Payments</p>
                <p className="text-2xl font-bold">{sortedPayments.length}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Total Amount Paid</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(
                    sortedPayments.reduce((sum, payment) => sum + calculateTotalAmount(payment), 0)
                  )}
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Total Deductions</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(
                    sortedPayments.reduce((sum, payment) => sum + calculateTotalDeductions(payment), 0)
                  )}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContractorPaymentsListPage;