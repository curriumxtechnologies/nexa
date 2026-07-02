import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  CheckCircle, 
  Star, 
  Users, 
  Globe, 
  Shield, 
  Zap, 
  Mail, 
  Sparkles, 
  Clock, 
  Heart, 
  Code,
  Crown,
  Rocket,
  MessageCircle,
  Layers,
  Share2
} from 'lucide-react';

const Hero = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  
  const testimonials = [
    { name: 'Sarah Chen', role: 'Early Adopter', company: 'CurriumX', text: 'Best email platform we have ever used!', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&h=60&fit=crop' },
    { name: 'Michael Okonkwo', role: 'Founder', company: 'CurriumX', text: 'Nexa transformed our email workflow completely.', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop' },
    { name: 'Amara Nwosu', role: 'CTO', company: 'LovohCreate', text: 'Custom domains and team collaboration is seamless!', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop' }
  ];

  const features = [
    { icon: Users, label: 'Team Collaboration', desc: 'Invite & work together' },
    { icon: Globe, label: 'Custom Domains', desc: 'Your brand, your email' },
    { icon: Shield, label: 'Enterprise Security', desc: 'Bank-grade protection' },
    { icon: Zap, label: 'Lightning Fast', desc: 'Real-time sync' }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <section className="relative h-screen overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-purple-950/30">
      {/* Subtle background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center h-full py-8 lg:py-0">
          
          {/* Left Column - Content */}
          <div className="space-y-4 sm:space-y-6">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-purple-500/20 text-purple-300 px-3 py-1.5 rounded-full text-xs font-medium">
              <Rocket className="w-3.5 h-3.5" />
              <span>Now Live — Start Free</span>
            </div>

            {/* Heading */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight">
              Modern Email
              <br />
              Management for
              <br />
              <span className="bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
                Teams & Creators
              </span>
            </h1>

            {/* Description */}
            <p className="text-sm sm:text-base text-gray-400 max-w-lg leading-relaxed">
              Custom email addresses with your own domain. Collaborate with your team, 
              and manage everything from one beautiful platform.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-3">
              <a
                href="/login"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg shadow-purple-500/25 text-sm"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#features"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-white/5 backdrop-blur-sm text-white border border-white/10 rounded-lg hover:bg-white/10 transition-all duration-200 font-medium text-sm"
              >
                Learn More
              </a>
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-2 pt-2">
              {features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-1.5 bg-white/5 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/5">
                  <feature.icon className="w-3.5 h-3.5 text-purple-400" />
                  <span className="text-xs text-gray-300">{feature.label}</span>
                </div>
              ))}
            </div>

            {/* Trust indicators - Removed fake numbers */}
            <div className="flex items-center gap-4 pt-2">
              <div className="flex -space-x-2">
                <div className="w-7 h-7 rounded-full border-2 border-gray-900 bg-gradient-to-br from-purple-500/30 to-purple-600/30 flex items-center justify-center">
                  <span className="text-[10px] text-white font-medium">●</span>
                </div>
                <div className="w-7 h-7 rounded-full border-2 border-gray-900 bg-gradient-to-br from-purple-500/30 to-purple-600/30 flex items-center justify-center">
                  <span className="text-[10px] text-white font-medium">●</span>
                </div>
                <div className="w-7 h-7 rounded-full border-2 border-gray-900 bg-gradient-to-br from-purple-500/30 to-purple-600/30 flex items-center justify-center">
                  <span className="text-[10px] text-white font-medium">●</span>
                </div>
                <div className="w-7 h-7 rounded-full border-2 border-gray-900 bg-gradient-to-br from-purple-500/30 to-purple-600/30 flex items-center justify-center">
                  <span className="text-[10px] text-white font-medium">●</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                <span className="text-sm text-gray-400">
                  <span className="text-white font-semibold">4.9</span> / 5.0
                </span>
              </div>
              <span className="text-xs text-gray-500">•</span>
              <span className="text-xs text-gray-400">Free to start</span>
            </div>
          </div>

          {/* Right Column - Visual */}
          <div className="relative flex items-center justify-center">
            <div className="relative w-full max-w-md">
              {/* Floating cards - Left */}
              <div className="absolute -left-8 lg:-left-12 top-1/4 z-20 bg-gray-900/90 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-purple-500/20 w-36 animate-float hidden sm:block">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <Users className="w-3.5 h-3.5 text-purple-400" />
                  </div>
                  <span className="text-xs font-semibold text-white">Team</span>
                </div>
                <p className="text-lg font-bold text-white">Unlimited</p>
                <p className="text-[10px] text-gray-400">Members included</p>
              </div>

              {/* Floating cards - Right */}
              <div className="absolute -right-8 lg:-right-12 bottom-1/4 z-20 bg-gray-900/90 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-purple-500/20 w-36 animate-float-delayed hidden sm:block">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                  </div>
                  <span className="text-xs font-semibold text-white">Domain</span>
                </div>
                <p className="text-sm font-medium text-purple-400">yourname@</p>
                <p className="text-[10px] text-gray-400">Custom domain ready</p>
              </div>

              {/* Main Phone Mockup */}
              <div className="relative z-10 bg-gray-900 rounded-[2rem] p-1.5 shadow-2xl shadow-purple-500/20 border border-purple-500/30">
                <div className="bg-gray-950 rounded-[1.8rem] overflow-hidden">
                  {/* Status Bar */}
                  <div className="flex items-center justify-between px-4 py-1.5 bg-gray-950">
                    <span className="text-[10px] font-semibold text-white">9:41</span>
                    <div className="flex gap-0.5">
                      <div className="w-3 h-1.5 bg-white/70 rounded-sm"></div>
                      <div className="w-2 h-1.5 bg-white/70 rounded-sm"></div>
                      <div className="w-1.5 h-1.5 bg-white/70 rounded-full"></div>
                    </div>
                  </div>

                  {/* Header */}
                  <div className="px-3 py-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                          <Mail className="w-3.5 h-3.5 text-white" />
                        </div>
                        <span className="font-semibold text-white text-sm">Nexa</span>
                      </div>
                      <div className="flex gap-0.5">
                        <div className="w-1 h-1 rounded-full bg-purple-500/50"></div>
                        <div className="w-1 h-1 rounded-full bg-purple-500/50"></div>
                        <div className="w-1 h-1 rounded-full bg-purple-500"></div>
                      </div>
                    </div>
                  </div>

                  {/* Email List */}
                  <div className="px-2 pb-3 space-y-1.5 max-h-[320px] overflow-y-auto">
                    {[
                      { from: 'Sarah Chen', subject: 'Q4 Strategy Meeting', preview: 'Let us schedule a call...', time: '10:42' },
                      { from: 'Michael O.', subject: 'New Partnership Deal', preview: 'Exciting opportunities...', time: '9:15' },
                      { from: 'Design Team', subject: 'Brand Assets Ready', preview: 'Here are the final...', time: 'Yesterday' },
                      { from: 'Client Portal', subject: 'New Message', preview: 'You have a new...', time: 'Yesterday' }
                    ].map((email, idx) => (
                      <div key={idx} className="flex items-start gap-2 p-1.5 bg-gray-900/30 rounded-lg hover:bg-purple-500/5 transition cursor-pointer">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500/30 to-purple-600/30 flex-shrink-0 flex items-center justify-center text-[10px] font-medium text-white">
                          {email.from.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-[10px] font-semibold text-white truncate">{email.from}</p>
                            <p className="text-[8px] text-gray-500 flex-shrink-0 ml-1">{email.time}</p>
                          </div>
                          <p className="text-[9px] font-medium text-gray-300 truncate">{email.subject}</p>
                          <p className="text-[8px] text-gray-500 truncate">{email.preview}</p>
                        </div>
                        <Star className="w-2.5 h-2.5 text-gray-600 flex-shrink-0" />
                      </div>
                    ))}
                  </div>

                  {/* Bottom Navigation */}
                  <div className="bg-gray-950 border-t border-gray-800 px-3 py-1.5 flex justify-around">
                    <div className="flex flex-col items-center gap-0.5 text-purple-400">
                      <Mail className="w-3.5 h-3.5" />
                      <span className="text-[7px] font-medium">Inbox</span>
                    </div>
                    <div className="flex flex-col items-center gap-0.5 text-gray-600">
                      <Users className="w-3.5 h-3.5" />
                      <span className="text-[7px]">Team</span>
                    </div>
                    <div className="flex flex-col items-center gap-0.5 text-gray-600">
                      <Shield className="w-3.5 h-3.5" />
                      <span className="text-[7px]">Security</span>
                    </div>
                    <div className="flex flex-col items-center gap-0.5 text-gray-600">
                      <Layers className="w-3.5 h-3.5" />
                      <span className="text-[7px]">More</span>
                    </div>
                  </div>
                </div>

                {/* Notch */}
                <div className="absolute top-1 left-1/2 -translate-x-1/2 w-16 h-4 bg-gray-900 rounded-full"></div>
              </div>

              {/* Bottom Badge */}
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-20 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-1.5 rounded-full shadow-lg shadow-purple-500/30 flex items-center gap-2 whitespace-nowrap">
                <CheckCircle className="w-3 h-3" />
                <span className="text-xs font-semibold">Free Tier Available</span>
                <Zap className="w-3 h-3" />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar - Testimonial */}
        <div className="absolute bottom-4 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/5 px-4 py-2.5">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {testimonials.map((t, i) => (
                  <img key={i} src={t.avatar} alt="" className="w-6 h-6 rounded-full border-2 border-gray-900 object-cover" />
                ))}
              </div>
              <div className="text-xs text-gray-400">
                <span className="text-white font-medium">Loved by</span> early adopters
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <MessageCircle className="w-3.5 h-3.5 text-purple-400" />
              <span>"{testimonials[activeIndex].text}"</span>
              <span className="text-gray-500">—</span>
              <span className="text-purple-400">{testimonials[activeIndex].name}</span>
            </div>
            <div className="flex gap-1">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    idx === activeIndex ? 'bg-purple-500 w-4' : 'bg-purple-500/30 w-1.5 hover:bg-purple-400/50'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        
        @keyframes floatDelayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(8px); }
        }
        
        .animate-float {
          animation: float 5s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: floatDelayed 5s ease-in-out infinite;
          animation-delay: 2s;
        }

        .overflow-y-auto::-webkit-scrollbar {
          width: 2px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: #7c3aed;
          border-radius: 2px;
        }
      `}</style>
    </section>
  );
};

export default Hero;