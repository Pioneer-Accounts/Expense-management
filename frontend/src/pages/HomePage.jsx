import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';

const HomePage = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/companies');
        if (!response.ok) {
          throw new Error('Failed to fetch companies');
        }
        const data = await response.json();
        setCompanies(data);
        
        // If no companies exist, redirect to company creation
        if (data.length === 0) {
          navigate('/companies/new');
        }
      } catch (error) {
        console.error('Error fetching companies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      
      <div className="flex-1 container mx-auto px-4 py-8">
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-sky-500/10 to-indigo-600/10 pb-4">
            <CardTitle className="text-2xl font-bold">Welcome to Expense Management System</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Core Management Cards */}
              <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow card-hover">
                <h3 className="text-lg font-semibold mb-2">Jobs</h3>
                <p className="text-gray-600 mb-4">Manage your jobs and work orders</p>
                <Button 
                  onClick={() => navigate('/jobs')}
                  className="w-full bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700"
                >
                  View Jobs
                </Button>
              </div>
              
              <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow card-hover">
                <h3 className="text-lg font-semibold mb-2">Clients</h3>
                <p className="text-gray-600 mb-4">Manage your client information</p>
                <Button 
                  onClick={() => navigate('/clients')}
                  className="w-full bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700"
                >
                  View Clients
                </Button>
              </div>
              
              <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow card-hover">
                <h3 className="text-lg font-semibold mb-2">Companies</h3>
                <p className="text-gray-600 mb-4">Manage your company information</p>
                <Button 
                  onClick={() => navigate('/companies')}
                  className="w-full bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700"
                >
                  View Companies
                </Button>
              </div>
              
              {/* Contractor Section */}
              <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow card-hover">
                <h3 className="text-lg font-semibold mb-2">Contractors & Suppliers</h3>
                <p className="text-gray-600 mb-4">Add and manage contractors and suppliers</p>
                <Button 
                  onClick={() => navigate('/contractors/new')}
                  className="w-full bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700"
                >
                  Add Contractor
                </Button>
              </div>
              
              <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow card-hover">
                <h3 className="text-lg font-semibold mb-2">Contractor Bills</h3>
                <p className="text-gray-600 mb-4">Manage bills from contractors</p>
                <div className="space-y-2">
                  <Button 
                    onClick={() => navigate('/contractor-bills')}
                    className="w-full bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700"
                  >
                    View Bills
                  </Button>
                  <Button 
                    onClick={() => navigate('/contractor-bills/new')}
                    className="w-full bg-white text-indigo-600 border border-indigo-600 hover:bg-indigo-50"
                  >
                    New Bill Entry
                  </Button>
                </div>
              </div>
              
              <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow card-hover">
                <h3 className="text-lg font-semibold mb-2">Contractor Payments</h3>
                <p className="text-gray-600 mb-4">Manage payments to contractors</p>
                <div className="space-y-2">
                  <Button 
                    onClick={() => navigate('/contractor-payments')}
                    className="w-full bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700"
                  >
                    View Payments
                  </Button>
                  <Button 
                    onClick={() => navigate('/contractor-payments/new')}
                    className="w-full bg-white text-indigo-600 border border-indigo-600 hover:bg-indigo-50"
                  >
                    New Payment
                  </Button>
                </div>
              </div>
              
              {/* Client Billing Section */}
              <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow card-hover">
                <h3 className="text-lg font-semibold mb-2">Client Bills</h3>
                <p className="text-gray-600 mb-4">Manage bills for clients</p>
                <div className="space-y-2">
                  <Button 
                    onClick={() => navigate('/expenses/bills')}
                    className="w-full bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700"
                  >
                    View Bills
                  </Button>
                  <Button 
                    onClick={() => navigate('/expenses/bills/new')}
                    className="w-full bg-white text-indigo-600 border border-indigo-600 hover:bg-indigo-50"
                  >
                    New Bill Entry
                  </Button>
                </div>
              </div>
              
              <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow card-hover">
                <h3 className="text-lg font-semibold mb-2">Payment Receipts</h3>
                <p className="text-gray-600 mb-4">Manage payment receipts from clients</p>
                <Button 
                  onClick={() => navigate('/payments/receipts/new')}
                  className="w-full bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700"
                >
                  New Receipt
                </Button>
              </div>
              
              {/* User Profile */}
              <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow card-hover">
                <h3 className="text-lg font-semibold mb-2">User Profile</h3>
                <p className="text-gray-600 mb-4">Manage your account settings</p>
                <Button 
                  onClick={() => navigate('/profile')}
                  className="w-full bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700"
                >
                  View Profile
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HomePage;