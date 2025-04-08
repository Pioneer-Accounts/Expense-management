import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, Save, Edit, Trash } from 'lucide-react';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import DropdownWithAdd from '../components/DropdownWithAdd';

const ContractorBillForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const [formData, setFormData] = useState({
    jobId: '',
    contractorSupplierId: '',
    materialCode: '',
    billDate: new Date().toISOString().split('T')[0],
    billNo: '',
    baseAmount: 0,
    gst: 0,
    totalAmount: 0,
    remarks: ''
  });
  
  const [jobs, setJobs] = useState([]);
  const [clients, setClients] = useState([]);
  const [contractors, setContractors] = useState([]);
  const [materialCodes, setMaterialCodes] = useState([]);
  
  const [selectedJob, setSelectedJob] = useState(null);
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Modal states for creating new items
  const [showContractorModal, setShowContractorModal] = useState(false);
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [newContractor, setNewContractor] = useState({ name: '', code: '', contactPerson: '', phone: '' });
  const [newMaterial, setNewMaterial] = useState({ code: '', description: '', unit: '' });
  
  useEffect(() => {
    const fetchData = async () => {
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
        
        // Fetch contractors
        const contractorsResponse = await fetch('http://localhost:5000/api/contractors');
        if (!contractorsResponse.ok) throw new Error('Failed to fetch contractors');
        const contractorsData = await contractorsResponse.json();
        setContractors(contractorsData);
        
        // Fetch material codes - Add this new API call
        const materialCodesResponse = await fetch('http://localhost:5000/api/material-codes');
        if (!materialCodesResponse.ok) throw new Error('Failed to fetch material codes');
        const materialCodesData = await materialCodesResponse.json();
        setMaterialCodes(materialCodesData);
        
        if (isEditMode) {
          // Fetch bill details if in edit mode
          const billResponse = await fetch(`http://localhost:5000/api/contractor-bills/${id}`);
          if (!billResponse.ok) throw new Error('Failed to fetch bill details');
          const billData = await billResponse.json();
          
          // Format the date
          const formattedDate = new Date(billData.billDate).toISOString().split('T')[0];
          
          setFormData({
            ...billData,
            billDate: formattedDate,
            totalAmount: billData.baseAmount + billData.gst
          });
          
          // Set selected job
          const job = jobsData.find(j => j.id === billData.jobId);
          setSelectedJob(job);
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
  
  const [jobError, setJobError] = useState('');
  const [jobLoading, setJobLoading] = useState(false);
  
  // Replace handleJobChange with handleJobIdChange
  // Fixing Job Not Found Error in ContractorBillForm
  
  const handleJobIdChange = async (e) => {
    const jobNo = e.target.value;
    setFormData(prev => ({
      ...prev,
      jobNo,
      jobId: '' // Clear jobId when jobNo changes
    }));
    
    if (!jobNo) {
      setSelectedJob(null);
      setJobError('');
      return;
    }
    
    setJobLoading(true);
    setJobError('');
    
    try {
      // Fetch job by jobNo instead of ID
      const response = await fetch(`http://localhost:5000/api/jobs?jobNo=${jobNo}`);
      
      if (!response.ok) {
        throw new Error('Job not found');
      }
      
      const jobsData = await response.json();
      
      // Check if any job was found with this jobNo
      if (jobsData.length === 0) {
        throw new Error('No job found with this number');
      }
      
      const jobData = jobsData[0]; // Take the first matching job
      setSelectedJob(jobData);
      
      // Set the jobId in formData
      setFormData(prev => ({
        ...prev,
        jobId: jobData.id
      }));
    } catch (err) {
      console.error('Error fetching job:', err);
      setJobError('Job not found with this number');
      setSelectedJob(null);
    } finally {
      setJobLoading(false);
    }
  };
  
  // Update getClientName function
  const getClientName = () => {
    if (!selectedJob) return 'Enter a valid job ID first';
    
    if (!selectedJob.clientId) return 'No client associated with this job';
    
    const client = clients.find(c => c.id.toString() === selectedJob.clientId.toString());
    return client ? client.name : 'Unknown client';
  };
  
  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value) || 0;
    
    if (name === 'baseAmount' || name === 'gst') {
      const baseAmount = name === 'baseAmount' ? numValue : formData.baseAmount;
      const gst = name === 'gst' ? numValue : formData.gst;
      const totalAmount = baseAmount + gst;
      
      setFormData(prev => ({
        ...prev,
        [name]: numValue,
        totalAmount
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: numValue
      }));
    }
  };
  
  // Add this function to handle material code selection
  const handleMaterialCodeChange = (e) => {
    const materialCodeId = e.target.value;
    setFormData(prev => ({
      ...prev,
      materialCode: materialCodeId
    }));
    
    // Find the selected material code and update related fields
    const selectedMaterial = materialCodes.find(code => code.id.toString() === materialCodeId.toString());
    if (selectedMaterial) {
      setFormData(prev => ({
        ...prev,
        materialDescription: selectedMaterial.description || '',
        unit: selectedMaterial.unit || prev.unit || ''
      }));
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    
    try {
      // Validate form
      if (!formData.jobId) throw new Error('Please select a job');
      if (!formData.contractorSupplierId) throw new Error('Please select a contractor/supplier');
      if (!formData.materialCode) throw new Error('Please select a material code');
      if (!formData.billDate) throw new Error('Please enter bill date');
      if (!formData.billNo) throw new Error('Please enter bill number');
      if (formData.baseAmount <= 0) throw new Error('Base amount must be greater than zero');
      
      const url = isEditMode 
        ? `http://localhost:5000/api/contractor-bills/${id}`
        : 'http://localhost:5000/api/contractor-bills';
      
      const method = isEditMode ? 'PUT' : 'POST';
      
      // Remove totalAmount as it's calculated on the server
      const { totalAmount, ...dataToSend } = formData;
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save bill');
      }
      
      navigate('/contractor-bills');
    } catch (err) {
      setError(err.message || 'An error occurred while saving the bill');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleDelete = async () => {
    if (!isEditMode) return;
    
    if (window.confirm('Are you sure you want to delete this bill?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/contractor-bills/${id}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete bill');
        }
        
        navigate('/contractor-bills');
      } catch (err) {
        setError(err.message || 'An error occurred while deleting the bill');
        console.error(err);
      }
    }
  };
  
  const handleCreateContractor = async (e) => {
    e.preventDefault();
    try {
      if (!newContractor.name || !newContractor.code) {
        throw new Error('Name and code are required');
      }
      
      const response = await fetch('http://localhost:5000/api/contractors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newContractor)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create contractor');
      }
      
      const createdContractor = await response.json();
      setContractors([...contractors, createdContractor]);
      setFormData(prev => ({
        ...prev,
        contractorSupplierId: createdContractor.id
      }));
      setShowContractorModal(false);
      setNewContractor({ name: '', code: '', contactPerson: '', phone: '' });
    } catch (err) {
      alert(err.message || 'Failed to create contractor');
    }
  };
  
  const handleCreateMaterial = async (e) => {
    e.preventDefault();
    try {
      if (!newMaterial.code || !newMaterial.name) {
        throw new Error('Code and name are required');
      }
      
      // In a real app, you would save this to the backend
      // For now, we'll just add it to the local state
      const newMaterialWithId = {
        id: newMaterial.code,
        ...newMaterial
      };
      
      setMaterialCodes([...materialCodes, newMaterialWithId]);
      setFormData(prev => ({
        ...prev,
        materialCode: newMaterialWithId.id
      }));
      setShowMaterialModal(false);
      setNewMaterial({ code: '', description: '', unit: '' });
    } catch (err) {
      alert(err.message || 'Failed to create material code');
    }
  };
  
  // const getClientName = (jobId) => {
  //   if (!jobId || !jobs.length) return 'Select a job first';
    
  //   const job = jobs.find(j => j.id.toString() === jobId.toString());
  //   if (!job || !job.clientId) return 'Unknown client';
    
  //   const client = clients.find(c => c.id.toString() === job.clientId.toString());
  //   return client ? client.name : 'Unknown client';
  // };
  
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
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            {isEditMode ? 'Edit Contractor Bill' : 'Add New Contractor Bill'}
          </h1>
          
          {error && (
            <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg">
              {error}
            </div>
          )}
          
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="bg-muted/50 px-6 py-4 border-b">
              <h2 className="text-lg font-medium">Bill Information</h2>
            </div>
            <div className="p-6">
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  {/* Job and Client Section - Modified to use text input */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="jobId" className="block text-sm font-medium">
                        Job ID <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          id="jobNo"
                          name="jobNo"
                          type="text"
                          value={formData.jobNo || ''}
                          onChange={handleJobIdChange}
                          className="w-full rounded-md border border-gray-300 px-3 py-2"
                          required
                          placeholder="Enter job number"
                        />
                        {jobLoading && (
                          <div className="absolute right-3 top-2">
                            <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                          </div>
                        )}
                      </div>
                      {jobError && (
                        <p className="text-sm text-red-600 mt-1">{jobError}</p>
                      )}
                      {selectedJob && !jobError && (
                        <p className="text-sm text-green-600 mt-1">
                          Job found: {selectedJob.name || selectedJob.jobNo || `Job #${selectedJob.id}`}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-medium">
                        Client
                      </label>
                      <input
                        type="text"
                        value={getClientName()}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-100"
                        readOnly
                      />
                    </div>
                  </div>
                  
                  {/* Contractor and Material Code Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="contractorSupplierId" className="block text-sm font-medium">
                        Contractor/Supplier <span className="text-red-500">*</span>
                      </label>
                      <div className="flex space-x-2">
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
                        <button
                          type="button"
                          onClick={() => setShowContractorModal(true)}
                          className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                        >
                          <Plus className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="materialCode" className="block text-sm font-medium">
                        Material Code <span className="text-red-500">*</span>
                      </label>
                      <div className="flex space-x-2">
                        <select
                          id="materialCode"
                          name="materialCode"
                          value={formData.materialCode || ""}
                          onChange={handleMaterialCodeChange}
                          className="w-full rounded-md border border-gray-300 px-3 py-2"
                          required
                        >
                          <option value="">Select material code</option>
                          {materialCodes.map(code => (
                            <option key={code.id} value={code.id}>
                              {code.code} - {code.description}
                            </option>
                          ))}
                        </select>
                        <Link to="/material-codes/new" >
                          <button
                            type="button"
                            className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                          >
                            <Plus className="h-5 w-5" />
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                  
                  {/* Bill Details Section */}
                  <div>
                    <h3 className="text-md font-medium mb-4 border-b pb-2">Bill Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label htmlFor="billDate" className="block text-sm font-medium">
                          Bill Date <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="billDate"
                          name="billDate"
                          type="date"
                          value={formData.billDate}
                          onChange={handleChange}
                          className="w-full rounded-md border border-gray-300 px-3 py-2"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="billNo" className="block text-sm font-medium">
                          Bill No <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="billNo"
                          name="billNo"
                          value={formData.billNo}
                          onChange={handleChange}
                          className="w-full rounded-md border border-gray-300 px-3 py-2"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="baseAmount" className="block text-sm font-medium">
                          Base Amount <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="baseAmount"
                          name="baseAmount"
                          type="number"
                          step="0.01"
                          value={formData.baseAmount}
                          onChange={handleNumberChange}
                          className="w-full rounded-md border border-gray-300 px-3 py-2"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="gst" className="block text-sm font-medium">
                          GST
                        </label>
                        <input
                          id="gst"
                          name="gst"
                          type="number"
                          step="0.01"
                          value={formData.gst}
                          onChange={handleNumberChange}
                          className="w-full rounded-md border border-gray-300 px-3 py-2"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="totalAmount" className="block text-sm font-medium">
                          Total Amount
                        </label>
                        <input
                          id="totalAmount"
                          name="totalAmount"
                          type="number"
                          step="0.01"
                          value={formData.totalAmount}
                          readOnly
                          className="w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-100"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="remarks" className="block text-sm font-medium">
                          Remarks
                        </label>
                        <input
                          id="remarks"
                          name="remarks"
                          value={formData.remarks || ''}
                          onChange={handleChange}
                          className="w-full rounded-md border border-gray-300 px-3 py-2"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => navigate('/contractor-bills')}
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
                      className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50 flex items-center"
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
                              <Save  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"/>
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
      
      {/* Contractor Creation Modal */}
      {showContractorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Add New Contractor</h3>
            <form onSubmit={handleCreateContractor}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newContractor.name}
                    onChange={(e) => setNewContractor({...newContractor, name: e.target.value})}
                    className="w-full rounded-md border border-gray-300 px-3 py-2"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newContractor.code}
                    onChange={(e) => setNewContractor({...newContractor, code: e.target.value})}
                    className="w-full rounded-md border border-gray-300 px-3 py-2"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    value={newContractor.contactPerson}
                    onChange={(e) => setNewContractor({...newContractor, contactPerson: e.target.value})}
                    className="w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={newContractor.phone}
                    onChange={(e) => setNewContractor({...newContractor, phone: e.target.value})}
                    className="w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowContractorModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
                  >
                    Create
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Material Code Creation Modal */}
      {showMaterialModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Add New Material Code</h3>
            <form onSubmit={handleCreateMaterial}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newMaterial.code}
                    onChange={(e) => setNewMaterial({...newMaterial, code: e.target.value})}
                    className="w-full rounded-md border border-gray-300 px-3 py-2"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newMaterial.name}
                    onChange={(e) => setNewMaterial({...newMaterial, name: e.target.value})}
                    className="w-full rounded-md border border-gray-300 px-3 py-2"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={newMaterial.description}
                    onChange={(e) => setNewMaterial({...newMaterial, description: e.target.value})}
                    className="w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowMaterialModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
                  >
                    Create
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractorBillForm;
