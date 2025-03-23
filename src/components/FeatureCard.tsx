
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import FadeIn from './animations/FadeIn';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  to: string;
  delay?: number;
  className?: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon: Icon,
  title,
  description,
  to,
  delay = 0,
  className
}) => {
  return (
    <FadeIn delay={delay} duration={600}>
      <Link 
        to={to}
        className={cn(
          "block group feature-gradient rounded-2xl overflow-hidden border border-gray-100",
          "transition-all duration-500 hover:shadow-lg hover:border-fud-green/20 hover:-translate-y-1",
          className
        )}
      >
        <div className="p-6 sm:p-8 flex flex-col h-full">
          <div className="bg-fud-green/10 rounded-xl w-12 h-12 flex items-center justify-center mb-5 group-hover:bg-fud-green/20 transition-colors duration-300">
            <Icon className="text-fud-green h-6 w-6" />
          </div>
          
          <h3 className="text-xl font-semibold text-fud-navy mb-3 group-hover:text-fud-green transition-colors duration-300">
            {title}
          </h3>
          
          <p className="text-gray-600 text-sm mb-5 flex-grow">
            {description}
          </p>
          
          <div className="text-fud-green text-sm font-medium flex items-center">
            Learn more
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4 ml-1 transform transition-transform duration-300 group-hover:translate-x-1" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 5l7 7-7 7" 
              />
            </svg>
          </div>
        </div>
      </Link>
    </FadeIn>
  );
};

export default FeatureCard;
