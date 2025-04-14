import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Loader2, Edit, Trash, Plus, RefreshCw, ArrowLeft } from 'lucide-react';
import Navbar from '../components/Navbar';

const SiteExpenseDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [siteExpense, setSiteExpense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch site expense details
        const expenseResponse = await fetch(`http://localhost:5000/api/site-expenses/${id}`);
        if (!expenseResponse.ok) throw new Error('Failed to fetch site expense details');
        const expenseData = await expenseResponse.json();
        console.log(expenseData);
        
        setSiteExpense(expenseData);
      } catch (err) {
        setError(err.message || 'An error occurred while loading data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);
  
  const handleDeleteExpense = async () => {
    if (window.confirm('Are you sure you want to delete this site expense?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/site-expenses/${id}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to delete site expense');
        }
        
        navigate('/site-expenses');
      } catch (err) {
        setError(err.message || 'Failed to delete site expense');
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
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };
  
  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <span className="ml-2 text-lg">Loading...</span>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
          <Link to="/site-expenses" className="text-blue-500 hover:underline flex items-center">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Site Expenses
          </Link>
        </div>
      </div>
    );
  }
  
  if (!siteExpense) {
    return (
      <div>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
            Site expense not found
          </div>
          <Link to="/site-expenses" className="text-blue-500 hover:underline flex items-center">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Site Expenses
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Link to="/site-expenses" className="mr-4">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold">Site Expense Details</h1>
        </div>
        
        <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-semibold mb-2">
                  {siteExpense.job?.site || 'Unknown Site'} - {siteExpense.siteId}
                </h2>
                <p className="text-gray-600">
                  Job: {siteExpense.job?.jobNo || 'Unknown Job'}
                </p>
                <p className="text-gray-600">
                  Client: {siteExpense.client?.name || 'Unknown Client'}
                </p>
              </div>
              <div className="flex space-x-2">
                <Link
                  to={`/site-expenses/edit/${siteExpense.id}`}
                  className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  <Edit className="h-5 w-5" />
                </Link>
                <button
                  onClick={handleDeleteExpense}
                  className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  <Trash className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Expense Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-medium">Payment Date:</span>
                    <span>{formatDate(siteExpense.paymentDate)}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-medium">Amount:</span>
                    <span className="font-semibold text-blue-600">{formatCurrency(siteExpense.amount)}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-medium">Created At:</span>
                    <span>{formatDate(siteExpense.createdAt)}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-medium">Last Updated:</span>
                    <span>{formatDate(siteExpense.updatedAt)}</span>
                  </div>
                </div>
              </div>
              
              {siteExpense.refund && (
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <RefreshCw className="h-5 w-5 mr-2 text-green-500" />
                    Refund Details
                  </h3>
                  <div className="space-y-3">
                    {siteExpense.refund.refundFromSite && (
                      <div className="flex justify-between border-b pb-2">
                        <span className="font-medium">Refund From:</span>
                        <span>{siteExpense.refund.refundFromSite}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-b pb-2">
                      <span className="font-medium">Refund Date:</span>
                      <span>{formatDate(siteExpense.refund.refundDate)}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="font-medium">Refund Amount:</span>
                      <span className="font-semibold text-green-600">{formatCurrency(siteExpense.refund.amount)}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="font-medium">Net Expense:</span>
                      <span className="font-semibold text-purple-600">
                        {formatCurrency(siteExpense.amount - siteExpense.refund.amount)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiteExpenseDetailPage;