import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import { useAuthStore } from '../store/authStore';
import { useConnectionStore } from '../store/connectionStore';
import { Edit, Camera, ShieldCheck } from 'lucide-react';
import { BASE_URL } from '../utils/config';

const Profile = () => {
  const { id } = useParams();
  const { profile, getProfile, updateProfile, isLoading } = useUserStore();
  const { user: currentUser } = useAuthStore();
  const { sendRequest } = useConnectionStore();
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    name: '',
    headline: '',
    bio: '',
    location: '',
    skills: ''
  });

  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    getProfile(id);
  }, [id, getProfile]);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        headline: profile.headline || '',
        bio: profile.bio || '',
        location: profile.location || '',
        skills: profile.skills ? profile.skills.join(', ') : ''
      });
      setPreviewUrl(null);
    }
  }, [profile]);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
      setPreviewUrl(URL.createObjectURL(file));
      
      // Instantly upload the image to backend using FormData
      const data = new FormData();
      data.append('profilePicture', file);
      updateProfile(data);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    
    // We send FormData here as well because userStore.updateProfile handles FormData seamlessly
    const submitData = new FormData();
    submitData.append('name', formData.name);
    submitData.append('headline', formData.headline);
    submitData.append('bio', formData.bio);
    submitData.append('location', formData.location);
    submitData.append('skills', formData.skills);
    
    updateProfile(submitData);
    setIsEditing(false);
  };

  if (isLoading || !profile) return <div className="text-center mt-10">Loading...</div>;

  const isOwnProfile = currentUser?._id === profile._id;

  const defaultPicUrl = profile.profilePicture?.startsWith('/uploads') 
    ? `${BASE_URL}${profile.profilePicture}` 
    : (profile.profilePicture || 'https://via.placeholder.com/150');

  const displayPicUrl = previewUrl || defaultPicUrl;

  return (
    <div className="max-w-[900px] mx-auto py-10 px-4 sm:px-6 animate-fade-in font-sans">
      <div className="bg-white shadow-2xl shadow-slate-200/60 rounded-[2.5rem] overflow-hidden border border-slate-100">
        {/* Cover Photo Placeholder */}
        <div className="h-40 bg-gradient-to-r from-emerald-600 to-teal-800"></div>
        
        <div className="px-8 py-6 relative">
          
          {/* Profile Image Section */}
          <div className="absolute -top-16">
            <div 
              className={`relative group h-32 w-32 rounded-[2rem] border-4 border-white bg-slate-100 shadow-xl overflow-hidden ${isOwnProfile ? 'cursor-pointer' : ''}`}
              onClick={() => isOwnProfile && fileInputRef.current?.click()}
            >
              <img
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                src={displayPicUrl}
                alt={profile.name}
              />
              {isOwnProfile && (
                <div className="absolute inset-0 bg-emerald-900/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center backdrop-blur-[2px]">
                  <Camera className="text-white h-8 w-8 drop-shadow-lg" />
                </div>
              )}
            </div>
            {isOwnProfile && (
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageChange} 
                accept=".jpg,.jpeg,.png" 
                className="hidden" 
              />
            )}
          </div>
          
          <div className="mt-20 flex flex-col md:flex-row justify-between items-start gap-4">
            <div>
              <h3 className="text-3xl font-bold text-slate-900 leading-tight">{profile.name}</h3>
              <p className="mt-1 text-base font-bold text-emerald-600 uppercase tracking-widest">{profile.headline || 'Member'}</p>
              <div className="mt-3 flex items-center gap-2 text-slate-400 font-medium text-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                {profile.location || 'Consultancy Hub Verified'}
              </div>
            </div>
            <div className="flex gap-3">
              {isOwnProfile && !isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-100 transition-all border border-slate-100"
                >
                  <Edit className="h-4 w-4" />
                  Edit Profile
                </button>
              )}
              {!isOwnProfile && (
                <button 
                  onClick={() => sendRequest(profile._id)}
                  className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold text-xs hover:bg-emerald-700 shadow-lg shadow-emerald-900/20 transition-all active:scale-95"
                >
                  Connect
                </button>
              )}
            </div>
          </div>
        </div>

        {isEditing && isOwnProfile ? (
          <div className="px-8 py-8 border-t border-slate-50 bg-slate-50/20">
            <form onSubmit={onSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest ml-1">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={onChange}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/50 transition-all font-medium"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest ml-1">Headline</label>
                  <input
                    type="text"
                    name="headline"
                    value={formData.headline}
                    onChange={onChange}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/50 transition-all font-medium"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest ml-1">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={onChange}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/50 transition-all font-medium"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest ml-1">Skills (comma separated)</label>
                  <input
                    type="text"
                    name="skills"
                    value={formData.skills}
                    onChange={onChange}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/50 transition-all font-medium"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest ml-1">Professional Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={onChange}
                  rows="4"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/50 transition-all font-medium resize-none"
                ></textarea>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-3 bg-white border border-slate-200 text-slate-500 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-10 py-3 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-900/20 transition-all"
                >
                  Update Profile
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="px-8 py-10 border-t border-slate-50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="md:col-span-2 space-y-8">
                <div>
                  <h4 className="text-[10px] font-bold text-emerald-600 uppercase tracking-[0.2em] mb-4">Biography</h4>
                  <p className="text-slate-600 text-[15px] leading-relaxed font-medium">
                    {profile.bio || 'This user hasn\'t shared their professional story yet.'}
                  </p>
                </div>
              </div>
              <div>
                <h4 className="text-[10px] font-bold text-emerald-600 uppercase tracking-[0.2em] mb-4">Core Expertise</h4>
                <div className="flex flex-wrap gap-2">
                   {profile.skills && profile.skills.map((skill, index) => (
                    <span key={index} className="inline-flex items-center px-4 py-1.5 rounded-lg text-[10px] font-bold bg-slate-50 text-slate-500 border border-slate-100 uppercase tracking-wider">
                      {skill}
                    </span>
                  ))}
                  {!profile.skills?.length && <p className="text-xs text-slate-400 font-medium italic">No skills listed.</p>}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
