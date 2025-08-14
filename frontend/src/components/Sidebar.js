import React from 'react';
import { 
  Inbox, 
  Star, 
  Send, 
  FileText, 
  Trash2, 
  AlertCircle,
  RefreshCw,
  LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import clsx from 'clsx';

const Sidebar = ({ stats, onRefresh, isRefreshing, activeView, onViewChange }) => {
  const { user, logout } = useAuth();
  
  // Debug user data
  console.log('Sidebar: user data:', user);

  const menuItems = [
    {
      id: 'inbox',
      label: 'Inbox',
      icon: Inbox,
      count: stats?.unreadCount || 0,
    },
    {
      id: 'starred',
      label: 'Starred',
      icon: Star,
      count: stats?.starredCount || 0,
    },
    {
      id: 'sent',
      label: 'Sent',
      icon: Send,
      count: null,
    },
    {
      id: 'drafts',
      label: 'Drafts',
      icon: FileText,
      count: null,
    },
    {
      id: 'trash',
      label: 'Trash',
      icon: Trash2,
      count: null,
    },
    {
      id: 'important',
      label: 'Important',
      icon: AlertCircle,
      count: stats?.importantCount || 0,
    },
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <img
            src={user?.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=4285f4&color=fff`}
            alt={user?.name || 'User'}
            className="w-8 h-8 rounded-full"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.name || 'User'}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user?.email}
            </p>
          </div>
        </div>
      </div>

      {/* Sync Button */}
      <div className="p-4 border-b border-gray-200">
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw 
            className={clsx(
              'w-4 h-4 mr-2',
              isRefreshing && 'animate-spin'
            )} 
          />
          {isRefreshing ? 'Syncing...' : 'Sync Emails'}
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={clsx(
                'w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150',
                isActive
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
            >
              <div className="flex items-center">
                <Icon className="w-4 h-4 mr-3" />
                <span>{item.label}</span>
              </div>
              {item.count !== null && item.count > 0 && (
                <span className={clsx(
                  'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                  isActive
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
                )}>
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 space-y-2">
        <div className="text-xs text-gray-500 space-y-1">
          <div className="flex justify-between">
            <span>Total Emails:</span>
            <span className="font-medium">{stats?.totalEmails || 0}</span>
          </div>
          <div className="flex justify-between">
            <span>Unread:</span>
            <span className="font-medium text-blue-600">{stats?.unreadCount || 0}</span>
          </div>
        </div>
        
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors duration-150"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar; 