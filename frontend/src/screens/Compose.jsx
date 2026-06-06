import React, { useState, useEffect, useRef } from 'react';
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
  User,
  AtSign,
  Tag,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Image,
  Smile
} from 'lucide-react';

const Compose = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  
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
    customEmailId: defaultEmail?._id || ''
  });
  
  const [attachments, setAttachments] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  
  const fileInputRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    if (defaultEmail && !emailData.customEmailId) {
      setEmailData(prev => ({ ...prev, customEmailId: defaultEmail._id }));
    }
  }, [defaultEmail]);

  const handleChange = (e) => {
    setEmailData({
      ...emailData,
      [e.target.name]: e.target.value
    });
    setError('');
    setSuccess('');
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const newAttachments = files.map(file => ({
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
    }));
    
    setAttachments([...attachments, ...newAttachments]);
  };

  const removeAttachment = (index) => {
    const newAttachments = [...attachments];
    if (newAttachments[index].preview) {
      URL.revokeObjectURL(newAttachments[index].preview);
    }
    newAttachments.splice(index, 1);
    setAttachments(newAttachments);
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
    
    setEmailData({ ...emailData, content: newText });
    
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

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 w-80 z-50">
        <div className="flex items-center justify-between px-4 py-3 bg-purple-600 text-white rounded-t-lg cursor-pointer" onClick={() => setIsMinimized(false)}>
          <div className="flex items-center space-x-2">
            <Send className="w-4 h-4" />
            <span className="text-sm font-medium">New Message</span>
          </div>
          <button className="text-white hover:text-gray-200">
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
        <div className="p-3">
          <p className="text-sm text-gray-500 truncate">
            To: {emailData.to || '...'} | Subject: {emailData.subject || 'No subject'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 ${isFullscreen ? 'p-0' : ''}`}>
      <div className={`bg-white rounded-lg shadow-xl flex flex-col ${isFullscreen ? 'w-full h-full rounded-none' : 'w-full max-w-4xl h-[90vh]'}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-purple-600 text-white rounded-t-lg">
          <div className="flex items-center space-x-2">
            <Send className="w-5 h-5" />
            <h2 className="text-lg font-semibold">New Message</h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsMinimized(true)}
              className="p-1 hover:bg-purple-700 rounded transition"
              title="Minimize"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1 hover:bg-purple-700 rounded transition"
              title="Fullscreen"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleDiscard}
              className="p-1 hover:bg-purple-700 rounded transition"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* From */}
            <div className="flex items-start space-x-2">
              <label className="text-sm font-medium text-gray-700 w-16 pt-2">From:</label>
              <select
                name="customEmailId"
                value={emailData.customEmailId}
                onChange={handleChange}
                className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none"
              >
                {customEmails.map(email => (
                  <option key={email._id} value={email._id}>
                    {email.displayName || email.username} &lt;{email.email}&gt;
                  </option>
                ))}
              </select>
            </div>

            {/* To */}
            <div className="flex items-start space-x-2">
              <label className="text-sm font-medium text-gray-700 w-16 pt-2">To:</label>
              <div className="flex-1">
                <input
                  type="text"
                  name="to"
                  value={emailData.to}
                  onChange={handleChange}
                  placeholder="recipient@example.com (separate multiple with commas)"
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none"
                  required
                />
                <div className="flex items-center space-x-3 mt-1">
                  <button
                    type="button"
                    onClick={() => setShowCc(!showCc)}
                    className="text-xs text-purple-600 hover:text-purple-700"
                  >
                    {showCc ? 'Hide CC' : 'Show CC'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowBcc(!showBcc)}
                    className="text-xs text-purple-600 hover:text-purple-700"
                  >
                    {showBcc ? 'Hide BCC' : 'Show BCC'}
                  </button>
                </div>
              </div>
            </div>

            {/* CC */}
            {showCc && (
              <div className="flex items-start space-x-2">
                <label className="text-sm font-medium text-gray-700 w-16 pt-2">Cc:</label>
                <input
                  type="text"
                  name="cc"
                  value={emailData.cc}
                  onChange={handleChange}
                  placeholder="cc@example.com (separate multiple with commas)"
                  className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none"
                />
              </div>
            )}

            {/* BCC */}
            {showBcc && (
              <div className="flex items-start space-x-2">
                <label className="text-sm font-medium text-gray-700 w-16 pt-2">Bcc:</label>
                <input
                  type="text"
                  name="bcc"
                  value={emailData.bcc}
                  onChange={handleChange}
                  placeholder="bcc@example.com (separate multiple with commas)"
                  className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none"
                />
              </div>
            )}

            {/* Subject */}
            <div className="flex items-start space-x-2">
              <label className="text-sm font-medium text-gray-700 w-16 pt-2">Subject:</label>
              <input
                type="text"
                name="subject"
                value={emailData.subject}
                onChange={handleChange}
                placeholder="Enter subject"
                className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none"
                required
              />
            </div>

            {/* Toolbar */}
            <div className="flex items-center space-x-1 border border-gray-200 rounded-lg p-1 bg-gray-50">
              <button
                type="button"
                onClick={() => formatText('bold')}
                className="p-1.5 hover:bg-gray-200 rounded transition"
                title="Bold"
              >
                <Bold className="w-4 h-4 text-gray-600" />
              </button>
              <button
                type="button"
                onClick={() => formatText('italic')}
                className="p-1.5 hover:bg-gray-200 rounded transition"
                title="Italic"
              >
                <Italic className="w-4 h-4 text-gray-600" />
              </button>
              <button
                type="button"
                onClick={() => formatText('underline')}
                className="p-1.5 hover:bg-gray-200 rounded transition"
                title="Underline"
              >
                <Underline className="w-4 h-4 text-gray-600" />
              </button>
              <div className="w-px h-6 bg-gray-300 mx-1" />
              <button
                type="button"
                onClick={() => formatText('link')}
                className="p-1.5 hover:bg-gray-200 rounded transition"
                title="Insert Link"
              >
                <LinkIcon className="w-4 h-4 text-gray-600" />
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="p-1.5 hover:bg-gray-200 rounded transition"
                title="Attach File"
              >
                <Paperclip className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            {/* Content */}
            <textarea
              ref={contentRef}
              name="content"
              value={emailData.content}
              onChange={handleChange}
              placeholder="Write your message here..."
              className="w-full flex-1 min-h-[300px] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none resize-none font-mono text-sm"
              required
            />

            {/* Attachments */}
            {attachments.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Attachments:</p>
                <div className="flex flex-wrap gap-2">
                  {attachments.map((att, index) => (
                    <div key={index} className="flex items-center space-x-2 bg-gray-100 rounded-lg px-2 py-1">
                      {att.preview ? (
                        <img src={att.preview} alt={att.name} className="w-8 h-8 object-cover rounded" />
                      ) : (
                        <Paperclip className="w-4 h-4 text-gray-500" />
                      )}
                      <div className="text-sm">
                        <p className="text-gray-700 max-w-[200px] truncate">{att.name}</p>
                        <p className="text-xs text-gray-400">{formatFileSize(att.size)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAttachment(index)}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        <X className="w-3 h-3 text-gray-500" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              multiple
              className="hidden"
            />

            {/* Error/Success Messages */}
            {error && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {success && (
              <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <p className="text-sm text-green-600">{success}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="flex items-center space-x-1 px-3 py-1.5 text-gray-600 hover:bg-gray-200 rounded-lg transition"
              >
                <Paperclip className="w-4 h-4" />
                <span className="text-sm">Attach</span>
              </button>
              <button
                type="button"
                onClick={handleDiscard}
                className="flex items-center space-x-1 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                <Trash2 className="w-4 h-4" />
                <span className="text-sm">Discard</span>
              </button>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center space-x-2 px-4 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span>Send</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Compose;