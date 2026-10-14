// src/components/EmailDetailsModal.jsx
import React from 'react';
import {
  X,
  Mail,
  User,
  Copy,
  Check,
  Calendar,
  Forward,
  FileText,
  Shield,
  Star,
  Globe,
  Hash,
  Image as ImageIcon,
} from 'lucide-react';
import { format } from 'date-fns';

const EmailDetailsModal = ({ email, isTeamEmail, onClose, onCopy, copiedId }) => {
  if (!email) return null;

  // ── Defensive defaults: never let a missing array crash the render ──
  const forwardingRules = email.forwardingRules ?? [];
  const aliases        = email.aliases        ?? [];
  const tags           = email.tags           ?? [];
  const permissions    = email.permissions    ?? [];

  const handleCopy = (value, key) => {
    if (typeof onCopy === 'function') {
      onCopy(value, key);
    } else if (navigator?.clipboard) {
      navigator.clipboard.writeText(value);
    }
  };

  const isCopied = (key) => copiedId === key;

  const Row = ({ icon: Icon, label, children }) => (
    <div className="flex items-start space-x-3 py-3 border-b border-gray-50 last:border-b-0">
      <div className="p-1.5 bg-purple-50 rounded-lg flex-shrink-0 mt-0.5">
        <Icon className="w-3.5 h-3.5 text-purple-600" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5">
          {label}
        </p>
        <div className="text-sm text-gray-800 break-words">{children}</div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-[9999] p-0 sm:p-4">
      <div className="bg-white rounded-t-xl sm:rounded-xl shadow-xl w-full max-w-md max-h-[85vh] sm:max-h-[90vh] mb-16 sm:mb-0 overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 sticky top-0 bg-white border-b border-gray-100 z-10 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-purple-50 rounded-lg">
                <Mail className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Email Details</h2>
                <p className="text-xs text-gray-400">View information about this email</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition p-1"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5">
          {/* Avatar + primary info */}
          <div className="flex flex-col items-center text-center mb-4">
            {email.profilePicture?.url ? (
              <img
                src={email.profilePicture.url}
                alt={email.displayName || email.username}
                className="w-16 h-16 rounded-full object-cover border-2 border-purple-200"
              />
            ) : (
              <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center border-2 border-purple-200">
                <User className="w-7 h-7 text-purple-600" />
              </div>
            )}
            <p className="mt-3 font-semibold text-gray-800 text-base">
              {email.displayName || email.username || 'Unnamed'}
            </p>
            <div className="flex items-center space-x-1 mt-0.5">
              <p className="text-sm text-gray-500 break-all">{email.email}</p>
              <button
                onClick={() => handleCopy(email.email, email._id)}
                className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                aria-label="Copy email"
              >
                {isCopied(email._id) ? (
                  <Check className="w-3.5 h-3.5 text-green-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            {/* Badges */}
            <div className="flex items-center flex-wrap justify-center gap-1.5 mt-2">
              {email.isDefault && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-100 text-green-700">
                  <Star className="w-3 h-3 mr-1" /> Default
                </span>
              )}
              {isTeamEmail && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-indigo-100 text-indigo-700">
                  <Shield className="w-3 h-3 mr-1" /> Team
                </span>
              )}
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-600"
                >
                  <Hash className="w-3 h-3 mr-0.5" />
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="bg-gray-50/60 rounded-xl px-3">
            <Row icon={User} label="Display Name">
              {email.displayName || <span className="text-gray-400">Not set</span>}
            </Row>

            <Row icon={Globe} label="Username">
              {email.username || <span className="text-gray-400">—</span>}
            </Row>

            <Row icon={Forward} label="Forward To">
              {email.forwardToEmail || (
                <span className="text-gray-400">Not configured</span>
              )}
            </Row>

            <Row icon={Mail} label="Domain">
              {email.domain || <span className="text-gray-400">—</span>}
            </Row>

            <Row icon={Calendar} label="Created">
              {email.createdAt ? (
                format(new Date(email.createdAt), 'MMM d, yyyy • h:mm a')
              ) : (
                <span className="text-gray-400">Unknown</span>
              )}
            </Row>

            {email.updatedAt && (
              <Row icon={Calendar} label="Last Updated">
                {format(new Date(email.updatedAt), 'MMM d, yyyy • h:mm a')}
              </Row>
            )}

            {email.signature && (
              <Row icon={FileText} label="Signature">
                <p className="whitespace-pre-wrap text-gray-700">{email.signature}</p>
              </Row>
            )}

            {email.profilePicture?.fileName && (
              <Row icon={ImageIcon} label="Profile Image">
                <p className="text-gray-700">{email.profilePicture.fileName}</p>
                {email.profilePicture.fileSize ? (
                  <p className="text-xs text-gray-400 mt-0.5">
                    {(email.profilePicture.fileSize / 1024).toFixed(1)} KB
                  </p>
                ) : null}
              </Row>
            )}
          </div>

          {/* Forwarding rules (only if present) */}
          {forwardingRules.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                Forwarding Rules
              </p>
              <div className="space-y-2">
                {forwardingRules.map((rule, idx) => (
                  <div
                    key={rule._id || idx}
                    className="bg-white border border-gray-100 rounded-lg p-3 text-sm"
                  >
                    <p className="text-gray-800">
                      {rule.pattern || rule.match || 'Rule'}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      → {rule.forwardTo || rule.destination || '—'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Aliases (only if present) */}
          {aliases.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                Aliases
              </p>
              <div className="flex flex-wrap gap-1.5">
                {aliases.map((alias, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-md"
                  >
                    {alias}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Permissions (only if present) */}
          {permissions.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                Permissions
              </p>
              <div className="space-y-1">
                {permissions.map((perm, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-xs bg-gray-50 rounded-lg px-3 py-2"
                  >
                    <span className="text-gray-600">
                      {perm.user?.email || perm.user || 'User'}
                    </span>
                    <span className="text-gray-500">
                      {perm.role || 'Viewer'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailDetailsModal;