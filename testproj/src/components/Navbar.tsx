import { useState, useEffect } from 'react';
import { Menu, X, ChevronDown, Moon, Sun } from 'lucide-react';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export default function Navbar({ currentPage, onNavigate, darkMode, toggleDarkMode }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const pages = ['Home', 'About', 'Contact', 'Demo'];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled
        ? 'bg-white dark:bg-gray-900 shadow-lg py-2'
        : 'bg-white/95 dark:bg-gray-900/95 py-4'
    }`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400 cursor-pointer hover:scale-105 transition-transform"
                onClick={() => onNavigate('Home')}>
              InteractUI
            </h1>

            <div className="hidden md:flex space-x-6">
              {pages.map((page) => (
                <button
                  key={page}
                  onClick={() => onNavigate(page)}
                  className={`px-3 py-2 rounded-md transition-all duration-200 ${
                    currentPage === page
                      ? 'text-blue-600 dark:text-blue-400 font-semibold'
                      : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                  }`}
                >
                  {page}
                </button>
              ))}

              <div className="relative group">
                <button
                  className="px-3 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1 transition-colors"
                  onMouseEnter={() => setServicesOpen(true)}
                  onMouseLeave={() => setServicesOpen(false)}
                >
                  Services
                  <ChevronDown className={`w-4 h-4 transition-transform ${servicesOpen ? 'rotate-180' : ''}`} />
                </button>

                {servicesOpen && (
                  <div
                    className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-xl py-2 opacity-100 animate-fadeIn"
                    onMouseEnter={() => setServicesOpen(true)}
                    onMouseLeave={() => setServicesOpen(false)}
                  >
                    <div className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors group/item">
                      <div className="font-medium text-gray-800 dark:text-gray-200">Web Development</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Build modern websites</div>
                    </div>
                    <div className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                      <div className="font-medium text-gray-800 dark:text-gray-200">UI/UX Design</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Beautiful interfaces</div>
                    </div>
                    <div className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                      <div className="font-medium text-gray-800 dark:text-gray-200">Consulting</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Expert guidance</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-700" />}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 animate-slideDown">
            {pages.map((page) => (
              <button
                key={page}
                onClick={() => {
                  onNavigate(page);
                  setMobileMenuOpen(false);
                }}
                className={`block w-full text-left px-4 py-3 rounded-md transition-colors ${
                  currentPage === page
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 font-semibold'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {page}
              </button>
            ))}
            <div className="px-4 py-3 text-gray-700 dark:text-gray-300 font-medium">Services</div>
            <div className="pl-8 space-y-2">
              <div className="text-gray-600 dark:text-gray-400 py-2">Web Development</div>
              <div className="text-gray-600 dark:text-gray-400 py-2">UI/UX Design</div>
              <div className="text-gray-600 dark:text-gray-400 py-2">Consulting</div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
