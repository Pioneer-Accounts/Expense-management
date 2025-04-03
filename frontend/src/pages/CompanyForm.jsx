import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import Navbar from '../components/Navbar';

const CompanyForm = () => {
  const [companyName, setCompanyName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!companyName.trim()) {
      setError('Company name is required');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:5000/api/companies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: companyName }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create company');
      }
      
      const data = await response.json();
      console.log('Company created:', data);
      
      // Redirect to the previous page or home
      navigate(-1);
    } catch (err) {
      console.error('Error creating company:', err);
      setError('Failed to create company. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      
      <div className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="bg-gradient-to-r from-sky-500/10 to-indigo-600/10 pb-4">
            <CardTitle className="text-2xl font-bold text-center">Create New Company</CardTitle>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="pt-6">
              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error}
                </div>
              )}
              
              <div className="mb-4">
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  id="companyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter company name"
                  required
                />
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-end space-x-2 border-t pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate(-1)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Create Company'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default CompanyForm;