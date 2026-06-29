import React, { useState, useRef } from 'react';
import { useSendEmailMutation, useGetCustomEmailsQuery } from '../slices/emailApiSlice';
import { X, Send, Loader2, AlertCircle, CheckCircle, Paperclip } from 'lucide-react';

// ─── ReplyModal ─────────────────────────────────────────────────────────────
const ReplyModal = ({ email, onClose, onSendSuccess }) => {
  const [sendEmail, { isLoading }] = useSendEmailMutation();
  const { data: customEmailsData } = useGetCustomEmailsQuery();
  const customEmails = customEmailsData?.data?.emails || [];
  const defaultEmail = customEmails.find((e) => e.isDefault) || customEmails[0];

  const [to, setTo] = useState(email.from?.email || '');
  const [cc, setCc] = useState('');
  const [subject, setSubject] = useState(
    email.subject?.startsWith('Re:') ? email.subject : `Re: ${email.subject || '(No Subject)'}`
  );
  const [content, setContent] = useState(''); // empty – user types reply
  const [customEmailId, setCustomEmailId] = useState(defaultEmail?._id || '');
  const [attachments, setAttachments] = useState([]); // { file, name, size, preview }
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef(null);

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
    e.target.value = ''; // reset input
  };

  const removeAttachment = (index) => {
    setAttachments((prev) => {
      const updated = [...prev];
      if (updated[index].preview) URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSend = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!to) return setError('Recipient is required');
    if (!subject) return setError('Subject is required');
    if (!content) return setError('Message is required');

    try {
      const formData = new FormData();
      formData.append('to', to);
      if (cc) formData.append('cc', cc);
      formData.append('subject', subject);
      formData.append('html', content);
      formData.append('customEmailId', customEmailId);
      formData.append('replyToEmailId', email.emailId);
      attachments.forEach((att) => formData.append('attachments', att.file));

      await sendEmail(formData).unwrap();
      setSuccess('Reply sent!');
      setTimeout(() => {
        onSendSuccess?.();
        onClose();
      }, 1000);
    } catch (err) {
      setError(err.data?.message || 'Failed to send reply');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 bg-purple-600 text-white rounded-t-xl">
          <h2 className="text-base font-semibold">Reply</h2>
          <button onClick={onClose} className="hover:bg-purple-700 rounded p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSend} className="flex-1 overflow-y-auto p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">To *</label>
            <input
              type="email"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 outline-none text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Cc</label>
            <input
              type="text"
              value={cc}
              onChange={(e) => setCc(e.target.value)}
              placeholder="cc@example.com (comma separated)"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Subject *</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 outline-none text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Message *</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Type your reply here..."
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 outline-none text-sm resize-none h-48"
              required
            />
          </div>

          {/* Attachment upload */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Attachments</label>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition"
            >
              <Paperclip className="w-4 h-4" />
              Add files
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              multiple
              className="hidden"
            />
            {attachments.length > 0 && (
              <div className="mt-2 space-y-2">
                {attachments.map((att, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200">
                    {att.preview ? (
                      <img src={att.preview} alt={att.name} className="w-8 h-8 object-cover rounded" />
                    ) : (
                      <Paperclip className="w-4 h-4 text-gray-400" />
                    )}
                    <span className="text-xs flex-1 truncate">{att.name}</span>
                    <span className="text-xs text-gray-400">{formatFileSize(att.size)}</span>
                    <button
                      type="button"
                      onClick={() => removeAttachment(idx)}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      <X className="w-3 h-3 text-gray-400" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Send from</label>
            <select
              value={customEmailId}
              onChange={(e) => setCustomEmailId(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 outline-none text-sm"
            >
              {customEmails.map((ce) => (
                <option key={ce._id} value={ce._id}>
                  {ce.displayName || ce.username} &lt;{ce.email}&gt;
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
              <p className="text-sm text-green-600">{success}</p>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 text-sm"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReplyModal;