
import React, { useState, useRef } from 'react';
import { Calendar, Download, Search, UserCheck, Users, ArrowLeft, FileText, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import FadeIn from '@/components/animations/FadeIn';
import BiometricModal from '@/components/BiometricModal';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

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

type CourseFormValues = {
  courseName: string;
  courseCode: string;
};

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

  const form = useForm<CourseFormValues>({
    defaultValues: {
      courseName: '',
      courseCode: '',
    },
  });

  const handleCourseFormSubmit = (data: CourseFormValues) => {
    setCurrentCourse(`${data.courseCode}: ${data.courseName}`);
    setCurrentStep('attendance');
    toast.success('Course details saved. Ready to take attendance.');
  };

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.regNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
    form.reset();
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
        <FadeIn>
          <div className="max-w-xl mx-auto">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold mb-4 text-center">Start New Attendance Session</h2>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleCourseFormSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="courseName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Course Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Introduction to Programming" required {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="courseCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Course Code</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. CIT 101" required {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" className="w-full bg-fud-green hover:bg-fud-green-dark">
                    <Calendar className="mr-2 h-4 w-4" />
                    Start Attendance Session
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        </FadeIn>
      )}

      {currentStep === 'attendance' && (
        <FadeIn>
          <div className="mb-4">
            <Button variant="outline" onClick={handleResetForm} className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Course Form
            </Button>
          </div>

          <div ref={reportRef} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-8">
            <div className="flex flex-col md:flex-row justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-fud-navy">{currentCourse}</h2>
                <div className="flex items-center text-gray-600 mt-1">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{currentDate}</span>
                </div>
                <div className="text-gray-600 mt-1">
                  <span>Department: Information Technology</span>
                </div>
              </div>
              
              <div className="flex gap-3 mt-4 md:mt-0">
                <Button 
                  onClick={handleTakeAttendance}
                  className="bg-fud-green hover:bg-fud-green-dark text-white"
                >
                  <UserCheck className="mr-2 h-4 w-4" />
                  Mark Attendance
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={handleDownloadPDF}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Download PDF</span>
                </Button>
              </div>
            </div>
            
            <div className="mb-4">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by name or reg number"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
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
                <span>Total: {students.length} students</span>
              </div>
              <div className="text-sm text-gray-500 flex items-center">
                <span className="mr-4">
                  <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-1"></span> Present: {presentCount}
                </span>
                <span>
                  <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-1"></span> Absent: {absentCount}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <FileText className="mr-2 h-5 w-5 text-fud-green" />
              Attendance Summary
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-4xl font-bold text-fud-navy">{students.length}</div>
                <div className="text-gray-500">Total Students</div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-4xl font-bold text-green-600">{presentCount}</div>
                <div className="text-gray-500">Present</div>
              </div>
              
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="text-4xl font-bold text-red-600">{absentCount}</div>
                <div className="text-gray-500">Absent</div>
              </div>
            </div>
            
            <div className="mt-6">
              <Button 
                onClick={handleDownloadPDF}
                className="w-full bg-fud-green hover:bg-fud-green-dark"
              >
                <Download className="mr-2 h-4 w-4" />
                Download Attendance Report
              </Button>
            </div>
          </div>
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
