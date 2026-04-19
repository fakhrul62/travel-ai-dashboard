'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { User, Bell, Shield, Paintbrush, Loader2, Camera, CheckCircle2, AlertCircle, Sun, Moon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/components/providers/ThemeProvider';

export default function SettingsPage() {
  const { data: session, status, update } = useSession();
  const { theme, toggleTheme } = useTheme();
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState(null);
  const fileInputRef = useRef(null);
  const router = useRouter();

  if (status === 'loading') {
    return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-primary-500" /></div>;
  }

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please upload an image file', 'error');
      return;
    }

    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      showToast('Image must be less than 2MB', 'error');
      return;
    }

    setUploading(true);

    try {
      // Compress and convert to base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64Image = reader.result;

        const res = await fetch('/api/user/update-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64Image }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || 'Upload failed');
        }

        // Force session update
        await update({
          ...session,
          user: {
            ...session?.user,
            image: data.image
          }
        });

        showToast('Profile picture updated!');
        router.refresh();
      };
    } catch (error) {
      console.error(error);
      showToast(error.message, 'error');
    } finally {
      setUploading(false);
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
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
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0, transition: { type: 'spring' } }
  };

  return (
    <div className="p-6 lg:p-10 max-w-4xl mx-auto relative">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium ${
              toast.type === 'success' 
                ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20' 
                : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mb-10">
        <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white font-outfit mb-2">
          Settings
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Manage your account preferences and profile.
        </p>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        {/* Profile Settings */}
        <motion.div variants={itemVariants} className="bg-white dark:bg-dark-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3">
            <User className="text-primary-500" />
            <h2 className="text-xl font-bold text-slate-800 dark:text-white font-outfit">Public Profile</h2>
          </div>
          <div className="p-6 flex flex-col sm:flex-row gap-8 items-start">
            <div className="flex-1 space-y-4 w-full">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Full Name</label>
                <input 
                  type="text" 
                  disabled
                  defaultValue={session?.user?.name || ''}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email Address</label>
                <input 
                  type="email" 
                  disabled
                  defaultValue={session?.user?.email || ''}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>
            
            {/* Image Upload Area */}
            <div className="flex flex-col items-center gap-4">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/jpeg, image/png, image/webp" 
                className="hidden" 
              />
              
              <div className="relative group cursor-pointer" onClick={handleImageClick}>
                <div className={`w-32 h-32 rounded-full overflow-hidden border-4 border-slate-50 dark:border-slate-900 shadow-sm transition-opacity ${uploading ? 'opacity-50' : 'opacity-100'}`}>
                  {session?.user?.image ? (
                    <img src={session.user.image} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                      <User size={40} className="text-slate-400" />
                    </div>
                  )}
                </div>
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-dark-900/60 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Camera className="text-white" size={24} />
                </div>
                
                {uploading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="animate-spin text-primary-500" size={32} />
                  </div>
                )}
              </div>
              
              <button 
                onClick={handleImageClick}
                disabled={uploading}
                className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : 'Change Picture'}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Preferences */}
        <motion.div variants={itemVariants} className="bg-white dark:bg-dark-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3">
            <Paintbrush className="text-primary-500" />
            <h2 className="text-xl font-bold text-slate-800 dark:text-white font-outfit">Appearance</h2>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Theme</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Switch between light and dark mode.</p>
              </div>
              <button
                onClick={toggleTheme}
                className="relative w-16 h-8 rounded-full bg-slate-200 dark:bg-slate-700 transition-colors duration-300 flex items-center px-1"
              >
                <motion.div
                  layout
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className={`w-6 h-6 rounded-full flex items-center justify-center shadow-sm ${
                    theme === 'dark'
                      ? 'bg-indigo-500 ml-auto'
                      : 'bg-amber-400 mr-auto'
                  }`}
                >
                  {theme === 'dark' ? <Moon size={14} className="text-white" /> : <Sun size={14} className="text-white" />}
                </motion.div>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Security */}
        <motion.div variants={itemVariants} className="bg-white dark:bg-dark-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3">
            <Shield className="text-primary-500" />
            <h2 className="text-xl font-bold text-slate-800 dark:text-white font-outfit">Security</h2>
          </div>
          <div className="p-6 space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Your account is currently managed by {session?.user?.provider ? <span className="capitalize font-semibold text-primary-500">{session.user.provider}</span> : 'credentials'}.
            </p>
            {session?.user?.provider && session.user.provider !== 'credentials' && (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Password changes, two-factor authentication, and other security measures are handled directly by your authentication provider.
              </p>
            )}
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
}
