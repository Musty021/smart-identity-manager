
import { supabase, secureBiometricOps } from '@/integrations/supabase/client';
import { awsFaceService } from '../awsFaceService';

// Biometric data management operations
export const biometricDataService = {
  // Add biometric data for a student with AWS face recognition
  async addBiometricData(biometricData: {
    student_id: string;
    face_image_url?: string | null;
    face_image_data?: string | null;
    fingerprint_template?: ArrayBuffer | null;
    has_face: boolean;
    has_fingerprint: boolean;
  }) {
    try {
      // Register face with AWS Rekognition if face image data is provided
      let faceId = null;
      let faceImageUrl = biometricData.face_image_url;
      
      if (biometricData.face_image_data && biometricData.has_face) {
        console.log('Registering face with AWS Rekognition');
        const registrationResult = await awsFaceService.registerFace(
          biometricData.student_id,
          biometricData.face_image_data
        );
        
        if (registrationResult.success) {
          faceId = registrationResult.faceId;
          faceImageUrl = registrationResult.imageUrl;
          console.log('Face registered successfully:', faceId);
        } else {
          console.error('Face registration failed:', registrationResult.message);
          throw new Error(registrationResult.message);
        }
      }
      
      // Convert fingerprint template to string for storage
      const fingerprintString = biometricData.fingerprint_template 
        ? secureBiometricOps.encodeTemplate(biometricData.fingerprint_template)
        : null;
      
      // Prepare data for insertion
      const dataToInsert = {
        student_id: biometricData.student_id,
        face_id: faceId,
        face_image_url: faceImageUrl,
        fingerprint_template: fingerprintString,
        has_face: biometricData.has_face,
        has_fingerprint: biometricData.has_fingerprint,
        updated_at: new Date().toISOString()
      };
      
      // Insert/update data in Supabase
      const { data, error } = await supabase
        .from('student_biometrics')
        .upsert(dataToInsert)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error adding biometric data:', error);
      throw error;
    }
  },
  
  // Update biometric data for a student with AWS face recognition support
  async updateBiometricData(studentId: string, biometricData: {
    face_image_url?: string | null;
    face_image_data?: string | null;
    fingerprint_template?: ArrayBuffer | null;
    has_face?: boolean;
    has_fingerprint?: boolean;
  }) {
    try {
      const dataToUpdate: Record<string, any> = {
        updated_at: new Date().toISOString()
      };
      
      // Handle face registration/update with AWS Rekognition
      if (biometricData.face_image_data && biometricData.has_face) {
        console.log('Registering/updating face with AWS Rekognition');
        const registrationResult = await awsFaceService.registerFace(
          studentId,
          biometricData.face_image_data
        );
        
        if (registrationResult.success) {
          dataToUpdate.face_id = registrationResult.faceId;
          dataToUpdate.face_image_url = registrationResult.imageUrl;
          console.log('Face registered/updated successfully:', registrationResult.faceId);
        } else {
          console.error('Face registration/update failed:', registrationResult.message);
          throw new Error(registrationResult.message);
        }
      } else {
        if (biometricData.face_image_url !== undefined) {
          dataToUpdate.face_image_url = biometricData.face_image_url;
        }
      }
      
      if (biometricData.has_face !== undefined) {
        dataToUpdate.has_face = biometricData.has_face;
      }
      
      if (biometricData.has_fingerprint !== undefined) {
        dataToUpdate.has_fingerprint = biometricData.has_fingerprint;
      }
      
      if (biometricData.fingerprint_template) {
        // Convert ArrayBuffer to Base64 string for storage
        dataToUpdate.fingerprint_template = secureBiometricOps.encodeTemplate(
          biometricData.fingerprint_template
        );
      }
      
      const { data, error } = await supabase
        .from('student_biometrics')
        .update(dataToUpdate)
        .eq('student_id', studentId)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error updating biometric data:', error);
      throw error;
    }
  }
};
