import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  DownloadCloud, 
  Users, 
  Send, 
  MessageSquare, 
  Settings, 
  Search, 
  Bell, 
  Menu,
  ChevronLeft,
  ChevronRight,
  Command
} from 'lucide-react';
import { Button } from './ui/Button';

interface LayoutProps {
  children: React.ReactNode;
}

const SidebarItem = ({ to, icon: Icon, label, collapsed }: { to: string; icon: any; label: string; collapsed: boolean }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 group ${
        isActive 
          ? 'bg-primary/15 text-primary' 
          : 'text-muted-foreground hover:bg-accent hover:text-white'
      }`
    }
  >
    <Icon size={20} />
    {!collapsed && <span className="font-medium text-sm truncate">{label}</span>}
  </NavLink>
);

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const getBreadcrumbs = () => {
    const path = location.pathname.split('/').filter(Boolean);
    if (path.length === 0) return ['Home'];
    return ['Home', ...path.map(p => p.charAt(0).toUpperCase() + p.slice(1))];
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 bg-secondary/50 backdrop-blur-xl border-r border-border transition-all duration-300 flex flex-col ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div className="h-16 flex items-center px-6 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <span className="text-white font-bold text-lg">N</span>
            </div>
            {!collapsed && <span className="font-bold text-lg tracking-tight">Nexus SEP</span>}
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <SidebarItem to="/" icon={LayoutDashboard} label="Dashboard" collapsed={collapsed} />
          <SidebarItem to="/scraper" icon={DownloadCloud} label="Scraper" collapsed={collapsed} />
          <SidebarItem to="/leads" icon={Users} label="Leads" collapsed={collapsed} />
          <SidebarItem to="/campaigns" icon={Send} label="Campaigns" collapsed={collapsed} />
          <SidebarItem to="/inbox" icon={MessageSquare} label="Inbox" collapsed={collapsed} />
          <SidebarItem to="/settings" icon={Settings} label="Settings" collapsed={collapsed} />
        </nav>

        <div className="p-4 border-t border-border">
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center p-2 rounded-md hover:bg-accent text-muted-foreground hover:text-white transition-colors"
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${collapsed ? 'ml-20' : 'ml-64'}`}>
        {/* Header */}
        <header className="h-16 sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border flex items-center justify-between px-8">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {getBreadcrumbs().map((crumb, index) => (
              <React.Fragment key={crumb}>
                {index > 0 && <span className="text-muted-foreground/40">/</span>}
                <span className={index === getBreadcrumbs().length - 1 ? 'text-foreground font-medium' : ''}>
                  {crumb}
                </span>
              </React.Fragment>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              </div>
              <input 
                type="text" 
                placeholder="Global Search (Cmd+K)" 
                className="bg-secondary/50 border border-border rounded-lg pl-10 pr-4 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 w-64 transition-all"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <kbd className="hidden sm:inline-block items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </div>
            </div>

            <Button variant="ghost" size="icon" className="relative">
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
            </Button>

            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 border border-white/10 ring-2 ring-transparent hover:ring-indigo-500/50 transition-all cursor-pointer"></div>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};