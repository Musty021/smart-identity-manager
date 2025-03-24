
import React from 'react';
import { Link } from 'react-router-dom';
import FeatureCard from '@/components/FeatureCard';
import FadeIn from '@/components/animations/FadeIn';
import { 
  Calendar, 
  Fingerprint, 
  ShieldCheck, 
  UserPlus,
  BookCheck,
  Building,
  Clock,
  Lock,
  BadgeCheck,
  BookOpen
} from 'lucide-react';

const Index = () => {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="hero-gradient pt-16 pb-24 px-6">
        <div className="container mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <FadeIn className="flex-1" direction="left">
              <div className="max-w-2xl">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-fud-navy leading-tight mb-6">
                  Smart <span className="text-fud-green">Identity</span> Management for Students
                </h1>
                <p className="text-lg text-gray-600 mb-10">
                  Revolutionize campus security and attendance with our advanced biometric verification system. Prevent impersonation, streamline access control, and automate attendance tracking.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link 
                    to="/smart-attendance" 
                    className="px-6 py-3 rounded-xl button-gradient text-white font-medium transition-transform hover:shadow-lg hover:-translate-y-0.5"
                  >
                    Get Started Now
                  </Link>
                </div>
              </div>
            </FadeIn>
            
            <FadeIn className="flex-1 flex justify-center" direction="right" delay={200}>
              <div className="relative w-full max-w-md">
                <div className="absolute -top-6 -left-6 w-24 h-24 bg-fud-green/10 rounded-full animate-pulse-soft"></div>
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-fud-navy/5 rounded-full animate-pulse-soft"></div>
                <div className="glassmorphism rounded-2xl overflow-hidden p-6 relative z-10">
                  <img 
                    src="/lovable-uploads/39129dbf-f2c1-40e3-87f2-7f0c5879a17e.png" 
                    alt="Virtual Student's ID" 
                    className="w-full h-auto object-contain" 
                  />
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Main Features Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <FadeIn>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-bold text-fud-navy mb-4">
                Core Features
              </h2>
              <p className="text-gray-600">
                Our comprehensive suite of identity management tools designed specifically for educational institutions
              </p>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              icon={Calendar}
              title="Smart Attendance"
              description="Automate lecture attendance with biometric verification, preventing proxy attendance and generating detailed reports."
              to="/smart-attendance"
              delay={100}
            />
            
            <FeatureCard 
              icon={BadgeCheck}
              title="ExamPass ID"
              description="Verify student identity for exam hall access with secure biometric authentication to prevent impersonation."
              to="/exam-pass"
              delay={200}
            />
            
            <FeatureCard 
              icon={ShieldCheck}
              title="VerifyMe"
              description="Quickly authenticate student identity for various campus services and access points."
              to="/verify-me"
              delay={300}
            />
            
            <FeatureCard 
              icon={UserPlus}
              title="Add a Student"
              description="Register new students with biometric data capture for facial recognition and fingerprint verification."
              to="/add-student"
              delay={400}
            />
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="container mx-auto">
          <FadeIn>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-bold text-fud-navy mb-4">
                Benefits of Virtual Student's ID
              </h2>
              <p className="text-gray-600">
                Enhance campus security and streamline administrative processes
              </p>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FadeIn delay={100}>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 rounded-full bg-fud-green/10 flex items-center justify-center mb-4">
                  <Building className="h-6 w-6 text-fud-green" />
                </div>
                <h3 className="text-lg font-semibold text-fud-navy mb-2">University Gate Pass</h3>
                <p className="text-gray-600 text-sm">Secure campus entry with biometric verification at university gates.</p>
              </div>
            </FadeIn>

            <FadeIn delay={150}>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 rounded-full bg-fud-green/10 flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-fud-green" />
                </div>
                <h3 className="text-lg font-semibold text-fud-navy mb-2">Library Access Control</h3>
                <p className="text-gray-600 text-sm">Grant authenticated library access to verified students only.</p>
              </div>
            </FadeIn>

            <FadeIn delay={200}>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 rounded-full bg-fud-green/10 flex items-center justify-center mb-4">
                  <BadgeCheck className="h-6 w-6 text-fud-green" />
                </div>
                <h3 className="text-lg font-semibold text-fud-navy mb-2">Exam Hall Verification</h3>
                <p className="text-gray-600 text-sm">Prevent impersonation during exams with foolproof identity checks.</p>
              </div>
            </FadeIn>

            <FadeIn delay={250}>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 rounded-full bg-fud-green/10 flex items-center justify-center mb-4">
                  <Clock className="h-6 w-6 text-fud-green" />
                </div>
                <h3 className="text-lg font-semibold text-fud-navy mb-2">Time-Saving Attendance</h3>
                <p className="text-gray-600 text-sm">Dramatically reduce the time spent on manual attendance tracking.</p>
              </div>
            </FadeIn>

            <FadeIn delay={300}>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 rounded-full bg-fud-green/10 flex items-center justify-center mb-4">
                  <Lock className="h-6 w-6 text-fud-green" />
                </div>
                <h3 className="text-lg font-semibold text-fud-navy mb-2">Fraud Prevention</h3>
                <p className="text-gray-600 text-sm">Eliminate proxy attendance and identity fraud with biometric verification.</p>
              </div>
            </FadeIn>

            <FadeIn delay={350}>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 rounded-full bg-fud-green/10 flex items-center justify-center mb-4">
                  <Fingerprint className="h-6 w-6 text-fud-green" />
                </div>
                <h3 className="text-lg font-semibold text-fud-navy mb-2">Accurate Verification</h3>
                <p className="text-gray-600 text-sm">Over 99% accuracy in student identification with dual biometric systems.</p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <FadeIn>
            <div className="bg-gradient-to-br from-fud-navy to-fud-navy/90 rounded-2xl p-8 md:p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Ready to transform campus security?
              </h2>
              <p className="text-lg text-gray-200 mb-8 max-w-2xl mx-auto">
                Join universities nationwide in adopting the most secure and efficient student identity management system.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link 
                  to="/smart-attendance" 
                  className="px-6 py-3 rounded-xl bg-white text-fud-navy font-medium transition-transform hover:shadow-lg hover:-translate-y-0.5"
                >
                  Get Started Now
                </Link>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
};

export default Index;
