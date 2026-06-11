// components/Features.jsx
import React from 'react';
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
  ExternalLink
} from 'lucide-react';

const Features = () => {
  const primaryFeatures = [
    {
      icon: Globe,
      title: '1. Add Domain to Resend',
      description: 'Go to Resend.com, add your domain, and verify DNS records. Takes less than 5 minutes.',
      color: 'from-purple-500 to-purple-600',
      highlight: 'Free domain verification'
    },
    {
      icon: Key,
      title: '2. Get Resend API Key',
      description: 'Generate your API key from Resend dashboard. You will need this to connect with Nexa.',
      color: 'from-blue-500 to-blue-600',
      highlight: 'Secure key storage'
    },
    {
      icon: Link,
      title: '3. Connect to Nexa',
      description: 'Paste your Resend API key in Nexa dashboard. Your domain is now ready to send emails.',
      color: 'from-green-500 to-green-600',
      highlight: 'One-click connection'
    },
    {
      icon: Webhook,
      title: '4. Configure Webhook',
      description: 'Copy Nexa webhook URL to Resend, paste your signing secret in Nexa to start receiving emails.',
      color: 'from-orange-500 to-orange-600',
      highlight: 'Receive emails instantly'
    }
  ];

  const webhookSteps = [
    {
      icon: Copy,
      title: 'Copy Webhook URL',
      description: 'From Nexa dashboard → Domains → Webhook → Copy your unique webhook URL',
      action: 'Found in Nexa Dashboard'
    },
    {
      icon: Globe,
      title: 'Add to Resend',
      description: 'Go to Resend → Webhooks → Create Webhook → Paste the URL',
      action: 'resend.com/webhooks'
    },
    {
      icon: Key,
      title: 'Get Signing Secret',
      description: 'Resend generates a signing secret for your webhook. Copy it securely.',
      action: 'Save it securely'
    },
    {
      icon: Link,
      title: 'Configure in Nexa',
      description: 'Paste the signing secret in Nexa → Domains → Webhook Secret → Save',
      action: 'Enable email receiving'
    },
    {
      icon: CheckCircle,
      title: 'Start Receiving',
      description: 'Your domain is now fully configured to send AND receive emails!',
      action: 'Test with a sample email'
    }
  ];

  const benefits = [
    {
      icon: Shield,
      title: 'Secure by Default',
      description: 'All connections are encrypted. Your API keys and webhook secrets are stored securely.'
    },
    {
      icon: Zap,
      title: 'Real-time Delivery',
      description: 'Emails are delivered instantly with Resend powerful infrastructure.'
    },
    {
      icon: Database,
      title: 'Email Storage',
      description: 'All received emails are stored securely in your Nexa inbox.'
    },
    {
      icon: Smartphone,
      title: 'Push Notifications',
      description: 'Get instant notifications when you receive new emails.'
    }
  ];

  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-purple-100 rounded-full px-4 py-1.5 mb-4">
            <Zap className="w-4 h-4 text-purple-600" />
            <span className="text-purple-700 text-sm font-medium">Simple Integration</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Get Started in{' '}
            <span className="text-purple-600">4 Simple Steps</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Connect your domain through Resend and Nexa to start sending and receiving professional emails.
          </p>
        </div>

        {/* Primary Features Grid - The 4 Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {primaryFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div 
                key={index} 
                className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative"
              >
                {/* Step Number */}
                <div className="absolute -top-3 left-6 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md">
                  {index + 1}
                </div>
                
                <div className={`w-14 h-14 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 mt-2`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-3">{feature.description}</p>
                <span className="inline-flex items-center gap-1 text-xs text-purple-600 font-medium">
                  <CheckCircle className="w-3 h-3" />
                  {feature.highlight}
                </span>
              </div>
            );
          })}
        </div>

        {/* Webhook Configuration Section */}
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-3xl p-8 mb-20">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-white/80 rounded-full px-4 py-1.5 mb-4 shadow-sm">
              <Webhook className="w-4 h-4 text-purple-600" />
              <span className="text-purple-700 text-sm font-medium">Configure Webhook to Receive Emails</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Set Up Email Receiving</h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              To receive emails on your custom domain, configure webhooks in Resend and Nexa
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
            {webhookSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="relative">
                  <div className="bg-white rounded-xl p-4 text-center shadow-md hover:shadow-lg transition">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Icon className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="text-xs font-bold text-purple-600 mb-1">Step {index + 1}</div>
                    <h4 className="text-gray-900 font-semibold text-sm mb-2">{step.title}</h4>
                    <p className="text-gray-500 text-xs mb-2">{step.description}</p>
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <code className="text-[10px] bg-gray-100 px-2 py-1 rounded text-gray-600 block truncate">
                        {step.action}
                      </code>
                    </div>
                  </div>
                  
                  {/* Connector line */}
                  {index < 4 && (
                    <div className="hidden lg:block absolute top-1/2 -right-2 w-4 h-0.5 bg-purple-300"></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Why Choose Nexa + Resend?</h3>
            <p className="text-gray-600">Enterprise-grade email infrastructure with a beautiful interface</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div key={index} className="flex items-start gap-4 p-5 bg-gray-50 rounded-xl hover:bg-purple-50/30 transition group">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition">
                    <Icon className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="text-gray-900 font-semibold mb-1">{benefit.title}</h4>
                    <p className="text-gray-500 text-sm">{benefit.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-3xl p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-2">Ready to set up your professional email?</h3>
          <p className="text-purple-200 mb-6">Connect your domain to Resend and Nexa in minutes</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/register"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-purple-600 rounded-xl hover:bg-gray-100 transition font-semibold"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="https://resend.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-800 transition font-semibold border border-purple-400"
            >
              Create Resend Account
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-12 text-center">
          <p className="text-gray-400 text-sm">
            Resend handles email delivery infrastructure. Nexa provides the management interface.
            Together, they give you complete control over your email communication.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Features;