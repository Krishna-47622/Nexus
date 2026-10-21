import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Search,
  Utensils,
  Dumbbell,
  Printer,
  FileText,
  Home,
  User as UserIcon,
  Moon,
  Sun,
  LogOut,
  Bell,
  ArrowRight,
  Sparkles,
  Command,
  X
} from 'lucide-react';

interface PaletteItem {
  id: string;
  title: string;
  category: string;
  icon: React.FC<{ className?: string }>;
  action: () => void;
  keywords?: string[];
}

export const CommandPalette: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Global key listener for Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const items: PaletteItem[] = [
    {
      id: 'home',
      title: 'Student Dashboard',
      category: 'Navigation',
      icon: Home,
      action: () => navigate('/app/home'),
      keywords: ['home', 'dashboard', 'overview'],
    },
    {
      id: 'canteen',
      title: 'Order Food (MR Food Court - 1)',
      category: 'Dining',
      icon: Utensils,
      action: () => navigate('/app/canteen'),
      keywords: ['food', 'canteen', 'biryani', 'meal', 'lunch', 'dinner', 'snacks'],
    },
    {
      id: 'cart',
      title: 'View Dining Cart & Checkout',
      category: 'Dining',
      icon: Utensils,
      action: () => navigate('/app/canteen/cart'),
      keywords: ['cart', 'pay', 'checkout', 'isthara'],
    },
    {
      id: 'canteen-orders',
      title: 'Active Food Orders & Live Tokens',
      category: 'Dining',
      icon: Utensils,
      action: () => navigate('/app/canteen/orders'),
      keywords: ['orders', 'token', 'pickup', 'food orders'],
    },
    {
      id: 'sports',
      title: 'Sports Gear & Inventory',
      category: 'Sports',
      icon: Dumbbell,
      action: () => navigate('/app/sports'),
      keywords: ['sports', 'badminton', 'football', 'basketball', 'cricket', 'equipment'],
    },
    {
      id: 'my-borrows',
      title: 'My Borrowed Sports Equipment',
      category: 'Sports',
      icon: Dumbbell,
      action: () => navigate('/app/sports/my-borrows'),
      keywords: ['borrows', 'sports return', 'overdue'],
    },
    {
      id: 'print-new',
      title: 'Digital Reprographics & PDF Upload',
      category: 'Print Shop',
      icon: Printer,
      action: () => navigate('/app/print/new'),
      keywords: ['print', 'upload', 'pdf', 'a4', 'color', 'binding', 'xerox'],
    },
    {
      id: 'print-jobs',
      title: 'Print Job Queue & Status',
      category: 'Print Shop',
      icon: Printer,
      action: () => navigate('/app/print/jobs'),
      keywords: ['print status', 'queue', 'documents'],
    },
    {
      id: 'leave',
      title: 'Submit Hostel Leave Letter',
      category: 'Residence',
      icon: FileText,
      action: () => navigate('/app/leave/new'),
      keywords: ['leave', 'hostel', 'warden', 'permission'],
    },
    {
      id: 'outpass',
      title: 'Request Emergency Outpass',
      category: 'Residence',
      icon: FileText,
      action: () => navigate('/app/outpass/new'),
      keywords: ['outpass', 'gate pass', 'emergency', 'outing'],
    },
    {
      id: 'requests',
      title: 'All Leave & Outpass Records',
      category: 'Residence',
      icon: FileText,
      action: () => navigate('/app/requests'),
      keywords: ['requests status', 'approval'],
    },
    {
      id: 'profile',
      title: 'Student Profile & Details',
      category: 'Account',
      icon: UserIcon,
      action: () => navigate('/app/profile'),
      keywords: ['profile', 'account', 'roll number'],
    },
    {
      id: 'notifications',
      title: 'Notifications & Alerts',
      category: 'Account',
      icon: Bell,
      action: () => navigate('/app/notifications'),
      keywords: ['notifications', 'alerts', 'updates'],
    },
    {
      id: 'theme',
      title: `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`,
      category: 'Preferences',
      icon: theme === 'dark' ? Sun : Moon,
      action: () => toggleTheme(),
      keywords: ['theme', 'dark', 'light', 'mode'],
    },
    {
      id: 'logout',
      title: 'Sign Out',
      category: 'Account',
      icon: LogOut,
      action: () => logout(),
      keywords: ['logout', 'signout', 'exit'],
    },
  ];

  const filteredItems = items.filter((item) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    const titleMatch = item.title.toLowerCase().includes(q);
    const categoryMatch = item.category.toLowerCase().includes(q);
    const keywordMatch = item.keywords?.some((k) => k.toLowerCase().includes(q));
    return titleMatch || categoryMatch || keywordMatch;
  });

  const handleSelect = (item: PaletteItem) => {
    setIsOpen(false);
    item.action();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filteredItems.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + (filteredItems.length || 1)) % (filteredItems.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        handleSelect(filteredItems[selectedIndex]);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-zinc-950/50 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-zinc-200 dark:border-zinc-800">
          <Search className="w-5 h-5 text-zinc-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a service, food, sports, or command..."
            className="flex-1 bg-transparent text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold text-zinc-400 bg-zinc-100 dark:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-700">
            ESC
          </kbd>
          <button
            onClick={() => setIsOpen(false)}
            className="sm:hidden text-zinc-400 hover:text-zinc-600 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-xs text-zinc-400">
              No matching campus utilities found for "{query}".
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs transition-colors ${
                    isSelected
                      ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                        isSelected
                          ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span>{item.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-400 font-medium">
                      {item.category}
                    </span>
                    {isSelected && <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900/80 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400">
          <span>Navigate with <kbd className="font-semibold">↑</kbd> <kbd className="font-semibold">↓</kbd></span>
          <span>Press <kbd className="font-semibold">Enter</kbd> to open</span>
        </div>
      </div>
    </div>
  );
};
