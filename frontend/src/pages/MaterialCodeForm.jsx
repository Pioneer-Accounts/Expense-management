import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Loader2 } from 'lucide-react';
import Navbar from '../components/Navbar';

const MaterialCodeForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    unit: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  
  useEffect(() => {
    if (id && id !== 'new') {
      setIsEditing(true);
      fetchMaterialCode(id);
    }
  }, [id]);
  
  const fetchMaterialCode = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/material-codes/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch material code');
      }
      const data = await response.json();
      setFormData({
        code: data.code,
        description: data.description,
        unit: data.unit || ''
      });
    } catch (err) {
      console.error('Error fetching material code:', err);
      setError('Failed to load material code. Please try again.');
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.code.trim() || !formData.description.trim()) {
      setError('Code and description are required');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const url = isEditing 
        ? `http://localhost:5000/api/material-codes/${id}`
        : 'http://localhost:5000/api/material-codes';
      
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save material code');
      }
      
      // If opened in a new tab, close it after successful save
      if (window.opener) {
        window.close();
        return;
      }
      
      // Otherwise redirect to material codes list
      navigate('/material-codes');
    } catch (err) {
      console.error('Error saving material code:', err);
      setError(err.message || 'An error occurred while saving the material code');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <div className="flex-1 container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>{isEditing ? 'Edit' : 'Add New'} Material Code</CardTitle>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-700 bg-red-100 rounded-md">
                  {error}
                </div>
              )}
              
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                  Code <span className="text-red-500">*</span>
                </label>
                <input
                  id="code"
                  name="code"
                  type="text"
                  value={formData.code}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <input
                  id="description"
                  name="description"
                  type="text"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-1">
                  Unit
                </label>
                <select
                  id="unit"
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a unit (optional)</option>
                  <option value="kg">Kilogram (kg)</option>
                  <option value="ton">Ton</option>
                  <option value="piece">Piece</option>
                  <option value="meter">Meter (m)</option>
                  <option value="liter">Liter (L)</option>
                  <option value="sqm">Square Meter (sqm)</option>
                  <option value="cum">Cubic Meter (cum)</option>
                  <option value="box">Box</option>
                  <option value="bag">Bag</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (window.opener) {
                    window.close();
                  } else {
                    navigate('/material-codes');
                  }
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                    Saving...
                  </span>
                ) : (
                  'Save'
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default MaterialCodeForm;