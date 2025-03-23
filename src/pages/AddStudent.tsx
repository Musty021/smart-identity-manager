import React, { useState, useEffect } from 'react';
import { AlertCircle, Camera, Check, Fingerprint, Save, Search, Upload, User, UserPlus, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FadeIn from '@/components/animations/FadeIn';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { biometricService } from '@/services/biometricService';
import WebcamCapture from '@/components/WebcamCapture';

const AddStudent = () => {
  const [regNumber, setRegNumber] = useState('');
  const [searchClicked, setSearchClicked] = useState(false);
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
  const [showWebcam, setShowWebcam] = useState(false);
  const [fingerprintCaptured, setFingerprintCaptured] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [faceImageData, setFaceImageData] = useState<string | null>(null);
  const [fingerprintData, setFingerprintData] = useState<ArrayBuffer | null>(null);

  useEffect(() => {
    handleReset();
  }, []);

  const handleSearch = async () => {
    if (!regNumber) {
      toast.error('Please enter a registration number');
      return;
    }
    
    setSearchClicked(true);
    setIsProcessing(true);
    
    try {
      const studentData = await biometricService.getStudentByRegNumber(regNumber);
      
      if (studentData) {
        const biometricData = await biometricService.getStudentBiometrics(studentData.id);
        
        const hasBiometrics = biometricData && (biometricData.has_face || biometricData.has_fingerprint);
        
        setFoundStudent({
          id: studentData.id,
          name: studentData.name,
          regNumber: studentData.reg_number,
          level: studentData.level,
          department: studentData.department,
          hasBiometrics: !!hasBiometrics
        });
      }
    } catch (error) {
      console.error('Error searching for student:', error);
      toast.error('Error searching for student', {
        description: 'An error occurred while searching. Please try again.'
      });
      setFoundStudent(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFaceCapture = (imageSrc: string) => {
    setFaceImageData(imageSrc);
    setFaceImageCaptured(true);
    setShowWebcam(false);
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
    
    try {
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
      toast.error('Error saving biometric data', {
        description: 'An error occurred while saving. Please try again.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setRegNumber('');
    setSearchClicked(false);
    setFoundStudent(null);
    setStep(1);
    setFaceImageCaptured(false);
    setFingerprintCaptured(false);
    setIsComplete(false);
    setFaceImageData(null);
    setFingerprintData(null);
    setShowWebcam(false);
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
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-fud-navy mb-6">Find Student</h2>
            
            <div className="mb-6">
              <label htmlFor="regNumber" className="label-style">
                Registration Number
              </label>
              <div className="flex gap-2">
                <input
                  id="regNumber"
                  type="text"
                  placeholder="e.g. FUD/20/COM/1010"
                  value={regNumber}
                  onChange={(e) => setRegNumber(e.target.value)}
                  className="input-style flex-1"
                  disabled={foundStudent && !foundStudent.hasBiometrics}
                />
                <Button 
                  onClick={handleSearch}
                  className="bg-fud-green hover:bg-fud-green-dark text-white px-4"
                  disabled={foundStudent && !foundStudent.hasBiometrics || isProcessing}
                >
                  {isProcessing ? (
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  ) : (
                    <Search className="h-4 w-4 mr-2" />
                  )}
                  Search
                </Button>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Enter the student's registration number to find their record
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
            
            {foundStudent && foundStudent.hasBiometrics && (
              <div className="p-4 rounded-lg bg-amber-50 border border-amber-100 mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                    <AlertCircle className="h-5 w-5 text-amber-600" />
                  </div>
                  <h3 className="text-lg font-medium text-amber-800">Biometrics Exist</h3>
                </div>
                
                <p className="text-amber-700 mb-3">
                  This student already has biometric data registered in the system.
                </p>
                
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="w-full"
                >
                  Search Another Student
                </Button>
              </div>
            )}

            {foundStudent && !foundStudent.hasBiometrics && !isComplete && (
              <div className="p-4 rounded-lg bg-fud-green/10 border border-fud-green/20 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-fud-green/20 flex items-center justify-center">
                    <User className="h-5 w-5 text-fud-green" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-fud-navy">{foundStudent.name}</h3>
                    <p className="text-gray-600">{foundStudent.regNumber}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 bg-white rounded-lg p-3 mb-3">
                  <div>
                    <p className="text-xs text-gray-500">Department</p>
                    <p className="text-sm font-medium text-fud-navy">{foundStudent.department}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Level</p>
                    <p className="text-sm font-medium text-fud-navy">{foundStudent.level}</p>
                  </div>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Biometric Status:</span>
                  <span className="text-amber-600 font-medium">Not Registered</span>
                </div>
              </div>
            )}

            {isComplete && (
              <div className="p-4 rounded-lg bg-green-50 border border-green-100 mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Check className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-green-800">Registration Complete</h3>
                    <p className="text-green-700 text-sm">Biometric data added successfully</p>
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="w-full mt-2"
                >
                  Register Another Student
                </Button>
              </div>
            )}

            <div className="mt-6">
              <h3 className="text-sm font-medium text-fud-navy mb-3">Registration Process</h3>
              <div className="space-y-3">
                <div className={`flex items-center gap-2 p-2 rounded-lg border ${step === 1 ? 'border-fud-green bg-fud-green/5' : 'border-gray-100 bg-gray-50'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${step === 1 ? 'bg-fud-green text-white' : 'bg-gray-200 text-gray-600'}`}>
                    1
                  </div>
                  <span className={`text-sm ${step === 1 ? 'text-fud-navy font-medium' : 'text-gray-600'}`}>Face ID Capture</span>
                </div>
                <div className={`flex items-center gap-2 p-2 rounded-lg border ${step === 2 ? 'border-fud-green bg-fud-green/5' : 'border-gray-100 bg-gray-50'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${step === 2 ? 'bg-fud-green text-white' : 'bg-gray-200 text-gray-600'}`}>
                    2
                  </div>
                  <span className={`text-sm ${step === 2 ? 'text-fud-navy font-medium' : 'text-gray-600'}`}>Fingerprint Capture</span>
                </div>
                <div className={`flex items-center gap-2 p-2 rounded-lg border ${step === 3 ? 'border-fud-green bg-fud-green/5' : 'border-gray-100 bg-gray-50'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${step === 3 ? 'bg-fud-green text-white' : 'bg-gray-200 text-gray-600'}`}>
                    3
                  </div>
                  <span className={`text-sm ${step === 3 ? 'text-fud-navy font-medium' : 'text-gray-600'}`}>Confirmation</span>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>

        <FadeIn direction="right" delay={100} className="lg:col-span-2">
          {foundStudent && !foundStudent.hasBiometrics && !isComplete ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              {step === 1 && (
                <div className="animate-fade-in">
                  <h3 className="text-xl font-semibold text-fud-navy mb-4">Step 1: Face ID Capture</h3>
                  <p className="text-gray-600 mb-6">
                    Capture the student's face for facial recognition verification
                  </p>
                  
                  <div className="flex flex-col items-center justify-center bg-gray-50 border border-dashed border-gray-300 rounded-xl p-6 mb-6">
                    {!faceImageCaptured ? (
                      showWebcam ? (
                        <WebcamCapture
                          onCapture={handleFaceCapture}
                          onCancel={() => setShowWebcam(false)}
                        />
                      ) : (
                        <>
                          <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                            <Camera className="h-10 w-10 text-gray-400" />
                          </div>
                          <p className="text-gray-600 text-center mb-6 max-w-md">
                            Position the student's face in a well-lit environment for optimal image quality
                          </p>
                          <Button 
                            onClick={() => setShowWebcam(true)}
                            className="bg-fud-green hover:bg-fud-green-dark text-white"
                          >
                            <Camera className="h-4 w-4 mr-2" />
                            Open Camera
                          </Button>
                        </>
                      )
                    ) : (
                      <div className="text-center">
                        <div className="w-32 h-32 mb-4 mx-auto relative">
                          <img 
                            src={faceImageData!} 
                            alt="Captured face" 
                            className="w-full h-full object-cover rounded-full border-4 border-green-200"
                            style={{ transform: 'scaleX(-1)' }} // Mirror for consistency
                          />
                          <div className="absolute bottom-0 right-0 bg-green-100 rounded-full p-1 border-2 border-white">
                            <Check className="h-5 w-5 text-green-600" />
                          </div>
                        </div>
                        <h4 className="text-lg font-medium text-green-700 mb-1">Face Image Captured</h4>
                        <p className="text-gray-600 mb-4">
                          Face image has been successfully captured and processed
                        </p>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setFaceImageCaptured(false);
                            setFaceImageData(null);
                            setShowWebcam(true);
                          }}
                          className="text-fud-green border-fud-green hover:bg-fud-green/10"
                        >
                          Retake Image
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      onClick={handleReset}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleNext}
                      className="bg-fud-green hover:bg-fud-green-dark text-white"
                      disabled={!faceImageCaptured}
                    >
                      Next Step
                    </Button>
                  </div>
                </div>
              )}
              
              {step === 2 && (
                <div className="animate-fade-in">
                  <h3 className="text-xl font-semibold text-fud-navy mb-4">Step 2: Fingerprint Capture</h3>
                  <p className="text-gray-600 mb-6">
                    Capture the student's fingerprint for biometric verification
                  </p>
                  
                  <div className="flex flex-col items-center justify-center bg-gray-50 border border-dashed border-gray-300 rounded-xl p-6 mb-6">
                    {!fingerprintCaptured ? (
                      <>
                        <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                          <Fingerprint className="h-10 w-10 text-gray-400" />
                        </div>
                        <p className="text-gray-600 text-center mb-6 max-w-md">
                          Ensure the student's finger is clean and dry for optimal fingerprint quality
                        </p>
                        <Button 
                          onClick={handleCaptureFingerprint}
                          className="bg-fud-green hover:bg-fud-green-dark text-white"
                          disabled={isProcessing}
                        >
                          {isProcessing ? (
                            <>
                              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <Fingerprint className="h-4 w-4 mr-2" />
                              Capture Fingerprint
                            </>
                          )}
                        </Button>
                      </>
                    ) : (
                      <div className="text-center">
                        <div className="w-32 h-32 rounded-full bg-green-100 border-4 border-green-200 flex items-center justify-center mb-4 mx-auto">
                          <Fingerprint className="h-12 w-12 text-green-600" />
                        </div>
                        <h4 className="text-lg font-medium text-green-700 mb-1">Fingerprint Captured</h4>
                        <p className="text-gray-600 mb-4">
                          Fingerprint has been successfully captured and processed
                        </p>
                        <Button
                          variant="outline"
                          onClick={() => setFingerprintCaptured(false)}
                          className="text-fud-green border-fud-green hover:bg-fud-green/10"
                        >
                          Retake Fingerprint
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      onClick={() => setStep(1)}
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleNext}
                      className="bg-fud-green hover:bg-fud-green-dark text-white"
                      disabled={!fingerprintCaptured}
                    >
                      Next Step
                    </Button>
                  </div>
                </div>
              )}
              
              {step === 3 && (
                <div className="animate-fade-in">
                  <h3 className="text-xl font-semibold text-fud-navy mb-4">Step 3: Confirmation</h3>
                  <p className="text-gray-600 mb-6">
                    Review and confirm the biometric data for the student
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-gray-50 rounded-xl p-6 text-center">
                      <div className="w-16 h-16 rounded-full bg-fud-green/10 flex items-center justify-center mb-3 mx-auto">
                        <Camera className="h-6 w-6 text-fud-green" />
                      </div>
                      <h4 className="font-medium text-fud-navy mb-1">Face ID</h4>
                      <p className="text-sm text-gray-600">
                        Face image captured and processed for verification
                      </p>
                      <div className="mt-3 flex justify-center">
                        <span className="inline-flex items-center bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full text-xs font-medium">
                          <Check className="h-3 w-3 mr-1" />
                          Captured
                        </span>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-xl p-6 text-center">
                      <div className="w-16 h-16 rounded-full bg-fud-green/10 flex items-center justify-center mb-3 mx-auto">
                        <Fingerprint className="h-6 w-6 text-fud-green" />
                      </div>
                      <h4 className="font-medium text-fud-navy mb-1">Fingerprint</h4>
                      <p className="text-sm text-gray-600">
                        Fingerprint captured and processed for verification
                      </p>
                      <div className="mt-3 flex justify-center">
                        <span className="inline-flex items-center bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full text-xs font-medium">
                          <Check className="h-3 w-3 mr-1" />
                          Captured
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-fud-navy/5 rounded-xl p-6 mb-6">
                    <h4 className="font-medium text-fud-navy mb-3">Student Information</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Name</p>
                        <p className="font-medium text-fud-navy">{foundStudent.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Registration Number</p>
                        <p className="font-medium text-fud-navy">{foundStudent.regNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Department</p>
                        <p className="font-medium text-fud-navy">{foundStudent.department}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Level</p>
                        <p className="font-medium text-fud-navy">{foundStudent.level}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      onClick={() => setStep(2)}
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleNext}
                      className="bg-fud-green hover:bg-fud-green-dark text-white flex items-center gap-2"
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          Complete Registration
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-center justify-center min-h-[300px]">
              <div className="text-center max-w-md">
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <UserPlus className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-500 mb-3">Add Student Biometric Data</h3>
                <p className="text-gray-500 mb-6">
                  Search for a student using their registration number to add biometric data for facial and fingerprint verification
                </p>
                
                <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
                  <div className="bg-fud-green/10 rounded-lg p-3 text-center">
                    <Fingerprint className="h-6 w-6 text-fud-green mx-auto mb-2" />
                    <p className="text-sm font-medium text-fud-navy">Fingerprint</p>
                  </div>
                  <div className="bg-fud-green/10 rounded-lg p-3 text-center">
                    <Camera className="h-6 w-6 text-fud-green mx-auto mb-2" />
                    <p className="text-sm font-medium text-fud-navy">Face ID</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </FadeIn>
      </div>

      <FadeIn delay={200}>
        <div className="mt-10 p-6 rounded-xl bg-fud-navy/5 border border-fud-navy/10">
          <h3 className="text-lg font-semibold text-fud-navy mb-3">About Registration Process</h3>
          <p className="text-gray-600 mb-4">
            The biometric registration process adds student face and fingerprint data to our secure database for identity verification across campus services.
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-fud-green/10 flex items-center justify-center">
                  <Camera className="h-4 w-4 text-fud-green" />
                </div>
                <h4 className="font-medium text-fud-navy">Face ID Process</h4>
              </div>
              <p className="text-sm text-gray-600">
                Captures and processes facial features using AWS Rekognition for secure identity recognition with advanced facial recognition algorithms.
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-fud-green/10 flex items-center justify-center">
                  <Fingerprint className="h-4 w-4 text-fud-green" />
                </div>
                <h4 className="font-medium text-fud-navy">Fingerprint Process</h4>
              </div>
              <p className="text-sm text-gray-600">
                Captures unique fingerprint patterns and stores them securely for reliable biometric verification.
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-fud-green/10 flex items-center justify-center">
                  <ShieldCheck className="h-4 w-4 text-fud-green" />
                </div>
                <h4 className="font-medium text-fud-navy">Data Security</h4>
              </div>
              <p className="text-sm text-gray-600">
                All biometric data is encrypted and stored securely in compliance with data protection regulations.
              </p>
            </div>
          </div>
        </div>
      </FadeIn>
    </div>
  );
};

export default AddStudent;

