import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Eye, AlertCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';

const JobsListPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/jobs');
        if (!response.ok) {
          throw new Error('Failed to fetch jobs');
        }
        const data = await response.json();
        setJobs(data);
      } catch (err) {
        setError('Failed to load jobs');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchJobs();
  }, []);
  
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Jobs</h1>
          <Link to="/jobs/new">
            <Button className="bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700">
              <Plus className="h-4 w-4 mr-2" />
              Create New Job
            </Button>
          </Link>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 text-destructive rounded-md flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        
        <Card>
          <CardHeader className="bg-gradient-to-r from-sky-500/10 to-indigo-600/10 pb-4">
            <CardTitle>Job List</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Job No
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Site
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Work Order Value
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-muted-foreground">
                        No jobs found
                      </td>
                    </tr>
                  ) : (
                    jobs.map((job) => (
                      <tr key={job.id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          {job.jobNo}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {job.site}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {job.client?.name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {job.company?.name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                        ₹ {job.workOrderValue?.toFixed(2) || '0.00'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Link to={`/jobs/${job.id}`}>
                              <Button variant="outline" size="sm" className="h-8 px-2 text-sky-600 border-sky-600 hover:bg-sky-50">
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Button>
                            </Link>
                            <Link to={`/jobs/${job.id}/details`}>
                              <Button variant="outline" size="sm" className="h-8 px-2 text-indigo-600 border-indigo-600 hover:bg-indigo-50">
                                <Eye className="h-4 w-4" />
                                <span className="sr-only">View</span>
                              </Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default JobsListPage;