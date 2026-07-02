// components/Benefits.jsx
import React from 'react';
import { 
  Infinity, 
  Users, 
  Shield, 
  Globe, 
  Zap, 
  Mail, 
  Smartphone, 
  Headphones,
  CheckCircle,
  Sparkles,
  Rocket,
  ArrowRight
} from 'lucide-react';

const Benefits = () => {
  // Only 4 main benefits with images - clean and visual
  const benefits = [
    {
      icon: Infinity,
      title: '100% Free Forever',
      description: 'No subscriptions, no hidden fees. All features available from day one.',
      color: 'from-emerald-500 to-teal-500',
      image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&h=400&fit=crop',
      tag: 'Free'
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Invite team members with custom roles. Work together seamlessly.',
      color: 'from-purple-500 to-purple-600',
      image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400&fit=crop',
      tag: 'Teams'
    },
    {
      icon: Globe,
      title: 'Custom Domains',
      description: 'Use your own domain names for professional email addresses.',
      color: 'from-blue-500 to-blue-600',
      image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&h=400&fit=crop',
      tag: 'Branding'
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: '2FA, encryption, and advanced security features to protect your data.',
      color: 'from-indigo-500 to-indigo-600',
      image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&h=400&fit=crop',
      tag: 'Secure'
    }
  ];

  // Additional features as simple list - no boxes
  const extraFeatures = [
    { icon: Zap, label: 'Lightning Fast' },
    { icon: Smartphone, label: 'Mobile Ready' },
    { icon: Mail, label: 'Custom Emails' },
    { icon: Headphones, label: 'Free Support' }
  ];

  return (
    <section id="benefits" className="relative py-16 sm:py-20 overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&h=1080&fit=crop"
          alt="Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-black/80 to-purple-900/70"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40"></div>
        
        {/* Subtle animated particles */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-2 h-2 bg-purple-400 rounded-full animate-ping"></div>
          <div className="absolute top-40 right-20 w-3 h-3 bg-purple-300 rounded-full animate-pulse"></div>
          <div className="absolute bottom-32 left-1/4 w-2 h-2 bg-purple-400 rounded-full animate-ping"></div>
          <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 right-1/4 w-2 h-2 bg-purple-400 rounded-full animate-ping"></div>
        </div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-purple-500/30 rounded-full px-4 py-1.5 mb-4">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-purple-300 text-sm font-medium">Why Nexa</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4">
            Everything You Need
            <br />
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Completely Free
            </span>
          </h2>
          <p className="text-gray-300 text-sm sm:text-base">
            Powerful features that make email management simple and efficient.
          </p>
        </div>

        {/* Main Benefits - 2 columns on mobile, 4 on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div 
                key={index} 
                className="group bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden border border-white/10 hover:border-purple-500/50 shadow-lg hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 hover:-translate-y-2"
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={benefit.image} 
                    alt={benefit.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${benefit.color} opacity-70`}></div>
                  <div className="absolute bottom-4 left-4">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-bold text-gray-800">
                      {benefit.tag}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4">
                    <div className={`w-10 h-10 bg-gradient-to-r ${benefit.color} rounded-xl flex items-center justify-center shadow-lg`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-white mb-2">{benefit.title}</h3>
                  <p className="text-sm text-gray-300 leading-relaxed">{benefit.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Extra Features - Simple icons in a row */}
        <div className="flex flex-wrap justify-center gap-6 mb-12">
          {extraFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="flex items-center gap-2 bg-white/5 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
                <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
                  <Icon className="w-4 h-4 text-purple-400" />
                </div>
                <span className="text-sm text-gray-300 font-medium">{feature.label}</span>
              </div>
            );
          })}
        </div>

        {/* Trust Badge */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 backdrop-blur-sm border border-emerald-500/30 rounded-full px-5 py-2.5">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <span className="text-emerald-300 font-medium text-sm">
              No credit card required • Start for free
            </span>
          </div>
        </div>

        {/* CTA - Clean */}
        <div className="text-center">
          <div className="inline-flex flex-col sm:flex-row items-center gap-3 bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl p-1.5 shadow-2xl shadow-purple-500/30">
            <a
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-purple-600 rounded-xl hover:bg-gray-50 transition-all font-bold text-sm"
            >
              Create Free Account
              <Rocket className="w-4 h-4" />
            </a>
            <a
              href="#features"
              className="inline-flex items-center gap-2 px-6 py-3.5 text-white hover:text-purple-100 transition-all font-medium text-sm"
            >
              View Features
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Benefits;