import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  MessageSquare, 
  Settings,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

const AdminSidebar = () => {
  const location = useLocation();
  
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: Users, label: 'Providers', path: '/admin/providers' },
    { icon: Users, label: 'Clients', path: '/admin/clients' },
    { icon: Briefcase, label: 'Services', path: '/admin/services' },
    { icon: MessageSquare, label: 'Requests', path: '/admin/requests' },
  ];

  return (
    <aside className="w-64 shrink-0 hidden lg:block">
      <div className="sticky top-24 space-y-2">
        <div className="px-4 mb-6">
          <h2 className="text-[10px] font-black text-primary/40 uppercase tracking-widest">Administration</h2>
        </div>
        
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.path} 
              to={item.path}
              className={cn(
                "flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group",
                isActive 
                  ? "bg-primary text-white shadow-lg shadow-primary/20" 
                  : "text-primary/60 hover:bg-primary/5 hover:text-primary dark:text-primary-light/60 dark:hover:bg-primary/10 dark:hover:text-white"
              )}
            >
              <div className="flex items-center space-x-3">
                <item.icon size={20} className={cn(isActive ? "text-white" : "text-primary/40 group-hover:text-primary")} />
                <span className="font-bold">{item.label}</span>
              </div>
              {isActive && <ChevronRight size={16} />}
            </Link>
          );
        })}

        <div className="pt-8 px-4 mt-8 border-t border-primary-light dark:border-dark-border">
          <div className="flex items-center space-x-3 p-3 bg-accent/5 rounded-xl border border-accent/10">
            <ShieldCheck size={20} className="text-accent" />
            <div className="overflow-hidden">
               <p className="text-[10px] font-black text-accent uppercase tracking-widest">Admin Mode</p>
               <p className="text-xs font-bold text-primary/60 dark:text-primary-light/60 truncate">Full Access</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
