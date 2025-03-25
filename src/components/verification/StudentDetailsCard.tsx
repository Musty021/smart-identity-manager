
import React from 'react';
import { BadgeCheck, Clock, ExternalLink, Fingerprint, ShieldCheck } from 'lucide-react';

interface StudentDetailsCardProps {
  student: {
    name: string;
    regNumber: string;
    level: string;
    department: string;
    photo: string;
  };
  isVerified: boolean;
  verificationMethod: 'face' | 'fingerprint' | null;
  verificationTime: string | null;
}

const StudentDetailsCard: React.FC<StudentDetailsCardProps> = ({
  student,
  isVerified,
  verificationMethod,
  verificationTime
}) => {
  if (!isVerified) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-center py-20">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-500 mb-2">Quick Identity Verification</h3>
          <p className="text-gray-500 max-w-md mx-auto mb-6">
            Enter a student registration number and verify their identity using biometric authentication for campus services and access points
          </p>
          
          <div className="max-w-md mx-auto grid grid-cols-3 gap-4 text-center">
            <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
              <h4 className="font-medium text-fud-navy mb-1">1. Search</h4>
              <p className="text-xs text-gray-500">Enter student ID</p>
            </div>
            <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
              <h4 className="font-medium text-fud-navy mb-1">2. Verify</h4>
              <p className="text-xs text-gray-500">Biometric scan</p>
            </div>
            <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
              <h4 className="font-medium text-fud-navy mb-1">3. Access</h4>
              <p className="text-xs text-gray-500">Grant permissions</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 bg-green-500 text-white px-4 py-1 text-sm font-medium">
        VERIFIED
      </div>
      
      <div className="flex flex-col md:flex-row items-center gap-6 mb-6">
        <div className="w-32 h-32 rounded-full overflow-hidden shadow-md border-4 border-white">
          <img 
            src={student.photo} 
            alt={student.name} 
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <div className="text-sm text-fud-green font-medium mb-1">AUTHORIZED STUDENT</div>
          <h3 className="text-2xl font-semibold text-fud-navy mb-1">{student.name}</h3>
          <p className="text-gray-600 mb-3">{student.regNumber}</p>
          
          <div className="flex flex-wrap gap-2">
            <span className="bg-fud-green/10 text-fud-green px-3 py-1 rounded-full text-xs font-medium">
              {student.department}
            </span>
            <span className="bg-fud-navy/10 text-fud-navy px-3 py-1 rounded-full text-xs font-medium">
              {student.level} Level
            </span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-fud-navy mb-3">Verification Details</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Method</span>
              <span className="text-sm font-medium text-fud-navy flex items-center gap-1">
                {verificationMethod === 'face' ? (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    Face ID
                  </>
                ) : (
                  <>
                    <Fingerprint className="h-4 w-4" />
                    Fingerprint
                  </>
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Time</span>
              <span className="text-sm font-medium text-fud-navy">
                {verificationTime}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Date</span>
              <span className="text-sm font-medium text-fud-navy">
                {new Date().toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Status</span>
              <span className="text-sm font-medium text-green-600 flex items-center gap-1">
                <BadgeCheck className="h-4 w-4" />
                Verified
              </span>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-fud-navy mb-3">Access Permissions</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">University Campus</span>
              <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-medium">
                Authorized
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Library</span>
              <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-medium">
                Authorized
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Exam Halls</span>
              <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-medium">
                Authorized
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Labs & Workshops</span>
              <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-medium">
                Authorized
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-fud-navy p-4 rounded-lg flex items-center justify-between">
        <div>
          <h4 className="text-white font-medium">Federal University Dutse</h4>
          <p className="text-gray-300 text-sm">Official Student Verification</p>
        </div>
        <a 
          href="#" 
          className="flex items-center gap-1 text-white text-sm font-medium hover:text-gray-200 transition-colors"
        >
          <span>University Portal</span>
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
};

export default StudentDetailsCard;
