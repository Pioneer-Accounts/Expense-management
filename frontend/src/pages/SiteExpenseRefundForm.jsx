import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, Save, Edit, Trash } from 'lucide-react';
import Navbar from '../components/Navbar';

const SiteExpenseRefundForm = () => {
  const { expenseId, id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const [formData, setFormData] = useState({
    siteExpenseId: expenseId || '',
    refundDate: new Date().toISOString().split('T')[0],
    campOrName: '',
    amount: ''
  });
  
  const [siteExpense, setSiteExpense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        if (expenseId) {
          // Fetch site expense details
          const expenseResponse = await fetch(`http://localhost:5000/api/site-expenses/${expenseId}`);
          if (!expenseResponse.ok) throw new Error('Failed to fetch site expense details');
          const expenseData = await expenseResponse.json();
          setSiteExpense(expenseData);
          
          // If in edit mode, fetch refund details
          if (isEditMode) {
            await fetchRefundDetails();
          }
        } else {
          throw new Error('Site expense ID is required');
        }
      } catch (err) {
        setError(err.message || 'An error occurred while loading data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchInitialData();
  }, [expenseId, id, isEditMode]);
  
  const fetchRefundDetails = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/site-expense-refunds/${id}`);
      if (!response.ok) throw new Error('Failed to fetch refund details');
      const data = await response.json();
      
      // Format the date
      const formattedDate = new Date(data.refundDate).toISOString().split('T')[0];
      
      setFormData({
        siteExpenseId: data.siteExpenseId.toString(),
        refundDate: formattedDate,
        campOrName: data.campOrName,
        amount: data.amount.toString()
      });
    } catch (err) {
      setError(err.message || 'An error occurred while loading refund details');
      console.error(err);
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const calculateRemainingAmount = () => {
    if (!siteExpense) return 0;
    
    const totalRefunded = siteExpense.refunds
      ? siteExpense.refunds.reduce((total, refund) => {
          // Skip the current refund if in edit mode
          if (isEditMode && refund.id === parseInt(id)) return total;
          return total + refund.amount;
        }, 0)
      : 0;
    
    return siteExpense.amount - totalRefunded;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    
    try {
      // Validate form
      if (!formData.siteExpenseId) throw new Error('Site expense ID is required');
      if (!formData.refundDate) throw new Error('Please enter refund date');
      // if (!formData.campOrName) throw new Error('Please enter camp/name');
      
      const amount = parseFloat(formData.amount);
      if (!amount || amount <= 0) throw new Error('Amount must be greater than zero');
      
      const remainingAmount = calculateRemainingAmount();
      if (amount > remainingAmount) 
        throw new Error(`Refund amount cannot exceed the remaining amount (${remainingAmount.toFixed(2)})`);
      
      // Prepare data for API
      const dataToSend = {
        siteExpenseId: parseInt(formData.siteExpenseId),
        refundDate: formData.refundDate,
        campOrName: formData.campOrName,
        amount: amount
      };
      
      const url = isEditMode 
        ? `http://localhost:5000/api/site-expense-refunds/${id}`
        : 'http://localhost:5000/api/site-expense-refunds';
      
      const method = isEditMode ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save refund');
      }
      
      navigate(`/site-expenses/${expenseId}`);
    } catch (err) {
      setError(err.message || 'An error occurred while saving the refund');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleDelete = async () => {
    if (!isEditMode) return;
    
    if (window.confirm('Are you sure you want to delete this refund?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/site-expense-refunds/${id}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to delete refund');
        }
        
        navigate(`/site-expenses/${expenseId}`);
      } catch (err) {
        setError(err.message || 'An error occurred while deleting the refund');
        console.error(err);
      }
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            {isEditMode ? 'Edit Refund' : 'Add New Refund'}
          </h1>
          
          {error && (
            <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg">
              {error}
            </div>
          )}
          
          {siteExpense && (
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <h2 className="text-lg font-medium mb-2">Site Expense Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Job</p>
                  <p className="font-medium">{siteExpense.job?.jobNo || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Site</p>
                  <p className="font-medium">{siteExpense.siteId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Camp/Name</p>
                  <p className="font-medium">{siteExpense.campOrName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Original Amount</p>
                  <p className="font-medium">₹{siteExpense.amount.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Remaining Amount</p>
                  <p className="font-medium">₹{calculateRemainingAmount().toFixed(2)}</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="bg-muted/50 px-6 py-4 border-b">
              <h2 className="text-lg font-medium">Refund Information</h2>
            </div>
            <div className="p-6">
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  {/* Refund Date */}
                  <div className="space-y-2">
                    <label htmlFor="refundDate" className="block text-sm font-medium">
                      Refund Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="refundDate"
                      name="refundDate"
                      type="date"
                      value={formData.refundDate}
                      onChange={handleChange}
                      className="w-full rounded-md border border-gray-300 px-3 py-2"
                      required
                    />
                  </div>
                  
                  {/* Camp/Name */}
                  <div className="space-y-2">
                    <label htmlFor="campOrName" className="block text-sm font-medium">
                      Camp/Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="campOrName"
                      name="campOrName"
                      type="text"
                      value={formData.campOrName}
                      onChange={handleChange}
                      className="w-full rounded-md border border-gray-300 px-3 py-2"
                      required
                    />
                  </div>
                  
                  {/* Amount */}
                  <div className="space-y-2">
                    <label htmlFor="amount" className="block text-sm font-medium">
                      Amount <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="amount"
                      name="amount"
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={handleChange}
                      className="w-full rounded-md border border-gray-300 px-3 py-2"
                      required
                      max={calculateRemainingAmount()}
                    />
                    <p className="text-xs text-gray-500">
                      Maximum refund amount: ₹{calculateRemainingAmount().toFixed(2)}
                    </p>
                  </div>
                  
                  {/* Form Actions */}
                  <div className="flex justify-between pt-4">
                    <button
                      type="button"
                      onClick={() => navigate(`/site-expenses/${expenseId}`)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    
                    <div className="space-x-2">
                      {isEditMode && (
                        <button
                          type="button"
                          onClick={handleDelete}
                          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
                          disabled={submitting}
                        >
                          <Trash className="h-4 w-4 mr-2" />
                          Delete
                        </button>
                      )}
                      
                      <button
                        type="submit"
                        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 flex items-center"
                        disabled={submitting}
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : isEditMode ? (
                          <>
                            <Edit className="h-4 w-4 mr-2" />
                            Update
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiteExpenseRefundForm;