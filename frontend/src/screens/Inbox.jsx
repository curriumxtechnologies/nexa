import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useGetInboxQuery,
  useMarkAsReadMutation,
  useToggleStarMutation,
  useToggleArchiveMutation,
  useDeleteEmailMutation,
  useGetCustomEmailsQuery,
} from '../slices/emailApiSlice';
import {
  Star, Archive, Trash2, Search, Loader2, AlertCircle,
  InboxIcon, Paperclip, ChevronLeft, ChevronRight,
  Filter, X, ChevronDown, Mail,
} from 'lucide-react';
import { format } from 'date-fns';

// Safely extract a string address from whatever shape email.to arrives as
const extractAddress = (to) => {
  const raw = Array.isArray(to) ? to[0] : to;
  if (!raw) return '';
  if (typeof raw === 'string') return raw;
  return raw.email || raw.address || raw.value || '';
};

const Inbox = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [folder, setFolder] = useState('inbox');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [selectedAccountId, setSelectedAccountId] = useState('all');
  const [showAccountPicker, setShowAccountPicker] = useState(false);
  const limit = 20;

  const { data, isLoading, error, refetch } = useGetInboxQuery({ page, limit, folder });
  const { data: customEmailsData } = useGetCustomEmailsQuery();
  const [markAsRead] = useMarkAsReadMutation();
  const [toggleStar] = useToggleStarMutation();
  const [toggleArchive] = useToggleArchiveMutation();
  const [deleteEmail] = useDeleteEmailMutation();

  const emails = data?.data?.emails || [];
  const total = data?.data?.total || 0;
  const totalPages = data?.data?.totalPages || 0;
  const customEmails = customEmailsData?.data?.emails || [];
  const selectedAccount = customEmails.find((e) => e._id === selectedAccountId);

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
  const getInitials = (email) => (email?.split('@')[0] || '?').slice(0, 2).toUpperCase();

  const getAvatarColor = (email) => {
    const colors = [
      'bg-rose-500', 'bg-orange-500', 'bg-amber-500', 'bg-green-500',
      'bg-teal-500', 'bg-cyan-500', 'bg-blue-500', 'bg-indigo-500',
      'bg-purple-500', 'bg-pink-500',
    ];
    let hash = 0;
    for (let i = 0; i < (email?.length || 0); i++) {
      hash = email.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  // Find which custom email account received a given email
  const getReceivingAccount = (email) => {
    const toAddr = extractAddress(email.to);
    if (!toAddr) return null;
    return customEmails.find(
      (ce) => ce.email?.toLowerCase() === toAddr.toLowerCase()
    ) || null;
  };

  // Unread count per account for badges
  const unreadPerAccount = useMemo(() => {
    const map = {};
    emails.forEach((email) => {
      const account = getReceivingAccount(email);
      if (account) {
        if (!map[account._id]) map[account._id] = 0;
        if (!email.isRead) map[account._id]++;
      }
    });
    return map;
  }, [emails, customEmails]);

  const totalUnread = useMemo(() => emails.filter((e) => !e.isRead).length, [emails]);

  // Main filtered list
  const filteredEmails = useMemo(() => {
    let filtered = [...emails];

    // Filter by which custom inbox received it
    if (selectedAccountId !== 'all') {
      filtered = filtered.filter((email) => {
        const account = getReceivingAccount(email);
        return account?._id === selectedAccountId;
      });
    }

    // Search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (email) =>
          email.subject?.toLowerCase().includes(term) ||
          email.from?.email?.toLowerCase().includes(term) ||
          getPlainText(email.content).toLowerCase().includes(term)
      );
    }

    // Type filter
    if (filterType === 'unread') filtered = filtered.filter((e) => !e.isRead);
    else if (filterType === 'starred') filtered = filtered.filter((e) => e.isStarred);
    else if (filterType === 'hasAttachments') filtered = filtered.filter((e) => e.attachments?.length > 0);

    return filtered;
  }, [emails, selectedAccountId, customEmails, searchTerm, filterType]);

  // Group by sender within the filtered list
  const groupedBySender = useMemo(() => {
    const map = new Map();
    filteredEmails.forEach((email) => {
      const key = email.from?.email;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(email);
    });
    const groups = Array.from(map.entries()).map(([senderEmail, mails]) => {
      const sorted = [...mails].sort(
        (a, b) => new Date(b.receivedAt || b.createdAt) - new Date(a.receivedAt || a.createdAt)
      );
      return {
        senderEmail,
        emails: sorted,
        latest: sorted[0],
        unreadCount: sorted.filter((m) => !m.isRead).length,
        isStarred: sorted.some((m) => m.isStarred),
        hasAttachment: sorted.some((m) => m.attachments?.length > 0),
      };
    });
    groups.sort(
      (a, b) =>
        new Date(b.latest.receivedAt || b.latest.createdAt) -
        new Date(a.latest.receivedAt || a.latest.createdAt)
    );
    return groups;
  }, [filteredEmails]);

  const handleThreadClick = async (group) => {
    for (const email of group.emails) {
      if (!email.isRead) await markAsRead(email.emailId).unwrap().catch(() => {});
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

  const switchAccount = (id) => {
    setSelectedAccountId(id);
    setShowAccountPicker(false);
    setPage(1);
    setSelectedEmails([]);
  };

  const getFilterLabel = () => {
    if (filterType === 'unread') return 'Unread';
    if (filterType === 'starred') return 'Starred';
    if (filterType === 'hasAttachments') return 'Has Attachments';
    return 'All';
  };

  const filterOptions = [
    { value: 'all', label: 'All emails' },
    { value: 'unread', label: 'Unread only' },
    { value: 'starred', label: 'Starred only' },
    { value: 'hasAttachments', label: 'With attachments' },
  ];

  // ── Account Picker ────────────────────────────────────────────────────────
  const AccountPicker = ({ isMobile = false }) => (
    <div className="relative">
      <button
        onClick={() => setShowAccountPicker((v) => !v)}
        className={`flex items-center gap-2 rounded-lg border border-gray-200 bg-white hover:border-purple-300 transition ${
          isMobile ? 'px-2.5 py-1.5 text-xs' : 'px-3 py-1.5 text-sm'
        }`}
      >
        <Mail className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
        <span className="font-medium text-gray-700 max-w-[130px] truncate">
          {selectedAccountId === 'all'
            ? 'All Inboxes'
            : selectedAccount?.displayName || selectedAccount?.email || 'Inbox'}
        </span>
        {selectedAccountId === 'all' && totalUnread > 0 && (
          <span className="bg-purple-600 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 leading-none">
            {totalUnread > 99 ? '99+' : totalUnread}
          </span>
        )}
        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${showAccountPicker ? 'rotate-180' : ''}`} />
      </button>

      {showAccountPicker && (
        <div className="absolute top-full left-0 mt-1 w-72 bg-white border border-gray-200 rounded-xl shadow-xl z-40 overflow-hidden">
          {/* All inboxes option */}
          <button
            onMouseDown={(e) => { e.preventDefault(); switchAccount('all'); }}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-50 transition border-b border-gray-100 ${
              selectedAccountId === 'all' ? 'bg-purple-50' : ''
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
              <InboxIcon className="w-4 h-4 text-purple-600" />
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="font-semibold text-gray-800">All Inboxes</p>
              <p className="text-xs text-gray-400">View all emails together</p>
            </div>
            {totalUnread > 0 && (
              <span className="bg-purple-600 text-white text-xs font-bold rounded-full px-2 py-0.5">
                {totalUnread}
              </span>
            )}
          </button>

          {/* Each custom email */}
          {customEmails.map((ce) => {
            const unread = unreadPerAccount[ce._id] || 0;
            const initial = (ce.displayName?.[0] || ce.email?.[0] || 'M').toUpperCase();
            return (
              <button
                key={ce._id}
                onMouseDown={(e) => { e.preventDefault(); switchAccount(ce._id); }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-50 transition border-b border-gray-100 last:border-0 ${
                  selectedAccountId === ce._id ? 'bg-purple-50' : ''
                }`}
              >
                {ce.profilePicture?.url ? (
                  <img src={ce.profilePicture.url} className="w-8 h-8 rounded-full flex-shrink-0 object-cover" alt="" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-purple-600">{initial}</span>
                  </div>
                )}
                <div className="flex-1 text-left min-w-0">
                  <p className="font-semibold text-gray-800 truncate">{ce.displayName || ce.username}</p>
                  <p className="text-xs text-gray-400 truncate">{ce.email}</p>
                </div>
                {unread > 0 && (
                  <span className="bg-purple-600 text-white text-xs font-bold rounded-full px-2 py-0.5 flex-shrink-0">
                    {unread}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );

  // ── Loading / Error states ─────────────────────────────────────────────────
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
          <p className="text-gray-400 text-sm mb-4">{error.data?.message || 'Please try again'}</p>
          <button onClick={() => refetch()} className="px-4 py-2 bg-purple-600 text-white text-sm rounded-full">
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ── Empty state ────────────────────────────────────────────────────────────
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center h-full text-center px-6 py-16">
      <InboxIcon className="w-12 h-12 text-gray-200 mb-3" />
      <p className="text-sm font-medium text-gray-500">
        {selectedAccountId !== 'all'
          ? `No emails in ${selectedAccount?.email}`
          : 'No emails found'}
      </p>
      {selectedAccountId !== 'all' && (
        <button onClick={() => switchAccount('all')} className="mt-2 text-xs text-purple-600 underline">
          View all inboxes
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* ════════════════════════════════════════════════════════════════
          MOBILE
      ════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col h-screen bg-white md:hidden">

        {/* Sticky top bar */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100">
          <div className="px-3 pt-3 pb-2 space-y-2">

            {/* Row: account picker + search + filter */}
            <div className="flex items-center gap-2">
              <AccountPicker isMobile />
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
                {showFilterMenu && (
                  <div className="absolute right-0 top-full mt-2 w-44 bg-white rounded-lg shadow-lg border border-gray-100 z-20">
                    {filterOptions.map(({ value, label }) => (
                      <button
                        key={value}
                        onClick={() => { setFilterType(value); setShowFilterMenu(false); }}
                        className={`w-full text-left px-3 py-2 text-xs ${filterType === value ? 'bg-purple-50 text-purple-600' : 'text-gray-600'}`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Active account banner */}
            {selectedAccountId !== 'all' && (
              <div className="flex items-center justify-between bg-purple-50 rounded-lg px-3 py-1.5">
                <p className="text-xs text-purple-700 font-medium truncate">
                  📬 {selectedAccount?.email}
                </p>
                <button onClick={() => switchAccount('all')}>
                  <X className="w-3.5 h-3.5 text-purple-400" />
                </button>
              </div>
            )}

            {/* Active filter badge */}
            {filterType !== 'all' && (
              <span className="inline-flex items-center gap-1 text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">
                {getFilterLabel()}
                <button onClick={() => setFilterType('all')}><X className="w-3 h-3" /></button>
              </span>
            )}
          </div>

          {/* Bulk actions */}
          {selectedEmails.length > 0 && (
            <div className="flex items-center px-3 py-2 bg-purple-50 border-t border-purple-100 gap-3">
              <span className="text-xs text-purple-700 flex-1">{selectedEmails.length} selected</span>
              <button
                className="text-xs text-gray-600 bg-white border border-gray-200 px-2.5 py-1 rounded-full"
                onClick={() => { selectedEmails.forEach((id) => toggleArchive(id).unwrap().catch(() => {})); setSelectedEmails([]); refetch(); }}
              >Archive</button>
              <button
                className="text-xs text-red-600 bg-white border border-red-100 px-2.5 py-1 rounded-full"
                onClick={() => { selectedEmails.forEach((id) => deleteEmail(id).unwrap().catch(() => {})); setSelectedEmails([]); refetch(); }}
              >Delete</button>
              <button className="text-xs text-gray-400" onClick={() => setSelectedEmails([])}>Cancel</button>
            </div>
          )}
        </div>

        {/* Thread list */}
        <div className="flex-1 overflow-y-auto">
          {groupedBySender.length === 0 ? <EmptyState /> : (
            groupedBySender.map((group) => {
              const { senderEmail, latest, unreadCount, isStarred, hasAttachment, emails: threadEmails } = group;
              const isSelected = selectedEmails.includes(latest.emailId);
              const receivingAccount = getReceivingAccount(latest);

              return (
                <div
                  key={`${senderEmail}-${latest.emailId}`}
                  onClick={() => handleThreadClick(group)}
                  className={`flex items-center px-3 py-2.5 border-b border-gray-100 active:bg-gray-50 cursor-pointer ${isSelected ? 'bg-purple-50' : ''}`}
                >
                  {/* Avatar / checkbox */}
                  <div className="relative flex-shrink-0 mr-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-semibold cursor-pointer ${getAvatarColor(senderEmail)}`}
                      onClick={(e) => handleSelect(e, latest.emailId)}
                    >
                      {isSelected ? '✓' : getInitials(senderEmail)}
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

                    <p className={`text-xs truncate ${unreadCount > 0 ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>
                      {latest.subject || '(No Subject)'}
                    </p>

                    {/* Which inbox received it — only shown in All Inboxes mode */}
                    {selectedAccountId === 'all' && receivingAccount && (
                      <p className="text-[10px] text-purple-500 font-medium mt-0.5 truncate">
                        → {receivingAccount.email}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-0.5">
                      <p className="text-xs text-gray-400 truncate flex-1 pr-2">
                        {getPlainText(latest.content).slice(0, 55)}
                      </p>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {hasAttachment && <Paperclip className="w-3 h-3 text-gray-400" />}
                        {threadEmails.length > 1 && (
                          <span className="text-xs text-gray-400">{threadEmails.length}</span>
                        )}
                        {unreadCount > 0 && (
                          <span className="w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
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

        {/* Pagination */}
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

      {/* ════════════════════════════════════════════════════════════════
          DESKTOP
      ════════════════════════════════════════════════════════════════ */}
      <div className="hidden md:flex flex-col h-screen bg-gray-50">

        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-4 sticky top-0 z-10">
          <h1 className="text-lg font-semibold text-gray-800 capitalize flex-shrink-0">{folder}</h1>
          <AccountPicker />

          {/* Active account pill */}
          {selectedAccountId !== 'all' && (
            <div className="flex items-center gap-1.5 bg-purple-50 border border-purple-200 text-purple-700 text-xs px-2.5 py-1 rounded-full">
              <span className="truncate max-w-[200px]">{selectedAccount?.email}</span>
              <button onClick={() => switchAccount('all')}><X className="w-3 h-3" /></button>
            </div>
          )}

          <div className="flex items-center gap-3 ml-auto">
            {filterType !== 'all' && (
              <span className="inline-flex items-center gap-1 text-xs bg-purple-100 text-purple-600 px-2.5 py-1 rounded-full">
                {getFilterLabel()}
                <button onClick={() => setFilterType('all')}><X className="w-3 h-3" /></button>
              </span>
            )}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search emails..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-1.5 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 w-56"
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
                  {filterOptions.map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => { setFilterType(value); setShowFilterMenu(false); }}
                      className={`w-full text-left px-3 py-2 text-sm ${filterType === value ? 'bg-purple-50 text-purple-600' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                      {label}
                    </button>
                  ))}
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
            <button className="text-sm text-gray-400 ml-auto" onClick={() => setSelectedEmails([])}>Cancel</button>
          </div>
        )}

        {/* Table column headers */}
        <div className="bg-white border-b border-gray-200 px-6 py-2 flex items-center gap-4 text-xs font-medium text-gray-400 uppercase tracking-wide">
          <input
            type="checkbox"
            checked={selectedEmails.length === filteredEmails.length && filteredEmails.length > 0}
            onChange={handleSelectAll}
            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
          />
          <div className="w-4" />
          <div className="flex-1 grid grid-cols-12 gap-4">
            <span className="col-span-2">From</span>
            <span className="col-span-2">Inbox</span>
            <span className="col-span-3">Subject</span>
            <span className="col-span-3">Preview</span>
            <span className="col-span-2 text-right">Date</span>
          </div>
        </div>

        {/* Rows */}
        <div className="flex-1 overflow-y-auto bg-white">
          {filteredEmails.length === 0 ? <EmptyState /> : (
            filteredEmails.map((email) => {
              const receivingAccount = getReceivingAccount(email);
              return (
                <div
                  key={email.emailId}
                  onClick={() => handleEmailClick(email)}
                  className={`group flex items-center gap-4 px-6 py-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${!email.isRead ? 'bg-purple-50/40' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={selectedEmails.includes(email.emailId)}
                    onChange={(e) => handleSelect(e, email.emailId)}
                    onClick={(e) => e.stopPropagation()}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 flex-shrink-0"
                  />
                  <button onClick={(e) => handleStarToggle(e, email.emailId)} className="flex-shrink-0 focus:outline-none">
                    <Star className={`w-4 h-4 ${email.isStarred ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 hover:text-yellow-400'}`} />
                  </button>

                  <div className="flex-1 grid grid-cols-12 gap-4 min-w-0 items-center">
                    {/* From */}
                    <div className="col-span-2 flex items-center gap-2 min-w-0">
                      {!email.isRead && <span className="w-2 h-2 rounded-full bg-purple-600 flex-shrink-0" />}
                      <span className={`text-sm truncate ${!email.isRead ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                        {email.from?.email}
                      </span>
                    </div>

                    {/* Which inbox received it */}
                    <div className="col-span-2 min-w-0">
                      {receivingAccount ? (
                        <span className="inline-block text-xs font-medium text-purple-600 bg-purple-50 border border-purple-100 px-2 py-0.5 rounded-full truncate max-w-full">
                          {receivingAccount.displayName || receivingAccount.email}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400 truncate">—</span>
                      )}
                    </div>

                    {/* Subject */}
                    <div className="col-span-3 flex items-center gap-1.5 min-w-0">
                      <span className={`text-sm truncate ${!email.isRead ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                        {email.subject || '(No Subject)'}
                      </span>
                      {email.attachments?.length > 0 && <Paperclip className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />}
                    </div>

                    {/* Preview */}
                    <div className="col-span-3 min-w-0">
                      <span className="text-sm text-gray-400 truncate block">
                        {getPlainText(email.content).slice(0, 80)}
                      </span>
                    </div>

                    {/* Date + hover actions */}
                    <div className="col-span-2 flex items-center justify-end gap-2">
                      <span className={`text-xs whitespace-nowrap ${!email.isRead ? 'text-purple-600 font-medium' : 'text-gray-400'}`}>
                        {formatDate(email.receivedAt || email.createdAt)}
                      </span>
                      <div className="hidden group-hover:flex items-center gap-1">
                        <button onClick={(e) => handleArchive(e, email.emailId)} className="p-1 text-gray-400 hover:text-gray-600 rounded" title="Archive">
                          <Archive className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={(e) => handleDelete(e, email.emailId)} className="p-1 text-gray-400 hover:text-red-500 rounded" title="Delete">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 bg-white border-t border-gray-200">
            <p className="text-sm text-gray-400">
              Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage((p) => p - 1)} disabled={page === 1} className="p-1.5 rounded-lg disabled:opacity-30 hover:bg-gray-100 transition">
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>
              <span className="text-sm text-gray-500">{page} of {totalPages}</span>
              <button onClick={() => setPage((p) => p + 1)} disabled={page === totalPages} className="p-1.5 rounded-lg disabled:opacity-30 hover:bg-gray-100 transition">
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Inbox;