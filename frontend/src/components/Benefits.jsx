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
  Rocket
} from 'lucide-react';

const Benefits = () => {
  const benefits = [
    {
      icon: Infinity,
      title: '100% Free',
      description: 'No hidden fees. Enjoy all features without worrying about subscription costs.',
      color: 'from-green-500 to-emerald-600',
      image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&h=300&fit=crop',
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Invite team members with custom roles. Work together seamlessly.',
      color: 'from-purple-500 to-purple-600',
      image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=300&fit=crop',
    },
    {
      icon: Globe,
      title: 'Custom Domains',
      description: 'Use your own domain names for professional email addresses.',
      color: 'from-blue-500 to-blue-600',
      image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=300&fit=crop',
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: '2FA, encryption, and advanced security features to protect your data.',
      color: 'from-indigo-500 to-indigo-600',
      image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400&h=300&fit=crop',
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Real-time email delivery and instant notifications.',
      color: 'from-yellow-500 to-orange-600',
      image: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=400&h=300&fit=crop',
    },
    {
      icon: Smartphone,
      title: 'Mobile Ready',
      description: 'Full mobile support with push notifications. Stay connected on the go.',
      color: 'from-teal-500 to-teal-600',
      image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=300&fit=crop',
    },
    {
      icon: Mail,
      title: 'Custom Email Addresses',
      description: 'Create custom email addresses like support@, hello@, contact@yourdomain.com.',
      color: 'from-pink-500 to-pink-600',
      image: 'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=400&h=300&fit=crop',
    },
    {
      icon: Headphones,
      title: 'Free Support',
      description: 'Email support included. We are here to help you.',
      color: 'from-cyan-500 to-cyan-600',
      image: 'https://images.unsplash.com/photo-1541746972996-4e0b0f43e02a?w=400&h=300&fit=crop',
    }
  ];

  return (
    <section id="benefits" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-purple-100 rounded-full px-4 py-1.5 mb-4">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span className="text-purple-700 text-sm font-medium">Why Choose Nexa</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need
            <span className="text-purple-600"> Completely Free</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Powerful features that make email management simple, secure, and efficient for teams of all sizes.
          </p>
        </div>

        {/* Benefits Grid - 2 columns on mobile, 4 on desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div 
                key={index} 
                className="group bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                {/* Image */}
                <div className="relative h-28 sm:h-32 md:h-36 overflow-hidden">
                  <img 
                    src={benefit.image} 
                    alt={benefit.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${benefit.color} opacity-60`}></div>
                </div>
                
                {/* Content */}
                <div className="p-3 sm:p-4">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r ${benefit.color} rounded-lg flex items-center justify-center mb-2 sm:mb-3 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-1">{benefit.title}</h3>
                  <p className="text-gray-500 text-[11px] sm:text-xs leading-relaxed">{benefit.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Trust Badge */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 bg-green-50 rounded-full px-3 py-1.5 sm:px-4 sm:py-2">
            <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600" />
            <span className="text-green-700 text-xs sm:text-sm font-medium">
              No credit card required — Start for free
            </span>
          </div>
        </div>

        {/* Simple CTA */}
        <div className="mt-8 sm:mt-12 text-center">
          <a
            href="/register"
            className="inline-flex items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition font-semibold shadow-lg text-sm sm:text-base"
          >
            Create Free Account
            <Rocket className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default Benefits;