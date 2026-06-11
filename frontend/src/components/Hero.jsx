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
  Rocket
} from 'lucide-react';

const Hero = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  
  const testimonials = [
    { name: 'Sarah Chen', role: 'Early Adopter', company: 'CurriumX', text: 'Best email platform we have ever used!', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&h=60&fit=crop' },
    { name: 'Michael Okonkwo', role: 'Founder', company: 'CurriumX', text: 'Nexa transformed our email workflow completely.', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop' },
    { name: 'Amara Nwosu', role: 'CTO', company: 'LovohCreate', text: 'Custom domains and team collaboration is seamless!', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop' }
  ];

  const emails = [
    { from: 'Sarah Chen', subject: 'Q4 Strategy Meeting', preview: 'Let us schedule a call to discuss...', time: '10:42', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop' },
    { from: 'Michael O.', subject: 'New Partnership Deal', preview: 'Exciting opportunities ahead for...', time: '9:15', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop' },
    { from: 'Design Team', subject: 'Brand Assets Ready', preview: 'Here are the final logo files...', time: 'Yesterday', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop' },
    { from: 'Client Portal', subject: 'New Message Received', preview: 'You have a new message from...', time: 'Yesterday', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop' }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <section className="relative overflow-hidden min-h-screen pt-24 lg:pt-28">
      {/* Background Image with Dark Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&h=1080&fit=crop"
          alt="Space technology background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-black/80 to-purple-900/70"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40"></div>
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-purple-600/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-3xl"></div>
        
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-2 h-2 bg-purple-400 rounded-full animate-ping"></div>
          <div className="absolute top-40 right-20 w-3 h-3 bg-purple-300 rounded-full animate-pulse"></div>
          <div className="absolute bottom-32 left-1/4 w-2 h-2 bg-purple-400 rounded-full animate-ping"></div>
          <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 right-1/4 w-2 h-2 bg-purple-400 rounded-full animate-ping"></div>
        </div>
      </div>

      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Badge */}
        <div className="flex justify-center mb-6 lg:mb-8">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-purple-500/30 text-purple-300 px-3 py-1.5 lg:px-4 lg:py-2 rounded-full text-xs lg:text-sm font-medium shadow-sm hover:shadow-md transition">
            <Rocket className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
            <span>Now Live — Start for Free</span>
          </div>
        </div>

        {/* Hero Content */}
        <div className="text-center max-w-4xl mx-auto mb-12 lg:mb-16">
          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-white leading-tight mb-4 lg:mb-6">
            Modern Email Management
            <br />
            Powered by{' '}
            <span className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-3 py-0.5 lg:px-4 lg:py-1 rounded-xl text-3xl sm:text-4xl lg:text-6xl font-bold shadow-lg">
              Nexa
            </span>
          </h1>
          
          <p className="text-base lg:text-lg text-gray-300 mb-8 lg:mb-10 max-w-2xl mx-auto leading-relaxed px-4">
            Create custom email addresses with your own domain, collaborate with your team, 
            and manage everything from one beautiful platform. Start with our free tier today.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 justify-center mb-10 lg:mb-12">
            <a
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 lg:px-8 lg:py-3.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-full hover:from-purple-600 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg shadow-purple-500/30 text-sm lg:text-base"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="#features"
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 lg:px-8 lg:py-3.5 bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-full hover:bg-white/20 transition-all duration-200 font-medium text-sm lg:text-base"
            >
              View Features
            </a>
          </div>

          {/* Stats - Honest */}
          <div className="flex flex-wrap justify-center gap-6 lg:gap-8">
            <div className="flex items-center gap-2 lg:gap-3">
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-purple-500/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Crown className="w-4 h-4 lg:w-5 lg:h-5 text-purple-400" />
              </div>
              <div className="text-left">
                <p className="text-base lg:text-xl font-bold text-white">Free Tier</p>
                <p className="text-xs text-gray-400">Get started today</p>
              </div>
            </div>
            <div className="flex items-center gap-2 lg:gap-3">
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-purple-500/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Globe className="w-4 h-4 lg:w-5 lg:h-5 text-purple-400" />
              </div>
              <div className="text-left">
                <p className="text-base lg:text-xl font-bold text-white">Custom Domains</p>
                <p className="text-xs text-gray-400">Use your own domain</p>
              </div>
            </div>
            <div className="flex items-center gap-2 lg:gap-3">
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-purple-500/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Users className="w-4 h-4 lg:w-5 lg:h-5 text-purple-400" />
              </div>
              <div className="text-left">
                <p className="text-base lg:text-xl font-bold text-white">Team Features</p>
                <p className="text-xs text-gray-400">Collaborate together</p>
              </div>
            </div>
          </div>
        </div>

        {/* Phone Mockup with Floating Cards - Mobile Friendly */}
        <div className="relative flex justify-center mb-16 lg:mb-20 px-4">
          <div className="relative w-[280px] sm:w-[340px] lg:w-[400px]">
            {/* Left floating card - Hidden on mobile, visible on tablet+ */}
            <div className="hidden lg:block absolute -left-32 top-1/2 -translate-y-1/2 z-30 bg-gray-900/90 backdrop-blur-sm rounded-2xl p-4 shadow-xl shadow-purple-500/20 border border-purple-500/30 w-56 animate-float">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">Team Collaboration</p>
                  <p className="text-[10px] text-gray-400">Invite team members</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-white mb-1">Unlimited</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-purple-500/20 rounded-full overflow-hidden">
                  <div className="h-full w-full bg-purple-500 rounded-full"></div>
                </div>
                <span className="text-[10px] text-green-400 font-medium">Included</span>
              </div>
            </div>

            {/* Right floating card - Hidden on mobile, visible on tablet+ */}
            <div className="hidden lg:block absolute -right-32 top-1/2 -translate-y-1/2 z-30 bg-gray-900/90 backdrop-blur-sm rounded-2xl p-4 shadow-xl shadow-purple-500/20 border border-purple-500/30 w-56 animate-float-delayed">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  </div>
                  <span className="text-xs font-semibold text-white">Custom Domains</span>
                </div>
                <span className="text-xs font-bold text-purple-400">Supported</span>
              </div>
              <div className="flex gap-1 mb-3">
                {[1,2,3,4,5].map((i) => (
                  <div key={i} className="flex-1 h-1.5 bg-purple-500/20 rounded-full overflow-hidden">
                    <div className="h-full w-full bg-purple-500 rounded-full"></div>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center">
                  <Globe className="w-3 h-3 text-purple-400" />
                </div>
                <span className="text-[10px] text-gray-400">yourname@domain.com</span>
              </div>
            </div>

            {/* Top floating card - Visible on all screens */}
            <div className="absolute -top-4 lg:-top-8 left-1/2 -translate-x-1/2 z-30 bg-gray-900/90 backdrop-blur-sm rounded-full px-3 py-1.5 lg:px-5 lg:py-2 shadow-lg border border-purple-500/30 flex items-center gap-1.5 lg:gap-2 whitespace-nowrap">
              <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-[10px] lg:text-xs font-medium text-gray-300">Free to start</span>
              <span className="text-[9px] lg:text-xs text-purple-400 font-semibold">No credit card</span>
            </div>

            {/* Phone - Dark theme */}
            <div className="relative z-20 bg-gray-900 rounded-[2rem] lg:rounded-[2.5rem] p-1.5 lg:p-2 shadow-2xl shadow-purple-500/20 border border-purple-500/30">
              <div className="bg-gray-950 rounded-[1.5rem] lg:rounded-[2rem] overflow-hidden">
                <div className="flex items-center justify-between px-4 lg:px-6 py-1.5 lg:py-2 bg-gray-950">
                  <span className="text-[10px] lg:text-xs font-semibold text-white">9:41</span>
                  <div className="flex gap-0.5 lg:gap-1">
                    <div className="w-3 h-1.5 lg:w-4 lg:h-2 bg-white/70 rounded-sm"></div>
                    <div className="w-2 h-1.5 lg:w-3 lg:h-2 bg-white/70 rounded-sm"></div>
                    <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-white/70 rounded-full"></div>
                  </div>
                </div>

                <div className="px-3 lg:px-4 py-2 lg:py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 lg:gap-2">
                      <div className="w-6 h-6 lg:w-8 lg:h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg lg:rounded-xl flex items-center justify-center">
                        <Mail className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-white" />
                      </div>
                      <span className="font-semibold text-white text-xs lg:text-sm">Nexa</span>
                    </div>
                    <div className="flex gap-0.5 lg:gap-1">
                      <div className="w-1 h-1 lg:w-1.5 lg:h-1.5 rounded-full bg-purple-500/50"></div>
                      <div className="w-1 h-1 lg:w-1.5 lg:h-1.5 rounded-full bg-purple-500/50"></div>
                      <div className="w-1 h-1 lg:w-1.5 lg:h-1.5 rounded-full bg-purple-500"></div>
                    </div>
                  </div>
                </div>

                <div className="px-2 lg:px-3 pb-3 lg:pb-4 space-y-1.5 lg:space-y-2 max-h-[350px] lg:max-h-[400px] overflow-y-auto">
                  {emails.map((email, index) => (
                    <div key={index} className="flex items-start gap-2 lg:gap-2.5 p-1.5 lg:p-2.5 bg-gray-900/50 rounded-lg lg:rounded-xl hover:bg-purple-500/10 transition cursor-pointer group">
                      <img src={email.avatar} alt="" className="w-6 h-6 lg:w-8 lg:h-8 rounded-full object-cover flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <p className="text-[10px] lg:text-xs font-semibold text-white truncate">{email.from}</p>
                          <p className="text-[8px] lg:text-[10px] text-gray-500 flex-shrink-0 ml-1 lg:ml-2">{email.time}</p>
                        </div>
                        <p className="text-[9px] lg:text-[11px] font-medium text-gray-300 truncate mb-0.5">{email.subject}</p>
                        <p className="text-[8px] lg:text-[10px] text-gray-500 truncate">{email.preview}</p>
                      </div>
                      <Star className="w-2.5 h-2.5 lg:w-3.5 lg:h-3.5 text-gray-600 group-hover:text-yellow-400 transition flex-shrink-0" />
                    </div>
                  ))}
                </div>

                <div className="bg-gray-950 border-t border-gray-800 px-3 lg:px-4 py-1.5 lg:py-2 flex justify-around">
                  <div className="flex flex-col items-center gap-0.5 text-purple-400">
                    <Mail className="w-3.5 h-3.5 lg:w-5 lg:h-5" />
                    <span className="text-[7px] lg:text-[9px] font-medium">Inbox</span>
                  </div>
                  <div className="flex flex-col items-center gap-0.5 text-gray-600">
                    <Users className="w-3.5 h-3.5 lg:w-5 lg:h-5" />
                    <span className="text-[7px] lg:text-[9px]">Team</span>
                  </div>
                  <div className="flex flex-col items-center gap-0.5 text-gray-600">
                    <Shield className="w-3.5 h-3.5 lg:w-5 lg:h-5" />
                    <span className="text-[7px] lg:text-[9px]">Security</span>
                  </div>
                </div>
              </div>

              <div className="absolute top-1 left-1/2 -translate-x-1/2 w-16 lg:w-20 h-4 lg:h-6 bg-gray-900 rounded-full"></div>
            </div>

            {/* Bottom floating badge - Visible on all screens */}
            <div className="absolute -bottom-4 lg:-bottom-5 left-1/2 -translate-x-1/2 z-30 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-3 py-1.5 lg:px-6 lg:py-2.5 rounded-full shadow-xl shadow-purple-500/30 flex items-center gap-1.5 lg:gap-2 whitespace-nowrap">
              <CheckCircle className="w-3 h-3 lg:w-4 lg:h-4" />
              <span className="text-[10px] lg:text-xs font-semibold">Start with Free Tier</span>
              <Zap className="w-2.5 h-2.5 lg:w-3.5 lg:h-3.5" />
            </div>
          </div>
        </div>

        {/* CurriumX & LovohCreate logos - Mobile friendly */}
        <div className="text-center mb-16 lg:mb-20">
          <p className="text-xs lg:text-sm text-gray-500 mb-4 lg:mb-6 font-medium">Built with ❤️ by</p>
          <div className="flex flex-wrap justify-center items-center gap-4 lg:gap-8">
            <div className="flex items-center gap-2 lg:gap-3 text-gray-300">
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-purple-500/20 rounded-lg lg:rounded-xl flex items-center justify-center">
                <Code className="w-4 h-4 lg:w-5 lg:h-5 text-purple-400" />
              </div>
              <div className="text-left">
                <p className="text-xs lg:text-sm font-semibold text-white">CurriumX</p>
                <p className="text-[10px] lg:text-xs text-gray-500">Innovation Lab</p>
              </div>
            </div>
            <Heart className="w-4 h-4 lg:w-5 lg:h-5 text-purple-400" />
            <div className="flex items-center gap-2 lg:gap-3 text-gray-300">
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-pink-500/20 rounded-lg lg:rounded-xl flex items-center justify-center">
                <Heart className="w-4 h-4 lg:w-5 lg:h-5 text-pink-400" />
              </div>
              <div className="text-left">
                <p className="text-xs lg:text-sm font-semibold text-white">LovohCreate</p>
                <p className="text-[10px] lg:text-xs text-gray-500">Design & Development</p>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonial Carousel - Mobile friendly */}
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 lg:gap-2 mb-4 lg:mb-6 px-3 py-1 lg:px-4 lg:py-1.5 bg-purple-500/10 rounded-full border border-purple-500/20">
            <Clock className="w-3 h-3 lg:w-3.5 lg:h-3.5 text-purple-400" />
            <span className="text-purple-300 text-[10px] lg:text-xs font-medium">Trusted by early users</span>
          </div>
          <div className="relative h-28 lg:h-32 max-w-xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-all duration-500 ${
                  index === activeIndex ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
                }`}
                style={{ transform: index === activeIndex ? 'translateX(0)' : 'translateX(100%)' }}
              >
                <div className="flex flex-col items-center px-4">
                  <img src={testimonial.avatar} alt="" className="w-10 h-10 lg:w-14 lg:h-14 rounded-full mb-2 lg:mb-4 border-2 border-purple-500 shadow-md" />
                  <p className="text-white text-sm lg:text-lg font-medium mb-1 lg:mb-2">"{testimonial.text}"</p>
                  <p className="text-gray-400 text-xs lg:text-sm">
                    {testimonial.name} — <span className="text-purple-400">{testimonial.company}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-1.5 lg:gap-2 mt-4 lg:mt-6">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === activeIndex ? 'bg-purple-500 w-5 lg:w-8' : 'bg-purple-500/30 w-1.5 hover:bg-purple-400/50'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        
        @keyframes floatDelayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(15px); }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: floatDelayed 6s ease-in-out infinite;
          animation-delay: 1.5s;
        }

        /* Mobile scrollbar styling */
        .overflow-y-auto::-webkit-scrollbar {
          width: 3px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-track {
          background: #1a1a1a;
        }
        
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: #7c3aed;
          border-radius: 3px;
        }
      `}</style>
    </section>
  );
};

export default Hero;