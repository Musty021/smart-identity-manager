
import React from 'react';
import { Users } from 'lucide-react';

interface AttendanceStatsProps {
  totalStudents: number;
  presentCount: number;
  absentCount: number;
}

const AttendanceStats: React.FC<AttendanceStatsProps> = ({ 
  totalStudents, 
  presentCount, 
  absentCount 
}) => {
  return (
    <div className="mt-6 flex items-center justify-between">
      <div className="text-sm text-gray-500 flex items-center">
        <Users className="h-4 w-4 mr-1" />
        <span>Total: {totalStudents} students</span>
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
  );
};

export default AttendanceStats;
