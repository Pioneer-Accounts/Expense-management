import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, Save, Edit, Trash, Plus } from 'lucide-react';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';
import DropdownWithAdd from '../components/DropdownWithAdd';

const ContractorPaymentForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const [formData, setFormData] = useState({
    jobId: '',
    contractorSupplierId: '',
    contractorBillId: '',
    billNo: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMode: 'bank_transfer',
    chequeOrDdNo: '',
    baseAmount: 0,
    gst: 0,
    deductions: [
      { type: 'IT_TDS', amount: 0 },
      { type: 'GST_TDS', amount: 0 },
      { type: 'SD_RETENTION', amount: 0 },
      { type: 'OTHER', amount: 0 }
    ],
    // remarks: ''
  });
  
  const [jobs, setJobs] = useState([]);
  const [contractors, setContractors] = useState([]);
  const [contractorBills, setContractorBills] = useState([]);
  const [jobContractors, setJobContractors] = useState([]);
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const paymentModes = [
    { id: 'cash', name: 'Cash' },
    { id: 'cheque', name: 'Cheque' },
    { id: 'bank_transfer', name: 'NEFT/RTGS' },
    { id: 'upi', name: 'UPI' },
    { id: 'imps', name: 'IMPS' },
    { id: 'other', name: 'Other' }
  ];
  
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch jobs
        const jobsResponse = await fetch('http://localhost:5000/api/jobs');
        if (!jobsResponse.ok) throw new Error('Failed to fetch jobs');
        const jobsData = await jobsResponse.json();
        setJobs(jobsData);
        
        // Fetch all contractors
        const contractorsResponse = await fetch('http://localhost:5000/api/contractors');
        if (!contractorsResponse.ok) throw new Error('Failed to fetch contractors');
        const contractorsData = await contractorsResponse.json();
        setContractors(contractorsData);
        
        if (isEditMode) {
          await fetchPaymentDetails();
        }
      } catch (err) {
        setError(err.message || 'An error occurred while loading data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchInitialData();
  }, [id, isEditMode]);
  
  const fetchPaymentDetails = async () => {
    try {
      const paymentResponse = await fetch(`http://localhost:5000/api/contractor-payments/${id}`);
      if (!paymentResponse.ok) throw new Error('Failed to fetch payment details');
      const paymentData = await paymentResponse.json();
      
      // Format the date
      const formattedDate = new Date(paymentData.paymentDate).toISOString().split('T')[0];
      
      // Set form data from payment details
      setFormData({
        jobId: paymentData.jobId?.toString() || '',
        contractorSupplierId: paymentData.contractorSupplierId?.toString() || '',
        contractorBillId: paymentData.contractorBillId?.toString() || '',
        billNo: paymentData.billNo || '',
        paymentDate: formattedDate,
        paymentMode: paymentData.paymentMode || 'bank_transfer',
        chequeOrDdNo: paymentData.chequeOrDdNo || '',
        baseAmount: paymentData.baseAmount || 0,
        gst: paymentData.gst || 0,
        deductions: paymentData.deductions?.length 
          ? paymentData.deductions.map(d => ({ type: d.type, amount: d.amount }))
          : [
              { type: 'IT_TDS', amount: 0 },
              { type: 'GST_TDS', amount: 0 },
              { type: 'SD_RETENTION', amount: 0 },
              { type: 'OTHER', amount: 0 }
            ],
        // remarks: paymentData.remarks || ''
      });
      
      // Fetch job contractors if job is selected
      if (paymentData.jobId) {
        await fetchJobContractors(paymentData.jobId);
      }
      
      // Fetch contractor bills if contractor is selected
      if (paymentData.jobId && paymentData.contractorSupplierId) {
        await fetchContractorBills(paymentData.jobId, paymentData.contractorSupplierId);
      }
    } catch (err) {
      setError(err.message || 'An error occurred while loading payment details');
      console.error(err);
    }
  };
  
  const fetchJobContractors = async (jobId) => {
    try {
      // Fetch contractors who have bills for this job
      const response = await fetch(`http://localhost:5000/api/contractor-bills/job/${jobId}/contractors`);
      if (!response.ok) throw new Error('Failed to fetch job contractors');
      const data = await response.json();
      setJobContractors(data);
    } catch (err) {
      console.error('Error fetching job contractors:', err);
      setError('Failed to load contractors for this job');
    }
  };
  
  const fetchContractorBills = async (jobId, contractorId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/contractor-bills?jobId=${jobId}&contractorSupplierId=${contractorId}`);
      if (!response.ok) throw new Error('Failed to fetch contractor bills');
      const data = await response.json();
      
      // Sort bills by date (newest first)
      const sortedBills = data.sort((a, b) => new Date(b.date) - new Date(a.date));
      setContractorBills(sortedBills);
    } catch (err) {
      console.error('Error fetching contractor bills:', err);
      setError('Failed to load contractor bills');
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // If job changes, fetch contractors for that job
    if (name === 'jobId' && value) {
      fetchJobContractors(value);
      // Reset contractor and bill selection
      setFormData(prev => ({
        ...prev,
        contractorSupplierId: '',
        contractorBillId: '',
        billNo: ''
      }));
      setContractorBills([]);
    }
    
    // If contractor changes, fetch their bills for the selected job
    if (name === 'contractorSupplierId' && value && formData.jobId) {
      fetchContractorBills(formData.jobId, value);
      // Reset bill selection
      setFormData(prev => ({
        ...prev,
        contractorBillId: '',
        billNo: ''
      }));
    }
    
    // If bill changes, update bill number
    if (name === 'contractorBillId' && value) {
      const selectedBill = contractorBills.find(bill => bill.id.toString() === value);
      if (selectedBill) {
        setFormData(prev => ({
          ...prev,
          billNo: selectedBill.billNo,
          baseAmount: selectedBill.baseAmount || 0,
          gst: selectedBill.gst || 0
        }));
      }
    }
  };
  
  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value) || 0;
    
    setFormData(prev => ({
      ...prev,
      [name]: numValue
    }));
  };
  
  const handleDeductionChange = (index, value) => {
    const updatedDeductions = [...formData.deductions];
    updatedDeductions[index].amount = parseFloat(value) || 0;
    
    setFormData(prev => ({
      ...prev,
      deductions: updatedDeductions
    }));
  };
  
  const calculateTotalAmount = () => {
    return formData.baseAmount + formData.gst;
  };
  
  const calculateTotalDeductions = () => {
    return formData.deductions.reduce((total, deduction) => total + deduction.amount, 0);
  };
  
  const calculateNetAmount = () => {
    return calculateTotalAmount() - calculateTotalDeductions();
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    
    try {
      // Validate form
      if (!formData.jobId) throw new Error('Please select a job');
      if (!formData.contractorSupplierId) throw new Error('Please select a contractor');
      if (!formData.contractorBillId) throw new Error('Please select a bill');
      if (!formData.paymentDate) throw new Error('Please enter payment date');
      if (formData.baseAmount <= 0) throw new Error('Base amount must be greater than zero');
      
      // Prepare data for API
      const dataToSend = {
        jobId: parseInt(formData.jobId),
        contractorSupplierId: parseInt(formData.contractorSupplierId),
        contractorBillId: parseInt(formData.contractorBillId),
        billNo: formData.billNo,
        paymentDate: formData.paymentDate,
        paymentMode: formData.paymentMode,
        chequeOrDdNo: formData.chequeOrDdNo || null,
        baseAmount: parseFloat(formData.baseAmount),
        gst: parseFloat(formData.gst),
        deductions: formData.deductions
          .filter(d => d.amount > 0)
          .map(d => ({
            type: d.type,
            amount: parseFloat(d.amount)
          })),
        // remarks: formData.remarks || ''
      };
      
      const url = isEditMode 
        ? `http://localhost:5000/api/contractor-payments/${id}`
        : 'http://localhost:5000/api/contractor-payments';
      
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
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
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
                  {/* Job and Contractor Selection */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="jobId" className="block text-sm font-medium">
                        Job No <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="jobId"
                        name="jobId"
                        value={formData.jobId}
                        onChange={handleChange}
                        className="w-full rounded-md border border-gray-300 px-3 py-2"
                        required
                        disabled={isEditMode} // Disable changing job in edit mode
                      >
                        <option value="">Select a job</option>
                        {jobs.map(job => (
                          <option key={job.id} value={job.id}>
                            {job.jobNo} - {job.client.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
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
                          disabled={!formData.jobId || isEditMode} // Disable if no job selected or in edit mode
                        >
                          <option value="">Select a contractor</option>
                          {formData.jobId && jobContractors.length > 0 ? (
                            jobContractors.map(contractor => (
                              <option key={contractor.id} value={contractor.id}>
                                {contractor.name} ({contractor.code})
                              </option>
                            ))
                          ) : (
                            contractors.map(contractor => (
                              <option key={contractor.id} value={contractor.id}>
                                {contractor.name} ({contractor.code})
                              </option>
                            ))
                          )}
                        </select>
                        <Link to="/contractors/new">
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
                  
                  {/* Bill Selection */}
                  <div className="space-y-2">
                    <label htmlFor="contractorBillId" className="block text-sm font-medium">
                      Bill <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="contractorBillId"
                      name="contractorBillId"
                      value={formData.contractorBillId}
                      onChange={handleChange}
                      className="w-full rounded-md border border-gray-300 px-3 py-2"
                      required
                      disabled={!formData.contractorSupplierId || isEditMode} // Disable if no contractor selected or in edit mode
                    >
                      <option value="">Select a bill</option>
                      {contractorBills.map(bill => (
                        <option key={bill.id} value={bill.id}>
                          {bill.billNo} - ₹{bill.totalAmount?.toFixed(2) || (bill.baseAmount + bill.gst).toFixed(2)} ({new Date(bill.billDate).toLocaleDateString()})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Payment Details */}
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
                        {paymentModes.map(mode => (
                          <option key={mode.id} value={mode.id}>
                            {mode.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    {(formData.paymentMode === 'cheque' || formData.paymentMode === 'dd') && (
                      <div className="space-y-2">
                        <label htmlFor="chequeOrDdNo" className="block text-sm font-medium">
                          {formData.paymentMode === 'cheque' ? 'Cheque Number' : 'DD Number'} <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="chequeOrDdNo"
                          name="chequeOrDdNo"
                          type="text"
                          value={formData.chequeOrDdNo}
                          onChange={handleChange}
                          className="w-full rounded-md border border-gray-300 px-3 py-2"
                          required
                        />
                      </div>
                    )}
                  </div>
                  
                  {/* Amount Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        GST Amount
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
                  </div>
                  
                  {/* Deductions */}
                  <div className="space-y-4">
                    <h3 className="text-md font-medium border-b pb-2">Deductions</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label htmlFor="itTds" className="block text-sm font-medium">
                          Income Tax TDS
                        </label>
                        <input
                          id="itTds"
                          type="number"
                          step="0.01"
                          value={formData.deductions[0].amount}
                          onChange={(e) => handleDeductionChange(0, e.target.value)}
                          className="w-full rounded-md border border-gray-300 px-3 py-2"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="gstTds" className="block text-sm font-medium">
                          GST TDS
                        </label>
                        <input
                          id="gstTds"
                          type="number"
                          step="0.01"
                          value={formData.deductions[1].amount}
                          onChange={(e) => handleDeductionChange(1, e.target.value)}
                          className="w-full rounded-md border border-gray-300 px-3 py-2"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="retention" className="block text-sm font-medium">
                          Security Deposit / Retention
                        </label>
                        <input
                          id="retention"
                          type="number"
                          step="0.01"
                          value={formData.deductions[2].amount}
                          onChange={(e) => handleDeductionChange(2, e.target.value)}
                          className="w-full rounded-md border border-gray-300 px-3 py-2"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="otherDeduction" className="block text-sm font-medium">
                          Other Deductions
                        </label>
                        <input
                          id="otherDeduction"
                          type="number"
                          step="0.01"
                          value={formData.deductions[3].amount}
                          onChange={(e) => handleDeductionChange(3, e.target.value)}
                          className="w-full rounded-md border border-gray-300 px-3 py-2"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Remarks
                  <div className="space-y-2">
                    <label htmlFor="remarks" className="block text-sm font-medium">
                      Remarks
                    </label>
                    <textarea
                      id="remarks"
                      name="remarks"
                      value={formData.remarks}
                      onChange={handleChange}
                      rows="2"
                      className="w-full rounded-md border border-gray-300 px-3 py-2"
                    />
                  </div> */}
                  
                  {/* Summary */}
                  <div className="mt-6 p-4 bg-gray-50 rounded-md">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Total Amount:</span>
                        <span className="text-lg">₹ {calculateTotalAmount().toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Total Deductions:</span>
                        <span className="text-lg">₹ {calculateTotalDeductions().toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t">
                        <span className="font-bold">Net Amount:</span>
                        <span className="text-xl font-bold">₹ {calculateNetAmount().toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-4 border-t">
                    <button
                      type="button"
                      onClick={() => navigate('/contractor-payments')}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                      disabled={submitting}
                    >
                      Cancel
                    </button>
                    
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
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractorPaymentForm;