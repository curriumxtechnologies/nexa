import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetEmailByIdQuery, useDeleteEmailMutation, useMarkAsReadMutation, useToggleStarMutation, useToggleArchiveMutation } from '../slices/emailApiSlice';
import { useGetSettingsQuery } from '../slices/settingsApiSlice';
import { 
  ArrowLeft, 
  Star, 
  Archive, 
  Trash2, 
  Reply, 
  ReplyAll, 
  Forward,
  Download,
  User,
  Clock,
  Mail,
  Paperclip,
  Loader2,
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Printer,
  ExternalLink,
  X,
  Send,
} from 'lucide-react';
import { format } from 'date-fns';

const EmailDetails = () => {
  const { emailId } = useParams();
  const navigate = useNavigate();
  
  const { data: emailData, isLoading, error, refetch } = useGetEmailByIdQuery(emailId);
  const [deleteEmail] = useDeleteEmailMutation();
  const [markAsRead] = useMarkAsReadMutation();
  const [toggleStar] = useToggleStarMutation();
  const [toggleArchive] = useToggleArchiveMutation();
  const { data: settingsData } = useGetSettingsQuery();
  
  const [showFullHeaders, setShowFullHeaders] = useState(false);
  const [replyMode, setReplyMode] = useState(null); // 'reply', 'replyAll', 'forward'
  const [replyContent, setReplyContent] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);
  
  const email = emailData?.data;
  const settings = settingsData?.data;
  const emailSignature = settings?.email?.signature || '';

  useEffect(() => {
    if (email && !email.isRead && email.direction === 'received') {
      markAsRead(email.emailId).unwrap();
    }
  }, [email, markAsRead]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this email?')) {
      await deleteEmail(emailId).unwrap();
      navigate(-1);
    }
  };

  const handleStar = async () => {
    await toggleStar(emailId).unwrap();
    refetch();
  };

  const handleArchive = async () => {
    await toggleArchive(emailId).unwrap();
    navigate(-1);
  };

  const handleReply = () => {
    if (!email) return;
    
    const replySubject = email.subject.startsWith('Re:') 
      ? email.subject 
      : `Re: ${email.subject}`;
    
    const replyBody = `\n\n\nOn ${format(new Date(email.receivedAt || email.createdAt), 'MMM d, yyyy \'at\' h:mm a')}, ${email.from.email} wrote:\n> ${email.content.replace(/\n/g, '\n> ')}`;
    
    setReplyContent(replyBody);
    setReplyMode('reply');
  };

  const handleReplyAll = () => {
    if (!email) return;
    
    const allRecipients = [email.from.email, ...(email.to?.map(t => t.email) || [])];
    const uniqueRecipients = [...new Set(allRecipients)];
    
    const replySubject = email.subject.startsWith('Re:') 
      ? email.subject 
      : `Re: ${email.subject}`;
    
    const replyBody = `\n\n\nOn ${format(new Date(email.receivedAt || email.createdAt), 'MMM d, yyyy \'at\' h:mm a')}, ${email.from.email} wrote:\n> ${email.content.replace(/\n/g, '\n> ')}`;
    
    setReplyContent(replyBody);
    setReplyMode('replyAll');
  };

  const handleForward = () => {
    if (!email) return;
    
    const forwardSubject = email.subject.startsWith('Fwd:') 
      ? email.subject 
      : `Fwd: ${email.subject}`;
    
    const forwardBody = `\n\n\n---------- Forwarded message ----------\nFrom: ${email.from.email}\nDate: ${format(new Date(email.receivedAt || email.createdAt), 'MMM d, yyyy \'at\' h:mm a')}\nSubject: ${email.subject}\n\n${email.content}`;
    
    setReplyContent(forwardBody);
    setReplyMode('forward');
  };

  const handleSendReply = async () => {
    setIsSendingReply(true);
    // TODO: Implement reply sending
    console.log('Sending reply:', { replyMode, content: replyContent });
    setTimeout(() => {
      setIsSendingReply(false);
      setReplyMode(null);
      setReplyContent('');
    }, 1000);
  };

  const handleDownloadAttachment = (attachment) => {
    window.open(attachment.url, '_blank');
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return format(new Date(date), 'MMM d, yyyy \'at\' h:mm a');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading email...</p>
        </div>
      </div>
    );
  }

  if (error || !email) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-500 mb-2">Failed to load email</p>
          <p className="text-gray-500 text-sm">{error?.data?.message || 'Email not found'}</p>
          <button 
            onClick={() => navigate('/inbox')}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Back to Inbox
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-3 lg:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={handleBack}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <h1 className="text-lg font-semibold text-gray-800 truncate max-w-md">
                {email.subject || '(No Subject)'}
              </h1>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={handleStar}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition"
                title={email.isStarred ? 'Unstar' : 'Star'}
              >
                <Star className={`w-5 h-5 ${email.isStarred ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
              </button>
              <button
                onClick={handleArchive}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition"
                title="Archive"
              >
                <Archive className="w-5 h-5 text-gray-400" />
              </button>
              <button
                onClick={handleDelete}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition"
                title="Delete"
              >
                <Trash2 className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Email Content */}
      <div className="px-4 py-6 lg:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Email Header */}
            <div className="p-6 border-b border-gray-200">
              <h1 className="text-2xl font-bold text-gray-800 mb-4">
                {email.subject || '(No Subject)'}
              </h1>
              
              <div className="space-y-2">
                <div className="flex items-start space-x-2">
                  <div className="w-24 text-sm text-gray-500">From:</div>
                  <div className="flex-1">
                    <span className="text-sm text-gray-800 font-medium">{email.from.name || email.from.email}</span>
                    {email.from.name && (
                      <span className="text-sm text-gray-500 ml-1">&lt;{email.from.email}&gt;</span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <div className="w-24 text-sm text-gray-500">To:</div>
                  <div className="flex-1">
                    {email.to?.map((recipient, index) => (
                      <span key={index} className="text-sm text-gray-700">
                        {recipient.email}{index < email.to.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </div>
                </div>
                
                {email.cc && email.cc.length > 0 && (
                  <div className="flex items-start space-x-2">
                    <div className="w-24 text-sm text-gray-500">Cc:</div>
                    <div className="flex-1">
                      {email.cc.map((recipient, index) => (
                        <span key={index} className="text-sm text-gray-700">
                          {recipient.email}{index < email.cc.length - 1 ? ', ' : ''}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex items-start space-x-2">
                  <div className="w-24 text-sm text-gray-500">Date:</div>
                  <div className="flex-1">
                    <span className="text-sm text-gray-700">
                      {formatDate(email.receivedAt || email.sentAt || email.createdAt)}
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={() => setShowFullHeaders(!showFullHeaders)}
                  className="text-xs text-purple-600 hover:text-purple-700 mt-2"
                >
                  {showFullHeaders ? 'Hide' : 'Show'} full headers
                </button>
                
                {showFullHeaders && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg text-xs font-mono">
                    <div><strong>Message ID:</strong> {email.emailId}</div>
                    <div><strong>Direction:</strong> {email.direction}</div>
                    <div><strong>Status:</strong> {email.status}</div>
                    {email.replyToEmailId && (
                      <div><strong>In Reply To:</strong> {email.replyToEmailId}</div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {/* Email Body */}
            <div className="p-6 border-b border-gray-200">
              <div 
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: email.content }}
              />
            </div>
            
            {/* Attachments */}
            {email.attachments && email.attachments.length > 0 && (
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center space-x-2 mb-3">
                  <Paperclip className="w-4 h-4 text-gray-400" />
                  <h3 className="text-sm font-medium text-gray-700">Attachments</h3>
                </div>
                <div className="flex flex-wrap gap-3">
                  {email.attachments.map((attachment, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                      onClick={() => handleDownloadAttachment(attachment)}
                    >
                      <div className="w-10 h-10 bg-purple-100 rounded flex items-center justify-center">
                        <Paperclip className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">{attachment.filename}</p>
                        <p className="text-xs text-gray-400">
                          {Math.round(attachment.fileSize / 1024)} KB
                        </p>
                      </div>
                      <Download className="w-4 h-4 text-gray-400 ml-2" />
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="p-6 bg-gray-50">
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleReply}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                >
                  <Reply className="w-4 h-4" />
                  <span>Reply</span>
                </button>
                <button
                  onClick={handleReplyAll}
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition"
                >
                  <ReplyAll className="w-4 h-4" />
                  <span>Reply All</span>
                </button>
                <button
                  onClick={handleForward}
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition"
                >
                  <Forward className="w-4 h-4" />
                  <span>Forward</span>
                </button>
              </div>
            </div>
            
            {/* Reply Editor */}
            {replyMode && (
              <div className="p-6 border-t border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-700">
                    {replyMode === 'reply' && 'Reply'}
                    {replyMode === 'replyAll' && 'Reply All'}
                    {replyMode === 'forward' && 'Forward'}
                  </h3>
                  <button
                    onClick={() => setReplyMode(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  rows="8"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none font-mono text-sm"
                  placeholder="Type your reply here..."
                />
                <div className="flex items-center justify-between mt-3">
                  <div className="text-xs text-gray-500">
                    {emailSignature && (
                      <div className="mt-2 text-gray-400">
                        {emailSignature.split('\n').map((line, i) => (
                          <div key={i}>{line}</div>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleSendReply}
                    disabled={isSendingReply}
                    className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
                  >
                    {isSendingReply ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    <span>Send</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailDetails;