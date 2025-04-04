
import React, { useState } from 'react';
import { BadgeCheck, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FadeIn from '@/components/animations/FadeIn';
import BiometricModal from '@/components/BiometricModal';
import { toast } from 'sonner';
import { biometricService } from '@/services/biometricService';

const ExamPassID = () => {
  const [showBiometricModal, setShowBiometricModal] = useState(false);
  const [regNumber, setRegNumber] = useState('');
  const [searchClicked, setSearchClicked] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [foundStudent, setFoundStudent] = useState<{
    id?: string;
    name: string;
    regNumber: string;
    level: string;
    department: string;
    photo: string;
  } | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [verificationMethod, setVerificationMethod] = useState<'face' | 'fingerprint' | null>(null);
  const [verificationTime, setVerificationTime] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!regNumber) {
      toast.error('Please enter a registration number');
      return;
    }
    
    setSearchClicked(true);
    setIsSearching(true);
    
    try {
      // Get student by registration number using biometric service
      const studentData = await biometricService.getStudentByRegNumber(regNumber);
      
      if (studentData) {
        // Get student biometric data
        const biometricData = await biometricService.getStudentBiometrics(studentData.id);
        
        if (!biometricData || (!biometricData.has_face && !biometricData.has_fingerprint)) {
          toast.error('Biometric data not found for this student', {
            description: 'Student exists but has no biometric data registered'
          });
          setIsSearching(false);
          return;
        }
        
        const student = {
          id: studentData.id,
          name: studentData.name,
          regNumber: studentData.reg_number,
          level: studentData.level,
          department: studentData.department,
          photo: biometricData?.face_image_url || 'https://i.pravatar.cc/150?img=1'
        };
        
        setFoundStudent(student);
        // Show biometric verification modal
        setShowBiometricModal(true);
      } else {
        toast.error('Student not found', {
          description: 'No student with this registration number exists in our records'
        });
      }
    } catch (error) {
      console.error('Error searching for student:', error);
      toast.error('Error searching for student', {
        description: 'An error occurred while searching. Please try again.'
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleVerificationSuccess = (method: 'face' | 'fingerprint', studentId?: string) => {
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
          <h1 className="text-3xl font-bold text-fud-navy mb-2">ExamPass ID</h1>
          <p className="text-gray-600">
            Verify student identity for secure exam hall access
          </p>
        </div>
      </FadeIn>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <FadeIn direction="left">
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
                  placeholder="e.g. FCP/CIT/22/1001"
                  value={regNumber}
                  onChange={(e) => setRegNumber(e.target.value)}
                  className="input-style flex-1"
                  disabled={isSearching}
                />
                <Button 
                  onClick={handleSearch}
                  className="bg-fud-green hover:bg-fud-green-dark text-white px-4"
                  disabled={isSearching}
                >
                  {isSearching ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Search
                    </>
                  )}
                </Button>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Enter the student's registration number to verify their identity
              </p>
            </div>
            
            {searchClicked && !foundStudent && !isSearching && (
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
                    <p className="text-sm font-medium text-green-700">
                      {verificationMethod === 'face' ? 'Face ID' : 'Fingerprint'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Verification Time</p>
                    <p className="text-sm font-medium text-green-700">
                      {verificationTime}
                    </p>
                  </div>
                </div>
                
                <p className="text-green-700 mb-4">
                  Student is authorized for exam hall access
                </p>
                
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="w-full"
                >
                  Verify Another Student
                </Button>
              </div>
            )}
          </div>
        </FadeIn>

        <FadeIn direction="right" delay={100}>
          {foundStudent && isVerified ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-green-500 text-white px-4 py-1 text-sm font-medium">
                VERIFIED
              </div>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-green-200">
                  <img 
                    src={foundStudent.photo} 
                    alt={foundStudent.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-fud-navy">{foundStudent.name}</h3>
                  <p className="text-gray-500">{foundStudent.regNumber}</p>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg grid gap-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Department</p>
                    <p className="font-medium text-fud-navy">{foundStudent.department}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Level</p>
                    <p className="font-medium text-fud-navy">{foundStudent.level}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Access Status</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-3 h-3 rounded-full bg-green-500"></span>
                    <p className="font-medium text-green-700">Authorized for Exam Hall Access</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg border border-dashed border-gray-300 bg-gray-50">
                <h4 className="text-center font-semibold text-fud-navy mb-3">EXAM PASS</h4>
                <p className="text-center text-gray-600 text-sm mb-3">
                  Valid for all scheduled examinations
                </p>
                <div className="border-t border-gray-300 pt-3 text-center">
                  <p className="text-xs text-gray-500">
                    This digital ID has been verified using biometric authentication.
                    <br />Any attempt to falsify this pass is a violation of university regulations.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-center justify-center min-h-[300px]">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <BadgeCheck className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-500 mb-2">Student ID Verification</h3>
                <p className="text-gray-500 max-w-sm">
                  Search for a student using their registration number and verify their identity for exam hall access
                </p>
              </div>
            </div>
          )}
        </FadeIn>
      </div>

      <FadeIn delay={200}>
        <div className="mt-10 p-6 rounded-xl bg-fud-navy/5 border border-fud-navy/10">
          <h3 className="text-lg font-semibold text-fud-navy mb-3">About ExamPass ID</h3>
          <p className="text-gray-600 mb-4">
            The ExamPass ID system ensures that only registered students gain access to examination halls, preventing impersonation and maintaining academic integrity. The system uses biometric verification to authenticate student identities before exams.
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h4 className="font-medium text-fud-navy mb-2">Secure Authentication</h4>
              <p className="text-sm text-gray-600">
                Dual biometric verification with facial recognition and fingerprint scanning
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h4 className="font-medium text-fud-navy mb-2">Fraud Prevention</h4>
              <p className="text-sm text-gray-600">
                Eliminates the possibility of exam impersonation or identity fraud
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h4 className="font-medium text-fud-navy mb-2">Quick Verification</h4>
              <p className="text-sm text-gray-600">
                Fast identification process allows for efficient entry into examination halls
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
        description="Please verify your identity for exam hall access"
      />
    </div>
  );
};

export default ExamPassID;
