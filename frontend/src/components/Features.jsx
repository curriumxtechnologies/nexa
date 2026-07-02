// components/Features.jsx
import React, { useState } from 'react';
import { 
  Globe, 
  Users, 
  Shield, 
  Zap, 
  MessageCircle, 
  Award, 
  Rocket, 
  Mail, 
  Clock, 
  Smartphone,
  Link,
  Key,
  CheckCircle,
  ArrowRight,
  Settings,
  Webhook,
  Database,
  Copy,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Layout,
  MoveRight,
  Circle,
  TrendingUp,
  Cloud,
  Lock,
  Send,
  Inbox,
  ArrowUpRight,
  Play,
  Star,
  BarChart3,
  Timer,
  Zap as ZapIcon,
  Layers,
  ShieldCheck,
  Gauge,
  Users2,
  FileText,
  AlarmClock,
  Palette,
  Laptop,
  Phone,
  Tablet
} from 'lucide-react';

const Features = () => {
  const [expandedStep, setExpandedStep] = useState(null);
  const [activeTab, setActiveTab] = useState('steps');

  const steps = [
    {
      icon: Globe,
      title: 'Add Domain to Resend',
      description: 'Verify your domain in minutes',
      detail: 'Log in to Resend, navigate to Domains, click "Add Domain", enter your domain name, and follow the DNS verification instructions.',
      color: 'from-purple-500 to-purple-600',
      tag: '5 min setup',
      step: '01'
    },
    {
      icon: Key,
      title: 'Get Resend API Key',
      description: 'Generate your API credentials',
      detail: 'In your Resend dashboard, go to API Keys, create a new key with the necessary permissions.',
      color: 'from-blue-500 to-blue-600',
      tag: 'API access',
      step: '02'
    },
    {
      icon: Link,
      title: 'Connect to Nexa',
      description: 'Paste your API key',
      detail: 'In Nexa dashboard, navigate to Settings → Email Provider, paste your Resend API key, and click Connect.',
      color: 'from-green-500 to-green-600',
      tag: '1-click connect',
      step: '03'
    },
    {
      icon: Webhook,
      title: 'Configure Webhook',
      description: 'Start receiving emails',
      detail: 'Copy your webhook URL from Nexa, create a new webhook in Resend, then paste the signing secret back in Nexa.',
      color: 'from-orange-500 to-orange-600',
      tag: 'Receive emails',
      step: '04'
    }
  ];

  const features = [
    {
      icon: Send,
      title: 'Send & Receive',
      description: 'Full email functionality with your custom domain',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Invite team members and manage together',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Shield,
      title: 'Bank-grade Security',
      description: 'End-to-end encryption for all your emails',
      gradient: 'from-emerald-500 to-teal-500'
    },
    {
      icon: Zap,
      title: 'Instant Delivery',
      description: 'Powered by Resend\'s world-class infrastructure',
      gradient: 'from-yellow-500 to-orange-500'
    },
    {
      icon: Database,
      title: 'Smart Storage',
      description: 'All emails organized and searchable',
      gradient: 'from-indigo-500 to-purple-500'
    },
    {
      icon: Smartphone,
      title: 'Mobile Ready',
      description: 'Access your email from anywhere',
      gradient: 'from-pink-500 to-rose-500'
    }
  ];

  const toggleStep = (index) => {
    setExpandedStep(expandedStep === index ? null : index);
  };

  return (
    <section id="features" className="py-16 sm:py-20 lg:py-24 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full px-4 py-1.5 mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span className="text-purple-700 dark:text-purple-300 text-xs font-medium">Simple Setup Process</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
            Start in{' '}
            <span className="bg-gradient-to-r from-purple-600 via-purple-500 to-purple-400 bg-clip-text text-transparent">
              4 Easy Steps
            </span>
          </h2>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Connect your domain with Resend and Nexa for professional email management
          </p>
        </div>

        {/* Visual Steps Flow - Modern */}
        <div className="relative hidden lg:block mb-20">
          <div className="flex items-start justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isLast = index === steps.length - 1;
              return (
                <div key={index} className="flex-1 relative">
                  {/* Connector line */}
                  {!isLast && (
                    <div className="absolute top-10 left-[60%] right-0 h-0.5 bg-gradient-to-r from-purple-300 to-purple-200 dark:from-purple-700 dark:to-purple-800">
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-purple-400 dark:bg-purple-600 rounded-full"></div>
                    </div>
                  )}
                  
                  <div className="text-center">
                    {/* Icon with pulse */}
                    <div className="relative inline-block">
                      <div className={`w-20 h-20 bg-gradient-to-r ${step.color} rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-purple-500/20 relative z-10 transition-transform hover:scale-105 duration-300`}>
                        <Icon className="w-10 h-10 text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-md border-2 border-gray-100 dark:border-gray-700">
                        <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400">{index + 1}</span>
                      </div>
                    </div>
                    
                    <h3 className="text-base font-bold text-gray-900 dark:text-white mt-4">{step.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{step.description}</p>
                    <span className="inline-block mt-2 text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 px-3 py-0.5 rounded-full">
                      {step.tag}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile/Tablet Accordion */}
        <div className="lg:hidden space-y-3 mb-12">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isExpanded = expandedStep === index;
            
            return (
              <div 
                key={index}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl transition-all duration-300 overflow-hidden shadow-sm hover:shadow-md"
              >
                <button
                  onClick={() => toggleStep(index)}
                  className="w-full text-left p-4 flex items-center gap-4"
                >
                  <div className={`w-12 h-12 bg-gradient-to-r ${step.color} rounded-xl flex items-center justify-center flex-shrink-0 shadow-md shadow-purple-500/20`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400">Step {index + 1}</span>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{step.title}</h3>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{step.description}</p>
                  </div>
                  <div className="flex-shrink-0">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4">
                    <div className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
                      {step.detail}
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs text-purple-600 dark:text-purple-400 font-medium bg-purple-100 dark:bg-purple-900/30 px-2 py-0.5 rounded-full">
                        {step.tag}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Features Grid - Modern with Icons */}
        <div className="mb-16">
          <div className="text-center mb-10">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">Everything You Need</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Enterprise-grade features with a beautiful interface</p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index} 
                  className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className={`w-12 h-12 bg-gradient-to-r ${feature.gradient} rounded-xl flex items-center justify-center mb-3 shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{feature.title}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Visual Stats / Trust Section */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-16">
          {[
            { icon: Timer, label: '5 Min Setup', value: 'Quick' },
            { icon: ShieldCheck, label: '99.9% Uptime', value: 'Reliable' },
            { icon: Users2, label: 'Team Ready', value: 'Collaborate' },
            { icon: ZapIcon, label: 'Instant Delivery', value: 'Fast' }
          ].map((stat, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-center hover:shadow-lg transition-all">
              <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mx-auto mb-2">
                <stat.icon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <p className="text-xs font-semibold text-gray-900 dark:text-white">{stat.value}</p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Webhook Visual Flow */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 sm:p-8 mb-16 shadow-sm">
          <div className="flex flex-col lg:flex-row items-center gap-6">
            <div className="flex-1">
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Webhook Configuration</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Connect Nexa with Resend in 4 simple steps</p>
              
              <div className="flex flex-wrap items-center gap-2">
                {['Copy URL', '→', 'Paste in Resend', '→', 'Copy Secret', '→', 'Paste in Nexa'].map((item, idx) => (
                  <span 
                    key={idx}
                    className={`text-xs px-3 py-1.5 rounded-lg ${
                      idx % 2 === 0 
                        ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 font-medium border border-purple-100 dark:border-purple-800/30' 
                        : 'text-gray-400 dark:text-gray-500'
                    }`}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Ready in minutes</span>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 rounded-2xl sm:rounded-3xl p-8 sm:p-12">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          
          <div className="relative flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-1">Ready to Get Started?</h3>
              <p className="text-purple-200 text-sm">Connect your domain in minutes, not hours</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <a
                href="/register"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-purple-600 rounded-xl hover:bg-gray-50 transition-all font-bold text-sm shadow-lg hover:shadow-xl hover:scale-105 transform duration-200"
              >
                Start Free
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="https://resend.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-purple-500/30 backdrop-blur-sm text-white rounded-xl hover:bg-purple-500/40 transition-all font-semibold text-sm border border-purple-400/30"
              >
                Create Resend Account
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;