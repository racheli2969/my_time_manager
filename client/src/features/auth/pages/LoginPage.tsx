/**
 * Login Page Component
 * Comprehensive authentication interface
 */

import React, { useState } from 'react';
import { apiService } from '../../../services/api';
import { X, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GoogleSignInButton } from '../components/GoogleSignInButton';

interface LoginPageProps {
  onLogin: (user: any) => void;
  onGuestMode: () => void;
}

/**
 * Authentication page supporting email/password, Google OAuth, and guest mode
 */
export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onGuestMode }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  /**
   * Handles email/password form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!formData.email || !formData.password) {
        throw new Error('Email and password are required');
      }
      
      if (!isLogin && !formData.name) {
        throw new Error('Name is required for registration');
      }

      let response;
      if (isLogin) {
        response = await apiService.login(formData.email, formData.password);
      } else {
        response = await apiService.register(
          formData.name,
          formData.email,
          formData.password
        );
      }

      if (!response || !response.user) {
        throw new Error('Invalid response from server');
      }

      if (response.user.id) {
        window.localStorage.setItem('currentUserId', response.user.id);
      }

      onLogin(response.user);
      navigate('/main');
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles successful Google authentication
   */
  const handleGoogleSuccess = (user: any) => {
    try {
      if (!user || !user.id) {
        throw new Error('Invalid user data received from Google authentication');
      }

      window.localStorage.setItem('currentUserId', user.id);
      onLogin(user);
      navigate('/main');
    } catch (err: any) {
      setError(err.message || 'Google authentication processing failed');
    }
  };

  /**
   * Handles Google authentication errors
   */
  const handleGoogleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  /**
   * Handles guest mode selection
   */
  const handleGuestMode = () => {
    navigate('/');
    onGuestMode();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen relative">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md relative">
        <button
          onClick={handleGuestMode}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition"
          aria-label="Enter as Guest"
        >
          <X className="w-6 h-6" />
        </button>
        <h2 className="text-3xl font-bold mb-6 text-center">
          {isLogin ? 'Sign In' : 'Sign Up'}
        </h2>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your full name"
                disabled={loading}
                minLength={2}
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email address"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your password"
                disabled={loading}
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Loading...' : isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="px-4 text-gray-500 text-sm">or</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        <GoogleSignInButton 
          onLogin={handleGoogleSuccess} 
          onError={handleGoogleError}
        />
        <p className="text-sm text-center mt-6">
          {isLogin ? (
            <span>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setIsLogin(false)}
                className="text-blue-600 hover:underline"
              >
                Sign Up
              </button>
            </span>
          ) : (
            <span>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setIsLogin(true)}
                className="text-blue-600 hover:underline"
              >
                Sign In
              </button>
            </span>
          )}
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
