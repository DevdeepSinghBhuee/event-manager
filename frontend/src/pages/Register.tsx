import React, { useState } from 'react';
import { useForm, type FieldValues } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, User as UserIcon, Store, ShoppingBag } from 'lucide-react';
import { type AxiosError } from 'axios';
import axiosInstance from '../api/axiosInstance';

const Register: React.FC = () => {
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'customer' // default role
    }
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Custom hook usage instead of auto-navigation for simplicity if useAuth login handles it
  const navigateBackToLogin = () => {
    window.location.href = '/login'; // Or use react-router navigate
  };

  const selectedRole = watch('role');
  const currentPassword = watch('password');

  // Simple password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, color: 'bg-gray-200', text: '' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 2) return { score, color: 'bg-red-500', text: 'Weak' };
    if (score === 3 || score === 4) return { score, color: 'bg-yellow-500', text: 'Medium' };
    return { score, color: 'bg-green-500', text: 'Strong' };
  };

  const strength = getPasswordStrength(currentPassword);

  const onSubmit = async (data: FieldValues) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      // Assuming register endpoint
      await axiosInstance.post('/api/auth/register', {
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role
      });
      // After successful registration, redirect to login or handle session
      navigateBackToLogin();
    } catch (err: unknown) {
      console.error(err);
      const error = err as AxiosError<{ message: string }>;
      setErrorMessage(
        error.response?.data?.message || 
        'Registration failed. Please try again.'
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center -mt-4 py-8 relative overflow-hidden">
      {/* Decorative Background Elements matching Login */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-violet-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-fuchsia-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>

      <div className="w-full max-w-xl p-8 bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/40 z-10">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-indigo-600/30 transform transition-transform hover:scale-110">
            <UserIcon className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Create an Account</h2>
          <p className="text-gray-500 mt-2 text-sm">Join EventManager and start your journey</p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 font-medium">{errorMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Role Selector Cards */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">I want to join as a:</label>
            <div className="grid grid-cols-2 gap-4">
              <div 
                onClick={() => setValue('role', 'customer')}
                className={`cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center justify-center gap-2 transition-all ${selectedRole === 'customer' ? 'border-indigo-600 bg-indigo-50/50 shadow-md' : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'}`}
              >
                <div className={`p-3 rounded-full ${selectedRole === 'customer' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <p className={`font-bold ${selectedRole === 'customer' ? 'text-indigo-900' : 'text-gray-700'}`}>Customer</p>
                  <p className="text-xs text-gray-500 mt-1">Book & attend events</p>
                </div>
              </div>

              <div 
                onClick={() => setValue('role', 'vendor')}
                className={`cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center justify-center gap-2 transition-all ${selectedRole === 'vendor' ? 'border-violet-600 bg-violet-50/50 shadow-md' : 'border-gray-200 hover:border-violet-300 hover:bg-gray-50'}`}
              >
                <div className={`p-3 rounded-full ${selectedRole === 'vendor' ? 'bg-violet-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                  <Store className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <p className={`font-bold ${selectedRole === 'vendor' ? 'text-violet-900' : 'text-gray-700'}`}>Vendor</p>
                  <p className="text-xs text-gray-500 mt-1">Host & manage events</p>
                </div>
              </div>
            </div>
            {/* Hidden input to register the role field */}
            <input type="hidden" {...register('role', { required: 'Please select a role' })} />
            {errors.role && <p className="mt-2 text-sm text-red-600">{errors.role.message as string}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <input
                  {...register('name', { 
                    required: 'Name is required',
                    minLength: { value: 2, message: 'Must be at least 2 characters' }
                  })}
                  type="text"
                  disabled={isLoading}
                  className={`block w-full pl-10 pr-3 py-3 border ${errors.name ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-200 focus:ring-indigo-500 focus:border-indigo-500'} rounded-xl bg-gray-50/50 focus:bg-white text-gray-900 text-sm transition-all duration-200 shadow-sm`}
                  placeholder="John Doe"
                />
              </div>
              {errors.name && <p className="mt-1.5 text-sm text-red-600">{errors.name.message as string}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <input
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  type="email"
                  disabled={isLoading}
                  className={`block w-full pl-10 pr-3 py-3 border ${errors.email ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-200 focus:ring-indigo-500 focus:border-indigo-500'} rounded-xl bg-gray-50/50 focus:bg-white text-gray-900 text-sm transition-all duration-200 shadow-sm`}
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && <p className="mt-1.5 text-sm text-red-600">{errors.email.message as string}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <input
                  {...register('password', { 
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Must be at least 6 characters' }
                  })}
                  type={showPassword ? 'text' : 'password'}
                  disabled={isLoading}
                  className={`block w-full pl-10 pr-10 py-3 border ${errors.password ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-200 focus:ring-indigo-500 focus:border-indigo-500'} rounded-xl bg-gray-50/50 focus:bg-white text-gray-900 text-sm transition-all duration-200 shadow-sm`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {currentPassword && (
                <div className="mt-2">
                  <div className="flex gap-1 h-1.5 w-full rounded-full overflow-hidden bg-gray-100">
                    <div className={`h-full ${strength.score >= 1 ? strength.color : 'bg-transparent'} transition-all w-1/4`}></div>
                    <div className={`h-full ${strength.score >= 2 ? strength.color : 'bg-transparent'} transition-all w-1/4`}></div>
                    <div className={`h-full ${strength.score >= 3 ? strength.color : 'bg-transparent'} transition-all w-1/4`}></div>
                    <div className={`h-full ${strength.score >= 4 ? strength.color : 'bg-transparent'} transition-all w-1/4`}></div>
                  </div>
                  <p className={`text-xs mt-1 text-right font-medium text-${strength.color.split('-')[1]}-600`}>{strength.text}</p>
                </div>
              )}

              {errors.password && <p className="mt-1.5 text-sm text-red-600">{errors.password.message as string}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <input
                  {...register('confirmPassword', { 
                    required: 'Please confirm your password',
                    validate: value => value === currentPassword || 'Passwords do not match'
                  })}
                  type={showConfirmPassword ? 'text' : 'password'}
                  disabled={isLoading}
                  className={`block w-full pl-10 pr-10 py-3 border ${errors.confirmPassword ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-200 focus:ring-indigo-500 focus:border-indigo-500'} rounded-xl bg-gray-50/50 focus:bg-white text-gray-900 text-sm transition-all duration-200 shadow-sm`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-1.5 text-sm text-red-600">{errors.confirmPassword.message as string}</p>}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-4"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-indigo-600 hover:text-indigo-500 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;