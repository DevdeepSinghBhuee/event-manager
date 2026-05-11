import React, { useState, useEffect } from 'react';
import { useForm, type FieldValues } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';
import { User, Mail, Camera, Lock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { type AxiosError } from 'axios';

const Profile: React.FC = () => {
  const { user, refreshToken } = useAuth();
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors, isSubmitting: isProfileSubmitting },
    reset: resetProfile
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      avatar: user?.avatar || ''
    }
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting },
    reset: resetPassword,
    watch: watchPassword
  } = useForm();

  const newPassword = watchPassword('newPassword');

  useEffect(() => {
    if (user) {
      resetProfile({
        name: user.name,
        email: user.email,
        avatar: user.avatar || ''
      });
    }
  }, [user, resetProfile]);

  const onProfileSubmit = async (data: FieldValues) => {
    setProfileMessage(null);
    try {
      await axiosInstance.put('/api/users/profile', data);
      setProfileMessage({ type: 'success', text: 'Profile updated successfully.' });
      // Refresh user context data
      await refreshToken();
    } catch (err: unknown) {
      const error = err as AxiosError<{ message: string }>;
      setProfileMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to update profile.'
      });
    }
  };

  const onPasswordSubmit = async (data: FieldValues) => {
    setPasswordMessage(null);
    try {
      // Assuming the backend accepts these fields at the same endpoint or a separate one
      // If it's a separate one, replace the URL below
      await axiosInstance.put('/api/users/profile', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });
      setPasswordMessage({ type: 'success', text: 'Password updated successfully.' });
      resetPassword();
    } catch (err: unknown) {
      const error = err as AxiosError<{ message: string }>;
      setPasswordMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to change password.'
      });
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto py-8">
      {/* Header Profile Summary */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8 mb-8 flex flex-col md:flex-row items-center gap-6">
        <div className="relative">
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-24 h-24 rounded-full object-cover border-4 border-indigo-50 shadow-md" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-4xl shadow-inner">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 border-2 border-white rounded-full flex items-center justify-center" title="Online"></span>
        </div>
        
        <div className="text-center md:text-left flex-1">
          <h1 className="text-3xl font-extrabold text-gray-900">{user.name}</h1>
          <p className="text-gray-500 flex items-center justify-center md:justify-start gap-2 mt-1">
            <Mail className="w-4 h-4" /> {user.email}
          </p>
          <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold capitalize bg-indigo-100 text-indigo-800">
            {user.role} Account
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Edit Profile Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <User className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
          </div>

          {profileMessage && (
            <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${profileMessage.type === 'success' ? 'bg-green-50 border-l-4 border-green-500' : 'bg-red-50 border-l-4 border-red-500'}`}>
              {profileMessage.type === 'success' ? <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" /> : <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />}
              <p className={`text-sm font-medium ${profileMessage.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>{profileMessage.text}</p>
            </div>
          )}

          <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
              <input
                {...registerProfile('name', { required: 'Name is required' })}
                type="text"
                className={`block w-full px-4 py-3 rounded-xl border ${profileErrors.name ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-200 focus:ring-indigo-500 focus:border-indigo-500'} bg-gray-50/50 focus:bg-white transition-all`}
              />
              {profileErrors.name && <p className="mt-1 text-sm text-red-600">{profileErrors.name.message as string}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
              <input
                {...registerProfile('email', { 
                  required: 'Email is required',
                  pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Invalid email' }
                })}
                type="email"
                className={`block w-full px-4 py-3 rounded-xl border ${profileErrors.email ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-200 focus:ring-indigo-500 focus:border-indigo-500'} bg-gray-50/50 focus:bg-white transition-all`}
              />
              {profileErrors.email && <p className="mt-1 text-sm text-red-600">{profileErrors.email.message as string}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                <Camera className="w-4 h-4 text-gray-500" /> Avatar URL
              </label>
              <input
                {...registerProfile('avatar')}
                type="url"
                placeholder="https://example.com/avatar.jpg"
                className="block w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50/50 focus:bg-white transition-all"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isProfileSubmitting}
                className="w-full flex justify-center items-center py-3 px-4 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isProfileSubmitting ? <><Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" /> Saving...</> : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Change Password Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <Lock className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-bold text-gray-900">Security</h2>
          </div>

          {passwordMessage && (
            <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${passwordMessage.type === 'success' ? 'bg-green-50 border-l-4 border-green-500' : 'bg-red-50 border-l-4 border-red-500'}`}>
              {passwordMessage.type === 'success' ? <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" /> : <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />}
              <p className={`text-sm font-medium ${passwordMessage.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>{passwordMessage.text}</p>
            </div>
          )}

          <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Current Password</label>
              <input
                {...registerPassword('currentPassword', { required: 'Current password is required' })}
                type="password"
                className={`block w-full px-4 py-3 rounded-xl border ${passwordErrors.currentPassword ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-200 focus:ring-indigo-500 focus:border-indigo-500'} bg-gray-50/50 focus:bg-white transition-all`}
              />
              {passwordErrors.currentPassword && <p className="mt-1 text-sm text-red-600">{passwordErrors.currentPassword.message as string}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">New Password</label>
              <input
                {...registerPassword('newPassword', { 
                  required: 'New password is required',
                  minLength: { value: 6, message: 'Password must be at least 6 characters' }
                })}
                type="password"
                className={`block w-full px-4 py-3 rounded-xl border ${passwordErrors.newPassword ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-200 focus:ring-indigo-500 focus:border-indigo-500'} bg-gray-50/50 focus:bg-white transition-all`}
              />
              {passwordErrors.newPassword && <p className="mt-1 text-sm text-red-600">{passwordErrors.newPassword.message as string}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm New Password</label>
              <input
                {...registerPassword('confirmPassword', { 
                  required: 'Please confirm your new password',
                  validate: value => value === newPassword || 'Passwords do not match'
                })}
                type="password"
                className={`block w-full px-4 py-3 rounded-xl border ${passwordErrors.confirmPassword ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-200 focus:ring-indigo-500 focus:border-indigo-500'} bg-gray-50/50 focus:bg-white transition-all`}
              />
              {passwordErrors.confirmPassword && <p className="mt-1 text-sm text-red-600">{passwordErrors.confirmPassword.message as string}</p>}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isPasswordSubmitting}
                className="w-full flex justify-center items-center py-3 px-4 rounded-xl text-sm font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isPasswordSubmitting ? <><Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" /> Updating...</> : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
