
import { awsFaceService } from '../awsFaceService';

// Face verification operations
export const faceVerificationService = {
  // Verify face using AWS Rekognition
  async verifyFace(faceImageData: string) {
    console.log('Verifying face with AWS Rekognition');
    try {
      const result = await awsFaceService.verifyFace(faceImageData);
      console.log('Face verification result:', result);
      
      if (result.success && result.matched && result.confidence && result.confidence >= 90) {
        return {
          isMatch: true,
          student: result.student,
          confidence: result.confidence
        };
      } else {
        return { isMatch: false };
      }
    } catch (error) {
      console.error('Error verifying face:', error);
      return { isMatch: false, error };
    }
  }
};
