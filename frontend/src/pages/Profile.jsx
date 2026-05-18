import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';

const roleMeta = {
  customer: { label: 'Customer', color: 'bg-blue-100 text-blue-700', icon: '🎉' },
  vendor: { label: 'Vendor', color: 'bg-emerald-100 text-emerald-700', icon: '🏪' },
  admin: { label: 'Admin', color: 'bg-purple-100 text-purple-700', icon: '🛡️' },
};

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({ name: user?.name || '', email: user?.email || '' });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  const meta = roleMeta[user?.role] || roleMeta.customer;

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const response = await axiosInstance.put('/users/profile', formData);
      updateUser(response.data.user);
      setSuccess('Profile updated successfully!');
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Profile Header Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {/* Banner */}
          <div className="h-24 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-600" />

          {/* Avatar + Info */}
          <div className="px-8 pb-8">
            <div className="flex items-end gap-5 -mt-10 mb-5">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg border-4 border-white">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="pb-1">
                <h1 className="text-2xl font-bold text-slate-800">{user?.name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${meta.color}`}>
                    {meta.icon} {meta.label}
                  </span>
                  <span className="text-slate-400 text-sm">{user?.email}</span>
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 rounded-xl">
              {[
                ['Member since', '2025'],
                ['Role', meta.label],
                ['Status', 'Active'],
              ].map(([label, value]) => (
                <div key={label} className="text-center">
                  <div className="text-lg font-bold text-slate-800">{value}</div>
                  <div className="text-xs text-slate-500">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Edit Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Personal Information</h2>
              <p className="text-slate-500 text-sm mt-0.5">Update your name and email address</p>
            </div>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-100 transition"
              >
                ✏️ Edit
              </button>
            )}
          </div>

          {success && (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 mb-5 text-sm">
              <span>✅</span> {success}
            </div>
          )}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-5 text-sm">
              <span>⚠️</span> {error}
            </div>
          )}

          {editing ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:from-indigo-700 hover:to-violet-700 transition-all shadow-sm disabled:opacity-60"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => { setEditing(false); setError(''); setSuccess(''); }}
                  className="bg-slate-100 text-slate-700 px-6 py-2.5 rounded-xl font-semibold hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              {[['Full Name', user?.name], ['Email Address', user?.email], ['Account Role', `${meta.icon} ${meta.label}`]].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                  <span className="text-sm text-slate-500">{label}</span>
                  <span className="text-sm font-semibold text-slate-800">{value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;