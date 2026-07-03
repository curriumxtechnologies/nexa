// components/About.jsx
import React from 'react';
import { 
  Heart, 
  Code, 
  Zap, 
  Globe, 
  Users, 
  Shield,
  ArrowRight,
  Quote,
  Star,
  Mail,
  Sparkles,
  Rocket,
  Building2,
  Briefcase,
  Crown
} from 'lucide-react';

const About = () => {
  const teamMembers = [
    {
      name: 'Embee Sunday',
      role: 'Director, Lovoh Create',
      description: 'Visionary leadership & brand strategy',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop',
      color: 'purple'
    },
    {
      name: 'Njoku Samuel',
      role: 'Systems Manager, Nexa',
      description: 'Technical architecture & system design',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
      color: 'blue'
    },
    {
      name: 'Joshua Sorochi',
      role: 'Lead Developer, Nexa',
      description: 'Full-stack development & performance optimization',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop',
      color: 'green'
    },
    {
      name: 'Lovoh Create',
      role: 'Parent Company',
      description: 'Innovation & Design Hub',
      image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=200&h=200&fit=crop',
      color: 'pink'
    }
  ];

  const values = [
    {
      icon: Zap,
      title: 'Speed',
      description: 'Lightning fast email delivery and real-time notifications',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      icon: Shield,
      title: 'Security',
      description: 'Enterprise-grade encryption and privacy protection',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Users,
      title: 'Simplicity',
      description: 'Intuitive interface designed for everyone',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Globe,
      title: 'Accessibility',
      description: 'Available everywhere, on every device',
      color: 'from-blue-500 to-cyan-500'
    }
  ];

  // Duplicate values for infinite scroll effect
  const scrollingValues = [...values, ...values, ...values];

  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-purple-100 rounded-full px-4 py-1.5 mb-4">
            <Heart className="w-4 h-4 text-purple-600" />
            <span className="text-purple-700 text-sm font-medium">Our Story</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Built with{' '}
            <span className="text-purple-600">Passion</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Nexa was born from the need for simple, powerful email management that doesn't break the bank.
            We believe professional email should be accessible to everyone.
          </p>
        </div>

        {/* Main Story Section - Split layout with image */}
        <div className="flex flex-col lg:flex-row items-center gap-12 mb-20">
          <div className="lg:w-1/2">
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=600&fit=crop"
                alt="Team working together"
                className="rounded-2xl shadow-xl w-full object-cover"
              />
              <div className="absolute -bottom-6 -right-6 bg-purple-600 rounded-2xl p-4 shadow-lg hidden lg:block">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                    <Mail className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-lg">Start Free</p>
                    <p className="text-purple-200 text-sm">No credit card required</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:w-1/2">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
            <p className="text-gray-600 leading-relaxed mb-6">
              To democratize professional email management by providing a powerful, intuitive platform. 
              Start with our free tier today — no credit card required. We're committed to keeping 
              essential features accessible while sustainably growing the platform.
            </p>
            
            {/* Company Structure */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-semibold text-gray-700">Company</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Crown className="w-3.5 h-3.5 text-purple-500" />
                  <span className="text-gray-600">Parent Company:</span>
                  <span className="font-medium text-gray-800">Lovoh Create</span>
                </div>
                <div className="flex items-center gap-2 pl-5">
                  <span className="text-gray-600">—</span>
                  <span className="text-gray-600">Nexa is a product of</span>
                  <span className="font-medium text-gray-800">Lovoh Create</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
              <div className="flex -space-x-2">
                <div className="w-10 h-10 bg-purple-100 rounded-full border-2 border-white flex items-center justify-center">
                  <span className="text-xs font-bold text-purple-600">ES</span>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-full border-2 border-white flex items-center justify-center">
                  <span className="text-xs font-bold text-blue-600">NS</span>
                </div>
                <div className="w-10 h-10 bg-pink-100 rounded-full border-2 border-white flex items-center justify-center">
                  <span className="text-xs font-bold text-pink-600">LC</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Lovoh Create</p>
                <p className="text-xs text-gray-500">Innovation & Design Hub</p>
              </div>
            </div>
          </div>
        </div>

        {/* Values Section - Horizontal scroll on mobile, grid on desktop */}
        <div className="mb-20">
          <div className="text-center mb-10">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Our Values</h3>
            <p className="text-gray-500">What drives us every day</p>
          </div>
          
          {/* Mobile: Horizontal Scrolling */}
          <div className="lg:hidden overflow-x-auto scrollbar-hide pb-4">
            <div className="flex gap-4 animate-scroll">
              {scrollingValues.map((value, index) => {
                const Icon = value.icon;
                return (
                  <div key={index} className="flex-shrink-0 w-64 text-center p-4 bg-gray-50 rounded-xl">
                    <div className={`w-14 h-14 bg-gradient-to-r ${value.color} rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h4 className="text-base font-semibold text-gray-900 mb-1">{value.title}</h4>
                    <p className="text-gray-500 text-xs">{value.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Desktop: Grid Layout */}
          <div className="hidden lg:grid lg:grid-cols-4 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div key={index} className="text-center group">
                  <div className={`w-16 h-16 bg-gradient-to-r ${value.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">{value.title}</h4>
                  <p className="text-gray-500 text-sm">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-20">
          <div className="text-center mb-10">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">The Team</h3>
            <p className="text-gray-500">Passionate people behind Nexa</p>
          </div>
          <div className="flex flex-wrap justify-center gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="text-center w-48">
                <div className="relative mb-3">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-purple-100 shadow-md"
                  />
                  <div className={`absolute bottom-0 right-8 w-6 h-6 bg-${member.color}-500 rounded-full border-2 border-white`}></div>
                </div>
                <h4 className="font-semibold text-gray-900">{member.name}</h4>
                <p className="text-xs text-purple-600 font-medium mb-1">{member.role}</p>
                <p className="text-xs text-gray-500">{member.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats/Impact Section - Honest */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-3xl p-8 mb-16">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Rocket className="w-6 h-6 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">Launched</p>
              <p className="text-sm text-gray-500">2026</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Heart className="w-6 h-6 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">Free Tier</p>
              <p className="text-sm text-gray-500">Get started today</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Globe className="w-6 h-6 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">Global</p>
              <p className="text-sm text-gray-500">Accessible worldwide</p>
            </div>
          </div>
        </div>

        {/* Quote Section */}
        <div className="text-center max-w-3xl mx-auto">
          <Quote className="w-10 h-10 text-purple-300 mx-auto mb-4" />
          <p className="text-xl text-gray-600 italic mb-6">
            "We built Nexa because we believe email should be simple and powerful. 
            Start free today — no strings attached. As we grow, we'll always keep 
            essential features accessible to everyone."
          </p>
          <p className="font-semibold text-gray-900">— Embee Sunday, Director of Lovoh Create</p>
          <p className="text-sm text-gray-500 mt-1">Systems Management by Njoku Samuel</p>
          <div className="flex items-center justify-center gap-1 mt-4">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center border-t border-gray-100 pt-8">
          <p className="text-sm text-gray-500">
            <span className="font-medium text-gray-700">Nexa</span> is a product of{' '}
            <span className="font-medium text-purple-600">Lovoh Create</span>
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Built with ❤️ by Njoku Samuel
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.33%);
          }
        }
        
        .animate-scroll {
          animation: scroll 20s linear infinite;
          width: fit-content;
        }
        
        .animate-scroll:hover {
          animation-play-state: paused;
        }
        
        /* Hide scrollbar for Chrome, Safari and Opera */
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        /* Hide scrollbar for IE, Edge and Firefox */
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
};

export default About;