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
  List, ListOrdered,
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
    'bg-rose-500','bg-orange-500','bg-amber-500','bg-green-500',
    'bg-teal-500','bg-cyan-500','bg-blue-500','bg-indigo-500',
    'bg-purple-500','bg-pink-500',
  ];
  let hash = 0;
  for (let i = 0; i < (email?.length || 0); i++)
    hash = email.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

const formatDate    = (d) => d ? format(new Date(d), "MMM d, yyyy 'at' h:mm a") : 'N/A';
const formatBubble  = (d) => d ? format(new Date(d), 'h:mm a') : '';
const formatDayLabel = (d) => {
  if (!d) return '';
  const diff = Math.floor((new Date() - new Date(d)) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return format(new Date(d), 'MMMM d, yyyy');
};
const getPlainText = (c) => c?.replace(/<[^>]*>/g, '') || '';

// ─── Toolbar Button ────────────────────────────────────────────────────────────

const ToolbarBtn = ({ onClick, icon: Icon, title, active }) => (
  <button
    type="button"
    onMouseDown={(e) => { e.preventDefault(); onClick(); }}
    title={title}
    className={`p-1.5 rounded transition-colors ${
      active ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-gray-200'
    }`}
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
      {!isSent && receivingAccount && (
        <p className="text-[10px] text-purple-500 font-medium mb-1 ml-1">
          → {receivingAccount.email}
        </p>
      )}

      <div className={`relative w-full max-w-[85%] md:max-w-[70%] rounded-2xl overflow-hidden shadow-sm ${
        isSent
          ? 'bg-purple-600 text-white rounded-tr-sm'
          : 'bg-white text-gray-900 rounded-tl-sm border border-gray-100'
      }`}>
        {/* Header row */}
        <div
          className="px-3 pt-3 pb-1 flex items-start justify-between gap-2 cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex-1 min-w-0">
            <p className={`text-xs font-semibold uppercase tracking-wide mb-0.5 ${
              isSent ? 'text-purple-200' : 'text-purple-600'
            }`}>
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
            {isLong && (expanded
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
              <div><span className="font-medium">From: </span>{email.from?.name || email.from?.email}</div>
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
              className={`text-sm leading-relaxed prose prose-sm max-w-none ${
                isSent ? 'prose-invert text-white' : 'text-gray-800'
              }`}
              dangerouslySetInnerHTML={{ __html: email.content }}
            />

            {email.attachments?.length > 0 && (
              <div className="mt-3 space-y-2">
                <p className={`text-xs font-medium ${isSent ? 'text-purple-200' : 'text-gray-500'}`}>
                  Attachments ({email.attachments.length})
                </p>
                {email.attachments.map((att, i) => (
                  <div
                    key={i}
                    onClick={() => window.open(att.url, '_blank')}
                    className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer ${
                      isSent ? 'bg-purple-500 hover:bg-purple-400' : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded flex items-center justify-center flex-shrink-0 ${
                      isSent ? 'bg-purple-700' : 'bg-purple-100'
                    }`}>
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
                    <Download className={`w-3.5 h-3.5 ${isSent ? 'text-purple-200' : 'text-gray-400'}`} />
                  </div>
                ))}
              </div>
            )}

            <div className={`flex items-center gap-2 mt-3 pt-2 border-t ${isSent ? 'border-purple-500' : 'border-gray-100'}`}>
              {[
                { mode: 'reply',    Icon: Reply,    label: 'Reply' },
                { mode: 'replyAll', Icon: ReplyAll, label: 'All'   },
                { mode: 'forward',  Icon: Forward,  label: 'Fwd'   },
              ].map(({ mode, Icon, label }) => (
                <button
                  key={mode}
                  onClick={() => onReply(email, mode)}
                  className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                    isSent
                      ? 'bg-purple-500 text-white hover:bg-purple-400'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
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
            {formatBubble(email.receivedAt || email.sentAt || email.createdAt)}
          </span>
          <button onClick={() => onStar(email.emailId)}>
            <Star className={`w-3.5 h-3.5 ${
              email.isStarred ? 'fill-yellow-400 text-yellow-400'
              : isSent ? 'text-purple-300' : 'text-gray-300'
            }`} />
          </button>
        </div>
      </div>

      {/* Context menu */}
      {showMenu && (
        <div className={`mt-1 bg-white border border-gray-100 rounded-xl shadow-lg z-20 overflow-hidden min-w-[140px] ${
          isSent ? 'mr-1' : 'ml-1'
        }`}>
          {[
            { Icon: Reply,   label: 'Reply',   action: () => { onReply(email, 'reply');   setShowMenu(false); } },
            { Icon: Forward, label: 'Forward', action: () => { onReply(email, 'forward'); setShowMenu(false); } },
            { Icon: Archive, label: 'Archive', action: () => { onArchive(email.emailId);  setShowMenu(false); } },
            { Icon: Trash2,  label: 'Delete',  action: () => { onDelete(email.emailId);   setShowMenu(false); }, danger: true },
          ].map(({ Icon, label, action, danger }) => (
            <button key={label} onClick={action}
              className={`flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-50 ${
                danger ? 'text-red-500' : 'text-gray-700'
              }`}
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

// ─── Reply Box ─────────────────────────────────────────────────────────────────

const ReplyBox = ({ mode, onSend, onClose, isSending, signature, customEmails, defaultEmailId }) => {
  const editorRef   = useRef(null);
  const fileInputRef = useRef(null);
  const [activeFormats, setActiveFormats] = useState({});
  const [toField, setToField]             = useState('');
  const [selectedEmailId, setSelectedEmailId] = useState(defaultEmailId || '');
  const [attachments, setAttachments]     = useState([]);

  const modeLabel = mode === 'reply' ? 'Reply' : mode === 'replyAll' ? 'Reply All' : 'Forward';

  const updateFormats = () => {
    if (!editorRef.current?.contains(window.getSelection()?.anchorNode)) return;
    setActiveFormats({
      bold:      document.queryCommandState('bold'),
      italic:    document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
    });
  };

  useEffect(() => {
    document.addEventListener('selectionchange', updateFormats);
    return () => document.removeEventListener('selectionchange', updateFormats);
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
    setAttachments((p) => [...p, ...files.map((f) => ({ file: f, name: f.name, size: f.size }))]);
  };

  const fmtSize = (b) => {
    if (!b) return '0 B';
    const k = 1024, s = ['B','KB','MB'];
    const i = Math.floor(Math.log(b) / Math.log(k));
    return parseFloat((b / Math.pow(k, i)).toFixed(1)) + ' ' + s[i];
  };

  return (
    <div className="bg-white border-t border-gray-200">
      <style>{`
        [contenteditable][data-placeholder]:empty::before {
          content: attr(data-placeholder); color: #9ca3af; pointer-events: none;
        }
        [contenteditable] a { color: #7c3aed; text-decoration: underline; }
        [contenteditable] ul { list-style-type: disc; padding-left: 1.5rem; margin: 0.25rem 0; }
        [contenteditable] ol { list-style-type: decimal; padding-left: 1.5rem; margin: 0.25rem 0; }
      `}</style>

      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
        <span className="text-xs font-semibold text-purple-600">{modeLabel}</span>
        <button onClick={onClose}><X className="w-4 h-4 text-gray-400 hover:text-gray-600" /></button>
      </div>

      {/* From */}
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

      {/* To — forward only */}
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
        <ToolbarBtn onClick={() => execCmd('bold')}               icon={Bold}         title="Bold"          active={activeFormats.bold}      />
        <ToolbarBtn onClick={() => execCmd('italic')}             icon={Italic}       title="Italic"        active={activeFormats.italic}    />
        <ToolbarBtn onClick={() => execCmd('underline')}          icon={Underline}    title="Underline"     active={activeFormats.underline} />
        <div className="w-px h-4 bg-gray-300 mx-1" />
        <ToolbarBtn onClick={() => execCmd('insertUnorderedList')} icon={List}         title="Bullet list"   active={false} />
        <ToolbarBtn onClick={() => execCmd('insertOrderedList')}  icon={ListOrdered}  title="Numbered list" active={false} />
        <div className="w-px h-4 bg-gray-300 mx-1" />
        <ToolbarBtn onClick={insertLink}                          icon={LinkIcon}     title="Insert link"   active={false} />
        <ToolbarBtn onClick={() => fileInputRef.current?.click()} icon={Paperclip}    title="Attach"        active={false} />
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        data-placeholder="Write your message..."
        className="px-3 py-2 text-sm text-gray-800 focus:outline-none min-h-[90px] max-h-[180px] overflow-y-auto"
      />

      {/* Signature */}
      {signature && (
        <div className="px-3 pb-1 border-t border-gray-100 pt-1">
          {signature.split('\n').map((line, i) => (
            <p key={i} className="text-xs text-gray-400">{line || <br />}</p>
          ))}
        </div>
      )}

      {/* Attachments */}
      {attachments.length > 0 && (
        <div className="px-3 pb-2 flex flex-wrap gap-2">
          {attachments.map((att, i) => (
            <div key={i} className="flex items-center gap-1.5 bg-gray-100 rounded-lg px-2 py-1 text-xs">
              <Paperclip className="w-3 h-3 text-gray-400" />
              <span className="text-gray-700 max-w-[100px] truncate">{att.name}</span>
              <span className="text-gray-400">{fmtSize(att.size)}</span>
              <button onClick={() => setAttachments((p) => p.filter((_, j) => j !== i))}>
                <X className="w-3 h-3 text-gray-400 hover:text-red-400" />
              </button>
            </div>
          ))}
        </div>
      )}
      <input type="file" ref={fileInputRef} onChange={handleFile} multiple className="hidden" />

      {/* Send row */}
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

// ─── Main ──────────────────────────────────────────────────────────────────────

const EmailDetails = () => {
  const { emailId } = useParams();
  const navigate    = useNavigate();

  const { data: emailData, isLoading, error, refetch } = useGetEmailByIdQuery(emailId);
  const { data: inboxData    } = useGetInboxQuery({ page: 1, limit: 100, folder: 'inbox' });
  const { data: settingsData } = useGetSettingsQuery();
  const { data: customEmailsData } = useGetCustomEmailsQuery();

  const [deleteEmail]   = useDeleteEmailMutation();
  const [markAsRead]    = useMarkAsReadMutation();
  const [toggleStar]    = useToggleStarMutation();
  const [toggleArchive] = useToggleArchiveMutation();
  const [sendEmail]     = useSendEmailMutation();

  const [replyMode, setReplyMode]         = useState(null);
  const [isSendingReply, setIsSending]    = useState(false);
  const bottomRef = useRef(null);

  const email        = emailData?.data;
  const allEmails    = inboxData?.data?.emails || [];
  const customEmails = customEmailsData?.data?.emails || [];
  const signature    = settingsData?.data?.email?.signature || '';

  const receivingAccount = useMemo(() => {
    if (!email) return null;
    const toAddr = extractAddress(email.to);
    return customEmails.find((ce) => ce.email?.toLowerCase() === toAddr.toLowerCase()) || null;
  }, [email, customEmails]);

  const defaultEmailId =
    receivingAccount?._id ||
    customEmails.find((e) => e.isDefault)?._id ||
    customEmails[0]?._id || '';

  const threadEmails = useMemo(() => {
    if (!email) return [];
    const sender = email.from?.email;
    const thread = allEmails.filter((e) => {
      const toAddr = extractAddress(e.to);
      return e.from?.email === sender || toAddr.toLowerCase() === sender?.toLowerCase();
    });
    const full = thread.some((e) => e.emailId === email.emailId)
      ? thread : [email, ...thread];
    return full.sort(
      (a, b) => new Date(a.receivedAt || a.createdAt) - new Date(b.receivedAt || b.createdAt)
    );
  }, [email, allEmails]);

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
    if (email && !email.isRead && email.direction === 'received')
      markAsRead(email.emailId).unwrap().catch(() => {});
  }, [email]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [threadWithDays.length, replyMode]);

  const handleStar    = async (id) => { await toggleStar(id).unwrap().catch(() => {}); refetch(); };
  const handleArchive = async (id) => { await toggleArchive(id).unwrap().catch(() => {}); navigate(-1); };
  const handleDelete  = async (id) => {
    if (window.confirm('Delete this email?')) {
      await deleteEmail(id).unwrap().catch(() => {});
      navigate(-1);
    }
  };

  const handleSendReply = async ({ html, text, toField, selectedEmailId, attachments }) => {
    if (!text) return;
    setIsSending(true);
    try {
      const fd = new FormData();
      if (replyMode === 'forward') {
        const recipients = toField.split(',').map((s) => s.trim()).filter(Boolean);
        if (!recipients.length) return;
        recipients.forEach((r) => fd.append('to', r));
      } else {
        fd.append('to', email.from?.email);
      }
      if (replyMode === 'replyAll' && email.cc?.length)
        email.cc.forEach((c) => fd.append('cc', c.email || extractAddress(c)));

      const prefix  = replyMode === 'forward' ? 'Fwd: ' : 'Re: ';
      const subject = email.subject?.startsWith(prefix) ? email.subject : `${prefix}${email.subject}`;
      fd.append('subject', subject);
      fd.append('html', html);
      fd.append('customEmailId', selectedEmailId);
      fd.append('replyToEmailId', email.emailId);
      attachments.forEach((a) => fd.append('attachments', a.file));

      await sendEmail(fd).unwrap();
      setReplyMode(null);
      refetch();
    } catch (err) {
      console.error('Send failed:', err);
    } finally {
      setIsSending(false);
    }
  };

  // ── Loading / Error ──────────────────────────────────────────────────────────

  if (isLoading) return (
    <div className="flex items-center justify-center h-screen bg-white">
      <div className="text-center">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-400">Loading...</p>
      </div>
    </div>
  );

  if (error || !email) return (
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

  // ── Render ───────────────────────────────────────────────────────────────────
  //
  // Layout trick that actually works on mobile:
  //   position:fixed top bar  +  position:fixed bottom bar
  //   scrollable middle with padding-top / padding-bottom to clear them
  //
  return (
    <div className="bg-gray-50 min-h-screen">

      {/* ── TOP BAR — truly fixed ── */}
      <div
        className="fixed top-0 left-0 right-0 z-20 bg-white border-b border-gray-100"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="flex items-center gap-2 px-3 py-2.5">
          <button onClick={() => navigate(-1)} className="p-1 -ml-1 flex-shrink-0">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>

          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 ${getAvatarColor(email.from?.email)}`}>
            {getInitials(email.from?.email)}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate leading-tight">
              {email.from?.email}
            </p>
            <div className="flex items-center gap-1.5 flex-wrap">
              <p className="text-xs text-gray-400 leading-tight">
                {threadEmails.length} {threadEmails.length === 1 ? 'message' : 'messages'}
              </p>
              {receivingAccount && (
                <span className="text-[10px] font-medium text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded-full truncate max-w-[120px]">
                  {receivingAccount.email}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-0.5 flex-shrink-0">
            <button onClick={() => handleStar(email.emailId)} className="p-1.5 rounded-full hover:bg-gray-100">
              <Star className={`w-4 h-4 ${email.isStarred ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
            </button>
            <button onClick={() => handleArchive(email.emailId)} className="p-1.5 rounded-full hover:bg-gray-100">
              <Archive className="w-4 h-4 text-gray-400" />
            </button>
            <button onClick={() => handleDelete(email.emailId)} className="p-1.5 rounded-full hover:bg-gray-100">
              <Trash2 className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* ── SCROLLABLE THREAD — padded to clear fixed bars ── */}
      <div
        className="overflow-y-auto px-3 py-3"
        style={{
          paddingTop:    'calc(env(safe-area-inset-top) + 64px)',
          paddingBottom: replyMode ? '480px' : '80px',
        }}
      >
        {threadWithDays.map((item) => {
          if (item.type === 'day') return <DaySeparator key={item.key} date={item.date} />;
          const e = item.email;
          const isSent = e.direction === 'sent';
          const itemReceiving = isSent ? null : (() => {
            const toAddr = extractAddress(e.to);
            return customEmails.find((ce) => ce.email?.toLowerCase() === toAddr.toLowerCase()) || null;
          })();
          return (
            <EmailBubble
              key={item.key}
              email={e}
              isSent={isSent}
              receivingAccount={itemReceiving}
              onStar={handleStar}
              onDelete={handleDelete}
              onArchive={handleArchive}
              onReply={(_, mode) => setReplyMode(mode)}
            />
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* ── BOTTOM BAR — truly fixed ── */}
      <div
        className="fixed bottom-0 left-0 right-0 z-20"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {replyMode ? (
          <ReplyBox
            mode={replyMode}
            onSend={handleSendReply}
            onClose={() => setReplyMode(null)}
            isSending={isSendingReply}
            signature={signature}
            customEmails={customEmails}
            defaultEmailId={defaultEmailId}
          />
        ) : (
          <div className="bg-white border-t border-gray-100 flex items-center gap-2 px-3 py-2.5">
            <button
              onClick={() => setReplyMode('reply')}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-gray-100 rounded-full text-sm text-gray-600 hover:bg-gray-200 transition"
            >
              <Reply className="w-4 h-4" /> Reply
            </button>
            <button
              onClick={() => setReplyMode('replyAll')}
              className="flex items-center justify-center px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-600 hover:bg-gray-200 transition"
            >
              <ReplyAll className="w-4 h-4" />
            </button>
            <button
              onClick={() => setReplyMode('forward')}
              className="flex items-center justify-center px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-600 hover:bg-gray-200 transition"
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