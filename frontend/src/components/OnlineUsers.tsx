import React from 'react';
import { Users } from 'lucide-react';

interface OnlineUsersProps {
  users: string[];
  currentUser: string;
}

export const OnlineUsers: React.FC<OnlineUsersProps> = ({
  users,
  currentUser,
}) => {

  return (
    <div className="w-64 bg-white/60 backdrop-blur-md border-l border-white/50 hidden lg:flex flex-col z-10 shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.05)]">
      <div className="p-5 border-b border-gray-100/50 flex items-center gap-3 bg-white/40">
        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
          <Users size={18} />
        </div>
        <h3 className="font-bold text-gray-800 text-sm">Online Users</h3>
        <span className="ml-auto bg-indigo-100 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-full">
          {users.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {users.length === 0 ? (
          <p className="text-gray-400 text-xs text-center mt-6">No one else is here.</p>
        ) : (
          users.map((user) => {
            const isSelf = user === currentUser;
            return (
              <div
                key={user}
                className="flex items-center gap-2 p-2.5 hover:bg-white/80 rounded-xl transition-colors border border-transparent hover:border-gray-100 hover:shadow-sm"
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-sm shadow-inner">
                    {user.charAt(0).toUpperCase()}
                  </div>
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
                </div>

                {/* Username */}
                <span className="font-medium text-gray-700 text-sm truncate flex-1 min-w-0">
                  {user}
                  {isSelf && (
                    <span className="text-xs text-indigo-400 font-bold ml-1">(You)</span>
                  )}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

