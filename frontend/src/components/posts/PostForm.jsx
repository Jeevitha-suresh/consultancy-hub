import { useState, useRef } from 'react';
import { usePostStore } from '../../store/postStore';
import { useAuthStore } from '../../store/authStore';
import { BASE_URL } from '../../utils/config';
import { Image, Send, X } from 'lucide-react';

const PostForm = () => {
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const { createPost } = usePostStore();
  const { user } = useAuthStore();
  const fileInputRef = useRef(null);

  const onSubmit = (e) => {
    e.preventDefault();
    if (!content.trim() && !image) return;

    const formData = new FormData();
    formData.append('content', content);
    if (image) {
      formData.append('image', image);
    }

    createPost(formData);
    setContent('');
    setImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const profilePicUrl = user?.profilePicture?.startsWith('/uploads') 
    ? `${BASE_URL}${user.profilePicture}` 
    : (user?.profilePicture || 'https://via.placeholder.com/150');

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 mb-6 font-sans">
      <div className="flex items-start space-x-4">
        <img
          className="h-11 w-11 rounded-xl object-cover border border-slate-100 shadow-sm"
          src={profilePicUrl}
          alt={user?.name || 'User'}
        />
        <div className="flex-1">
          <form onSubmit={onSubmit}>
            <textarea
              className="w-full bg-slate-50 text-slate-800 rounded-xl sm:text-sm p-4 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 border border-transparent focus:border-emerald-500/30 transition-all resize-none placeholder-slate-400 font-medium"
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            ></textarea>
            
            {image && (
              <div className="mt-3 relative group">
                <img 
                  src={URL.createObjectURL(image)} 
                  alt="Preview" 
                  className="max-h-64 w-full rounded-2xl object-cover border border-slate-100 shadow-md"
                />
                <button 
                  type="button" 
                  onClick={() => setImage(null)}
                  className="absolute top-3 left-3 bg-slate-900/60 backdrop-blur-md text-white rounded-full p-2 hover:bg-slate-900 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center">
              <div className="flex gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files[0])}
                  className="hidden"
                  ref={fileInputRef}
                  id="image-upload"
                />
                <label 
                  htmlFor="image-upload" 
                  className="flex items-center gap-2 text-slate-500 hover:bg-emerald-50 hover:text-emerald-700 px-4 py-2 rounded-xl cursor-pointer transition-all duration-200"
                >
                  <Image className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold uppercase tracking-wider">Media</span>
                </label>
              </div>
              <button
                type="submit"
                disabled={!content.trim() && !image}
                className="bg-emerald-600 text-white px-8 py-2 rounded-xl font-bold text-sm hover:bg-emerald-700 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-900/20 active:scale-[0.98] flex items-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                Post
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostForm;
