// components/Benefits.jsx
import React, { useState, useEffect } from 'react';
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
  ArrowRight,
  Star,
  Award,
  TrendingUp,
  Clock,
  MoveRight
} from 'lucide-react';

const Benefits = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const benefits = [
    {
      icon: Infinity,
      title: '100% Free Forever',
      description: 'No subscriptions, no hidden fees. All features available from day one.',
      gradient: 'from-emerald-400 to-teal-400',
      bgGradient: 'from-emerald-500/20 to-teal-500/20',
      borderColor: 'border-emerald-500/30',
      image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&h=600&fit=crop',
      tag: 'Free',
      stat: '0$'
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Invite team members with custom roles. Work together seamlessly.',
      gradient: 'from-purple-400 to-purple-600',
      bgGradient: 'from-purple-500/20 to-purple-600/20',
      borderColor: 'border-purple-500/30',
      image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop',
      tag: 'Teams',
      stat: '∞'
    },
    {
      icon: Globe,
      title: 'Custom Domains',
      description: 'Use your own domain names for professional email addresses.',
      gradient: 'from-blue-400 to-blue-600',
      bgGradient: 'from-blue-500/20 to-blue-600/20',
      borderColor: 'border-blue-500/30',
      image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=600&fit=crop',
      tag: 'Branding',
      stat: 'DNS'
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: '2FA, encryption, and advanced security features to protect your data.',
      gradient: 'from-indigo-400 to-indigo-600',
      bgGradient: 'from-indigo-500/20 to-indigo-600/20',
      borderColor: 'border-indigo-500/30',
      image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&h=600&fit=crop',
      tag: 'Secure',
      stat: 'SSL'
    }
  ];

  // Auto-play carousel
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % benefits.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, benefits.length]);

  const goToSlide = (index) => {
    setActiveIndex(index);
    setIsAutoPlaying(false);
    // Resume auto-play after 10 seconds of inactivity
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  return (
    <section id="benefits" className="relative min-h-screen py-12 sm:py-16 overflow-hidden bg-black">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl"></div>
        
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header - Minimal & Impactful */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-sm border border-purple-500/20 rounded-full px-4 py-1.5 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-purple-300 text-xs font-medium tracking-wider">WHY NEXA</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3 leading-tight">
            Built for{' '}
            <span className="bg-gradient-to-r from-purple-400 via-purple-300 to-blue-400 bg-clip-text text-transparent">
              modern teams
            </span>
          </h2>
          <p className="text-sm sm:text-base text-gray-400 max-w-xl mx-auto">
            Everything you need to manage email professionally — completely free
          </p>
        </div>

        {/* Mobile - Full Screen Hero Cards */}
        <div className="lg:hidden">
          <div className="relative overflow-hidden rounded-2xl">
            <div 
              className="flex transition-transform duration-700 ease-out"
              style={{ transform: `translateX(-${activeIndex * 100}%)` }}
            >
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <div 
                    key={index} 
                    className="w-full flex-shrink-0 px-1"
                  >
                    <div className="relative rounded-2xl overflow-hidden">
                      {/* Image */}
                      <div className="relative h-[400px]">
                        <img 
                          src={benefit.image} 
                          alt={benefit.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30"></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/30 to-transparent"></div>
                      </div>
                      
                      {/* Content Overlay */}
                      <div className="absolute inset-0 flex flex-col justify-end p-6">
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`w-12 h-12 bg-gradient-to-r ${benefit.gradient} rounded-xl flex items-center justify-center shadow-xl shadow-purple-500/30`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-white bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full border border-white/10">
                              {benefit.tag}
                            </span>
                          </div>
                        </div>
                        
                        <h3 className="text-2xl font-bold text-white mb-2">{benefit.title}</h3>
                        <p className="text-sm text-gray-300 leading-relaxed">{benefit.description}</p>
                        
                        <div className="mt-4 flex items-center gap-4">
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span className="text-purple-400 font-bold text-lg">{benefit.stat}</span>
                            <span className="text-gray-500">starting from</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                            <span>Available now</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Dots */}
            <div className="flex justify-center gap-2 mt-4">
              {benefits.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`transition-all duration-300 ${
                    activeIndex === index 
                      ? 'w-8 h-2 bg-purple-500 rounded-full' 
                      : 'w-2 h-2 bg-gray-600 rounded-full hover:bg-gray-500'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Desktop - Split Layout */}
        <div className="hidden lg:grid lg:grid-cols-2 gap-8 items-center">
          {/* Left - Big Feature Display */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-purple-500/10">
              <img 
                src={benefits[activeIndex].image} 
                alt={benefits[activeIndex].title}
                className="w-full h-[500px] object-cover transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
              
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-14 h-14 bg-gradient-to-r ${benefits[activeIndex].gradient} rounded-2xl flex items-center justify-center shadow-2xl shadow-purple-500/30`}>
                    {React.createElement(benefits[activeIndex].icon, { className: "w-7 h-7 text-white" })}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full border border-white/10">
                      {benefits[activeIndex].tag}
                    </span>
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-white mb-2">{benefits[activeIndex].title}</h3>
                <p className="text-gray-300 text-base max-w-md">{benefits[activeIndex].description}</p>
              </div>
            </div>

            {/* Navigation Dots */}
            <div className="flex justify-center gap-3 mt-6">
              {benefits.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`transition-all duration-300 ${
                    activeIndex === index 
                      ? 'w-10 h-2.5 bg-gradient-to-r from-purple-500 to-purple-400 rounded-full shadow-lg shadow-purple-500/30' 
                      : 'w-2.5 h-2.5 bg-gray-600 rounded-full hover:bg-gray-500'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Right - Feature List */}
          <div className="space-y-4">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              const isActive = activeIndex === index;
              return (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-full text-left p-5 rounded-2xl transition-all duration-500 ${
                    isActive 
                      ? `bg-gradient-to-r ${benefit.bgGradient} border ${benefit.borderColor} shadow-lg shadow-purple-500/10` 
                      : 'bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 bg-gradient-to-r ${benefit.gradient} rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg ${isActive ? 'shadow-purple-500/30' : ''}`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className={`font-bold ${isActive ? 'text-white' : 'text-gray-300'}`}>
                          {benefit.title}
                        </h4>
                        {isActive && (
                          <MoveRight className="w-4 h-4 text-purple-400" />
                        )}
                      </div>
                      <p className={`text-sm ${isActive ? 'text-gray-300' : 'text-gray-500'}`}>
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Stats Banner - Mobile Friendly */}
        <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: Users, label: 'Team Ready', value: '∞' },
            { icon: Shield, label: 'Secure', value: '2FA' },
            { icon: Zap, label: 'Fast', value: '<1s' },
            { icon: Award, label: 'Free', value: '100%' }
          ].map((stat, index) => (
            <div key={index} className="bg-white/5 backdrop-blur-sm border border-white/5 rounded-xl p-3 text-center hover:bg-white/10 transition">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <stat.icon className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-xs font-bold text-white">{stat.value}</span>
              </div>
              <p className="text-[10px] text-gray-400">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Trust Badge */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500/10 to-emerald-400/10 backdrop-blur-sm border border-emerald-500/20 rounded-full px-4 py-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span className="text-emerald-300 text-xs font-medium">
              No credit card required • Start for free
            </span>
          </div>
        </div>

        {/* CTA - Minimal */}
        <div className="mt-10 text-center">
          <a
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-xl hover:from-purple-700 hover:to-purple-600 transition-all font-bold text-sm shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105 transform duration-300"
          >
            <Rocket className="w-4 h-4" />
            Start Building for Free
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default Benefits;