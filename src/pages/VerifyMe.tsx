
import React, { useState } from 'react';
import FadeIn from '@/components/animations/FadeIn';
import BiometricModal from '@/components/BiometricModal';
import { toast } from 'sonner';
import VerificationForm from '@/components/verification/VerificationForm';
import StudentDetailsCard from '@/components/verification/StudentDetailsCard';
import VerificationInfo from '@/components/verification/VerificationInfo';

const VerifyMe = () => {
  const [showBiometricModal, setShowBiometricModal] = useState(false);
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

  const handleStudentFound = (student: {
    id?: string;
    name: string;
    regNumber: string;
    level: string;
    department: string;
    photo: string;
  }) => {
    setFoundStudent(student);
    // Show biometric verification modal
    setShowBiometricModal(true);
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
          <VerificationForm 
            onStudentFound={handleStudentFound}
            onVerificationSuccess={handleVerificationSuccess}
            isVerified={isVerified}
            verificationMethod={verificationMethod}
            verificationTime={verificationTime}
            onReset={handleReset}
          />
        </FadeIn>

        <FadeIn direction="right" delay={100} className="lg:col-span-3">
          <StudentDetailsCard 
            student={foundStudent || {
              name: '',
              regNumber: '',
              level: '',
              department: '',
              photo: ''
            }}
            isVerified={isVerified && !!foundStudent}
            verificationMethod={verificationMethod}
            verificationTime={verificationTime}
          />
        </FadeIn>
      </div>

      <FadeIn delay={200}>
        <VerificationInfo />
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
