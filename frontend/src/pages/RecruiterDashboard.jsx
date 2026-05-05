import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useJobStore } from '../store/jobStore';
import { useUserStore } from '../store/userStore';
import { Navigate, useSearchParams } from 'react-router-dom';
import { useRef } from 'react';
import { BASE_URL } from '../utils/config';
import {
  LayoutDashboard, PlusCircle, Briefcase, Users, LogOut,
  MapPin, DollarSign, Pencil, Trash2, X, Check, Menu,
  ChevronRight, AlertCircle, CheckCircle2, Clock, Eye, FileText, Download, User, Upload
} from 'lucide-react';

const statusColors = {
  Pending:  'bg-amber-100 text-amber-700 border-amber-200',
  Reviewed: 'bg-blue-100 text-blue-700 border-blue-200',
  Accepted: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Rejected: 'bg-red-100 text-red-700 border-red-200',
};

const RecruiterDashboard = () => {
  const { user, logout } = useAuthStore();
  const { myJobs, allApplicants, isLoading, getMyJobs, createJob, updateJob, deleteJob, getAllApplicants, updateApplicantStatus } = useJobStore();
  const { updateProfile } = useUserStore();

  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [editJob, setEditJob] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const [jobForm, setJobForm] = useState({ title: '', company: '', location: '', description: '', requirements: '', salary: '' });
  const [editForm, setEditForm] = useState({});

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

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'Recruiter') return <Navigate to="/" replace />;

  useEffect(() => {
    console.log('RecruiterDashboard: Fetching data...');
    const tab = searchParams.get('tab');
    if (tab) setActiveTab(tab);
    getMyJobs();
    getAllApplicants();
  }, [searchParams, getMyJobs, getAllApplicants]);

  useEffect(() => {
    if (activeTab === 'applicants') {
      getAllApplicants();
    }
  }, [activeTab, getAllApplicants]);

  const handleTabChange = (tabId) => {
    setSearchParams({ tab: tabId });
    setActiveTab(tabId);
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    const result = await createJob(jobForm);
    if (result?.success) {
      showToast('Job posted successfully!');
      setJobForm({ title: '', company: '', location: '', description: '', requirements: '', salary: '' });
      setActiveTab('my-jobs');
      getMyJobs();
    } else {
      showToast(result?.message || 'Failed to post job', 'error');
    }
  };

  const handleUpdateJob = async (e) => {
    e.preventDefault();
    const result = await updateJob(editJob._id, editForm);
    if (result?.success) { showToast('Job updated!'); setEditJob(null); getMyJobs(); }
    else showToast(result?.message || 'Update failed', 'error');
  };

  const handleDeleteJob = async () => {
    const result = await deleteJob(confirmDelete);
    if (result?.success) { showToast('Job deleted'); setConfirmDelete(null); }
    else showToast(result?.message || 'Delete failed', 'error');
  };

  const handleStatusChange = async (jobId, userId, status) => {
    const result = await updateApplicantStatus(jobId, userId, status);
    if (result?.success) showToast(`Status updated to ${status}`);
    else showToast(result?.message || 'Failed', 'error');
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    const fd = new FormData();
    fd.append('name', profileForm.name);
    fd.append('headline', profileForm.headline);
    fd.append('bio', profileForm.bio);
    fd.append('location', profileForm.location);
    if (profilePicFile) fd.append('profilePicture', profilePicFile);

    await updateProfile(fd);
    setProfileSaving(false);
    showToast('Profile updated successfully!');
    setProfilePicPreview(null);
    setProfilePicFile(null);
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicFile(file);
      setProfilePicPreview(URL.createObjectURL(file));
    }
  };

  const totalApplicants = allApplicants.length;
  const pendingCount = allApplicants.filter(a => a.status === 'Pending').length;
  const acceptedCount = allApplicants.filter(a => a.status === 'Accepted').length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'post-job',  label: 'Post a Job',  icon: <PlusCircle className="w-5 h-5" /> },
    { id: 'my-jobs',   label: 'My Jobs',     icon: <Briefcase className="w-5 h-5" /> },
    { id: 'applicants',label: 'Applicants',  icon: <Users className="w-5 h-5" /> },
    { id: 'profile',   label: 'Profile',     icon: <User className="w-5 h-5" /> },
  ];

  const avatarUrl = profilePicPreview || (user?.profilePicture
    ? (user.profilePicture.startsWith('http') ? user.profilePicture : `${BASE_URL}${user.profilePicture}`)
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name||'R')}&background=0f5c4a&color=fff&size=128`);

  const inputCls = "w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-colors";
  const labelCls = "block text-xs font-semibold text-slate-600 mb-1.5";

  return (
    <div className="p-6">
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-5 py-3 rounded-xl shadow-xl text-sm font-medium animate-slide-in
          ${toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-emerald-600 text-white'}`}>
          {toast.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <Check className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="font-bold text-slate-800 text-lg mb-2">Delete Job?</h3>
            <p className="text-slate-500 text-sm mb-5">This action cannot be undone. All applicants for this job will also be removed.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50">Cancel</button>
              <button onClick={handleDeleteJob} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600">Delete</button>
            </div>
          </div>
        </div>
      )}

      {editJob && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-slate-800 text-lg">Edit Job</h3>
              <button onClick={() => setEditJob(null)}><X className="w-5 h-5 text-slate-400 hover:text-slate-600" /></button>
            </div>
            <form onSubmit={handleUpdateJob} className="space-y-4">
              {[['Job Title','title'],['Company','company'],['Location','location'],['Salary','salary']].map(([l,k])=>(
                <div key={k}><label className={labelCls}>{l}</label>
                  <input className={inputCls} value={editForm[k]||''} onChange={e=>setEditForm({...editForm,[k]:e.target.value})} /></div>
              ))}
              <div><label className={labelCls}>Requirements (comma-separated)</label>
                <input className={inputCls} value={editForm.requirements||''} onChange={e=>setEditForm({...editForm,requirements:e.target.value})} /></div>
              <div><label className={labelCls}>Description</label>
                <textarea rows={3} className={inputCls+' resize-none'} value={editForm.description||''} onChange={e=>setEditForm({...editForm,description:e.target.value})} /></div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={()=>setEditJob(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DASHBOARD */}
      {activeTab==='dashboard' && (
        <div className="space-y-6 animate-fade-in">
          <div className="relative rounded-2xl p-7 text-white overflow-hidden shadow-lg"
            style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 50%, #064e3b 100%)' }}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-16 translate-x-16" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full translate-y-12 -translate-x-8" />
            <div className="relative">
              <p className="text-emerald-200 text-sm font-medium mb-1">Welcome back,</p>
              <h2 className="text-3xl font-bold mb-2 font-display">{user?.name} 👋</h2>
              <p className="text-emerald-100 text-sm">Manage your job postings and find the best candidates.</p>
              <button onClick={()=>setActiveTab('post-job')} className="mt-4 bg-white text-emerald-700 font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-emerald-50 transition-colors shadow-md">
                + Post a Job
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {label:'Jobs Posted',     value:myJobs.length,    from:'from-teal-500',    to:'to-teal-600'},
              {label:'Total Applicants',value:totalApplicants,   from:'from-emerald-500', to:'to-emerald-600'},
              {label:'Pending Review',  value:pendingCount,      from:'from-amber-500',   to:'to-amber-600'},
              {label:'Accepted',        value:acceptedCount,     from:'from-green-500',   to:'to-green-600'},
            ].map(s=>(
              <div key={s.label} className={`bg-gradient-to-br ${s.from} ${s.to} rounded-2xl p-5 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200`}>
                <p className="text-3xl font-bold mb-1 font-display">{s.value}</p>
                <p className="text-sm text-white/80 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Briefcase className="w-5 h-5 text-emerald-600" />Recent Job Posts</h3>
            {myJobs.length===0 ? <p className="text-slate-400 text-sm text-center py-6">No jobs posted yet.</p> : (
              <div className="space-y-3">
                {myJobs.slice(0,3).map(job=>(
                  <div key={job._id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-colors">
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{job.title}</p>
                      <p className="text-xs text-slate-500">{job.company} · {job.location}</p>
                    </div>
                    <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">{job.applicants?.length||0} applicants</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* POST JOB */}
      {activeTab==='post-job' && (
        <div className="max-w-2xl">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="font-bold text-slate-800 text-lg mb-1">Post a New Job</h3>
            <p className="text-sm text-slate-500 mb-6">Fill in the details below to create a new job listing.</p>
            <form onSubmit={handleCreateJob} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[['Job Title','title',true],['Company','company',true],['Location','location',true],['Salary (optional)','salary',false]].map(([l,k,req])=>(
                  <div key={k}><label className={labelCls}>{l}</label>
                    <input required={req} className={inputCls} value={jobForm[k]} onChange={e=>setJobForm({...jobForm,[k]:e.target.value})} placeholder={l} /></div>
                ))}
              </div>
              <div><label className={labelCls}>Required Skills (comma-separated)</label>
                <input required className={inputCls} value={jobForm.requirements} onChange={e=>setJobForm({...jobForm,requirements:e.target.value})} placeholder="React, Node.js, MongoDB..." /></div>
              <div><label className={labelCls}>Job Description</label>
                <textarea required rows={5} className={inputCls+' resize-none'} value={jobForm.description} onChange={e=>setJobForm({...jobForm,description:e.target.value})} placeholder="Describe the role, responsibilities, and requirements..." /></div>
              <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl text-sm transition-colors shadow-sm hover:shadow-md">
                Publish Job Listing
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MY JOBS */}
      {activeTab==='my-jobs' && (
        <div className="space-y-4">
          {isLoading ? <div className="grid place-items-center py-20"><div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>
          : myJobs.length===0 ? (
            <div className="text-center py-20 text-slate-400">
              <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No jobs posted yet</p>
              <button onClick={()=>setActiveTab('post-job')} className="mt-4 bg-emerald-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors">Post Your First Job</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {myJobs.map(job=>(
                <div key={job._id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 hover:shadow-md transition-shadow flex flex-col">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-800 text-sm truncate">{job.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5 font-medium">{job.company}</p>
                    </div>
                    <span className="ml-2 text-xs bg-emerald-50 text-emerald-700 font-semibold px-2.5 py-1 rounded-full border border-emerald-200 flex-shrink-0">{job.applicants?.length||0}</span>
                  </div>
                  <div className="space-y-1.5 mb-3">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500"><MapPin className="w-3.5 h-3.5 text-slate-400" />{job.location}</div>
                    {job.salary && <div className="flex items-center gap-1.5 text-xs text-slate-500"><DollarSign className="w-3.5 h-3.5 text-slate-400" />{job.salary}</div>}
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-3">{job.description}</p>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {(job.requirements||[]).slice(0,3).map((r,i)=>(
                      <span key={i} className="bg-teal-50 text-teal-700 text-xs px-2 py-0.5 rounded-lg font-medium border border-teal-100">{r}</span>
                    ))}
                  </div>
                  <div className="mt-auto flex gap-2">
                    <button onClick={()=>{setEditJob(job);setEditForm({...job,requirements:(job.requirements||[]).join(', ')});}}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors">
                      <Pencil className="w-3.5 h-3.5" />Edit
                    </button>
                    <button onClick={()=>setConfirmDelete(job._id)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-red-100 text-red-500 text-xs font-semibold hover:bg-red-50 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* APPLICANTS */}
      {activeTab==='applicants' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="font-bold text-slate-800">All Applicants ({allApplicants.length})</h3>
            <p className="text-xs text-slate-500 mt-1">Review and update the status of each candidate</p>
          </div>
          {allApplicants.length===0 ? (
            <div className="text-center py-16 text-slate-400">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No applicants yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    {['Candidate','Applied For','Applied On','Resume','Status','Action'].map(h=>(
                      <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {allApplicants.map((app,i)=>{
                    const pic = app.user?.profilePicture?.startsWith('/uploads')
                      ? `${BASE_URL}${app.user.profilePicture}`
                      : `https://ui-avatars.com/api/?name=${encodeURIComponent(app.user?.name||'?')}&background=e0e7ff&color=4338ca&size=64`;
                    return (
                      <tr key={i} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <img src={pic} alt={app.user?.name} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                            <div>
                              <p className="font-semibold text-slate-800">{app.user?.name||'Unknown'}</p>
                              <p className="text-xs text-slate-400">{app.user?.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-medium text-slate-700">{app.jobTitle}</p>
                          <p className="text-xs text-slate-400">{app.company}</p>
                        </td>
                        <td className="px-5 py-4 text-xs text-slate-500">
                          {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}) : '—'}
                        </td>
                        <td className="px-5 py-4">
                          {app.resumeUrl ? (
                            <a
                              href={`${BASE_URL}${app.resumeUrl}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              View Resume
                            </a>
                          ) : (
                            <span className="text-xs text-slate-400 italic">No resume</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${statusColors[app.status]||statusColors.Pending}`}>
                            {app.status}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <select
                            value={app.status}
                            onChange={e=>handleStatusChange(app.jobId, app.user?._id, e.target.value)}
                            className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 cursor-pointer"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Reviewed">Reviewed</option>
                            <option value="Accepted">Accepted</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* PROFILE */}
      {activeTab==='profile' && (
        <div className="max-w-2xl space-y-6 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="h-24 bg-gradient-to-r from-emerald-600 to-emerald-800" />
            <div className="px-6 pb-6">
              <div className="-mt-12 mb-6 flex flex-col sm:flex-row items-center sm:items-end gap-5">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-2xl ring-4 ring-white shadow-xl overflow-hidden bg-white flex items-center justify-center">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={user?.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-emerald-700 flex items-center justify-center text-white text-3xl font-bold">
                        {user?.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <button type="button" onClick={()=>profilePicInputRef.current?.click()}
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
                    <Upload className="w-6 h-6 text-white" />
                  </button>
                  <input ref={profilePicInputRef} type="file" accept="image/*" className="hidden" onChange={handleProfilePicChange} />
                </div>
                <div className="text-center sm:text-left flex-1">
                  <h2 className="font-bold text-slate-900 text-2xl tracking-tight leading-tight">{user?.name}</h2>
                  <p className="text-sm text-slate-500 font-medium">{user?.email}</p>
                </div>
              </div>

              <form onSubmit={handleProfileSave} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className={labelCls}>Company Name</label>
                    <input className={inputCls} value={profileForm.name} onChange={e=>setProfileForm({...profileForm,name:e.target.value})} /></div>
                  <div><label className={labelCls}>Location</label>
                    <input className={inputCls} value={profileForm.location} onChange={e=>setProfileForm({...profileForm,location:e.target.value})} /></div>
                </div>
                <div><label className={labelCls}>Headline</label>
                  <input className={inputCls} value={profileForm.headline} onChange={e=>setProfileForm({...profileForm,headline:e.target.value})} placeholder="e.g. Senior Recruiter at TechCorp" /></div>
                <div><label className={labelCls}>Company Description / Bio</label>
                  <textarea rows={3} className={inputCls+' resize-none'} value={profileForm.bio} onChange={e=>setProfileForm({...profileForm,bio:e.target.value})} placeholder="Tell us about your company..." /></div>
                <button type="submit" disabled={profileSaving}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl text-sm transition-colors shadow-sm disabled:opacity-60">
                  {profileSaving ? 'Saving...' : 'Update Profile'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecruiterDashboard;
