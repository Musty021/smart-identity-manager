
import React from 'react';
import { Users, GraduationCap } from 'lucide-react';

interface AttendanceStatsProps {
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  department?: string;
}

const AttendanceStats: React.FC<AttendanceStatsProps> = ({ 
  totalStudents, 
  presentCount, 
  absentCount,
  department = 'Information Technology'
}) => {
  return (
    <div className="mt-6 space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500 flex items-center">
          <GraduationCap className="h-4 w-4 mr-1" />
          <span>Department: {department}</span>
        </div>
        <div className="text-sm text-gray-500 flex items-center">
          <Users className="h-4 w-4 mr-1" />
          <span>Total: {totalStudents} students</span>
        </div>
      </div>
      
      <div className="flex items-center justify-end">
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
  );
};

export default AttendanceStats;
