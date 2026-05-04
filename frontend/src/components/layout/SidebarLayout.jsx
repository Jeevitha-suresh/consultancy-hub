import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import {
  Home, Briefcase, ClipboardList, User, MessageSquare, Bell,
  LogOut, Menu, X, ChevronRight, ShieldCheck, UserPlus, KeyRound, PlusCircle, Users
} from 'lucide-react';

const SidebarLayout = ({ children }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavItems = () => {
    const common = [
      { id: 'messaging', label: 'Messaging', icon: <MessageSquare className="w-5 h-5" />, path: '/messaging' },
      { id: 'notifications', label: 'Notifications', icon: <Bell className="w-5 h-5" />, path: '/notifications' },
    ];

    const role = user?.role?.toLowerCase();

    if (role === 'admin') {
      return [
        { id: 'admin-users', label: 'All Users', icon: <Users className="w-5 h-5" />, path: '/admin?tab=users' },
        { id: 'admin-recruiters', label: 'Recruiters', icon: <UserPlus className="w-5 h-5" />, path: '/admin?tab=recruiters' },
        { id: 'admin-profile', label: 'Consultancy', icon: <Briefcase className="w-5 h-5" />, path: '/admin?tab=profile' },
        { id: 'admin-security', label: 'Security', icon: <ShieldCheck className="w-5 h-5" />, path: '/admin?tab=security' },
        ...common
      ];
    }

    if (role === 'recruiter') {
      return [
        { id: 'recruiter-dash', label: 'Dashboard', icon: <Home className="w-5 h-5" />, path: '/recruiter-dashboard?tab=dashboard' },
        { id: 'post-job', label: 'Post a Job', icon: <PlusCircle className="w-5 h-5" />, path: '/recruiter-dashboard?tab=post-job' },
        { id: 'my-jobs', label: 'My Jobs', icon: <Briefcase className="w-5 h-5" />, path: '/recruiter-dashboard?tab=my-jobs' },
        { id: 'applicants', label: 'Applicants', icon: <Users className="w-5 h-5" />, path: '/recruiter-dashboard?tab=applicants' },
        ...common,
        { id: 'profile', label: 'Profile', icon: <User className="w-5 h-5" />, path: '/recruiter-dashboard?tab=profile' },
      ];
    }

    // Candidate / Default
    return [
      { id: 'home', label: 'Home', icon: <Home className="w-5 h-5" />, path: '/' },
      { id: 'jobs', label: 'Browse Jobs', icon: <Briefcase className="w-5 h-5" />, path: '/jobs' },
      { id: 'applications', label: 'My Applications', icon: <ClipboardList className="w-5 h-5" />, path: '/candidate-dashboard' },
      ...common,
      { id: 'profile', label: 'Profile', icon: <User className="w-5 h-5" />, path: `/profile/${user._id}` },
    ];
  };

  const navItems = getNavItems();

  const avatarUrl = user?.profilePicture
    ? (user.profilePicture.startsWith('http') ? user.profilePicture : `http://localhost:5000${user.profilePicture}`)
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=0d4f3f&color=fff&size=128`;

  return (
    <div className="flex h-screen bg-[#f8fafc] font-sans overflow-hidden">
      {/* Mobile overlay - Improved blur and fade */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 animate-fade-in" 
          onClick={() => setSidebarOpen(false)} 
        />
      )}

      {/* Sidebar - Optimized for all screens */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-[#064e3b] text-white flex flex-col transition-all duration-300 ease-in-out shadow-2xl
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        
        {/* Branding - More compact on small heights */}
        <div className="flex items-center justify-between p-6 sm:p-8 border-b border-white/10">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 sm:w-11 sm:h-11 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
              <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <p className="font-black text-base sm:text-lg leading-none tracking-tight">Consultancy</p>
              <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mt-1">Hub</p>
            </div>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 text-emerald-300 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* User Identity - Refined spacing */}
        <div className="px-5 py-5 border-b border-white/5">
          <div className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/5">
            <div className="relative flex-shrink-0">
              <img src={avatarUrl} alt={user?.name} className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl object-cover ring-2 ring-emerald-500/30 shadow-md" />
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#064e3b] rounded-full"></div>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold truncate text-white">{user?.name}</p>
              <p className="text-[9px] sm:text-[10px] text-emerald-400 font-bold uppercase tracking-wider">{user?.role}</p>
            </div>
          </div>
        </div>

        {/* Navigation - Better scrolling and spacing */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto custom-scrollbar overflow-x-hidden">
          {navItems.map((item) => {
            const isActive = (location.pathname + location.search) === item.path;
            return (
              <Link
                key={item.id}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-200 group
                  ${isActive 
                    ? 'bg-emerald-500/20 text-white shadow-lg border border-emerald-500/20' 
                    : 'text-emerald-100/60 hover:bg-white/5 hover:text-white'}`}
              >
                <span className={`${isActive ? 'text-emerald-400' : 'text-emerald-100/40 group-hover:text-emerald-400'} transition-colors`}>
                  {item.icon}
                </span>
                <span className="flex-1 truncate">{item.label}</span>
                {isActive && <ChevronRight className="w-4 h-4 text-emerald-400 animate-slide-in" />}
              </Link>
            );
          })}
        </nav>

        {/* Footer - Sticky at bottom */}
        <div className="p-4 sm:p-6 border-t border-white/5 bg-black/10 mt-auto">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold text-red-400 hover:bg-red-500/10 transition-all group"
          >
            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top Mobile Header - Modern & Clean */}
        <header className="lg:hidden bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-600/20">
              <Briefcase className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="font-extrabold text-slate-800 text-sm tracking-tight">Consultancy Hub</span>
          </div>
          <button 
            onClick={() => setSidebarOpen(true)} 
            className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 hover:rounded-xl transition-all"
            aria-label="Open Menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </header>

        {/* Content Wrapper - Better padding for mobile */}
        <main className="flex-1 overflow-y-auto custom-scrollbar bg-[#f8fafc]">
          <div className="w-full max-w-[1400px] mx-auto min-h-full">
            {children}
          </div>
        </main>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.06); border-radius: 10px; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
      `}</style>
    </div>

  );
};

export default SidebarLayout;
