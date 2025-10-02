import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbsProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export default function Breadcrumbs({ currentPage, onNavigate }: BreadcrumbsProps) {
  return (
    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
      <button
        onClick={() => onNavigate('Home')}
        className="flex items-center hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
      >
        <Home className="w-4 h-4 mr-1" />
        Home
      </button>
      <ChevronRight className="w-4 h-4" />
      <span className="text-gray-900 dark:text-white font-semibold">{currentPage}</span>
    </div>
  );
}
