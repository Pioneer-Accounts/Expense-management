import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Eye, Trash, Search, Download } from 'lucide-react';
import Navbar from '../components/Navbar';

const ContractorBillsListPage = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [contractors, setContractors] = useState([]);
  const [jobs, setJobs] = useState([]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch bills
        const billsResponse = await fetch('http://localhost:5000/api/contractor-bills');
        if (!billsResponse.ok) throw new Error('Failed to fetch bills');
        const billsData = await billsResponse.json();
        setBills(billsData);
        
        // Fetch contractors
        const contractorsResponse = await fetch('http://localhost:5000/api/contractors');
        if (!contractorsResponse.ok) throw new Error('Failed to fetch contractors');
        const contractorsData = await contractorsResponse.json();
        setContractors(contractorsData);
        
        // Fetch jobs
        const jobsResponse = await fetch('http://localhost:5000/api/jobs');
        if (!jobsResponse.ok) throw new Error('Failed to fetch jobs');
        const jobsData = await jobsResponse.json();
        setJobs(jobsData);
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
    if (window.confirm('Are you sure you want to delete this bill?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/contractor-bills/${id}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete bill');
        }
        
        // Remove the deleted bill from the state
        setBills(bills.filter(bill => bill.id !== id));
      } catch (err) {
        setError(err.message || 'An error occurred while deleting the bill');
        console.error(err);
      }
    }
  };
  
  const getContractorName = (contractorId) => {
    const contractor = contractors.find(c => c.id.toString() === contractorId?.toString());
    return contractor ? contractor.name : 'Unknown';
  };
  
  const getJobName = (jobId) => {
    const job = jobs.find(j => j.id.toString() === jobId?.toString());
    return job ? job.name : 'Unknown';
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
  
  const filteredBills = bills.filter(bill => {
    const contractorName = getContractorName(bill.contractorSupplierId).toLowerCase();
    const jobName = getJobName(bill.jobId).toLowerCase();
    const billNo = bill.billNo?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    const materialInfo = (bill.materialCode || '') + ' ' + (bill.materialDescription || '');
    
    return contractorName.includes(search) || 
           jobName.includes(search) || 
           billNo.includes(search) ||
           materialInfo.toLowerCase().includes(search);
  });
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Contractor Bills</h1>
          <Link 
            to="/contractor-bills/new" 
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 flex items-center"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add New Bill
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
                  placeholder="Search bills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>
              
            </div>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-primary border-r-transparent"></div>
              <p className="mt-2 text-gray-500">Loading bills...</p>
            </div>
          ) : filteredBills.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">No bills found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-6 py-3 text-left">Bill No</th>
                    <th className="px-6 py-3 text-left">Contractor</th>
                    <th className="px-6 py-3 text-left">Job</th>
                    <th className="px-6 py-3 text-left">Date</th>
                    <th className="px-6 py-3 text-left">Material</th>
                    <th className="px-6 py-3 text-right">Amount</th>
                    <th className="px-6 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredBills.map(bill => (
                    <tr key={bill.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">{bill.billNo}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{getContractorName(bill.contractorSupplierId)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{getJobName(bill.jobId)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{formatDate(bill.date)}</td>
                      <td className="px-6 py-4">
                        {bill.materialCode ? (
                          <div>
                            <div className="font-medium">{bill.materialCode}</div>
                            <div className="text-sm text-gray-500">
                              {bill.materialDescription}
                              {bill.quantity && bill.unit && (
                                <span> ({bill.quantity} {bill.unit})</span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400">No material details</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        ₹{parseFloat(bill.baseAmount || 0) + parseFloat(bill.gst || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex justify-center space-x-2">
                          <Link 
                            to={`/contractor-bills/${bill.id}/view`}
                            className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                          >
                            <Eye className="h-5 w-5" />
                          </Link>
                          <Link 
                            to={`/contractor-bills/${bill.id}/edit`}
                            className="p-1 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded"
                          >
                            <Edit className="h-5 w-5" />
                          </Link>
                          <button 
                            onClick={() => handleDelete(bill.id)}
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

export default ContractorBillsListPage;