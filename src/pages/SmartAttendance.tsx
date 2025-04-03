
import React, { useState, useRef } from 'react';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import FadeIn from '@/components/animations/FadeIn';
import BiometricModal from '@/components/BiometricModal';
import CourseForm, { CourseFormValues } from '@/components/attendance/CourseForm';
import AttendanceTable from '@/components/attendance/AttendanceTable';
import AttendanceStats from '@/components/attendance/AttendanceStats';
import AttendanceSummary from '@/components/attendance/AttendanceSummary';
import AttendanceHeader from '@/components/attendance/AttendanceHeader';

// Mock data for Information Technology department
const mockStudents = [
  { id: 1, name: 'Ahmed Ibrahim', regNumber: 'FCP/CIT/22/1001', level: '200', department: 'Information Technology', present: false },
  { id: 2, name: 'Fatima Mohammed', regNumber: 'FCP/CIT/22/1002', level: '200', department: 'Information Technology', present: false },
  { id: 3, name: 'Abubakar Sani', regNumber: 'FCP/CIT/22/1003', level: '200', department: 'Information Technology', present: false },
  { id: 4, name: 'Zainab Yusuf', regNumber: 'FCP/CIT/22/1004', level: '200', department: 'Information Technology', present: false },
  { id: 5, name: 'Ibrahim Hassan', regNumber: 'FCP/CIT/22/1005', level: '200', department: 'Information Technology', present: false },
  { id: 6, name: 'Aisha Abdullahi', regNumber: 'FCP/CIT/22/1006', level: '200', department: 'Information Technology', present: false },
  { id: 7, name: 'Umar Musa', regNumber: 'FCP/CIT/22/1007', level: '200', department: 'Information Technology', present: false },
  { id: 8, name: 'Halima Lawal', regNumber: 'FCP/CIT/22/1008', level: '200', department: 'Information Technology', present: false },
];

const SmartAttendance = () => {
  const [showBiometricModal, setShowBiometricModal] = useState(false);
  const [currentStep, setCurrentStep] = useState<'form' | 'attendance'>('form');
  const [searchQuery, setSearchQuery] = useState('');
  const [students, setStudents] = useState(mockStudents);
  const [currentCourse, setCurrentCourse] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }));
  const reportRef = useRef<HTMLDivElement>(null);

  const handleCourseFormSubmit = (data: CourseFormValues) => {
    setCurrentCourse(`${data.courseCode}: ${data.courseName}`);
    setCurrentStep('attendance');
    toast.success('Course details saved. Ready to take attendance.');
  };

  const handleTakeAttendance = () => {
    setShowBiometricModal(true);
  };

  const handleVerificationSuccess = (method: 'face' | 'fingerprint') => {
    setShowBiometricModal(false);
    
    // For demo purposes, randomly select a student who is not already marked present
    const notPresentStudents = students.filter(s => !s.present);
    
    if (notPresentStudents.length > 0) {
      const randomStudent = notPresentStudents[Math.floor(Math.random() * notPresentStudents.length)];
      
      setStudents(prev => prev.map(student => 
        student.id === randomStudent.id ? { ...student, present: true } : student
      ));
      
      toast.success(`Attendance recorded for ${randomStudent.name}`, {
        description: `Verified using ${method === 'face' ? 'Face ID' : 'Fingerprint'}`
      });
    } else {
      toast.info("All students have been marked present already.");
    }
  };

  const handleDownloadPDF = async () => {
    if (reportRef.current) {
      try {
        toast.info('Generating PDF, please wait...');
        
        const canvas = await html2canvas(reportRef.current, {
          scale: 2,
          logging: false,
          useCORS: true,
        });
        
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 210;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        pdf.save(`${currentCourse.replace(':', '-')}_attendance_${new Date().toLocaleDateString().replace(/\//g, '-')}.pdf`);
        
        toast.success('Attendance report downloaded successfully');
      } catch (error) {
        console.error('Error generating PDF:', error);
        toast.error('Failed to generate PDF. Please try again.');
      }
    }
  };

  const handleResetForm = () => {
    setCurrentStep('form');
    setStudents(mockStudents.map(student => ({ ...student, present: false })));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const presentCount = students.filter(s => s.present).length;
  const absentCount = students.length - presentCount;

  return (
    <div className="container mx-auto px-6 py-8">
      <FadeIn>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-fud-navy mb-2">Smart Attendance</h1>
          <p className="text-gray-600">
            Biometric verification for accurate and efficient attendance tracking
          </p>
        </div>
      </FadeIn>

      {currentStep === 'form' && (
        <CourseForm onSubmit={handleCourseFormSubmit} />
      )}

      {currentStep === 'attendance' && (
        <FadeIn>
          <AttendanceHeader 
            courseInfo={currentCourse}
            currentDate={currentDate}
            onBack={handleResetForm}
            onTakeAttendance={handleTakeAttendance}
            onDownloadPDF={handleDownloadPDF}
          />

          <div ref={reportRef} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-8">
            <AttendanceTable
              students={students}
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
            />
            
            <AttendanceStats
              totalStudents={students.length}
              presentCount={presentCount}
              absentCount={absentCount}
            />
          </div>

          <AttendanceSummary
            totalStudents={students.length}
            presentCount={presentCount}
            absentCount={absentCount}
            onDownload={handleDownloadPDF}
          />
        </FadeIn>
      )}

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
