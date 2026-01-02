import { Link } from 'react-router-dom';
import { Home, Compass, MessageCircle, Bookmark, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileNavProps {
  currentPath: string;
}

const navItems = [
  { path: '/app', icon: Home, label: 'Home' },
  { path: '/app/explore', icon: Compass, label: 'Explore' },
  { path: '/app/chat', icon: MessageCircle, label: 'Chat' },
  { path: '/app/saved', icon: Bookmark, label: 'Saved' },
  { path: '/app/profile', icon: User, label: 'Profile' },
];

export function MobileNav({ currentPath }: MobileNavProps) {
  const isActive = (path: string) => {
    if (path === '/app') return currentPath === '/app';
    return currentPath.startsWith(path);
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center gap-1 min-w-[64px] py-2 px-3 rounded-xl transition-all",
                active 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className={cn(
                "p-1.5 rounded-xl transition-colors",
                active && "bg-accent"
              )}>
                <Icon className="h-5 w-5" />
              </div>
              <span className={cn(
                "text-[10px] font-medium",
                active && "font-semibold"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
