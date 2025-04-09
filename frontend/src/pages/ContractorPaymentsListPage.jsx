import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash, Search, Download } from 'lucide-react';
import Navbar from '../components/Navbar';

const ContractorPaymentsListPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [contractors, setContractors] = useState([]);
  
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
        setError(err.message || 'An error occurred while deleting the payment');
        console.error(err);
      }
    }
  };
  
  const getContractorName = (contractorId) => {
    const contractor = contractors.find(c => c.id.toString() === contractorId?.toString());
    return contractor ? contractor.name : 'Unknown';
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const getPaymentModeName = (modeId) => {
    const modes = {
      'cash': 'Cash',
      'cheque': 'Cheque',
      'bank_transfer': 'Bank Transfer',
      'upi': 'UPI',
      'other': 'Other'
    };
    return modes[modeId] || modeId;
  };
  
  const filteredPayments = payments.filter(payment => {
    const contractorName = getContractorName(payment.contractorSupplierId).toLowerCase();
    const referenceNo = payment.referenceNo?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    
    return contractorName.includes(search) || referenceNo.includes(search);
  });
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Contractor Payments</h1>
          <Link 
            to="/contractor-payments/new" 
            className="px-4 py-2 bg-gradient-to-r from-sky-500 to-indigo-600 text-white rounded-md hover:from-sky-600 hover:to-indigo-700 flex items-center"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add New Payment
          </Link>
        </div>
        
        {error && (
          <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg">
            {error}
          </div>
        )}
        
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="p-4 border-b">
            <div className="flex items-center">
              <div className="relative flex-1 max-w-md">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search payments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>
              <button 
                className="ml-4 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center"
                onClick={() => {/* Export functionality */}}
              >
                <Download className="mr-2 h-4 w-4" />
                Export
              </button>
            </div>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-primary border-r-transparent"></div>
              <p className="mt-2 text-gray-500">Loading payments...</p>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">No payments found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-6 py-3 text-left">Contractor</th>
                    <th className="px-6 py-3 text-left">Date</th>
                    <th className="px-6 py-3 text-left">Mode</th>
                    <th className="px-6 py-3 text-left">Reference</th>
                    <th className="px-6 py-3 text-right">Amount</th>
                    <th className="px-6 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredPayments.map(payment => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">{getContractorName(payment.contractorSupplierId)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{formatDate(payment.paymentDate)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{getPaymentModeName(payment.paymentMode)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{payment.referenceNo || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        ₹{payment.amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex justify-center space-x-2">
                          <Link 
                            to={`/contractor-payments/${payment.id}/edit`}
                            className="p-1 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded"
                          >
                            <Edit className="h-5 w-5" />
                          </Link>
                          <button 
                            onClick={() => handleDelete(payment.id)}
                            className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                          >
                            <Trash className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContractorPaymentsListPage;