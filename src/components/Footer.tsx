import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  UserCheck, 
  ShieldCheck, 
  UserPlus, 
  School,
  Heart
} from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-fud-navy text-white py-12">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <img 
                src="/lovable-uploads/39129dbf-f2c1-40e3-87f2-7f0c5879a17e.png" 
                alt="Virtual Student's ID" 
                className="h-10 w-auto brightness-200" 
              />
              <h3 className="text-xl font-semibold">Virtual Student's ID</h3>
            </div>
            <p className="text-sm text-gray-300 max-w-sm">
              Revolutionizing student identification and attendance with cutting-edge biometric verification technology.
            </p>
          </div>

          <div>
            <h4 className="text-lg font-medium mb-4">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/smart-attendance" className="text-sm text-gray-300 hover:text-white flex items-center gap-2 transition-colors">
                  <Calendar size={16} />
                  <span>Smart Attendance</span>
                </Link>
              </li>
              <li>
                <Link to="/exam-pass" className="text-sm text-gray-300 hover:text-white flex items-center gap-2 transition-colors">
                  <UserCheck size={16} />
                  <span>ExamPass ID</span>
                </Link>
              </li>
              <li>
                <Link to="/verify-me" className="text-sm text-gray-300 hover:text-white flex items-center gap-2 transition-colors">
                  <ShieldCheck size={16} />
                  <span>VerifyMe</span>
                </Link>
              </li>
              <li>
                <Link to="/add-student" className="text-sm text-gray-300 hover:text-white flex items-center gap-2 transition-colors">
                  <UserPlus size={16} />
                  <span>Add a Student</span>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-medium mb-4">University Access</h4>
            <ul className="space-y-3">
              <li className="text-sm text-gray-300 flex items-center gap-2">
                <School size={16} />
                <span>Gate Pass Verification</span>
              </li>
              <li className="text-sm text-gray-300 flex items-center gap-2">
                <ShieldCheck size={16} />
                <span>Library Access</span>
              </li>
              <li className="text-sm text-gray-300 flex items-center gap-2">
                <UserCheck size={16} />
                <span>Exam Hall Verification</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-700 text-center text-sm text-gray-400">
          <p className="flex items-center justify-center gap-1">
            Created for Federal University Dutse <Heart size={14} className="text-red-400" />
          </p>
          <p className="mt-1">© {new Date().getFullYear()} Virtual Student's ID. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
