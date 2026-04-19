'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Map, 
  BookOpen, 
  Settings, 
  LogOut,
  User as UserIcon,
  Menu,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTheme } from '@/components/providers/ThemeProvider';

export default function DashboardLayout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  
  const [isMobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  if (status === 'loading' || !mounted) {
    return <div className="min-h-screen flex items-center justify-center bg-dark-900 text-white">Loading...</div>;
  }

  if (!session) return null;

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'My Plans', href: '/dashboard/plans', icon: Map },
    { name: 'Travel Blogs', href: '/dashboard/blogs', icon: BookOpen },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-900 flex overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ 
          width: isCollapsed ? 80 : 256,
          x: isMobileOpen ? 0 : (window.innerWidth < 1024 ? -256 : 0) // rough mobile check for init
        }}
        transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
        className={`fixed lg:static inset-y-0 left-0 z-50 bg-white dark:bg-dark-800 border-r border-slate-200 dark:border-slate-700 flex flex-col transform lg:transform-none ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} transition-transform duration-300 lg:transition-none`}
      >
        {/* Logo Area */}
        <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-700 justify-between relative">
          <Link href="/" className="text-xl font-bold font-outfit text-primary-600 flex items-center gap-3 overflow-hidden whitespace-nowrap">
            <Map size={24} className="shrink-0" />
            <AnimatePresence mode="popLayout">
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                >
                  WanderAI
                </motion.span>
              )}
            </AnimatePresence>
          </Link>

          {/* Desktop Collapse Toggle */}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white dark:bg-dark-800 border border-slate-200 dark:border-slate-700 rounded-full items-center justify-center text-slate-500 hover:text-primary-500 z-10 shadow-sm"
          >
            {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto overflow-x-hidden">
          {navigation.map((item) => {
            const isActive = item.href === '/dashboard' 
              ? pathname === '/dashboard' 
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl font-medium transition-all group relative overflow-hidden ${
                  isActive 
                    ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-500' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                } ${isCollapsed ? 'justify-center' : ''}`}
                title={isCollapsed ? item.name : undefined}
              >
                <item.icon size={20} className={`shrink-0 ${isActive ? 'text-primary-600 dark:text-primary-500' : 'text-slate-500 group-hover:text-primary-500 transition-colors'}`} />
                <AnimatePresence mode="popLayout">
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      className="whitespace-nowrap"
                    >
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </nav>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className={`flex items-center gap-3 mb-4 ${isCollapsed ? 'justify-center' : ''}`}>
            {session.user?.image ? (
              <img src={session.user.image} alt={session.user.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 shrink-0">
                <UserIcon size={20} />
              </div>
            )}
            
            <AnimatePresence mode="popLayout">
              {!isCollapsed && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 min-w-0 whitespace-nowrap"
                >
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                    {session.user?.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {session.user?.email}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button
            onClick={toggleTheme}
            title={isCollapsed ? (theme === 'dark' ? 'Light Mode' : 'Dark Mode') : undefined}
            className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors mb-1 ${isCollapsed ? 'justify-center' : ''}`}
          >
            {theme === 'dark' ? <Sun size={18} className="shrink-0 text-amber-400" /> : <Moon size={18} className="shrink-0 text-indigo-500" />}
            <AnimatePresence mode="popLayout">
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            title={isCollapsed ? "Log Out" : undefined}
            className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors ${isCollapsed ? 'justify-center' : ''}`}
          >
            <LogOut size={18} className="shrink-0" />
            <AnimatePresence mode="popLayout">
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="whitespace-nowrap"
                >
                  Log Out
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
        {/* Mobile Header */}
        <header className="lg:hidden h-16 bg-white dark:bg-dark-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 shrink-0">
          <Link href="/" className="text-xl font-bold font-outfit text-primary-600 flex items-center gap-2">
            <Map size={24} />
            WanderAI
          </Link>
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
          >
            <Menu size={24} />
          </button>
        </header>

        {/* Page Content with Framer Motion Page Transitions */}
        <div className="flex-1 overflow-y-auto relative bg-slate-50 dark:bg-dark-900">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="min-h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
