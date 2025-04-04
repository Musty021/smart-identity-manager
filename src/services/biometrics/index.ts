
import { studentService } from './studentService';
import { fingerprintService } from './fingerprintService';
import { biometricDataService } from './biometricDataService';
import { faceVerificationService } from './faceVerificationService';

// Combined biometric service that exports all functionality from individual modules
export const biometricService = {
  // Student data operations
  getStudentByRegNumber: studentService.getStudentByRegNumber,
  getStudentBiometrics: studentService.getStudentBiometrics,
  addStudent: studentService.addStudent,
  
  // Face verification
  verifyFace: faceVerificationService.verifyFace,
  
  // Fingerprint verification
  verifyFingerprint: fingerprintService.verifyFingerprint,
  
  // Direct access to services
  fingerprintService,
  faceVerificationService,
  
  // Biometric data management
  addBiometricData: biometricDataService.addBiometricData,
  updateBiometricData: biometricDataService.updateBiometricData
};
