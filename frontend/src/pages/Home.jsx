import { useEffect } from 'react';
import { usePostStore } from '../store/postStore';
import { useJobStore } from '../store/jobStore';
import PostForm from '../components/posts/PostForm';
import PostItem from '../components/posts/PostItem';
import { useAuthStore } from '../store/authStore';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, MessageSquare, Bell } from 'lucide-react';

const Home = () => {
  const { posts, getPosts, isLoading: postsLoading } = usePostStore();
  const { jobs, getJobs, isLoading: jobsLoading } = useJobStore();
  const { user } = useAuthStore();

  const navigate = useNavigate();

  useEffect(() => {
    const role = user?.role?.toLowerCase();
    if (role === 'admin') navigate('/admin', { replace: true });
    else if (role === 'recruiter') navigate('/recruiter-dashboard', { replace: true });
    else {
      getPosts();
      getJobs();
    }
  }, [getPosts, getJobs, user, navigate]);

  const profilePicUrl = user?.profilePicture 
    ? (user.profilePicture.startsWith('http') ? user.profilePicture : `http://localhost:5000${user.profilePicture}`)
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=0d4f3f&color=fff&size=128`;

  return (
    <div className="w-full max-w-7xl mx-auto py-4 sm:py-8 px-3 sm:px-6 grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-8 animate-fade-in font-sans">
      
      {/* Left Sidebar (Profile summary) - Responsive hidden logic */}
      <div className="hidden md:block md:col-span-4 lg:col-span-3">
        <div className="bg-white rounded-[2rem] shadow-sm overflow-hidden border border-slate-200/60 sticky top-8">
          <div className="h-24 bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800"></div>
          <div className="px-5 pb-6">
            <div className="-mt-12 mb-4 flex justify-center">
              <Link to={`/profile/${user?._id}`} className="block relative group">
                <img
                  className="h-24 w-24 rounded-3xl border-4 border-white object-cover bg-white shadow-xl group-hover:scale-105 transition-all duration-300 ring-1 ring-slate-100"
                  src={profilePicUrl}
                  alt={user?.name || 'User'}
                />
                <div className="absolute inset-0 rounded-3xl bg-black/0 group-hover:bg-black/5 transition-colors"></div>
              </Link>
            </div>
            <div className="text-center">
              <Link to={`/profile/${user?._id}`} className="hover:text-emerald-600 transition-colors inline-block">
                <h3 className="text-lg font-extrabold text-slate-900 leading-tight tracking-tight">{user?.name}</h3>
              </Link>
              <p className="text-[11px] text-slate-500 mt-2 font-bold px-3 py-1 bg-slate-50 rounded-lg inline-block uppercase tracking-wider">
                {user?.headline || 'Update your headline'}
              </p>
            </div>
          </div>
          
          <div className="border-t border-slate-100/80">
            <div className="py-4 px-6 hover:bg-slate-50/80 cursor-pointer transition-all group flex justify-between items-center">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Connections</span>
              <span className="text-xs text-emerald-600 font-black group-hover:scale-110 transition-transform">102</span>
            </div>
            <Link 
              to={`/profile/${user?._id}`}
              className="border-t border-slate-100/80 py-4 px-6 hover:bg-slate-50/80 cursor-pointer transition-all flex items-center gap-3 group"
            >
              <Briefcase className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 transition-colors" />
              <span className="text-xs font-extrabold text-slate-600 group-hover:text-slate-900 transition-colors">My Profile</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Feed - Flexible width */}
      <div className="col-span-1 md:col-span-8 lg:col-span-6 space-y-6">
        <PostForm />
        
        {postsLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="relative">
              <div className="h-12 w-12 rounded-full border-4 border-emerald-100 border-t-emerald-600 animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-2 w-2 bg-emerald-600 rounded-full animate-pulse"></div>
              </div>
            </div>
            <p className="text-sm font-bold text-slate-400 animate-pulse tracking-widest uppercase">Loading Hub Feed</p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.length > 0 ? (
              posts.map((post) => (
                <PostItem key={post._id} post={post} />
              ))
            ) : (
              <div className="text-center bg-white p-10 sm:p-16 rounded-[2.5rem] shadow-sm border border-slate-200/60">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MessageSquare className="w-10 h-10 text-slate-300" />
                </div>
                <h4 className="text-lg font-bold text-slate-800 mb-2">No activity yet</h4>
                <p className="text-slate-500 font-medium text-sm max-w-[240px] mx-auto">Be the first to share an update with the consultancy community!</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Sidebar (Insights) - Responsive hidden logic */}
      <div className="hidden lg:block lg:col-span-3">
        <div className="bg-white p-7 rounded-[2rem] shadow-sm border border-slate-200/60 sticky top-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-emerald-50 rounded-xl flex items-center justify-center">
                <Bell className="w-4 h-4 text-emerald-600" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-widest">Insights</h3>
            </div>
          </div>
          <ul className="space-y-6">
            {[
              { title: 'Top skills for 2026', meta: 'Trends • 10k readers', color: 'bg-emerald-400' },
              { title: 'Future of remote work', meta: 'Insights • 8k readers', color: 'bg-teal-400' },
              { title: 'AI in software dev', meta: 'Tech • 24k readers', color: 'bg-blue-400' },
              { title: 'Startup funding rises', meta: 'Business • 5k readers', color: 'bg-amber-400' }
            ].map((news, i) => (
              <li key={i} className="group cursor-pointer">
                <a 
                  href={`https://www.google.com/search?q=${encodeURIComponent(news.title)}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-start gap-4"
                >
                  <div className={`w-1.5 h-6 rounded-full ${news.color} opacity-40 group-hover:opacity-100 transition-opacity`}></div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 group-hover:text-emerald-600 transition-colors text-[13px] leading-snug truncate">{news.title}</p>
                    <p className="text-[10px] text-slate-400 mt-1 font-bold uppercase tracking-wider">{news.meta}</p>
                  </div>
                </a>
              </li>
            ))}

          </ul>
        </div>

        {/* New Recent Jobs Section */}
        <div className="bg-white p-7 rounded-[2rem] shadow-sm border border-slate-200/60 sticky top-[28rem] mt-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-widest">Recent Jobs</h3>
            </div>
            <Link to="/jobs" className="text-[10px] font-black text-emerald-600 hover:text-emerald-700 uppercase tracking-tighter transition-colors">View All</Link>
          </div>
          
          <div className="space-y-5">
            {jobs.length > 0 ? (
              jobs.slice(0, 3).map((job) => (
                <div key={job._id} className="group cursor-pointer">
                  <Link to="/jobs" className="block">
                    <p className="font-bold text-slate-800 group-hover:text-emerald-600 transition-colors text-[13px] leading-snug truncate">{job.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">{job.company}</span>
                      <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                      <span className="text-[10px] text-emerald-500 font-extrabold uppercase">{job.location}</span>
                    </div>
                  </Link>
                </div>
              ))
            ) : (
              <p className="text-[11px] text-slate-400 font-medium italic">No new jobs posted yet.</p>
            )}
          </div>
        </div>
      </div>

      
    </div>
  );
};

export default Home;
