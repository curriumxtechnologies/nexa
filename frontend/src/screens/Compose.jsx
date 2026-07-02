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
  ChevronDown,
  CornerDownLeft,
  Tag,
  PlusCircle,
  AlertTriangle
} from 'lucide-react';

// ─── RecipientInput Component ───────────────────────────────────────────────
const RecipientInput = ({
  label,
  emails,
  inputValue,
  onInputChange,
  onKeyDown,
  onRemove,
  placeholder,
  inputRef,
  show = true,
  hint,
}) => {
  if (!show) return null;

  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</label>
      <div
        className="flex flex-wrap items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus-within:ring-2 focus-within:ring-purple-400 focus-within:border-transparent cursor-text"
        onClick={() => inputRef?.current?.focus()}
      >
        {emails.map((email, idx) => (
          <div
            key={idx}
            className="flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm"
          >
            <span className="max-w-[150px] truncate">{email}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(email);
              }}
              className="hover:bg-purple-200 dark:hover:bg-purple-800 rounded-full p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={onInputChange}
          onKeyDown={onKeyDown}
          placeholder={emails.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] bg-transparent outline-none text-sm py-1 dark:text-white"
        />
      </div>
      {hint && (
        <div className="flex items-center gap-2 mt-1 text-xs text-gray-400 dark:text-gray-500">
          <CornerDownLeft className="w-3 h-3" />
          <span>{hint}</span>
          <span className="mx-1">•</span>
          <Tag className="w-3 h-3" />
          <span>Use comma (,) to add multiple</span>
        </div>
      )}
    </div>
  );
};

// ─── No Custom Emails Warning ──────────────────────────────────────────────
const NoCustomEmailsWarning = ({ onNavigate }) => (
  <div className="p-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl text-center">
    <AlertTriangle className="w-12 h-12 text-yellow-500 dark:text-yellow-400 mx-auto mb-3" />
    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">No Email Domain Found</h3>
    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
      You need to add a custom email domain before you can send emails.
    </p>
    <button
      onClick={onNavigate}
      className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
    >
      <PlusCircle className="w-4 h-4" />
      Add Email Domain
    </button>
  </div>
);

// ─── Main Compose Component ─────────────────────────────────────────────────
const Compose = ({ 
  initialTo = '', 
  initialCc = '', 
  initialSubject = '', 
  initialContent = '', 
  isReply = false,
  onClose 
}) => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const [sendEmail, { isLoading }] = useSendEmailMutation();
  const { data: customEmailsData, isLoading: isLoadingEmails } = useGetCustomEmailsQuery();

  const customEmails = customEmailsData?.data?.emails || [];
  const defaultEmail = customEmails.find((e) => e.isDefault) || customEmails[0];

  const [toEmails, setToEmails] = useState([]);
  const [ccEmails, setCcEmails] = useState([]);
  const [bccEmails, setBccEmails] = useState([]);
  const [toInput, setToInput] = useState('');
  const [ccInput, setCcInput] = useState('');
  const [bccInput, setBccInput] = useState('');

  const [emailData, setEmailData] = useState({
    subject: '',
    content: '',
    customEmailId: '',
  });

  const [attachments, setAttachments] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);

  const fileInputRef = useRef(null);
  const contentRef = useRef(null);
  const dropdownRef = useRef(null);
  const toInputRef = useRef(null);
  const ccInputRef = useRef(null);
  const bccInputRef = useRef(null);

  const selectedEmail = customEmails.find((e) => e._id === emailData.customEmailId);

  // ── Initialize from props (for replies/forwards) ─────────────────────────
  useEffect(() => {
    if (initialTo) {
      const emails = initialTo.split(',').map(e => e.trim()).filter(Boolean);
      setToEmails(emails);
    }
    if (initialCc) {
      const emails = initialCc.split(',').map(e => e.trim()).filter(Boolean);
      setCcEmails(emails);
      if (emails.length > 0) setShowCc(true);
    }
    if (initialSubject) {
      setEmailData(prev => ({ ...prev, subject: initialSubject }));
    }
    if (initialContent) {
      setEmailData(prev => ({ ...prev, content: initialContent }));
    }
  }, [initialTo, initialCc, initialSubject, initialContent]);

  // ── Set default custom email ──────────────────────────────────────────────
  useEffect(() => {
    if (defaultEmail && !emailData.customEmailId) {
      setEmailData((prev) => ({ ...prev, customEmailId: defaultEmail._id }));
    }
  }, [defaultEmail]);

  // ── Click outside dropdown ────────────────────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const addEmail = (field, input, setInput, setEmails, focusRef) => {
    const raw = input.trim();
    if (!raw) return false;

    const parts = raw.includes(',')
      ? raw.split(',').map((e) => e.trim()).filter(Boolean)
      : [raw];

    const valid = [];
    const invalid = [];
    parts.forEach((e) => (isValidEmail(e) ? valid.push(e.toLowerCase()) : invalid.push(e)));

    if (invalid.length > 0) {
      setError(`Invalid email: ${invalid.join(', ')}`);
      setTimeout(() => setError(''), 3000);
      return false;
    }

    if (valid.length > 0) {
      setEmails((prev) => [...new Set([...prev, ...valid])]);
      setInput('');
      return true;
    }
    return false;
  };

  // ── TO handlers ────────────────────────────────────────────────────────────
  const handleToInputChange = (e) => {
    const value = e.target.value;
    setToInput(value);
    if (value.endsWith(',')) {
      const emailToAdd = value.slice(0, -1).trim();
      if (emailToAdd) addEmail('to', emailToAdd, setToInput, setToEmails, toInputRef);
      else setToInput('');
    }
  };

  const handleToKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (toInput.trim()) addEmail('to', toInput, setToInput, setToEmails, toInputRef);
    } else if (e.key === 'Tab' && toInput.trim()) {
      e.preventDefault();
      addEmail('to', toInput, setToInput, setToEmails, toInputRef);
      setTimeout(() => {
        if (showCc && ccInputRef.current) ccInputRef.current.focus();
        else if (showBcc && bccInputRef.current) bccInputRef.current.focus();
        else document.querySelector('input[placeholder="Enter subject"]')?.focus();
      }, 50);
    } else if (e.key === 'Backspace' && toInput === '' && toEmails.length > 0) {
      setToEmails((prev) => prev.slice(0, -1));
    }
  };

  const handleToRemove = (email) => {
    setToEmails((prev) => prev.filter((e) => e !== email));
  };

  // ── CC handlers ────────────────────────────────────────────────────────────
  const handleCcInputChange = (e) => {
    const value = e.target.value;
    setCcInput(value);
    if (value.endsWith(',')) {
      const emailToAdd = value.slice(0, -1).trim();
      if (emailToAdd) addEmail('cc', emailToAdd, setCcInput, setCcEmails, ccInputRef);
      else setCcInput('');
    }
  };

  const handleCcKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (ccInput.trim()) addEmail('cc', ccInput, setCcInput, setCcEmails, ccInputRef);
    } else if (e.key === 'Tab' && ccInput.trim()) {
      e.preventDefault();
      addEmail('cc', ccInput, setCcInput, setCcEmails, ccInputRef);
    } else if (e.key === 'Backspace' && ccInput === '' && ccEmails.length > 0) {
      setCcEmails((prev) => prev.slice(0, -1));
    }
  };

  const handleCcRemove = (email) => setCcEmails((prev) => prev.filter((e) => e !== email));

  // ── BCC handlers ───────────────────────────────────────────────────────────
  const handleBccInputChange = (e) => {
    const value = e.target.value;
    setBccInput(value);
    if (value.endsWith(',')) {
      const emailToAdd = value.slice(0, -1).trim();
      if (emailToAdd) addEmail('bcc', emailToAdd, setBccInput, setBccEmails, bccInputRef);
      else setBccInput('');
    }
  };

  const handleBccKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (bccInput.trim()) addEmail('bcc', bccInput, setBccInput, setBccEmails, bccInputRef);
    } else if (e.key === 'Tab' && bccInput.trim()) {
      e.preventDefault();
      addEmail('bcc', bccInput, setBccInput, setBccEmails, bccInputRef);
    } else if (e.key === 'Backspace' && bccInput === '' && bccEmails.length > 0) {
      setBccEmails((prev) => prev.slice(0, -1));
    }
  };

  const handleBccRemove = (email) => setBccEmails((prev) => prev.filter((e) => e !== email));

  const handleSubjectChange = useCallback((e) => {
    setEmailData((prev) => ({ ...prev, subject: e.target.value }));
    setError('');
  }, []);

  const handleContentChange = useCallback((e) => {
    setEmailData((prev) => ({ ...prev, content: e.target.value }));
    setError('');
  }, []);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const newAttachments = files.map((file) => ({
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
    }));
    setAttachments((prev) => [...prev, ...newAttachments]);
  };

  const removeAttachment = (index) => {
    setAttachments((prev) => {
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

    // ✅ Check if user has custom emails before sending
    if (customEmails.length === 0) {
      setError('Please add a custom email domain first. Click "Add Email Domain" below.');
      return;
    }

    if (toEmails.length === 0) return setError('Please enter at least one recipient');
    if (!emailData.subject) return setError('Please enter a subject');
    if (!emailData.content) return setError('Please enter email content');

    try {
      const formData = new FormData();
      formData.append('to', toEmails.join(','));
      if (ccEmails.length > 0) formData.append('cc', ccEmails.join(','));
      if (bccEmails.length > 0) formData.append('bcc', bccEmails.join(','));
      formData.append('subject', emailData.subject);
      formData.append('html', emailData.content);
      formData.append('customEmailId', emailData.customEmailId);
      attachments.forEach((att) => formData.append('attachments', att.file));

      await sendEmail(formData).unwrap();
      setSuccess('Email sent successfully!');
      
      if (onClose) {
        setTimeout(() => onClose(), 1500);
      } else {
        setTimeout(() => navigate('/sent'), 2000);
      }
    } catch (err) {
      setError(err.data?.message || 'Failed to send email');
    }
  };

  const handleDiscard = () => {
    if (toEmails.length > 0 || emailData.subject || emailData.content || attachments.length > 0) {
      if (window.confirm('Are you sure you want to discard this email?')) {
        if (onClose) onClose();
        else navigate(-1);
      }
    } else {
      if (onClose) onClose();
      else navigate(-1);
    }
  };

  const selectCustomEmail = (emailId) => {
    setEmailData((prev) => ({ ...prev, customEmailId: emailId }));
    setShowDropdown(false);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const navigateToDomains = () => {
    navigate('/domains');
  };

  // ── If loading ─────────────────────────────────────────────────────────────
  if (isLoadingEmails) {
    return (
      <div className="flex items-center justify-center h-full min-h-[300px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-400">Loading your email domains...</p>
        </div>
      </div>
    );
  }

  // ── If NO custom emails ──────────────────────────────────────────────────
  if (customEmails.length === 0) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px] p-6">
        <div className="max-w-md w-full">
          <NoCustomEmailsWarning onNavigate={navigateToDomains} />
        </div>
      </div>
    );
  }

  // ── Attachment List ──────────────────────────────────────────────────────
  const AttachmentList = () =>
    attachments.length > 0 ? (
      <div className="space-y-2">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Attachments ({attachments.length})</p>
        <div className="flex flex-wrap gap-2">
          {attachments.map((att, index) => (
            <div key={index} className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 rounded-lg px-2 py-1">
              {att.preview ? (
                <img src={att.preview} alt={att.name} className="w-8 h-8 object-cover rounded" />
              ) : (
                <Paperclip className="w-4 h-4 text-gray-400" />
              )}
              <div className="min-w-0">
                <p className="text-xs text-gray-700 dark:text-gray-300 max-w-[150px] truncate">{att.name}</p>
                <p className="text-[10px] text-gray-400">{formatFileSize(att.size)}</p>
              </div>
              <button
                type="button"
                onClick={() => removeAttachment(index)}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded flex-shrink-0"
              >
                <X className="w-3 h-3 text-gray-400" />
              </button>
            </div>
          ))}
        </div>
      </div>
    ) : null;

  // ── From Dropdown ──────────────────────────────────────────────────────
  const FromDropdown = ({ isMobile }) => (
    <div className="relative" ref={dropdownRef}>
      <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">From</label>
      <button
        type="button"
        onClick={() => setShowDropdown((prev) => !prev)}
        className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-purple-300 dark:hover:border-purple-700 transition text-sm"
      >
        <div className="flex items-center space-x-2 min-w-0">
          {selectedEmail?.profilePicture?.url ? (
            <img
              src={selectedEmail.profilePicture.url}
              className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} rounded-full flex-shrink-0`}
              alt=""
            />
          ) : (
            <div
              className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center flex-shrink-0`}
            >
              <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                {(selectedEmail?.displayName?.[0] || selectedEmail?.username?.[0] || 'U').toUpperCase()}
              </span>
            </div>
          )}
          <div className="text-left min-w-0">
            <p className="text-gray-800 dark:text-white text-sm font-medium truncate">
              {selectedEmail?.displayName || selectedEmail?.username}
            </p>
            {!isMobile && <p className="text-gray-400 dark:text-gray-500 text-xs truncate">{selectedEmail?.email}</p>}
          </div>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
        />
      </button>

      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-30 max-h-60 overflow-y-auto">
          {customEmails.map((email) => (
            <button
              key={email._id}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                selectCustomEmail(email._id);
              }}
              className={`w-full flex items-center space-x-3 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition text-sm ${
                emailData.customEmailId === email._id ? 'bg-purple-50 dark:bg-purple-900/20' : ''
              }`}
            >
              {email.profilePicture?.url ? (
                <img src={email.profilePicture.url} className="w-7 h-7 rounded-full flex-shrink-0" alt="" />
              ) : (
                <div className="w-7 h-7 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                    {(email.displayName?.[0] || email.username?.[0] || 'U').toUpperCase()}
                  </span>
                </div>
              )}
              <div className="flex-1 text-left min-w-0">
                <p className="text-gray-800 dark:text-white font-medium truncate">{email.displayName || email.username}</p>
                <p className="text-gray-400 dark:text-gray-500 text-xs truncate">{email.email}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 w-72 z-50">
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
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            To: {toEmails[0] || '...'}
            {toEmails.length > 1 ? ` +${toEmails.length - 1}` : ''}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">Subject: {emailData.subject || 'No subject'}</p>
        </div>
      </div>
    );
  }

  // ── Shared form fields ──────────────────────────────────────────────────
  const formFields = (isMobile) => (
    <>
      <FromDropdown isMobile={isMobile} />

      <RecipientInput
        label="To *"
        emails={toEmails}
        inputValue={toInput}
        onInputChange={handleToInputChange}
        onKeyDown={handleToKeyDown}
        onRemove={handleToRemove}
        placeholder="recipient@example.com"
        inputRef={toInputRef}
        hint="Press Enter or Tab to add email"
      />

      <div className="flex items-center space-x-3">
        <button
          type="button"
          onClick={() => setShowCc((v) => !v)}
          className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
        >
          {showCc ? 'Hide CC' : 'Add CC'}
        </button>
        <button
          type="button"
          onClick={() => setShowBcc((v) => !v)}
          className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
        >
          {showBcc ? 'Hide BCC' : 'Add BCC'}
        </button>
      </div>

      <RecipientInput
        label="Cc"
        emails={ccEmails}
        inputValue={ccInput}
        onInputChange={handleCcInputChange}
        onKeyDown={handleCcKeyDown}
        onRemove={handleCcRemove}
        placeholder="cc@example.com"
        inputRef={ccInputRef}
        show={showCc}
      />

      <RecipientInput
        label="Bcc"
        emails={bccEmails}
        inputValue={bccInput}
        onInputChange={handleBccInputChange}
        onKeyDown={handleBccKeyDown}
        onRemove={handleBccRemove}
        placeholder="bcc@example.com"
        inputRef={bccInputRef}
        show={showBcc}
      />

      <div>
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Subject</label>
        <input
          type="text"
          value={emailData.subject}
          onChange={handleSubjectChange}
          placeholder="Enter subject"
          className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none text-sm dark:text-white"
        />
      </div>

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center space-x-1 px-3 py-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition text-sm w-fit"
      >
        <Paperclip className="w-4 h-4" />
        <span>Attach Files</span>
      </button>

      <textarea
        ref={contentRef}
        value={emailData.content}
        onChange={handleContentChange}
        placeholder="Write your message here..."
        className={`w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none text-sm resize-none dark:text-white ${
          isMobile ? 'min-h-[200px]' : 'h-64'
        }`}
      />

      <AttachmentList />

      {error && (
        <div className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
      {success && (
        <div className="flex items-center space-x-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
          <p className="text-sm text-green-600 dark:text-green-400">{success}</p>
        </div>
      )}

      <input type="file" ref={fileInputRef} onChange={handleFileSelect} multiple className="hidden" />
    </>
  );

  // ── MOBILE VIEW ──────────────────────────────────────────────────────────
  const mobileView = (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 bg-purple-600 text-white sticky top-0 z-10">
        <div className="flex items-center space-x-2">
          <Send className="w-5 h-5" />
          <h2 className="text-base font-semibold">{isReply ? 'Reply' : 'New Message'}</h2>
        </div>
        <button type="button" onClick={handleDiscard} className="p-1">
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">{formFields(true)}</div>
        <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 sticky bottom-0">
          <button
            type="button"
            onClick={handleDiscard}
            className="px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
          >
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

  // ── DESKTOP VIEW ──────────────────────────────────────────────────────────
  const desktopView = (
    <div
      className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center ${
        isFullscreen ? 'p-0' : 'p-4'
      }`}
    >
      <div
        className={`bg-white dark:bg-gray-800 rounded-xl shadow-2xl flex flex-col ${
          isFullscreen ? 'w-full h-full rounded-none' : 'w-full max-w-3xl h-[85vh]'
        }`}
      >
        <div className="flex items-center justify-between px-5 py-3 bg-purple-600 text-white rounded-t-xl flex-shrink-0">
          <div className="flex items-center space-x-2">
            <Send className="w-5 h-5" />
            <h2 className="text-base font-semibold">{isReply ? 'Reply' : 'New Message'}</h2>
          </div>
          <div className="flex items-center space-x-1">
            <button
              type="button"
              onClick={() => setIsMinimized(true)}
              className="p-1.5 hover:bg-purple-700 rounded transition"
              title="Minimize"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setIsFullscreen((v) => !v)}
              className="p-1.5 hover:bg-purple-700 rounded transition"
              title="Fullscreen"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 hover:bg-purple-700 rounded transition"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {formFields(false)}
          </div>
          <div className="flex items-center justify-between px-5 py-3 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 rounded-b-xl flex-shrink-0">
            <div className="flex items-center space-x-3 text-xs text-gray-400 dark:text-gray-500">
              <div className="flex items-center gap-1">
                <CornerDownLeft className="w-3 h-3" />
                <span>Enter</span>
              </div>
              <div className="flex items-center gap-1">
                <Tag className="w-3 h-3" />
                <span>Comma (,)</span>
              </div>
              <span>to add recipients</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleDiscard}
                className="px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
              >
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