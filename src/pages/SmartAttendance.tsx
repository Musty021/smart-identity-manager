
import React, { useState } from 'react';
import { Calendar, Download, Search, UserCheck, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FadeIn from '@/components/animations/FadeIn';
import BiometricModal from '@/components/BiometricModal';
import { toast } from 'sonner';

// Mock data for demonstration
const mockStudents = [
  { id: 1, name: 'Ahmed Ibrahim', regNumber: 'FUD/19/COM/1001', level: '400', department: 'Computer Science', present: true },
  { id: 2, name: 'Fatima Mohammed', regNumber: 'FUD/19/COM/1002', level: '400', department: 'Computer Science', present: true },
  { id: 3, name: 'Abubakar Sani', regNumber: 'FUD/19/COM/1003', level: '400', department: 'Computer Science', present: true },
  { id: 4, name: 'Zainab Yusuf', regNumber: 'FUD/19/COM/1004', level: '400', department: 'Computer Science', present: false },
  { id: 5, name: 'Ibrahim Hassan', regNumber: 'FUD/19/COM/1005', level: '400', department: 'Computer Science', present: true },
  { id: 6, name: 'Aisha Abdullahi', regNumber: 'FUD/19/COM/1006', level: '400', department: 'Computer Science', present: false },
  { id: 7, name: 'Umar Musa', regNumber: 'FUD/19/COM/1007', level: '400', department: 'Computer Science', present: true },
  { id: 8, name: 'Halima Lawal', regNumber: 'FUD/19/COM/1008', level: '400', department: 'Computer Science', present: false },
];

const SmartAttendance = () => {
  const [showBiometricModal, setShowBiometricModal] = useState(false);
  const [attendanceRecorded, setAttendanceRecorded] = useState(false);
  const [verifiedStudent, setVerifiedStudent] = useState<{
    name: string;
    regNumber: string;
    level: string;
    department: string;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentCourse, setCurrentCourse] = useState('COM 401: Advanced Database Systems');
  const [currentDate, setCurrentDate] = useState(new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }));

  const filteredStudents = mockStudents.filter(student => 
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.regNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTakeAttendance = () => {
    setShowBiometricModal(true);
  };

  const handleVerificationSuccess = (method: 'face' | 'fingerprint') => {
    setShowBiometricModal(false);
    
    // For demo purposes, randomly select a student from mock data
    const randomStudent = mockStudents[Math.floor(Math.random() * 5)];
    
    setVerifiedStudent({
      name: randomStudent.name,
      regNumber: randomStudent.regNumber,
      level: randomStudent.level,
      department: randomStudent.department
    });
    
    setAttendanceRecorded(true);
    
    toast.success(`Attendance recorded for ${randomStudent.name}`, {
      description: `Verified using ${method === 'face' ? 'Face ID' : 'Fingerprint'}`
    });
  };

  const handleDownloadReport = () => {
    toast.success('Attendance report downloaded successfully');
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <FadeIn>
        <div className="flex flex-col md:flex-row gap-4 md:gap-8 md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-fud-navy mb-2">Smart Attendance</h1>
            <p className="text-gray-600">
              Biometric verification for accurate and efficient attendance tracking
            </p>
          </div>
          <Button 
            onClick={handleTakeAttendance}
            className="bg-fud-green hover:bg-fud-green-dark text-white"
          >
            <UserCheck className="mr-2 h-4 w-4" />
            Take Attendance
          </Button>
        </div>
      </FadeIn>

      {attendanceRecorded && verifiedStudent && (
        <FadeIn>
          <div className="mb-8 p-6 rounded-xl bg-green-50 border border-green-100">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-green-800">Attendance Recorded</h3>
                <p className="text-green-700">Student successfully verified and marked present</p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="text-fud-navy font-medium">{verifiedStudent.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Registration Number</p>
                <p className="text-fud-navy font-medium">{verifiedStudent.regNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Level</p>
                <p className="text-fud-navy font-medium">{verifiedStudent.level}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Department</p>
                <p className="text-fud-navy font-medium">{verifiedStudent.department}</p>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              onClick={() => {
                setAttendanceRecorded(false);
                setVerifiedStudent(null);
                setShowBiometricModal(true);
              }}
              className="mt-2"
            >
              Verify Another Student
            </Button>
          </div>
        </FadeIn>
      )}

      <FadeIn delay={100}>
        <div className="mb-8 p-6 rounded-xl bg-white border border-gray-200 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4 justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold mb-1">{currentCourse}</h3>
              <div className="flex items-center text-gray-500">
                <Calendar className="h-4 w-4 mr-1" />
                <span className="text-sm">{currentDate}</span>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or reg number"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-style pl-9 min-w-[250px]"
                />
              </div>
              
              <Button 
                variant="outline"
                onClick={handleDownloadReport}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                <span>Download</span>
              </Button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-3 px-4 text-left font-medium text-gray-600 text-sm">Name</th>
                  <th className="py-3 px-4 text-left font-medium text-gray-600 text-sm">Reg Number</th>
                  <th className="py-3 px-4 text-left font-medium text-gray-600 text-sm">Level</th>
                  <th className="py-3 px-4 text-left font-medium text-gray-600 text-sm">Department</th>
                  <th className="py-3 px-4 text-left font-medium text-gray-600 text-sm">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">{student.name}</td>
                    <td className="py-3 px-4">{student.regNumber}</td>
                    <td className="py-3 px-4">{student.level}</td>
                    <td className="py-3 px-4">{student.department}</td>
                    <td className="py-3 px-4">
                      <span 
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          student.present 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {student.present ? 'Present' : 'Absent'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-500 flex items-center">
              <Users className="h-4 w-4 mr-1" />
              <span>Total: {mockStudents.length} students</span>
            </div>
            <div className="text-sm text-gray-500 flex items-center">
              <span className="mr-4">
                <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-1"></span> Present: {mockStudents.filter(s => s.present).length}
              </span>
              <span>
                <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-1"></span> Absent: {mockStudents.filter(s => !s.present).length}
              </span>
            </div>
          </div>
        </div>
      </FadeIn>

      <BiometricModal
        isOpen={showBiometricModal}
        onClose={() => setShowBiometricModal(false)}
        onSuccess={handleVerificationSuccess}
        title="Attendance Verification"
        description="Please verify your identity to mark your attendance"
      />
    </div>
  );
};

export default SmartAttendance;
