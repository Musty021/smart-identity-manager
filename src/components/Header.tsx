
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Menu, X, Slideshow } from 'lucide-react';

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  return (
    <header 
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 md:px-10',
        isScrolled ? 'py-3 bg-white/90 backdrop-blur-md shadow-sm' : 'py-5 bg-transparent'
      )}
    >
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <img 
            src="/lovable-uploads/58c433f3-3bbe-4692-90eb-671930da0b9e.png" 
            alt="Students Virtual ID" 
            className="h-10 w-auto" 
          />
          <span className={cn(
            "font-semibold text-lg transition-colors duration-300",
            isScrolled ? "text-fud-navy" : "text-fud-navy"
          )}>
            Students Virtual ID
          </span>
        </Link>
        
        <Link 
          to="/presentation" 
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg transition-all",
            isScrolled 
              ? "bg-fud-green/10 text-fud-green hover:bg-fud-green/20" 
              : "bg-white/20 text-fud-navy backdrop-blur-sm hover:bg-white/30"
          )}
        >
          <Slideshow className="h-4 w-4" />
          <span className="font-medium">Presentation</span>
        </Link>
      </div>
    </header>
  );
};

export default Header;
