'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PenTool, Image as ImageIcon, Sparkles, AlertCircle } from 'lucide-react';

export default function BlogsPage() {
  const [toast, setToast] = useState(false);

  const handleWritePost = () => {
    setToast(true);
    setTimeout(() => setToast(false), 3000);
  };

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto h-full flex flex-col relative">
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20"
          >
            <AlertCircle size={18} />
            Editor is currently under development. Check back soon!
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white font-outfit mb-2">
            Travel Blogs
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Share your experiences or read stories from other explorers.
          </p>
        </div>
        <button 
          onClick={handleWritePost}
          className="px-5 py-2.5 bg-dark-900 dark:bg-white text-white dark:text-dark-900 rounded-xl font-medium hover:scale-105 transition-transform flex items-center justify-center gap-2 self-start sm:self-auto"
        >
          <PenTool size={18} />
          Write Post
        </button>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-dark-800 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-8 text-center"
      >
        <div className="relative mb-6">
          <div className="w-24 h-24 bg-primary-50 dark:bg-primary-900/20 rounded-full flex items-center justify-center">
            <ImageIcon size={40} className="text-primary-400" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-white dark:bg-dark-800 rounded-full flex items-center justify-center shadow-sm">
            <Sparkles size={16} className="text-yellow-500" />
          </div>
        </div>
        <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200 font-outfit mb-3">Community is Growing</h3>
        <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-8 text-lg">
          The blogging platform is currently under construction. Soon, you will be able to turn your AI itineraries into beautiful interactive stories!
        </p>
      </motion.div>
    </div>
  );
}
