import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useLogout } from '@/features/auth/api/authApi';
import { LogOut, Home, FileText, Settings, LayoutDashboard, Tags, FolderTree, Image, Users, MessageSquare, Activity } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function AdminLayout() {
  const { isAuthenticated, user } = useAuthStore();
  const logout = useLogout();
  const location = useLocation();

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

  return (
    <div className="flex h-screen bg-background newsprint-texture overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-background border-r border-black flex flex-col hidden md:flex z-10 relative">
        <div className="h-16 flex items-center px-6 border-b border-black">
          <Link to="/" className="text-2xl font-black font-serif uppercase tracking-tight text-foreground">BlogForge Admin</Link>
        </div>
        
        <div className="p-4 flex-1 overflow-y-auto">
          <nav className="space-y-2">
            {navItems.map((item) => {
              if (item.roles && !item.roles.includes(user?.role || '')) return null;
              const isActive = location.pathname === item.path || 
                               (item.path !== '/admin' && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2 sharp-corners text-xs font-mono uppercase tracking-widest transition-colors border border-transparent ${
                    isActive 
                      ? 'bg-foreground text-background border-foreground' 
                      : 'text-foreground hover:bg-neutral-200 hover:border-black'
                  }`}
                >
                  <item.icon className={`h-4 w-4 ${isActive ? 'text-background' : 'text-foreground'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-black">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="h-10 w-10 border border-black flex items-center justify-center text-foreground font-bold font-serif text-lg">
              {user?.name?.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-foreground truncate">{user?.name}</p>
              <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground truncate">{user?.role}</p>
            </div>
          </div>
          <Button variant="outline" className="w-full justify-start text-foreground" onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        {/* Topbar mobile only */}
        <header className="h-16 bg-background border-b border-black flex items-center justify-between px-4 md:hidden">
          <span className="font-black font-serif text-xl uppercase">BlogForge</span>
          <Button variant="outline" size="icon" className="border-black">
            <LayoutDashboard className="h-5 w-5" />
          </Button>
        </header>

        {/* Topbar desktop */}
        <header className="h-16 bg-background border-b border-black hidden md:flex items-center justify-between px-8">
          <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
            Edition: Vol 1.0 | Admin Access
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link to="/">
                <Home className="mr-2 h-4 w-4" />
                View Site
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
