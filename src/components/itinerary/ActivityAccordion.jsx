'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, MapPin, DollarSign } from 'lucide-react';

export default function ActivityAccordion({ activity }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm group overflow-hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="text-xs font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 px-2.5 py-1 rounded-md whitespace-nowrap shrink-0">
            {activity.time}
          </span>
          <h4 className="font-semibold text-slate-800 dark:text-slate-200 truncate">{activity.title}</h4>
        </div>
        
        <div className="flex items-center gap-4 shrink-0">
          {activity.cost && (
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded-md whitespace-nowrap shrink-0 group-hover:border-primary-200 dark:group-hover:border-primary-800 transition-colors">
              {activity.cost}
            </span>
          )}
          <div className={`p-1 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
            <ChevronDown size={14} />
          </div>
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="p-5 pt-0 border-t border-slate-100 dark:border-slate-800/50 mt-1">
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed pt-4">
                {activity.description}
              </p>
              
              {/* Optional extended breakdown area if the AI provides more details later */}
              <div className="mt-4 flex items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-500">
                {activity.cost && (
                  <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-dark-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                    <DollarSign size={14} className="text-primary-500" /> Estimated: {activity.cost}
                  </span>
                )}
                <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-dark-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                  <MapPin size={14} className="text-primary-500" /> {activity.title}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
