import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useGetEmailByIdQuery,
  useDeleteEmailMutation,
  useMarkAsReadMutation,
  useToggleStarMutation,
  useToggleArchiveMutation,
  useSendEmailMutation,
  useGetCustomEmailsQuery,
  useGetInboxQuery,
} from '../slices/emailApiSlice';
import { useGetSettingsQuery } from '../slices/settingsApiSlice';
import {
  ArrowLeft, Star, Archive, Trash2, Reply, ReplyAll,
  Forward, Download, Paperclip, Loader2, AlertCircle,
  Send, X, ChevronDown, ChevronUp, MoreVertical,
  Bold, Italic, Underline, Link as LinkIcon,
  List, AlignLeft, AlignCenter, AlignRight, ListOrdered,
} from 'lucide-react';
import { format } from 'date-fns';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const extractAddress = (to) => {
  const raw = Array.isArray(to) ? to[0] : to;
  if (!raw) return '';
  if (typeof raw === 'string') return raw;
  return raw.email || raw.address || raw.value || '';
};

const getInitials = (email) =>
  (email?.split('@')[0] || '?').slice(0, 2).toUpperCase();

const getAvatarColor = (email) => {
  const colors = [
    'bg-rose-500', 'bg-orange-500', 'bg-amber-500', 'bg-green-500',
    'bg-teal-500', 'bg-cyan-500', 'bg-blue-500', 'bg-indigo-500',
    'bg-purple-500', 'bg-pink-500',
  ];
  let hash = 0;
  for (let i = 0; i < (email?.length || 0); i++)
    hash = email.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

const formatDate = (date) =>
  date ? format(new Date(date), "MMM d, yyyy 'at' h:mm a") : 'N/A';

const formatBubbleTime = (date) =>
  date ? format(new Date(date), 'h:mm a') : '';

const formatDayLabel = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const diffDays = Math.floor((new Date() - d) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return format(d, 'MMMM d, yyyy');
};

const getPlainText = (content) => content?.replace(/<[^>]*>/g, '') || '';

// ─── Toolbar Button ────────────────────────────────────────────────────────────

const ToolbarBtn = ({ onClick, icon: Icon, title, active }) => (
  <button
    type="button"
    onMouseDown={(e) => { e.preventDefault(); onClick(); }}
    title={title}
    className={`p-1.5 rounded transition-colors ${active ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-gray-200'}`}
  >
    <Icon className="w-3.5 h-3.5" />
  </button>
);

// ─── Email Bubble ──────────────────────────────────────────────────────────────

const EmailBubble = ({ email, isSent, receivingAccount, onStar, onDelete, onArchive, onReply }) => {
  const [expanded, setExpanded] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const preview = getPlainText(email.content).slice(0, 120);
  const isLong = getPlainText(email.content).length > 120 || email.content?.includes('<');

  return (
    <div className={`flex flex-col mb-3 ${isSent ? 'items-end' : 'items-start'}`}>
      {/* Receiving account label — shown on received emails */}
      {!isSent && receivingAccount && (
        <p className="text-[10px] text-purple-500 font-medium mb-1 ml-1">
          → {receivingAccount.email}
        </p>
      )}

      <div
        className={`relative w-full max-w-[85%] md:max-w-[70%] rounded-2xl overflow-hidden shadow-sm
          ${isSent
            ? 'bg-purple-600 text-white rounded-tr-sm'
            : 'bg-white text-gray-900 rounded-tl-sm border border-gray-100'}`}
      >
        {/* Subject + expand toggle */}
        <div
          className="px-3 pt-3 pb-1 flex items-start justify-between gap-2 cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex-1 min-w-0">
            <p className={`text-xs font-semibold uppercase tracking-wide mb-0.5 ${isSent ? 'text-purple-200' : 'text-purple-600'}`}>
              {email.subject || '(No Subject)'}
            </p>
            {!expanded && (
              <p className={`text-sm leading-snug ${isSent ? 'text-purple-100' : 'text-gray-600'}`}>
                {preview}{isLong ? '…' : ''}
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

        {/* Expanded body */}
        {expanded && (
          <div className="px-3 pb-2">
            <div className={`text-xs mb-2 space-y-0.5 ${isSent ? 'text-purple-200' : 'text-gray-400'}`}>
              <div><span className="font-medium">From: </span>{email.from?.name || email.from?.email}{email.from?.name && ` <${email.from.email}>`}</div>
              {email.to?.length > 0 && (
                <div>
                  <span className="font-medium">To: </span>
                  {email.to.map((t) => t.email || extractAddress(t)).join(', ')}
                </div>
              )}
              {email.cc?.length > 0 && (
                <div>
                  <span className="font-medium">Cc: </span>
                  {email.cc.map((t) => t.email || extractAddress(t)).join(', ')}
                </div>
              )}
            </div>

            <div className={`border-t mb-2 ${isSent ? 'border-purple-500' : 'border-gray-100'}`} />

            <div
              className={`text-sm leading-relaxed prose prose-sm max-w-none ${isSent ? 'prose-invert text-white' : 'text-gray-800'}`}
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
                    <div className={`w-8 h-8 rounded flex items-center justify-center flex-shrink-0 ${isSent ? 'bg-purple-700' : 'bg-purple-100'}`}>
                      <Paperclip className={`w-4 h-4 ${isSent ? 'text-white' : 'text-purple-600'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-medium truncate ${isSent ? 'text-white' : 'text-gray-700'}`}>{att.filename}</p>
                      <p className={`text-xs ${isSent ? 'text-purple-200' : 'text-gray-400'}`}>{Math.round(att.fileSize / 1024)} KB</p>
                    </div>
                    <Download className={`w-3.5 h-3.5 flex-shrink-0 ${isSent ? 'text-purple-200' : 'text-gray-400'}`} />
                  </div>
                ))}
              </div>
            )}

            {/* Quick actions inside bubble */}
            <div className={`flex items-center gap-2 mt-3 pt-2 border-t ${isSent ? 'border-purple-500' : 'border-gray-100'}`}>
              {[
                { mode: 'reply', icon: Reply, label: 'Reply' },
                { mode: 'replyAll', icon: ReplyAll, label: 'All' },
                { mode: 'forward', icon: Forward, label: 'Fwd' },
              ].map(({ mode, icon: Icon, label }) => (
                <button
                  key={mode}
                  onClick={() => onReply(email, mode)}
                  className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full
                    ${isSent ? 'bg-purple-500 text-white hover:bg-purple-400' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  <Icon className="w-3 h-3" /> {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Timestamp + star */}
        <div className="px-3 pb-2 flex items-center justify-between">
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
        <div className={`mt-1 bg-white border border-gray-100 rounded-xl shadow-lg z-20 overflow-hidden min-w-[140px] ${isSent ? 'mr-1' : 'ml-1'}`}>
          {[
            { icon: Reply, label: 'Reply', action: () => { onReply(email, 'reply'); setShowMenu(false); } },
            { icon: Forward, label: 'Forward', action: () => { onReply(email, 'forward'); setShowMenu(false); } },
            { icon: Archive, label: 'Archive', action: () => { onArchive(email.emailId); setShowMenu(false); } },
            { icon: Trash2, label: 'Delete', action: () => { onDelete(email.emailId); setShowMenu(false); }, danger: true },
          ].map(({ icon: Icon, label, action, danger }) => (
            <button key={label} onClick={action}
              className={`flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-50 ${danger ? 'text-red-500' : 'text-gray-700'}`}
            >
              <Icon className="w-3.5 h-3.5" /> {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Day Separator ─────────────────────────────────────────────────────────────

const DaySeparator = ({ date }) => (
  <div className="flex items-center justify-center my-3">
    <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
      {formatDayLabel(date)}
    </span>
  </div>
);

// ─── Reply / Forward Box (WYSIWYG, same pattern as Compose + BiizzedCreateArticle) ──

const ReplyBox = ({ mode, onSend, onClose, isSending, signature, customEmails, defaultEmailId }) => {
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const [activeFormats, setActiveFormats] = useState({});
  const [toField, setToField] = useState('');
  const [selectedEmailId, setSelectedEmailId] = useState(defaultEmailId || '');
  const [attachments, setAttachments] = useState([]);

  const modeLabel = mode === 'reply' ? 'Reply' : mode === 'replyAll' ? 'Reply All' : 'Forward';

  const updateFormats = () => {
    setActiveFormats({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
    });
  };

  useEffect(() => {
    document.addEventListener('selectionchange', () => {
      if (editorRef.current?.contains(window.getSelection()?.anchorNode)) updateFormats();
    });
  }, []);

  const execCmd = (cmd) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand(cmd, false, null);
    setTimeout(updateFormats, 10);
  };

  const insertLink = () => {
    const url = prompt('Enter URL:', 'https://');
    if (!url || !editorRef.current) return;
    editorRef.current.focus();
    const sel = window.getSelection();
    if (sel?.toString()) {
      document.execCommand('createLink', false, url);
    } else {
      const range = sel?.getRangeAt(0);
      if (!range) return;
      const a = document.createElement('a');
      a.href = url; a.textContent = url; a.target = '_blank';
      a.style.color = '#7c3aed'; a.style.textDecoration = 'underline';
      range.insertNode(a);
      range.setStartAfter(a); range.collapse(true);
      sel.removeAllRanges(); sel.addRange(range);
    }
  };

  const handleSend = () => {
    const html = editorRef.current?.innerHTML || '';
    const text = editorRef.current?.innerText?.trim() || '';
    onSend({ html, text, toField, selectedEmailId, attachments });
  };

  const handleFile = (e) => {
    const files = Array.from(e.target.files);
    setAttachments((prev) => [...prev, ...files.map((f) => ({ file: f, name: f.name, size: f.size }))]);
  };

  const formatFileSize = (b) => {
    if (!b) return '0 B';
    const k = 1024, s = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(b) / Math.log(k));
    return parseFloat((b / Math.pow(k, i)).toFixed(1)) + ' ' + s[i];
  };

  return (
    <div className="border-t border-gray-100 bg-white">
      <style>{`
        [contenteditable][data-placeholder]:empty::before { content: attr(data-placeholder); color: #9ca3af; pointer-events: none; }
        [contenteditable] a { color: #7c3aed; text-decoration: underline; }
        [contenteditable] ul { list-style-type: disc; padding-left: 1.5rem; margin: 0.25rem 0; }
        [contenteditable] ol { list-style-type: decimal; padding-left: 1.5rem; margin: 0.25rem 0; }
      `}</style>

      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
        <span className="text-xs font-semibold text-purple-600">{modeLabel}</span>
        <button onClick={onClose}><X className="w-4 h-4 text-gray-400" /></button>
      </div>

      {/* From selector */}
      {customEmails.length > 0 && (
        <div className="px-3 py-1.5 border-b border-gray-100">
          <select
            value={selectedEmailId}
            onChange={(e) => setSelectedEmailId(e.target.value)}
            className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-400 bg-gray-50"
          >
            {customEmails.map((ce) => (
              <option key={ce._id} value={ce._id}>
                {ce.displayName ? `${ce.displayName} <${ce.email}>` : ce.email}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* To field — only shown for forward */}
      {mode === 'forward' && (
        <div className="px-3 py-1.5 border-b border-gray-100">
          <input
            type="text"
            value={toField}
            onChange={(e) => setToField(e.target.value)}
            placeholder="To: recipient@example.com"
            className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1 border-b border-gray-100 bg-gray-50">
        <ToolbarBtn onClick={() => execCmd('bold')} icon={Bold} title="Bold" active={activeFormats.bold} />
        <ToolbarBtn onClick={() => execCmd('italic')} icon={Italic} title="Italic" active={activeFormats.italic} />
        <ToolbarBtn onClick={() => execCmd('underline')} icon={Underline} title="Underline" active={activeFormats.underline} />
        <div className="w-px h-4 bg-gray-300 mx-1" />
        <ToolbarBtn onClick={() => execCmd('insertUnorderedList')} icon={List} title="Bullet list" active={false} />
        <ToolbarBtn onClick={() => execCmd('insertOrderedList')} icon={ListOrdered} title="Numbered list" active={false} />
        <div className="w-px h-4 bg-gray-300 mx-1" />
        <ToolbarBtn onClick={insertLink} icon={LinkIcon} title="Insert link" active={false} />
        <ToolbarBtn onClick={() => fileInputRef.current?.click()} icon={Paperclip} title="Attach file" active={false} />
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        data-placeholder="Write your message..."
        className="px-3 py-2 text-sm text-gray-800 focus:outline-none min-h-[100px] max-h-[200px] overflow-y-auto"
      />

      {/* Signature */}
      {signature && (
        <div className="px-3 pb-1 text-xs text-gray-400 border-t border-gray-100 pt-1">
          {signature.split('\n').map((line, i) => <div key={i}>{line || <br />}</div>)}
        </div>
      )}

      {/* Attachments */}
      {attachments.length > 0 && (
        <div className="px-3 pb-2 flex flex-wrap gap-2">
          {attachments.map((att, i) => (
            <div key={i} className="flex items-center gap-1.5 bg-gray-100 rounded-lg px-2 py-1 text-xs">
              <Paperclip className="w-3 h-3 text-gray-400" />
              <span className="text-gray-700 max-w-[120px] truncate">{att.name}</span>
              <span className="text-gray-400">{formatFileSize(att.size)}</span>
              <button onClick={() => setAttachments((p) => p.filter((_, j) => j !== i))}>
                <X className="w-3 h-3 text-gray-400" />
              </button>
            </div>
          ))}
        </div>
      )}

      <input type="file" ref={fileInputRef} onChange={handleFile} multiple className="hidden" />

      {/* Send */}
      <div className="flex justify-end px-3 pb-3 pt-1">
        <button
          onClick={handleSend}
          disabled={isSending}
          className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 text-white text-sm rounded-full disabled:opacity-50 hover:bg-purple-700 transition"
        >
          {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          Send
        </button>
      </div>
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────

const EmailDetails = () => {
  const { emailId } = useParams();
  const navigate = useNavigate();

  const { data: emailData, isLoading, error, refetch } = useGetEmailByIdQuery(emailId);
  const { data: inboxData } = useGetInboxQuery({ page: 1, limit: 100, folder: 'inbox' });
  const { data: settingsData } = useGetSettingsQuery();
  const { data: customEmailsData } = useGetCustomEmailsQuery();

  const [deleteEmail] = useDeleteEmailMutation();
  const [markAsRead] = useMarkAsReadMutation();
  const [toggleStar] = useToggleStarMutation();
  const [toggleArchive] = useToggleArchiveMutation();
  const [sendEmail] = useSendEmailMutation();

  const [replyMode, setReplyMode] = useState(null);
  const [isSendingReply, setIsSendingReply] = useState(false);
  const bottomRef = useRef(null);

  const email = emailData?.data;
  const settings = settingsData?.data;
  const emailSignature = settings?.email?.signature || '';
  const allEmails = inboxData?.data?.emails || [];
  const customEmails = customEmailsData?.data?.emails || [];

  // Which custom email received this message
  const receivingAccount = useMemo(() => {
    if (!email) return null;
    const toAddr = extractAddress(email.to);
    return customEmails.find((ce) => ce.email?.toLowerCase() === toAddr.toLowerCase()) || null;
  }, [email, customEmails]);

  const defaultEmailId = receivingAccount?._id || customEmails.find((e) => e.isDefault)?._id || customEmails[0]?._id || '';

  // Build thread — all emails in the same conversation
  const threadEmails = useMemo(() => {
    if (!email) return [];
    const senderEmail = email.from?.email;
    const thread = allEmails.filter((e) => {
      const toAddr = extractAddress(e.to);
      return (
        e.from?.email === senderEmail ||
        toAddr.toLowerCase() === senderEmail?.toLowerCase()
      );
    });
    const hasCurrentEmail = thread.some((e) => e.emailId === email.emailId);
    const full = hasCurrentEmail ? thread : [email, ...thread];
    return full.sort(
      (a, b) => new Date(a.receivedAt || a.createdAt) - new Date(b.receivedAt || b.createdAt)
    );
  }, [email, allEmails]);

  // Group by day for separators
  const threadWithDays = useMemo(() => {
    const result = [];
    let lastDay = null;
    threadEmails.forEach((e) => {
      const day = format(new Date(e.receivedAt || e.createdAt), 'yyyy-MM-dd');
      if (day !== lastDay) {
        result.push({ type: 'day', date: e.receivedAt || e.createdAt, key: `day-${day}` });
        lastDay = day;
      }
      result.push({ type: 'email', email: e, key: e.emailId });
    });
    return result;
  }, [threadEmails]);

  useEffect(() => {
    if (email && !email.isRead && email.direction === 'received') {
      markAsRead(email.emailId).unwrap().catch(() => {});
    }
  }, [email]);

  // Scroll to bottom when thread loads or reply opens
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [threadWithDays, replyMode]);

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
    setReplyMode(mode);
  };

  const handleSendReply = async ({ html, text, toField, selectedEmailId, attachments }) => {
    if (!text) return;
    setIsSendingReply(true);
    try {
      const formData = new FormData();

      if (replyMode === 'forward') {
        const recipients = toField.split(',').map((s) => s.trim()).filter(Boolean);
        if (!recipients.length) { setIsSendingReply(false); return; }
        recipients.forEach((r) => formData.append('to', r));
      } else {
        formData.append('to', email.from?.email);
      }

      if (replyMode === 'replyAll' && email.cc?.length) {
        email.cc.forEach((c) => formData.append('cc', c.email || extractAddress(c)));
      }

      const prefix = replyMode === 'forward' ? 'Fwd: ' : 'Re: ';
      const subject = email.subject?.startsWith(prefix) ? email.subject : `${prefix}${email.subject}`;
      formData.append('subject', subject);
      formData.append('html', html);
      formData.append('customEmailId', selectedEmailId);
      formData.append('replyToEmailId', email.emailId);
      attachments.forEach((att) => formData.append('attachments', att.file));

      await sendEmail(formData).unwrap();
      setReplyMode(null);
      refetch();
    } catch (err) {
      console.error('Failed to send:', err);
    } finally {
      setIsSendingReply(false);
    }
  };

  // ── Loading / Error ──────────────────────────────────────────────────────────

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
          <button onClick={() => navigate('/inbox')} className="px-4 py-2 bg-purple-600 text-white text-sm rounded-full">
            Back to Inbox
          </button>
        </div>
      </div>
    );
  }

  const senderEmail = email.from?.email;

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">

      {/* ── Top Bar — fixed ── */}
      <div className="flex items-center gap-3 px-3 py-2.5 bg-white border-b border-gray-100 flex-shrink-0">
        <button onClick={() => navigate(-1)} className="p-1 -ml-1 flex-shrink-0">
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>

        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 ${getAvatarColor(senderEmail)}`}>
          {getInitials(senderEmail)}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{senderEmail}</p>
          <div className="flex items-center gap-2">
            <p className="text-xs text-gray-400">
              {threadEmails.length} {threadEmails.length === 1 ? 'message' : 'messages'}
            </p>
            {receivingAccount && (
              <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full truncate max-w-[150px]">
                {receivingAccount.displayName || receivingAccount.email}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={() => handleStar(email.emailId)} className="p-1.5 rounded-full hover:bg-gray-100">
            <Star className={`w-5 h-5 ${email.isStarred ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
          </button>
          <button onClick={() => handleArchive(email.emailId)} className="p-1.5 rounded-full hover:bg-gray-100">
            <Archive className="w-5 h-5 text-gray-400" />
          </button>
          <button onClick={() => handleDelete(email.emailId)} className="p-1.5 rounded-full hover:bg-gray-100">
            <Trash2 className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* ── Scrollable thread ── */}
      <div className="flex-1 overflow-y-auto px-3 py-3 min-h-0">
        {threadWithDays.map((item) => {
          if (item.type === 'day') return <DaySeparator key={item.key} date={item.date} />;
          const e = item.email;
          const isSent = e.direction === 'sent';
          const itemReceivingAccount = isSent ? null : (() => {
            const toAddr = extractAddress(e.to);
            return customEmails.find((ce) => ce.email?.toLowerCase() === toAddr.toLowerCase()) || null;
          })();
          return (
            <EmailBubble
              key={item.key}
              email={e}
              isSent={isSent}
              receivingAccount={itemReceivingAccount}
              onStar={handleStar}
              onDelete={handleDelete}
              onArchive={handleArchive}
              onReply={handleReply}
            />
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* ── Fixed bottom: reply box OR action buttons ── */}
      <div className="flex-shrink-0 bg-white border-t border-gray-100">
        {replyMode ? (
          <ReplyBox
            mode={replyMode}
            onSend={handleSendReply}
            onClose={() => setReplyMode(null)}
            isSending={isSendingReply}
            signature={emailSignature}
            customEmails={customEmails}
            defaultEmailId={defaultEmailId}
          />
        ) : (
          <div className="flex items-center gap-2 px-3 py-2.5">
            <button
              onClick={() => handleReply(email, 'reply')}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-gray-100 rounded-full text-sm text-gray-600 hover:bg-gray-200 transition"
            >
              <Reply className="w-4 h-4" /> Reply
            </button>
            <button
              onClick={() => handleReply(email, 'replyAll')}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-100 rounded-full text-sm text-gray-600 hover:bg-gray-200 transition"
            >
              <ReplyAll className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleReply(email, 'forward')}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-100 rounded-full text-sm text-gray-600 hover:bg-gray-200 transition"
            >
              <Forward className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailDetails;