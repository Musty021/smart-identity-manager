import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Shield, Users, Fingerprint, Eye, ArrowRight, CheckCircle, Building, FileText, Star, Building2, UserCheck, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import FadeIn from '@/components/animations/FadeIn';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import smartIdentityLogo from '@/assets/smart-identity-logo.png';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
      <Header />
      
      {/* Hero Section with Nigerian Government Style */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-r from-green-600 to-green-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto text-center relative z-10">
          <FadeIn>
            <div className="mb-8">
              <img 
                src={smartIdentityLogo} 
                alt="Smart Identity Manager" 
                className="w-24 h-24 mx-auto mb-6 bg-white rounded-full p-2 shadow-lg"
              />
              <h1 className="text-5xl font-bold mb-6">
                Smart Identity Manager
              </h1>
              <p className="text-xl max-w-4xl mx-auto leading-relaxed text-green-50">
                Nigeria's Centralized Digital Identity Verification Platform. 
                Secure biometric authentication for educational institutions, government agencies, and private organizations across Nigeria.
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <Link to="/get-started">
                <Button size="lg" className="bg-white text-green-700 hover:bg-green-50 px-8 py-3 text-lg font-semibold">
                  Get Started <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/add-member">
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10 px-8 py-3 text-lg">
                  Register Member
                </Button>
              </Link>
              <Link to="/verify-me">
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10 px-8 py-3 text-lg">
                  Verify Identity
                </Button>
              </Link>
            </div>
            
            {/* Nigerian Flag Colors Accent */}
            <div className="flex justify-center items-center gap-2 mb-8">
              <div className="w-4 h-8 bg-green-600 rounded"></div>
              <div className="w-4 h-8 bg-white rounded"></div>
              <div className="w-4 h-8 bg-green-600 rounded"></div>
              <span className="ml-4 text-green-100 text-sm font-medium">Federal Republic of Nigeria</span>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Organization Types Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="container mx-auto">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Serving All Nigerian Organizations</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Comprehensive identity verification for educational institutions, government agencies, and private organizations
              </p>
            </div>
          </FadeIn>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FadeIn direction="up" delay={100}>
              <Card className="p-8 text-center hover:shadow-lg transition-all duration-300 border-l-4 border-l-green-600">
                <Building className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Educational Institutions</h3>
                <p className="text-gray-600 mb-4">
                  Universities, Polytechnics, Secondary & Primary Schools
                </p>
                <ul className="text-sm text-gray-500 text-left space-y-1">
                  <li>• Registration Numbers</li>
                  <li>• Matriculation Numbers</li>
                  <li>• Student & Staff IDs</li>
                </ul>
              </Card>
            </FadeIn>
            
            <FadeIn direction="up" delay={200}>
              <Card className="p-8 text-center hover:shadow-lg transition-all duration-300 border-l-4 border-l-green-600">
                <Shield className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Government Agencies</h3>
                <p className="text-gray-600 mb-4">
                  FRSC, VIO, KAROTA, Police, Immigration, Customs
                </p>
                <ul className="text-sm text-gray-500 text-left space-y-1">
                  <li>• NIN Verification</li>
                  <li>• Driver's License</li>
                  <li>• Officer IDs</li>
                  <li>• Voter Registration</li>
                </ul>
              </Card>
            </FadeIn>
            
            <FadeIn direction="up" delay={300}>
              <Card className="p-8 text-center hover:shadow-lg transition-all duration-300 border-l-4 border-l-green-600">
                <Star className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Private Organizations</h3>
                <p className="text-gray-600 mb-4">
                  Companies, NGOs, Healthcare, Financial Services
                </p>
                <ul className="text-sm text-gray-500 text-left space-y-1">
                  <li>• Employee IDs</li>
                  <li>• Business Registration</li>
                  <li>• Access Control</li>
                  <li>• Membership Cards</li>
                </ul>
              </Card>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Advanced Biometric Solutions</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Cutting-edge technology for secure identity management and verification
              </p>
            </div>
          </FadeIn>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FadeIn direction="up" delay={100}>
              <Card className="p-8 text-center hover:shadow-lg transition-shadow">
                <Fingerprint className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Fingerprint Authentication</h3>
                <p className="text-gray-600">
                  Advanced fingerprint scanning and verification with high-accuracy biometric matching
                </p>
              </Card>
            </FadeIn>
            
            <FadeIn direction="up" delay={200}>
              <Card className="p-8 text-center hover:shadow-lg transition-shadow">
                <Eye className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Facial Recognition</h3>
                <p className="text-gray-600">
                  AI-powered facial recognition technology for seamless and secure identity verification
                </p>
              </Card>
            </FadeIn>
            
            <FadeIn direction="up" delay={300}>
              <Card className="p-8 text-center hover:shadow-lg transition-shadow">
                <Users className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Smart Attendance</h3>
                <p className="text-gray-600">
                  Automated attendance tracking using biometric verification for accurate records
                </p>
              </Card>
            </FadeIn>
            
            <FadeIn direction="up" delay={400}>
              <Link to="/add-member" className="block">
                <Card className="p-8 text-center hover:shadow-lg transition-all duration-300 hover:bg-green-50 cursor-pointer">
                  <Building2 className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">Add Members</h3>
                  <p className="text-gray-600">
                    Register new members with biometric enrollment and document verification
                  </p>
                </Card>
              </Link>
            </FadeIn>
            
            <FadeIn direction="up" delay={500}>
              <Link to="/verify-me" className="block">
                <Card className="p-8 text-center hover:shadow-lg transition-all duration-300 hover:bg-green-50 cursor-pointer">
                  <UserCheck className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">VerifyMe</h3>
                  <p className="text-gray-600">
                    Quick identity verification for services and access points
                  </p>
                </Card>
              </Link>
            </FadeIn>
            
            <FadeIn direction="up" delay={600}>
              <Link to="/smart-attendance" className="block">
                <Card className="p-8 text-center hover:shadow-lg transition-all duration-300 hover:bg-green-50 cursor-pointer">
                  <FileText className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">Smart Attendance</h3>
                  <p className="text-gray-600">
                    Automated attendance recording with real-time biometric verification
                  </p>
                </Card>
              </Link>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-6 bg-white">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <FadeIn direction="left">
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-6">Nigeria's Most Trusted Identity Platform</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-1">99.9% Accuracy Rate</h3>
                      <p className="text-gray-600">Advanced AI algorithms ensure highly accurate biometric matching</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-1">NDPR Compliant</h3>
                      <p className="text-gray-600">Full compliance with Nigeria Data Protection Regulation and international standards</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-1">Centralized Verification</h3>
                      <p className="text-gray-600">Single platform for all Nigerian identity verification needs</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-1">Multi-Organization Support</h3>
                      <p className="text-gray-600">Supports educational, government, and private sector organizations</p>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
            
            <FadeIn direction="right">
              <Card className="p-8 border-l-4 border-l-green-600 bg-gradient-to-br from-green-50 to-white">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">Join the Digital Nigeria Initiative</h3>
                <p className="text-gray-600 mb-6 text-center">
                  Be part of Nigeria's digital transformation with secure, reliable identity management
                </p>
                <div className="space-y-3">
                  <Link to="/add-member" className="w-full block">
                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                      Register New Member
                    </Button>
                  </Link>
                  <Link to="/verify-me" className="w-full block">
                    <Button variant="outline" className="w-full border-green-600 text-green-600 hover:bg-green-50">
                      Verify Identity
                    </Button>
                  </Link>
                  <Link to="/smart-attendance" className="w-full block">
                    <Button variant="outline" className="w-full border-green-600 text-green-600 hover:bg-green-50">
                      Smart Attendance
                    </Button>
                  </Link>
                </div>
                
                {/* Government Endorsement Style */}
                <div className="mt-6 pt-6 border-t border-green-200 text-center">
                  <div className="flex justify-center items-center gap-2 mb-2">
                    <div className="w-3 h-6 bg-green-600 rounded"></div>
                    <div className="w-3 h-6 bg-white border border-gray-300 rounded"></div>
                    <div className="w-3 h-6 bg-green-600 rounded"></div>
                  </div>
                  <p className="text-xs text-gray-500">Proudly Nigerian</p>
                </div>
              </Card>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Featured Locations */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="container mx-auto">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Serving Nigeria Nationwide</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Trusted by organizations across all 36 states and the Federal Capital Territory
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-center">
            {[
              "Lagos", "Abuja", "Kano", "Rivers", "Oyo", "Kaduna",
              "Anambra", "Enugu", "Delta", "Ogun", "Cross River", "Edo"
            ].map((state, index) => (
              <FadeIn key={state} delay={index * 50}>
                <Card className="p-4 hover:shadow-md transition-shadow">
                  <MapPin className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-700">{state}</p>
                </Card>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;