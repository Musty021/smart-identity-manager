
import { supabase } from '@/integrations/supabase/client';

// Define response types
interface FaceRegistrationResponse {
  success: boolean;
  faceId?: string;
  imageUrl?: string;
  message: string;
  error?: string;
}

interface FaceVerificationResponse {
  success: boolean;
  matched?: boolean;
  confidence?: number;
  student?: {
    id: string;
    name: string;
    reg_number: string;
    level: string;
    department: string;
  };
  message: string;
  error?: string;
}

// Service for AWS face recognition operations
export const awsFaceService = {
  // Register a face with AWS Rekognition
  async registerFace(studentId: string, imageData: string): Promise<FaceRegistrationResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('face-recognition', {
        body: {
          action: 'register-face',
          studentId,
          imageData
        }
      });

      if (error) {
        console.error('Error registering face:', error);
        return {
          success: false,
          message: 'Failed to register face',
          error: error.message
        };
      }

      return data as FaceRegistrationResponse;
    } catch (error) {
      console.error('Error in registerFace:', error);
      return {
        success: false,
        message: 'An unexpected error occurred during face registration',
        error: error.message
      };
    }
  },

  // Verify a face against AWS Rekognition collection
  async verifyFace(imageData: string): Promise<FaceVerificationResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('face-recognition', {
        body: {
          action: 'verify-face',
          verifyImageData: imageData
        }
      });

      if (error) {
        console.error('Error verifying face:', error);
        return {
          success: false,
          message: 'Failed to verify face',
          error: error.message
        };
      }

      return data as FaceVerificationResponse;
    } catch (error) {
      console.error('Error in verifyFace:', error);
      return {
        success: false,
        message: 'An unexpected error occurred during face verification',
        error: error.message
      };
    }
  },

  // Delete a face from AWS Rekognition collection
  async deleteFace(faceId: string): Promise<{ success: boolean; message: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('face-recognition', {
        body: {
          action: 'delete-face',
          faceIdToDelete: faceId
        }
      });

      if (error) {
        console.error('Error deleting face:', error);
        return {
          success: false,
          message: 'Failed to delete face: ' + error.message
        };
      }

      return data as { success: boolean; message: string };
    } catch (error) {
      console.error('Error in deleteFace:', error);
      return {
        success: false,
        message: 'An unexpected error occurred while deleting face'
      };
    }
  }
};
