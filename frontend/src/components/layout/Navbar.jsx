import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/notificationStore';
import { useEffect } from 'react';
import { Home, Briefcase, MessageSquare, Bell, User, LogOut, Users, Shield } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const { unreadCount, getUnreadCount } = useNotificationStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Poll unread count every 30 seconds
  useEffect(() => {
    if (!user) return;
    getUnreadCount();
    const interval = setInterval(getUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [user, getUnreadCount]);

  const onLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  const NavItem = ({ to, icon: Icon, label, badge }) => {
    const isActive = location.pathname === to;
    return (
      <Link
        to={to}
        className={`relative flex flex-col items-center justify-center min-w-[60px] sm:min-w-[70px] h-[52px] border-b-2 transition-colors duration-200 ${
          isActive
            ? 'border-emerald-600 text-emerald-600'
            : 'border-transparent text-slate-500 hover:text-emerald-600'
        }`}
      >
        <div className="relative">
          <Icon className="h-5 w-5" />
          {badge > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
              {badge > 99 ? '99+' : badge}
            </span>
          )}
        </div>
        <span className="text-[11px] sm:text-[12px] mt-0.5 font-medium hidden sm:block">{label}</span>
      </Link>
    );
  };

  const NavButton = ({ icon: Icon, label, onClick }) => (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center min-w-[60px] sm:min-w-[70px] h-[52px] border-b-2 border-transparent text-slate-500 hover:text-red-600 transition-colors duration-200"
    >
      <Icon className="h-5 w-5" />
      <span className="text-[11px] sm:text-[12px] mt-0.5 font-medium hidden sm:block">{label}</span>
    </button>
  );

  return (
    <nav className="bg-white sticky top-0 z-50 border-b border-slate-200 shadow-sm">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="flex justify-between h-[52px] items-center">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-900/20">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl sm:text-[22px] font-bold text-emerald-900 tracking-tight font-display">Consultancy Hub</span>
            </Link>
          </div>
          <div className="flex items-center h-full">
            <NavItem to="/" icon={Home} label="Home" />
            <NavItem to="/connections" icon={Users} label="Network" />
            <NavItem to="/jobs" icon={Briefcase} label="Jobs" />
            <NavItem to="/messaging" icon={MessageSquare} label="Messaging" />
            <NavItem to="/notifications" icon={Bell} label="Notifications" badge={unreadCount} />
            <NavItem to={`/profile/${user._id}`} icon={User} label="Profile" />
            {user.role === 'Admin' && (
              <NavItem to="/admin" icon={Shield} label="Admin" />
            )}
            <div className="border-l border-slate-200 h-8 mx-1 sm:mx-2"></div>
            <NavButton onClick={onLogout} icon={LogOut} label="Logout" />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
