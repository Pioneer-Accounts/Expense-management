import React from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from './ui/button';

const DropdownWithAdd = ({ 
  id, 
  label, 
  value, 
  onChange, 
  options, 
  addPath, 
  required = false,
  placeholder = "Select an option" 
}) => {
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      </div>
      <div className="flex items-center space-x-2">
        <select
          id={id}
          value={value || ""}
          onChange={onChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required={required}
        >
          <option value="" disabled>{placeholder}</option>
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
        <Link to={addPath}>
          <Button 
            type="button" 
            variant="outline" 
            className="h-10 w-10 p-0 flex items-center justify-center border-blue-500 text-blue-500 hover:bg-blue-50"
          >
            <Plus className="h-5 w-5" />
            <span className="sr-only">Add new</span>
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default DropdownWithAdd;