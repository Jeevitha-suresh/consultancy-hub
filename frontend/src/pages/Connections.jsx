import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useConnectionStore } from '../store/connectionStore';
import { BASE_URL } from '../utils/config';

const Connections = () => {
  const { connections, requests, getConnections, acceptRequest, rejectRequest, isLoading } = useConnectionStore();

  useEffect(() => {
    getConnections();
  }, [getConnections]);

  if (isLoading) return <div className="text-center mt-10">Loading...</div>;

  return (
    <div className="max-w-[1000px] mx-auto py-10 px-4 sm:px-6 animate-fade-in font-sans">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">My Network</h1>
        <p className="text-slate-500 text-sm font-medium">Manage your professional relationships and pending requests.</p>
      </div>

      <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 mb-10 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
          <h3 className="text-sm font-bold text-emerald-900 uppercase tracking-widest">
            Pending Requests <span className="ml-2 bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-[10px]">{requests.length}</span>
          </h3>
        </div>
        <ul className="divide-y divide-slate-50">
          {requests.length === 0 ? (
            <li className="px-6 py-12 text-slate-400 text-center font-medium">No pending requests at the moment.</li>
          ) : (
            requests.map((request) => (
              <li key={request._id} className="px-6 py-5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center">
                  <Link to={`/profile/${request._id}`}>
                    <img
                      className="h-14 w-14 rounded-xl object-cover border border-slate-100 shadow-sm"
                      src={request.profilePicture.startsWith('/uploads') ? `${BASE_URL}${request.profilePicture}` : (request.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(request.name)}&background=0d4f3f&color=fff`)}
                      alt={request.name}
                    />
                  </Link>
                  <div className="ml-4">
                    <Link to={`/profile/${request._id}`} className="text-sm font-bold text-slate-900 hover:text-emerald-600 transition-colors">
                      {request.name}
                    </Link>
                    <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wide mt-0.5">{request.headline || 'Member'}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => rejectRequest(request._id)}
                    className="px-6 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 transition-all"
                  >
                    Ignore
                  </button>
                  <button
                    onClick={() => acceptRequest(request._id)}
                    className="px-6 py-2 bg-emerald-600 rounded-xl text-xs font-bold text-white hover:bg-emerald-700 shadow-lg shadow-emerald-900/20 transition-all active:scale-95"
                  >
                    Accept
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>

      <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-50 bg-slate-50/50">
          <h3 className="text-sm font-bold text-emerald-900 uppercase tracking-widest">
            Your Connections <span className="ml-2 bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-[10px]">{connections.length}</span>
          </h3>
        </div>
        <div className="p-6">
          {connections.length === 0 ? (
            <div className="text-center text-slate-400 py-12 font-medium">You haven't built your network yet.</div>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {connections.map((connection) => (
                <li key={connection._id} className="border border-slate-100 rounded-[1.5rem] p-6 text-center hover:shadow-lg transition-all duration-300 group">
                  <Link to={`/profile/${connection._id}`}>
                    <img
                      className="mx-auto h-20 w-20 rounded-2xl object-cover mb-4 ring-4 ring-slate-50 shadow-md group-hover:scale-105 transition-transform"
                      src={connection.profilePicture.startsWith('/uploads') ? `${BASE_URL}${connection.profilePicture}` : (connection.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(connection.name)}&background=0d4f3f&color=fff`)}
                      alt={connection.name}
                    />
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">{connection.name}</h4>
                  </Link>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1 mb-6 h-8 line-clamp-2">{connection.headline || 'Network Member'}</p>
                  <Link to={`/messaging?user=${connection._id}`} className="block w-full px-4 py-2.5 bg-emerald-50 rounded-xl text-xs font-bold text-emerald-700 hover:bg-emerald-600 hover:text-white transition-all">
                    Send Message
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Connections;
