import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useGetEmailByIdQuery,
  useDeleteEmailMutation,
  useMarkAsReadMutation,
  useToggleStarMutation,
  useToggleArchiveMutation,
  useGetCustomEmailsQuery,
  useGetInboxQuery,
} from '../slices/emailApiSlice';
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
  ChevronDown,
  ChevronUp,
  MoreVertical,
  FileText,
  File,
  FileArchive,
  FileImage,
  ZoomIn,
} from 'lucide-react';
import { format } from 'date-fns';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const extractAddress = (to) => {
  const raw = Array.isArray(to) ? to[0] : to;
  if (!raw) return '';
  if (typeof raw === 'string') return raw;
  return raw.email || raw.address || raw.value || '';
};

const getInitials = (email) => (email?.split('@')[0] || '?').slice(0, 2).toUpperCase();

const getAvatarColor = (email) => {
  const colors = [
    'bg-rose-500', 'bg-orange-500', 'bg-amber-500', 'bg-green-500',
    'bg-teal-500', 'bg-cyan-500', 'bg-blue-500', 'bg-indigo-500',
    'bg-purple-500', 'bg-pink-500',
  ];
  let hash = 0;
  for (let i = 0; i < (email?.length || 0); i++) hash = email.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

const formatDate = (d) => (d ? format(new Date(d), "MMM d, yyyy 'at' h:mm a") : 'N/A');
const formatBubble = (d) => (d ? format(new Date(d), 'h:mm a') : '');
const formatDayLabel = (d) => {
  if (!d) return '';
  const diff = Math.floor((new Date() - new Date(d)) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return format(new Date(d), 'MMMM d, yyyy');
};

const getPlainText = (c) => c?.replace(/<[^>]*>/g, '') || '';

const cleanHtmlContent = (html) => {
  if (!html) return '';
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  let text = tempDiv.textContent || tempDiv.innerText || '';
  text = text.replace(/\n\s*\n\s*\n/g, '\n\n');
  return text.trim();
};

const formatQuotedContent = (originalEmail, mode) => {
  const date = format(new Date(originalEmail.receivedAt || originalEmail.createdAt), 'MMM d, yyyy \'at\' h:mm a');
  const fromName = originalEmail.from?.name || originalEmail.from?.email;
  const fromEmail = originalEmail.from?.email;
  const from = fromName || fromEmail;
  const to = originalEmail.to?.map((t) => t.email || extractAddress(t)).join(', ');
  const subject = originalEmail.subject;
  const cleanBody = cleanHtmlContent(originalEmail.content);

  if (mode === 'reply') {
    return `\n\n\nOn ${date}, ${from} wrote:\n${cleanBody
      .split('\n')
      .map((line) => `> ${line}`)
      .join('\n')}`;
  } else if (mode === 'forward') {
    return `\n\n\n---------- Forwarded message ----------\nFrom: ${from}\nDate: ${date}\nSubject: ${subject}\nTo: ${to}\n\n${cleanBody}`;
  }
  return cleanBody;
};

// ─── Attachment utilities ────────────────────────────────────────────────────

// Get file extension from filename
const getExtension = (filename) => filename?.split('.').pop().toLowerCase() || '';

// Get a displayable URL for an attachment.
// Different backends/serializers can name this field differently, so we check
// every variant we've seen rather than assuming "url" or "content" only.
// This is the fix for PDFs (and other non-image files) not rendering/opening:
// previously only `url`, `content`, and `data` were checked, and many APIs put
// the file under `fileUrl`, `downloadUrl`, `path`, `location`, or `s3Url`.
const getAttachmentUrl = (attachment) => {
  if (!attachment) return null;

  const directUrlFields = ['url', 'fileUrl', 'downloadUrl', 'location', 's3Url', 'path', 'href', 'link'];
  for (const field of directUrlFields) {
    if (attachment[field]) return attachment[field];
  }

  // Base64 payload under various possible field names
  const base64Fields = ['content', 'data', 'base64', 'fileContent'];
  for (const field of base64Fields) {
    const value = attachment[field];
    if (value) {
      if (typeof value === 'string' && value.startsWith('data:')) return value;
      const mimeType = attachment.mimeType || attachment.contentType || attachment.type || 'application/octet-stream';
      return `data:${mimeType};base64,${value}`;
    }
  }

  return null;
};

const getMimeType = (attachment) =>
  attachment?.mimeType || attachment?.contentType || attachment?.type || '';

// Get file icon based on mime type or extension
const getFileIcon = (mimeType, filename) => {
  const ext = getExtension(filename);
  if (mimeType?.startsWith('image/')) return <FileImage className="w-4 h-4 text-blue-500" />;
  if (mimeType === 'application/pdf' || ext === 'pdf') return <FileText className="w-4 h-4 text-red-500" />;
  if (mimeType?.includes('word') || ['doc', 'docx'].includes(ext)) return <FileText className="w-4 h-4 text-blue-700" />;
  if (mimeType?.includes('excel') || ['xls', 'xlsx'].includes(ext)) return <FileText className="w-4 h-4 text-green-600" />;
  if (mimeType?.includes('zip') || ['zip', 'rar'].includes(ext)) return <FileArchive className="w-4 h-4 text-yellow-600" />;
  return <File className="w-4 h-4 text-gray-500" />;
};

// ─── Image Preview Modal ──────────────────────────────────────────────────────

const ImagePreviewModal = ({ src, fileName, onClose }) => {
  if (!src) return null;
  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="relative max-w-4xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <button
          className="absolute -top-10 right-0 text-white text-2xl hover:text-gray-300"
          onClick={onClose}
          aria-label="Close preview"
        >
          ✕
        </button>
        <img
          src={src}
          alt={fileName || 'Preview'}
          className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
        />
        {fileName && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs px-3 py-2 rounded-b-lg flex items-center justify-between">
            <span className="truncate">{fileName}</span>
            <a
              href={src}
              download={fileName}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 ml-3 flex-shrink-0 hover:text-purple-300"
            >
              <Download className="w-3.5 h-3.5" /> Download
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Email Bubble ──────────────────────────────────────────────────────────────

const EmailBubble = ({
  email,
  isSent,
  receivingAccount,
  onStar,
  onDelete,
  onArchive,
  onReply,
  onPreviewImage,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const preview = getPlainText(email.content).slice(0, 120);
  const isLong = getPlainText(email.content).length > 120 || email.content?.includes('<');

  // Log attachments for debugging
  useEffect(() => {
    if (email.attachments?.length) {
      console.log('📎 Attachments for email', email.emailId, email.attachments);
    }
  }, [email]);

  return (
    <div className={`flex flex-col mb-3 ${isSent ? 'items-end' : 'items-start'}`}>
      {!isSent && receivingAccount && (
        <p className="text-[10px] text-purple-500 font-medium mb-1 ml-1">→ {receivingAccount.email}</p>
      )}

      <div
        className={`relative w-full max-w-[85%] md:max-w-[70%] rounded-2xl overflow-hidden shadow-sm ${
          isSent
            ? 'bg-purple-600 text-white rounded-tr-sm'
            : 'bg-white text-gray-900 rounded-tl-sm border border-gray-100'
        }`}
      >
        {/* Header row */}
        <div
          className="px-3 pt-3 pb-1 flex items-start justify-between gap-2 cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex-1 min-w-0">
            <p
              className={`text-xs font-semibold uppercase tracking-wide mb-0.5 ${
                isSent ? 'text-purple-200' : 'text-purple-600'
              }`}
            >
              {email.subject || '(No Subject)'}
            </p>
            {!expanded && (
              <p className={`text-sm leading-snug ${isSent ? 'text-purple-100' : 'text-gray-600'}`}>
                {preview}
                {isLong ? '…' : ''}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {email.attachments?.length > 0 && (
              <Paperclip className={`w-3.5 h-3.5 ${isSent ? 'text-purple-200' : 'text-gray-400'}`} />
            )}
            {isLong &&
              (expanded ? (
                <ChevronUp className={`w-3.5 h-3.5 ${isSent ? 'text-purple-200' : 'text-gray-400'}`} />
              ) : (
                <ChevronDown className={`w-3.5 h-3.5 ${isSent ? 'text-purple-200' : 'text-gray-400'}`} />
              ))}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
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
              <div>
                <span className="font-medium">From: </span>
                {email.from?.name || email.from?.email}
              </div>
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

            {/* ─── ATTACHMENTS ─── */}
            {email.attachments && email.attachments.length > 0 && (
              <div className="mt-3 space-y-2">
                <p className={`text-xs font-medium ${isSent ? 'text-purple-200' : 'text-gray-500'}`}>
                  Attachments ({email.attachments.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {email.attachments.map((att, i) => {
                    const fileUrl = getAttachmentUrl(att);
                    const mimeType = getMimeType(att);
                    const fileName = att.filename || att.originalName || att.name || 'file';
                    const fileSize = att.fileSize || att.size || 0;
                    const isImage = mimeType?.startsWith('image/') && !!fileUrl;

                    // If we genuinely have no URL/base64 for this file, say so —
                    // but this should now be rare since getAttachmentUrl checks
                    // many more field name variants.
                    if (!fileUrl) {
                      return (
                        <div
                          key={i}
                          className={`flex items-center gap-2 p-2 rounded-lg ${
                            isSent ? 'bg-purple-500' : 'bg-gray-50'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded flex items-center justify-center ${isSent ? 'bg-purple-700' : 'bg-gray-200'}`}>
                            <File className={`w-4 h-4 ${isSent ? 'text-white' : 'text-gray-500'}`} />
                          </div>
                          <span className={`text-xs ${isSent ? 'text-white' : 'text-gray-600'}`}>
                            {fileName} (no URL)
                          </span>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={i}
                        className={`flex items-center gap-2 p-2 rounded-lg ${
                          isSent ? 'bg-purple-500 hover:bg-purple-400' : 'bg-gray-50 hover:bg-gray-100'
                        } border border-transparent hover:border-gray-200 transition`}
                      >
                        {/* Thumbnail / Icon */}
                        <div
                          className="relative w-10 h-10 rounded flex items-center justify-center flex-shrink-0 cursor-pointer group"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isImage) {
                              onPreviewImage({ src: fileUrl, fileName });
                            } else {
                              window.open(fileUrl, '_blank', 'noopener,noreferrer');
                            }
                          }}
                        >
                          {isImage ? (
                            <>
                              <img
                                src={fileUrl}
                                alt={fileName}
                                className="w-full h-full object-cover rounded"
                              />
                              {/* Zoom affordance on hover so it's clear it's previewable */}
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 rounded flex items-center justify-center transition">
                                <ZoomIn className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition" />
                              </div>
                            </>
                          ) : (
                            <div className={`w-full h-full rounded flex items-center justify-center ${isSent ? 'bg-purple-700' : 'bg-purple-100'}`}>
                              {getFileIcon(mimeType, fileName)}
                            </div>
                          )}
                        </div>

                        {/* File info */}
                        <div
                          className="flex-1 min-w-0 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isImage) {
                              onPreviewImage({ src: fileUrl, fileName });
                            } else {
                              window.open(fileUrl, '_blank', 'noopener,noreferrer');
                            }
                          }}
                        >
                          <p className={`text-xs font-medium truncate max-w-[120px] ${isSent ? 'text-white' : 'text-gray-700'}`}>
                            {fileName}
                          </p>
                          <p className={`text-xs ${isSent ? 'text-purple-200' : 'text-gray-400'}`}>
                            {fileSize ? `${Math.round(fileSize / 1024)} KB` : ''}
                          </p>
                        </div>

                        {/* Download button */}
                        <a
                          href={fileUrl}
                          download={fileName}
                          target={fileUrl.startsWith('data:') ? undefined : '_blank'}
                          rel="noopener noreferrer"
                          className={`p-1 rounded hover:bg-opacity-20 ${isSent ? 'hover:bg-white' : 'hover:bg-gray-200'}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Download className={`w-3.5 h-3.5 ${isSent ? 'text-purple-200' : 'text-gray-400'}`} />
                        </a>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div
              className={`flex items-center gap-2 mt-3 pt-2 border-t ${
                isSent ? 'border-purple-500' : 'border-gray-100'
              }`}
            >
              {[
                { mode: 'reply', Icon: Reply, label: 'Reply' },
                { mode: 'replyAll', Icon: ReplyAll, label: 'All' },
                { mode: 'forward', Icon: Forward, label: 'Fwd' },
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
            <Star
              className={`w-3.5 h-3.5 ${
                email.isStarred
                  ? 'fill-yellow-400 text-yellow-400'
                  : isSent
                  ? 'text-purple-300'
                  : 'text-gray-300'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Context menu */}
      {showMenu && (
        <div
          className={`mt-1 bg-white border border-gray-100 rounded-xl shadow-lg z-20 overflow-hidden min-w-[140px] ${
            isSent ? 'mr-1' : 'ml-1'
          }`}
        >
          {[
            { Icon: Reply, label: 'Reply', action: () => onReply(email, 'reply') },
            { Icon: Forward, label: 'Forward', action: () => onReply(email, 'forward') },
            { Icon: Archive, label: 'Archive', action: () => onArchive(email.emailId) },
            { Icon: Trash2, label: 'Delete', action: () => onDelete(email.emailId), danger: true },
          ].map(({ Icon, label, action, danger }) => (
            <button
              key={label}
              onClick={() => {
                action();
                setShowMenu(false);
              }}
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
    <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{formatDayLabel(date)}</span>
  </div>
);

// ─── Main ──────────────────────────────────────────────────────────────────────

const EmailDetails = () => {
  const { emailId } = useParams();
  const navigate = useNavigate();

  const { data: emailData, isLoading, error, refetch } = useGetEmailByIdQuery(emailId);
  const { data: inboxData } = useGetInboxQuery({ page: 1, limit: 100, folder: 'inbox' });
  const { data: customEmailsData } = useGetCustomEmailsQuery();

  const [deleteEmail] = useDeleteEmailMutation();
  const [markAsRead] = useMarkAsReadMutation();
  const [toggleStar] = useToggleStarMutation();
  const [toggleArchive] = useToggleArchiveMutation();

  const [replyState, setReplyState] = useState(null);
  const [showCompose, setShowCompose] = useState(false);
  const [ComposeComponent, setComposeComponent] = useState(null);
  const [previewImage, setPreviewImage] = useState(null); // { src, fileName } | null

  const email = emailData?.data;
  const allEmails = inboxData?.data?.emails || [];
  const customEmails = customEmailsData?.data?.emails || [];

  useEffect(() => {
    import('./Compose.jsx').then((module) => {
      setComposeComponent(() => module.default);
    });
  }, []);

  useEffect(() => {
    const updateSidebarWidth = () => {
      const sidebar = document.querySelector('.lg\\:flex.lg\\:flex-col');
      if (sidebar) {
        const width = sidebar.offsetWidth;
        document.documentElement.style.setProperty('--sidebar-width', `${width}px`);
      } else {
        document.documentElement.style.setProperty('--sidebar-width', '0px');
      }
    };
    updateSidebarWidth();
    window.addEventListener('resize', updateSidebarWidth);
    const observer = new MutationObserver(updateSidebarWidth);
    const sidebar = document.querySelector('.lg\\:flex.lg\\:flex-col');
    if (sidebar) observer.observe(sidebar, { attributes: true, attributeFilter: ['class', 'style'] });
    return () => {
      window.removeEventListener('resize', updateSidebarWidth);
      observer.disconnect();
    };
  }, []);

  const receivingAccount = useMemo(() => {
    if (!email) return null;
    const toAddr = extractAddress(email.to);
    return customEmails.find((ce) => ce.email?.toLowerCase() === toAddr.toLowerCase()) || null;
  }, [email, customEmails]);

  const threadEmails = useMemo(() => {
    if (!email) return [];
    const sender = email.from?.email;
    const thread = allEmails.filter((e) => {
      const toAddr = extractAddress(e.to);
      return e.from?.email === sender || toAddr.toLowerCase() === sender?.toLowerCase();
    });
    const full = thread.some((e) => e.emailId === email.emailId) ? thread : [email, ...thread];
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

  const handleReply = (emailItem, mode) => {
    const subject = emailItem.subject;
    let replySubject = '';
    let replyTo = '';
    let replyCc = '';
    let replyContent = '';

    if (mode === 'reply') {
      replySubject = subject?.startsWith('Re:') ? subject : `Re: ${subject}`;
      replyTo = emailItem.from?.email;
      replyContent = formatQuotedContent(emailItem, 'reply');
    } else if (mode === 'replyAll') {
      replySubject = subject?.startsWith('Re:') ? subject : `Re: ${subject}`;
      replyTo = emailItem.from?.email;
      const allRecipients = (emailItem.to || [])
        .map((t) => t.email || extractAddress(t))
        .filter((addr) => addr !== emailItem.from?.email);
      if (emailItem.cc) {
        allRecipients.push(...emailItem.cc.map((c) => c.email || extractAddress(c)));
      }
      replyCc = allRecipients.join(', ');
      replyContent = formatQuotedContent(emailItem, 'reply');
    } else if (mode === 'forward') {
      replySubject = subject?.startsWith('Fwd:') ? subject : `Fwd: ${subject}`;
      replyTo = '';
      replyContent = formatQuotedContent(emailItem, 'forward');
    }

    setReplyState({
      mode,
      email: emailItem,
      to: replyTo,
      cc: replyCc,
      subject: replySubject,
      content: replyContent,
    });
    setShowCompose(true);
  };

  const handleCloseCompose = () => {
    setShowCompose(false);
    setReplyState(null);
  };

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-400">Loading...</p>
        </div>
      </div>
    );

  if (error || !email)
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

  return (
    <>
      <ImagePreviewModal
        src={previewImage?.src}
        fileName={previewImage?.fileName}
        onClose={() => setPreviewImage(null)}
      />

      <div className="bg-gray-50 min-h-screen">
        {/* Top bar */}
        <div
          className="fixed top-0 right-0 z-20 bg-white border-b border-gray-100"
          style={{
            left: 'var(--sidebar-width, 0px)',
            right: 0,
            paddingTop: 'env(safe-area-inset-top)',
          }}
        >
          <div className="flex items-center gap-2 px-3 py-2.5">
            <button onClick={() => navigate(-1)} className="p-1 -ml-1 flex-shrink-0">
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 ${getAvatarColor(
                email.from?.email
              )}`}
            >
              {getInitials(email.from?.email)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate leading-tight">{email.from?.email}</p>
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
                <Star
                  className={`w-4 h-4 ${
                    email.isStarred ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'
                  }`}
                />
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

        {/* Thread */}
        <div
          className="overflow-y-auto px-3 py-3"
          style={{
            paddingTop: 'calc(env(safe-area-inset-top) + 64px)',
            paddingBottom: '80px',
          }}
        >
          {threadWithDays.map((item) => {
            if (item.type === 'day') return <DaySeparator key={item.key} date={item.date} />;
            const e = item.email;
            const isSent = e.direction === 'sent';
            const itemReceiving = isSent
              ? null
              : (() => {
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
                onReply={handleReply}
                onPreviewImage={setPreviewImage}
              />
            );
          })}
        </div>

        {/* Bottom bar */}
        <div
          className="fixed bottom-0 right-0 z-20 bg-white border-t border-gray-100"
          style={{
            left: 'var(--sidebar-width, 0px)',
            right: 0,
            paddingBottom: 'env(safe-area-inset-bottom)',
          }}
        >
          <div className="flex items-center gap-2 px-3 py-2.5">
            <button
              onClick={() => handleReply(email, 'reply')}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-gray-100 rounded-full text-sm text-gray-600 hover:bg-gray-200 transition"
            >
              <Reply className="w-4 h-4" /> Reply
            </button>
            <button
              onClick={() => handleReply(email, 'replyAll')}
              className="flex items-center justify-center px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-600 hover:bg-gray-200 transition"
            >
              <ReplyAll className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleReply(email, 'forward')}
              className="flex items-center justify-center px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-600 hover:bg-gray-200 transition"
            >
              <Forward className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {showCompose && replyState && ComposeComponent && (
        <div className="fixed inset-0 z-50">
          <ComposeComponent
            initialTo={replyState.to}
            initialCc={replyState.cc}
            initialSubject={replyState.subject}
            initialContent={replyState.content}
            isReply={true}
            onClose={handleCloseCompose}
          />
        </div>
      )}
    </>
  );
};

export default EmailDetails;