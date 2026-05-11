import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { buildImageUrl } from '../../lib/utils';
import { Button } from '@/components/ui/button';
import { 
  Briefcase, 
  Sun, 
  Moon, 
  LogOut, 
  User, 
  LayoutDashboard, 
  Settings, 
  Bell,
  CheckCircle  
} from 'lucide-react';
import useNotifications from '../../hooks/useNotifications';
import { AnimatePresence, motion } from 'motion/react';

const Navbar = () => {
  const { isAuthenticated, user, logout, isClient, isProvider, isAdmin } = useAuth();
  const { notifications, isConnected, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem('theme') === 'dark' || 
    (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
  );

  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNotificationClick = (n) => {
    console.log('token:', token);
  if (!n.isRead) {
    markAsRead(n.id);
  }

  const title = n.title?.toLowerCase() || '';
  const message = n.message?.toLowerCase() || '';

  if (isAdmin) {
  if (n.title?.includes('مزود خدمة') || n.title?.includes('موافقة')) {
    navigate(`/admin/providers`);
  } else if (n.title?.includes('خدمة جديدة') || n.title?.includes('إنشاء خدمة')) {
    navigate(`/admin/services?highlight=${n.referenceId || ''}`);
  } else {
    navigate('/admin/dashboard');
  }
} else if (isProvider) {
    if (title.includes('request') || message.includes('request') || message.includes('طلب')) {
      navigate('/provider/requests');
    } else {
      navigate('/provider/profile');
    }
  } else if (isClient) {
    navigate('/client/requests');
  }
};

  return (
    <nav className="glass-nav sticky top-0 z-50 transition-all duration-300">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] shadow-lg rounded-xl flex items-center justify-center text-white font-bold text-xl group-hover:rotate-6 transition-all duration-300">
             JL
          </div>
          <div className="flex items-baseline font-extrabold tracking-tight text-2xl">
            <span className="text-primary dark:text-white transition-colors">Joby</span>
            <span className="text-accent transition-colors">Lancer</span>
          </div>
        </Link>

        <div className="hidden md:flex items-center space-x-8">
          <Link to="/services" className="text-sm font-semibold text-primary/70 dark:text-primary-light/70 hover:text-primary dark:hover:text-white transition-colors">Find Talent</Link>
          <Link to="/categories" className="text-sm font-semibold text-primary/70 dark:text-primary-light/70 hover:text-primary dark:hover:text-white transition-colors">Categories</Link>
          
          <div className="h-4 w-px bg-primary-light dark:bg-dark-border mx-2"></div>
          
          <button 
            onClick={toggleDarkMode}
            className="p-2.5 rounded-xl bg-primary-light/30 dark:bg-dark-card border border-primary-light dark:border-dark-border text-primary dark:text-primary-light transition-all hover:scale-110 active:scale-95"
            aria-label="Toggle theme"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {isAuthenticated && (
            <div className="relative group">
              <button 
                className="p-2.5 rounded-xl bg-primary-light/30 dark:bg-dark-card border border-primary-light dark:border-dark-border text-primary dark:text-primary-light transition-all hover:scale-110 active:scale-95 flex items-center relative"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-error text-white text-[10px] font-black rounded-full flex items-center justify-center animate-bounce px-1">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              
              {/* Notification Mini-List on Hover */}
              <div className="absolute right-0 top-full pt-4 opacity-0 scale-95 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300 z-50">
                <div className="w-80 bento-card bg-white dark:bg-dark-card border border-primary-light dark:border-dark-border shadow-2xl p-4">
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-primary-light dark:border-dark-border">
                    <h4 className="font-black text-sm text-primary dark:text-white uppercase tracking-wider">Activity</h4>
                    {isConnected && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>}
                  </div>
                  <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-primary/40 text-center py-4">No recent notifications</p>
                    ) : (
                      notifications.map(n => (
                        <div 
                          key={n.id} 
                          className={`p-3 rounded-xl border transition-all cursor-pointer relative overflow-hidden group/item ${
                            !n.isRead 
                              ? "bg-primary-light/20 dark:bg-primary/10 border-primary/20" 
                              : "bg-transparent border-transparent opacity-60"
                          } hover:border-primary/40 hover:bg-primary-light/10`}
                        >
                          <div className="flex items-start justify-between gap-2" onClick={() => handleNotificationClick(n)}>
                            <div className="flex-grow">
                              <div className="flex items-start justify-between mb-1">
                                <p className={`text-xs font-black dark:text-white truncate ${!n.isRead ? "text-primary" : "text-primary/60"}`}>{n.title}</p>
                                {!n.isRead && <div className="w-2 h-2 rounded-full bg-primary shrink-0 ml-2"></div>}
                              </div>
                              <p className={`text-[10px] leading-relaxed line-clamp-2 ${!n.isRead ? "text-primary/80 font-bold" : "text-primary/40 font-medium"}`}>
                                {n.message}
                              </p>
                            </div>
                            {!n.isRead && (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(n.id);
                                }}
                                className="opacity-0 group-hover/item:opacity-100 p-1 text-primary hover:bg-primary/10 rounded transition-all"
                                title="Mark as read"
                              >
                                <CheckCircle size={14} />
                              </button>
                            )}
                          </div>
                      </div>
                      ))
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-4 border-t border-primary-light dark:border-dark-border pt-4">
                    <button 
                      onClick={markAllAsRead}
                      className="text-[10px] font-black text-primary/40 hover:text-primary uppercase tracking-widest transition-colors"
                    >
                      Clear All
                    </button>
                    <Link to={isAdmin ? "/admin/services?status=0" : "/provider/profile"} className="text-[10px] font-black text-primary hover:text-accent uppercase tracking-[0.2em] transition-colors">
                      {isAdmin ? "Manage Services" : "My Profile"}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {isAuthenticated ? (
            <div className="flex items-center space-x-4">
              <Link to={isAdmin ? "/admin/dashboard" : isProvider ? "/provider/profile" : "/client/profile"}>
                <div className="w-10 h-10 rounded-full bg-primary-light/50 dark:bg-dark-card border border-primary-light dark:border-dark-border flex items-center justify-center text-primary dark:text-primary-light hover:border-primary transition-colors overflow-hidden font-black text-sm shadow-inner group">
                  {user?.profileImageUrl || user?.profileImage ? (
                    <>
                      <img 
                        src={buildImageUrl(user?.profileImageUrl || user?.profileImage)} 
                        alt="Profile" 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const fallback = e.currentTarget.nextElementSibling;
                          if (fallback) fallback.classList.remove('hidden');
                        }}
                      />
                      <div className="hidden w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
                        {user?.fullName?.charAt(0).toUpperCase() || <User size={18} />}
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
                      {user?.fullName?.charAt(0).toUpperCase() || <User size={18} />}
                    </div>
                  )}
                </div>
              </Link>
              
              <Button variant="ghost" size="icon" onClick={handleLogout} className="rounded-xl text-error hover:bg-error/10 transition-colors">
                <LogOut size={20} />
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-sm font-bold text-primary/80 dark:text-primary-light/80 hover:text-primary dark:hover:text-white transition-colors">Log In</Link>
              <Link to="/register">
                <Button size="lg" className="bg-primary hover:bg-primary-dark text-white rounded-xl px-8 font-bold shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                  Join Now
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
