import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useSendEmailMutation, useGetCustomEmailsQuery } from '../slices/emailApiSlice';
import { 
  Send, 
  Paperclip, 
  X, 
  Minimize2, 
  Maximize2,
  Loader2,
  AlertCircle,
  CheckCircle,
  ChevronDown
} from 'lucide-react';

const Compose = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const [sendEmail, { isLoading }] = useSendEmailMutation();
  const { data: customEmailsData } = useGetCustomEmailsQuery();

  const customEmails = customEmailsData?.data?.emails || [];
  const defaultEmail = customEmails.find(e => e.isDefault) || customEmails[0];

  const [emailData, setEmailData] = useState({
    to: '',
    cc: '',
    bcc: '',
    subject: '',
    content: '',
    customEmailId: ''
  });

  const [attachments, setAttachments] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);

  const fileInputRef = useRef(null);
  const contentRef = useRef(null);
  const dropdownRef = useRef(null);

  const selectedEmail = customEmails.find(e => e._id === emailData.customEmailId);

  useEffect(() => {
    if (defaultEmail && !emailData.customEmailId) {
      setEmailData(prev => ({ ...prev, customEmailId: defaultEmail._id }));
    }
  }, [defaultEmail]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToChange = useCallback((e) => {
    setEmailData(prev => ({ ...prev, to: e.target.value }));
    setError('');
  }, []);

  const handleSubjectChange = useCallback((e) => {
    setEmailData(prev => ({ ...prev, subject: e.target.value }));
    setError('');
  }, []);

  const handleContentChange = useCallback((e) => {
    setEmailData(prev => ({ ...prev, content: e.target.value }));
    setError('');
  }, []);

  const handleCcChange = useCallback((e) => {
    setEmailData(prev => ({ ...prev, cc: e.target.value }));
    setError('');
  }, []);

  const handleBccChange = useCallback((e) => {
    setEmailData(prev => ({ ...prev, bcc: e.target.value }));
    setError('');
  }, []);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const newAttachments = files.map(file => ({
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
    }));
    setAttachments(prev => [...prev, ...newAttachments]);
  };

  const removeAttachment = (index) => {
    setAttachments(prev => {
      const updated = [...prev];
      if (updated[index].preview) URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!emailData.to) return setError('Please enter at least one recipient');
    if (!emailData.subject) return setError('Please enter a subject');
    if (!emailData.content) return setError('Please enter email content');

    try {
      const formData = new FormData();
      formData.append('to', emailData.to.split(',').map(e => e.trim()));
      if (emailData.cc) formData.append('cc', emailData.cc.split(',').map(e => e.trim()));
      if (emailData.bcc) formData.append('bcc', emailData.bcc.split(',').map(e => e.trim()));
      formData.append('subject', emailData.subject);
      formData.append('html', emailData.content);
      formData.append('customEmailId', emailData.customEmailId);
      attachments.forEach(att => formData.append('attachments', att.file));

      await sendEmail(formData).unwrap();
      setSuccess('Email sent successfully!');
      setTimeout(() => navigate('/sent'), 2000);
    } catch (err) {
      setError(err.data?.message || 'Failed to send email');
    }
  };

  const handleDiscard = () => {
    if (emailData.to || emailData.subject || emailData.content || attachments.length > 0) {
      if (window.confirm('Are you sure you want to discard this email?')) navigate(-1);
    } else {
      navigate(-1);
    }
  };

  const selectCustomEmail = (emailId) => {
    setEmailData(prev => ({ ...prev, customEmailId: emailId }));
    setShowDropdown(false);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const autoLinkify = (text) => {
    if (!text) return '';
    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9][a-zA-Z0-9-]*\.[a-zA-Z]{2,}(?:\/[^\s]*)?)/g;
    return text.replace(urlRegex, (url) => {
      let href = url;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        href = 'https://' + url;
      }
      return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="text-purple-600 hover:underline">${url}</a>`;
    });
  };

  // ── Shared sub-sections (used in both views) ──────────────────────────────

  const FromDropdown = ({ isMobile }) => (
    <div className="relative" ref={dropdownRef}>
      <label className="text-xs font-medium text-gray-500 mb-1 block">From</label>
      <button
        type="button"
        onClick={() => setShowDropdown(prev => !prev)}
        className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg hover:border-purple-300 transition text-sm"
      >
        <div className="flex items-center space-x-2 min-w-0">
          {selectedEmail?.profilePicture?.url ? (
            <img src={selectedEmail.profilePicture.url} className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} rounded-full flex-shrink-0`} alt="" />
          ) : (
            <div className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0`}>
              <span className="text-xs text-purple-600 font-medium">
                {(selectedEmail?.displayName?.[0] || selectedEmail?.username?.[0] || 'U').toUpperCase()}
              </span>
            </div>
          )}
          <div className="text-left min-w-0">
            <p className="text-gray-800 text-sm font-medium truncate">{selectedEmail?.displayName || selectedEmail?.username}</p>
            {!isMobile && <p className="text-gray-400 text-xs truncate">{selectedEmail?.email}</p>}
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
      </button>

      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-30 max-h-60 overflow-y-auto">
          {customEmails.map(email => (
            <button
              key={email._id}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                selectCustomEmail(email._id);
              }}
              className={`w-full flex items-center space-x-3 px-3 py-2 hover:bg-gray-50 transition text-sm ${
                emailData.customEmailId === email._id ? 'bg-purple-50' : ''
              }`}
            >
              {email.profilePicture?.url ? (
                <img src={email.profilePicture.url} className="w-7 h-7 rounded-full flex-shrink-0" alt="" />
              ) : (
                <div className="w-7 h-7 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xs text-purple-600 font-medium">
                    {(email.displayName?.[0] || email.username?.[0] || 'U').toUpperCase()}
                  </span>
                </div>
              )}
              <div className="flex-1 text-left min-w-0">
                <p className="text-gray-800 font-medium truncate">{email.displayName || email.username}</p>
                <p className="text-gray-400 text-xs truncate">{email.email}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  const AttachmentList = () => (
    attachments.length > 0 ? (
      <div className="space-y-2">
        <p className="text-xs font-medium text-gray-500">Attachments</p>
        <div className="flex flex-wrap gap-2">
          {attachments.map((att, index) => (
            <div key={index} className="flex items-center space-x-2 bg-gray-100 rounded-lg px-2 py-1">
              {att.preview ? (
                <img src={att.preview} alt={att.name} className="w-8 h-8 object-cover rounded" />
              ) : (
                <Paperclip className="w-4 h-4 text-gray-400" />
              )}
              <div className="min-w-0">
                <p className="text-xs text-gray-700 max-w-[150px] truncate">{att.name}</p>
                <p className="text-[10px] text-gray-400">{formatFileSize(att.size)}</p>
              </div>
              <button type="button" onClick={() => removeAttachment(index)} className="p-1 hover:bg-gray-200 rounded flex-shrink-0">
                <X className="w-3 h-3 text-gray-400" />
              </button>
            </div>
          ))}
        </div>
      </div>
    ) : null
  );

  const StatusMessages = () => (
    <>
      {error && (
        <div className="flex items-center space-x-2 p-3 bg-red-50 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      {success && (
        <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg">
          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
          <p className="text-sm text-green-600">{success}</p>
        </div>
      )}
    </>
  );

  // ── Minimized pill ────────────────────────────────────────────────────────
  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 w-72 z-50">
        <div
          className="flex items-center justify-between px-3 py-2 bg-purple-600 text-white rounded-t-lg cursor-pointer"
          onClick={() => setIsMinimized(false)}
        >
          <div className="flex items-center space-x-2">
            <Send className="w-4 h-4" />
            <span className="text-xs font-medium">New Message</span>
          </div>
          <Maximize2 className="w-4 h-4" />
        </div>
        <div className="p-2">
          <p className="text-xs text-gray-500 truncate">To: {emailData.to || '...'}</p>
          <p className="text-xs text-gray-500 truncate">Subject: {emailData.subject || 'No subject'}</p>
        </div>
      </div>
    );
  }

  // ── MOBILE ────────────────────────────────────────────────────────────────
  const mobileView = (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 bg-purple-600 text-white sticky top-0 z-10">
        <div className="flex items-center space-x-2">
          <Send className="w-5 h-5" />
          <h2 className="text-base font-semibold">New Message</h2>
        </div>
        <button type="button" onClick={handleDiscard} className="p-1">
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
          <FromDropdown isMobile />

          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">To</label>
            <input
              type="text"
              value={emailData.to}
              onChange={handleToChange}
              placeholder="recipient@example.com"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none"
            />
            <div className="flex items-center space-x-3 mt-1">
              <button type="button" onClick={() => setShowCc(v => !v)} className="text-xs text-purple-600">
                {showCc ? 'Hide CC' : 'Add CC'}
              </button>
              <button type="button" onClick={() => setShowBcc(v => !v)} className="text-xs text-purple-600">
                {showBcc ? 'Hide BCC' : 'Add BCC'}
              </button>
            </div>
          </div>

          {showCc && (
            <input
              type="text"
              value={emailData.cc}
              onChange={handleCcChange}
              placeholder="Cc: recipient@example.com"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none"
            />
          )}

          {showBcc && (
            <input
              type="text"
              value={emailData.bcc}
              onChange={handleBccChange}
              placeholder="Bcc: recipient@example.com"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none"
            />
          )}

          <input
            type="text"
            value={emailData.subject}
            onChange={handleSubjectChange}
            placeholder="Subject"
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none"
          />

          {/* Attachment Button Only */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center space-x-1 px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition text-sm"
            >
              <Paperclip className="w-4 h-4" />
              <span>Attach File</span>
            </button>
          </div>

          <textarea
            ref={contentRef}
            value={emailData.content}
            onChange={handleContentChange}
            placeholder="Write your message... (URLs like google.com will become clickable)"
            className="w-full min-h-[200px] px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none text-sm"
          />

          <AttachmentList />
          <StatusMessages />
          <input type="file" ref={fileInputRef} onChange={handleFileSelect} multiple className="hidden" />
        </div>

        <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-100 sticky bottom-0">
          <button type="button" onClick={handleDiscard} className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition">
            Discard
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 text-sm"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span>Send</span>
          </button>
        </div>
      </form>
    </div>
  );

  // ── DESKTOP ───────────────────────────────────────────────────────────────
  const desktopView = (
    <div className={`fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center ${isFullscreen ? 'p-0' : 'p-4'}`}>
      <div className={`bg-white rounded-xl shadow-2xl flex flex-col ${isFullscreen ? 'w-full h-full rounded-none' : 'w-full max-w-3xl h-[85vh]'}`}>
        <div className="flex items-center justify-between px-5 py-3 bg-purple-600 text-white rounded-t-xl">
          <div className="flex items-center space-x-2">
            <Send className="w-5 h-5" />
            <h2 className="text-base font-semibold">New Message</h2>
          </div>
          <div className="flex items-center space-x-1">
            <button type="button" onClick={() => setIsMinimized(true)} className="p-1.5 hover:bg-purple-700 rounded transition" title="Minimize">
              <Minimize2 className="w-4 h-4" />
            </button>
            <button type="button" onClick={() => setIsFullscreen(v => !v)} className="p-1.5 hover:bg-purple-700 rounded transition" title="Fullscreen">
              <Maximize2 className="w-4 h-4" />
            </button>
            <button type="button" onClick={handleDiscard} className="p-1.5 hover:bg-purple-700 rounded transition" title="Close">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            <FromDropdown isMobile={false} />

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">To</label>
              <input
                type="text"
                value={emailData.to}
                onChange={handleToChange}
                placeholder="recipient@example.com"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none text-sm"
              />
              <div className="flex items-center space-x-3 mt-1">
                <button type="button" onClick={() => setShowCc(v => !v)} className="text-xs text-purple-600 hover:text-purple-700">
                  {showCc ? 'Hide CC' : 'Add CC'}
                </button>
                <button type="button" onClick={() => setShowBcc(v => !v)} className="text-xs text-purple-600 hover:text-purple-700">
                  {showBcc ? 'Hide BCC' : 'Add BCC'}
                </button>
              </div>
            </div>

            {showCc && (
              <input
                type="text"
                value={emailData.cc}
                onChange={handleCcChange}
                placeholder="Cc: recipient@example.com"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none text-sm"
              />
            )}

            {showBcc && (
              <input
                type="text"
                value={emailData.bcc}
                onChange={handleBccChange}
                placeholder="Bcc: recipient@example.com"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none text-sm"
              />
            )}

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Subject</label>
              <input
                type="text"
                value={emailData.subject}
                onChange={handleSubjectChange}
                placeholder="Enter subject"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none text-sm"
              />
            </div>

            {/* Attachment Button Only */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center space-x-1 px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition text-sm"
              >
                <Paperclip className="w-4 h-4" />
                <span>Attach File</span>
              </button>
            </div>

            <textarea
              ref={contentRef}
              value={emailData.content}
              onChange={handleContentChange}
              placeholder="Write your message here... (URLs like google.com will become clickable)"
              className="w-full h-64 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none resize-none font-mono text-sm"
            />

            <AttachmentList />
            <StatusMessages />
            <input type="file" ref={fileInputRef} onChange={handleFileSelect} multiple className="hidden" />
          </div>

          <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-t border-gray-200 rounded-b-xl">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center space-x-1 px-3 py-1.5 text-gray-600 hover:bg-gray-200 rounded-lg transition text-sm"
            >
              <Paperclip className="w-4 h-4" />
              <span>Attach</span>
            </button>
            <div className="flex items-center space-x-2">
              <button type="button" onClick={handleDiscard} className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition">
                Discard
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center space-x-2 px-4 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 text-sm"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>Send</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <>
      <div className="md:hidden">{mobileView}</div>
      <div className="hidden md:block">{desktopView}</div>
    </>
  );
};

export default Compose;