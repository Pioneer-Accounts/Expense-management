import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, Save, Edit, Trash } from 'lucide-react';
import Navbar from '../components/Navbar';

const ContractorPaymentForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const [formData, setFormData] = useState({
    contractorSupplierId: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMode: 'bank_transfer',
    amount: 0,
    referenceNo: '',
    remarks: ''
  });
  
  const [contractors, setContractors] = useState([]);
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const paymentModes = [
    { id: 'cash', name: 'Cash' },
    { id: 'cheque', name: 'Cheque' },
    { id: 'bank_transfer', name: 'Bank Transfer' },
    { id: 'upi', name: 'UPI' },
    { id: 'other', name: 'Other' }
  ];
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch contractors
        const contractorsResponse = await fetch('http://localhost:5000/api/contractors');
        if (!contractorsResponse.ok) throw new Error('Failed to fetch contractors');
        const contractorsData = await contractorsResponse.json();
        setContractors(contractorsData);
        
        if (isEditMode) {
          // Fetch payment details if in edit mode
          const paymentResponse = await fetch(`http://localhost:5000/api/contractor-payments/${id}`);
          if (!paymentResponse.ok) throw new Error('Failed to fetch payment details');
          const paymentData = await paymentResponse.json();
          
          // Format the date
          const formattedDate = new Date(paymentData.paymentDate).toISOString().split('T')[0];
          
          setFormData({
            ...paymentData,
            paymentDate: formattedDate
          });
        }
      } catch (err) {
        setError(err.message || 'An error occurred while loading data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, isEditMode]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value) || 0;
    
    setFormData(prev => ({
      ...prev,
      [name]: numValue
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    
    try {
      // Validate form
      if (!formData.contractorSupplierId) throw new Error('Please select a contractor/supplier');
      if (!formData.paymentDate) throw new Error('Please enter payment date');
      if (!formData.paymentMode) throw new Error('Please select payment mode');
      if (formData.amount <= 0) throw new Error('Amount must be greater than zero');
      
      const url = isEditMode 
        ? `http://localhost:5000/api/contractor-payments/${id}`
        : 'http://localhost:5000/api/contractor-payments';
      
      const method = isEditMode ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save payment');
      }
      
      navigate('/contractor-payments');
    } catch (err) {
      setError(err.message || 'An error occurred while saving the payment');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleDelete = async () => {
    if (!isEditMode) return;
    
    if (window.confirm('Are you sure you want to delete this payment?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/contractor-payments/${id}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete payment');
        }
        
        navigate('/contractor-payments');
      } catch (err) {
        setError(err.message || 'An error occurred while deleting the payment');
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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            {isEditMode ? 'Edit Contractor Payment' : 'Add New Contractor Payment'}
          </h1>
          
          {error && (
            <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg">
              {error}
            </div>
          )}
          
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="bg-muted/50 px-6 py-4 border-b">
              <h2 className="text-lg font-medium">Payment Information</h2>
            </div>
            <div className="p-6">
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  {/* Contractor Section */}
                  <div className="space-y-2">
                    <label htmlFor="contractorSupplierId" className="block text-sm font-medium">
                      Contractor/Supplier <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="contractorSupplierId"
                      name="contractorSupplierId"
                      value={formData.contractorSupplierId}
                      onChange={handleChange}
                      className="w-full rounded-md border border-gray-300 px-3 py-2"
                      required
                    >
                      <option value="">Select a contractor</option>
                      {contractors.map(contractor => (
                        <option key={contractor.id} value={contractor.id}>
                          {contractor.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Payment Details Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="paymentDate" className="block text-sm font-medium">
                        Payment Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="paymentDate"
                        name="paymentDate"
                        type="date"
                        value={formData.paymentDate}
                        onChange={handleChange}
                        className="w-full rounded-md border border-gray-300 px-3 py-2"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="paymentMode" className="block text-sm font-medium">
                        Payment Mode <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="paymentMode"
                        name="paymentMode"
                        value={formData.paymentMode}
                        onChange={handleChange}
                        className="w-full rounded-md border border-gray-300 px-3 py-2"
                        required
                      >
                        <option value="">Select payment mode</option>
                        {paymentModes.map(mode => (
                          <option key={mode.id} value={mode.id}>
                            {mode.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
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
                        onChange={handleNumberChange}
                        className="w-full rounded-md border border-gray-300 px-3 py-2"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="referenceNo" className="block text-sm font-medium">
                        Reference No
                      </label>
                      <input
                        id="referenceNo"
                        name="referenceNo"
                        value={formData.referenceNo || ''}
                        onChange={handleChange}
                        className="w-full rounded-md border border-gray-300 px-3 py-2"
                      />
                    </div>
                    
                    <div className="space-y-2 md:col-span-2">
                      <label htmlFor="remarks" className="block text-sm font-medium">
                        Remarks
                      </label>
                      <textarea
                        id="remarks"
                        name="remarks"
                        value={formData.remarks || ''}
                        onChange={handleChange}
                        rows={3}
                        className="w-full rounded-md border border-gray-300 px-3 py-2"
                      />
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => navigate('/contractor-payments')}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    
                    {isEditMode && (
                      <button
                        type="button"
                        onClick={handleDelete}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </button>
                    )}
                    
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-4 py-2 bg-gradient-to-r from-sky-500 to-indigo-600 text-white rounded-md hover:from-sky-600 hover:to-indigo-700 disabled:opacity-50 flex items-center"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          {isEditMode ? (
                            <>
                              <Edit className="mr-2 h-4 w-4" />
                              Update
                            </>
                          ) : (
                            <>
                              <Save className="mr-2 h-4 w-4" />
                              Save
                            </>
                          )}
                        </>
                      )}
                    </button>
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

export default ContractorPaymentForm;