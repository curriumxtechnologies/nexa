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
  CornerDownRight,
  Smartphone,
  Monitor,
  ExternalLink
} from 'lucide-react';

const Contact = () => {
  const [copied, setCopied] = useState(false);
  const [showEmailChoice, setShowEmailChoice] = useState(false);
  const [isCheckingApp, setIsCheckingApp] = useState(false);

  const contactMethods = [
    {
      icon: Mail,
      title: 'Email Support',
      value: 'support@lovohcreate.com',
      description: 'Choose how to open',
      action: '#',
      color: 'purple',
      onClick: () => setShowEmailChoice(true)
    },
    {
      icon: MessageCircle,
      title: 'WhatsApp',
      value: '+234 805 858 6759',
      description: 'Quick responses, 9 AM - 6 PM WAT',
      action: 'https://wa.me/2348058586759',
      color: 'green'
    },
    {
      icon: Phone,
      title: 'Phone Call',
      value: '+234 702 569 3976',
      description: 'For urgent matters',
      action: 'tel:+2347025693976',
      color: 'blue'
    }
  ];

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  // Check if Nexa app is installed (Android)
  const checkNexaAppInstalled = () => {
    return new Promise((resolve) => {
      if (window.Capacitor?.isNativePlatform()) {
        // In Capacitor app, we can check via deep link
        resolve(true);
        return;
      }

      // For web - try to detect if app is installed via intent
      const isAndroid = /android/i.test(navigator.userAgent);
      if (isAndroid) {
        // Try to open Nexa app via intent
        const intentUrl = 'intent://send?email=support@lovohcreate.com#Intent;scheme=nexa;package=com.nexa.app;end';
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = intentUrl;
        document.body.appendChild(iframe);
        
        // If app is installed, it will open. If not, we'll timeout.
        const timeout = setTimeout(() => {
          document.body.removeChild(iframe);
          resolve(false);
        }, 2000);
        
        // If the page loses focus, app was opened
        const handleBlur = () => {
          clearTimeout(timeout);
          document.removeEventListener('blur', handleBlur);
          document.body.removeChild(iframe);
          resolve(true);
        };
        document.addEventListener('blur', handleBlur);
        
        return;
      }
      
      resolve(false);
    });
  };

  const handleEmailChoice = async (choice) => {
    setIsCheckingApp(true);
    setShowEmailChoice(false);

    const email = 'support@lovohcreate.com';
    const subject = 'Support Request';
    const body = 'Hello Nexa Support Team,%0D%0A%0D%0A';

    if (choice === 'nexa') {
      // Try to open in Nexa app
      try {
        const isInstalled = await checkNexaAppInstalled();
        
        if (isInstalled) {
          // Open in Nexa app
          if (window.Capacitor?.isNativePlatform()) {
            // In Capacitor app, use custom URL scheme
            window.location.href = `nexa://compose?to=${email}&subject=${subject}&body=${body}`;
          } else {
            // Web - try intent
            window.location.href = `intent://compose?to=${email}&subject=${subject}&body=${body}#Intent;scheme=nexa;package=com.nexa.app;end`;
          }
        } else {
          // App not installed, fallback to Gmail
          window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
        }
      } catch (error) {
        // Fallback to Gmail
        window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
      }
    } else {
      // Open in Gmail/Webmail
      window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    }

    setIsCheckingApp(false);
  };

  const colorMap = {
    purple: 'from-purple-500 to-purple-600 border-purple-500/20 bg-purple-500/10 hover:border-purple-500/40',
    green: 'from-green-500 to-emerald-600 border-green-500/20 bg-green-500/10 hover:border-green-500/40',
    blue: 'from-blue-500 to-blue-600 border-blue-500/20 bg-blue-500/10 hover:border-blue-500/40'
  };

  return (
    <section id="contact" className="relative py-12 sm:py-16 overflow-hidden bg-[#0a0a0f]">
      {/* Minimal Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-transparent to-blue-900/10"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 border border-purple-500/20 rounded-full px-4 py-1.5 mb-4">
            <span className="text-purple-400 text-[10px] tracking-wider font-light">CONTACT</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-light text-white mb-2">
            Get in Touch
          </h2>
          <p className="text-sm text-gray-400 font-light max-w-md mx-auto">
            We'd love to hear from you
          </p>
        </div>

        {/* Contact Cards */}
        <div className="space-y-3 mb-8">
          {contactMethods.map((method, index) => {
            const Icon = method.icon;
            const colors = colorMap[method.color];
            return (
              <div
                key={index}
                className={`group border ${colors.split(' ')[2]} rounded-2xl p-4 bg-opacity-5 transition-all duration-300 hover:border-opacity-100 cursor-pointer`}
                onClick={method.onClick}
              >
                <div className="flex items-center gap-3">
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${colors.split(' ')[0]} ${colors.split(' ')[1]} flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-light text-white mb-0.5">{method.title}</h3>
                    <div className="flex items-center gap-2">
                      <p className="text-purple-400 text-sm font-light truncate">{method.value}</p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(method.value);
                        }}
                        className="p-1 hover:bg-white/5 rounded transition flex-shrink-0"
                      >
                        {copied ? (
                          <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                        ) : (
                          <CornerDownRight className="w-3.5 h-3.5 text-gray-500" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 font-light">{method.description}</p>
                  </div>
                  
                  {/* Action Button */}
                  <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center flex-shrink-0 hover:border-white/20 hover:bg-white/5 transition">
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Email Choice Modal */}
        {showEmailChoice && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
            <div className="bg-[#12121a] border border-white/5 rounded-3xl max-w-md w-full p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-xl font-light text-white mb-2">Open Email</h3>
                <p className="text-sm text-gray-400 font-light">Choose how you'd like to send your email</p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => handleEmailChoice('nexa')}
                  className="w-full flex items-center gap-4 p-4 border border-purple-500/20 rounded-2xl hover:border-purple-500/40 hover:bg-purple-500/5 transition group"
                >
                  <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                    <Smartphone className="w-6 h-6 text-purple-400" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-white">Nexa App</p>
                    <p className="text-xs text-gray-400">Open in Nexa if installed</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-purple-400 transition" />
                </button>

                <button
                  onClick={() => handleEmailChoice('gmail')}
                  className="w-full flex items-center gap-4 p-4 border border-white/10 rounded-2xl hover:border-white/20 hover:bg-white/5 transition group"
                >
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                    <Monitor className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-white">Gmail / Webmail</p>
                    <p className="text-xs text-gray-400">Open in your default email client</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-blue-400 transition" />
                </button>
              </div>

              <button
                onClick={() => setShowEmailChoice(false)}
                className="w-full mt-4 text-sm text-gray-500 hover:text-gray-300 transition font-light py-2"
              >
                Cancel
              </button>

              {isCheckingApp && (
                <div className="mt-4 text-center">
                  <div className="inline-flex items-center gap-2 text-xs text-purple-400">
                    <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                    <span>Checking for Nexa app...</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-white/5 my-8"></div>

        {/* Two Column */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          {/* Office Hours */}
          <div className="border border-white/5 rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-4 h-4 text-purple-400" />
              <h4 className="text-sm font-light text-white">Office Hours</h4>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500 font-light">Monday - Friday</span>
                <span className="text-white font-light">9:00 AM - 6:00 PM</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500 font-light">Saturday</span>
                <span className="text-white font-light">10:00 AM - 4:00 PM</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500 font-light">Sunday</span>
                <span className="text-gray-600 font-light">Closed</span>
              </div>
            </div>
          </div>

          {/* Parent Company */}
          <div className="border border-white/5 rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-4">
              <Globe className="w-4 h-4 text-purple-400" />
              <h4 className="text-sm font-light text-white">Parent Company</h4>
            </div>
            <div className="space-y-2 text-xs text-gray-400 font-light">
              <div className="flex items-center gap-2">
                <span className="text-white">Lovoh Create</span>
                <span className="text-gray-600">|</span>
                <a href="https://lovohcreate.com" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 transition">
                  lovohcreate.com
                </a>
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <span>Sub-brands:</span>
                <span>biizzed.lovohcreate.com</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <span>eventroom.lovohcreate.com</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <span>uduua.lovohcreate.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <div className="inline-flex flex-col sm:flex-row items-center gap-3 border border-white/5 rounded-2xl p-2 bg-white/5">
            <button
              onClick={() => setShowEmailChoice(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition text-sm font-light tracking-wider"
            >
              <Send className="w-4 h-4" />
              Email Us
            </button>
            <a
              href="https://wa.me/2348058586759"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-gray-400 hover:text-white transition text-sm font-light"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center gap-2 text-[10px] text-gray-600 font-light">
            <Heart className="w-3 h-3 text-purple-400" />
            <span>Lovoh Create</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;