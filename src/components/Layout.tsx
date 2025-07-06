import { ReactNode, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { MapPin, LogOut, User, Plus, ArrowUp } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import ProfileAvatar from './ProfileAvatar';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, profile, signOut, loading } = useAuth();
  const location = useLocation();

  // Scroll to top when route changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gradient-hero">
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/dashboard" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold gradient-text">CityConnect</span>
            </Link>
            
            <nav className="hidden md:flex items-center space-x-8">
              <Link 
                to="/dashboard" 
                className={`nav-link ${
                  isActive('/dashboard') ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                Dashboard
              </Link>
              <Link 
                to="/issues" 
                className={`nav-link ${
                  isActive('/issues') ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                All Issues
              </Link>
              <Link 
                to="/community" 
                className={`nav-link ${
                  isActive('/community') ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                Community
              </Link>
              <Link 
                to="/emergency" 
                className={`nav-link ${
                  isActive('/emergency') ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                Emergency Alert
              </Link>
              {profile?.role === 'government' && (
                <Link 
                  to="/government" 
                  className={`nav-link ${
                    isActive('/government') ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  Government Panel
                </Link>
              )}
            </nav>

            <div className="flex items-center space-x-4">
              <Link to="/create-issue">
                <Button className="btn-primary px-6 py-2">
                  <Plus className="h-4 w-4 mr-2" />
                  Report Issue
                </Button>
              </Link>
              
              <ProfileAvatar />
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>

      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-8 right-8 w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 z-50 flex items-center justify-center"
        aria-label="Scroll to top"
      >
        <ArrowUp className="h-6 w-6" />
      </button>
    </div>
  );
}