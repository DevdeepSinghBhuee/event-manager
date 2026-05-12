import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert } from 'lucide-react';

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGoBack = () => {
    if (user) {
      navigate(`/${user.role}/dashboard`);
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
      <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6">
        <ShieldAlert className="w-12 h-12 text-red-600" />
      </div>
      <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Access Denied</h1>
      <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
        You don't have permission to access this page. If you believe this is a mistake, please contact support.
      </p>
      <button
        onClick={handleGoBack}
        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition-all hover:shadow-lg active:scale-95"
      >
        Return to Dashboard
      </button>
    </div>
  );
};

export default Unauthorized;
