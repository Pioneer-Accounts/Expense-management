import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="bg-gradient-to-r from-sky-400 to-sky-600 shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="text-white text-xl font-bold">
              Expense Management
            </Link>
          </div>
          
          <div className="hidden md:block">
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-white hover:bg-sky-700 px-3 py-2 rounded-md">
                Dashboard
              </Link>
              <Link to="/jobs" className="text-white hover:bg-sky-700 px-3 py-2 rounded-md">
                Jobs
              </Link>
              <Link to="/clients" className="text-white hover:bg-sky-700 px-3 py-2 rounded-md">
                Clients
              </Link>
              <Link to="/companies" className="text-white hover:bg-sky-700 px-3 py-2 rounded-md">
                Companies
              </Link>
              <Link to="/contractors" className="text-white hover:bg-sky-700 px-3 py-2 rounded-md">
                Contractors
              </Link>
              <Link to="/expenses" className="text-white hover:bg-sky-700 px-3 py-2 rounded-md">
                Expenses
              </Link>
            </div>
          </div>
          
          <div className="hidden md:block">
            <div className="flex items-center space-x-2">
              {user && (
                <>
                  <Link to="/profile" className="text-white hover:bg-sky-700 px-3 py-2 rounded-md">
                    {user.name || 'Profile'}
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="bg-white text-sky-600 hover:bg-gray-100 px-3 py-2 rounded-md"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
          
          <div className="md:hidden">
            <button className="text-white hover:bg-sky-700 px-2 py-1 rounded-md">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;