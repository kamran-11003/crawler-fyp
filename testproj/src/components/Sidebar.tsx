import { useState } from 'react';
import { ChevronRight, Home, Info, Mail, TestTube, Settings, HelpCircle } from 'lucide-react';

interface SidebarProps {
  onNavigate: (page: string) => void;
}

export default function Sidebar({ onNavigate }: SidebarProps) {
  const [sectionsOpen, setSectionsOpen] = useState({
    navigation: true,
    settings: false,
    help: false,
  });

  const toggleSection = (section: keyof typeof sectionsOpen) => {
    setSectionsOpen(prev => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 h-screen sticky top-16 overflow-y-auto">
      <div className="p-4">
        <div className="mb-4">
          <button
            onClick={() => toggleSection('navigation')}
            className="flex items-center justify-between w-full p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <span className="font-semibold text-gray-700 dark:text-gray-300">Navigation</span>
            <ChevronRight className={`w-5 h-5 transition-transform ${sectionsOpen.navigation ? 'rotate-90' : ''}`} />
          </button>
          {sectionsOpen.navigation && (
            <div className="mt-2 space-y-1 animate-fadeIn">
              <button
                onClick={() => onNavigate('Home')}
                className="flex items-center gap-3 w-full p-2 pl-6 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-left"
              >
                <Home className="w-4 h-4" />
                <span>Home</span>
              </button>
              <button
                onClick={() => onNavigate('About')}
                className="flex items-center gap-3 w-full p-2 pl-6 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-left"
              >
                <Info className="w-4 h-4" />
                <span>About</span>
              </button>
              <button
                onClick={() => onNavigate('Contact')}
                className="flex items-center gap-3 w-full p-2 pl-6 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-left"
              >
                <Mail className="w-4 h-4" />
                <span>Contact</span>
              </button>
              <button
                onClick={() => onNavigate('Demo')}
                className="flex items-center gap-3 w-full p-2 pl-6 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-left"
              >
                <TestTube className="w-4 h-4" />
                <span>Demo</span>
              </button>
            </div>
          )}
        </div>

        <div className="mb-4">
          <button
            onClick={() => toggleSection('settings')}
            className="flex items-center justify-between w-full p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <span className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Settings
            </span>
            <ChevronRight className={`w-5 h-5 transition-transform ${sectionsOpen.settings ? 'rotate-90' : ''}`} />
          </button>
          {sectionsOpen.settings && (
            <div className="mt-2 space-y-1 animate-fadeIn">
              <div className="p-2 pl-6 text-gray-600 dark:text-gray-400 text-sm">Preferences</div>
              <div className="p-2 pl-6 text-gray-600 dark:text-gray-400 text-sm">Account</div>
              <div className="p-2 pl-6 text-gray-600 dark:text-gray-400 text-sm">Privacy</div>
            </div>
          )}
        </div>

        <div className="mb-4">
          <button
            onClick={() => toggleSection('help')}
            className="flex items-center justify-between w-full p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <span className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <HelpCircle className="w-5 h-5" />
              Help
            </span>
            <ChevronRight className={`w-5 h-5 transition-transform ${sectionsOpen.help ? 'rotate-90' : ''}`} />
          </button>
          {sectionsOpen.help && (
            <div className="mt-2 space-y-1 animate-fadeIn">
              <div className="p-2 pl-6 text-gray-600 dark:text-gray-400 text-sm">Documentation</div>
              <div className="p-2 pl-6 text-gray-600 dark:text-gray-400 text-sm">Support</div>
              <div className="p-2 pl-6 text-gray-600 dark:text-gray-400 text-sm">FAQ</div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
