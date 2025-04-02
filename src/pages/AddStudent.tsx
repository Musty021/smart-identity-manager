
import React, { useState, useEffect } from 'react';
import FadeIn from '@/components/animations/FadeIn';
import { toast } from 'sonner';
import { biometricService } from '@/services/biometricService';

// Import refactored components
import SearchStudent from '@/components/student-biometrics/SearchStudent';
import RegistrationSteps from '@/components/student-biometrics/RegistrationSteps';
import FaceCapture from '@/components/student-biometrics/FaceCapture';
import FingerprintCapture from '@/components/student-biometrics/FingerprintCapture';
import ConfirmationStep from '@/components/student-biometrics/ConfirmationStep';
import WelcomeView from '@/components/student-biometrics/WelcomeView';
import AboutRegistration from '@/components/student-biometrics/AboutRegistration';

const AddStudent = () => {
  const [foundStudent, setFoundStudent] = useState<{
    id: string;
    name: string;
    regNumber: string;
    level: string;
    department: string;
    hasBiometrics: boolean;
  } | null>(null);
  
  const [step, setStep] = useState(1);
  const [faceImageCaptured, setFaceImageCaptured] = useState(false);
  const [fingerprintCaptured, setFingerprintCaptured] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [faceImageData, setFaceImageData] = useState<string | null>(null);
  const [fingerprintData, setFingerprintData] = useState<ArrayBuffer | null>(null);
  const [searchClicked, setSearchClicked] = useState(false);
  const [registrationError, setRegistrationError] = useState<string | null>(null);

  useEffect(() => {
    handleReset();
  }, []);

  const handleFaceCapture = (imageSrc: string) => {
    setFaceImageData(imageSrc);
    setFaceImageCaptured(!!imageSrc);
    toast.success('Face image captured successfully');
  };

  const handleCaptureFingerprint = () => {
    setIsProcessing(true);
    
    setTimeout(() => {
      const mockFingerprintData = new ArrayBuffer(50);
      setFingerprintData(mockFingerprintData);
      setFingerprintCaptured(true);
      setIsProcessing(false);
      toast.success('Fingerprint captured successfully');
    }, 1500);
  };

  const handleNext = () => {
    if (step === 1 && !faceImageCaptured) {
      toast.error('Please capture face image first');
      return;
    }
    
    if (step === 2 && !fingerprintCaptured) {
      toast.error('Please capture fingerprint first');
      return;
    }
    
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleSubmitBiometrics();
    }
  };

  const handleSubmitBiometrics = async () => {
    if (!foundStudent) return;
    
    setIsProcessing(true);
    setRegistrationError(null);
    
    try {
      // For development purposes, we'll modify how we handle missing AWS registration
      await biometricService.addBiometricData({
        student_id: foundStudent.id,
        face_image_data: faceImageData,
        fingerprint_template: fingerprintData,
        has_face: faceImageCaptured,
        has_fingerprint: fingerprintCaptured
      });
      
      setIsComplete(true);
      toast.success('Student biometrics added successfully', {
        description: 'The student can now use biometric verification for campus services'
      });
    } catch (error) {
      console.error('Error saving biometric data:', error);
      setRegistrationError('An error occurred while saving biometric data. Please try again.');
      toast.error('Error saving biometric data', {
        description: 'An error occurred while saving. Please try again.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFoundStudent(null);
    setStep(1);
    setFaceImageCaptured(false);
    setFingerprintCaptured(false);
    setIsComplete(false);
    setFaceImageData(null);
    setFingerprintData(null);
    setSearchClicked(false);
    setRegistrationError(null);
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <FadeIn>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-fud-navy mb-2">Add a Student</h1>
          <p className="text-gray-600">
            Register student biometric data for facial recognition and fingerprint verification
          </p>
        </div>
      </FadeIn>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <FadeIn direction="left" className="lg:col-span-1">
          <SearchStudent 
            onStudentFound={setFoundStudent}
            onReset={handleReset}
            isProcessing={isProcessing}
            setIsProcessing={setIsProcessing}
            foundStudent={foundStudent}
            isComplete={isComplete}
          />
          
          {(foundStudent || searchClicked) && <RegistrationSteps currentStep={step} />}
        </FadeIn>

        <FadeIn direction="right" delay={100} className="lg:col-span-2">
          {foundStudent && !foundStudent.hasBiometrics && !isComplete ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              {registrationError && (
                <div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-6">
                  <p className="text-red-700 text-sm font-medium">{registrationError}</p>
                  <p className="text-red-600 text-xs mt-1">
                    Note: While AWS face registration might fail in development, 
                    the student data will still be stored locally for testing.
                  </p>
                </div>
              )}
              
              {step === 1 && (
                <FaceCapture
                  onFaceCapture={handleFaceCapture}
                  onNext={handleNext}
                  onCancel={handleReset}
                  faceImageCaptured={faceImageCaptured}
                  faceImageData={faceImageData}
                />
              )}
              
              {step === 2 && (
                <FingerprintCapture
                  onFingerprintCapture={() => {
                    setFingerprintCaptured(false);
                    handleCaptureFingerprint();
                  }}
                  onNext={handleNext}
                  onBack={() => setStep(1)}
                  fingerprintCaptured={fingerprintCaptured}
                  isProcessing={isProcessing}
                />
              )}
              
              {step === 3 && (
                <ConfirmationStep
                  onSubmit={handleSubmitBiometrics}
                  onBack={() => setStep(2)}
                  isProcessing={isProcessing}
                  studentData={{
                    name: foundStudent.name,
                    regNumber: foundStudent.regNumber,
                    department: foundStudent.department,
                    level: foundStudent.level
                  }}
                />
              )}
            </div>
          ) : (
            <WelcomeView />
          )}
        </FadeIn>
      </div>

      <FadeIn delay={200}>
        <AboutRegistration />
      </FadeIn>
    </div>
  );
};

export default AddStudent;
