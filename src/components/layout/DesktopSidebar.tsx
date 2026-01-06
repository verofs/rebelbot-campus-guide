import { Link } from 'react-router-dom';
import { Home, Compass, MessageCircle, Bookmark, User, Shield, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';

interface DesktopSidebarProps {
  currentPath: string;
}

const navItems = [
  { path: '/app', icon: Home, label: 'Home' },
  { path: '/app/explore', icon: Compass, label: 'Explore' },
  { path: '/app/chat', icon: MessageCircle, label: 'Chat' },
  { path: '/app/saved', icon: Bookmark, label: 'Saved' },
  { path: '/app/profile', icon: User, label: 'Profile' },
];

export function DesktopSidebar({ currentPath }: DesktopSidebarProps) {
  const { signOut, isAdmin, profile } = useAuth();

  const isActive = (path: string) => {
    if (path === '/app') return currentPath === '/app';
    return currentPath.startsWith(path);
  };

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-border bg-sidebar h-screen sticky top-0">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <Link to="/app" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-sm">
            <span className="text-primary-foreground font-bold text-lg">R</span>
          </div>
          <div>
            <h1 className="font-bold text-lg text-sidebar-foreground">RebelBot</h1>
            <p className="text-xs text-muted-foreground">UNLV Student Companion</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Button
              key={item.path}
              variant={active ? "nav-active" : "nav"}
              className={cn(
                "w-full justify-start gap-3 h-11",
                active && "shadow-sm"
              )}
              asChild
            >
              <Link to={item.path}>
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            </Button>
          );
        })}
        
        {isAdmin && (
          <Button
            variant={currentPath.startsWith('/admin') ? "nav-active" : "nav"}
            className={cn(
              "w-full justify-start gap-3 h-11 mt-4",
              currentPath.startsWith('/admin') && "shadow-sm"
            )}
            asChild
          >
            <Link to="/admin">
              <Shield className="h-5 w-5" />
              Admin
            </Link>
          </Button>
        )}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 mb-3 px-2">
          <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center">
            <span className="text-accent-foreground font-semibold text-sm">
              {profile?.first_name?.[0]?.toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {profile?.first_name || 'Rebel'}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {profile?.status || 'Student'}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive"
          onClick={signOut}
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </div>
    </aside>
  );
}
