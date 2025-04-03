
import React from 'react';
import { Calendar, UserCheck, Download, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AttendanceHeaderProps {
  courseInfo: string;
  currentDate: string;
  onBack: () => void;
  onTakeAttendance: () => void;
  onDownloadPDF: () => void;
}

const AttendanceHeader: React.FC<AttendanceHeaderProps> = ({
  courseInfo,
  currentDate,
  onBack,
  onTakeAttendance,
  onDownloadPDF
}) => {
  return (
    <div>
      <div className="mb-4">
        <Button variant="outline" onClick={onBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Course Form
        </Button>
      </div>

      <div className="flex flex-col md:flex-row justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-fud-navy">{courseInfo}</h2>
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
            onClick={onTakeAttendance}
            className="bg-fud-green hover:bg-fud-green-dark text-white"
          >
            <UserCheck className="mr-2 h-4 w-4" />
            Mark Attendance
          </Button>
          
          <Button 
            variant="outline"
            onClick={onDownloadPDF}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            <span>Download PDF</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AttendanceHeader;
