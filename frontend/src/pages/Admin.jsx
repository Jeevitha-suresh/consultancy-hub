import { useEffect, useState, useRef } from 'react';
import { useAdminStore } from '../store/adminStore';
import { useAuthStore } from '../store/authStore';
import { useSearchParams, Navigate } from 'react-router-dom';
import {
  Users, UserPlus, Trash2, KeyRound, RefreshCw, Lock,
  Eye, EyeOff, X, Check, AlertCircle, ShieldCheck, Copy, 
  Upload, Briefcase, ChevronRight
} from 'lucide-react';
import { useUserStore } from '../store/userStore';

const Admin = () => {
  const { users, recruiters, getUsers, deleteUser, getRecruiters, createRecruiter, resetRecruiterPassword, adminChangePassword } = useAdminStore();
  const { user } = useAuthStore();
  const { updateProfile } = useUserStore();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = searchParams.get('tab') || 'recruiters';
  const setActiveTab = (tab) => setSearchParams({ tab });
  const [toast, setToast] = useState(null);

  // Create recruiter form
  const [newRecruiter, setNewRecruiter] = useState({ name: '', email: '', password: '' });
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [creatingR, setCreatingR] = useState(false);

  // Reset password state
  const [resetTarget, setResetTarget] = useState(null);
  const [resetPwd, setResetPwd] = useState('');
  const [showResetPwd, setShowResetPwd] = useState(false);
  const [resetting, setResetting] = useState(false);

  // Admin change own password
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPwds, setShowPwds] = useState({ current: false, new: false, confirm: false });
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdError, setPwdError] = useState('');

  // Profile state
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    headline: user?.headline || '',
    bio: user?.bio || '',
    location: user?.location || '',
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState(null);
  const profilePicInputRef = useRef(null);

  useEffect(() => {
    getUsers();
    getRecruiters();
  }, []);

  if (!user || user.role !== 'Admin') return <Navigate to="/" replace />;

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$';
    return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  };

  const handleCreateRecruiter = async (e) => {
    e.preventDefault();
    setCreatingR(true);
    const result = await createRecruiter(newRecruiter);
    setCreatingR(false);
    if (result?.success) {
      showToast('Recruiter created successfully!');
      setNewRecruiter({ name: '', email: '', password: '' });
    } else {
      showToast(result?.message || 'Failed to create recruiter', 'error');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetPwd || resetPwd.length < 6) return showToast('Password must be at least 6 characters', 'error');
    setResetting(true);
    const result = await resetRecruiterPassword(resetTarget._id, resetPwd);
    setResetting(false); 
    if (result?.success) {
      showToast('Password reset successfully!');
      setResetTarget(null);
      setResetPwd('');
    } else {
      showToast(result?.message || 'Reset failed', 'error');
    }
    setResetting(false);
  };

  const handleAdminPwdChange = async (e) => {
    e.preventDefault();
    setPwdError('');
    if (pwdForm.newPassword !== pwdForm.confirmPassword) return setPwdError('New passwords do not match.');
    setPwdLoading(true);
    const result = await adminChangePassword(pwdForm.currentPassword, pwdForm.newPassword);
    setPwdLoading(false);
    if (result?.success) {
      showToast('Password updated!');
      setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } else {
      setPwdError(result?.message || 'Update failed.');
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    const fd = new FormData();
    Object.keys(profileForm).forEach(k => fd.append(k, profileForm[k]));
    if (profilePicFile) fd.append('profilePicture', profilePicFile);
    await updateProfile(fd);
    setProfileSaving(false);
    showToast('Profile updated!');
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicFile(file);
      setProfilePicPreview(URL.createObjectURL(file));
    }
  };

  const inputCls = "w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400";
  const labelCls = "block text-xs font-semibold text-slate-600 mb-1.5";

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 animate-fade-in">
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-5 py-3 rounded-xl shadow-xl text-sm font-medium animate-slide-in
          ${toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-emerald-600 text-white'}`}>
          {toast.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <Check className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* Tabs Selector (In-page) */}
      <div className="flex flex-wrap gap-2 mb-2">
        {[
          { id: 'recruiters', label: 'Recruiters', icon: <UserPlus className="w-4 h-4" /> },
          { id: 'users', label: 'All Users', icon: <Users className="w-4 h-4" /> },
          { id: 'profile', label: 'Consultancy Profile', icon: <Briefcase className="w-4 h-4" /> },
          { id: 'security', label: 'Admin Security', icon: <ShieldCheck className="w-4 h-4" /> },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all
              ${activeTab === t.id 
                ? 'bg-emerald-600 text-white shadow-md' 
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-100'}`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* RECRUITERS TAB */}
      {activeTab === 'recruiters' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="font-bold text-slate-800 text-lg mb-1">Add Recruiter</h3>
            <p className="text-sm text-slate-500 mb-6">Create a verified recruiter account for the consultancy hub.</p>
            <form onSubmit={handleCreateRecruiter} className="grid grid-cols-1 md:grid-cols-3 gap-4" autoComplete="off">
              {/* Dummy fields to trick chrome auto-fill */}
              <input type="text" style={{display:'none'}} />
              <input type="password" style={{display:'none'}} />
              
              <div>
                <label htmlFor="r-name" className={labelCls}>Name</label>
                <input id="r-name" required className={inputCls} value={newRecruiter.name} onChange={e=>setNewRecruiter({...newRecruiter, name:e.target.value})} autoComplete="none" />
              </div>
              <div>
                <label htmlFor="r-email" className={labelCls}>Email</label>
                <input id="r-email" required type="email" className={inputCls} value={newRecruiter.email} onChange={e=>setNewRecruiter({...newRecruiter, email:e.target.value})} autoComplete="none" />
              </div>
              <div>
                <label htmlFor="r-pass" className={labelCls}>Password</label>
                <div className="relative">
                  <input id="r-pass" required type={showNewPwd?'text':'password'} className={inputCls} value={newRecruiter.password} onChange={e=>setNewRecruiter({...newRecruiter, password:e.target.value})} autoComplete="new-password" />
                  <button type="button" onClick={()=>setShowNewPwd(!showNewPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">{showNewPwd?<EyeOff className="w-4 h-4"/>:<Eye className="w-4 h-4"/>}</button>
                </div>
              </div>
              <div className="md:col-span-3 flex justify-end">
                <button type="submit" disabled={creatingR} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-3 rounded-xl text-sm shadow-md transition-all">
                  {creatingR ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-5 border-b border-slate-100"><h3 className="font-bold text-slate-800">Active Recruiters</h3></div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="bg-slate-50 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Recruiter</th><th className="px-6 py-4">Status</th><th className="px-6 py-4">Action</th>
                </tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {recruiters.map(r => (
                    <tr key={r._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img className="w-9 h-9 rounded-full object-cover" src={r.profilePicture?.startsWith('/uploads') ? `http://localhost:5000${r.profilePicture}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(r.name)}&background=0d4f3f&color=fff`} alt={r.name} />
                          <div><p className="font-bold text-slate-800">{r.name}</p><p className="text-xs text-slate-400">{r.email}</p></div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${r.mustChangePassword ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>
                          {r.mustChangePassword ? 'Reset Pending' : 'Active'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button onClick={() => setResetTarget(r)} className="text-emerald-600 font-bold hover:underline">Reset Password</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ALL USERS TAB */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-lg">System Accounts</h3>
            <span className="text-xs font-bold bg-slate-100 text-slate-600 px-3 py-1 rounded-full">{users.length} Total</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-slate-50 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-4">User</th><th className="px-6 py-4">Role</th><th className="px-6 py-4">Action</th>
              </tr></thead>
              <tbody className="divide-y divide-slate-100">
                {users.map(u => (
                  <tr key={u._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800">{u.name}</p><p className="text-xs text-slate-500">{u.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${u.role === 'Admin' ? 'bg-purple-50 text-purple-600 border-purple-200' : u.role === 'Recruiter' ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {u._id !== user._id && (
                        <button onClick={() => deleteUser(u._id)} className="text-red-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PROFILE TAB */}
      {activeTab === 'profile' && (
        <div className="max-w-2xl bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          <h3 className="text-xl font-bold text-slate-800 mb-6">Administrative Info</h3>
          <form onSubmit={handleProfileSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className={labelCls}>Name</label><input className={inputCls} value={profileForm.name} onChange={e=>setProfileForm({...profileForm, name:e.target.value})} /></div>
              <div><label className={labelCls}>Location</label><input className={inputCls} value={profileForm.location} onChange={e=>setProfileForm({...profileForm, location:e.target.value})} /></div>
            </div>
            <div><label className={labelCls}>Headline</label><input className={inputCls} value={profileForm.headline} onChange={e=>setProfileForm({...profileForm, headline:e.target.value})} /></div>
            <div><label className={labelCls}>Bio</label><textarea rows={3} className={inputCls+' resize-none'} value={profileForm.bio} onChange={e=>setProfileForm({...profileForm, bio:e.target.value})} /></div>
            <button type="submit" disabled={profileSaving} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-sm">{profileSaving?'Saving...':'Save Profile'}</button>
          </form>
        </div>
      )}

      {/* SECURITY TAB */}
      {activeTab === 'security' && (
        <div className="max-w-md bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          <h3 className="text-xl font-bold text-slate-800 mb-6">Security Settings</h3>
          {pwdError && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs mb-4">{pwdError}</div>}
          <form onSubmit={handleAdminPwdChange} className="space-y-4">
            {['currentPassword', 'newPassword', 'confirmPassword'].map(f => (
              <div key={f}><label className={labelCls}>{f}</label>
                <input type="password" required className={inputCls} value={pwdForm[f]} onChange={e=>setPwdForm({...pwdForm, [f]:e.target.value})} /></div>
            ))}
            <button type="submit" disabled={pwdLoading} className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 rounded-xl shadow-sm">{pwdLoading?'Updating...':'Update Password'}</button>
          </form>
        </div>
      )}

      {/* RESET PASSWORD MODAL */}
      {resetTarget && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="font-bold text-slate-800 mb-4">Reset Password for {resetTarget.name}</h3>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <input type="password" required className={inputCls} placeholder="Enter new password" value={resetPwd} onChange={e=>setResetPwd(e.target.value)} />
              <div className="flex gap-3">
                <button type="button" onClick={() => setResetTarget(null)} className="flex-1 py-2 rounded-xl border border-slate-200">Cancel</button>
                <button type="submit" disabled={resetting} className="flex-1 py-2 rounded-xl bg-emerald-600 text-white font-bold">Reset</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default Admin;
