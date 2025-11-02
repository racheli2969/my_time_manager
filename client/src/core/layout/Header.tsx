/**
 * Header Component
 * Application header with search, notifications, and user menu
 */

import React, { useState } from 'react';
import { Bell, Search, User, LogOut, ChevronDown, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { LOCAL_STORAGE_CURRENT_USER_ID } from '../../utils/constants';

/**
 * Main application header
 * Displays app branding, search, notifications, and user menu
 */
export const Header: React.FC = () => {
  const { currentUser, logout } = useUser();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(LOCAL_STORAGE_CURRENT_USER_ID);
    }
    setShowUserMenu(false);
    navigate('/');
  };

  const handleLogin = () => {
    navigate('/');
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 sticky top-0 z-50">
      <div className="flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          <h1 className="text-lg sm:text-2xl font-bold text-gray-900">TaskManagement</h1>
        </div>
        
        {/* Right Section */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Search Bar - Hidden on small screens */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            <input
              type="text"
              placeholder="Search tasks..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-48 lg:w-64"
              style={{ caretColor: 'transparent' }}
            />
          </div>
          
          {/* Notifications */}
          <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          
          {/* User Menu */}
          <div className="relative ml-2 sm:ml-4 pl-2 sm:pl-4 border-l border-gray-300">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 hover:bg-gray-100 rounded-lg px-2 sm:px-3 py-2 transition-colors"
            >
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                  {currentUser ? currentUser.name : 'Guest'}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {currentUser ? currentUser.role : 'user'}
                </p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-500 hidden sm:block" />
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <button
                  onClick={currentUser ? handleLogout : handleLogin}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                >
                  {currentUser ? <LogOut className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
                  <span>{currentUser ? 'Sign Out' : 'Sign In'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
