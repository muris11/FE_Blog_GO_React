import { useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useLogout } from '@/features/auth/api/authApi';
import { LogOut, Home, FileText, Settings, LayoutDashboard, Tags, FolderTree, Image, Users, MessageSquare, Activity, Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function AdminLayout() {
  const { isAuthenticated, user } = useAuthStore();
  const logout = useLogout();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Posts', path: '/admin/posts', icon: FileText },
    { name: 'Categories', path: '/admin/categories', icon: FolderTree },
    { name: 'Tags', path: '/admin/tags', icon: Tags },
    { name: 'Media', path: '/admin/media', icon: Image },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Comments', path: '/admin/comments', icon: MessageSquare },
    { name: 'Settings', path: '/admin/settings', icon: Settings, roles: ['Admin', 'Super Admin'] },
    { name: 'Audit Logs', path: '/admin/audit-logs', icon: Activity, roles: ['Admin', 'Super Admin'] },
  ];

  const sidebar = (
    <aside className="w-64 bg-background border-r-2 border-black flex flex-col z-20 relative h-full">
      <div className="h-16 flex items-center justify-between px-6 border-b-2 border-black">
        <Link to="/" className="text-2xl font-black font-serif uppercase tracking-tight text-foreground">BlogForge Admin</Link>
        <button className="md:hidden" onClick={() => setSidebarOpen(false)}>
          <X className="h-5 w-5" />
        </button>
      </div>
      
      <div className="p-4 flex-1 overflow-y-auto">
        <nav className="space-y-1">
          {navItems.map((item) => {
            if (item.roles && !item.roles.includes(user?.role || '')) return null;
            const isActive = location.pathname === item.path || 
                             (item.path !== '/admin' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 sharp-corners text-xs font-mono uppercase tracking-widest transition-colors border ${
                  isActive 
                    ? 'bg-foreground text-background border-foreground' 
                    : 'text-foreground hover:bg-neutral-200 border-transparent hover:border-black'
                }`}
              >
                <item.icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-background' : 'text-foreground'}`} />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t-2 border-black">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="h-10 w-10 border-2 border-black flex items-center justify-center text-foreground font-bold font-serif text-lg shrink-0">
            {user?.name?.charAt(0)}
          </div>
          <div className="overflow-hidden min-w-0">
            <p className="text-sm font-bold text-foreground truncate">{user?.name}</p>
            <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground truncate">{user?.role}</p>
          </div>
        </div>
        <Button variant="outline" className="w-full justify-start text-foreground border-2 border-black sharp-corners" onClick={logout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen bg-background newsprint-texture overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex shrink-0">
        {sidebar}
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64">
            {sidebar}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        {/* Mobile Topbar */}
        <header className="h-16 bg-background border-b-2 border-black flex items-center justify-between px-4 md:px-8 shrink-0">
          <button className="md:hidden mr-2" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
          <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground hidden sm:block">
            Edition: Vol 1.0 | Admin Access
          </div>
          <div className="flex items-center gap-4 ml-auto">
            <Button variant="outline" size="sm" asChild className="border-2 border-black sharp-corners">
              <Link to="/">
                <Home className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">View Site</span>
              </Link>
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
