import React, { useState } from 'react';
import { BadgeCheck, Clock, ExternalLink, Fingerprint, Search, ShieldCheck, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FadeIn from '@/components/animations/FadeIn';
import BiometricModal from '@/components/BiometricModal';
import { toast } from 'sonner';

// Mock student data for demonstration
const mockStudentsDatabase = [
  { id: 1, name: 'Ahmed Ibrahim', regNumber: 'FUD/19/COM/1001', level: '400', department: 'Computer Science', photo: 'https://i.pravatar.cc/150?img=1' },
  { id: 2, name: 'Fatima Mohammed', regNumber: 'FUD/19/COM/1002', level: '400', department: 'Computer Science', photo: 'https://i.pravatar.cc/150?img=5' },
  { id: 3, name: 'Abubakar Sani', regNumber: 'FUD/19/COM/1003', level: '400', department: 'Computer Science', photo: 'https://i.pravatar.cc/150?img=3' },
  { id: 4, name: 'Zainab Yusuf', regNumber: 'FUD/19/COM/1004', level: '400', department: 'Computer Science', photo: 'https://i.pravatar.cc/150?img=9' },
  { id: 5, name: 'Ibrahim Hassan', regNumber: 'FUD/19/COM/1005', level: '400', department: 'Computer Science', photo: 'https://i.pravatar.cc/150?img=2' },
];

const VerifyMe = () => {
  const [showBiometricModal, setShowBiometricModal] = useState(false);
  const [regNumber, setRegNumber] = useState('');
  const [searchClicked, setSearchClicked] = useState(false);
  const [foundStudent, setFoundStudent] = useState<{
    name: string;
    regNumber: string;
    level: string;
    department: string;
    photo: string;
  } | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [verificationMethod, setVerificationMethod] = useState<'face' | 'fingerprint' | null>(null);
  const [verificationTime, setVerificationTime] = useState<string | null>(null);

  const handleSearch = () => {
    if (!regNumber) {
      toast.error('Please enter a registration number');
      return;
    }
    
    setSearchClicked(true);
    const student = mockStudentsDatabase.find(s => s.regNumber === regNumber);
    
    if (student) {
      setFoundStudent({
        name: student.name,
        regNumber: student.regNumber,
        level: student.level,
        department: student.department,
        photo: student.photo
      });
      setShowBiometricModal(true);
    } else {
      setFoundStudent(null);
      toast.error('Student not found', {
        description: 'No student with this registration number exists in our records'
      });
    }
  };

  const handleVerificationSuccess = (method: 'face' | 'fingerprint') => {
    setShowBiometricModal(false);
    setIsVerified(true);
    setVerificationMethod(method);
    setVerificationTime(new Date().toLocaleTimeString());
    
    toast.success('Identity verified successfully', {
      description: `Verified using ${method === 'face' ? 'Face ID' : 'Fingerprint'}`
    });
  };

  const handleReset = () => {
    setRegNumber('');
    setSearchClicked(false);
    setFoundStudent(null);
    setIsVerified(false);
    setVerificationMethod(null);
    setVerificationTime(null);
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <FadeIn>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-fud-navy mb-2">VerifyMe</h1>
          <p className="text-gray-600">
            Quick identity verification for campus services and access points
          </p>
        </div>
      </FadeIn>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <FadeIn direction="left" className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-fud-navy mb-6">Student Verification</h2>
            
            <div className="mb-6">
              <label htmlFor="regNumber" className="label-style">
                Registration Number
              </label>
              <div className="flex gap-2">
                <input
                  id="regNumber"
                  type="text"
                  placeholder="e.g. FUD/19/COM/1001"
                  value={regNumber}
                  onChange={(e) => setRegNumber(e.target.value)}
                  className="input-style flex-1"
                />
                <Button 
                  onClick={handleSearch}
                  className="bg-fud-green hover:bg-fud-green-dark text-white px-4"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Enter the student's registration number to verify their identity
              </p>
            </div>
            
            {searchClicked && !foundStudent && (
              <div className="p-4 rounded-lg bg-red-50 border border-red-100 mb-6">
                <p className="text-red-700 font-medium">
                  No student found with the provided registration number.
                </p>
                <p className="text-sm text-red-600 mt-1">
                  Please check the registration number and try again.
                </p>
              </div>
            )}
            
            {foundStudent && isVerified && (
              <div className="p-4 rounded-lg bg-green-50 border border-green-100 animate-fade-in">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <BadgeCheck className="h-5 w-5 text-green-600" />
                  </div>
                  <h3 className="text-lg font-medium text-green-800">Identity Verified</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <p className="text-xs text-gray-500">Verification Method</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      {verificationMethod === 'face' ? (
                        <ShieldCheck className="h-4 w-4 text-green-600" />
                      ) : (
                        <FingerPrint className="h-4 w-4 text-green-600" />
                      )}
                      <p className="text-sm font-medium text-green-700">
                        {verificationMethod === 'face' ? 'Face ID' : 'Fingerprint'}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Verification Time</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Clock className="h-4 w-4 text-green-600" />
                      <p className="text-sm font-medium text-green-700">
                        {verificationTime}
                      </p>
                    </div>
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="w-full"
                >
                  Verify Another Student
                </Button>
              </div>
            )}

            <div className="mt-6">
              <h3 className="text-sm font-medium text-fud-navy mb-3">Verification Use Cases</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-2 rounded-lg border border-gray-100 bg-gray-50">
                  <div className="w-8 h-8 rounded-full bg-fud-green/10 flex items-center justify-center">
                    <BadgeCheck className="h-4 w-4 text-fud-green" />
                  </div>
                  <span className="text-sm text-gray-700">Gate Access Verification</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg border border-gray-100 bg-gray-50">
                  <div className="w-8 h-8 rounded-full bg-fud-green/10 flex items-center justify-center">
                    <BadgeCheck className="h-4 w-4 text-fud-green" />
                  </div>
                  <span className="text-sm text-gray-700">Library Access</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg border border-gray-100 bg-gray-50">
                  <div className="w-8 h-8 rounded-full bg-fud-green/10 flex items-center justify-center">
                    <BadgeCheck className="h-4 w-4 text-fud-green" />
                  </div>
                  <span className="text-sm text-gray-700">Cafeteria Payment</span>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>

        <FadeIn direction="right" delay={100} className="lg:col-span-3">
          {foundStudent && isVerified ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-green-500 text-white px-4 py-1 text-sm font-medium">
                VERIFIED
              </div>
              
              <div className="flex flex-col md:flex-row items-center gap-6 mb-6">
                <div className="w-32 h-32 rounded-full overflow-hidden shadow-md border-4 border-white">
                  <img 
                    src={foundStudent.photo} 
                    alt={foundStudent.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="text-sm text-fud-green font-medium mb-1">AUTHORIZED STUDENT</div>
                  <h3 className="text-2xl font-semibold text-fud-navy mb-1">{foundStudent.name}</h3>
                  <p className="text-gray-600 mb-3">{foundStudent.regNumber}</p>
                  
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-fud-green/10 text-fud-green px-3 py-1 rounded-full text-xs font-medium">
                      {foundStudent.department}
                    </span>
                    <span className="bg-fud-navy/10 text-fud-navy px-3 py-1 rounded-full text-xs font-medium">
                      {foundStudent.level} Level
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-fud-navy mb-3">Verification Details</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Method</span>
                      <span className="text-sm font-medium text-fud-navy flex items-center gap-1">
                        {verificationMethod === 'face' ? (
                          <>
                            <ShieldCheck className="h-4 w-4" />
                            Face ID
                          </>
                        ) : (
                          <>
                            <Fingerprint className="h-4 w-4" />
                            Fingerprint
                          </>
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Time</span>
                      <span className="text-sm font-medium text-fud-navy">
                        {verificationTime}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Date</span>
                      <span className="text-sm font-medium text-fud-navy">
                        {new Date().toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Status</span>
                      <span className="text-sm font-medium text-green-600 flex items-center gap-1">
                        <BadgeCheck className="h-4 w-4" />
                        Verified
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-fud-navy mb-3">Access Permissions</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">University Campus</span>
                      <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-medium">
                        Authorized
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Library</span>
                      <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-medium">
                        Authorized
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Exam Halls</span>
                      <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-medium">
                        Authorized
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Labs & Workshops</span>
                      <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-medium">
                        Authorized
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-fud-navy p-4 rounded-lg flex items-center justify-between">
                <div>
                  <h4 className="text-white font-medium">Federal University Dutse</h4>
                  <p className="text-gray-300 text-sm">Official Student Verification</p>
                </div>
                <a 
                  href="#" 
                  className="flex items-center gap-1 text-white text-sm font-medium hover:text-gray-200 transition-colors"
                >
                  <span>University Portal</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="text-center py-20">
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-500 mb-2">Quick Identity Verification</h3>
                <p className="text-gray-500 max-w-md mx-auto mb-6">
                  Enter a student registration number and verify their identity using biometric authentication for campus services and access points
                </p>
                
                <div className="max-w-md mx-auto grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                    <h4 className="font-medium text-fud-navy mb-1">1. Search</h4>
                    <p className="text-xs text-gray-500">Enter student ID</p>
                  </div>
                  <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                    <h4 className="font-medium text-fud-navy mb-1">2. Verify</h4>
                    <p className="text-xs text-gray-500">Biometric scan</p>
                  </div>
                  <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                    <h4 className="font-medium text-fud-navy mb-1">3. Access</h4>
                    <p className="text-xs text-gray-500">Grant permissions</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </FadeIn>
      </div>

      <FadeIn delay={200}>
        <div className="mt-10 p-6 rounded-xl bg-fud-navy/5 border border-fud-navy/10">
          <h3 className="text-lg font-semibold text-fud-navy mb-3">About VerifyMe</h3>
          <p className="text-gray-600 mb-4">
            VerifyMe provides quick identity verification for students across various campus facilities. The system ensures that only authorized individuals gain access to university services, enhancing security and preventing fraud.
          </p>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h4 className="font-medium text-fud-navy mb-2">Campus Gates</h4>
              <p className="text-sm text-gray-600">
                Secure entry points with biometric verification
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h4 className="font-medium text-fud-navy mb-2">Library Access</h4>
              <p className="text-sm text-gray-600">
                Verify identity for library and resource access
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h4 className="font-medium text-fud-navy mb-2">Event Entry</h4>
              <p className="text-sm text-gray-600">
                Control access to university events and functions
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h4 className="font-medium text-fud-navy mb-2">Lab Access</h4>
              <p className="text-sm text-gray-600">
                Restrict lab access to authorized students only
              </p>
            </div>
          </div>
        </div>
      </FadeIn>

      <BiometricModal
        isOpen={showBiometricModal}
        onClose={() => setShowBiometricModal(false)}
        onSuccess={handleVerificationSuccess}
        title="Identity Verification"
        description="Please verify your identity using biometric authentication"
      />
    </div>
  );
};

export default VerifyMe;
