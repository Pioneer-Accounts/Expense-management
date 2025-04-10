import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Plus, Search, Filter, Edit, Eye } from 'lucide-react';
import Navbar from '../components/Navbar';

const SiteExpenseListPage = () => {
  const [siteExpenses, setSiteExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    jobNo: '',
    client: '',
    site: '',
    dateFrom: '',
    dateTo: ''
  });
  
  useEffect(() => {
    fetchSiteExpenses();
  }, []);
  
  const fetchSiteExpenses = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/site-expenses');
      if (!response.ok) throw new Error('Failed to fetch site expenses');
      const data = await response.json();
      setSiteExpenses(data);
      setFilteredExpenses(data);
    } catch (err) {
      setError(err.message || 'An error occurred while loading site expenses');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    applyFilters();
  }, [searchTerm, filters, siteExpenses]);
  
  // In the applyFilters function, remove the campOrName filter
  const applyFilters = () => {
    let result = [...siteExpenses];
    
    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(expense => 
        (expense.job?.jobNo && expense.job.jobNo.toLowerCase().includes(term)) ||
        (expense.client?.name && expense.client.name.toLowerCase().includes(term)) ||
        (expense.siteId && expense.siteId.toLowerCase().includes(term))
      );
    }
    
    // Apply filters
    if (filters.jobNo) {
      result = result.filter(expense => 
        expense.job?.jobNo && expense.job.jobNo.toLowerCase().includes(filters.jobNo.toLowerCase())
      );
    }
    
    if (filters.client) {
      result = result.filter(expense => 
        expense.client?.name && expense.client.name.toLowerCase().includes(filters.client.toLowerCase())
      );
    }
    
    if (filters.site) {
      result = result.filter(expense => 
        expense.siteId && expense.siteId.toLowerCase().includes(filters.site.toLowerCase())
      );
    }
    
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      result = result.filter(expense => {
        const expenseDate = new Date(expense.paymentDate);
        return expenseDate >= fromDate;
      });
    }
    
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999); // End of day
      result = result.filter(expense => {
        const expenseDate = new Date(expense.paymentDate);
        return expenseDate <= toDate;
      });
    }
    
    setFilteredExpenses(result);
  };
  
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const resetFilters = () => {
    setSearchTerm('');
    setFilters({
      jobNo: '',
      client: '',
      site: '',
      dateFrom: '',
      dateTo: ''
    });
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
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };
  
  // Calculate balance amount
  const calculateBalanceAmount = (expense) => {
    if (!expense) return 0;
    const refundAmount = expense.refund ? expense.refund.amount : 0;
    return expense.amount - refundAmount;
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
        {error && (
          <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg">
            {error}
          </div>
        )}
        
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Site Expenses</h1>
          <Link to="/site-expenses/new">
            <button className="bg-primary text-white px-4 py-2 rounded-md flex items-center hover:bg-primary/90">
              <Plus className="h-5 w-5 mr-1" />
              Add New Expense
            </button>
          </Link>
        </div>
        
        {/* Search and Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by job, client, site, or camp/name..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <button
              onClick={() => document.getElementById('filtersCollapse').classList.toggle('hidden')}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-md"
            >
              <Filter className="h-5 w-5 mr-1" />
              Filters
            </button>
          </div>
          
          <div id="filtersCollapse" className="hidden">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label htmlFor="jobNo" className="block text-sm font-medium text-gray-700 mb-1">
                  Job No
                </label>
                <input
                  type="text"
                  id="jobNo"
                  name="jobNo"
                  value={filters.jobNo}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label htmlFor="client" className="block text-sm font-medium text-gray-700 mb-1">
                  Client
                </label>
                <input
                  type="text"
                  id="client"
                  name="client"
                  value={filters.client}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label htmlFor="site" className="block text-sm font-medium text-gray-700 mb-1">
                  Site
                </label>
                <input
                  type="text"
                  id="site"
                  name="site"
                  value={filters.site}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label htmlFor="dateFrom" className="block text-sm font-medium text-gray-700 mb-1">
                  Date From
                </label>
                <input
                  type="date"
                  id="dateFrom"
                  name="dateFrom"
                  value={filters.dateFrom}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label htmlFor="dateTo" className="block text-sm font-medium text-gray-700 mb-1">
                  Date To
                </label>
                <input
                  type="date"
                  id="dateTo"
                  name="dateTo"
                  value={filters.dateTo}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={resetFilters}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>
        
        {/* Site Expenses Table */}
        {filteredExpenses.length > 0 ? (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Job No
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Site
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Refund
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Balance
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredExpenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {expense.job?.jobNo || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {expense.client?.name || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {expense.siteId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(expense.paymentDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(expense.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                        {expense.refund ? formatCurrency(expense.refund.amount) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                        {formatCurrency(calculateBalanceAmount(expense))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Link to={`/site-expenses/${expense.id}`}>
                            <button className="text-blue-600 hover:text-blue-900">
                              <Eye className="h-5 w-5" />
                            </button>
                          </Link>
                          <Link to={`/site-expenses/${expense.id}/edit`}>
                            <button className="text-blue-600 hover:text-blue-900">
                              <Edit className="h-5 w-5" />
                            </button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-500 mb-4">No site expenses found.</p>
            <Link to="/site-expenses/new">
              <button className="bg-primary text-white px-4 py-2 rounded-md flex items-center mx-auto hover:bg-primary/90">
                <Plus className="h-5 w-5 mr-1" />
                Add First Expense
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default SiteExpenseListPage;