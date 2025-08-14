import React, { useState, useEffect, useCallback } from 'react';
import { Star, Paperclip, Search, X } from 'lucide-react';
import { format, isToday, isYesterday, isThisYear } from 'date-fns';
import InfiniteScroll from 'react-infinite-scroll-component';
import clsx from 'clsx';
import LoadingSpinner from './LoadingSpinner';
import apiService from '../services/api';
import toast from 'react-hot-toast';

const EmailList = ({ activeView, onEmailSelect, selectedEmailId }) => {
  const [emails, setEmails] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [nextPageToken, setNextPageToken] = useState(null);

  // Format date for display
  const formatEmailDate = useCallback((date) => {
    const emailDate = new Date(date);
    
    if (isToday(emailDate)) {
      return format(emailDate, 'h:mm a');
    } else if (isYesterday(emailDate)) {
      return 'Yesterday';
    } else if (isThisYear(emailDate)) {
      return format(emailDate, 'MMM d');
    } else {
      return format(emailDate, 'MMM d, yyyy');
    }
  }, []);

  // Load emails
  const loadEmails = useCallback(async (reset = false) => {
    if (loading) return;
    
    console.log('EmailList: loadEmails called with reset:', reset, 'activeView:', activeView);
    setLoading(true);
    
    try {
      let response;
      const params = {
        limit: 20,
        pageToken: reset ? null : nextPageToken,
      };

      if (isSearching && searchQuery) {
        response = await apiService.searchEmails(searchQuery, params);
      } else {
        // Build query based on active view
        let query = '';
        switch (activeView) {
          case 'starred':
            query = 'is:starred';
            break;
          case 'sent':
            query = 'in:sent';
            break;
          case 'drafts':
            query = 'in:drafts';
            break;
          case 'trash':
            query = 'in:trash';
            break;
          case 'important':
            query = 'is:important';
            break;
          case 'inbox':
          default:
            query = 'in:inbox';
            break;
        }
        
        params.search = query;
        response = await apiService.getEmails(params);
      }

      const newEmails = response?.data?.emails || [];
      const pagination = response?.data?.pagination || {};

      console.log('EmailList: API response:', {
        emailsCount: newEmails.length,
        pagination,
        firstEmail: newEmails[0]
      });

      if (reset) {
        setEmails(newEmails);
      } else {
        setEmails(prev => [...prev, ...newEmails]);
      }

      setNextPageToken(pagination.nextPageToken || null);
      setHasMore(!!pagination.nextPageToken && newEmails.length > 0);

    } catch (error) {
      console.error('Error loading emails:', error);
      // Set empty state on error to stop loading
      if (reset) {
        setEmails([]);
        setHasMore(false);
        setNextPageToken(null);
      }
      // Don't show toast error if it's the first load (reset = true)
      if (!reset) {
        toast.error('Failed to load emails');
      }
    } finally {
      setLoading(false);
    }
  }, [activeView, searchQuery, isSearching, loading, nextPageToken]);

  // Handle search
  const handleSearch = useCallback(async (query) => {
    setSearchQuery(query);
    setIsSearching(!!query);
    setNextPageToken(null);
    await loadEmails(true);
  }, [loadEmails]);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setIsSearching(false);
    setNextPageToken(null);
    loadEmails(true);
  }, [loadEmails]);

  // Load more emails (infinite scroll)
  const loadMoreEmails = useCallback(() => {
    if (!loading && hasMore && nextPageToken) {
      loadEmails(false);
    }
  }, [loading, hasMore, nextPageToken, loadEmails]);

  // Load emails when view changes
  useEffect(() => {
    console.log('EmailList: Loading emails for view:', activeView);
    setEmails([]);
    setNextPageToken(null);
    setHasMore(true);
    loadEmails(true);
  }, [activeView, loadEmails]);

  // Extract sender name or email
  const getSenderDisplay = (email) => {
    return email.fromName || email.fromEmail || 'Unknown Sender';
  };

  // Truncate text
  const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Search Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search emails..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSearch(searchQuery);
              }
            }}
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        
        {isSearching && (
          <div className="mt-2 text-sm text-gray-600">
            Showing results for "{searchQuery}"
          </div>
        )}
      </div>

      {/* Email List */}
      <div className="flex-1 overflow-y-auto" id="email-list-container">
        {emails.length === 0 && !loading ? (
          <div className="flex items-center justify-center h-64 text-gray-500">
            <div className="text-center">
              <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">No emails found</p>
              <p className="text-sm mb-4">
                {isSearching 
                  ? 'Try adjusting your search terms' 
                  : `No emails in ${activeView}. Try syncing your emails first.`
                }
              </p>
              {!isSearching && (
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Refresh
                </button>
              )}
            </div>
          </div>
        ) : (
          <InfiniteScroll
            dataLength={emails.length}
            next={loadMoreEmails}
            hasMore={hasMore}
            loader={
              <div className="flex justify-center py-4">
                <LoadingSpinner size="md" />
              </div>
            }
            scrollableTarget="email-list-container"
            endMessage={
              emails.length > 0 && (
                <div className="text-center py-4 text-gray-500 text-sm">
                  No more emails to load
                </div>
              )
            }
          >
            {emails.map((email) => (
              <div
                key={email.id}
                onClick={() => onEmailSelect(email)}
                className={clsx(
                  'email-item p-4 cursor-pointer border-b border-gray-100',
                  email.isRead ? 'read' : 'unread',
                  selectedEmailId === email.id && 'bg-blue-50 border-blue-200'
                )}
              >
                <div className="flex items-start space-x-3">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {getSenderDisplay(email).charAt(0).toUpperCase()}
                    </div>
                  </div>

                  {/* Email Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2 min-w-0">
                        <p className={clsx(
                          'text-sm truncate',
                          email.isRead ? 'font-normal text-gray-700' : 'font-semibold text-gray-900'
                        )}>
                          {getSenderDisplay(email)}
                        </p>
                        {email.attachments && email.attachments.length > 0 && (
                          <Paperclip className="w-3 h-3 text-gray-400 flex-shrink-0" />
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        {email.isStarred && (
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        )}
                        <span className="text-xs text-gray-500">
                          {formatEmailDate(email.date)}
                        </span>
                      </div>
                    </div>

                    <div className="mb-1">
                      <p className={clsx(
                        'text-sm truncate',
                        email.isRead ? 'font-normal text-gray-700' : 'font-medium text-gray-900'
                      )}>
                        {email.subject || '(no subject)'}
                      </p>
                    </div>

                    <p className="text-xs text-gray-500 truncate">
                      {truncateText(email.snippet)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </InfiniteScroll>
        )}
      </div>

      {/* Loading state for initial load */}
      {loading && emails.length === 0 && (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      )}
    </div>
  );
};

export default EmailList; 