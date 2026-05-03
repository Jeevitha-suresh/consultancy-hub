import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import { useJobStore } from '../store/jobStore';
import { useUserStore } from '../store/userStore';
import { Navigate } from 'react-router-dom';
import {
  Home, Briefcase, ClipboardList, User, Search, MapPin,
  DollarSign, ChevronRight, CheckCircle2, XCircle, Clock,
  LogOut, Upload, X, Menu, FileText, Download, AlertCircle
} from 'lucide-react';

const statusConfig = {
  Pending:  { color: 'bg-amber-100 text-amber-700 border-amber-200',  icon: <Clock className="w-3.5 h-3.5" /> },
  Reviewed: { color: 'bg-blue-100 text-blue-700 border-blue-200',     icon: <Clock className="w-3.5 h-3.5" /> },
  Accepted: { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  Rejected: { color: 'bg-red-100 text-red-700 border-red-200',        icon: <XCircle className="w-3.5 h-3.5" /> },
};

const CandidateDashboard = () => {
  const { user, logout } = useAuthStore();
  const { jobs, myApplications, isLoading, getJobs, applyJob, getMyApplications } = useJobStore();
  const { updateProfile } = useUserStore();

  const [activeTab, setActiveTab] = useState('home');
  const [keyword, setKeyword] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [toast, setToast] = useState(null);
  const [appliedIds, setAppliedIds] = useState(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Resume modal state
  const [applyModalJob, setApplyModalJob] = useState(null); // job being applied to
  const [applyResume, setApplyResume] = useState(null);     // File | null
  const [applySubmitting, setApplySubmitting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    headline: user?.headline || '',
    bio: user?.bio || '',
    location: user?.location || '',
    skills: (user?.skills || []).join(', '),
  });
  const [resumeFile, setResumeFile] = useState(null);
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState(null);
  const [profileSaving, setProfileSaving] = useState(false);
  const profilePicInputRef = useRef(null);

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'User') return <Navigate to="/" replace />;

  useEffect(() => { getJobs(); getMyApplications(); }, []);

  useEffect(() => {
    if (myApplications.length > 0) {
      setAppliedIds(new Set(myApplications.map(a => a._id)));
    }
  }, [myApplications]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const openApplyModal = (job) => {
    setApplyResume(null);
    setApplyModalJob(job);
  };

  const handleApplySubmit = async () => {
    if (!applyModalJob) return;
    setApplySubmitting(true);
    const result = await applyJob(applyModalJob._id, applyResume);
    setApplySubmitting(false);
    if (result?.success) {
      setAppliedIds(prev => new Set([...prev, applyModalJob._id]));
      showToast('Application submitted successfully! 🎉');
      setApplyModalJob(null);
      getMyApplications();
    } else {
      showToast(result?.message || 'Failed to apply', 'error');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    getJobs(keyword);
  };

  const filteredJobs = locationFilter
    ? jobs.filter(j => j.location?.toLowerCase().includes(locationFilter.toLowerCase()))
    : jobs;

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    const fd = new FormData();
    fd.append('name', profileForm.name);
    fd.append('headline', profileForm.headline);
    fd.append('bio', profileForm.bio);
    fd.append('location', profileForm.location);
    fd.append('skills', profileForm.skills);
    if (resumeFile) fd.append('resume', resumeFile);
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

  const navItems = [
    { id: 'home', label: 'Home', icon: <Home className="w-5 h-5" /> },
    { id: 'jobs', label: 'Browse Jobs', icon: <Briefcase className="w-5 h-5" /> },
    { id: 'applications', label: 'My Applications', icon: <ClipboardList className="w-5 h-5" /> },
    { id: 'profile', label: 'Profile', icon: <User className="w-5 h-5" /> },
  ];

  const profilePicUrl = profilePicPreview || (user?.profilePicture
    ? (user.profilePicture.startsWith('http') ? user.profilePicture : `http://localhost:5000${user.profilePicture}`)
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=0d9488&color=fff&size=128`);

  return (
    <div className="p-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-5 py-3 rounded-xl shadow-xl text-sm font-medium transition-all animate-slide-in
          ${toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'}`}>
          {toast.type === 'error' ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* ── Resume Upload Modal ── */}
      {applyModalJob && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-teal-600 to-emerald-600 p-5 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg">Apply for Position</h3>
                  <p className="text-teal-100 text-sm mt-0.5 truncate">{applyModalJob.title} · {applyModalJob.company}</p>
                </div>
                <button onClick={() => setApplyModalJob(null)}
                  className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-600">
                Upload your resume for <span className="font-semibold text-slate-800">{applyModalJob.title}</span>.
                {user?.resume && !applyResume && (
                  <span className="block mt-1 text-xs text-teal-600">✓ Your profile resume will be used if you skip.</span>
                )}
              </p>

              {/* Drop Zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  const file = e.dataTransfer.files[0];
                  if (file) setApplyResume(file);
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`relative flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200
                  ${dragOver ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/40'}`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={(e) => setApplyResume(e.target.files[0] || null)}
                />
                {applyResume ? (
                  <>
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                      <FileText className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-slate-800 text-sm">{applyResume.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{(applyResume.size / 1024).toFixed(0)} KB · Click to change</p>
                    </div>
                    <button type="button" onClick={(e) => { e.stopPropagation(); setApplyResume(null); }}
                      className="absolute top-2 right-2 w-6 h-6 bg-slate-100 hover:bg-red-100 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                      <Upload className="w-6 h-6 text-slate-400" />
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-slate-700 text-sm">Drop your resume here</p>
                      <p className="text-xs text-slate-400 mt-0.5">PDF, DOC, DOCX · Max 5MB</p>
                    </div>
                  </>
                )}
              </div>

              {!user?.resume && !applyResume && (
                <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  No profile resume found. Please upload one above.
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 pb-6 flex gap-3">
              <button onClick={() => setApplyModalJob(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button
                onClick={handleApplySubmit}
                disabled={applySubmitting || (!applyResume && !user?.resume)}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2">
                {applySubmitting ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Submitting...</>
                ) : (
                  <><CheckCircle2 className="w-4 h-4" />Submit Application</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── HOME TAB ── */}
      {activeTab === 'home' && (
        <div className="space-y-6">
          {/* Welcome Banner */}
          <div className="relative bg-gradient-to-br from-teal-600 to-emerald-700 rounded-2xl p-7 text-white overflow-hidden shadow-lg">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-16 translate-x-16" />
            <div className="relative">
              <p className="text-teal-200 text-sm font-medium mb-1">Welcome back,</p>
              <h2 className="text-3xl font-bold mb-2">{user?.name} 👋</h2>
              <p className="text-teal-100 text-sm max-w-md">{user?.headline || 'Complete your profile to get better job recommendations.'}</p>
              <button onClick={() => setActiveTab('jobs')} className="mt-4 bg-white text-teal-700 font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-teal-50 transition-colors shadow-md">
                Browse Jobs →
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Jobs Available', value: jobs.length, color: 'from-blue-500 to-blue-600', icon: <Briefcase className="w-6 h-6 text-white/80" /> },
              { label: 'My Applications', value: myApplications.length, color: 'from-violet-500 to-violet-600', icon: <ClipboardList className="w-6 h-6 text-white/80" /> },
              { label: 'Accepted', value: myApplications.filter(a => a.status === 'Accepted').length, color: 'from-emerald-500 to-emerald-600', icon: <CheckCircle2 className="w-6 h-6 text-white/80" /> },
            ].map(s => (
              <div key={s.label} className={`bg-gradient-to-br ${s.color} rounded-2xl p-5 text-white shadow-md`}>
                <div className="flex items-center justify-between mb-3">{s.icon}<span className="text-3xl font-bold">{s.value}</span></div>
                <p className="text-sm text-white/80 font-medium">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Recent Applications */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><ClipboardList className="w-5 h-5 text-teal-600" />Recent Applications</h3>
            {myApplications.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-6">No applications yet. Browse jobs and apply!</p>
            ) : (
              <div className="space-y-3">
                {myApplications.slice(0, 3).map(app => {
                  const cfg = statusConfig[app.status] || statusConfig.Pending;
                  return (
                    <div key={app._id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">{app.title}</p>
                        <p className="text-xs text-slate-500">{app.company} • {app.location}</p>
                      </div>
                      <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${cfg.color}`}>{cfg.icon}{app.status}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── JOBS TAB ── */}
      {activeTab === 'jobs' && (
        <div className="space-y-5">
          {/* Search & Filter */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by title, skills, company..."
                  value={keyword}
                  onChange={e => setKeyword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400"
                />
              </div>
              <div className="relative sm:w-48">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter by location"
                  value={locationFilter}
                  onChange={e => setLocationFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400"
                />
              </div>
              <button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors">
                Search
              </button>
            </form>
          </div>

          {isLoading ? (
            <div className="grid place-items-center py-20"><div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredJobs.length === 0 ? (
                <div className="col-span-full text-center py-16 text-slate-400">
                  <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No jobs found. Try a different search.</p>
                </div>
              ) : filteredJobs.map(job => {
                const applied = appliedIds.has(job._id);
                return (
                  <div key={job._id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-100 to-emerald-100 flex items-center justify-center flex-shrink-0">
                        <Briefcase className="w-5 h-5 text-teal-600" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-800 text-sm leading-tight">{job.title}</h4>
                        <p className="text-xs text-slate-500 mt-0.5 font-medium">{job.company}</p>
                      </div>
                    </div>
                    <div className="space-y-1.5 mb-3">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />{job.location}
                      </div>
                      {job.salary && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <DollarSign className="w-3.5 h-3.5 text-slate-400" />{job.salary}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2 mb-3">{job.description}</p>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {job.requirements.slice(0, 3).map((r, i) => (
                        <span key={i} className="bg-teal-50 text-teal-700 text-xs px-2 py-0.5 rounded-lg font-medium border border-teal-100">{r}</span>
                      ))}
                      {job.requirements.length > 3 && <span className="text-xs text-slate-400">+{job.requirements.length - 3}</span>}
                    </div>
                    <div className="mt-auto">
                      <button
                        onClick={() => !applied && openApplyModal(job)}
                        disabled={applied}
                        className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200
                          ${applied
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : 'bg-teal-600 hover:bg-teal-700 text-white shadow-sm hover:shadow-md'}`}
                      >
                        {applied ? '✓ Applied' : 'Apply Now'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── MY APPLICATIONS TAB ── */}
      {activeTab === 'applications' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <h3 className="font-bold text-slate-800">All Applications ({myApplications.length})</h3>
              <p className="text-xs text-slate-500 mt-1">Track the status of your job applications</p>
            </div>
            {myApplications.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No applications yet</p>
                <p className="text-sm mt-1">Apply to jobs to see them here</p>
                <button onClick={() => setActiveTab('jobs')} className="mt-4 bg-teal-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-teal-700 transition-colors">
                  Browse Jobs
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {myApplications.map(app => {
                  const cfg = statusConfig[app.status] || statusConfig.Pending;
                  return (
                    <div key={app._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-100 to-emerald-100 flex items-center justify-center flex-shrink-0">
                          <Briefcase className="w-5 h-5 text-teal-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{app.title}</p>
                          <p className="text-sm text-slate-500">{app.company} · {app.location}</p>
                          {app.appliedAt && (
                            <p className="text-xs text-slate-400 mt-0.5">Applied {new Date(app.appliedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                          )}
                        </div>
                      </div>
                      <span className={`self-start sm:self-center flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${cfg.color}`}>
                        {cfg.icon}{app.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── PROFILE TAB ── */}
      {activeTab === 'profile' && (
        <div className="max-w-2xl space-y-5">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {/* Cover */}
            <div className="h-24 bg-gradient-to-r from-teal-500 to-emerald-600" />
            <div className="px-6 pb-6">
              <div className="-mt-12 mb-6 flex flex-col sm:flex-row items-center sm:items-end gap-5">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-2xl ring-4 ring-white shadow-xl overflow-hidden bg-white flex items-center justify-center">
                    {profilePicUrl ? (
                      <img src={profilePicUrl} alt={user?.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white text-3xl font-bold">
                        {user?.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => profilePicInputRef.current?.click()}
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl"
                  >
                    <Upload className="w-6 h-6 text-white" />
                  </button>
                  <input
                    ref={profilePicInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleProfilePicChange}
                  />
                </div>
                <div className="text-center sm:text-left flex-1">
                  <h2 className="font-bold text-slate-900 text-2xl tracking-tight leading-tight">{user?.name}</h2>
                  <p className="text-sm text-slate-500 font-medium">{user?.email}</p>
                </div>
              </div>

              <form onSubmit={handleProfileSave} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: 'Full Name', key: 'name', type: 'text' },
                    { label: 'Location', key: 'location', type: 'text', placeholder: 'City, Country' },
                    { label: 'Headline', key: 'headline', type: 'text', placeholder: 'e.g. Frontend Developer' },
                    { label: 'Skills (comma-separated)', key: 'skills', type: 'text', placeholder: 'React, Node.js, ...' },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">{f.label}</label>
                      <input
                        type={f.type}
                        value={profileForm[f.key]}
                        placeholder={f.placeholder || ''}
                        onChange={e => setProfileForm({ ...profileForm, [f.key]: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400"
                      />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Bio</label>
                  <textarea
                    rows={3}
                    value={profileForm.bio}
                    placeholder="Tell recruiters about yourself..."
                    onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 resize-none"
                  />
                </div>

                {/* Resume Upload */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Resume (PDF)</label>
                  <label className="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-teal-400 hover:bg-teal-50/50 transition-colors">
                    <Upload className="w-5 h-5 text-teal-500" />
                    <span className="text-sm text-slate-500">{resumeFile ? resumeFile.name : (user?.resume ? 'Resume uploaded — click to replace' : 'Click to upload resume')}</span>
                    <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={e => setResumeFile(e.target.files[0])} />
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={profileSaving}
                  className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl text-sm transition-colors shadow-sm"
                >
                  {profileSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidateDashboard;
