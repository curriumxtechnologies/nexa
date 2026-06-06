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
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle,
  ChevronDown,
  Bold,
  Italic,
  Underline,
  Link as LinkIcon
} from 'lucide-react';

const Compose = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const [sendEmail, { isLoading }] = useSendEmailMutation();
  const { data: customEmailsData, refetch: refetchCustomEmails } = useGetCustomEmailsQuery();
  
  const customEmails = customEmailsData?.data?.emails || [];
  const defaultEmail = customEmails.find(e => e.isDefault) || customEmails[0];
  
  const [emailData, setEmailData] = useState({
    to: '',
    cc: '',
    bcc: '',
    subject: '',
    content: '',
    customEmailId: defaultEmail?._id || ''
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
  const subjectInputRef = useRef(null);
  const ccInputRef = useRef(null);
  const bccInputRef = useRef(null);

  const selectedEmail = customEmails.find(e => e._id === emailData.customEmailId);

  // Set default email when data loads
  useEffect(() => {
    if (defaultEmail && !emailData.customEmailId) {
      setEmailData(prev => ({ ...prev, customEmailId: defaultEmail._id }));
    }
  }, [defaultEmail, emailData.customEmailId]);

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Separate handlers for each input to prevent re-renders
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
      const newAttachments = [...prev];
      if (newAttachments[index].preview) {
        URL.revokeObjectURL(newAttachments[index].preview);
      }
      newAttachments.splice(index, 1);
      return newAttachments;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!emailData.to) {
      setError('Please enter at least one recipient');
      return;
    }

    if (!emailData.subject) {
      setError('Please enter a subject');
      return;
    }

    if (!emailData.content) {
      setError('Please enter email content');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('to', emailData.to.split(',').map(email => email.trim()));
      if (emailData.cc) formData.append('cc', emailData.cc.split(',').map(email => email.trim()));
      if (emailData.bcc) formData.append('bcc', emailData.bcc.split(',').map(email => email.trim()));
      formData.append('subject', emailData.subject);
      formData.append('html', emailData.content);
      formData.append('customEmailId', emailData.customEmailId);
      
      attachments.forEach(attachment => {
        formData.append('attachments', attachment.file);
      });

      await sendEmail(formData).unwrap();
      setSuccess('Email sent successfully!');
      
      setTimeout(() => {
        navigate('/sent');
      }, 2000);
    } catch (err) {
      setError(err.data?.message || 'Failed to send email');
    }
  };

  const handleDiscard = () => {
    if (emailData.to || emailData.subject || emailData.content || attachments.length > 0) {
      if (window.confirm('Are you sure you want to discard this email?')) {
        navigate(-1);
      }
    } else {
      navigate(-1);
    }
  };

  const selectCustomEmail = useCallback((emailId) => {
    setEmailData(prev => ({ ...prev, customEmailId: emailId }));
    setShowDropdown(false);
  }, []);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const insertText = (before, after = '') => {
    const textarea = contentRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = emailData.content.substring(start, end);
    const newText = emailData.content.substring(0, start) + before + selectedText + after + emailData.content.substring(end);
    
    setEmailData(prev => ({ ...prev, content: newText }));
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  const formatText = (type) => {
    switch(type) {
      case 'bold':
        insertText('**', '**');
        break;
      case 'italic':
        insertText('*', '*');
        break;
      case 'underline':
        insertText('<u>', '</u>');
        break;
      case 'link':
        const url = prompt('Enter URL:', 'https://');
        if (url) insertText(`<a href="${url}">`, '</a>');
        break;
      default:
        break;
    }
  };

  // MOBILE VIEW
  const MobileView = () => (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-purple-600 text-white sticky top-0 z-10">
        <div className="flex items-center space-x-2">
          <Send className="w-5 h-5" />
          <h2 className="text-base font-semibold">New Message</h2>
        </div>
        <button onClick={handleDiscard} className="p-1">
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20">
          {/* From - Custom Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <label className="text-xs font-medium text-gray-500 mb-1 block">From</label>
            <button
              type="button"
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
            >
              <div className="flex items-center space-x-2 truncate">
                {selectedEmail?.profilePicture?.url ? (
                  <img src={selectedEmail.profilePicture.url} className="w-5 h-5 rounded-full" />
                ) : (
                  <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-xs text-purple-600">
                      {(selectedEmail?.displayName?.[0] || selectedEmail?.username?.[0] || 'U').toUpperCase()}
                    </span>
                  </div>
                )}
                <span className="text-gray-700 truncate">
                  {selectedEmail?.displayName || selectedEmail?.username}
                </span>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
            </button>
            
            {showDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto">
                {customEmails.map((email) => (
                  <button
                    key={email._id}
                    type="button"
                    onClick={() => selectCustomEmail(email._id)}
                    className={`w-full flex items-center space-x-2 px-3 py-2 text-sm hover:bg-gray-50 transition ${
                      emailData.customEmailId === email._id ? 'bg-purple-50' : ''
                    }`}
                  >
                    {email.profilePicture?.url ? (
                      <img src={email.profilePicture.url} className="w-6 h-6 rounded-full" />
                    ) : (
                      <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-xs text-purple-600">
                          {(email.displayName?.[0] || email.username?.[0] || 'U').toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 text-left">
                      <p className="text-gray-800 text-xs font-medium">{email.displayName || email.username}</p>
                      <p className="text-gray-400 text-[10px]">{email.email}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* To */}
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">To</label>
            <input
              type="text"
              ref={toInputRef}
              value={emailData.to}
              onChange={handleToChange}
              placeholder="recipient@example.com"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none"
              required
            />
            <div className="flex items-center space-x-3 mt-1">
              <button type="button" onClick={() => setShowCc(!showCc)} className="text-xs text-purple-600">
                {showCc ? 'Hide CC' : 'Add CC'}
              </button>
              <button type="button" onClick={() => setShowBcc(!showBcc)} className="text-xs text-purple-600">
                {showBcc ? 'Hide BCC' : 'Add BCC'}
              </button>
            </div>
          </div>

          {showCc && (
            <input
              type="text"
              ref={ccInputRef}
              value={emailData.cc}
              onChange={handleCcChange}
              placeholder="Cc: recipient@example.com"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none"
            />
          )}

          {showBcc && (
            <input
              type="text"
              ref={bccInputRef}
              value={emailData.bcc}
              onChange={handleBccChange}
              placeholder="Bcc: recipient@example.com"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none"
            />
          )}

          {/* Subject */}
          <input
            type="text"
            ref={subjectInputRef}
            value={emailData.subject}
            onChange={handleSubjectChange}
            placeholder="Subject"
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none"
            required
          />

          {/* Toolbar */}
          <div className="flex items-center space-x-2 border border-gray-200 rounded-lg p-1 bg-gray-50">
            <button type="button" onClick={() => formatText('bold')} className="p-2 hover:bg-gray-200 rounded">
              <Bold className="w-4 h-4 text-gray-600" />
            </button>
            <button type="button" onClick={() => formatText('italic')} className="p-2 hover:bg-gray-200 rounded">
              <Italic className="w-4 h-4 text-gray-600" />
            </button>
            <button type="button" onClick={() => formatText('underline')} className="p-2 hover:bg-gray-200 rounded">
              <Underline className="w-4 h-4 text-gray-600" />
            </button>
            <div className="w-px h-5 bg-gray-300" />
            <button type="button" onClick={() => formatText('link')} className="p-2 hover:bg-gray-200 rounded">
              <LinkIcon className="w-4 h-4 text-gray-600" />
            </button>
            <button type="button" onClick={() => fileInputRef.current.click()} className="p-2 hover:bg-gray-200 rounded">
              <Paperclip className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* Content */}
          <textarea
            ref={contentRef}
            value={emailData.content}
            onChange={handleContentChange}
            placeholder="Write your message..."
            className="w-full min-h-[200px] px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none text-sm"
            required
          />

          {/* Attachments */}
          {attachments.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-500">Attachments</p>
              <div className="space-y-2">
                {attachments.map((att, index) => (
                  <div key={index} className="flex items-center space-x-2 bg-gray-50 rounded-lg p-2">
                    {att.preview ? (
                      <img src={att.preview} alt={att.name} className="w-8 h-8 rounded object-cover" />
                    ) : (
                      <Paperclip className="w-4 h-4 text-gray-400" />
                    )}
                    <div className="flex-1">
                      <p className="text-xs text-gray-700 truncate max-w-[180px]">{att.name}</p>
                      <p className="text-[10px] text-gray-400">{formatFileSize(att.size)}</p>
                    </div>
                    <button type="button" onClick={() => removeAttachment(index)} className="p-1">
                      <X className="w-3 h-3 text-gray-400" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <input type="file" ref={fileInputRef} onChange={handleFileSelect} multiple className="hidden" />

          {error && (
            <div className="flex items-center space-x-2 p-2 bg-red-50 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <p className="text-xs text-red-600">{error}</p>
            </div>
          )}

          {success && (
            <div className="flex items-center space-x-2 p-2 bg-green-50 rounded-lg">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <p className="text-xs text-green-600">{success}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-100">
          <button
            type="button"
            onClick={handleDiscard}
            className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
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

  // DESKTOP VIEW
  const DesktopView = () => (
    <div className={`fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 ${isFullscreen ? 'p-0' : ''}`}>
      <div className={`bg-white rounded-xl shadow-2xl flex flex-col ${isFullscreen ? 'w-full h-full rounded-none' : 'w-full max-w-3xl h-[85vh]'}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 bg-purple-600 text-white rounded-t-xl">
          <div className="flex items-center space-x-2">
            <Send className="w-5 h-5" />
            <h2 className="text-base font-semibold">New Message</h2>
          </div>
          <div className="flex items-center space-x-1">
            <button onClick={() => setIsMinimized(true)} className="p-1.5 hover:bg-purple-700 rounded transition" title="Minimize">
              <Minimize2 className="w-4 h-4" />
            </button>
            <button onClick={() => setIsFullscreen(!isFullscreen)} className="p-1.5 hover:bg-purple-700 rounded transition" title="Fullscreen">
              <Maximize2 className="w-4 h-4" />
            </button>
            <button onClick={handleDiscard} className="p-1.5 hover:bg-purple-700 rounded transition" title="Close">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* From - Custom Dropdown Desktop */}
            <div className="relative" ref={dropdownRef}>
              <label className="block text-xs font-medium text-gray-500 mb-1">From</label>
              <button
                type="button"
                onClick={() => setShowDropdown(!showDropdown)}
                className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg hover:border-purple-300 transition text-sm"
              >
                <div className="flex items-center space-x-2">
                  {selectedEmail?.profilePicture?.url ? (
                    <img src={selectedEmail.profilePicture.url} className="w-6 h-6 rounded-full" />
                  ) : (
                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-xs text-purple-600 font-medium">
                        {(selectedEmail?.displayName?.[0] || selectedEmail?.username?.[0] || 'U').toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="text-left">
                    <p className="text-gray-800 text-sm font-medium">{selectedEmail?.displayName || selectedEmail?.username}</p>
                    <p className="text-gray-400 text-xs">{selectedEmail?.email}</p>
                  </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {showDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
                  {customEmails.map((email) => (
                    <button
                      key={email._id}
                      type="button"
                      onClick={() => selectCustomEmail(email._id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 hover:bg-gray-50 transition text-sm ${
                        emailData.customEmailId === email._id ? 'bg-purple-50' : ''
                      }`}
                    >
                      {email.profilePicture?.url ? (
                        <img src={email.profilePicture.url} className="w-8 h-8 rounded-full" />
                      ) : (
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-sm text-purple-600 font-medium">
                            {(email.displayName?.[0] || email.username?.[0] || 'U').toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 text-left">
                        <p className="text-gray-800 font-medium">{email.displayName || email.username}</p>
                        <p className="text-gray-400 text-xs">{email.email}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* To */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">To</label>
              <input
                type="text"
                value={emailData.to}
                onChange={handleToChange}
                placeholder="recipient@example.com"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none text-sm"
                required
              />
              <div className="flex items-center space-x-3 mt-1">
                <button type="button" onClick={() => setShowCc(!showCc)} className="text-xs text-purple-600 hover:text-purple-700">
                  {showCc ? 'Hide CC' : 'Add CC'}
                </button>
                <button type="button" onClick={() => setShowBcc(!showBcc)} className="text-xs text-purple-600 hover:text-purple-700">
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

            {/* Subject */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Subject</label>
              <input
                type="text"
                value={emailData.subject}
                onChange={handleSubjectChange}
                placeholder="Enter subject"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none text-sm"
                required
              />
            </div>

            {/* Toolbar */}
            <div className="flex items-center space-x-1 border border-gray-200 rounded-lg p-1 bg-gray-50">
              <button type="button" onClick={() => formatText('bold')} className="p-1.5 hover:bg-gray-200 rounded transition" title="Bold">
                <Bold className="w-4 h-4 text-gray-600" />
              </button>
              <button type="button" onClick={() => formatText('italic')} className="p-1.5 hover:bg-gray-200 rounded transition" title="Italic">
                <Italic className="w-4 h-4 text-gray-600" />
              </button>
              <button type="button" onClick={() => formatText('underline')} className="p-1.5 hover:bg-gray-200 rounded transition" title="Underline">
                <Underline className="w-4 h-4 text-gray-600" />
              </button>
              <div className="w-px h-6 bg-gray-300 mx-1" />
              <button type="button" onClick={() => formatText('link')} className="p-1.5 hover:bg-gray-200 rounded transition" title="Insert Link">
                <LinkIcon className="w-4 h-4 text-gray-600" />
              </button>
              <button type="button" onClick={() => fileInputRef.current.click()} className="p-1.5 hover:bg-gray-200 rounded transition" title="Attach File">
                <Paperclip className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            {/* Content */}
            <textarea
              ref={contentRef}
              value={emailData.content}
              onChange={handleContentChange}
              placeholder="Write your message here..."
              className="w-full h-64 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none resize-none font-mono text-sm"
              required
            />

            {/* Attachments */}
            {attachments.length > 0 && (
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
                      <div>
                        <p className="text-xs text-gray-700 max-w-[150px] truncate">{att.name}</p>
                        <p className="text-[10px] text-gray-400">{formatFileSize(att.size)}</p>
                      </div>
                      <button type="button" onClick={() => removeAttachment(index)} className="p-1 hover:bg-gray-200 rounded">
                        <X className="w-3 h-3 text-gray-400" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <input type="file" ref={fileInputRef} onChange={handleFileSelect} multiple className="hidden" />

            {error && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {success && (
              <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <p className="text-sm text-green-600">{success}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-t border-gray-200 rounded-b-xl">
            <button
              type="button"
              onClick={() => fileInputRef.current.click()}
              className="flex items-center space-x-1 px-3 py-1.5 text-gray-600 hover:bg-gray-200 rounded-lg transition text-sm"
            >
              <Paperclip className="w-4 h-4" />
              <span>Attach</span>
            </button>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleDiscard}
                className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
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

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 w-72 z-50">
        <div className="flex items-center justify-between px-3 py-2 bg-purple-600 text-white rounded-t-lg cursor-pointer" onClick={() => setIsMinimized(false)}>
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

  return (
    <>
      {/* Hide on desktop, show on mobile */}
      <div className="md:hidden">
        <MobileView />
      </div>
      {/* Hide on mobile, show on desktop */}
      <div className="hidden md:block">
        <DesktopView />
      </div>
    </>
  );
};

export default Compose;