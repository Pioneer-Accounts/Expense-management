import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Menu, X, ChevronDown, MapPin, Users, Briefcase } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [clientsDropdownOpen, setClientsDropdownOpen] = useState(false);
  const [contractorDropdownOpen, setContractorDropdownOpen] = useState(false);
  const [siteExpenseDropdownOpen, setSiteExpenseDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleClientsDropdown = () => {
    setClientsDropdownOpen(!clientsDropdownOpen);
  };

  const toggleContractorDropdown = () => {
    setContractorDropdownOpen(!contractorDropdownOpen);
  };

  const toggleSiteExpenseDropdown = () => {
    setSiteExpenseDropdownOpen(!siteExpenseDropdownOpen);
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
            <Link to="/jobs" className="px-3 py-2 rounded hover:bg-white/10 transition-colors">
              Jobs
            </Link>
            <Link to="/companies" className="px-3 py-2 rounded hover:bg-white/10 transition-colors">
              Companies
            </Link>
            
            {/* Clients Dropdown */}
            <div className="relative">
              <button 
                className="px-3 py-2 rounded hover:bg-white/10 transition-colors flex items-center"
                onClick={toggleClientsDropdown}
              >
                <Users className="h-4 w-4 mr-1" />
                Clients
                <ChevronDown className="h-4 w-4 ml-1" />
              </button>
              
              {clientsDropdownOpen && (
                <div className="absolute z-10 mt-2 w-48 bg-white rounded-md shadow-lg py-1 text-gray-700">
                  <Link 
                    to="/clients" 
                    className="block px-4 py-2 hover:bg-gray-100"
                    onClick={() => setClientsDropdownOpen(false)}
                  >
                    All Clients
                  </Link>
                  <Link 
                    to="/clients/new" 
                    className="block px-4 py-2 hover:bg-gray-100"
                    onClick={() => setClientsDropdownOpen(false)}
                  >
                    Add New Client
                  </Link>
                  <Link 
                    to="/expenses/bills" 
                    className="block px-4 py-2 hover:bg-gray-100"
                    onClick={() => setClientsDropdownOpen(false)}
                  >
                    Client Bills
                  </Link>
                  <Link 
                    to="/expenses/bills/new" 
                    className="block px-4 py-2 hover:bg-gray-100"
                    onClick={() => setClientsDropdownOpen(false)}
                  >
                    New Bill Entry
                  </Link>
                  <Link 
                    to="/payments/receipts/new" 
                    className="block px-4 py-2 hover:bg-gray-100"
                    onClick={() => setClientsDropdownOpen(false)}
                  >
                    Payment Receipts
                  </Link>

                  <Link 
                    to="/client-payment-status" 
                    className="block px-4 py-2 hover:bg-gray-100"
                    onClick={() => setClientsDropdownOpen(false)}
                  >
                    Client Payment Status
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
                <Briefcase className="h-4 w-4 mr-1" />
                Contractor
                <ChevronDown className="h-4 w-4 ml-1" />
              </button>
              
              {contractorDropdownOpen && (
                <div className="absolute z-10 mt-2 w-48 bg-white rounded-md shadow-lg py-1 text-gray-700">
                  <Link 
                    to="/contractors/new" 
                    className="block px-4 py-2 hover:bg-gray-100"
                    onClick={() => setContractorDropdownOpen(false)}
                  >
                    Add Contractor/Supplier
                  </Link>
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
            
            {/* Site Expense Dropdown */}
            <div className="relative">
              <button 
                className="px-3 py-2 rounded hover:bg-white/10 transition-colors flex items-center"
                onClick={toggleSiteExpenseDropdown}
              >
                <MapPin className="h-4 w-4 mr-1" />
                Site Expense
                <ChevronDown className="h-4 w-4 ml-1" />
              </button>
              
              {siteExpenseDropdownOpen && (
                <div className="absolute z-10 mt-2 w-48 bg-white rounded-md shadow-lg py-1 text-gray-700">
                  <Link 
                    to="/site-expenses" 
                    className="block px-4 py-2 hover:bg-gray-100"
                    onClick={() => setSiteExpenseDropdownOpen(false)}
                  >
                    All Site Expenses
                  </Link>
                  <Link 
                    to="/site-expenses/new" 
                    className="block px-4 py-2 hover:bg-gray-100"
                    onClick={() => setSiteExpenseDropdownOpen(false)}
                  >
                    New Site Expense
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
              <Link to="/jobs" className="px-3 py-2 rounded hover:bg-white/10 transition-colors">
                Jobs
              </Link>
              <Link to="/companies" className="px-3 py-2 rounded hover:bg-white/10 transition-colors">
                Companies
              </Link>
              
              {/* Mobile Clients Menu */}
              <div>
                <button
                  className="w-full text-left px-3 py-2 rounded hover:bg-white/10 transition-colors flex items-center justify-between"
                  onClick={() => setClientsDropdownOpen(!clientsDropdownOpen)}
                >
                  <span className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    Clients
                  </span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${clientsDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {clientsDropdownOpen && (
                  <div className="pl-4 mt-1 border-l-2 border-white/20 ml-3">
                    <Link
                      to="/clients"
                      className="block px-3 py-2 rounded hover:bg-white/10 transition-colors"
                      onClick={toggleMenu}
                    >
                      All Clients
                    </Link>
                    <Link
                      to="/clients/new"
                      className="block px-3 py-2 rounded hover:bg-white/10 transition-colors"
                      onClick={toggleMenu}
                    >
                      Add New Client
                    </Link>
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
                  <span className="flex items-center">
                    <Briefcase className="h-4 w-4 mr-1" />
                    Contractor
                  </span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${contractorDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {contractorDropdownOpen && (
                  <div className="pl-4 mt-1 border-l-2 border-white/20 ml-3">
                    <Link
                      to="/contractors/new"
                      className="block px-3 py-2 rounded hover:bg-white/10 transition-colors"
                      onClick={toggleMenu}
                    >
                      Add Contractor/Supplier
                    </Link>
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
              
              {/* Mobile Site Expense Menu */}
              <div>
                <button
                  className="w-full text-left px-3 py-2 rounded hover:bg-white/10 transition-colors flex items-center justify-between"
                  onClick={() => setSiteExpenseDropdownOpen(!siteExpenseDropdownOpen)}
                >
                  <span className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    Site Expense
                  </span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${siteExpenseDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {siteExpenseDropdownOpen && (
                  <div className="pl-4 mt-1 border-l-2 border-white/20 ml-3">
                    <Link
                      to="/site-expenses"
                      className="block px-3 py-2 rounded hover:bg-white/10 transition-colors"
                      onClick={toggleMenu}
                    >
                      All Site Expenses
                    </Link>
                    <Link
                      to="/site-expenses/new"
                      className="block px-3 py-2 rounded hover:bg-white/10 transition-colors"
                      onClick={toggleMenu}
                    >
                      New Site Expense
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