import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Briefcase, Eye, EyeOff, Lock, Mail, AlertCircle } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const { email, password } = formData;
  const navigate = useNavigate();
  const { user, isLoading, isError, isSuccess, message, login, reset } = useAuthStore();

  useEffect(() => {
    if (isSuccess || user) {
      if (user?.role === 'Recruiter') navigate('/recruiter-dashboard', { replace: true });
      else if (user?.role === 'Admin') navigate('/admin', { replace: true });
      else navigate('/candidate-dashboard', { replace: true });
    }
    
    // Reset status only on unmount to keep error visible during the stay
    return () => reset();
  }, [user, isSuccess, navigate, reset]);

  const onSubmit = (e) => {
    e.preventDefault();
    login({ email, password });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-emerald-900/40">
            <Briefcase className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Consultancy Hub</h1>
          <p className="text-emerald-400/70 text-sm mt-1.5 font-medium tracking-wide uppercase text-[10px]">Professional Career Portal</p>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl">
          {isError && message && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-3.5 mb-6 animate-shake">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-xs text-red-400 font-semibold tracking-wide">{message}</p>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-emerald-500/80 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
                <input
                  type="email" required name="email" value={email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-800/50 border border-white/5 rounded-2xl text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all"
                  placeholder="name@company.com"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-emerald-500/80 uppercase tracking-widest ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
                <input
                  type={showPwd ? 'text' : 'password'} required name="password" value={password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-11 pr-12 py-3.5 bg-slate-800/50 border border-white/5 rounded-2xl text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={isLoading}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-60 text-white font-bold py-4 rounded-2xl text-sm transition-all shadow-lg shadow-emerald-900/40 mt-4 active:scale-[0.98]">
              {isLoading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-xs text-slate-500 font-medium">
              New to the portal?{' '}
              <Link to="/register" className="text-emerald-500 hover:text-emerald-400 font-bold transition-colors ml-1">Create Account</Link>
            </p>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.5s ease-out; }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-4px); } 75% { transform: translateX(4px); } }
        .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
      `}</style>
    </div>
  );
};

export default Login;
