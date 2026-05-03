import { useEffect } from 'react';
import { useNotificationStore } from '../store/notificationStore';
import { Link } from 'react-router-dom';
import { Bell, ThumbsUp, MessageSquare, Users, Briefcase } from 'lucide-react';

// Returns a human-readable relative time string
const timeAgo = (dateString) => {
  const now = new Date();
  const past = new Date(dateString);
  const diffMs = now - past;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return past.toLocaleDateString();
};

// Icon + message based on notification type
const notificationContent = (notification) => {
  const name = notification.relatedUser?.name || 'Someone';

  switch (notification.type) {
    case 'Like':
      return {
        icon: <ThumbsUp className="w-3 h-3 text-white" />,
        bg: 'bg-emerald-500',
        message: `${name} liked your post`
      };
    case 'Comment':
      return {
        icon: <MessageSquare className="w-3 h-3 text-white" />,
        bg: 'bg-teal-500',
        message: `${name} commented on your post`
      };
    case 'Connection':
      return {
        icon: <Users className="w-3 h-3 text-white" />,
        bg: 'bg-indigo-500',
        message: `${name} sent you a connection request`
      };
    case 'Job':
      return {
        icon: <Briefcase className="w-3 h-3 text-white" />,
        bg: 'bg-amber-500',
        message: notification.relatedUser?.role === 'User' 
          ? `${name} applied for your job posting`
          : `Update on your job application`
      };
    default:
      return {
        icon: <Bell className="w-3 h-3 text-white" />,
        bg: 'bg-slate-400',
        message: 'You have a new notification'
      };
  }
};

const Notifications = () => {
  const { notifications, isLoading, getNotifications, markAllRead } = useNotificationStore();

  useEffect(() => {
    getNotifications();
    markAllRead();
  }, [getNotifications, markAllRead]);

  return (
    <div className="max-w-[800px] mx-auto py-10 px-4 font-sans animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
            <Bell className="w-7 h-7 text-emerald-600" />
            Activity
          </h1>
          <p className="text-slate-500 text-sm font-medium">Stay updated with your professional network.</p>
        </div>
        {notifications.length > 0 && (
          <button
            onClick={markAllRead}
            className="text-xs font-bold text-emerald-600 uppercase tracking-widest hover:text-emerald-700 transition-colors"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mb-4"></div>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Checking alerts...</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && notifications.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="w-20 h-20 rounded-[2rem] bg-slate-50 flex items-center justify-center mb-6">
            <Bell className="w-10 h-10 text-slate-200" />
          </div>
          <h3 className="text-slate-900 font-bold text-lg mb-2">All caught up!</h3>
          <p className="text-slate-400 text-sm font-medium max-w-xs mx-auto">
            Your notifications will appear here as your network interacts with you.
          </p>
        </div>
      )}

      {/* Notifications List */}
      {!isLoading && notifications.length > 0 && (
        <ul className="space-y-4">
          {notifications.map((notification) => {
            const { icon, bg, message } = notificationContent(notification);
            const profilePicUrl = notification.relatedUser?.profilePicture?.startsWith('/uploads')
              ? `http://localhost:5000${notification.relatedUser.profilePicture}`
              : (notification.relatedUser?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(notification.relatedUser?.name || 'User')}&background=0d4f3f&color=fff`);

            return (
              <li
                key={notification._id}
                className={`flex items-start gap-5 p-5 bg-white rounded-[2rem] shadow-sm border border-slate-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group ${
                  !notification.read ? 'ring-2 ring-emerald-500/20 bg-emerald-50/10' : ''
                }`}
              >
                {/* Avatar or Icon */}
                <div className="flex-shrink-0 relative">
                  <Link to={`/profile/${notification.relatedUser?._id}`}>
                    <img
                      src={profilePicUrl}
                      alt={notification.relatedUser?.name}
                      className="w-14 h-14 rounded-2xl object-cover border border-slate-100 shadow-sm group-hover:scale-105 transition-transform"
                    />
                  </Link>
                  {/* Type badge */}
                  <div className={`absolute -bottom-1 -right-1 w-7 h-7 rounded-full ${bg} flex items-center justify-center border-4 border-white shadow-md`}>
                    {icon}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 pt-1">
                  <p className={`text-[15px] leading-relaxed ${!notification.read ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>
                    {message}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{timeAgo(notification.createdAt)}</span>
                    {!notification.read && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default Notifications;
