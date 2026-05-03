import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { usePostStore } from '../../store/postStore';
import { ThumbsUp, MessageSquare, Trash2, Send, Share2, Shield } from 'lucide-react';

const PostItem = ({ post }) => {
  const { user } = useAuthStore();
  const { toggleLike, addComment, deletePost } = usePostStore();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');

  const isLiked = post.likes.includes(user?._id);

  const onCommentSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addComment(post._id, commentText);
    setCommentText('');
  };

  const formatTime = (dateString) => {
    const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const authorPicUrl = post.author?.profilePicture?.startsWith('/uploads') 
    ? `http://localhost:5000${post.author.profilePicture}` 
    : (post.author?.profilePicture || 'https://via.placeholder.com/150');

  const currentUserPicUrl = user?.profilePicture?.startsWith('/uploads') 
    ? `http://localhost:5000${user.profilePicture}` 
    : (user?.profilePicture || 'https://via.placeholder.com/150');

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 mb-6 overflow-hidden font-sans group animate-fade-in">
      
      {/* Post Header */}
      <div className="p-5 pb-3 flex justify-between items-start">
        <div className="flex items-center">
          <Link to={`/profile/${post.author._id}`}>
            <img
              src={authorPicUrl}
              alt={post.author.name}
              className="h-12 w-12 rounded-xl mr-4 object-cover border border-slate-100 shadow-sm group-hover:scale-105 transition-transform"
            />
          </Link>
          <div>
            <Link to={`/profile/${post.author._id}`} className="font-bold text-slate-900 hover:text-emerald-600 transition-colors text-sm leading-tight">
              {post.author.name}
            </Link>
            <p className="text-[11px] text-slate-400 mt-0.5 font-medium uppercase tracking-wider">{post.author.headline || 'Member'}</p>
            <p className="text-[10px] text-slate-300 mt-1 flex items-center gap-1.5 font-medium">
              {formatTime(post.createdAt)}
              <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
              <span className="flex items-center gap-1"><Shield className="w-2.5 h-2.5" /> Public</span>
            </p>
          </div>
        </div>
        {user?._id === post.author._id && (
          <button onClick={() => deletePost(post._id)} className="text-slate-300 hover:text-red-500 transition-all p-2 rounded-xl hover:bg-red-50">
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Post Content */}
      <div className="px-5 py-3">
        <p className="text-slate-700 whitespace-pre-wrap text-[15px] leading-relaxed font-medium">{post.content}</p>
      </div>

      {/* Post Image */}
      {post.image && (
        <div className="mt-2 w-full bg-slate-50 flex justify-center border-y border-slate-100">
          <img
            src={`http://localhost:5000${post.image}`}
            alt="Post content"
            className="max-h-[500px] w-full object-cover"
          />
        </div>
      )}

      {/* Post Stats */}
      <div className="px-5 py-4 flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-50 font-bold uppercase tracking-widest">
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-emerald-600 text-white rounded-full p-1.5 shadow-md shadow-emerald-900/20">
            <ThumbsUp className="h-2.5 w-2.5" />
          </div>
          <span className="hover:text-emerald-600 cursor-pointer transition-colors">{post.likes.length} Likes</span>
        </div>
        <div className="flex gap-4">
          <span className="hover:text-emerald-600 cursor-pointer transition-colors">{post.comments.length} Comments</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-3 py-2 flex justify-between items-center gap-1">
        <button
          onClick={() => toggleLike(post._id)}
          className={`flex-1 flex items-center justify-center py-3 px-2 rounded-xl transition-all duration-200 ${isLiked ? 'bg-emerald-50 text-emerald-600 font-bold' : 'text-slate-500 hover:bg-slate-50 font-semibold'}`}
        >
          <ThumbsUp className={`h-4.5 w-4.5 mr-2 ${isLiked ? 'fill-current' : ''}`} />
          <span className="text-xs">Like</span>
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex-1 flex items-center justify-center py-3 px-2 rounded-xl text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 font-semibold transition-all duration-200"
        >
          <MessageSquare className="h-4.5 w-4.5 mr-2" />
          <span className="text-xs">Comment</span>
        </button>
        <button className="flex-1 flex items-center justify-center py-3 px-2 rounded-xl text-slate-500 hover:bg-slate-50 font-semibold transition-all duration-200">
          <Share2 className="h-4.5 w-4.5 mr-2" />
          <span className="text-xs">Share</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="px-5 py-5 border-t border-slate-50 bg-slate-50/30">
          <form onSubmit={onCommentSubmit} className="flex mb-6 items-center gap-3">
            <img
              src={currentUserPicUrl}
              alt="You"
              className="h-10 w-10 rounded-xl object-cover border border-slate-100 shadow-sm"
            />
            <div className="flex-grow relative">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Share your thoughts..."
                className="w-full rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none pr-12 font-medium placeholder-slate-400"
              />
              {commentText.trim() && (
                <button 
                  type="submit" 
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-emerald-600 p-2 rounded-lg hover:bg-emerald-50 transition-colors"
                >
                  <Send className="h-4 w-4" />
                </button>
              )}
            </div>
          </form>

          <div className="space-y-5">
            {post.comments.map((comment, index) => {
              const commentUserPicUrl = comment.user?.profilePicture?.startsWith('/uploads') 
                ? `http://localhost:5000${comment.user.profilePicture}` 
                : (comment.user?.profilePicture || 'https://via.placeholder.com/150');

              return (
                <div key={index} className="flex gap-3 animate-slide-up">
                  <Link to={`/profile/${comment.user._id}`} className="flex-shrink-0">
                    <img
                      src={commentUserPicUrl}
                      alt={comment.user.name}
                      className="h-9 w-9 rounded-lg object-cover border border-slate-100"
                    />
                  </Link>
                  <div className="flex-grow">
                    <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
                      <div className="flex justify-between items-start mb-1">
                        <div>
                          <Link to={`/profile/${comment.user._id}`} className="font-bold text-xs text-slate-800 hover:text-emerald-600 transition-colors">
                            {comment.user.name}
                          </Link>
                          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">
                            {comment.user.headline || 'Member'}
                          </p>
                        </div>
                        <span className="text-[10px] text-slate-300 font-bold uppercase tracking-tighter">
                          {formatTime(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mt-2 leading-relaxed font-medium">{comment.text}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostItem;
