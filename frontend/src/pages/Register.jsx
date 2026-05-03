import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Briefcase, Eye, EyeOff, Lock, Mail, User, AlertCircle, CheckCircle2, Info } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const { name, email, password } = formData;

  const navigate = useNavigate();
  const { user, isLoading, isError, isSuccess, message, register, reset } = useAuthStore();

  useEffect(() => {
    if (isSuccess || user) {
      // Always redirect to candidate dashboard after registration
      navigate('/candidate-dashboard', { replace: true });
    }
    reset();
  }, [user, isSuccess, navigate, reset]);

  const onSubmit = (e) => {
    e.preventDefault();
    // Role is NOT sent — backend always assigns 'User'
    register({ name, email, password });
  };

  const passwordStrength = () => {
    if (password.length === 0) return null;
    if (password.length < 6) return { label: 'Too short', color: 'bg-red-400', width: 'w-1/4' };
    if (password.length < 8) return { label: 'Weak', color: 'bg-amber-400', width: 'w-2/4' };
    if (password.length < 12) return { label: 'Good', color: 'bg-blue-400', width: 'w-3/4' };
    return { label: 'Strong', color: 'bg-emerald-400', width: 'w-full' };
  };
  const strength = passwordStrength();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-teal-900/50">
            <Briefcase className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Consultancy Hub</h1>
          <p className="text-slate-400 text-sm mt-1">Create your candidate account</p>
        </div>

        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 shadow-2xl">

          {/* Error */}
          {isError && message && (
            <div className="flex items-center gap-2 bg-red-500/20 border border-red-400/30 rounded-xl px-4 py-3 mb-5">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-300 font-medium">{message}</p>
            </div>
          )}

          <h2 className="text-xl font-bold text-white mb-6 text-center">Create your account</h2>

          <form onSubmit={onSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text" required name="name" value={name} autoComplete="name"
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-400/50"
                  placeholder="Your full name"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email" required name="email" value={email} autoComplete="email"
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-400/50"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPwd ? 'text' : 'password'} required name="password" value={password} autoComplete="new-password"
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-10 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-400/50"
                  placeholder="Minimum 6 characters"
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password strength */}
              {strength && (
                <div className="mt-2">
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-300 ${strength.color} ${strength.width}`} />
                  </div>
                  <p className={`text-xs mt-1 font-medium ${
                    strength.label === 'Too short' ? 'text-red-400' :
                    strength.label === 'Weak' ? 'text-amber-400' :
                    strength.label === 'Good' ? 'text-blue-400' : 'text-emerald-400'
                  }`}>{strength.label}</p>
                </div>
              )}
            </div>

            {/* Role badge — read-only, informational */}
            <div className="flex items-center gap-2 bg-teal-500/10 border border-teal-400/20 rounded-xl px-4 py-3">
              <CheckCircle2 className="w-4 h-4 text-teal-400 flex-shrink-0" />
              <p className="text-xs text-teal-300 font-medium">You will be registered as a <span className="font-bold text-teal-200">Candidate</span></p>
            </div>

            <button type="submit" disabled={isLoading}
              className="w-full bg-teal-600 hover:bg-teal-500 disabled:opacity-60 text-white font-semibold py-3 rounded-xl text-sm transition-all shadow-lg shadow-teal-900/30">
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-teal-400 hover:text-teal-300 font-semibold transition-colors">Sign in</Link>
          </p>

          {/* Recruiter notice */}
          <div className="mt-6 flex items-start gap-2.5 bg-white/5 border border-white/10 rounded-2xl px-4 py-4">
            <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-slate-400 leading-relaxed">
              <span className="text-slate-300 font-semibold">Are you a recruiter?</span> Please contact the consultancy admin to get your login credentials. Recruiter accounts are created exclusively by the admin.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
