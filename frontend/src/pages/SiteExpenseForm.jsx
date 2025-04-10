import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Loader2, Save, ArrowLeft } from 'lucide-react';
import Navbar from '../components/Navbar';

const SiteExpenseForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  
  const [formData, setFormData] = useState({
    jobId: '',
    clientId: '',
    siteId: '',
    paymentDate: '',
    amount: '',
    hasRefund: false,
    refundFromSite: '',
    refundDate: '',
    refundAmount: ''
  });
  
  const [jobs, setJobs] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
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
        
        // If editing, fetch site expense data
        if (isEditing) {
          const expenseResponse = await fetch(`http://localhost:5000/api/site-expenses/${id}`);
          if (!expenseResponse.ok) throw new Error('Failed to fetch site expense');
          const expenseData = await expenseResponse.json();
          
          setFormData({
            jobId: expenseData.jobId,
            clientId: expenseData.clientId,
            siteId: expenseData.siteId,
            paymentDate: new Date(expenseData.paymentDate).toISOString().split('T')[0],
            amount: expenseData.amount,
            hasRefund: !!expenseData.refund,
            refundFromSite: expenseData.refund?.refundFromSite || '',
            refundDate: expenseData.refund?.refundDate 
              ? new Date(expenseData.refund.refundDate).toISOString().split('T')[0] 
              : '',
            refundAmount: expenseData.refund?.amount || ''
          });
        } else {
          // Set default payment date to today for new entries
          setFormData(prev => ({
            ...prev,
            paymentDate: new Date().toISOString().split('T')[0]
          }));
        }
      } catch (err) {
        setError(err.message || 'An error occurred while loading data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, isEditing]);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleJobChange = (e) => {
    const selectedJobId = parseInt(e.target.value);
    const selectedJob = jobs.find(job => job.id === selectedJobId);
    
    if (selectedJob) {
      setFormData(prev => ({
        ...prev,
        jobId: selectedJobId,
        clientId: selectedJob.clientId,
        // Auto-fill the siteId with the site from the selected job
        siteId: selectedJob.site || ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        jobId: '',
        clientId: '',
        siteId: ''
      }));
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const url = isEditing 
        ? `http://localhost:5000/api/site-expenses/${id}`
        : 'http://localhost:5000/api/site-expenses';
      
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save site expense');
      }
      
      navigate('/site-expenses');
    } catch (err) {
      setError(err.message || 'An error occurred while saving');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading && !formData.jobId) {
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
  
  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Link to="/site-expenses" className="mr-4">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold">
            {isEditing ? 'Edit Site Expense' : 'Add Site Expense'}
          </h1>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Job
              </label>
              <select
                name="jobId"
                value={formData.jobId}
                onChange={handleJobChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select a Job</option>
                {jobs.map(job => (
                  <option key={job.id} value={job.id}>
                    {job.jobNo} - {job.site}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Client
              </label>
              <select
                name="clientId"
                value={formData.clientId}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100"
                required
                disabled
              >
                <option value="">Select a Client</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Site ID
              </label>
              <input
                type="text"
                name="siteId"
                value={formData.siteId}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Auto-filled from job selection. You can modify if needed.
              </p>
            </div>
            
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Payment Date
              </label>
              <input
                type="date"
                name="paymentDate"
                value={formData.paymentDate}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Amount
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                step="0.01"
                min="0"
                required
              />
            </div>
          </div>
          
          <div className="mt-6">
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="hasRefund"
                name="hasRefund"
                checked={formData.hasRefund}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="hasRefund" className="ml-2 block text-gray-700 font-semibold">
                Has Refund
              </label>
            </div>
            
            {formData.hasRefund && (
              <div className="bg-gray-50 p-4 rounded-md mt-2">
                <h3 className="text-lg font-semibold mb-4">Refund Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Refund From Site
                    </label>
                    <input
                      type="text"
                      name="refundFromSite"
                      value={formData.refundFromSite}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Refund Date
                    </label>
                    <input
                      type="date"
                      name="refundDate"
                      value={formData.refundDate}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Refund Amount
                    </label>
                    <input
                      type="number"
                      name="refundAmount"
                      value={formData.refundAmount}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-8 flex justify-end">
            <button
              type="button"
              onClick={() => navigate('/site-expenses')}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md mr-2 hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SiteExpenseForm;