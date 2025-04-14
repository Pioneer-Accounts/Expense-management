import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { AlertCircle, Download, ArrowLeft, Search } from 'lucide-react';
import Navbar from '../components/Navbar';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const SiteExpenseEnquiryPage = () => {
  const [siteExpenses, setSiteExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { jobId } = useParams();
  const navigate = useNavigate();
  
  // Search filters
  const [jobs, setJobs] = useState([]);
  const [sites, setSites] = useState([]);
  const [searchJobNo, setSearchJobNo] = useState('all');
  const [searchSite, setSearchSite] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]); // Current date as default
  
  // Fetch jobs and sites for dropdown
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        // Fetch jobs
        const jobsResponse = await fetch('http://localhost:5000/api/jobs');
        if (!jobsResponse.ok) throw new Error('Failed to fetch jobs');
        const jobsData = await jobsResponse.json();
        setJobs(jobsData);
        
        // Extract unique sites from jobs
        const uniqueSites = [...new Set(jobsData.map(job => job.site))].filter(Boolean);
        setSites(uniqueSites.map(site => ({ id: site, name: site })));
      } catch (err) {
        console.error('Error fetching dropdown data:', err);
      }
    };
    
    fetchDropdownData();
  }, []);
  
  // Auto-select site when job is selected
  useEffect(() => {
    if (searchJobNo && searchJobNo !== 'all') {
      const selectedJob = jobs.find(job => job.jobNo === searchJobNo);
      if (selectedJob && selectedJob.site) {
        setSearchSite(selectedJob.site);
      }
    }
  }, [searchJobNo, jobs]);

  useEffect(() => {
    fetchSiteExpenses();
  }, [jobId]);

  const fetchSiteExpenses = async () => {
    try {
      setLoading(true);
      
      // Fetch site expenses
      const expensesResponse = await fetch('http://localhost:5000/api/site-expenses');
      if (!expensesResponse.ok) {
        throw new Error('Failed to fetch site expenses');
      }
      const expensesData = await expensesResponse.json();
      
      // Process data to create site expense records
      const expenses = expensesData.map(expense => {
        // Find associated job
        const job = jobs.find(j => j.id === expense.jobId);
        
        return {
          id: expense.id,
          jobNo: expense.job?.jobNo || 'N/A',
          site: job?.site || expense.siteId || 'N/A',
          paymentDate: expense.paymentDate,
          amount: parseFloat(expense.amount) || 0,
          job: job || null
        };
      });
      
      setSiteExpenses(expenses);
      setFilteredExpenses(expenses);
      
      // Calculate total amount
      const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
      setTotalAmount(total);
      
      setLoading(false);
    } catch (err) {
      setError(err.message || 'An error occurred while fetching data');
      setLoading(false);
    }
  };

  const handleSearch = () => {
    let filtered = [...siteExpenses];
    
    // Filter by job number
    if (searchJobNo && searchJobNo !== 'all') {
      filtered = filtered.filter(expense => expense.jobNo === searchJobNo);
    }
    
    // Filter by site
    if (searchSite && searchSite !== 'all') {
      filtered = filtered.filter(expense => expense.site === searchSite);
    }
    
    // Filter by date range
    if (fromDate) {
      filtered = filtered.filter(expense => 
        new Date(expense.paymentDate) >= new Date(fromDate)
      );
    }
    
    if (toDate) {
      filtered = filtered.filter(expense => 
        new Date(expense.paymentDate) <= new Date(toDate)
      );
    }
    
    setFilteredExpenses(filtered);
    
    // Update total amount
    const total = filtered.reduce((sum, expense) => sum + expense.amount, 0);
    setTotalAmount(total);
  };

  const resetFilters = () => {
    setSearchJobNo('all');
    setSearchSite('all');
    setFromDate('');
    setToDate(new Date().toISOString().split('T')[0]);
    setFilteredExpenses(siteExpenses);
    
    // Reset total amount
    const total = siteExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    setTotalAmount(total);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amount || 0);
  };

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Site Expenses');
    
    // Add headers
    worksheet.columns = [
      { header: 'Job No', key: 'jobNo', width: 15 },
      { header: 'Site', key: 'site', width: 30 },
      { header: 'Payment Date', key: 'paymentDate', width: 15 },
      { header: 'Amount', key: 'amount', width: 15 }
    ];
    
    // Add rows
    filteredExpenses.forEach(expense => {
      worksheet.addRow({
        jobNo: expense.jobNo,
        site: expense.site,
        paymentDate: formatDate(expense.paymentDate),
        amount: expense.amount
      });
    });
    
    // Add total row
    worksheet.addRow({});
    worksheet.addRow({
      site: 'Total',
      amount: totalAmount
    });
    
    // Style headers
    worksheet.getRow(1).font = { bold: true };
    
    // Generate Excel file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `SiteExpenses_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Site Expense Enquiry</h1>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button variant="outline" onClick={exportToExcel}>
              <Download className="h-4 w-4 mr-2" />
              Export to Excel
            </Button>
          </div>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        )}
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Search Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="jobNo">Job No</Label>
                <Select value={searchJobNo} onValueChange={setSearchJobNo}>
                  <SelectTrigger id="jobNo">
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
              
              <div>
                <Label htmlFor="site">Site</Label>
                <Select value={searchSite} onValueChange={setSearchSite}>
                  <SelectTrigger id="site">
                    <SelectValue placeholder="Select Site" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sites</SelectItem>
                    {sites.map(site => (
                      <SelectItem key={site.id} value={site.name}>
                        {site.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="fromDate">From Date</Label>
                <Input
                  id="fromDate"
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="toDate">To Date</Label>
                <Input
                  id="toDate"
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex justify-end mt-4 space-x-2">
              <Button variant="outline" onClick={resetFilters}>
                Reset
              </Button>
              <Button onClick={handleSearch}>
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Site Expense Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="bg-blue-50 border-blue-100">
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-blue-700">{filteredExpenses.length}</div>
                  <div className="text-sm text-blue-600">Total Expenses</div>
                </CardContent>
              </Card>
              
              <Card className="bg-green-50 border-green-100">
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-green-700">{formatCurrency(totalAmount)}</div>
                  <div className="text-sm text-green-600">Total Amount</div>
                </CardContent>
              </Card>
              
              <Card className="bg-purple-50 border-purple-100">
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-purple-700">
                    {filteredExpenses.length > 0 
                      ? formatCurrency(totalAmount / filteredExpenses.length) 
                      : formatCurrency(0)}
                  </div>
                  <div className="text-sm text-purple-600">Average Expense</div>
                </CardContent>
              </Card>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Job No
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Site
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredExpenses.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                        <div className="flex flex-col items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          <p className="text-lg font-medium">No site expenses found</p>
                          <p className="text-sm text-gray-400">Try adjusting your search filters</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredExpenses.map((expense) => (
                      <tr key={expense.id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {expense.jobNo}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {expense.site}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {formatDate(expense.paymentDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                          {formatCurrency(expense.amount)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan="3" className="px-6 py-4 text-right font-medium text-gray-700">
                      Total:
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-green-600">
                      {formatCurrency(totalAmount)}
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

export default SiteExpenseEnquiryPage;