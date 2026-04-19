'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function TopLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // When pathname or searchParams change, we consider the transition finished
    setLoading(false);
  }, [pathname, searchParams]);

  // We hook into clicks on links to start the loader
  useEffect(() => {
    const handleAnchorClick = (event) => {
      const target = event.target.closest('a');
      if (
        target && 
        target.href && 
        target.href.startsWith(window.location.origin) &&
        !target.href.includes('#') &&
        target.target !== '_blank'
      ) {
        // Only start loader if it's a different URL
        if (target.href !== window.location.href) {
          setLoading(true);
        }
      }
    };

    document.addEventListener('click', handleAnchorClick);
    return () => document.removeEventListener('click', handleAnchorClick);
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ width: '0%', opacity: 1 }}
          animate={{ width: '70%' }}
          exit={{ width: '100%', opacity: 0 }}
          transition={{ 
            width: { duration: 10, ease: "easeOut" },
            opacity: { duration: 0.3 }
          }}
          className="fixed top-0 left-0 h-1 bg-gradient-to-r from-primary-500 via-blue-500 to-primary-400 z-[10000] shadow-[0_0_10px_rgba(20,184,166,0.5)]"
        />
      )}
    </AnimatePresence>
  );
}
