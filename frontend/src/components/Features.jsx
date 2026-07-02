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
  Inbox
} from 'lucide-react';

const Features = () => {
  const [expandedStep, setExpandedStep] = useState(null);
  const [activeTab, setActiveTab] = useState('steps');

  const steps = [
    {
      icon: Globe,
      title: 'Add Domain to Resend',
      description: 'Verify your domain in minutes',
      detail: 'Log in to Resend, navigate to Domains, click "Add Domain", enter your domain name, and follow the DNS verification instructions. Once verified, your domain is ready for email sending.',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      tag: '5 min setup',
      step: '01'
    },
    {
      icon: Key,
      title: 'Get Resend API Key',
      description: 'Generate your API credentials',
      detail: 'In your Resend dashboard, go to API Keys, create a new key with the necessary permissions. Copy the key immediately as it won\'t be shown again.',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      tag: 'API access',
      step: '02'
    },
    {
      icon: Link,
      title: 'Connect to Nexa',
      description: 'Paste your API key',
      detail: 'In Nexa dashboard, navigate to Settings → Email Provider, paste your Resend API key, and click Connect. Your domain will automatically appear in Nexa.',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      tag: '1-click connect',
      step: '03'
    },
    {
      icon: Webhook,
      title: 'Configure Webhook',
      description: 'Start receiving emails',
      detail: 'Copy your webhook URL from Nexa → Domains → Webhook, then in Resend create a new webhook with that URL. Copy the signing secret from Resend and paste it back in Nexa.',
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      tag: 'Receive emails',
      step: '04'
    }
  ];

  const benefits = [
    {
      icon: Shield,
      title: 'Bank-grade Security',
      description: 'End-to-end encryption for all your emails',
      tag: 'Secure',
      gradient: 'from-emerald-500 to-teal-500'
    },
    {
      icon: Zap,
      title: 'Instant Delivery',
      description: 'Powered by Resend\'s world-class infrastructure',
      tag: 'Fast',
      gradient: 'from-yellow-500 to-orange-500'
    },
    {
      icon: Database,
      title: 'Smart Storage',
      description: 'All emails organized and searchable',
      tag: 'Organized',
      gradient: 'from-blue-500 to-indigo-500'
    },
    {
      icon: Smartphone,
      title: 'Mobile Ready',
      description: 'Access your email from anywhere',
      tag: 'Anywhere',
      gradient: 'from-pink-500 to-rose-500'
    }
  ];

  const features = [
    {
      icon: Send,
      title: 'Send & Receive',
      description: 'Full email functionality with your custom domain',
      tag: 'Core'
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Invite team members and manage together',
      tag: 'Team'
    },
    {
      icon: Cloud,
      title: 'Cloud Storage',
      description: 'All emails stored securely in the cloud',
      tag: 'Storage'
    },
    {
      icon: Lock,
      title: 'Privacy First',
      description: 'Your data is encrypted and private',
      tag: 'Privacy'
    }
  ];

  const toggleStep = (index) => {
    setExpandedStep(expandedStep === index ? null : index);
  };

  return (
    <section id="features" className="py-12 sm:py-16 lg:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header - Modern */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-50 to-purple-100/50 border border-purple-200/50 rounded-full px-4 py-1.5 mb-4 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span className="text-purple-700 text-xs font-medium">Simple Setup Process</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            Start in{' '}
            <span className="bg-gradient-to-r from-purple-600 via-purple-500 to-purple-400 bg-clip-text text-transparent">
              4 Easy Steps
            </span>
          </h2>
          <p className="text-sm sm:text-base text-gray-500 max-w-2xl mx-auto">
            Connect your domain with Resend and Nexa for professional email management
          </p>
        </div>

        {/* Mobile Tabs */}
        <div className="flex sm:hidden gap-2 mb-6 bg-gray-50/80 rounded-xl p-1 backdrop-blur-sm border border-gray-100">
          <button
            onClick={() => setActiveTab('steps')}
            className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'steps' 
                ? 'bg-white shadow-lg shadow-purple-500/10 text-purple-600 border border-purple-100' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Setup Steps
          </button>
          <button
            onClick={() => setActiveTab('benefits')}
            className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'benefits' 
                ? 'bg-white shadow-lg shadow-purple-500/10 text-purple-600 border border-purple-100' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Features
          </button>
        </div>

        {/* Steps - Desktop Modern Grid */}
        <div className={`${activeTab === 'steps' ? 'block' : 'hidden sm:block'} mb-12 sm:mb-20`}>
          {/* Desktop Grid */}
          <div className="hidden sm:grid sm:grid-cols-4 gap-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="group relative">
                  {/* Step Number */}
                  <div className="absolute -top-3 left-6 text-4xl font-bold text-purple-100 select-none">
                    {step.step}
                  </div>
                  
                  <div className={`relative pt-6 ${step.bgColor} border ${step.borderColor} rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden`}>
                    {/* Glow effect */}
                    <div className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-r ${step.color} opacity-0 group-hover:opacity-10 rounded-full blur-2xl transition-opacity duration-500`}></div>
                    
                    <div className={`w-14 h-14 bg-gradient-to-r ${step.color} rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                    <p className="text-sm text-gray-500 mb-3">{step.description}</p>
                    <p className="text-xs text-gray-400 leading-relaxed">{step.detail}</p>
                    
                    <div className="mt-4 pt-4 border-t border-gray-200/50 flex items-center justify-between">
                      <span className={`text-xs font-medium text-purple-600 bg-purple-100 px-3 py-1 rounded-full`}>
                        {step.tag}
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono">Step {index + 1}/4</span>
                    </div>
                  </div>
                  
                  {/* Connector line */}
                  {index < 3 && (
                    <div className="absolute top-1/2 -right-3 w-6 h-0.5 bg-gradient-to-r from-purple-300 to-purple-200 hidden lg:block">
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-purple-400 rounded-full"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Mobile Accordion */}
          <div className="sm:hidden space-y-3">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isExpanded = expandedStep === index;
              
              return (
                <div 
                  key={index}
                  className={`${step.bgColor} border ${step.borderColor} rounded-xl transition-all duration-300 overflow-hidden`}
                >
                  <button
                    onClick={() => toggleStep(index)}
                    className="w-full text-left p-4 flex items-start gap-3"
                  >
                    <div className={`w-10 h-10 bg-gradient-to-r ${step.color} rounded-xl flex items-center justify-center flex-shrink-0 shadow-md shadow-purple-500/20`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-purple-600">Step {index + 1}</span>
                        <h3 className="text-sm font-semibold text-gray-900">{step.title}</h3>
                      </div>
                      <p className="text-xs text-gray-600">{step.description}</p>
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
                      <div className="text-xs text-gray-600 leading-relaxed bg-white/60 rounded-lg p-3">
                        {step.detail}
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-[10px] text-purple-600 font-medium bg-purple-100 px-2 py-0.5 rounded-full">
                          {step.tag}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Features Grid - Modern Cards */}
        <div className={`${activeTab === 'benefits' ? 'block' : 'hidden sm:block'} mb-12 sm:mb-16`}>
          <div className="text-center mb-8 sm:mb-10">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Everything You Need</h3>
            <p className="text-sm text-gray-500">Enterprise-grade features with a beautiful interface</p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index} 
                  className="group bg-white border border-gray-100 rounded-xl p-4 sm:p-5 hover:border-purple-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                  </div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">{feature.title}</h4>
                  <p className="text-xs text-gray-500 mb-2">{feature.description}</p>
                  <span className="inline-block text-[10px] font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                    {feature.tag}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Benefits - Compact Modern */}
        <div className="mb-10 sm:mb-16">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div 
                  key={index} 
                  className="group bg-gradient-to-br from-gray-50 to-white border border-gray-100 rounded-xl p-4 sm:p-5 hover:border-purple-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
                >
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${benefit.gradient} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">{benefit.title}</h4>
                  <p className="text-xs text-gray-500">{benefit.description}</p>
                  <span className="inline-block mt-2 text-[10px] font-medium text-white bg-gradient-to-r from-purple-500 to-purple-600 px-2 py-0.5 rounded-full">
                    {benefit.tag}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Webhook Highlight - Modern */}
        <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-100 rounded-2xl p-5 sm:p-6 mb-10 sm:mb-14 hover:shadow-lg transition-all duration-300">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20 flex-shrink-0">
                <Webhook className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900">Webhook Setup</h4>
                <p className="text-xs text-gray-500">Configure email receiving</p>
              </div>
            </div>
            
            <div className="flex-1 flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                <Copy className="w-3.5 h-3.5 text-purple-600" />
                <span className="text-xs text-gray-600 font-mono">Copy URL from Nexa</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-gray-300" />
              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                <Globe className="w-3.5 h-3.5 text-purple-600" />
                <span className="text-xs text-gray-600 font-mono">Paste in Resend</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-gray-300" />
              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                <Key className="w-3.5 h-3.5 text-purple-600" />
                <span className="text-xs text-gray-600 font-mono">Copy Secret</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-gray-300" />
              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                <span className="text-xs text-gray-600 font-mono">Paste in Nexa</span>
              </div>
            </div>
          </div>
        </div>

        {/* CTA - Modern & Sleek */}
        <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 rounded-2xl sm:rounded-3xl p-6 sm:p-10">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-400/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-400/10 rounded-full blur-3xl"></div>
          
          <div className="relative flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-center sm:text-left">
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">Ready to Get Started?</h3>
              <p className="text-purple-200 text-sm">Connect your domain in minutes, not hours</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <a
                href="/register"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-purple-600 rounded-xl hover:bg-gray-50 transition-all font-semibold text-sm shadow-lg shadow-purple-500/25 hover:shadow-xl hover:scale-105 transform duration-200"
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

        {/* Footer - Minimal */}
        <div className="mt-8 sm:mt-10 text-center">
          <p className="text-xs text-gray-400">
            <span className="font-medium text-gray-500">Resend</span> provides email delivery infrastructure •{' '}
            <span className="font-medium text-gray-500">Nexa</span> provides the management interface
          </p>
        </div>
      </div>
    </section>
  );
};

export default Features;