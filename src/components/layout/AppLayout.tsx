import { ReactNode, forwardRef } from 'react';
import { useLocation } from 'react-router-dom';
import { DesktopSidebar } from './DesktopSidebar';
import { MobileNav } from './MobileNav';

interface AppLayoutProps {
  children: ReactNode;
}

export const AppLayout = forwardRef<HTMLDivElement, AppLayoutProps>(function AppLayout({ children }, ref) {
  const location = useLocation();
  
  return (
    <div ref={ref} className="min-h-screen bg-background flex w-full">
      {/* Desktop Sidebar */}
      <DesktopSidebar currentPath={location.pathname} />
      
      {/* Main Content */}
      <main className="flex-1 pb-20 md:pb-0 overflow-x-hidden">
        <div className="max-w-6xl mx-auto px-4 py-6 md:px-6 md:py-8">
          {children}
        </div>
      </main>
      
      {/* Mobile Bottom Nav */}
      <MobileNav currentPath={location.pathname} />
    </div>
  );
});
