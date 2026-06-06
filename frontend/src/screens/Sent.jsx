import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetSentEmailsQuery, useDeleteEmailMutation } from '../slices/emailApiSlice';
import { 
  Send, 
  Trash2, 
  Search, 
  Filter,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Inbox as InboxIcon,
  Clock,
  User,
  Paperclip,
  AlertCircle,
  CheckCircle,
  Clock as ClockIcon,
  XCircle
} from 'lucide-react';
import { format } from 'date-fns';

const Sent = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const limit = 20;

  const { data, isLoading, error, refetch } = useGetSentEmailsQuery({ page, limit });
  const [deleteEmail] = useDeleteEmailMutation();

  const emails = data?.data?.emails || [];
  const total = data?.data?.total || 0;
  const totalPages = data?.data?.totalPages || 0;

  // Handle email click
  const handleEmailClick = (email) => {
    navigate(`/email/${email.emailId}`);
  };

  // Handle delete
  const handleDelete = async (e, emailId) => {
    e.stopPropagation();
    await deleteEmail(emailId).unwrap();
    refetch();
    setSelectedEmails(selectedEmails.filter(id => id !== emailId));
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedEmails.length === emails.length) {
      setSelectedEmails([]);
    } else {
      setSelectedEmails(emails.map(email => email.emailId));
    }
  };

  // Handle select single
  const handleSelect = (e, emailId) => {
    e.stopPropagation();
    if (selectedEmails.includes(emailId)) {
      setSelectedEmails(selectedEmails.filter(id => id !== emailId));
    } else {
      setSelectedEmails([...selectedEmails, emailId]);
    }
  };

  // Format date
  const formatDate = (date) => {
    const emailDate = new Date(date);
    const now = new Date();
    const diffDays = Math.floor((now - emailDate) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return format(emailDate, 'h:mm a');
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return format(emailDate, 'EEEE');
    } else {
      return format(emailDate, 'MMM d, yyyy');
    }
  };

  // Get email preview
  const getEmailPreview = (content) => {
    const plainText = content.replace(/<[^>]*>/g, '');
    return plainText.length > 100 ? plainText.substring(0, 100) + '...' : plainText;
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="w-3 h-3 text-green-500" />;
      case 'delivered':
        return <CheckCircle className="w-3 h-3 text-blue-500" />;
      case 'failed':
        return <XCircle className="w-3 h-3 text-red-500" />;
      default:
        return <ClockIcon className="w-3 h-3 text-gray-400" />;
    }
  };

  // Get status text
  const getStatusText = (status) => {
    switch (status) {
      case 'sent':
        return 'Sent';
      case 'delivered':
        return 'Delivered';
      case 'failed':
        return 'Failed';
      case 'opened':
        return 'Opened';
      default:
        return 'Pending';
    }
  };

  // Filter emails by search term
  const filteredEmails = emails.filter(email => 
    email.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    email.to?.some(recipient => recipient.email?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    getEmailPreview(email.content).toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading && page === 1) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading sent emails...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-500 mb-2">Failed to load sent emails</p>
          <p className="text-gray-500 text-sm">{error.data?.message || 'Please try again'}</p>
          <button 
            onClick={() => refetch()}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-3 lg:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Send className="w-6 h-6 text-purple-600" />
              <h1 className="text-xl font-semibold text-gray-800">Sent</h1>
            </div>
            
            {/* Search and Filter */}
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search sent..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none w-48 lg:w-64"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition"
              >
                <Filter className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedEmails.length > 0 && (
            <div className="flex items-center space-x-3 mt-3 pt-3 border-t border-gray-100">
              <span className="text-sm text-gray-600">
                {selectedEmails.length} selected
              </span>
              <button
                onClick={() => {
                  selectedEmails.forEach(async (id) => {
                    await deleteEmail(id).unwrap();
                  });
                  setSelectedEmails([]);
                  refetch();
                }}
                className="px-3 py-1 text-sm bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition"
              >
                Delete
              </button>
              <button
                onClick={() => setSelectedEmails([])}
                className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Email List */}
      <div className="px-4 py-4 lg:px-6">
        {filteredEmails.length === 0 ? (
          <div className="text-center py-16">
            <Send className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No sent emails</p>
            <p className="text-gray-400 text-sm mt-1">
              Emails you send will appear here
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Select All Header */}
            <div className="hidden lg:flex items-center px-4 py-2 bg-gray-50 border-b border-gray-200 text-sm text-gray-500">
              <div className="flex items-center w-8">
                <input
                  type="checkbox"
                  checked={selectedEmails.length === emails.length && emails.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
              </div>
              <div className="flex-1 grid grid-cols-12 gap-2">
                <div className="col-span-5">Subject</div>
                <div className="col-span-4">To</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-1">Date</div>
              </div>
            </div>

            {/* Email Items */}
            {filteredEmails.map((email) => (
              <div
                key={email.emailId}
                onClick={() => handleEmailClick(email)}
                className="group flex flex-col lg:grid lg:grid-cols-12 gap-2 px-4 py-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition"
              >
                {/* Checkbox & Actions */}
                <div className="flex items-center justify-between lg:col-span-1 lg:justify-start">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedEmails.includes(email.emailId)}
                      onChange={(e) => handleSelect(e, email.emailId)}
                      onClick={(e) => e.stopPropagation()}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                  </div>
                  
                  {/* Mobile Actions */}
                  <div className="flex items-center space-x-2 lg:hidden">
                    <button
                      onClick={(e) => handleDelete(e, email.emailId)}
                      className="p-1 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Email Content */}
                <div className="flex-1 lg:col-span-11">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-1 lg:gap-2">
                    {/* Left side - Subject & To */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm text-gray-900 font-medium">
                          {email.subject || '(No Subject)'}
                        </p>
                        {email.attachments && email.attachments.length > 0 && (
                          <Paperclip className="w-3 h-3 text-gray-400" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1 lg:hidden">
                        <User className="w-3 h-3 text-gray-400" />
                        <p className="text-xs text-gray-500">
                          To: {email.to?.map(t => t.email).join(', ') || 'No recipients'}
                        </p>
                      </div>
                      <p className="text-xs text-gray-400 mt-1 line-clamp-1 lg:hidden">
                        {getEmailPreview(email.content)}
                      </p>
                    </div>

                    {/* To (Desktop) */}
                    <div className="hidden lg:block lg:col-span-4">
                      <p className="text-sm text-gray-600 truncate">
                        {email.to?.map(t => t.email).join(', ') || 'No recipients'}
                      </p>
                    </div>

                    {/* Status (Desktop) */}
                    <div className="hidden lg:flex lg:col-span-2 items-center space-x-1">
                      {getStatusIcon(email.status)}
                      <span className="text-xs text-gray-500">{getStatusText(email.status)}</span>
                    </div>

                    {/* Preview (Desktop) */}
                    <div className="hidden lg:block lg:col-span-4">
                      <p className="text-sm text-gray-500 truncate">
                        {getEmailPreview(email.content)}
                      </p>
                    </div>

                    {/* Date */}
                    <div className="flex items-center justify-between lg:block">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-3 h-3 text-gray-400 lg:hidden" />
                        <p className="text-xs text-gray-400 whitespace-nowrap">
                          {formatDate(email.sentAt || email.createdAt)}
                        </p>
                      </div>
                      
                      {/* Mobile Status */}
                      <div className="flex items-center space-x-1 lg:hidden">
                        {getStatusIcon(email.status)}
                        <span className="text-xs text-gray-500">{getStatusText(email.status)}</span>
                      </div>
                      
                      {/* Desktop Actions */}
                      <div className="hidden lg:flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition">
                        <button
                          onClick={(e) => handleDelete(e, email.emailId)}
                          className="p-1 text-gray-400 hover:text-red-600 rounded"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total}
                </p>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="p-1 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                    className="p-1 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sent;