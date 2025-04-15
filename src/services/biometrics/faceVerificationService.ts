
import { awsFaceService } from '../awsFaceService';

// Face verification operations
export const faceVerificationService = {
  // Verify face using AWS Rekognition
  async verifyFace(faceImageData: string) {
    console.log('Verifying face with AWS Rekognition');
    try {
      const result = await awsFaceService.verifyFace(faceImageData);
      console.log('Face verification result:', result);
      
      if (!result.success) {
        console.error('Face verification failed:', result.message);
        return { 
          isMatch: false, 
          error: result.message || 'Verification service error'
        };
      }
      
      if (result.matched && result.confidence) {
        const minimumThreshold = 80; // 80% confidence threshold
        if (result.confidence >= minimumThreshold) {
          return {
            isMatch: true,
            student: result.student,
            confidence: result.confidence
          };
        } else {
          console.log(`Face matched but confidence too low: ${result.confidence}`);
          return { 
            isMatch: false, 
            confidence: result.confidence,
            error: 'Face verification confidence too low'
          };
        }
      } else {
        console.log('No face match found');
        return { 
          isMatch: false,
          error: 'No matching face found'
        };
      }
    } catch (error) {
      console.error('Error verifying face:', error);
      return { 
        isMatch: false, 
        error: error instanceof Error ? error.message : 'Unknown error during face verification'
      };
    }
  }
};
