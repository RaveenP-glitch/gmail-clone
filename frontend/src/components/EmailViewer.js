import React, { useState } from 'react';
import { ArrowLeft, Star, Paperclip, Download } from 'lucide-react';
import { format } from 'date-fns';
import DOMPurify from 'dompurify';
import clsx from 'clsx';

const EmailViewer = ({ email, onBack }) => {
  const [showHtmlContent, setShowHtmlContent] = useState(true);

  if (!email) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-500">
          <p className="text-lg font-medium mb-2">Select an email to view</p>
          <p className="text-sm">Choose an email from the list to see its content</p>
        </div>
      </div>
    );
  }

  // Format date
  const formatDate = (date) => {
    return format(new Date(date), 'PPpp');
  };

  // Get sender display
  const getSenderDisplay = () => {
    return email.fromName 
      ? `${email.fromName} <${email.fromEmail}>`
      : email.fromEmail;
  };

  // Get recipients
  const getRecipients = () => {
    const recipients = [];
    
    if (email.toEmails && email.toEmails.length > 0) {
      recipients.push(`To: ${email.toEmails.join(', ')}`);
    }
    
    if (email.ccEmails && email.ccEmails.length > 0) {
      recipients.push(`CC: ${email.ccEmails.join(', ')}`);
    }
    
    if (email.bccEmails && email.bccEmails.length > 0) {
      recipients.push(`BCC: ${email.bccEmails.join(', ')}`);
    }
    
    return recipients;
  };

  // Sanitize HTML content
  const getSanitizedHtml = (html) => {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: [
        'p', 'div', 'span', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'strike',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote',
        'a', 'img', 'table', 'thead', 'tbody', 'tr', 'td', 'th', 'pre', 'code'
      ],
      ALLOWED_ATTR: [
        'href', 'target', 'src', 'alt', 'title', 'width', 'height', 'style', 'class'
      ],
      ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
    });
  };

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors duration-150"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-semibold text-gray-900 truncate">
            {email.subject || '(no subject)'}
          </h2>
        </div>
        
        <div className="flex items-center space-x-2">
          {email.isStarred && (
            <Star className="w-5 h-5 text-yellow-400 fill-current" />
          )}
          {email.attachments && email.attachments.length > 0 && (
            <Paperclip className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </div>

      {/* Email Details */}
      <div className="p-6 border-b border-gray-200 bg-gray-50">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-lg font-medium flex-shrink-0">
              {(email.fromName || email.fromEmail || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900">
                {getSenderDisplay()}
              </p>
              <div className="text-xs text-gray-500 space-y-1 mt-1">
                {getRecipients().map((recipient, index) => (
                  <p key={index}>{recipient}</p>
                ))}
              </div>
            </div>
          </div>
          
          <div className="text-right text-xs text-gray-500 flex-shrink-0">
            <p>{formatDate(email.date)}</p>
            {email.isImportant && (
              <p className="text-yellow-600 font-medium mt-1">Important</p>
            )}
          </div>
        </div>

        {/* Labels */}
        {email.labels && email.labels.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {email.labels.map((label, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {label}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Attachments */}
      {email.attachments && email.attachments.length > 0 && (
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
            <Paperclip className="w-4 h-4 mr-2" />
            Attachments ({email.attachments.length})
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {email.attachments.map((attachment, index) => (
              <div
                key={index}
                className="flex items-center space-x-2 p-2 bg-white rounded-md border border-gray-200"
              >
                <Paperclip className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {attachment.filename}
                  </p>
                  <p className="text-xs text-gray-500">
                    {attachment.size ? `${Math.round(attachment.size / 1024)} KB` : 'Unknown size'}
                  </p>
                </div>
                <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content Type Toggle */}
      {email.bodyHtml && email.bodyText && (
        <div className="px-6 py-2 border-b border-gray-200 bg-gray-50">
          <div className="flex space-x-4">
            <button
              onClick={() => setShowHtmlContent(true)}
              className={clsx(
                'text-sm font-medium px-3 py-1 rounded-md transition-colors duration-150',
                showHtmlContent
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              )}
            >
              Rich Text
            </button>
            <button
              onClick={() => setShowHtmlContent(false)}
              className={clsx(
                'text-sm font-medium px-3 py-1 rounded-md transition-colors duration-150',
                !showHtmlContent
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              )}
            >
              Plain Text
            </button>
          </div>
        </div>
      )}

      {/* Email Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          {showHtmlContent && email.bodyHtml ? (
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{
                __html: getSanitizedHtml(email.bodyHtml)
              }}
            />
          ) : email.bodyText ? (
            <div className="whitespace-pre-wrap text-sm text-gray-900 leading-relaxed">
              {email.bodyText}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <p className="text-sm">No content available for this email</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailViewer; 