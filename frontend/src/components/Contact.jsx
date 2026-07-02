// components/Contact.jsx
import React, { useState } from 'react';
import { 
  Mail, 
  Phone, 
  MessageCircle, 
  Clock, 
  Globe, 
  Heart,
  Send,
  CheckCircle,
  ArrowRight,
  Sparkles,
  MapPin,
  Coffee,
  Users,
  Headphones,
  Zap,
  CornerDownRight,
  Star,
  ThumbsUp
} from 'lucide-react';

const Contact = () => {
  const [copied, setCopied] = useState(false);

  const contactMethods = [
    {
      icon: Mail,
      title: 'Email Support',
      value: 'support@curriumx.online',
      description: 'We usually respond within 24 hours',
      action: 'mailto:support@curriumx.online',
      gradient: 'from-purple-500 to-purple-600',
      bgGradient: 'from-purple-500/10 to-purple-600/10',
      borderColor: 'border-purple-500/20',
      iconBg: 'bg-purple-500/20'
    },
    {
      icon: MessageCircle,
      title: 'WhatsApp',
      value: '+234 805 858 6759',
      description: 'Quick responses, 9 AM - 6 PM',
      action: 'https://wa.me/2348058586759',
      gradient: 'from-green-500 to-emerald-600',
      bgGradient: 'from-green-500/10 to-emerald-600/10',
      borderColor: 'border-green-500/20',
      iconBg: 'bg-green-500/20'
    },
    {
      icon: Phone,
      title: 'Phone Call',
      value: '+234 702 569 3976',
      description: 'For urgent matters',
      action: 'tel:+2347025693976',
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-500/10 to-blue-600/10',
      borderColor: 'border-blue-500/20',
      iconBg: 'bg-blue-500/20'
    }
  ];

  const stats = [
    { icon: Users, label: 'Active Users', value: '10K+' },
    { icon: Headphones, label: 'Support Hours', value: '24/7' },
    { icon: ThumbsUp, label: 'Satisfaction', value: '98%' },
    { icon: Zap, label: 'Response Time', value: '< 1hr' }
  ];

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <section id="contact" className="relative py-16 sm:py-20 overflow-hidden bg-black">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-sm border border-purple-500/20 rounded-full px-4 py-1.5 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-purple-300 text-xs font-medium tracking-wider">GET IN TOUCH</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3">
            We're Here to{' '}
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Help You
            </span>
          </h2>
          <p className="text-sm sm:text-base text-gray-400 max-w-xl mx-auto">
            Have questions or need assistance? Reach out to us through any of these channels.
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-12">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white/5 backdrop-blur-sm border border-white/5 rounded-xl p-3 text-center hover:bg-white/10 transition group">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Icon className="w-4 h-4 text-purple-400 group-hover:scale-110 transition" />
                  <span className="text-sm font-bold text-white">{stat.value}</span>
                </div>
                <p className="text-[10px] text-gray-400">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Main Grid - Mobile First */}
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
          
          {/* Left - Contact Cards */}
          <div className="space-y-4">
            {contactMethods.map((method, index) => {
              const Icon = method.icon;
              return (
                <div
                  key={index}
                  className={`group bg-gradient-to-r ${method.bgGradient} backdrop-blur-sm border ${method.borderColor} rounded-2xl p-5 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 hover:-translate-y-1`}
                >
                  <div className="flex items-center gap-4">
                    {/* Icon */}
                    <div className={`w-14 h-14 bg-gradient-to-r ${method.gradient} rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-white mb-0.5">{method.title}</h3>
                      <div className="flex items-center gap-2">
                        <p className="text-purple-400 font-medium text-sm truncate">{method.value}</p>
                        <button
                          onClick={() => handleCopy(method.value)}
                          className="p-1 hover:bg-white/10 rounded transition text-gray-400 hover:text-white flex-shrink-0"
                        >
                          {copied ? (
                            <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                          ) : (
                            <CornerDownRight className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-gray-400">{method.description}</p>
                    </div>
                    
                    {/* Action Button */}
                    <a
                      href={method.action}
                      target={method.icon === Mail ? '_self' : '_blank'}
                      rel={method.icon === Mail ? '' : 'noopener noreferrer'}
                      className={`w-10 h-10 bg-gradient-to-r ${method.gradient} rounded-xl flex items-center justify-center flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg shadow-purple-500/20 hover:scale-110`}
                    >
                      <ArrowRight className="w-4 h-4 text-white" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right - Visual Section */}
          <div className="relative">
            {/* Main Card */}
            <div className="relative bg-gradient-to-br from-purple-600/20 to-blue-600/20 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-6 sm:p-8 overflow-hidden">
              {/* Decorative glow */}
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"></div>
              
              <div className="relative z-10">
                {/* Trust Badge */}
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-sm border border-white/10 rounded-full px-4 py-1.5 mb-6">
                  <Heart className="w-3.5 h-3.5 text-purple-400" />
                  <span className="text-purple-300 text-xs font-medium">We Care About You</span>
                </div>

                <h3 className="text-xl font-bold text-white mb-2">Why Choose Us?</h3>
                <p className="text-sm text-gray-400 mb-6">We're committed to providing the best support experience</p>

                {/* Feature List */}
                <div className="space-y-3 mb-6">
                  {[
                    { icon: CheckCircle, text: 'Fast response time' },
                    { icon: CheckCircle, text: 'Dedicated support team' },
                    { icon: CheckCircle, text: 'Free for all users' },
                    { icon: CheckCircle, text: 'Available 24/7' }
                  ].map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Icon className="w-3.5 h-3.5 text-purple-400" />
                        </div>
                        <span className="text-sm text-gray-300">{item.text}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Divider */}
                <div className="border-t border-white/5 my-6"></div>

                {/* Office Hours */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Office Hours</p>
                    <div className="space-y-1 mt-1">
                      <div className="flex justify-between gap-8 text-xs">
                        <span className="text-gray-400">Mon - Fri</span>
                        <span className="text-white">9:00 AM - 6:00 PM</span>
                      </div>
                      <div className="flex justify-between gap-8 text-xs">
                        <span className="text-gray-400">Saturday</span>
                        <span className="text-white">10:00 AM - 4:00 PM</span>
                      </div>
                      <div className="flex justify-between gap-8 text-xs">
                        <span className="text-gray-400">Sunday</span>
                        <span className="text-gray-500">Closed</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Developer Credit */}
                <div className="mt-6 pt-6 border-t border-white/5 flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                    <Globe className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500">Developed by</p>
                    <p className="text-xs font-medium text-white">CurriumX Innovation Lab</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating quick response badge */}
            <div className="absolute -bottom-3 -right-3 bg-gradient-to-r from-emerald-500/20 to-green-500/20 backdrop-blur-sm border border-emerald-500/30 rounded-full px-4 py-2 shadow-xl">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-emerald-300 text-xs font-medium">Usually responds in 24hrs</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <div className="inline-flex flex-col sm:flex-row items-center gap-3 bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-2">
            <a
              href="mailto:support@curriumx.online"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-xl hover:from-purple-700 hover:to-purple-600 transition-all font-semibold text-sm shadow-lg shadow-purple-500/30"
            >
              <Send className="w-4 h-4" />
              Send Us an Email
            </a>
            <a
              href="https://wa.me/2348058586759"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 text-white hover:text-purple-300 transition-all font-medium text-sm"
            >
              <MessageCircle className="w-4 h-4" />
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;