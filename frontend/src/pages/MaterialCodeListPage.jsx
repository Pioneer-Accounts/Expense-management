import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash, Search } from 'lucide-react';
import Navbar from '../components/Navbar';

const MaterialCodeListPage = () => {
  const [materialCodes, setMaterialCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    const fetchMaterialCodes = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/material-codes');
        if (!response.ok) throw new Error('Failed to fetch material codes');
        const data = await response.json();
        setMaterialCodes(data);
      } catch (err) {
        setError(err.message || 'An error occurred while loading data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMaterialCodes();
  }, []);
  
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this material code?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/material-codes/${id}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete material code');
        }
        
        // Remove the deleted material code from the state
        setMaterialCodes(materialCodes.filter(code => code.id !== id));
      } catch (err) {
        setError(err.message || 'An error occurred while deleting the material code');
        console.error(err);
      }
    }
  };
  
  const filteredMaterialCodes = materialCodes.filter(code => {
    const codeText = code.code.toLowerCase();
    const description = code.description.toLowerCase();
    const search = searchTerm.toLowerCase();
    
    return codeText.includes(search) || description.includes(search);
  });
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Material Codes</h1>
          <Link 
            to="/material-codes/new" 
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 flex items-center"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add New Material Code
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
                  placeholder="Search material codes..."
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
              <p className="mt-2 text-gray-500">Loading material codes...</p>
            </div>
          ) : filteredMaterialCodes.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">No material codes found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-6 py-3 text-left">Code</th>
                    <th className="px-6 py-3 text-left">Description</th>
                    <th className="px-6 py-3 text-left">Unit</th>
                    <th className="px-6 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredMaterialCodes.map(code => (
                    <tr key={code.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap font-medium">{code.code}</td>
                      <td className="px-6 py-4">{code.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{code.unit || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex justify-center space-x-2">
                          <Link 
                            to={`/material-codes/${code.id}/edit`}
                            className="p-1 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded"
                          >
                            <Edit className="h-5 w-5" />
                          </Link>
                          <button 
                            onClick={() => handleDelete(code.id)}
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

export default MaterialCodeListPage;