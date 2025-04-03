import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import Navbar from '../components/Navbar';
import DropdownWithAdd from '../components/DropdownWithAdd';

const JobForm = () => {
  const [formData, setFormData] = useState({
    jobNo: '',
    site: '',
    workOrderValue: '',
    clientId: '',
    companyId: '',
    userId: '1' // Assuming a default user ID for now
  });
  
  const [clients, setClients] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch clients
        const clientsResponse = await fetch('http://localhost:5000/api/clients');
        if (!clientsResponse.ok) throw new Error('Failed to fetch clients');
        const clientsData = await clientsResponse.json();
        setClients(clientsData);
        
        // Fetch companies
        const companiesResponse = await fetch('http://localhost:5000/api/companies');
        if (!companiesResponse.ok) throw new Error('Failed to fetch companies');
        const companiesData = await companiesResponse.json();
        setCompanies(companiesData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load required data. Please try again.');
      }
    };
    
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.jobNo.trim() || !formData.site.trim() || !formData.workOrderValue || 
        !formData.clientId || !formData.companyId) {
      setError('Please fill in all required fields');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:5000/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          workOrderValue: parseFloat(formData.workOrderValue)
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create job');
      }
      
      const data = await response.json();
      console.log('Job created:', data);
      
      // Redirect to jobs list
      navigate('/jobs');
    } catch (err) {
      console.error('Error creating job:', err);
      setError('Failed to create job. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      
      <div className="flex-1 container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto shadow-lg">
          <CardHeader className="bg-gradient-to-r from-sky-500/10 to-indigo-600/10 pb-4">
            <CardTitle className="text-2xl font-bold">Create New Job</CardTitle>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="pt-6">
              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error}
                </div>
              )}
              
              <div className="mb-4">
                <label htmlFor="jobNo" className="block text-sm font-medium text-gray-700 mb-1">
                  Job Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="jobNo"
                  name="jobNo"
                  value={formData.jobNo}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter job number"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="site" className="block text-sm font-medium text-gray-700 mb-1">
                  Site <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="site"
                  name="site"
                  value={formData.site}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter site location"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="workOrderValue" className="block text-sm font-medium text-gray-700 mb-1">
                  Work Order Value <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="workOrderValue"
                  name="workOrderValue"
                  value={formData.workOrderValue}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter work order value"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
              
              <DropdownWithAdd
                id="clientId"
                label="Client"
                value={formData.clientId}
                onChange={(e) => handleChange({ target: { name: 'clientId', value: e.target.value } })}
                options={clients}
                addPath="/clients/new"
                required={true}
                placeholder="Select a client"
              />
              
              <DropdownWithAdd
                id="companyId"
                label="Company"
                value={formData.companyId}
                onChange={(e) => handleChange({ target: { name: 'companyId', value: e.target.value } })}
                options={companies}
                addPath="/companies/new"
                required={true}
                placeholder="Select a company"
              />
            </CardContent>
            
            <CardFooter className="flex justify-end space-x-2 border-t pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/jobs')}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Create Job'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default JobForm;