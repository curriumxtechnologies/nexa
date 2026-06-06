import React from 'react';
import { useGetEmailStatsQuery } from '../slices/emailApiSlice';
import { 
  BarChart3, 
  Mail, 
  Send, 
  Inbox, 
  Star, 
  Users, 
  Globe,
  Loader2,
  AlertCircle
} from 'lucide-react';

const Stats = () => {
  const { data, isLoading, error, refetch } = useGetEmailStatsQuery();

  const stats = data?.data || {
    totalSent: 0,
    totalReceived: 0,
    unread: 0,
    starred: 0,
    customEmailsCount: 0,
    domainsCount: 0
  };

  const statCards = [
    {
      title: 'Total Sent',
      value: stats.totalSent,
      icon: Send,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Total Received',
      value: stats.totalReceived,
      icon: Inbox,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Unread',
      value: stats.unread,
      icon: Mail,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Starred',
      value: stats.starred,
      icon: Star,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'Custom Emails',
      value: stats.customEmailsCount,
      icon: Users,
      color: 'bg-indigo-500',
      textColor: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    },
    {
      title: 'Domains',
      value: stats.domainsCount,
      icon: Globe,
      color: 'bg-teal-500',
      textColor: 'text-teal-600',
      bgColor: 'bg-teal-50'
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading statistics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-500 mb-2">Failed to load statistics</p>
          <p className="text-gray-500 text-sm">{error.data?.message || 'Please try again'}</p>
          <button 
            onClick={() => refetch()}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-4 lg:px-6">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-6 h-6 text-purple-600" />
            <h1 className="text-xl font-semibold text-gray-800">Statistics</h1>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="px-4 py-6 lg:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {statCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 ${card.bgColor} rounded-full`}>
                      <Icon className={`w-6 h-6 ${card.textColor}`} />
                    </div>
                    <div className={`w-2 h-2 ${card.color} rounded-full`} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">{card.title}</p>
                    <p className="text-3xl font-bold text-gray-800">{card.value.toLocaleString()}</p>
                  </div>
                </div>
                <div className={`px-6 py-3 ${card.bgColor} border-t border-gray-100`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Total</span>
                    <span className={`text-xs font-medium ${card.textColor}`}>
                      {card.value} {card.title.toLowerCase()}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary Section */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Summary</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <span className="text-gray-600">Total Emails</span>
                  <span className="font-semibold text-gray-800">
                    {(stats.totalSent + stats.totalReceived).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <span className="text-gray-600">Sent vs Received Ratio</span>
                  <span className="font-semibold text-gray-800">
                    {stats.totalSent}:{stats.totalReceived}
                  </span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <span className="text-gray-600">Read Rate</span>
                  <span className="font-semibold text-gray-800">
                    {stats.totalReceived > 0 
                      ? `${Math.round(((stats.totalReceived - stats.unread) / stats.totalReceived) * 100)}%`
                      : '0%'}
                  </span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <span className="text-gray-600">Active Domains</span>
                  <span className="font-semibold text-gray-800">{stats.domainsCount}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <span className="text-gray-600">Custom Email Addresses</span>
                  <span className="font-semibold text-gray-800">{stats.customEmailsCount}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <span className="text-gray-600">Starred Emails</span>
                  <span className="font-semibold text-gray-800">{stats.starred}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Note about missing features */}
        <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-sm text-yellow-700">
            <strong>Note:</strong> More detailed statistics (charts, email trends, domain analytics) will be available in a future update.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Stats;