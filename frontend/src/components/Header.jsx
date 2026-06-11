// components/Header.jsx
import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Features', href: '#features' },
    { name: 'Benefits', href: '#benefits' },
    { name: 'About', href: '#about' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 px-4">
        <header
          className={`w-full transition-all duration-300 rounded-b-2xl ${
            isScrolled
              ? 'bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-100'
              : 'bg-white/70 backdrop-blur-sm border-b border-gray-100/50'
          }`}
        >
          <div className="px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              {/* Logo - image only */}
              <a href="/" className="flex items-center">
                <img 
                  src="/nexa-logo.png" 
                  alt="Nexa Logo" 
                  className="w-10 h-10 sm:w-11 sm:h-11 object-contain"
                />
              </a>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center space-x-8">
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    className="text-gray-600 hover:text-purple-600 transition-colors duration-200 text-sm font-medium"
                  >
                    {link.name}
                  </a>
                ))}
              </nav>

              {/* Desktop Buttons */}
              <div className="hidden md:flex items-center space-x-3">
                <a
                  href="/login"
                  className="px-4 py-2 text-gray-600 hover:text-purple-600 transition-colors duration-200 text-sm font-medium"
                >
                  Sign In
                </a>
                <a
                  href="/register"
                  className="px-5 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg"
                >
                  Get Started
                </a>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </header>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-white/95 backdrop-blur-md pt-20 px-4 md:hidden animate-in slide-in-from-top-5 duration-200">
          <nav className="flex flex-col space-y-4">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-600 hover:text-purple-600 transition-colors py-3 text-base font-medium border-b border-gray-100"
              >
                {link.name}
              </a>
            ))}
            <div className="pt-4 flex flex-col space-y-3">
              <a
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-center px-4 py-3 text-gray-600 hover:text-purple-600 transition-colors text-base font-medium"
              >
                Sign In
              </a>
              <a
                href="/register"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-center px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all text-base font-medium"
              >
                Get Started
              </a>
            </div>
          </nav>
        </div>
      )}
    </>
  );
};

export default Header;