import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import Modal from './components/Modal';
import Toast from './components/Toast';
import ScrollProgress from './components/ScrollProgress';
import BackToTop from './components/BackToTop';
import ContextMenu from './components/ContextMenu';
import Breadcrumbs from './components/Breadcrumbs';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Demo from './pages/Demo';

interface ToastData {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

function App() {
  const [currentPage, setCurrentPage] = useState('Home');
  const [darkMode, setDarkMode] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [autoModalShown, setAutoModalShown] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '' });
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!autoModalShown) {
        showModal('Welcome!', 'Thanks for visiting our interactive demo. Explore all the features!');
        setAutoModalShown(true);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [autoModalShown]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && modalOpen) {
        setModalOpen(false);
      }

      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'h':
            e.preventDefault();
            setCurrentPage('Home');
            showToast('Navigated to Home (Ctrl+H)', 'info');
            break;
          case 'a':
            e.preventDefault();
            setCurrentPage('About');
            showToast('Navigated to About (Ctrl+A)', 'info');
            break;
          case 'c':
            e.preventDefault();
            setCurrentPage('Contact');
            showToast('Navigated to Contact (Ctrl+C)', 'info');
            break;
          case 'd':
            e.preventDefault();
            setCurrentPage('Demo');
            showToast('Navigated to Demo (Ctrl+D)', 'info');
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [modalOpen]);

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      setContextMenu({ x: e.clientX, y: e.clientY });
    };

    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    showToast(`${!darkMode ? 'Dark' : 'Light'} mode enabled`, 'success');
  };

  const showModal = (title: string, message: string) => {
    setModalContent({ title, message });
    setModalOpen(true);
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'Home':
        return <Home />;
      case 'About':
        return <About />;
      case 'Contact':
        return <Contact showModal={showModal} showToast={showToast} />;
      case 'Demo':
        return <Demo showModal={showModal} showToast={showToast} />;
      default:
        return <Home />;
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <div className="bg-gray-50 dark:bg-gray-900 transition-colors min-h-screen">
        <Navbar
          currentPage={currentPage}
          onNavigate={handleNavigate}
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
        />
        <ScrollProgress />

        <div className="flex pt-16">
          <Sidebar onNavigate={handleNavigate} />

          <main className="flex-1 p-8">
            <div className="max-w-7xl mx-auto">
              {currentPage !== 'Home' && (
                <Breadcrumbs currentPage={currentPage} onNavigate={handleNavigate} />
              )}
              {renderPage()}
            </div>
          </main>
        </div>

        <Footer />
        <BackToTop />

        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={modalContent.title}
        >
          <p>{modalContent.message}</p>
        </Modal>

        <div className="fixed top-20 right-4 z-50 space-y-2">
          {toasts.map(toast => (
            <Toast
              key={toast.id}
              message={toast.message}
              type={toast.type}
              onClose={() => removeToast(toast.id)}
            />
          ))}
        </div>

        {contextMenu && (
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            onClose={() => setContextMenu(null)}
            showToast={showToast}
          />
        )}

        <div className="fixed bottom-4 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 text-xs text-gray-600 dark:text-gray-400 max-w-xs border border-gray-200 dark:border-gray-700">
          <div className="font-semibold mb-2 text-gray-900 dark:text-white">Keyboard Shortcuts:</div>
          <div className="space-y-1">
            <div><kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Ctrl+H</kbd> Home</div>
            <div><kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Ctrl+A</kbd> About</div>
            <div><kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Ctrl+C</kbd> Contact</div>
            <div><kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Ctrl+D</kbd> Demo</div>
            <div><kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Esc</kbd> Close Modal</div>
            <div><kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Right-Click</kbd> Context Menu</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
