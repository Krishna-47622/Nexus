import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ArrowUp } from 'lucide-react';

export const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  const [visible, setVisible] = useState(false);

  // Smooth scroll to top on route change
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
  }, [pathname]);

  // Track scroll position to show floating button
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 280) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
  };

  return (
    <button
      onClick={scrollToTop}
      aria-label="Scroll to top"
      className={`fixed bottom-6 right-6 z-40 p-2.5 rounded-full bg-zinc-900/90 dark:bg-zinc-100/90 text-white dark:text-zinc-900 shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 backdrop-blur-sm transition-all duration-300 ease-out flex items-center justify-center border border-zinc-700/20 dark:border-zinc-300/20 ${
        visible ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
    >
      <ArrowUp className="w-4 h-4" />
    </button>
  );
};
