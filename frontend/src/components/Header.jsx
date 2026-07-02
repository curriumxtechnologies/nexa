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
      <div className="fixed top-0 left-0 right-0 z-50 px-4 pt-4">
        <header
          className={`w-full transition-all duration-300 rounded-2xl ${
            isScrolled
              ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-lg shadow-gray-200/50 dark:shadow-gray-950/50 border border-gray-100/80 dark:border-gray-800/80'
              : 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-gray-100/50 dark:border-gray-800/50'
          }`}
        >
          <div className="px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <a href="/" className="flex items-center group">
                <img 
                  src="/nexa-logo.png" 
                  alt="Nexa Logo" 
                  className="h-8 w-auto object-contain transition-all duration-300 group-hover:scale-105 brightness-0 invert"
                />
              </a>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center space-x-8">
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200 text-sm font-medium relative group"
                  >
                    {link.name}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-600 dark:bg-purple-400 transition-all duration-300 group-hover:w-full"></span>
                  </a>
                ))}
              </nav>

              {/* Desktop Buttons */}
              <div className="hidden md:flex items-center space-x-3">
                <a
                  href="/login"
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200 text-sm font-medium"
                >
                  Sign In
                </a>
                <a
                  href="/register"
                  className="px-5 py-2 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-xl hover:from-purple-700 hover:to-purple-600 transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg shadow-purple-200/50 dark:shadow-purple-900/30 hover:scale-105"
                >
                  Get Started
                </a>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </header>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl pt-24 px-6 md:hidden animate-in slide-in-from-top-5 duration-200">
          <nav className="flex flex-col space-y-2 max-w-sm mx-auto">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all py-3.5 px-4 text-base font-medium rounded-xl border-b border-gray-100 dark:border-gray-800/50"
              >
                {link.name}
              </a>
            ))}
            <div className="pt-4 flex flex-col space-y-3">
              <a
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-center px-4 py-3.5 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors text-base font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                Sign In
              </a>
              <a
                href="/register"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-center px-4 py-3.5 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-xl hover:from-purple-700 hover:to-purple-600 transition-all text-base font-medium shadow-lg shadow-purple-200/50 dark:shadow-purple-900/30"
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