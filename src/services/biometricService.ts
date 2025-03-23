
import { supabase } from '@/integrations/supabase/client';

// This service handles biometric operations
export const biometricService = {
  // Get student by registration number
  async getStudentByRegNumber(regNumber: string) {
    const { data, error } = await supabase
      .from('fud_students')
      .select('id, name, reg_number, level, department')
      .eq('reg_number', regNumber)
      .single();
    
    if (error) {
      throw error;
    }
    
    return data;
  },
  
  // Get student's biometric data
  async getStudentBiometrics(studentId: string) {
    const { data, error } = await supabase
      .from('student_biometrics')
      .select('*')
      .eq('student_id', studentId)
      .maybeSingle();
    
    if (error) {
      throw error;
    }
    
    return data;
  },
  
  // Verify fingerprint (in a real app, this would be done server-side)
  async verifyFingerprint(studentId: string, fingerprintSample: ArrayBuffer) {
    // In a real implementation:
    // 1. The fingerprint would be captured on the client
    // 2. The template would be created client-side or sent to a server
    // 3. The matching would be done server-side against stored templates
    // 4. The server would return a match result
    
    // For demo purposes, we'll simulate fingerprint verification
    // with a random success probability
    return new Promise<boolean>((resolve) => {
      setTimeout(() => {
        // 80% chance of successful verification
        const isMatch = Math.random() > 0.2;
        resolve(isMatch);
      }, 1000);
    });
  },
  
  // Verify face (in a real app, this would be done server-side)
  async verifyFace(studentId: string, faceImageData: string) {
    // Similar to fingerprint verification, this would normally
    // be implemented server-side with a proper face recognition library
    
    // For demo purposes, simulate face verification
    return new Promise<boolean>((resolve) => {
      setTimeout(() => {
        // 80% chance of successful verification
        const isMatch = Math.random() > 0.2;
        resolve(isMatch);
      }, 1000);
    });
  },
  
  // Add a new student
  async addStudent(studentData: {
    name: string;
    reg_number: string;
    level: string;
    department: string;
  }) {
    const { data, error } = await supabase
      .from('fud_students')
      .insert(studentData)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return data;
  },
  
  // Add biometric data for a student
  async addBiometricData(biometricData: {
    student_id: string;
    face_image_url?: string | null;
    fingerprint_template?: ArrayBuffer | null;
    has_face: boolean;
    has_fingerprint: boolean;
  }) {
    // For Supabase, we need to convert fingerprint_template to a string
    // because bytea in PostgreSQL is represented as a string in JSON
    const fingerprintString = biometricData.fingerprint_template 
      ? btoa(String.fromCharCode(...new Uint8Array(biometricData.fingerprint_template)))
      : null;
    
    const dataToInsert = {
      student_id: biometricData.student_id,
      face_image_url: biometricData.face_image_url,
      fingerprint_template: fingerprintString,
      has_face: biometricData.has_face,
      has_fingerprint: biometricData.has_fingerprint
    };
    
    const { data, error } = await supabase
      .from('student_biometrics')
      .insert(dataToInsert)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return data;
  },
  
  // Update biometric data for a student
  async updateBiometricData(studentId: string, biometricData: {
    face_image_url?: string | null;
    fingerprint_template?: ArrayBuffer | null;
    has_face?: boolean;
    has_fingerprint?: boolean;
  }) {
    // For Supabase, we need to handle fingerprint_template conversion
    const dataToUpdate: Record<string, any> = {
      updated_at: new Date().toISOString()
    };
    
    if (biometricData.face_image_url !== undefined) {
      dataToUpdate.face_image_url = biometricData.face_image_url;
    }
    
    if (biometricData.has_face !== undefined) {
      dataToUpdate.has_face = biometricData.has_face;
    }
    
    if (biometricData.has_fingerprint !== undefined) {
      dataToUpdate.has_fingerprint = biometricData.has_fingerprint;
    }
    
    if (biometricData.fingerprint_template) {
      // Convert ArrayBuffer to Base64 string for storage
      dataToUpdate.fingerprint_template = btoa(
        String.fromCharCode(...new Uint8Array(biometricData.fingerprint_template))
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
  }
};
