import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { AlertCircle, Download, ArrowLeft } from 'lucide-react';
import Navbar from '../components/Navbar';

const ClientPaymentStatusPage = () => {
  const [paymentStatuses, setPaymentStatuses] = useState([]);
  const [totals, setTotals] = useState({ amountPaid: 0, balanceDue: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { jobId } = useParams();
  const navigate = useNavigate();

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
      
      // Filter by jobId if provided
      const filteredStatuses = jobId ? statuses.filter(status => status.job?.id === jobId) : statuses;
      
      // Calculate totals
      const totalAmountPaid = filteredStatuses.reduce((sum, status) => sum + status.amountPaid, 0);
      const totalBalanceDue = filteredStatuses.reduce((sum, status) => sum + status.balanceDue, 0);
      
      console.log('Processed payment statuses:', filteredStatuses);
      
      setPaymentStatuses(filteredStatuses);
      setTotals({
        amountPaid: totalAmountPaid,
        balanceDue: totalBalanceDue
      });
      setError('');
    } catch (err) {
      console.error('Error fetching payment statuses:', err);
      setError('Failed to load payment statuses. Please try again.');
    } finally {
      setLoading(false);
    }
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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      
      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              className="mr-2" 
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-3xl font-bold text-gray-800">
              {jobId ? `Payment Status for Job #${jobId}` : 'All Client Payment Statuses'}
            </h1>
          </div>
          
          <Button 
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
            onClick={() => {
              // Export functionality would go here
              alert('Export functionality to be implemented');
            }}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 text-destructive rounded-md flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        
        {/* Payment Summary Card */}
        <Card className="mb-6">
          <CardHeader className="bg-gradient-to-r from-green-500/10 to-emerald-600/10 pb-4">
            <CardTitle>Payment Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-600 font-medium">Total Bill Value</p>
                <p className="text-2xl font-bold text-blue-800">
                  {formatCurrency(totals.amountPaid + totals.balanceDue)}
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-600 font-medium">Total Amount Paid</p>
                <p className="text-2xl font-bold text-green-800">{formatCurrency(totals.amountPaid)}</p>
              </div>
              <div className="p-4 bg-amber-50 rounded-lg">
                <p className="text-sm text-amber-600 font-medium">Total Balance Due</p>
                <p className="text-2xl font-bold text-amber-800">{formatCurrency(totals.balanceDue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="bg-gradient-to-r from-sky-500/10 to-indigo-600/10 pb-4">
            <CardTitle>Payment Status Details</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Job
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Bill Value
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Payment Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Payment Mode
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Amount Paid
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Balance Due
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paymentStatuses.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 text-center text-muted-foreground">
                        No payment statuses found
                      </td>
                    </tr>
                  ) : (
                    paymentStatuses.map((status) => (
                      <tr key={status.id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          {status.job?.jobNo || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {status.client?.name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {formatCurrency(status.billValue)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {formatDate(status.paymentDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {status.paymentMode ? status.paymentMode.toUpperCase() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-green-600 font-medium">
                          {formatCurrency(status.amountPaid)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-amber-600 font-medium">
                          {formatCurrency(status.balanceDue)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-right font-medium">
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