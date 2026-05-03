import { useState } from 'react';
import { useAdminStore } from '../store/adminStore';
import { useAuthStore } from '../store/authStore';
import { Lock, Eye, EyeOff, ShieldCheck, AlertCircle } from 'lucide-react';

const PasswordInput = ({ label, field, showKey, show, setShow, form, setForm }) => (
  <div>
    <label className="block text-xs font-semibold text-slate-600 mb-1.5">{label}</label>
    <div className="relative">
      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      <input
        type={show[showKey] ? 'text' : 'password'}
        required
        value={form[field]}
        onChange={e => setForm({ ...form, [field]: e.target.value })}
        className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
        placeholder={label}
      />
      <button type="button" onClick={() => setShow({ ...show, [showKey]: !show[showKey] })}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
        {show[showKey] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  </div>
);

const ForcePasswordChange = ({ onSuccess }) => {
  const { changePassword } = useAdminStore();
  const { user } = useAuthStore();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [show, setShow] = useState({ current: false, new: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.newPassword.length < 6) return setError('New password must be at least 6 characters.');
    if (form.newPassword !== form.confirmPassword) return setError('New passwords do not match.');
    setLoading(true);
    const result = await changePassword(form.currentPassword, form.newPassword);
    setLoading(false);
    if (result?.success) {
      onSuccess?.();
    } else {
      setError(result?.message || 'Failed to change password.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 px-8 py-7 text-white text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-xl font-bold mb-1">Password Change Required</h1>
          <p className="text-indigo-200 text-sm">Your admin has reset your password. You must set a new password before continuing.</p>
        </div>
        <div className="px-8 py-7">
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6">
            <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <p className="text-xs text-amber-700 font-medium">Hello, <span className="font-bold">{user?.name}</span>. Please change your temporary password to continue.</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-xs text-red-600 font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <PasswordInput label="Current (Temporary) Password" field="currentPassword" showKey="current" show={show} setShow={setShow} form={form} setForm={setForm} />
            <PasswordInput label="New Password" field="newPassword" showKey="new" show={show} setShow={setShow} form={form} setForm={setForm} />
            <PasswordInput label="Confirm New Password" field="confirmPassword" showKey="confirm" show={show} setShow={setShow} form={form} setForm={setForm} />

            {form.newPassword && (
              <div className="bg-slate-50 rounded-xl p-3 space-y-1.5">
                {[
                  { ok: form.newPassword.length >= 6, label: 'At least 6 characters' },
                  { ok: form.newPassword === form.confirmPassword && form.confirmPassword !== '', label: 'Passwords match' },
                ].map(r => (
                  <div key={r.label} className={`flex items-center gap-2 text-xs font-medium ${r.ok ? 'text-emerald-600' : 'text-slate-400'}`}>
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${r.ok ? 'bg-emerald-100' : 'bg-slate-200'}`}>
                      {r.ok && <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                    </div>
                    {r.label}
                  </div>
                ))}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl text-sm transition-colors shadow-sm mt-2">
              {loading ? 'Updating Password...' : 'Set New Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForcePasswordChange;
