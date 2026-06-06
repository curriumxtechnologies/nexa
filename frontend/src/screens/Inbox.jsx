import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useGetInboxQuery,
  useMarkAsReadMutation,
  useToggleStarMutation,
  useToggleArchiveMutation,
  useDeleteEmailMutation,
} from '../slices/emailApiSlice';
import {
  Star,
  Archive,
  Trash2,
  Search,
  Loader2,
  AlertCircle,
  InboxIcon,
  Paperclip,
  ChevronLeft,
  ChevronRight,
  Filter,
  X
} from 'lucide-react';
import { format } from 'date-fns';

const Inbox = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [folder, setFolder] = useState('inbox');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [filterType, setFilterType] = useState('all'); // all, unread, starred, hasAttachments
  const limit = 20;

  const { data, isLoading, error, refetch } = useGetInboxQuery({ page, limit, folder });
  const [markAsRead] = useMarkAsReadMutation();
  const [toggleStar] = useToggleStarMutation();
  const [toggleArchive] = useToggleArchiveMutation();
  const [deleteEmail] = useDeleteEmailMutation();

  const emails = data?.data?.emails || [];
  const total = data?.data?.total || 0;
  const totalPages = data?.data?.totalPages || 0;

  const formatDate = (date) => {
    const emailDate = new Date(date);
    const now = new Date();
    const diffDays = Math.floor((now - emailDate) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return format(emailDate, 'h:mm a');
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return format(emailDate, 'EEE');
    return format(emailDate, 'MM/dd/yy');
  };

  const getPlainText = (content) => content?.replace(/<[^>]*>/g, '') || '';

  const getInitials = (email) => {
    const name = email?.split('@')[0] || '?';
    return name.slice(0, 2).toUpperCase();
  };

  const getAvatarColor = (email) => {
    const colors = [
      'bg-rose-500', 'bg-orange-500', 'bg-amber-500',
      'bg-green-500', 'bg-teal-500', 'bg-cyan-500',
      'bg-blue-500', 'bg-indigo-500', 'bg-purple-500',
      'bg-pink-500',
    ];
    let hash = 0;
    for (let i = 0; i < (email?.length || 0); i++) {
      hash = email.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  // Apply filters to emails
  const getFilteredEmails = (emailsToFilter) => {
    let filtered = [...emailsToFilter];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((email) =>
        email.subject?.toLowerCase().includes(term) ||
        email.from?.email?.toLowerCase().includes(term) ||
        getPlainText(email.content).toLowerCase().includes(term)
      );
    }
    
    // Apply type filter
    if (filterType === 'unread') {
      filtered = filtered.filter((email) => !email.isRead);
    } else if (filterType === 'starred') {
      filtered = filtered.filter((email) => email.isStarred);
    } else if (filterType === 'hasAttachments') {
      filtered = filtered.filter((email) => email.attachments?.length > 0);
    }
    
    return filtered;
  };

  // Group emails by sender for mobile (WhatsApp-style threads)
  const groupedBySender = useMemo(() => {
    const filteredEmails = getFilteredEmails(emails);
    
    const map = new Map();
    filteredEmails.forEach((email) => {
      const key = email.from?.email;
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key).push(email);
    });

    const groups = Array.from(map.entries()).map(([senderEmail, mails]) => {
      const sorted = [...mails].sort(
        (a, b) =>
          new Date(b.receivedAt || b.createdAt) -
          new Date(a.receivedAt || a.createdAt)
      );
      const unreadCount = sorted.filter((m) => !m.isRead).length;
      const isStarred = sorted.some((m) => m.isStarred);
      const hasAttachment = sorted.some(
        (m) => m.attachments && m.attachments.length > 0
      );
      return {
        senderEmail,
        emails: sorted,
        latest: sorted[0],
        unreadCount,
        isStarred,
        hasAttachment,
      };
    });

    groups.sort(
      (a, b) =>
        new Date(b.latest.receivedAt || b.latest.createdAt) -
        new Date(a.latest.receivedAt || a.latest.createdAt)
    );

    return groups;
  }, [emails, searchTerm, filterType]);

  const filteredEmails = useMemo(() => {
    return getFilteredEmails(emails);
  }, [emails, searchTerm, filterType]);

  const handleThreadClick = async (group) => {
    for (const email of group.emails) {
      if (!email.isRead) {
        await markAsRead(email.emailId).unwrap().catch(() => {});
      }
    }
    refetch();
    navigate(`/email/${group.latest.emailId}`);
  };

  const handleEmailClick = async (email) => {
    if (!email.isRead) {
      await markAsRead(email.emailId).unwrap().catch(() => {});
      refetch();
    }
    navigate(`/email/${email.emailId}`);
  };

  const handleStarToggle = async (e, emailId) => {
    e.stopPropagation();
    await toggleStar(emailId).unwrap().catch(() => {});
    refetch();
  };

  const handleArchive = async (e, emailId) => {
    e.stopPropagation();
    await toggleArchive(emailId).unwrap().catch(() => {});
    refetch();
    setSelectedEmails((prev) => prev.filter((id) => id !== emailId));
  };

  const handleDelete = async (e, emailId) => {
    e.stopPropagation();
    await deleteEmail(emailId).unwrap().catch(() => {});
    refetch();
    setSelectedEmails((prev) => prev.filter((id) => id !== emailId));
  };

  const handleSelect = (e, emailId) => {
    e.stopPropagation();
    setSelectedEmails((prev) =>
      prev.includes(emailId) ? prev.filter((id) => id !== emailId) : [...prev, emailId]
    );
  };

  const handleSelectAll = () => {
    setSelectedEmails(
      selectedEmails.length === filteredEmails.length
        ? []
        : filteredEmails.map((e) => e.emailId)
    );
  };

  const getFilterLabel = () => {
    switch (filterType) {
      case 'unread': return 'Unread';
      case 'starred': return 'Starred';
      case 'hasAttachments': return 'Has Attachments';
      default: return 'All';
    }
  };

  if (isLoading && page === 1) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-400">Loading inbox...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center px-6">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <p className="text-gray-700 font-medium mb-1">Failed to load inbox</p>
          <p className="text-gray-400 text-sm mb-4">
            {error.data?.message || 'Please try again'}
          </p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-purple-600 text-white text-sm rounded-full"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ─── MOBILE VIEW ────────────────────────────────────────────────────────────
  const MobileView = () => (
    <div className="flex flex-col h-screen bg-white md:hidden">
      {/* Fixed Top Bar */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100">
        <div className="px-3 pt-3 pb-2">
          <div className="flex items-center gap-2">
            <h1 className="text-base font-semibold text-gray-900 capitalize flex-shrink-0">
              {folder}
            </h1>
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-gray-100 rounded-full text-xs focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
            <div className="relative">
              <button
                onClick={() => setShowFilterMenu(!showFilterMenu)}
                className={`p-1.5 rounded-full transition ${filterType !== 'all' ? 'bg-purple-100 text-purple-600' : 'text-gray-400'}`}
              >
                <Filter className="w-4 h-4" />
              </button>
              
              {/* Filter Menu */}
              {showFilterMenu && (
                <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-100 z-20">
                  <div className="py-1">
                    <button
                      onClick={() => { setFilterType('all'); setShowFilterMenu(false); }}
                      className={`w-full text-left px-3 py-2 text-xs ${filterType === 'all' ? 'bg-purple-50 text-purple-600' : 'text-gray-600'}`}
                    >
                      All emails
                    </button>
                    <button
                      onClick={() => { setFilterType('unread'); setShowFilterMenu(false); }}
                      className={`w-full text-left px-3 py-2 text-xs ${filterType === 'unread' ? 'bg-purple-50 text-purple-600' : 'text-gray-600'}`}
                    >
                      Unread only
                    </button>
                    <button
                      onClick={() => { setFilterType('starred'); setShowFilterMenu(false); }}
                      className={`w-full text-left px-3 py-2 text-xs ${filterType === 'starred' ? 'bg-purple-50 text-purple-600' : 'text-gray-600'}`}
                    >
                      Starred only
                    </button>
                    <button
                      onClick={() => { setFilterType('hasAttachments'); setShowFilterMenu(false); }}
                      className={`w-full text-left px-3 py-2 text-xs ${filterType === 'hasAttachments' ? 'bg-purple-50 text-purple-600' : 'text-gray-600'}`}
                    >
                      With attachments
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Active Filter Badge */}
          {filterType !== 'all' && (
            <div className="flex items-center mt-2">
              <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                Filter: {getFilterLabel()}
                <button onClick={() => setFilterType('all')}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            </div>
          )}
        </div>

        {/* Bulk actions bar */}
        {selectedEmails.length > 0 && (
          <div className="flex items-center px-3 py-2 bg-purple-50 border-t border-purple-100 gap-3">
            <span className="text-xs text-purple-700 flex-1">
              {selectedEmails.length} selected
            </span>
            <button
              className="text-xs text-gray-600 bg-white border border-gray-200 px-2.5 py-1 rounded-full"
              onClick={() => {
                selectedEmails.forEach((id) => toggleArchive(id).unwrap().catch(() => {}));
                setSelectedEmails([]);
                refetch();
              }}
            >
              Archive
            </button>
            <button
              className="text-xs text-red-600 bg-white border border-red-100 px-2.5 py-1 rounded-full"
              onClick={() => {
                selectedEmails.forEach((id) => deleteEmail(id).unwrap().catch(() => {}));
                setSelectedEmails([]);
                refetch();
              }}
            >
              Delete
            </button>
            <button
              className="text-xs text-gray-400"
              onClick={() => setSelectedEmails([])}
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Scrollable Thread List */}
      <div className="flex-1 overflow-y-auto">
        {groupedBySender.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <InboxIcon className="w-12 h-12 text-gray-200 mb-3" />
            <p className="text-sm text-gray-400">No emails found</p>
          </div>
        ) : (
          groupedBySender.map((group) => {
            const { senderEmail, latest, unreadCount, isStarred, hasAttachment, emails: threadEmails } = group;
            const isSelected = selectedEmails.includes(latest.emailId);

            return (
              <div
                key={senderEmail}
                onClick={() => handleThreadClick(group)}
                className={`flex items-center px-3 py-2.5 border-b border-gray-100 active:bg-gray-50 transition-colors cursor-pointer ${
                  isSelected ? 'bg-purple-50' : ''
                }`}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0 mr-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-semibold ${getAvatarColor(senderEmail)}`}
                    onClick={(e) => handleSelect(e, latest.emailId)}
                  >
                    {isSelected ? (
                      <span className="text-white text-sm">✓</span>
                    ) : (
                      getInitials(senderEmail)
                    )}
                  </div>
                  {isStarred && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-yellow-400 rounded-full flex items-center justify-center">
                      <Star className="w-2 h-2 text-white fill-white" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className={`text-sm truncate mr-2 ${unreadCount > 0 ? 'font-semibold text-gray-900' : 'font-normal text-gray-700'}`}>
                      {senderEmail}
                    </p>
                    <span className={`text-xs whitespace-nowrap ${unreadCount > 0 ? 'text-purple-600 font-medium' : 'text-gray-400'}`}>
                      {formatDate(latest.receivedAt || latest.createdAt)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0 pr-2">
                      <p className={`text-xs truncate ${unreadCount > 0 ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>
                        {latest.subject || '(No Subject)'}
                      </p>
                      <p className="text-xs text-gray-400 truncate mt-0.5">
                        {getPlainText(latest.content).slice(0, 60)}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      {hasAttachment && <Paperclip className="w-3 h-3 text-gray-400" />}
                      {threadEmails.length > 1 && (
                        <span className="text-xs text-gray-400">{threadEmails.length}</span>
                      )}
                      {unreadCount > 0 && (
                        <span className="w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-2 border-t border-gray-100 bg-white">
          <button onClick={() => setPage((p) => p - 1)} disabled={page === 1} className="p-1 disabled:opacity-30">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <span className="text-xs text-gray-400">{page} / {totalPages}</span>
          <button onClick={() => setPage((p) => p + 1)} disabled={page === totalPages} className="p-1 disabled:opacity-30">
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      )}
    </div>
  );

  // ─── DESKTOP VIEW ────────────────────────────────────────────────────────────
  const DesktopView = () => (
    <div className="hidden md:flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-lg font-semibold text-gray-800 capitalize">{folder}</h1>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search emails..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-1.5 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 w-64"
            />
          </div>
          <div className="relative">
            <button
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className={`p-1.5 rounded-lg transition ${filterType !== 'all' ? 'bg-purple-100 text-purple-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <Filter className="w-4 h-4" />
            </button>
            {showFilterMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-20">
                <div className="py-1">
                  <button onClick={() => { setFilterType('all'); setShowFilterMenu(false); }} className={`w-full text-left px-3 py-2 text-sm ${filterType === 'all' ? 'bg-purple-50 text-purple-600' : 'text-gray-600 hover:bg-gray-50'}`}>
                    All emails
                  </button>
                  <button onClick={() => { setFilterType('unread'); setShowFilterMenu(false); }} className={`w-full text-left px-3 py-2 text-sm ${filterType === 'unread' ? 'bg-purple-50 text-purple-600' : 'text-gray-600 hover:bg-gray-50'}`}>
                    Unread only
                  </button>
                  <button onClick={() => { setFilterType('starred'); setShowFilterMenu(false); }} className={`w-full text-left px-3 py-2 text-sm ${filterType === 'starred' ? 'bg-purple-50 text-purple-600' : 'text-gray-600 hover:bg-gray-50'}`}>
                    Starred only
                  </button>
                  <button onClick={() => { setFilterType('hasAttachments'); setShowFilterMenu(false); }} className={`w-full text-left px-3 py-2 text-sm ${filterType === 'hasAttachments' ? 'bg-purple-50 text-purple-600' : 'text-gray-600 hover:bg-gray-50'}`}>
                    With attachments
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bulk actions */}
      {selectedEmails.length > 0 && (
        <div className="flex items-center px-6 py-2 bg-purple-50 border-b border-purple-100 gap-4">
          <span className="text-sm text-purple-700">{selectedEmails.length} selected</span>
          <button onClick={() => { selectedEmails.forEach((id) => toggleArchive(id).unwrap().catch(() => {})); setSelectedEmails([]); refetch(); }} className="text-sm text-gray-600 hover:text-gray-800">Archive all</button>
          <button onClick={() => { selectedEmails.forEach((id) => deleteEmail(id).unwrap().catch(() => {})); setSelectedEmails([]); refetch(); }} className="text-sm text-red-500 hover:text-red-700">Delete all</button>
          <button className="text-sm text-gray-400 hover:text-gray-600 ml-auto" onClick={() => setSelectedEmails([])}>Cancel</button>
        </div>
      )}

      {/* Table header */}
      <div className="bg-white border-b border-gray-200 px-6 py-2 flex items-center gap-4 text-xs font-medium text-gray-400 uppercase tracking-wide">
        <input type="checkbox" checked={selectedEmails.length === filteredEmails.length && filteredEmails.length > 0} onChange={handleSelectAll} className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
        <div className="w-4" />
        <div className="flex-1 grid grid-cols-12 gap-4">
          <span className="col-span-3">From</span>
          <span className="col-span-4">Subject</span>
          <span className="col-span-3">Preview</span>
          <span className="col-span-2 text-right">Date</span>
        </div>
      </div>

      {/* Email rows */}
      <div className="flex-1 overflow-y-auto bg-white">
        {filteredEmails.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <InboxIcon className="w-14 h-14 text-gray-200 mb-3" />
            <p className="text-gray-400">No emails found</p>
          </div>
        ) : (
          filteredEmails.map((email) => (
            <div key={email.emailId} onClick={() => handleEmailClick(email)} className={`group flex items-center gap-4 px-6 py-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${!email.isRead ? 'bg-purple-50/40' : ''}`}>
              <input type="checkbox" checked={selectedEmails.includes(email.emailId)} onChange={(e) => handleSelect(e, email.emailId)} onClick={(e) => e.stopPropagation()} className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 flex-shrink-0" />
              <button onClick={(e) => handleStarToggle(e, email.emailId)} className="flex-shrink-0 focus:outline-none">
                <Star className={`w-4 h-4 ${email.isStarred ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 hover:text-yellow-400'}`} />
              </button>

              <div className="flex-1 grid grid-cols-12 gap-4 min-w-0 items-center">
                <div className="col-span-3 flex items-center gap-2 min-w-0">
                  {!email.isRead && <span className="w-2 h-2 rounded-full bg-purple-600 flex-shrink-0" />}
                  <span className={`text-sm truncate ${!email.isRead ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>{email.from?.email}</span>
                </div>
                <div className="col-span-4 flex items-center gap-1.5 min-w-0">
                  <span className={`text-sm truncate ${!email.isRead ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>{email.subject || '(No Subject)'}</span>
                  {email.attachments?.length > 0 && <Paperclip className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />}
                </div>
                <div className="col-span-3 min-w-0">
                  <span className="text-sm text-gray-400 truncate block">{getPlainText(email.content).slice(0, 80)}</span>
                </div>
                <div className="col-span-2 flex items-center justify-end gap-2">
                  <span className={`text-xs whitespace-nowrap ${!email.isRead ? 'text-purple-600 font-medium' : 'text-gray-400'}`}>{formatDate(email.receivedAt || email.createdAt)}</span>
                  <div className="hidden group-hover:flex items-center gap-1">
                    <button onClick={(e) => handleArchive(e, email.emailId)} className="p-1 text-gray-400 hover:text-gray-600 rounded"><Archive className="w-3.5 h-3.5" /></button>
                    <button onClick={(e) => handleDelete(e, email.emailId)} className="p-1 text-gray-400 hover:text-red-500 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-3 bg-white border-t border-gray-200">
          <p className="text-sm text-gray-400">Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}</p>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage((p) => p - 1)} disabled={page === 1} className="p-1.5 rounded-lg disabled:opacity-30 hover:bg-gray-100 transition"><ChevronLeft className="w-4 h-4 text-gray-600" /></button>
            <span className="text-sm text-gray-500">{page} of {totalPages}</span>
            <button onClick={() => setPage((p) => p + 1)} disabled={page === totalPages} className="p-1.5 rounded-lg disabled:opacity-30 hover:bg-gray-100 transition"><ChevronRight className="w-4 h-4 text-gray-600" /></button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      <MobileView />
      <DesktopView />
    </>
  );
};

export default Inbox;