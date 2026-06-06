import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useGetEmailByIdQuery,
  useDeleteEmailMutation,
  useMarkAsReadMutation,
  useToggleStarMutation,
  useToggleArchiveMutation,
} from '../slices/emailApiSlice';
import { useGetSettingsQuery } from '../slices/settingsApiSlice';
import { useGetInboxQuery } from '../slices/emailApiSlice';
import {
  ArrowLeft,
  Star,
  Archive,
  Trash2,
  Reply,
  ReplyAll,
  Forward,
  Download,
  Paperclip,
  Loader2,
  AlertCircle,
  Send,
  X,
  ChevronDown,
  ChevronUp,
  MoreVertical,
} from 'lucide-react';
import { format } from 'date-fns';

// ─── Helpers ────────────────────────────────────────────────────────────────

const getInitials = (email) => {
  const name = email?.split('@')[0] || '?';
  return name.slice(0, 2).toUpperCase();
};

const getAvatarColor = (email) => {
  const colors = [
    'bg-rose-500', 'bg-orange-500', 'bg-amber-500',
    'bg-green-500', 'bg-teal-500', 'bg-cyan-500',
    'bg-blue-500', 'bg-indigo-500', 'bg-purple-500', 'bg-pink-500',
  ];
  let hash = 0;
  for (let i = 0; i < (email?.length || 0); i++) {
    hash = email.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const formatDate = (date) => {
  if (!date) return 'N/A';
  return format(new Date(date), "MMM d, yyyy 'at' h:mm a");
};

const formatBubbleTime = (date) => {
  if (!date) return '';
  return format(new Date(date), 'h:mm a');
};

const formatDayLabel = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const now = new Date();
  const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return format(d, 'MMMM d, yyyy');
};

const getPlainText = (content) => content?.replace(/<[^>]*>/g, '') || '';

// ─── Single Email Bubble ─────────────────────────────────────────────────────

const EmailBubble = ({ email, isSent, onStar, onDelete, onArchive, onReply, onForward }) => {
  const [expanded, setExpanded] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showFullHeaders, setShowFullHeaders] = useState(false);

  const preview = getPlainText(email.content).slice(0, 120);
  const isLong = getPlainText(email.content).length > 120 || email.content.includes('<');

  return (
    <div className={`flex flex-col mb-2 ${isSent ? 'items-end' : 'items-start'}`}>
      {/* Bubble */}
      <div
        className={`relative max-w-[85%] md:max-w-[70%] rounded-2xl overflow-hidden shadow-sm
          ${isSent
            ? 'bg-purple-600 text-white rounded-tr-sm'
            : 'bg-white text-gray-900 rounded-tl-sm border border-gray-100'
          }`}
      >
        {/* Subject bar */}
        <div
          className={`px-3 pt-3 pb-1 flex items-start justify-between gap-2 cursor-pointer`}
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex-1 min-w-0">
            <p className={`text-xs font-semibold uppercase tracking-wide mb-0.5 ${isSent ? 'text-purple-200' : 'text-purple-600'}`}>
              {email.subject || '(No Subject)'}
            </p>
            {!expanded && (
              <p className={`text-sm leading-snug ${isSent ? 'text-purple-100' : 'text-gray-600'}`}>
                {preview}{isLong ? '...' : ''}
              </p>
            )}
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {email.attachments?.length > 0 && (
              <Paperclip className={`w-3.5 h-3.5 ${isSent ? 'text-purple-200' : 'text-gray-400'}`} />
            )}
            {isLong && (
              expanded
                ? <ChevronUp className={`w-3.5 h-3.5 ${isSent ? 'text-purple-200' : 'text-gray-400'}`} />
                : <ChevronDown className={`w-3.5 h-3.5 ${isSent ? 'text-purple-200' : 'text-gray-400'}`} />
            )}
            <button
              onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
              className={`p-0.5 rounded ${isSent ? 'hover:bg-purple-500' : 'hover:bg-gray-100'}`}
            >
              <MoreVertical className={`w-3.5 h-3.5 ${isSent ? 'text-purple-200' : 'text-gray-400'}`} />
            </button>
          </div>
        </div>

        {/* Expanded full email content */}
        {expanded && (
          <div className="px-3 pb-2">
            {/* Meta info */}
            <div className={`text-xs mb-2 space-y-0.5 ${isSent ? 'text-purple-200' : 'text-gray-400'}`}>
              <div>
                <span className="font-medium">From: </span>
                {email.from?.name || email.from?.email}
                {email.from?.name && ` <${email.from.email}>`}
              </div>
              {email.to?.length > 0 && (
                <div>
                  <span className="font-medium">To: </span>
                  {email.to.map((t) => t.email).join(', ')}
                </div>
              )}
              {email.cc?.length > 0 && (
                <div>
                  <span className="font-medium">Cc: </span>
                  {email.cc.map((t) => t.email).join(', ')}
                </div>
              )}
              <button
                onClick={() => setShowFullHeaders(!showFullHeaders)}
                className={`text-xs underline ${isSent ? 'text-purple-300' : 'text-purple-500'}`}
              >
                {showFullHeaders ? 'Hide headers' : 'Show headers'}
              </button>
              {showFullHeaders && (
                <div className={`mt-1 p-2 rounded text-xs font-mono ${isSent ? 'bg-purple-700' : 'bg-gray-50'}`}>
                  <div><span className="font-bold">ID:</span> {email.emailId}</div>
                  <div><span className="font-bold">Direction:</span> {email.direction}</div>
                  <div><span className="font-bold">Status:</span> {email.status}</div>
                  {email.replyToEmailId && (
                    <div><span className="font-bold">Reply To:</span> {email.replyToEmailId}</div>
                  )}
                </div>
              )}
            </div>

            {/* Divider */}
            <div className={`border-t mb-2 ${isSent ? 'border-purple-500' : 'border-gray-100'}`} />

            {/* Email body */}
            <div
              className={`text-sm leading-relaxed prose prose-sm max-w-none
                ${isSent ? 'prose-invert text-white' : 'text-gray-800'}`}
              dangerouslySetInnerHTML={{ __html: email.content }}
            />

            {/* Attachments */}
            {email.attachments?.length > 0 && (
              <div className="mt-3 space-y-2">
                <p className={`text-xs font-medium ${isSent ? 'text-purple-200' : 'text-gray-500'}`}>
                  Attachments ({email.attachments.length})
                </p>
                {email.attachments.map((att, i) => (
                  <div
                    key={i}
                    onClick={() => window.open(att.url, '_blank')}
                    className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer
                      ${isSent ? 'bg-purple-500 hover:bg-purple-400' : 'bg-gray-50 hover:bg-gray-100'}`}
                  >
                    <div className={`w-8 h-8 rounded flex items-center justify-center flex-shrink-0
                      ${isSent ? 'bg-purple-700' : 'bg-purple-100'}`}>
                      <Paperclip className={`w-4 h-4 ${isSent ? 'text-white' : 'text-purple-600'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-medium truncate ${isSent ? 'text-white' : 'text-gray-700'}`}>
                        {att.filename}
                      </p>
                      <p className={`text-xs ${isSent ? 'text-purple-200' : 'text-gray-400'}`}>
                        {Math.round(att.fileSize / 1024)} KB
                      </p>
                    </div>
                    <Download className={`w-3.5 h-3.5 flex-shrink-0 ${isSent ? 'text-purple-200' : 'text-gray-400'}`} />
                  </div>
                ))}
              </div>
            )}

            {/* Quick actions */}
            <div className={`flex items-center gap-2 mt-3 pt-2 border-t ${isSent ? 'border-purple-500' : 'border-gray-100'}`}>
              <button
                onClick={() => onReply(email, 'reply')}
                className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full
                  ${isSent ? 'bg-purple-500 text-white hover:bg-purple-400' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                <Reply className="w-3 h-3" /> Reply
              </button>
              <button
                onClick={() => onReply(email, 'replyAll')}
                className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full
                  ${isSent ? 'bg-purple-500 text-white hover:bg-purple-400' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                <ReplyAll className="w-3 h-3" /> All
              </button>
              <button
                onClick={() => onReply(email, 'forward')}
                className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full
                  ${isSent ? 'bg-purple-500 text-white hover:bg-purple-400' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                <Forward className="w-3 h-3" /> Fwd
              </button>
            </div>
          </div>
        )}

        {/* Timestamp row */}
        <div className={`px-3 pb-2 flex items-center justify-between gap-2`}>
          <span className={`text-xs ${isSent ? 'text-purple-300' : 'text-gray-400'}`}>
            {formatBubbleTime(email.receivedAt || email.sentAt || email.createdAt)}
          </span>
          <button onClick={() => onStar(email.emailId)}>
            <Star className={`w-3.5 h-3.5 ${email.isStarred ? 'fill-yellow-400 text-yellow-400' : isSent ? 'text-purple-300' : 'text-gray-300'}`} />
          </button>
        </div>
      </div>

      {/* Context menu */}
      {showMenu && (
        <div
          className={`mt-1 bg-white border border-gray-100 rounded-xl shadow-lg z-20 overflow-hidden min-w-[140px]
            ${isSent ? 'mr-1' : 'ml-1'}`}
        >
          {[
            { icon: Reply, label: 'Reply', action: () => { onReply(email, 'reply'); setShowMenu(false); } },
            { icon: Forward, label: 'Forward', action: () => { onReply(email, 'forward'); setShowMenu(false); } },
            { icon: Archive, label: 'Archive', action: () => { onArchive(email.emailId); setShowMenu(false); } },
            { icon: Trash2, label: 'Delete', action: () => { onDelete(email.emailId); setShowMenu(false); }, danger: true },
          ].map(({ icon: Icon, label, action, danger }) => (
            <button
              key={label}
              onClick={action}
              className={`flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-50
                ${danger ? 'text-red-500' : 'text-gray-700'}`}
            >
              <Icon className="w-3.5 h-3.5" /> {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Day Separator ───────────────────────────────────────────────────────────

const DaySeparator = ({ date }) => (
  <div className="flex items-center justify-center my-3">
    <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
      {formatDayLabel(date)}
    </span>
  </div>
);

// ─── Reply Box ───────────────────────────────────────────────────────────────

const ReplyBox = ({ mode, targetEmail, content, onChange, onSend, onClose, isSending, signature }) => {
  const modeLabel = mode === 'reply' ? 'Reply' : mode === 'replyAll' ? 'Reply All' : 'Forward';

  return (
    <div className="border-t border-gray-100 bg-white px-3 pt-2 pb-3">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-medium text-purple-600">{modeLabel}</span>
        <button onClick={onClose}>
          <X className="w-4 h-4 text-gray-400" />
        </button>
      </div>
      <textarea
        value={content}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
        placeholder="Type a message..."
        autoFocus
      />
      {signature && (
        <div className="mt-1 text-xs text-gray-400 px-1">
          {signature.split('\n').map((line, i) => <div key={i}>{line}</div>)}
        </div>
      )}
      <div className="flex justify-end mt-2">
        <button
          onClick={onSend}
          disabled={isSending}
          className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 text-white text-sm rounded-full disabled:opacity-50"
        >
          {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          Send
        </button>
      </div>
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────

const EmailDetails = () => {
  const { emailId } = useParams();
  const navigate = useNavigate();

  const { data: emailData, isLoading, error, refetch } = useGetEmailByIdQuery(emailId);
  const { data: inboxData } = useGetInboxQuery({ page: 1, limit: 100, folder: 'inbox' });
  const { data: settingsData } = useGetSettingsQuery();

  const [deleteEmail] = useDeleteEmailMutation();
  const [markAsRead] = useMarkAsReadMutation();
  const [toggleStar] = useToggleStarMutation();
  const [toggleArchive] = useToggleArchiveMutation();

  const [replyMode, setReplyMode] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);

  const email = emailData?.data;
  const settings = settingsData?.data;
  const emailSignature = settings?.email?.signature || '';
  const allEmails = inboxData?.data?.emails || [];

  // Build thread: all emails from/to the same address as this email
  const threadEmails = React.useMemo(() => {
    if (!email) return [];
    const senderEmail = email.from?.email;

    const thread = allEmails.filter((e) => {
      return (
        e.from?.email === senderEmail ||
        e.to?.some((t) => t.email === senderEmail)
      );
    });

    // Include the current email if not already in list
    const hasCurrentEmail = thread.some((e) => e.emailId === email.emailId);
    const full = hasCurrentEmail ? thread : [email, ...thread];

    // Sort oldest first (chat order)
    return full.sort(
      (a, b) =>
        new Date(a.receivedAt || a.createdAt) -
        new Date(b.receivedAt || b.createdAt)
    );
  }, [email, allEmails]);

  useEffect(() => {
    if (email && !email.isRead && email.direction === 'received') {
      markAsRead(email.emailId).unwrap().catch(() => {});
    }
  }, [email, markAsRead]);

  // Group thread by day for separators
  const threadWithDays = React.useMemo(() => {
    const result = [];
    let lastDay = null;
    threadEmails.forEach((e) => {
      const day = format(new Date(e.receivedAt || e.createdAt), 'yyyy-MM-dd');
      if (day !== lastDay) {
        result.push({ type: 'day', date: e.receivedAt || e.createdAt, key: day });
        lastDay = day;
      }
      result.push({ type: 'email', email: e, key: e.emailId });
    });
    return result;
  }, [threadEmails]);

  const handleStar = async (id) => {
    await toggleStar(id).unwrap().catch(() => {});
    refetch();
  };

  const handleArchive = async (id) => {
    await toggleArchive(id).unwrap().catch(() => {});
    navigate(-1);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this email?')) {
      await deleteEmail(id).unwrap().catch(() => {});
      navigate(-1);
    }
  };

  const handleReply = (targetEmail, mode) => {
    const isForward = mode === 'forward';
    const prefix = isForward ? 'Fwd: ' : 'Re: ';
    const subject = targetEmail.subject?.startsWith(prefix)
      ? targetEmail.subject
      : `${prefix}${targetEmail.subject}`;

    const date = formatDate(targetEmail.receivedAt || targetEmail.createdAt);

    const body = isForward
      ? `\n\n---------- Forwarded message ----------\nFrom: ${targetEmail.from?.email}\nDate: ${date}\nSubject: ${targetEmail.subject}\n\n${getPlainText(targetEmail.content)}`
      : `\n\n\nOn ${date}, ${targetEmail.from?.email} wrote:\n> ${getPlainText(targetEmail.content).replace(/\n/g, '\n> ')}`;

    setReplyContent(body);
    setReplyMode(mode);
  };

  const handleSendReply = async () => {
    setIsSendingReply(true);
    console.log('Sending reply:', { replyMode, content: replyContent });
    setTimeout(() => {
      setIsSendingReply(false);
      setReplyMode(null);
      setReplyContent('');
    }, 1000);
  };

  // ── Loading / Error ──────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !email) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center px-6">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <p className="text-gray-700 font-medium mb-1">Failed to load email</p>
          <p className="text-gray-400 text-sm mb-4">{error?.data?.message || 'Email not found'}</p>
          <button
            onClick={() => navigate('/inbox')}
            className="px-4 py-2 bg-purple-600 text-white text-sm rounded-full"
          >
            Back to Inbox
          </button>
        </div>
      </div>
    );
  }

  const senderEmail = email.from?.email;
  const avatarBg = getAvatarColor(senderEmail);
  const initials = getInitials(senderEmail);

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-screen bg-gray-50">

      {/* ── Top Bar ── */}
      <div className="flex items-center gap-3 px-3 py-2.5 bg-white border-b border-gray-100 sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="p-1 -ml-1">
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>

        {/* Avatar */}
        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 ${avatarBg}`}>
          {initials}
        </div>

        {/* Sender info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{senderEmail}</p>
          <p className="text-xs text-gray-400">
            {threadEmails.length} {threadEmails.length === 1 ? 'message' : 'messages'}
          </p>
        </div>

        {/* Header actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleStar(email.emailId)}
            className="p-1.5 rounded-full hover:bg-gray-100"
          >
            <Star className={`w-5 h-5 ${email.isStarred ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
          </button>
          <button
            onClick={() => handleArchive(email.emailId)}
            className="p-1.5 rounded-full hover:bg-gray-100"
          >
            <Archive className="w-5 h-5 text-gray-400" />
          </button>
          <button
            onClick={() => handleDelete(email.emailId)}
            className="p-1.5 rounded-full hover:bg-gray-100"
          >
            <Trash2 className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* ── Chat Thread ── */}
      <div className="flex-1 overflow-y-auto px-3 py-3">
        {threadWithDays.map((item) => {
          if (item.type === 'day') {
            return <DaySeparator key={item.key} date={item.date} />;
          }

          const e = item.email;
          const isSent = e.direction === 'sent';

          return (
            <EmailBubble
              key={item.key}
              email={e}
              isSent={isSent}
              onStar={handleStar}
              onDelete={handleDelete}
              onArchive={handleArchive}
              onReply={handleReply}
              onForward={(em) => handleReply(em, 'forward')}
            />
          );
        })}

        {/* Scroll anchor */}
        <div id="thread-bottom" />
      </div>

      {/* ── Reply Box ── */}
      {replyMode ? (
        <ReplyBox
          mode={replyMode}
          targetEmail={email}
          content={replyContent}
          onChange={setReplyContent}
          onSend={handleSendReply}
          onClose={() => { setReplyMode(null); setReplyContent(''); }}
          isSending={isSendingReply}
          signature={emailSignature}
        />
      ) : (
        <div className="flex items-center gap-2 px-3 py-2.5 bg-white border-t border-gray-100">
          <button
            onClick={() => handleReply(email, 'reply')}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-gray-100 rounded-full text-sm text-gray-600 hover:bg-gray-200"
          >
            <Reply className="w-4 h-4" /> Reply
          </button>
          <button
            onClick={() => handleReply(email, 'replyAll')}
            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-100 rounded-full text-sm text-gray-600 hover:bg-gray-200"
          >
            <ReplyAll className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleReply(email, 'forward')}
            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-100 rounded-full text-sm text-gray-600 hover:bg-gray-200"
          >
            <Forward className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default EmailDetails;