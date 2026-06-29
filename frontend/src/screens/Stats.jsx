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
  AlertCircle,
  TrendingUp,
  PieChart,
  Activity
} from 'lucide-react';

const Stats = () => {
  const { data, isLoading, error, refetch } = useGetEmailStatsQuery();

  // ✅ Safe extraction – even if data.data is empty, all fields get defaults
  const stats = {
    totalSent: data?.data?.totalSent ?? 0,
    totalReceived: data?.data?.totalReceived ?? 0,
    unread: data?.data?.unread ?? 0,
    starred: data?.data?.starred ?? 0,
    customEmailsCount: data?.data?.customEmailsCount ?? 0,
    domainsCount: data?.data?.domainsCount ?? 0,
  };

  const totalEmails = stats.totalSent + stats.totalReceived;
  const readRate = stats.totalReceived > 0 
    ? Math.round(((stats.totalReceived - stats.unread) / stats.totalReceived) * 100)
    : 0;

  const statCards = [
    {
      title: 'Total Sent',
      value: stats.totalSent,
      icon: Send,
      color: 'blue',
      description: 'Emails you have sent'
    },
    {
      title: 'Total Received',
      value: stats.totalReceived,
      icon: Inbox,
      color: 'green',
      description: 'Emails you have received'
    },
    {
      title: 'Unread',
      value: stats.unread,
      icon: Mail,
      color: 'purple',
      description: 'Emails waiting to be read'
    },
    {
      title: 'Starred',
      value: stats.starred,
      icon: Star,
      color: 'yellow',
      description: 'Important emails saved'
    },
    {
      title: 'Custom Emails',
      value: stats.customEmailsCount,
      icon: Users,
      color: 'indigo',
      description: 'Email addresses created'
    },
    {
      title: 'Domains',
      value: stats.domainsCount,
      icon: Globe,
      color: 'teal',
      description: 'Verified domains'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: { bg: 'bg-blue-50', text: 'text-blue-600', iconBg: 'bg-blue-100', border: 'border-blue-100' },
      green: { bg: 'bg-green-50', text: 'text-green-600', iconBg: 'bg-green-100', border: 'border-green-100' },
      purple: { bg: 'bg-purple-50', text: 'text-purple-600', iconBg: 'bg-purple-100', border: 'border-purple-100' },
      yellow: { bg: 'bg-yellow-50', text: 'text-yellow-600', iconBg: 'bg-yellow-100', border: 'border-yellow-100' },
      indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', iconBg: 'bg-indigo-100', border: 'border-indigo-100' },
      teal: { bg: 'bg-teal-50', text: 'text-teal-600', iconBg: 'bg-teal-100', border: 'border-teal-100' }
    };
    return colors[color] || colors.blue;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-purple-600 animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-400">Loading statistics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center px-6">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="text-gray-700 font-medium mb-1">Failed to load statistics</p>
          <p className="text-gray-400 text-sm mb-4">{error.data?.message || 'Please try again'}</p>
          <button onClick={() => refetch()} className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg">
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ─── Mobile View ────────────────────────────────────────────────────────────────
  const MobileView = () => (
    <div className="md:hidden bg-gray-50 min-h-screen pb-20">
      <div className="bg-white border-b border-gray-100 px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center space-x-2">
          <BarChart3 className="w-5 h-5 text-purple-600" />
          <h1 className="text-base font-semibold text-gray-800">Statistics</h1>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3">
          {statCards.map((card, index) => {
            const Icon = card.icon;
            const colors = getColorClasses(card.color);
            return (
              <div key={index} className="bg-white rounded-xl border border-gray-100 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-8 h-8 ${colors.iconBg} rounded-lg flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 ${colors.text}`} />
                  </div>
                  <TrendingUp className="w-3 h-3 text-gray-300" />
                </div>
                <p className="text-2xl font-bold text-gray-800">{card.value.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">{card.title}</p>
              </div>
            );
          })}
        </div>

        {/* Summary Section */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
            <div className="flex items-center space-x-2">
              <PieChart className="w-4 h-4 text-purple-600" />
              <h2 className="text-sm font-semibold text-gray-800">Summary</h2>
            </div>
          </div>
          <div className="divide-y divide-gray-50">
            <div className="p-4 flex items-center justify-between">
              <span className="text-sm text-gray-500">Total Emails</span>
              <span className="text-sm font-semibold text-gray-800">{totalEmails.toLocaleString()}</span>
            </div>
            <div className="p-4 flex items-center justify-between">
              <span className="text-sm text-gray-500">Sent vs Received</span>
              <span className="text-sm font-semibold text-gray-800">{stats.totalSent}:{stats.totalReceived}</span>
            </div>
            <div className="p-4 flex items-center justify-between">
              <span className="text-sm text-gray-500">Read Rate</span>
              <div className="flex items-center space-x-2">
                <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${readRate > 50 ? 'bg-green-500' : 'bg-yellow-500'}`} style={{ width: `${readRate}%` }} />
                </div>
                <span className="text-sm font-semibold text-gray-800">{readRate}%</span>
              </div>
            </div>
            <div className="p-4 flex items-center justify-between">
              <span className="text-sm text-gray-500">Active Domains</span>
              <span className="text-sm font-semibold text-gray-800">{stats.domainsCount}</span>
            </div>
            <div className="p-4 flex items-center justify-between">
              <span className="text-sm text-gray-500">Custom Emails</span>
              <span className="text-sm font-semibold text-gray-800">{stats.customEmailsCount}</span>
            </div>
            <div className="p-4 flex items-center justify-between">
              <span className="text-sm text-gray-500">Starred Emails</span>
              <span className="text-sm font-semibold text-gray-800">{stats.starred}</span>
            </div>
          </div>
        </div>

        {/* Note */}
        <div className="bg-yellow-50 rounded-xl border border-yellow-100 p-3">
          <p className="text-xs text-yellow-700">More detailed statistics (charts, email trends, domain analytics) will be available in a future update.</p>
        </div>
      </div>
    </div>
  );

  // ─── Desktop View ────────────────────────────────────────────────────────────────
  const DesktopView = () => (
    <div className="hidden md:block min-h-screen bg-gray-50">
      <div className="px-6 py-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-purple-50 rounded-lg">
                <BarChart3 className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-800">Statistics</h1>
                <p className="text-xs text-gray-400">Overview of your email activity</p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-5 mb-8">
            {statCards.map((card, index) => {
              const Icon = card.icon;
              const colors = getColorClasses(card.color);
              return (
                <div key={index} className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-sm transition">
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-10 h-10 ${colors.iconBg} rounded-xl flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 ${colors.text}`} />
                      </div>
                      <Activity className="w-4 h-4 text-gray-300" />
                    </div>
                    <p className="text-3xl font-bold text-gray-800">{card.value.toLocaleString()}</p>
                    <p className="text-sm text-gray-500 mt-1">{card.title}</p>
                    <p className="text-xs text-gray-400 mt-2">{card.description}</p>
                  </div>
                  <div className={`px-5 py-2 ${colors.bg} border-t ${colors.border}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Total</span>
                      <span className={`text-xs font-medium ${colors.text}`}>{card.value.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-2 gap-6">
            {/* Summary Section */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
                <div className="flex items-center space-x-2">
                  <PieChart className="w-4 h-4 text-purple-600" />
                  <h2 className="text-sm font-semibold text-gray-800">Summary</h2>
                </div>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Total Emails</span>
                  <span className="text-sm font-semibold text-gray-800">{totalEmails.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Sent vs Received Ratio</span>
                  <span className="text-sm font-semibold text-gray-800">{stats.totalSent}:{stats.totalReceived}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Read Rate</span>
                  <div className="flex items-center space-x-3">
                    <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${readRate > 50 ? 'bg-green-500' : 'bg-yellow-500'}`} style={{ width: `${readRate}%` }} />
                    </div>
                    <span className="text-sm font-semibold text-gray-800">{readRate}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Active Domains</span>
                  <span className="text-sm font-semibold text-gray-800">{stats.domainsCount}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Custom Email Addresses</span>
                  <span className="text-sm font-semibold text-gray-800">{stats.customEmailsCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Starred Emails</span>
                  <span className="text-sm font-semibold text-gray-800">{stats.starred}</span>
                </div>
              </div>
            </div>

            {/* Quick Insights */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                  <h2 className="text-sm font-semibold text-gray-800">Quick Insights</h2>
                </div>
              </div>
              <div className="p-5 space-y-4">
                <div className="p-4 bg-gradient-to-r from-purple-50 to-white rounded-lg">
                  <p className="text-xs text-purple-600 font-medium mb-1">Email Activity</p>
                  <p className="text-lg font-bold text-gray-800">{totalEmails.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">Total emails processed</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <Send className="w-4 h-4 text-blue-500 mb-2" />
                    <p className="text-lg font-bold text-gray-800">{stats.totalSent.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Sent</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <Inbox className="w-4 h-4 text-green-500 mb-2" />
                    <p className="text-lg font-bold text-gray-800">{stats.totalReceived.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Received</p>
                  </div>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-yellow-600 font-medium">Unread emails</p>
                      <p className="text-2xl font-bold text-gray-800">{stats.unread}</p>
                    </div>
                    <Mail className="w-6 h-6 text-yellow-400" />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Waiting for your attention</p>
                </div>
              </div>
            </div>
          </div>

          {/* Note */}
          <div className="mt-6 p-4 bg-yellow-50 rounded-xl border border-yellow-100">
            <p className="text-sm text-yellow-700">More detailed statistics (charts, email trends, domain analytics) will be available in a future update.</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <MobileView />
      <DesktopView />
    </>
  );
};

export default Stats;