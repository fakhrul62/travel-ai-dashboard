'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Calendar, Clock, Banknote, Users, Sparkles, X, Trash2, AlertCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function MyPlansPage() {
  const queryClient = useQueryClient();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['savedPlans'],
    queryFn: async () => {
      const res = await fetch('/api/travel-plans');
      if (!res.ok) throw new Error('Failed to fetch plans');
      return res.json();
    }
  });

  const handleDelete = async (e, id) => {
    e.stopPropagation(); // prevent opening the modal
    if (!confirm('Are you sure you want to delete this travel plan?')) return;
    
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/travel-plans/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      
      queryClient.invalidateQueries({ queryKey: ['savedPlans'] });
      if (selectedPlan && selectedPlan._id === id) {
        setSelectedPlan(null);
      }
    } catch (err) {
      alert('Error deleting plan: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', bounce: 0.4 } }
  };

  if (isLoading) {
    return (
      <div className="p-6 lg:p-10 max-w-7xl mx-auto h-full flex flex-col justify-center items-center">
        <Sparkles className="animate-pulse text-primary-500 mb-4" size={32} />
        <p className="text-slate-500 font-medium">Loading your saved adventures...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 lg:p-10 max-w-7xl mx-auto">
        <div className="bg-red-50 text-red-500 p-4 rounded-xl border border-red-100 flex items-center gap-2">
          <AlertCircle size={20} />
          Failed to load plans. Please try refreshing.
        </div>
      </div>
    );
  }

  const plans = data?.plans || [];

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto relative h-full">
      {/* Detail Modal Overlay */}
      <AnimatePresence>
        {selectedPlan && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPlan(null)}
              className="fixed inset-0 bg-dark-900/60 z-50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              className="fixed inset-y-0 right-0 w-full max-w-2xl bg-white dark:bg-dark-800 z-50 shadow-2xl flex flex-col overflow-hidden border-l border-slate-200 dark:border-slate-700"
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-dark-800/80 backdrop-blur-md absolute top-0 w-full z-10">
                <h2 className="text-xl font-bold font-outfit text-slate-900 dark:text-white truncate pr-4">
                  {selectedPlan.planDetails?.title || selectedPlan.destination}
                </h2>
                <button 
                  onClick={() => setSelectedPlan(null)}
                  className="p-2 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors shrink-0"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pt-20">
                <div className="h-64 relative bg-slate-200 dark:bg-slate-800">
                  {selectedPlan.coverImage && (
                    <img src={selectedPlan.coverImage} alt={selectedPlan.destination} className="w-full h-full object-cover" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-900/90 via-dark-900/40 to-transparent"></div>
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="flex flex-wrap items-center gap-3 text-white/90 text-sm font-medium">
                      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20"><Calendar size={14} /> {selectedPlan.duration} Days</span>
                      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20"><Banknote size={14} /> Est. {selectedPlan.planDetails?.estimatedCost || selectedPlan.budget} {selectedPlan.currency}</span>
                      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20"><Users size={14} /> {selectedPlan.travelers} Travelers</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 lg:p-8">
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-10 text-lg">
                    {selectedPlan.planDetails?.summary}
                  </p>

                  <div className="space-y-10">
                    {selectedPlan.planDetails?.itinerary?.map((day, index) => (
                      <div key={index} className="relative pl-8 border-l-2 border-primary-100 dark:border-slate-700">
                        <div className="absolute w-6 h-6 bg-primary-100 dark:bg-primary-900/50 rounded-full -left-[13px] top-0 flex items-center justify-center border-2 border-white dark:border-dark-800">
                          <div className="w-2.5 h-2.5 bg-primary-500 rounded-full"></div>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white font-outfit mb-5">Day {day.day}: {day.theme}</h3>
                        
                        <div className="space-y-4">
                          {day.activities?.map((activity, actIdx) => (
                            <div key={actIdx} className="bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors rounded-xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="text-xs font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 px-2.5 py-1 rounded-md">
                                  {activity.time}
                                </span>
                                <h4 className="font-semibold text-slate-800 dark:text-slate-200">{activity.title}</h4>
                              </div>
                              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">{activity.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
                     <button 
                       onClick={(e) => handleDelete(e, selectedPlan._id)}
                       disabled={isDeleting}
                       className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 transition-colors font-medium"
                     >
                       <Trash2 size={18} />
                       Delete This Plan
                     </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white font-outfit mb-2">
            My Plans
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            All your AI-generated travel itineraries saved in one place.
          </p>
        </div>
        <Link 
          href="/dashboard"
          className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-colors inline-flex items-center gap-2 shadow-sm whitespace-nowrap self-start sm:self-auto"
        >
          <Sparkles size={18} />
          Plan New Trip
        </Link>
      </div>

      {plans.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="h-[400px] flex flex-col items-center justify-center bg-white dark:bg-dark-800 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-8 text-center"
        >
          <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mb-6">
            <MapPin size={32} className="text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200 font-outfit mb-2">No plans saved yet</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-6">
            You haven't saved any travel itineraries yet. Go to the dashboard to generate your first magical trip!
          </p>
          <Link 
            href="/dashboard"
            className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-medium hover:scale-105 transition-transform"
          >
            Start Planning
          </Link>
        </motion.div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {plans.map((plan) => (
            <motion.div 
              key={plan._id} 
              variants={itemVariants}
              onClick={() => setSelectedPlan(plan)}
              className="group bg-white dark:bg-dark-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col cursor-pointer relative"
            >
              {/* Cover Image */}
              <div className="h-48 relative overflow-hidden bg-slate-100 dark:bg-slate-900">
                {plan.coverImage ? (
                  <img 
                    src={plan.coverImage} 
                    alt={plan.destination} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <MapPin size={32} />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
                
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-xl font-bold text-white font-outfit drop-shadow-md truncate">
                    {plan.destination}
                  </h3>
                </div>

                <button 
                  onClick={(e) => handleDelete(e, plan._id)}
                  className="absolute top-4 right-4 w-8 h-8 bg-dark-900/50 backdrop-blur-md rounded-full flex items-center justify-center text-white/70 hover:bg-red-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                  title="Delete Plan"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Card Content */}
              <div className="p-5 flex-1 flex flex-col">
                <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-3 line-clamp-1">
                  {plan.planDetails?.title || `Trip to ${plan.destination}`}
                </h4>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="inline-flex items-center gap-1 text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-md">
                    <Calendar size={12} /> {plan.duration} Days
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-md">
                    <Banknote size={12} /> {plan.budget} {plan.currency}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-md">
                    <Users size={12} /> {plan.travelers}
                  </span>
                </div>

                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 mb-6 flex-1">
                  {plan.planDetails?.summary || 'No summary provided.'}
                </p>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-700/50 mt-auto flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {new Date(plan.createdAt).toLocaleDateString()}
                  </span>
                  
                  <span className="text-primary-600 dark:text-primary-400 font-medium group-hover:underline flex items-center gap-1">
                    View Details <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
