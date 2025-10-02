import { Copy, Share2, Download, Trash2 } from 'lucide-react';

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export default function ContextMenu({ x, y, onClose, showToast }: ContextMenuProps) {
  const handleAction = (action: string) => {
    showToast(`${action} action triggered`, 'info');
    onClose();
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      <div
        className="fixed bg-white dark:bg-gray-800 rounded-lg shadow-xl py-2 min-w-[200px] z-50 animate-fadeIn border border-gray-200 dark:border-gray-700"
        style={{ left: x, top: y }}
      >
        <button
          onClick={() => handleAction('Copy')}
          className="w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-3 text-left"
        >
          <Copy className="w-4 h-4" />
          <span>Copy</span>
        </button>
        <button
          onClick={() => handleAction('Share')}
          className="w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-3 text-left"
        >
          <Share2 className="w-4 h-4" />
          <span>Share</span>
        </button>
        <button
          onClick={() => handleAction('Download')}
          className="w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-3 text-left"
        >
          <Download className="w-4 h-4" />
          <span>Download</span>
        </button>
        <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
        <button
          onClick={() => handleAction('Delete')}
          className="w-full px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 transition-colors flex items-center gap-3 text-left"
        >
          <Trash2 className="w-4 h-4" />
          <span>Delete</span>
        </button>
      </div>
    </>
  );
}
