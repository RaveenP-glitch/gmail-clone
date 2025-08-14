import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import Sidebar from '../components/Sidebar';
import EmailList from '../components/EmailList';
import EmailViewer from '../components/EmailViewer';
import apiService from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const DashboardPage = () => {
  const [activeView, setActiveView] = useState('inbox');
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [showEmailViewer, setShowEmailViewer] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasAutoSynced, setHasAutoSynced] = useState(false);
  const { user } = useAuth();

  // Fetch email stats
  const { data: stats, refetch: refetchStats } = useQuery(
    'emailStats',
    () => apiService.getEmailStats(),
    {
      refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes instead of 30 seconds
      refetchOnWindowFocus: false, // Don't refetch on window focus
      onError: (error) => {
        console.error('Error fetching stats:', error);
      },
      select: (response) => response.data,
    }
  );

  // Handle email selection
  const handleEmailSelect = async (email) => {
    try {
      // Fetch full email content
      const response = await apiService.getEmailById(email.id);
      setSelectedEmail(response.data);
      setShowEmailViewer(true);
      
      // Refetch stats to update unread count
      refetchStats();
    } catch (error) {
      console.error('Error fetching email:', error);
      toast.error('Failed to load email content');
    }
  };

  // Handle back from email viewer
  const handleBackFromViewer = () => {
    setShowEmailViewer(false);
    setSelectedEmail(null);
  };

  // Handle view change
  const handleViewChange = (view) => {
    setActiveView(view);
    setShowEmailViewer(false);
    setSelectedEmail(null);
  };

  // Handle email sync
  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await apiService.syncEmails();
      await refetchStats();
      toast.success('Emails synced successfully!');
    } catch (error) {
      console.error('Error syncing emails:', error);
      toast.error('Failed to sync emails');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Auto-sync emails for new users
  useEffect(() => {
    const autoSync = async () => {
      if (user && !hasAutoSynced && stats?.totalEmails === 0) {
        try {
          console.log('Auto-syncing emails for new user...');
          setIsRefreshing(true);
          await apiService.syncEmails();
          await refetchStats();
          setHasAutoSynced(true);
          toast.success('Emails synced automatically!');
        } catch (error) {
          console.error('Auto-sync failed:', error);
          // Don't show error toast here to avoid flooding
        } finally {
          setIsRefreshing(false);
        }
      }
    };

    // Delay auto-sync to let the user see the dashboard first
    const timer = setTimeout(autoSync, 3000);
    return () => clearTimeout(timer);
  }, [user, stats, hasAutoSynced, refetchStats]);

  // Responsive layout handling
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="h-screen bg-gray-100 flex overflow-hidden">
      {/* Sidebar - Hidden on mobile when email viewer is shown */}
      <div className={`${isMobile && showEmailViewer ? 'hidden' : 'block'}`}>
        <Sidebar
          stats={stats}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
          activeView={activeView}
          onViewChange={handleViewChange}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Email List - Hidden on mobile when email viewer is shown */}
        <div className={`${isMobile && showEmailViewer ? 'hidden' : 'flex-1'} ${!isMobile ? 'max-w-md' : ''} border-r border-gray-200`}>
          <EmailList
            activeView={activeView}
            onEmailSelect={handleEmailSelect}
            selectedEmailId={selectedEmail?.id}
          />
        </div>

        {/* Email Viewer */}
        <div className={`${showEmailViewer ? 'flex-1' : 'hidden'} ${!isMobile ? 'block' : ''}`}>
          <EmailViewer
            email={selectedEmail}
            onBack={handleBackFromViewer}
          />
        </div>

        {/* Empty State - Show when no email is selected on desktop */}
        {!showEmailViewer && !isMobile && (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center text-gray-500">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Welcome to Gmail Clone
              </h3>
              <p className="text-sm text-gray-500 max-w-sm mx-auto">
                Select an email from the list to view its content. Use the search bar to find specific emails or navigate through different folders using the sidebar.
              </p>
              <div className="mt-6 space-y-2 text-xs text-gray-400">
                <p>📧 {stats?.totalEmails || 0} total emails</p>
                <p>📬 {stats?.unreadCount || 0} unread emails</p>
                <p>⭐ {stats?.starredCount || 0} starred emails</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage; 