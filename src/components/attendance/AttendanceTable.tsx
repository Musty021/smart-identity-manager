
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export interface Student {
  id: number;
  name: string;
  regNumber: string;
  level: string;
  department: string;
  present: boolean;
}

interface AttendanceTableProps {
  students: Student[];
  searchQuery: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const AttendanceTable: React.FC<AttendanceTableProps> = ({
  students,
  searchQuery,
  onSearchChange,
}) => {
  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.regNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className="mb-4">
        <div className="relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by name or reg number"
            value={searchQuery}
            onChange={onSearchChange}
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
    </div>
  );
};

export default AttendanceTable;
