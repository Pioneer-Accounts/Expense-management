import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { AlertCircle, Download, ArrowLeft, Search, Edit, Trash, Save } from 'lucide-react';
import Navbar from '../components/Navbar';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const ContractorPaymentStatusPage = () => {
  const [paymentStatuses, setPaymentStatuses] = useState([]);
  const [filteredStatuses, setFilteredStatuses] = useState([]);
  const [totals, setTotals] = useState({ amountPaid: 0, balanceDue: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { jobId } = useParams();
  const navigate = useNavigate();
  
  // Search filters
  const [jobs, setJobs] = useState([]);
  const [contractors, setContractors] = useState([]);
  const [searchJobNo, setSearchJobNo] = useState('all');
  const [searchContractorId, setSearchContractorId] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]); // Current date as default
  
  // Fetch jobs and contractors for dropdown
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        // Fetch jobs
        const jobsResponse = await fetch('http://localhost:5000/api/jobs');
        if (!jobsResponse.ok) throw new Error('Failed to fetch jobs');
        const jobsData = await jobsResponse.json();
        setJobs(jobsData);
        
        // Fetch contractors
        const contractorsResponse = await fetch('http://localhost:5000/api/contractors');
        if (!contractorsResponse.ok) throw new Error('Failed to fetch contractors');
        const contractorsData = await contractorsResponse.json();
        setContractors(contractorsData);
      } catch (err) {
        console.error('Error fetching dropdown data:', err);
      }
    };
    
    fetchDropdownData();
  }, []);
  
  // Auto-select contractor when job is selected
  useEffect(() => {
    if (searchJobNo && searchJobNo !== 'all') {
      // Reset contractor filter when job changes
      setSearchContractorId('all');
    }
  }, [searchJobNo]);

  useEffect(() => {
    fetchPaymentStatuses();
  }, [jobId]);

  const fetchPaymentStatuses = async () => {
    try {
      setLoading(true);
      
      // Fetch contractor bills
      const billsResponse = await fetch('http://localhost:5000/api/contractor-bills');
      if (!billsResponse.ok) {
        throw new Error('Failed to fetch bills');
      }
      const billsData = await billsResponse.json();
      
      // Fetch contractor payments
      const paymentsResponse = await fetch('http://localhost:5000/api/contractor-payments');
      if (!paymentsResponse.ok) {
        throw new Error('Failed to fetch contractor payments');
      }
      const paymentsData = await paymentsResponse.json();
      
      // Process data to create payment statuses
      const statuses = billsData.map(bill => {
        // Find all payments for this bill
        const billPayments = paymentsData.filter(payment => payment.contractorBillId === bill.id);
        
        // Calculate total paid for this bill
        const amountPaid = billPayments.reduce((sum, payment) => {
          const paymentTotal = payment.baseAmount + (payment.gst || 0);
          const deductionsTotal = payment.deductions ? 
            payment.deductions.reduce((dSum, d) => dSum + d.amount, 0) : 0;
          return sum + (paymentTotal - deductionsTotal);
        }, 0);
        
        // Calculate balance due
        const billTotal = bill.baseAmount + (bill.gst || 0);
        const balanceDue = billTotal - amountPaid;
        
        return {
          id: bill.id,
          job: bill.job,
          contractor: bill.contractorSupplier,
          billNo: bill.billNo,
          billDate: bill.billDate,
          billValue: billTotal,
          paymentDate: billPayments.length > 0 ? billPayments[billPayments.length - 1].paymentDate : null,
          paymentMode: billPayments.length > 0 ? billPayments[billPayments.length - 1].paymentMode : null,
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
    
    // Filter by contractor
    if (searchContractorId && searchContractorId !== 'all') {
      filtered = filtered.filter(status => status.contractor?.id === parseInt(searchContractorId));
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
    setSearchContractorId('all');
    setFromDate('');
    setToDate(new Date().toISOString().split('T')[0]);
    setFilteredStatuses(paymentStatuses);
    updateTotals(paymentStatuses);
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amount);
  };
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN');
  };
  
  // Handle edit
  const handleEdit = (id) => {
    navigate(`/contractor-payments/edit/${id}`);
  };
  
  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this payment?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/contractor-payments/${id}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete payment');
        }
        
        // Refresh data
        fetchPaymentStatuses();
      } catch (err) {
        console.error('Error deleting payment:', err);
        setError('Failed to delete payment. Please try again.');
      }
    }
  };
  
  // Handle export to Excel
  const handleExportToExcel = async () => {
    // Create a new workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Contractor Payment Status');
    
    // Add title with date
    worksheet.mergeCells('A1:H1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = jobId 
      ? `Contractor Payment Status for Job #${jobId}` 
      : 'Contractor Payment Status Report';
    titleCell.font = {
      size: 16,
      bold: true,
      color: { argb: '4F4F4F' }
    };
    titleCell.alignment = { horizontal: 'center' };
    
    // Add export date
    worksheet.mergeCells('A2:H2');
    const dateCell = worksheet.getCell('A2');
    dateCell.value = `Generated on: ${new Date().toLocaleDateString()}`;
    dateCell.font = { italic: true };
    dateCell.alignment = { horizontal: 'center' };
    
    // Add summary section
    worksheet.mergeCells('A4:H4');
    worksheet.getCell('A4').value = 'Summary';
    worksheet.getCell('A4').font = { bold: true, size: 14 };
    
    worksheet.mergeCells('A5:B5');
    worksheet.getCell('A5').value = 'Total Bill Value:';
    worksheet.getCell('A5').font = { bold: true };
    
    worksheet.mergeCells('C5:D5');
    worksheet.getCell('C5').value = totals.amountPaid + totals.balanceDue;
    worksheet.getCell('C5').numFmt = '₹#,##0.00';
    
    worksheet.mergeCells('A6:B6');
    worksheet.getCell('A6').value = 'Total Amount Paid:';
    worksheet.getCell('A6').font = { bold: true };
    
    worksheet.mergeCells('C6:D6');
    worksheet.getCell('C6').value = totals.amountPaid;
    worksheet.getCell('C6').numFmt = '₹#,##0.00';
    
    worksheet.mergeCells('A7:B7');
    worksheet.getCell('A7').value = 'Total Balance Due:';
    worksheet.getCell('A7').font = { bold: true };
    
    worksheet.mergeCells('C7:D7');
    worksheet.getCell('C7').value = totals.balanceDue;
    worksheet.getCell('C7').numFmt = '₹#,##0.00';
    
    // Add filter criteria if any are applied
    let filterRow = 9;
    if (searchJobNo !== 'all' || searchContractorId !== 'all' || fromDate || toDate) {
      worksheet.mergeCells(`A${filterRow}:H${filterRow}`);
      worksheet.getCell(`A${filterRow}`).value = 'Filter Criteria:';
      worksheet.getCell(`A${filterRow}`).font = { bold: true, size: 12 };
      filterRow++;
      
      if (searchJobNo !== 'all') {
        worksheet.mergeCells(`A${filterRow}:B${filterRow}`);
        worksheet.getCell(`A${filterRow}`).value = 'Job Number:';
        worksheet.mergeCells(`C${filterRow}:D${filterRow}`);
        worksheet.getCell(`C${filterRow}`).value = searchJobNo;
        filterRow++;
      }
      
      if (searchContractorId !== 'all') {
        const contractorName = contractors.find(c => c.id.toString() === searchContractorId)?.name || searchContractorId;
        worksheet.mergeCells(`A${filterRow}:B${filterRow}`);
        worksheet.getCell(`A${filterRow}`).value = 'Contractor:';
        worksheet.mergeCells(`C${filterRow}:D${filterRow}`);
        worksheet.getCell(`C${filterRow}`).value = contractorName;
        filterRow++;
      }
      
      if (fromDate) {
        worksheet.mergeCells(`A${filterRow}:B${filterRow}`);
        worksheet.getCell(`A${filterRow}`).value = 'From Date:';
        worksheet.mergeCells(`C${filterRow}:D${filterRow}`);
        worksheet.getCell(`C${filterRow}`).value = new Date(fromDate).toLocaleDateString();
        filterRow++;
      }
      
      if (toDate) {
        worksheet.mergeCells(`A${filterRow}:B${filterRow}`);
        worksheet.getCell(`A${filterRow}`).value = 'To Date:';
        worksheet.mergeCells(`C${filterRow}:D${filterRow}`);
        worksheet.getCell(`C${filterRow}`).value = new Date(toDate).toLocaleDateString();
        filterRow++;
      }
      
      filterRow++; // Add an empty row after filter criteria
    }
    
    // Add table headers
    const headerRow = filterRow;
    worksheet.getRow(headerRow).values = [
      'Job No', 'Contractor', 'Bill No', 'Bill Value', 'Payment Date', 'Payment Mode', 'Amount Paid', 'Balance Due'
    ];
    
    // Style the header row
    worksheet.getRow(headerRow).font = { bold: true };
    worksheet.getRow(headerRow).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'E6F0FF' } // Light blue background
    };
    
    // Add data rows
    filteredStatuses.forEach((status, index) => {
      const rowIndex = headerRow + index + 1;
      worksheet.getRow(rowIndex).values = [
        status.job?.jobNo || 'N/A',
        status.contractor?.name || 'N/A',
        status.billNo || 'N/A',
        status.billValue,
        status.paymentDate ? new Date(status.paymentDate) : 'N/A',
        status.paymentMode ? status.paymentMode.toUpperCase() : 'N/A',
        status.amountPaid,
        status.balanceDue
      ];
      
      // Format currency cells
      worksheet.getCell(`D${rowIndex}`).numFmt = '₹#,##0.00';
      worksheet.getCell(`G${rowIndex}`).numFmt = '₹#,##0.00';
      worksheet.getCell(`H${rowIndex}`).numFmt = '₹#,##0.00';
      
      // Format date cell
      if (status.paymentDate) {
        worksheet.getCell(`E${rowIndex}`).numFmt = 'dd/mm/yyyy';
      }
    });
    
    // Add totals row
    const totalRow = headerRow + filteredStatuses.length + 1;
    worksheet.getCell(`A${totalRow}`).value = 'TOTALS';
    worksheet.mergeCells(`A${totalRow}:F${totalRow}`);
    worksheet.getCell(`A${totalRow}`).font = { bold: true };
    worksheet.getCell(`A${totalRow}`).alignment = { horizontal: 'right' };
    
    worksheet.getCell(`G${totalRow}`).value = totals.amountPaid;
    worksheet.getCell(`G${totalRow}`).font = { bold: true };
    worksheet.getCell(`G${totalRow}`).numFmt = '₹#,##0.00';
    
    worksheet.getCell(`H${totalRow}`).value = totals.balanceDue;
    worksheet.getCell(`H${totalRow}`).font = { bold: true };
    worksheet.getCell(`H${totalRow}`).numFmt = '₹#,##0.00';
    
    // Auto-size columns
    worksheet.columns.forEach(column => {
      let maxLength = 0;
      column.eachCell({ includeEmpty: true }, cell => {
        const columnLength = cell.value ? cell.value.toString().length : 10;
        if (columnLength > maxLength) {
          maxLength = columnLength;
        }
      });
      column.width = maxLength < 10 ? 10 : maxLength + 2;
    });
    
    // Add borders to all cells
    worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
      row.eachCell({ includeEmpty: true }, cell => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    });
    
    // Generate Excel file
    const buffer = await workbook.xlsx.writeBuffer();
    const fileDate = new Date().toISOString().split('T')[0];
    const fileName = jobId 
      ? `Contractor_Payment_Status_Job_${jobId}_${fileDate}.xlsx` 
      : `Contractor_Payment_Status_${fileDate}.xlsx`;
    
    // Save the file
    saveAs(new Blob([buffer]), fileName);
  };

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
              {jobId ? `Contractor Payment Status for Job #${jobId}` : 'Contractor Payment Status'}
            </h1>
          </div>
          
          <Button 
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-md hover:shadow-lg transition-all duration-200"
            onClick={handleExportToExcel}
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
                <Label htmlFor="contractor" className="text-sm font-medium text-gray-700">Contractor</Label>
                <Select 
                  value={searchContractorId} 
                  onValueChange={setSearchContractorId}
                >
                  <SelectTrigger id="contractor" className="border-gray-300 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-400 transition-colors">
                    <SelectValue placeholder="Select Contractor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Contractors</SelectItem>
                    {contractors.map(contractor => (
                      <SelectItem key={contractor.id} value={contractor.id.toString()}>
                        {contractor.name}
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
                  <p className="text-sm text-green-600">Total paid to contractors</p>
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
              Contractor Payment Status Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Job No
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contractor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bill No
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredStatuses.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
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
                          {status.contractor?.name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {status.billNo || 'N/A'}
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 px-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                              onClick={() => navigate(`/contractor-payments/edit/${status.id}`)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 px-2 text-red-600 border-red-200 hover:bg-red-50"
                              onClick={() => handleDelete(status.id)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 px-2 text-green-600 border-green-200 hover:bg-green-50"
                              onClick={() => navigate(`/contractor-payments/new?billId=${status.id}`)}
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-right font-medium text-gray-700">
                      Totals:
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-green-600">
                      {formatCurrency(totals.amountPaid)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-amber-600">
                      {formatCurrency(totals.balanceDue)}
                    </td>
                    <td></td>
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

export default ContractorPaymentStatusPage;