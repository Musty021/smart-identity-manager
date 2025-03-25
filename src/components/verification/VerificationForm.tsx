
import React, { useState } from 'react';
import { BadgeCheck, Clock, Fingerprint, Search, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { biometricService } from '@/services/biometricService';

interface VerificationFormProps {
  onStudentFound: (student: {
    id?: string;
    name: string;
    regNumber: string;
    level: string;
    department: string;
    photo: string;
  }) => void;
  onVerificationSuccess: (method: 'face' | 'fingerprint') => void;
  isVerified: boolean;
  verificationMethod: 'face' | 'fingerprint' | null;
  verificationTime: string | null;
  onReset: () => void;
}

const VerificationForm: React.FC<VerificationFormProps> = ({
  onStudentFound,
  onVerificationSuccess,
  isVerified,
  verificationMethod,
  verificationTime,
  onReset
}) => {
  const [regNumber, setRegNumber] = useState('');
  const [searchClicked, setSearchClicked] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

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
          return;
        }
        
        onStudentFound({
          id: studentData.id,
          name: studentData.name,
          regNumber: studentData.reg_number,
          level: studentData.level,
          department: studentData.department,
          photo: biometricData?.face_image_url || 'https://i.pravatar.cc/150?img=1'
        });
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

  return (
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
            placeholder="FCP/CIT/22/1001"
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
      
      {searchClicked && !isSearching && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-100 mb-6">
          <p className="text-red-700 font-medium">
            No student found with the provided registration number.
          </p>
          <p className="text-sm text-red-600 mt-1">
            Please check the registration number and try again.
          </p>
        </div>
      )}
      
      {isVerified && (
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
                  <Fingerprint className="h-4 w-4 text-green-600" />
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
            onClick={onReset}
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
  );
};

export default VerificationForm;
