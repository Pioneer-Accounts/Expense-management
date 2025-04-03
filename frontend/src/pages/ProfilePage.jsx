import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Building, Phone, MapPin, Calendar, Edit, Save, X } from 'lucide-react';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    company: user?.company || '',
    address: user?.address || '',
    joinDate: user?.joinDate || new Date().toISOString().split('T')[0]
  });
  const [error, setError] = useState('');

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // In a real app, you would call your API to update the user profile
      // const response = await fetch(`http://localhost:5000/api/users/${user.id}`, {
      //   method: 'PUT',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`
      //   },
      //   body: JSON.stringify(formData),
      // });
      
      // if (!response.ok) {
      //   throw new Error('Failed to update profile');
      // }
      
      // const updatedUser = await response.json();
      
      // For demo purposes, we'll just update the local storage
      const updatedUser = { ...user, ...formData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Exit edit mode
      setIsEditing(false);
      
      // Show success message or notification
      console.log('Profile updated successfully');
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
    }
  };

  const handleCancel = () => {
    // Reset form data to original user data
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      company: user?.company || '',
      address: user?.address || '',
      joinDate: user?.joinDate || new Date().toISOString().split('T')[0]
    });
    setIsEditing(false);
    setError('');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      
      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">My Profile</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Profile Card */}
            <Card className="md:col-span-1 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-sky-500/10 to-indigo-600/10 pb-4 text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                </div>
                <CardTitle className="text-xl">{user.name || 'User'}</CardTitle>
                <p className="text-sm text-muted-foreground">{user.email || 'user@example.com'}</p>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center text-sm">
                    <User className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>Account Type: </span>
                    <span className="ml-auto font-medium">User</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>Joined: </span>
                    <span className="ml-auto font-medium">{new Date(user.joinDate || Date.now()).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4 flex justify-between">
                <Button 
                  variant="outline" 
                  className="text-red-600 border-red-600 hover:bg-red-50"
                  onClick={logout}
                >
                  Sign Out
                </Button>
                <Button 
                  variant="outline"
                  className="text-sky-600 border-sky-600 hover:bg-sky-50"
                  onClick={() => setIsEditing(true)}
                  disabled={isEditing}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </CardFooter>
            </Card>
            
            {/* Profile Details */}
            <Card className="md:col-span-2 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-sky-500/10 to-indigo-600/10 pb-4">
                <CardTitle>Profile Details</CardTitle>
              </CardHeader>
              
              <form onSubmit={handleSubmit}>
                <CardContent className="pt-6">
                  {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                      {error}
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name
                        </label>
                        {isEditing ? (
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                              type="text"
                              id="name"
                              name="name"
                              value={formData.name}
                              onChange={handleChange}
                              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Enter your name"
                            />
                          </div>
                        ) : (
                          <div className="flex items-center p-2 border border-transparent">
                            <User className="h-4 w-4 mr-2 text-gray-400" />
                            <span>{user.name || 'Not specified'}</span>
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                          Email Address
                        </label>
                        {isEditing ? (
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                              type="email"
                              id="email"
                              name="email"
                              value={formData.email}
                              onChange={handleChange}
                              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Enter your email"
                            />
                          </div>
                        ) : (
                          <div className="flex items-center p-2 border border-transparent">
                            <Mail className="h-4 w-4 mr-2 text-gray-400" />
                            <span>{user.email || 'Not specified'}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number
                        </label>
                        {isEditing ? (
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                              type="tel"
                              id="phone"
                              name="phone"
                              value={formData.phone}
                              onChange={handleChange}
                              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Enter your phone number"
                            />
                          </div>
                        ) : (
                          <div className="flex items-center p-2 border border-transparent">
                            <Phone className="h-4 w-4 mr-2 text-gray-400" />
                            <span>{user.phone || 'Not specified'}</span>
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                          Company
                        </label>
                        {isEditing ? (
                          <div className="relative">
                            <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                              type="text"
                              id="company"
                              name="company"
                              value={formData.company}
                              onChange={handleChange}
                              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Enter your company"
                            />
                          </div>
                        ) : (
                          <div className="flex items-center p-2 border border-transparent">
                            <Building className="h-4 w-4 mr-2 text-gray-400" />
                            <span>{user.company || 'Not specified'}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                        Address
                      </label>
                      {isEditing ? (
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <textarea
                            id="address"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            rows="3"
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your address"
                          ></textarea>
                        </div>
                      ) : (
                        <div className="flex p-2 border border-transparent">
                          <MapPin className="h-4 w-4 mr-2 text-gray-400 mt-0.5" />
                          <span>{user.address || 'Not specified'}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
                
                {isEditing && (
                  <CardFooter className="border-t pt-4 flex justify-end space-x-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleCancel}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  </CardFooter>
                )}
              </form>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;