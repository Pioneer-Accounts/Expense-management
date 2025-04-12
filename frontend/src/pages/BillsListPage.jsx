import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Eye, AlertCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';

const BillsListPage = () => {
  const [bills, setBills] = useState([]);
  const [paymentSummary, setPaymentSummary] = useState({
    totalBilled: 0,
    totalPaid: 0,
    totalDue: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch client bills
        const billsResponse = await fetch('http://localhost:5000/api/client-bills');
        if (!billsResponse.ok) {
          throw new Error('Failed to fetch bills');
        }
        const billsData = await billsResponse.json();
        setBills(billsData);
        
        // Fetch payment receipts
        const receiptsResponse = await fetch('http://localhost:5000/api/payment-receipts');
        if (!receiptsResponse.ok) {
          throw new Error('Failed to fetch payment receipts');
        }
        const receiptsData = await receiptsResponse.json();
        
        // Calculate totals
        const totalBilled = billsData.reduce((sum, bill) => sum + bill.amount, 0);
        
        // Calculate total paid amount from receipts
        const totalPaid = receiptsData.reduce((sum, receipt) => {
          const receiptTotal = receipt.baseAmount + receipt.gst;
          const deductionsTotal = receipt.deductions ? 
            receipt.deductions.reduce((dSum, d) => dSum + d.amount, 0) : 0;
          return sum + (receiptTotal - deductionsTotal);
        }, 0);
        
        // Calculate total due
        const totalDue = totalBilled - totalPaid;
        
        setPaymentSummary({
          totalBilled,
          totalPaid,
          totalDue
        });
      } catch (err) {
        setError('Failed to load data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amount);
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
          <h1 className="text-3xl font-bold text-gray-800">Client Bills</h1>
          <Link to="/expenses/bills/new">
            <Button className="bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700">
              <Plus className="h-4 w-4 mr-2" />
              Create New Bill
            </Button>
          </Link>
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
                <p className="text-sm text-blue-600 font-medium">Total Billed Amount</p>
                <p className="text-2xl font-bold text-blue-800">{formatCurrency(paymentSummary.totalBilled)}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-600 font-medium">Total Paid Amount</p>
                <p className="text-2xl font-bold text-green-800">{formatCurrency(paymentSummary.totalPaid)}</p>
              </div>
              <div className="p-4 bg-amber-50 rounded-lg">
                <p className="text-sm text-amber-600 font-medium">Total Due Amount</p>
                <p className="text-2xl font-bold text-amber-800">{formatCurrency(paymentSummary.totalDue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="bg-gradient-to-r from-sky-500/10 to-indigo-600/10 pb-4">
            <CardTitle>Bills List</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Bill No
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Heading
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Job
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {bills.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 text-center text-muted-foreground">
                        No bills found
                      </td>
                    </tr>
                  ) : (
                    bills.map((bill) => (
                      <tr key={bill.id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          {bill.billNo}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {bill.billHeading}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {bill.job?.jobNo || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {bill.client.name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {new Date(bill.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {formatCurrency(bill.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Link to={`/expenses/bills/edit/${bill.jobId}/${bill.id}`}>
                              <Button variant="outline" size="sm" className="h-8 px-2 text-sky-600 border-sky-600 hover:bg-sky-50">
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Button>
                            </Link>
                            <Link to={`/expenses/bills/${bill.id}`}>
                              <Button variant="outline" size="sm" className="h-8 px-2 text-indigo-600 border-indigo-600 hover:bg-indigo-50">
                                <Eye className="h-4 w-4" />
                                <span className="sr-only">View</span>
                              </Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-right font-medium">
                      Total:
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold">
                      {formatCurrency(paymentSummary.totalBilled)}
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

export default BillsListPage;