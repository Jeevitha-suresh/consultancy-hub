import { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import { useMessageStore } from '../store/messageStore';
import { useConnectionStore } from '../store/connectionStore';
import { useJobStore } from '../store/jobStore';
import { MessageSquare, Send } from 'lucide-react';

const Messaging = () => {
  const { user } = useAuthStore();
  const { connections, getConnections } = useConnectionStore();
  const { messages, conversations, getMessages, getConversations, sendMessage, initSocket, disconnectSocket } = useMessageStore();
  const { allApplicants, myApplications, getAllApplicants, getMyApplications } = useJobStore();
  
  const [selectedUser, setSelectedUser] = useState(null);
  const [content, setContent] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    getConnections();
    getConversations();
    if (user?.role === 'Recruiter') {
      getAllApplicants();
    } else if (user?.role === 'User') {
      getMyApplications();
    }
    
    if (user) {
      initSocket(user._id);
    }
    return () => {
      disconnectSocket();
    };
  }, [user, getConnections, getConversations, getAllApplicants, getMyApplications, initSocket, disconnectSocket]);

  // Combine conversations, connections, and applicants/recruiters for a complete sidebar
  const uniqueUsers = new Map();

  // 1. Add people from conversations
  conversations.forEach(c => {
    uniqueUsers.set(String(c._id), { ...c });
  });

  // 2. Add connections
  connections.forEach(conn => {
    const id = String(conn._id || conn.id);
    if (!uniqueUsers.has(id)) {
      uniqueUsers.set(id, { ...conn, _id: id, headline: conn.headline || 'Network Member' });
    }
  });

  // 3. Add applicants (if recruiter)
  if (user?.role === 'Recruiter') {
    allApplicants.forEach(app => {
      if (app.user) {
        const id = String(app.user._id || app.user.id);
        if (!uniqueUsers.has(id)) {
          uniqueUsers.set(id, { ...app.user, _id: id, headline: `Applicant: ${app.jobTitle}` });
        }
      }
    });
  }

  // 4. Add recruiters (if user)
  if (user?.role === 'User') {
    myApplications.forEach(app => {
      if (app.recruiter) {
        const id = String(app.recruiter._id || app.recruiter.id);
        if (!uniqueUsers.has(id)) {
          uniqueUsers.set(id, { ...app.recruiter, _id: id, headline: `Recruiter: ${app.company || app.recruiter.company || 'Employer'}` });
        }
      }
    });
  }

  const chatList = Array.from(uniqueUsers.values());

  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id);
    }
  }, [selectedUser, getMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const onSend = (e) => {
    e.preventDefault();
    if (!content.trim() || !selectedUser) return;
    sendMessage(user._id, selectedUser._id, content);
    setContent('');
  };

  return (
    <div className="h-full max-w-[1200px] mx-auto p-4 sm:p-6 animate-fade-in font-sans overflow-hidden">
      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 h-full flex overflow-hidden border border-slate-100">
        
        {/* Contacts Sidebar */}
        <div className="w-1/3 border-r border-slate-100 flex flex-col bg-slate-50/30">
          <div className="p-6 border-b border-slate-100 bg-white/50 backdrop-blur-md">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-600" />
              Messaging
            </h2>
          </div>
          <div className="overflow-y-auto flex-grow p-3 space-y-1">
            {chatList.length === 0 ? (
              <div className="py-20 text-center px-4">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">No conversations yet.</p>
              </div>
            ) : (
              chatList.map((contact) => (
                <div
                  key={contact._id}
                  onClick={() => setSelectedUser(contact)}
                  className={`flex items-center p-4 rounded-2xl cursor-pointer transition-all duration-200 group ${selectedUser?._id === contact._id ? 'bg-white shadow-lg shadow-slate-200 ring-1 ring-emerald-500/20' : 'hover:bg-white/60'}`}
                >
                  <div className="relative">
                    <img
                      src={contact.profilePicture?.startsWith('/uploads') ? `http://localhost:5000${contact.profilePicture}` : (contact.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(contact.name)}&background=0d4f3f&color=fff`)}
                      alt={contact.name}
                      className="h-12 w-12 rounded-xl object-cover shadow-sm"
                    />
                    <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></div>
                  </div>
                  <div className="ml-4 overflow-hidden flex-1">
                    <div className="flex justify-between items-baseline">
                      <h4 className={`font-bold text-sm transition-colors truncate ${selectedUser?._id === contact._id ? 'text-emerald-700' : 'text-slate-900'}`}>{contact.name}</h4>
                      {contact.timestamp && <span className="text-[9px] text-slate-400 font-medium">{new Date(contact.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide truncate mt-0.5">
                      {contact.lastMessage || contact.headline || 'Network Member'}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="w-2/3 flex flex-col bg-slate-50/20">
          {selectedUser ? (
            <>
              <div className="p-5 border-b border-slate-100 bg-white/80 backdrop-blur-md flex items-center justify-between shadow-sm z-10">
                <div className="flex items-center">
                  <img
                    src={selectedUser.profilePicture.startsWith('/uploads') ? `http://localhost:5000${selectedUser.profilePicture}` : (selectedUser.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedUser.name)}&background=0d4f3f&color=fff`)}
                    alt={selectedUser.name}
                    className="h-10 w-10 rounded-xl object-cover mr-4 shadow-sm"
                  />
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{selectedUser.name}</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                      <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Online</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex-grow p-6 overflow-y-auto space-y-6">
                {messages.map((msg, index) => {
                  const isMine = msg.sender == user._id || msg.senderId == user._id;
                  return (
                    <div key={index} className={`flex ${isMine ? 'justify-end' : 'justify-start'} animate-slide-up`}>
                      <div className={`max-w-md px-5 py-3.5 rounded-[1.5rem] shadow-sm text-sm font-medium leading-relaxed ${isMine ? 'bg-emerald-600 text-white rounded-br-none shadow-emerald-900/10' : 'bg-white text-slate-700 border border-slate-100 rounded-bl-none'}`}>
                        <p>{msg.content}</p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-6 bg-white border-t border-slate-100">
                <form onSubmit={onSend} className="flex gap-3 items-center">
                  <div className="flex-grow relative group">
                    <input
                      type="text"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Type a message..."
                      className="w-full bg-slate-50 rounded-2xl px-6 py-4 text-sm focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/30 transition-all border border-transparent outline-none font-medium placeholder-slate-400"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!content.trim()}
                    className="bg-emerald-600 text-white p-4 rounded-2xl shadow-lg shadow-emerald-900/20 hover:bg-emerald-700 disabled:bg-slate-100 disabled:text-slate-300 disabled:shadow-none transition-all active:scale-95"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center text-slate-400 p-10 bg-slate-50/30">
              <div className="w-20 h-20 bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 flex items-center justify-center mb-6">
                <MessageSquare className="w-10 h-10 text-slate-200" />
              </div>
              <p className="font-bold text-xs uppercase tracking-[0.2em]">Select a dialogue to begin</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messaging;
