import React, { useState } from 'react';
import { AlertCircle, Check, Search, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { biometricService } from '@/services/biometricService';

interface StudentData {
  id: string;
  name: string;
  regNumber: string;
  level: string;
  department: string;
  hasBiometrics: boolean;
}

interface SearchStudentProps {
  onStudentFound: (student: StudentData) => void;
  onReset: () => void;
  isProcessing: boolean;
  setIsProcessing: (value: boolean) => void;
  foundStudent: StudentData | null;
  isComplete: boolean;
}

const SearchStudent: React.FC<SearchStudentProps> = ({
  onStudentFound,
  onReset,
  isProcessing,
  setIsProcessing,
  foundStudent,
  isComplete
}) => {
  const [regNumber, setRegNumber] = useState('');
  const [searchClicked, setSearchClicked] = useState(false);

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
        
        onStudentFound({
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
      onStudentFound(null);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
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
            placeholder="FCP/CIT/22/1001"
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
            onClick={onReset}
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
            onClick={onReset}
            className="w-full mt-2"
          >
            Register Another Student
          </Button>
        </div>
      )}
    </div>
  );
};

export default SearchStudent;
