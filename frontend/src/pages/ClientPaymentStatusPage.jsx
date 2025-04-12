import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { AlertCircle, Download, ArrowLeft, Search } from 'lucide-react';
import Navbar from '../components/Navbar';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

const ClientPaymentStatusPage = () => {
  const [paymentStatuses, setPaymentStatuses] = useState([]);
  const [filteredStatuses, setFilteredStatuses] = useState([]);
  const [totals, setTotals] = useState({ amountPaid: 0, balanceDue: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { jobId } = useParams();
  const navigate = useNavigate();
  
  // Search filters
  const [jobs, setJobs] = useState([]);
  const [clients, setClients] = useState([]);
  const [searchJobNo, setSearchJobNo] = useState('all');
  const [searchClientId, setSearchClientId] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]); // Current date as default
  
  // Fetch jobs and clients for dropdown
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        // Fetch jobs
        const jobsResponse = await fetch('http://localhost:5000/api/jobs');
        if (!jobsResponse.ok) throw new Error('Failed to fetch jobs');
        const jobsData = await jobsResponse.json();
        setJobs(jobsData);
        
        // Fetch clients
        const clientsResponse = await fetch('http://localhost:5000/api/clients');
        if (!clientsResponse.ok) throw new Error('Failed to fetch clients');
        const clientsData = await clientsResponse.json();
        setClients(clientsData);
      } catch (err) {
        console.error('Error fetching dropdown data:', err);
      }
    };
    
    fetchDropdownData();
  }, []);
  
  // Auto-select client when job is selected
  useEffect(() => {
    if (searchJobNo) {
      const selectedJob = jobs.find(job => job.jobNo === searchJobNo);
      if (selectedJob && selectedJob.clientId) {
        setSearchClientId(selectedJob.clientId.toString());
      }
    }
  }, [searchJobNo, jobs]);

  useEffect(() => {
    fetchPaymentStatuses();
  }, [jobId]);

  const fetchPaymentStatuses = async () => {
    try {
      setLoading(true);
      
      // Fetch client bills
      const billsResponse = await fetch('http://localhost:5000/api/client-bills');
      if (!billsResponse.ok) {
        throw new Error('Failed to fetch bills');
      }
      const billsData = await billsResponse.json();
      
      // Fetch payment receipts
      const receiptsResponse = await fetch('http://localhost:5000/api/payment-receipts');
      if (!receiptsResponse.ok) {
        throw new Error('Failed to fetch payment receipts');
      }
      const receiptsData = await receiptsResponse.json();
      
      // Process data to create payment statuses
      const statuses = billsData.map(bill => {
        // Find all receipts for this bill's job
        const jobReceipts = receiptsData.filter(receipt => receipt.jobId === bill.jobId);
        
        // Calculate total paid for this bill
        const amountPaid = jobReceipts.reduce((sum, receipt) => {
          const receiptTotal = receipt.baseAmount + (receipt.gst || 0);
          const deductionsTotal = receipt.deductions ? 
            receipt.deductions.reduce((dSum, d) => dSum + d.amount, 0) : 0;
          return sum + (receiptTotal - deductionsTotal);
        }, 0);
        
        // Calculate balance due
        const balanceDue = bill.amount - amountPaid;
        
        return {
          id: bill.id,
          job: bill.job,
          client: bill.client,
          billValue: bill.amount,
          paymentDate: jobReceipts.length > 0 ? jobReceipts[jobReceipts.length - 1].paymentDate : null,
          paymentMode: jobReceipts.length > 0 ? jobReceipts[jobReceipts.length - 1].paymentMode : null,
          amountPaid: amountPaid,
          balanceDue: balanceDue
        };
      });
      
      // Filter by jobId if provided in URL params
      const initialFilteredStatuses = jobId ? statuses.filter(status => status.job?.id === parseInt(jobId)) : statuses;
      
      setPaymentStatuses(statuses);
      setFilteredStatuses(initialFilteredStatuses);
      
      // Calculate totals for filtered statuses
      updateTotals(initialFilteredStatuses);
      
      setError('');
    } catch (err) {
      console.error('Error fetching payment statuses:', err);
      setError('Failed to load payment statuses. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Update totals based on filtered statuses
  const updateTotals = (statusList) => {
    const totalAmountPaid = statusList.reduce((sum, status) => sum + status.amountPaid, 0);
    const totalBalanceDue = statusList.reduce((sum, status) => sum + status.balanceDue, 0);
    
    setTotals({
      amountPaid: totalAmountPaid,
      balanceDue: totalBalanceDue
    });
  };
  
  // Handle search
  const handleSearch = () => {
    let filtered = [...paymentStatuses];
    
    // Filter by job number
    if (searchJobNo && searchJobNo !== 'all') {
      filtered = filtered.filter(status => status.job?.jobNo === searchJobNo);
    }
    
    // Filter by client
    if (searchClientId && searchClientId !== 'all') {
      filtered = filtered.filter(status => status.client?.id === parseInt(searchClientId));
    }
    
    // Filter by date range
    if (fromDate) {
      const fromDateObj = new Date(fromDate);
      filtered = filtered.filter(status => {
        if (!status.paymentDate) return true; // Include items without payment date
        return new Date(status.paymentDate) >= fromDateObj;
      });
    }
    
    if (toDate) {
      const toDateObj = new Date(toDate);
      // Set time to end of day
      toDateObj.setHours(23, 59, 59, 999);
      
      filtered = filtered.filter(status => {
        if (!status.paymentDate) return true; // Include items without payment date
        return new Date(status.paymentDate) <= toDateObj;
      });
    }
    
    setFilteredStatuses(filtered);
    updateTotals(filtered);
  };
  
  // Reset filters
  const handleReset = () => {
    setSearchJobNo('all');
    setSearchClientId('all');
    setFromDate('');
    setToDate(new Date().toISOString().split('T')[0]);
    setFilteredStatuses(paymentStatuses);
    updateTotals(paymentStatuses);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amount || 0);
  };

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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navbar />
      
      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              className="mr-3 hover:bg-blue-100 transition-colors duration-200" 
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-3xl font-bold text-gray-800 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {jobId ? `Payment Status for Job #${jobId}` : 'Client Payment Status'}
            </h1>
          </div>
          
          <Button 
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-md hover:shadow-lg transition-all duration-200"
            onClick={() => {
              // Export functionality would go here
              alert('Export functionality to be implemented');
            }}
          >
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
        
        {/* Search Filters */}
        <Card className="mb-8 overflow-hidden border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="bg-gradient-to-r from-blue-500/20 to-indigo-600/20 pb-4">
            <CardTitle className="flex items-center text-blue-800">
              <Search className="h-5 w-5 mr-2 text-blue-600" />
              Search Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              <div className="space-y-2">
                <Label htmlFor="jobNo" className="text-sm font-medium text-gray-700">Job Number</Label>
                <Select 
                  value={searchJobNo} 
                  onValueChange={setSearchJobNo}
                >
                  <SelectTrigger id="jobNo" className="border-gray-300 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-400 transition-colors">
                    <SelectValue placeholder="Select Job" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Jobs</SelectItem>
                    {jobs.map(job => (
                      <SelectItem key={job.id} value={job.jobNo}>
                        {job.jobNo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="client" className="text-sm font-medium text-gray-700">Client</Label>
                <Select 
                  value={searchClientId} 
                  onValueChange={setSearchClientId}
                  disabled={searchJobNo !== 'all'} // Disable if job is selected
                >
                  <SelectTrigger id="client" className="border-gray-300 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-400 transition-colors">
                    <SelectValue placeholder="Select Client" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Clients</SelectItem>
                    {clients.map(client => (
                      <SelectItem key={client.id} value={client.id.toString()}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fromDate" className="text-sm font-medium text-gray-700">From Date</Label>
                <Input
                  id="fromDate"
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="border-gray-300 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-400 transition-colors"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="toDate" className="text-sm font-medium text-gray-700">To Date</Label>
                <Input
                  id="toDate"
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="border-gray-300 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-400 transition-colors"
                />
              </div>
              
              <div className="flex items-end space-x-2">
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 flex-1 shadow-md hover:shadow-lg transition-all duration-200"
                  onClick={handleSearch}
                >
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
                <Button 
                  variant="outline" 
                  className="border-gray-300 hover:bg-gray-100 transition-colors duration-200"
                  onClick={handleReset}
                >
                  Reset
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md flex items-start animate-fadeIn">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        
        {/* Payment Summary Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="overflow-hidden border-none shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1">
            <CardHeader className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 pb-3">
              <CardTitle className="text-blue-800 text-lg">Total Bill Value</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="rounded-full bg-blue-100 p-3 mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-3xl font-bold text-blue-800">
                    {formatCurrency(totals.amountPaid + totals.balanceDue)}
                  </p>
                  <p className="text-sm text-blue-600">Total invoiced amount</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="overflow-hidden border-none shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1">
            <CardHeader className="bg-gradient-to-r from-green-500/20 to-green-600/20 pb-3">
              <CardTitle className="text-green-800 text-lg">Total Amount Paid</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="rounded-full bg-green-100 p-3 mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-3xl font-bold text-green-800">{formatCurrency(totals.amountPaid)}</p>
                  <p className="text-sm text-green-600">Total received payments</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="overflow-hidden border-none shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1">
            <CardHeader className="bg-gradient-to-r from-amber-500/20 to-amber-600/20 pb-3">
              <CardTitle className="text-amber-800 text-lg">Total Balance Due</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="rounded-full bg-amber-100 p-3 mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-3xl font-bold text-amber-800">{formatCurrency(totals.balanceDue)}</p>
                  <p className="text-sm text-amber-600">Outstanding balance</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card className="overflow-hidden border-none shadow-xl">
          <CardHeader className="bg-gradient-to-r from-sky-500/20 to-indigo-600/20 pb-4">
            <CardTitle className="flex items-center text-indigo-800">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Payment Status Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Job
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bill Value
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment Mode
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount Paid
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Balance Due
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredStatuses.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                        <div className="flex flex-col items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          <p className="text-lg font-medium">No payment statuses found</p>
                          <p className="text-sm text-gray-400">Try adjusting your search filters</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredStatuses.map((status) => (
                      <tr key={status.id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {status.job?.jobNo || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {status.client?.name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {formatCurrency(status.billValue)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {formatDate(status.paymentDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {status.paymentMode ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {status.paymentMode.toUpperCase()}
                            </span>
                          ) : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                          {formatCurrency(status.amountPaid)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-amber-600">
                          {formatCurrency(status.balanceDue)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-right font-medium text-gray-700">
                      Totals:
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-green-600">
                      {formatCurrency(totals.amountPaid)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-amber-600">
                      {formatCurrency(totals.balanceDue)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientPaymentStatusPage;