import { useEffect, useState, useRef } from 'react';
import { useJobStore } from '../store/jobStore';
import { useAuthStore } from '../store/authStore';
import { Briefcase, MapPin, DollarSign, Search, Users, X, Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

const Jobs = () => {
  const { jobs, getJobs, applyJob, createJob, isLoading, getMyApplications } = useJobStore();
  const { user } = useAuthStore();
  const [keyword, setKeyword] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState(null);

  // Resume modal state
  const [applyModalJob, setApplyModalJob] = useState(null);
  const [applyResume, setApplyResume] = useState(null);
  const [applySubmitting, setApplySubmitting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);
  
  // Job Form State
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    description: '',
    requirements: '',
    salary: ''
  });

  useEffect(() => {
    getJobs();
  }, [getJobs]);

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
      showToast('Application submitted successfully! 🎉');
      setApplyModalJob(null);
      getJobs(); // refresh to show updated applicant count
    } else {
      showToast(result?.message || 'Failed to apply', 'error');
    }
  };

  const onSearch = (e) => {
    e.preventDefault();
    getJobs(keyword);
  };

  const onFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onFormSubmit = (e) => {
    e.preventDefault();
    createJob(formData);
    setShowForm(false);
    setFormData({ title: '', company: '', location: '', description: '', requirements: '', salary: '' });
  };

  return (
    <div className="max-w-[1200px] mx-auto py-8 px-4 sm:px-6 animate-fade-in font-sans">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-5 py-3 rounded-xl shadow-xl text-sm font-medium transition-all animate-slide-in
          ${toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-emerald-600 text-white'}`}>
          {toast.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
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
      <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
        <div className="flex-grow max-w-2xl w-full">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Explore Opportunities</h1>
          <p className="text-slate-500 text-sm mb-6 font-medium">Find your next career move with Consultancy Hub verified partners.</p>
          <form onSubmit={onSearch} className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors">
              <Search className="h-5 w-5" />
            </div>
            <input
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/50 transition-all placeholder-slate-400 font-medium"
              type="text"
              placeholder="Search by title, skills, or company..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            /> 
          </form>
        </div>

        {(user?.role === 'Recruiter' || user?.role === 'Admin') && (
          <button
            onClick={() => setShowForm(!showForm)}
            className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-sm transition-all shadow-lg ${
              showForm 
                ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' 
                : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-900/20'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            {showForm ? 'Cancel' : 'Post New Job'}
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 mb-12 animate-slide-up">
          <h3 className="text-xl font-bold text-slate-900 mb-6">Create Job Posting</h3>
          <form onSubmit={onFormSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest ml-1">Job Title</label>
                <input required type="text" name="title" value={formData.title} onChange={onFormChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20" placeholder="e.g. Senior Software Engineer" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest ml-1">Company</label>
                <input required type="text" name="company" value={formData.company} onChange={onFormChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20" placeholder="Your Company Name" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest ml-1">Location</label>
                <input required type="text" name="location" value={formData.location} onChange={onFormChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20" placeholder="e.g. Remote / New York" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest ml-1">Salary Range</label>
                <input type="text" name="salary" value={formData.salary} onChange={onFormChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20" placeholder="e.g. $100k - $120k" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest ml-1">Key Requirements (comma separated)</label>
              <input required type="text" name="requirements" value={formData.requirements} onChange={onFormChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20" placeholder="React, Node.js, AWS..." />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest ml-1">Job Description</label>
              <textarea required rows="4" name="description" value={formData.description} onChange={onFormChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none" placeholder="Describe the role and responsibilities..."></textarea>
            </div>
            <button type="submit" className="bg-emerald-600 text-white px-10 py-3.5 rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-900/20">Publish Vacancy</button>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-4"></div>
          <p className="text-slate-400 font-medium">Curating opportunities...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {jobs.length === 0 ? (
            <div className="col-span-full text-center py-24 bg-white rounded-[2.5rem] border border-slate-100">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-10 h-10 text-slate-200" />
              </div>
              <p className="text-slate-500 font-bold">No opportunities found for your search.</p>
            </div>
          ) : (
            jobs.map((job) => (
              <div key={job._id} className="bg-white rounded-[2rem] border border-slate-100 p-7 flex flex-col shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden shadow-inner group-hover:scale-105 transition-transform">
                      <img 
                        src={job.recruiter?.profilePicture?.startsWith('/uploads') ? `http://localhost:5000${job.recruiter.profilePicture}` : (job.recruiter?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(job.company)}&background=0d4f3f&color=fff`)} 
                        alt={job.company} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full uppercase tracking-tighter">Verified</span>
                  </div>
                  
                  <h4 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors leading-tight mb-1">{job.title}</h4>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">{job.company}</p>
                  
                  <div className="space-y-3 mb-8">
                    <div className="flex items-center text-xs font-bold text-slate-600">
                      <MapPin className="h-3.5 w-3.5 mr-2 text-emerald-600" />
                      {job.location}
                    </div>
                    {job.salary && (
                      <div className="flex items-center text-xs font-bold text-slate-600">
                        <DollarSign className="h-3.5 w-3.5 mr-2 text-emerald-600" />
                        {job.salary}
                      </div>
                    )}
                    <div className="flex items-center text-xs font-bold text-slate-600">
                      <Users className="h-3.5 w-3.5 mr-2 text-emerald-600" />
                      {job.applicants.length} Applicants
                    </div>
                  </div>

                  <p className="text-slate-500 text-[13px] leading-relaxed line-clamp-3 mb-6 font-medium">{job.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-8">
                    {job.requirements.slice(0, 3).map((req, index) => (
                      <span key={index} className="bg-slate-50 text-slate-500 text-[10px] font-bold px-3 py-1.5 rounded-lg border border-slate-100 uppercase tracking-tighter">{req}</span>
                    ))}
                    {job.requirements.length > 3 && <span className="text-[10px] text-slate-400 font-bold ml-1">+{job.requirements.length - 3}</span>}
                  </div>
                </div>

                <button 
                  onClick={() => openApplyModal(job)}
                  disabled={user?.role === 'Recruiter'}
                  className={`w-full py-4 rounded-2xl font-bold text-sm transition-all shadow-lg ${
                    user?.role === 'Recruiter' 
                      ? 'bg-slate-50 text-slate-300 cursor-not-allowed border border-slate-100' 
                      : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-900/20 active:scale-[0.98]'
                  }`}
                >
                  {user?.role === 'Recruiter' ? 'Restricted Access' : 'Apply Now'}
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Jobs;
