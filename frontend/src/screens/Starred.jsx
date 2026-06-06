import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetInboxQuery, useMarkAsReadMutation, useToggleStarMutation, useToggleArchiveMutation, useDeleteEmailMutation } from '../slices/emailApiSlice';
import { 
  Star, 
  Archive, 
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
  StarOff
} from 'lucide-react';
import { format } from 'date-fns';

const Starred = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const limit = 20;

  // Use folder='starred' to get only starred emails
  const { data, isLoading, error, refetch } = useGetInboxQuery({ page, limit, folder: 'starred' });
  const [markAsRead] = useMarkAsReadMutation();
  const [toggleStar] = useToggleStarMutation();
  const [toggleArchive] = useToggleArchiveMutation();
  const [deleteEmail] = useDeleteEmailMutation();

  const emails = data?.data?.emails || [];
  const total = data?.data?.total || 0;
  const totalPages = data?.data?.totalPages || 0;

  // Handle email click
  const handleEmailClick = async (email) => {
    if (!email.isRead) {
      await markAsRead(email.emailId).unwrap();
      refetch();
    }
    navigate(`/email/${email.emailId}`);
  };

  // Handle star toggle (remove from starred)
  const handleStarToggle = async (e, emailId) => {
    e.stopPropagation();
    await toggleStar(emailId).unwrap();
    refetch();
    setSelectedEmails(selectedEmails.filter(id => id !== emailId));
  };

  // Handle archive
  const handleArchive = async (e, emailId) => {
    e.stopPropagation();
    await toggleArchive(emailId).unwrap();
    refetch();
    setSelectedEmails(selectedEmails.filter(id => id !== emailId));
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
      return format(emailDate, 'MMM d');
    }
  };

  // Get email preview
  const getEmailPreview = (content) => {
    const plainText = content.replace(/<[^>]*>/g, '');
    return plainText.length > 100 ? plainText.substring(0, 100) + '...' : plainText;
  };

  // Filter emails by search term
  const filteredEmails = emails.filter(email => 
    email.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    email.from.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getEmailPreview(email.content).toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading && page === 1) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading starred emails...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-500 mb-2">Failed to load starred emails</p>
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
      
              <h1 className="text-xl font-semibold text-gray-800">Starred</h1>
            </div>
            
            {/* Search and Filter */}
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search starred..."
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
                    await toggleArchive(id).unwrap();
                  });
                  setSelectedEmails([]);
                  refetch();
                }}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition"
              >
                Archive
              </button>
              <button
                onClick={() => {
                  selectedEmails.forEach(async (id) => {
                    await toggleStar(id).unwrap();
                  });
                  setSelectedEmails([]);
                  refetch();
                }}
                className="px-3 py-1 text-sm bg-yellow-50 text-yellow-600 hover:bg-yellow-100 rounded-lg transition"
              >
                Unstar
              </button>
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
            <StarOff className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No starred emails</p>
            <p className="text-gray-400 text-sm mt-1">
              Star important emails and they will appear here
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
                <div className="col-span-4">From</div>
                <div className="col-span-3">Date</div>
              </div>
            </div>

            {/* Email Items */}
            {filteredEmails.map((email) => (
              <div
                key={email.emailId}
                onClick={() => handleEmailClick(email)}
                className={`group flex flex-col lg:grid lg:grid-cols-12 gap-2 px-4 py-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition ${
                  !email.isRead ? 'bg-purple-50/30' : ''
                }`}
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
                    <button
                      onClick={(e) => handleStarToggle(e, email.emailId)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          email.isStarred
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-400 hover:text-yellow-400'
                        }`}
                      />
                    </button>
                  </div>
                  
                  {/* Mobile Actions */}
                  <div className="flex items-center space-x-2 lg:hidden">
                    <button
                      onClick={(e) => handleArchive(e, email.emailId)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <Archive className="w-4 h-4" />
                    </button>
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
                    {/* Left side - Subject & From */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {!email.isRead && (
                          <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                        )}
                        <p className={`text-sm ${!email.isRead ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                          {email.subject || '(No Subject)'}
                        </p>
                        {email.attachments && email.attachments.length > 0 && (
                          <Paperclip className="w-3 h-3 text-gray-400" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1 lg:hidden">
                        <User className="w-3 h-3 text-gray-400" />
                        <p className="text-xs text-gray-500">{email.from.email}</p>
                      </div>
                      <p className="text-xs text-gray-400 mt-1 line-clamp-1 lg:hidden">
                        {getEmailPreview(email.content)}
                      </p>
                    </div>

                    {/* From (Desktop) */}
                    <div className="hidden lg:block lg:col-span-4">
                      <p className="text-sm text-gray-600 truncate">{email.from.email}</p>
                    </div>

                    {/* Preview (Desktop) */}
                    <div className="hidden lg:block lg:col-span-5">
                      <p className="text-sm text-gray-500 truncate">
                        {getEmailPreview(email.content)}
                      </p>
                    </div>

                    {/* Date */}
                    <div className="flex items-center justify-between lg:block">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-3 h-3 text-gray-400 lg:hidden" />
                        <p className="text-xs text-gray-400 whitespace-nowrap">
                          {formatDate(email.receivedAt || email.createdAt)}
                        </p>
                      </div>
                      
                      {/* Desktop Actions */}
                      <div className="hidden lg:flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition">
                        <button
                          onClick={(e) => handleArchive(e, email.emailId)}
                          className="p-1 text-gray-400 hover:text-gray-600 rounded"
                          title="Archive"
                        >
                          <Archive className="w-4 h-4" />
                        </button>
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

export default Starred;