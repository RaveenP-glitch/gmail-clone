import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  useEffect(() => {
    let isProcessing = false;
    
    const handleCallback = async () => {
      if (isProcessing) return;
      isProcessing = true;
      
      const token = searchParams.get('token');
      const error = searchParams.get('message');

      if (error) {
        toast.error(`Authentication failed: ${decodeURIComponent(error)}`);
        navigate('/login');
        return;
      }

      if (!token) {
        toast.error('No authentication token received');
        navigate('/login');
        return;
      }

      try {
        await login(token);
        toast.success('Successfully logged in!');
        navigate('/dashboard');
      } catch (error) {
        console.error('Login error:', error);
        toast.error('Failed to complete login. Please try again.');
        navigate('/login');
      }
    };

    handleCallback();
  }, [searchParams, login, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gmail-blue to-blue-600 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="xl" className="mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">
          Completing authentication...
        </h2>
        <p className="text-blue-100">
          Please wait while we set up your account
        </p>
      </div>
    </div>
  );
};

export default AuthCallbackPage; 