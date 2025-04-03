
import React from 'react';
import { FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AttendanceSummaryProps {
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  onDownload: () => void;
}

const AttendanceSummary: React.FC<AttendanceSummaryProps> = ({
  totalStudents,
  presentCount,
  absentCount,
  onDownload
}) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <FileText className="mr-2 h-5 w-5 text-fud-green" />
        Attendance Summary
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-4xl font-bold text-fud-navy">{totalStudents}</div>
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
          onClick={onDownload}
          className="w-full bg-fud-green hover:bg-fud-green-dark"
        >
          <Download className="mr-2 h-4 w-4" />
          Download Attendance Report
        </Button>
      </div>
    </div>
  );
};

export default AttendanceSummary;
