import React, { useState, useEffect } from 'react';
import { useGetEmailStatsQuery } from '../slices/adminApiSlice';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Mail, 
  Send, 
  Inbox, 
  Globe,
  Calendar,
  Download,
  RefreshCw,
  Loader2,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Activity,
  Clock,
  UserCheck,
  AtSign
} from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { toast } from 'react-hot-toast';

const AdminAnalytics = () => {
  const [dateRange, setDateRange] = useState('30');
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [chartData, setChartData] = useState([]);

  const { data, isLoading, error, refetch } = useGetEmailStatsQuery({
    startDate,
    endDate
  });

  const stats = data?.data?.summary || {};
  const userStats = data?.data?.userStats || [];
  const dailyStats = data?.data?.dailyStats || [];
  const domainStats = data?.data?.domainStats || [];

  useEffect(() => {
    if (dailyStats.length > 0) {
      setChartData(dailyStats);
    }
  }, [dailyStats]);

  const handleDateRangeChange = (range) => {
    setDateRange(range);
    const today = new Date();
    let start = subDays(today, parseInt(range));
    setStartDate(format(start, 'yyyy-MM-dd'));
    setEndDate(format(today, 'yyyy-MM-dd'));
  };

  const handleCustomDateChange = () => {
    if (startDate && endDate) {
      setDateRange('custom');
      refetch();
    }
  };

  const handleRefresh = () => {
    refetch();
    toast.success('Analytics refreshed');
  };

  const exportData = () => {
    const exportData = {
      summary: stats,
      users: userStats,
      dailyActivity: dailyStats,
      domains: domainStats,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexa-analytics-${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Data exported successfully');
  };

  const StatCard = ({ title, value, icon: Icon, color, trend, trendValue }) => (
    <div className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{value?.toLocaleString() || 0}</p>
          {trend && (
            <div className="flex items-center space-x-1 mt-2">
              {trend === 'up' ? (
                <ArrowUp className="w-3 h-3 text-green-500" />
              ) : (
                <ArrowDown className="w-3 h-3 text-red-500" />
              )}
              <span className={`text-xs ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {trendValue} from last period
              </span>
            </div>
          )}
        </div>
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-purple-600 animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center px-6">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="text-gray-700 font-medium mb-1">Failed to load analytics</p>
          <p className="text-gray-400 text-sm mb-4">{error.data?.message || 'Something went wrong'}</p>
          <button onClick={handleRefresh} className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="px-4 py-4 lg:px-8">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-purple-50 rounded-lg">
                <BarChart3 className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-800">Analytics</h1>
                <p className="text-xs text-gray-400 hidden lg:block">Track your email platform growth</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={exportData}
                className="flex items-center space-x-1.5 px-3 py-1.5 text-gray-600 border border-gray-200 text-sm rounded-lg hover:bg-gray-50 transition"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              <button
                onClick={handleRefresh}
                className="p-2 text-gray-400 hover:text-purple-600 transition rounded-lg"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4 lg:px-8 space-y-6">
        {/* Date Range Filter */}
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">Date Range:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {['7', '30', '90'].map((days) => (
                <button
                  key={days}
                  onClick={() => handleDateRangeChange(days)}
                  className={`px-3 py-1.5 text-sm rounded-lg transition ${
                    dateRange === days
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Last {days} Days
                </button>
              ))}
              <button
                onClick={() => {
                  setDateRange('month');
                  setStartDate(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
                  setEndDate(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
                }}
                className={`px-3 py-1.5 text-sm rounded-lg transition ${
                  dateRange === 'month'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                This Month
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-400 outline-none"
              />
              <span className="text-gray-400">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-400 outline-none"
              />
              <button
                onClick={handleCustomDateChange}
                className="px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition"
              >
                Apply
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={Users}
            color="bg-blue-500"
          />
          <StatCard
            title="Active Users (30d)"
            value={stats.activeUsers}
            icon={UserCheck}
            color="bg-green-500"
          />
          <StatCard
            title="Emails Sent"
            value={stats.totalEmailsSent}
            icon={Send}
            color="bg-purple-600"
          />
          <StatCard
            title="Emails Received"
            value={stats.totalEmailsReceived}
            icon={Inbox}
            color="bg-orange-500"
          />
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center space-x-2 mb-3">
              <Activity className="w-4 h-4 text-purple-600" />
              <h3 className="text-sm font-semibold text-gray-700">Total Emails</h3>
            </div>
            <p className="text-3xl font-bold text-gray-800">{stats.totalEmails?.toLocaleString() || 0}</p>
            <p className="text-xs text-gray-400 mt-1">Across all users</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center space-x-2 mb-3">
              <Globe className="w-4 h-4 text-purple-600" />
              <h3 className="text-sm font-semibold text-gray-700">Active Domains</h3>
            </div>
            <p className="text-3xl font-bold text-gray-800">{stats.domainsCount || 0}</p>
            <p className="text-xs text-gray-400 mt-1">Custom domains configured</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center space-x-2 mb-3">
              <TrendingUp className="w-4 h-4 text-purple-600" />
              <h3 className="text-sm font-semibold text-gray-700">Engagement Rate</h3>
            </div>
            <p className="text-3xl font-bold text-gray-800">
              {stats.totalEmailsSent && stats.totalUsers 
                ? Math.round((stats.totalEmailsSent / stats.totalUsers) * 100) / 100
                : 0}
            </p>
            <p className="text-xs text-gray-400 mt-1">Avg emails per user</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Daily Activity Chart */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Daily Email Activity</h3>
            <div className="space-y-3">
              {chartData.slice(0, 14).map((day) => (
                <div key={day.date}>
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span>{format(new Date(day.date), 'MMM d')}</span>
                    <div className="flex items-center space-x-3">
                      <span className="text-purple-600">Sent: {day.sent}</span>
                      <span className="text-blue-500">Rec: {day.received}</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <div 
                      className="bg-purple-600 rounded-full h-2 transition-all duration-300"
                      style={{ width: `${Math.min(100, (day.sent / Math.max(...chartData.map(d => d.sent), 1)) * 100)}%` }}
                    />
                    <div 
                      className="bg-blue-500 rounded-full h-2 transition-all duration-300"
                      style={{ width: `${Math.min(100, (day.received / Math.max(...chartData.map(d => d.received), 1)) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Domain Stats */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Domain Usage</h3>
            <div className="space-y-3">
              {domainStats.slice(0, 5).map((domain) => (
                <div key={domain.domain}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-700 truncate max-w-[150px]">{domain.domain}</span>
                    <span className="text-gray-500 text-xs">{domain.customEmailsCount} emails</span>
                  </div>
                  <div className="bg-gray-100 rounded-full h-2">
                    <div 
                      className="bg-purple-600 rounded-full h-2 transition-all duration-300"
                      style={{ width: `${Math.min(100, (domain.customEmailsCount / Math.max(...domainStats.map(d => d.customEmailsCount), 1)) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
              {domainStats.length === 0 && (
                <p className="text-center text-gray-400 text-sm py-4">No domains configured yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Top Users Table */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700">Top Active Users</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Sent</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Received</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {userStats.slice(0, 10).map((user) => (
                  <tr key={user.userId} className="hover:bg-gray-50/50 transition">
                    <td className="px-5 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{user.name || 'Unknown'}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-600">{user.sent}</td>
                    <td className="px-5 py-3 text-sm text-gray-600">{user.received}</td>
                    <td className="px-5 py-3">
                      <span className="text-sm font-semibold text-purple-600">{user.total}</span>
                    </td>
                  </tr>
                ))}
                {userStats.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-5 py-8 text-center text-gray-400 text-sm">
                      No user activity data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;