import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Menu, X, ChevronDown } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [expensesDropdownOpen, setExpensesDropdownOpen] = useState(false);
  const [contractorDropdownOpen, setContractorDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleExpensesDropdown = () => {
    setExpensesDropdownOpen(!expensesDropdownOpen);
  };

  const toggleContractorDropdown = () => {
    setContractorDropdownOpen(!contractorDropdownOpen);
  };

  return (
    <nav className="bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold">
              Expense Management
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/" className="px-3 py-2 rounded hover:bg-white/10 transition-colors">
              Home
            </Link>
            <Link to="/jobs" className="px-3 py-2 rounded hover:bg-white/10 transition-colors">
              Jobs
            </Link>
            <Link to="/clients" className="px-3 py-2 rounded hover:bg-white/10 transition-colors">
              Clients
            </Link>
            <Link to="/companies" className="px-3 py-2 rounded hover:bg-white/10 transition-colors">
              Companies
            </Link>
            <Link to="/contractors/new" className="px-3 py-2 rounded hover:bg-white/10 transition-colors">
              Contractor/Suppliers
            </Link>
            
            {/* Expenses Dropdown */}
            <div className="relative">
              <button 
                className="px-3 py-2 rounded hover:bg-white/10 transition-colors flex items-center"
                onClick={toggleExpensesDropdown}
              >
                Client
                <ChevronDown className="h-4 w-4 ml-1" />
              </button>
              
              
              {expensesDropdownOpen && (
                <div className="absolute z-10 mt-2 w-48 bg-white rounded-md shadow-lg py-1 text-gray-700">
                  <Link 
                    to="/expenses/bills" 
                    className="block px-4 py-2 hover:bg-gray-100"
                    onClick={() => setExpensesDropdownOpen(false)}
                  >
                    Client Bills
                  </Link>
                  <Link 
                    to="/expenses/bills/new" 
                    className="block px-4 py-2 hover:bg-gray-100"
                    onClick={() => setExpensesDropdownOpen(false)}
                  >
                    New Bill Entry
                  </Link>
                  <Link 
                    to="/payments/receipts/new" 
                    className="block px-4 py-2 hover:bg-gray-100"
                    onClick={() => setExpensesDropdownOpen(false)}
                  >
                    Payment Receipts
                  </Link>
                </div>
              )}
            </div>
            
            {/* Contractor Dropdown */}
            <div className="relative">
              <button 
                className="px-3 py-2 rounded hover:bg-white/10 transition-colors flex items-center"
                onClick={toggleContractorDropdown}
              >
                Contractor
                <ChevronDown className="h-4 w-4 ml-1" />
              </button>
              
              {contractorDropdownOpen && (
                <div className="absolute z-10 mt-2 w-48 bg-white rounded-md shadow-lg py-1 text-gray-700">
                  <Link 
                    to="/contractor-bills" 
                    className="block px-4 py-2 hover:bg-gray-100"
                    onClick={() => setContractorDropdownOpen(false)}
                  >
                    Contractor Bills
                  </Link>
                  <Link 
                    to="/contractor-bills/new" 
                    className="block px-4 py-2 hover:bg-gray-100"
                    onClick={() => setContractorDropdownOpen(false)}
                  >
                    New Bill Entry
                  </Link>
                  <Link 
                    to="/contractor-payments" 
                    className="block px-4 py-2 hover:bg-gray-100"
                    onClick={() => setContractorDropdownOpen(false)}
                  >
                    Payments
                  </Link>
                  <Link 
                    to="/contractor-payments/new" 
                    className="block px-4 py-2 hover:bg-gray-100"
                    onClick={() => setContractorDropdownOpen(false)}
                  >
                    New Payment
                  </Link>
                </div>
              )}
            </div>
            
            {user && (
              <div className="flex items-center space-x-4">
                <Link to="/profile" className="px-3 py-2 rounded hover:bg-white/10 transition-colors">
                  {user.name || 'Profile'}
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 rounded bg-white/10 hover:bg-white/20 transition-colors"
                >
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="p-2 rounded-md hover:bg-white/10 transition-colors"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4">
            <div className="flex flex-col space-y-2">
              <Link to="/" className="px-3 py-2 rounded hover:bg-white/10 transition-colors">
                Home
              </Link>
              <Link to="/jobs" className="px-3 py-2 rounded hover:bg-white/10 transition-colors">
                Jobs
              </Link>
              <Link to="/clients" className="px-3 py-2 rounded hover:bg-white/10 transition-colors">
                Clients
              </Link>
              <Link to="/companies" className="px-3 py-2 rounded hover:bg-white/10 transition-colors">
                Companies
              </Link>
              <Link to="/contractors/new" className="px-3 py-2 rounded hover:bg-white/10 transition-colors">
                Contractor
              </Link>
              
              {/* Mobile Expenses Menu */}
              <div>
                <button
                  className="w-full text-left px-3 py-2 rounded hover:bg-white/10 transition-colors flex items-center justify-between"
                  onClick={() => setExpensesDropdownOpen(!expensesDropdownOpen)}
                >
                  <span>Client</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${expensesDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {expensesDropdownOpen && (
                  <div className="pl-4 mt-1 border-l-2 border-white/20 ml-3">
                    <Link
                      to="/expenses/bills"
                      className="block px-3 py-2 rounded hover:bg-white/10 transition-colors"
                      onClick={toggleMenu}
                    >
                      Client Bills
                    </Link>
                    <Link
                      to="/expenses/bills/new"
                      className="block px-3 py-2 rounded hover:bg-white/10 transition-colors"
                      onClick={toggleMenu}
                    >
                      New Bill Entry
                    </Link>
                    <Link
                      to="/payments/receipts/new"
                      className="block px-3 py-2 rounded hover:bg-white/10 transition-colors"
                      onClick={toggleMenu}
                    >
                      Payment Receipts
                    </Link>
                  </div>
                )}
              </div>
              
              {/* Mobile Contractor Menu */}
              <div>
                <button
                  className="w-full text-left px-3 py-2 rounded hover:bg-white/10 transition-colors flex items-center justify-between"
                  onClick={() => setContractorDropdownOpen(!contractorDropdownOpen)}
                >
                  <span>Contractor</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${contractorDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {contractorDropdownOpen && (
                  <div className="pl-4 mt-1 border-l-2 border-white/20 ml-3">
                    <Link
                      to="/contractor-bills"
                      className="block px-3 py-2 rounded hover:bg-white/10 transition-colors"
                      onClick={toggleMenu}
                    >
                      Contractor Bills
                    </Link>
                    <Link
                      to="/contractor-bills/new"
                      className="block px-3 py-2 rounded hover:bg-white/10 transition-colors"
                      onClick={toggleMenu}
                    >
                      New Bill Entry
                    </Link>
                    <Link
                      to="/contractor-payments"
                      className="block px-3 py-2 rounded hover:bg-white/10 transition-colors"
                      onClick={toggleMenu}
                    >
                      Payments
                    </Link>
                    <Link
                      to="/contractor-payments/new"
                      className="block px-3 py-2 rounded hover:bg-white/10 transition-colors"
                      onClick={toggleMenu}
                    >
                      New Payment
                    </Link>
                  </div>
                )}
              </div>
              
              {user && (
                <>
                  <Link
                    to="/profile"
                    className="px-3 py-2 rounded hover:bg-white/10 transition-colors"
                    onClick={toggleMenu}
                  >
                    {user.name || 'Profile'}
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      toggleMenu();
                    }}
                    className="px-3 py-2 rounded bg-white/10 hover:bg-white/20 transition-colors text-left"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;