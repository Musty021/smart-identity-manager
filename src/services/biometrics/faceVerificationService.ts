
import { awsFaceService } from '../awsFaceService';

// Face verification operations
export const faceVerificationService = {
  // Verify face using AWS Rekognition
  async verifyFace(faceImageData: string) {
    console.log('Starting face verification process with AWS Rekognition');
    try {
      // Make sure the image data is valid
      if (!faceImageData || !faceImageData.startsWith('data:image')) {
        console.error('Invalid image format provided for verification');
        return { 
          isMatch: false, 
          error: 'Invalid image format provided'
        };
      }

      // Call AWS service for verification
      const result = await awsFaceService.verifyFace(faceImageData);
      console.log('Face verification result received:', result);
      
      if (!result.success) {
        console.error('Face verification service returned an error:', result.message);
        return { 
          isMatch: false, 
          error: result.message || 'Verification service error'
        };
      }
      
      // If no face was detected in the image
      if (result.message && result.message.includes('No faces detected')) {
        console.log('No faces detected in the provided image');
        return {
          isMatch: false,
          error: 'No face detected in the provided image. Please try again with a clearer photo.'
        };
      }
      
      // Check if face was matched
      if (result.matched && result.confidence) {
        const minimumThreshold = 70; // Lower threshold to 70% confidence
        console.log(`Face matched with confidence: ${result.confidence}%, threshold: ${minimumThreshold}%`);
        
        if (result.confidence >= minimumThreshold) {
          return {
            isMatch: true,
            student: result.student,
            confidence: result.confidence
          };
        } else {
          console.log(`Face matched but confidence too low: ${result.confidence}%`);
          return { 
            isMatch: false, 
            confidence: result.confidence,
            error: 'Face verification confidence too low'
          };
        }
      } else {
        console.log('No face match found in our system');
        return { 
          isMatch: false,
          error: 'No matching face found in our records'
        };
      }
    } catch (error) {
      console.error('Error during face verification process:', error);
      return { 
        isMatch: false, 
        error: error instanceof Error ? error.message : 'Unknown error during face verification'
      };
    }
  }
};
