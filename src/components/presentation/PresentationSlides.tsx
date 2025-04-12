
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Fingerprint, 
  ShieldCheck, 
  UserPlus,
  BadgeCheck,
  ArrowLeft,
  ArrowRight,
  Home
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import FadeIn from '@/components/animations/FadeIn';

interface SlideProps {
  children: React.ReactNode;
  className?: string;
  background?: 'light' | 'dark' | 'gradient';
}

const Slide: React.FC<SlideProps> = ({ children, className, background = 'light' }) => {
  return (
    <div 
      className={cn(
        "min-h-screen flex flex-col p-10 md:p-16",
        background === 'light' && "bg-white",
        background === 'dark' && "bg-fud-navy text-white",
        background === 'gradient' && "hero-gradient",
        className
      )}
    >
      {children}
    </div>
  );
};

interface PresentationSlidesProps {
  onExit: () => void;
}

const PresentationSlides: React.FC<PresentationSlidesProps> = ({ onExit }) => {
  const [currentSlide, setCurrentSlide] = React.useState(0);
  
  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };
  
  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  // Define all presentation slides
  const slides = [
    // Slide 1: Title Slide
    <Slide key="title" background="gradient">
      <FadeIn className="flex flex-col items-center justify-center flex-grow text-center">
        <img 
          src="/lovable-uploads/58c433f3-3bbe-4692-90eb-671930da0b9e.png" 
          alt="Students Virtual ID" 
          className="h-24 w-auto mb-8" 
        />
        <h1 className="text-5xl md:text-6xl font-bold text-fud-navy mb-6">
          Students Virtual ID
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 max-w-2xl">
          Smart Campus Identity Management System
        </p>
      </FadeIn>
    </Slide>,
    
    // Slide 2: Project Overview
    <Slide key="overview" background="light">
      <FadeIn>
        <h2 className="text-3xl md:text-4xl font-bold text-fud-navy mb-8">Project Overview</h2>
      </FadeIn>
      <div className="flex flex-col md:flex-row gap-10 mt-8">
        <FadeIn delay={100} className="flex-1">
          <div className="prose max-w-none">
            <p className="text-lg text-gray-700 mb-6">
              Students Virtual ID is an advanced biometric identity management system designed to revolutionize campus security and administrative processes.
            </p>
            <p className="text-lg text-gray-700">
              Leveraging cutting-edge facial recognition and fingerprint verification technologies, our solution provides comprehensive student identification and access control.
            </p>
          </div>
        </FadeIn>
        <FadeIn delay={200} className="flex-1 flex justify-center items-center">
          <div className="relative">
            <div className="absolute -top-6 -left-6 w-24 h-24 bg-fud-green/10 rounded-full animate-pulse-soft"></div>
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-fud-navy/5 rounded-full animate-pulse-soft"></div>
            <div className="glassmorphism rounded-2xl overflow-hidden p-6 relative z-10 max-w-md">
              <img 
                src="/lovable-uploads/4a3b26f7-2ed1-4ad5-9fc4-e924dc6c3433.png" 
                alt="Students Virtual ID Interface" 
                className="w-full h-auto object-contain rounded-xl" 
              />
            </div>
          </div>
        </FadeIn>
      </div>
    </Slide>,
    
    // Slide 3: Key Features
    <Slide key="features" background="dark">
      <FadeIn>
        <h2 className="text-3xl md:text-4xl font-bold mb-10">Key Features</h2>
      </FadeIn>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <FadeIn delay={100}>
          <div className="bg-white/10 p-6 rounded-xl backdrop-blur-sm border border-white/10">
            <div className="w-12 h-12 rounded-full bg-fud-green/20 flex items-center justify-center mb-4">
              <Fingerprint className="h-6 w-6 text-fud-green" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Biometric Verification</h3>
            <ul className="space-y-2 text-gray-300">
              <li>• Face ID and Fingerprint Authentication</li>
              <li>• Over 99% accuracy in identification</li>
              <li>• Prevent identity fraud</li>
            </ul>
          </div>
        </FadeIn>
        
        <FadeIn delay={150}>
          <div className="bg-white/10 p-6 rounded-xl backdrop-blur-sm border border-white/10">
            <div className="w-12 h-12 rounded-full bg-fud-green/20 flex items-center justify-center mb-4">
              <Calendar className="h-6 w-6 text-fud-green" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Smart Attendance</h3>
            <ul className="space-y-2 text-gray-300">
              <li>• Automate lecture attendance tracking</li>
              <li>• Real-time biometric verification</li>
              <li>• Detailed attendance reports</li>
            </ul>
          </div>
        </FadeIn>
        
        <FadeIn delay={200}>
          <div className="bg-white/10 p-6 rounded-xl backdrop-blur-sm border border-white/10">
            <div className="w-12 h-12 rounded-full bg-fud-green/20 flex items-center justify-center mb-4">
              <ShieldCheck className="h-6 w-6 text-fud-green" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Campus Access Control</h3>
            <ul className="space-y-2 text-gray-300">
              <li>• Secure university gate entry</li>
              <li>• Library and lab access management</li>
              <li>• Event entry verification</li>
            </ul>
          </div>
        </FadeIn>
        
        <FadeIn delay={250}>
          <div className="bg-white/10 p-6 rounded-xl backdrop-blur-sm border border-white/10">
            <div className="w-12 h-12 rounded-full bg-fud-green/20 flex items-center justify-center mb-4">
              <BadgeCheck className="h-6 w-6 text-fud-green" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Exam Hall Authentication</h3>
            <ul className="space-y-2 text-gray-300">
              <li>• Prevent impersonation during exams</li>
              <li>• Secure biometric checks</li>
              <li>• Swift student verification</li>
            </ul>
          </div>
        </FadeIn>
        
        <FadeIn delay={300}>
          <div className="bg-white/10 p-6 rounded-xl backdrop-blur-sm border border-white/10">
            <div className="w-12 h-12 rounded-full bg-fud-green/20 flex items-center justify-center mb-4">
              <UserPlus className="h-6 w-6 text-fud-green" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Student Registration</h3>
            <ul className="space-y-2 text-gray-300">
              <li>• Capture facial and fingerprint data</li>
              <li>• Secure encrypted storage</li>
              <li>• Streamlined onboarding process</li>
            </ul>
          </div>
        </FadeIn>
      </div>
    </Slide>,
    
    // Slide 4: Technologies Used
    <Slide key="technologies" background="light">
      <FadeIn>
        <h2 className="text-3xl md:text-4xl font-bold text-fud-navy mb-10">Technologies Used</h2>
      </FadeIn>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <FadeIn delay={100}>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center flex flex-col items-center">
            <div className="w-16 h-16 flex items-center justify-center mb-4">
              <img src="https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg" alt="React" className="h-full" />
            </div>
            <h3 className="text-lg font-semibold text-fud-navy">React</h3>
            <p className="text-sm text-gray-500 mt-2">Frontend Library</p>
          </div>
        </FadeIn>
        
        <FadeIn delay={150}>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center flex flex-col items-center">
            <div className="w-16 h-16 flex items-center justify-center mb-4">
              <img src="https://upload.wikimedia.org/wikipedia/commons/4/4c/Typescript_logo_2020.svg" alt="TypeScript" className="h-full" />
            </div>
            <h3 className="text-lg font-semibold text-fud-navy">TypeScript</h3>
            <p className="text-sm text-gray-500 mt-2">Type Safety</p>
          </div>
        </FadeIn>
        
        <FadeIn delay={200}>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center flex flex-col items-center">
            <div className="w-16 h-16 flex items-center justify-center mb-4">
              <img src="https://upload.wikimedia.org/wikipedia/commons/d/d5/Tailwind_CSS_Logo.svg" alt="Tailwind CSS" className="h-full" />
            </div>
            <h3 className="text-lg font-semibold text-fud-navy">Tailwind CSS</h3>
            <p className="text-sm text-gray-500 mt-2">Styling</p>
          </div>
        </FadeIn>
        
        <FadeIn delay={250}>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center flex flex-col items-center">
            <div className="w-16 h-16 flex items-center justify-center mb-4">
              <img src="https://seeklogo.com/images/S/supabase-logo-DCC676FFE2-seeklogo.com.png" alt="Supabase" className="h-full" />
            </div>
            <h3 className="text-lg font-semibold text-fud-navy">Supabase</h3>
            <p className="text-sm text-gray-500 mt-2">Backend & Database</p>
          </div>
        </FadeIn>
        
        <FadeIn delay={300}>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center flex flex-col items-center">
            <div className="w-16 h-16 flex items-center justify-center mb-4">
              <img src="https://d1.awsstatic.com/logos/aws-logo-lockups/poweredbyaws/PB_AWS_logo_RGB_stacked_REV_SQ.91cd4af40773cbfbd15577a3c2b8a346fe3e8fa2.png" alt="AWS" className="h-full" />
            </div>
            <h3 className="text-lg font-semibold text-fud-navy">AWS Rekognition</h3>
            <p className="text-sm text-gray-500 mt-2">Facial Recognition</p>
          </div>
        </FadeIn>
        
        <FadeIn delay={350}>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center flex flex-col items-center">
            <div className="w-16 h-16 flex items-center justify-center mb-4">
              <img src="https://raw.githubusercontent.com/tanstack/query/main/media/emblem-light.svg" alt="React Query" className="h-full" />
            </div>
            <h3 className="text-lg font-semibold text-fud-navy">React Query</h3>
            <p className="text-sm text-gray-500 mt-2">Data Fetching</p>
          </div>
        </FadeIn>
        
        <FadeIn delay={400}>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center flex flex-col items-center">
            <div className="w-16 h-16 flex items-center justify-center mb-4">
              <img src="https://vitejs.dev/logo.svg" alt="Vite" className="h-full" />
            </div>
            <h3 className="text-lg font-semibold text-fud-navy">Vite</h3>
            <p className="text-sm text-gray-500 mt-2">Build Tool</p>
          </div>
        </FadeIn>
      </div>
    </Slide>,
    
    // Slide 5: Benefits
    <Slide key="benefits" background="gradient">
      <FadeIn>
        <h2 className="text-3xl md:text-4xl font-bold text-fud-navy mb-10">Benefits</h2>
      </FadeIn>
      <div className="grid md:grid-cols-2 gap-8">
        <FadeIn delay={100}>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-xl font-semibold text-fud-navy mb-4">For Administration</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="bg-fud-green/10 rounded-full p-1 mr-3 mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-fud-green" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
                <span className="text-gray-700">Automated attendance tracking saves time</span>
              </li>
              <li className="flex items-start">
                <span className="bg-fud-green/10 rounded-full p-1 mr-3 mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-fud-green" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
                <span className="text-gray-700">Enhanced campus security and access control</span>
              </li>
              <li className="flex items-start">
                <span className="bg-fud-green/10 rounded-full p-1 mr-3 mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-fud-green" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
                <span className="text-gray-700">Reduced administrative workload</span>
              </li>
              <li className="flex items-start">
                <span className="bg-fud-green/10 rounded-full p-1 mr-3 mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-fud-green" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
                <span className="text-gray-700">Accurate data collection and reporting</span>
              </li>
            </ul>
          </div>
        </FadeIn>
        
        <FadeIn delay={200}>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-xl font-semibold text-fud-navy mb-4">For Students</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="bg-fud-green/10 rounded-full p-1 mr-3 mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-fud-green" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
                <span className="text-gray-700">Streamlined campus access</span>
              </li>
              <li className="flex items-start">
                <span className="bg-fud-green/10 rounded-full p-1 mr-3 mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-fud-green" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
                <span className="text-gray-700">Quick identity verification for services</span>
              </li>
              <li className="flex items-start">
                <span className="bg-fud-green/10 rounded-full p-1 mr-3 mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-fud-green" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
                <span className="text-gray-700">No more lost or forgotten ID cards</span>
              </li>
              <li className="flex items-start">
                <span className="bg-fud-green/10 rounded-full p-1 mr-3 mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-fud-green" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
                <span className="text-gray-700">Faster exam hall admission process</span>
              </li>
            </ul>
          </div>
        </FadeIn>
      </div>
    </Slide>,
    
    // Slide 6: Implementation Timeline
    <Slide key="timeline" background="light">
      <FadeIn>
        <h2 className="text-3xl md:text-4xl font-bold text-fud-navy mb-10">Implementation Timeline</h2>
      </FadeIn>
      <div className="max-w-4xl mx-auto">
        <div className="space-y-8">
          <FadeIn delay={100}>
            <div className="flex">
              <div className="flex flex-col items-center mr-4">
                <div className="w-12 h-12 rounded-full bg-fud-green flex items-center justify-center text-white font-bold">1</div>
                <div className="h-full w-0.5 bg-gray-200 mt-2"></div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex-grow">
                <h3 className="text-xl font-semibold text-fud-navy mb-2">Planning & Requirements (Month 1)</h3>
                <p className="text-gray-600">Stakeholder interviews, requirements gathering, and system architecture design</p>
              </div>
            </div>
          </FadeIn>
          
          <FadeIn delay={150}>
            <div className="flex">
              <div className="flex flex-col items-center mr-4">
                <div className="w-12 h-12 rounded-full bg-fud-green flex items-center justify-center text-white font-bold">2</div>
                <div className="h-full w-0.5 bg-gray-200 mt-2"></div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex-grow">
                <h3 className="text-xl font-semibold text-fud-navy mb-2">Development Phase (Months 2-4)</h3>
                <p className="text-gray-600">Core system development, biometric integration, and database setup</p>
              </div>
            </div>
          </FadeIn>
          
          <FadeIn delay={200}>
            <div className="flex">
              <div className="flex flex-col items-center mr-4">
                <div className="w-12 h-12 rounded-full bg-fud-green flex items-center justify-center text-white font-bold">3</div>
                <div className="h-full w-0.5 bg-gray-200 mt-2"></div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex-grow">
                <h3 className="text-xl font-semibold text-fud-navy mb-2">Testing & Quality Assurance (Month 5)</h3>
                <p className="text-gray-600">System testing, security audits, and performance optimization</p>
              </div>
            </div>
          </FadeIn>
          
          <FadeIn delay={250}>
            <div className="flex">
              <div className="flex flex-col items-center mr-4">
                <div className="w-12 h-12 rounded-full bg-fud-green flex items-center justify-center text-white font-bold">4</div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex-grow">
                <h3 className="text-xl font-semibold text-fud-navy mb-2">Deployment & Training (Month 6)</h3>
                <p className="text-gray-600">Pilot deployment, staff training, and full campus rollout</p>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </Slide>,
    
    // Slide 7: Contact / Thank You
    <Slide key="thank-you" background="dark">
      <FadeIn className="flex flex-col items-center justify-center flex-grow text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">Thank You!</h2>
        <p className="text-xl text-gray-300 max-w-2xl mb-8">
          Ready to revolutionize campus identity management?
        </p>
        <div className="flex gap-4 flex-wrap justify-center">
          <Button variant="default" size="lg" className="bg-white text-fud-navy hover:bg-gray-100">
            Contact Us
          </Button>
          <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
            Request Demo
          </Button>
        </div>
      </FadeIn>
    </Slide>
  ];

  return (
    <div className="presentation-container min-h-screen">
      {slides[currentSlide]}
      
      <div className="fixed bottom-8 left-0 right-0 flex justify-center gap-4 z-50">
        <Button
          variant="outline"
          onClick={onExit}
          className="bg-white/80 backdrop-blur-sm hover:bg-white"
        >
          <Home className="h-4 w-4 mr-2" />
          Exit Presentation
        </Button>
        <Button
          variant="outline"
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className="bg-white/80 backdrop-blur-sm hover:bg-white"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        <Button
          variant="outline"
          onClick={nextSlide}
          disabled={currentSlide === slides.length - 1}
          className="bg-white/80 backdrop-blur-sm hover:bg-white"
        >
          Next
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
        <div className="bg-white/80 backdrop-blur-sm px-3 py-2 rounded-md flex items-center text-sm font-medium">
          Slide {currentSlide + 1} of {slides.length}
        </div>
      </div>
    </div>
  );
};

export default PresentationSlides;
