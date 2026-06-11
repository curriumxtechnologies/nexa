// components/Contact.jsx
import React from 'react';
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
  Sparkles
} from 'lucide-react';

const Contact = () => {
  const contactMethods = [
    {
      icon: Mail,
      title: 'Email Support',
      value: 'support@curriumx.online',
      description: 'We usually respond within 24 hours',
      action: 'mailto:support@curriumx.online',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: MessageCircle,
      title: 'WhatsApp',
      value: '+234 805 858 6759',
      description: 'Quick responses, 9 AM - 6 PM',
      action: 'https://wa.me/2348058586759',
      color: 'from-green-500 to-emerald-600'
    },
    {
      icon: Phone,
      title: 'Phone Call',
      value: '+234 702 569 3976',
      description: 'For urgent matters',
      action: 'tel:+2347025693976',
      color: 'from-blue-500 to-blue-600'
    }
  ];

  const hours = [
    { day: 'Monday - Friday', hours: '9:00 AM - 6:00 PM' },
    { day: 'Saturday', hours: '10:00 AM - 4:00 PM' },
    { day: 'Sunday', hours: 'Closed' }
  ];

  return (
    <section id="contact" className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-purple-100 rounded-full px-4 py-1.5 mb-4">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span className="text-purple-700 text-sm font-medium">Get in Touch</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            We'd Love to 
            <span className="text-purple-600"> Hear From You</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Have questions, feedback, or need assistance? Reach out to us through any of these channels.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          
          {/* Left Side - Contact Methods */}
          <div className="space-y-6">
            {contactMethods.map((method, index) => {
              const Icon = method.icon;
              return (
                <a
                  key={index}
                  href={method.action}
                  target={method.icon === Mail ? '_self' : '_blank'}
                  rel={method.icon === Mail ? '' : 'noopener noreferrer'}
                  className="block group"
                >
                  <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-start gap-5">
                      <div className={`w-14 h-14 bg-gradient-to-r ${method.color} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{method.title}</h3>
                        <p className="text-purple-600 font-medium mb-2">{method.value}</p>
                        <p className="text-sm text-gray-500">{method.description}</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-purple-500 transition-colors flex-shrink-0" />
                    </div>
                  </div>
                </a>
              );
            })}

            {/* Office Hours */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Office Hours</h3>
              </div>
              <div className="space-y-2">
                {hours.map((slot, index) => (
                  <div key={index} className="flex justify-between py-2 border-b border-gray-50 last:border-0">
                    <span className="text-gray-600 text-sm">{slot.day}</span>
                    <span className="text-gray-900 font-medium text-sm">{slot.hours}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side - Visual / Map / Illustration */}
          <div className="relative">
            <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-3xl p-8 text-white relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full blur-3xl"></div>
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-purple-200">We're here to help</p>
                    <p className="text-xl font-bold">Customer Support</p>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-sm">Fast response time</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-sm">Dedicated support team</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-sm">Free for all users</p>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/20">
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-purple-200" />
                    <div>
                      <p className="text-xs text-purple-200">Developed by</p>
                      <p className="font-semibold">CurriumX Innovation Lab</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-purple-200 rounded-full blur-2xl -z-10"></div>
            <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-indigo-200 rounded-full blur-2xl -z-10"></div>
          </div>
        </div>

        {/* Quick Response Note */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 bg-green-50 rounded-full px-4 py-2">
            <Send className="w-4 h-4 text-green-600" />
            <span className="text-green-700 text-sm font-medium">
              We typically respond within 24 hours
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;