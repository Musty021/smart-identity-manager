
import { supabase } from '@/integrations/supabase/client';

// Student data related operations
export const studentService = {
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
  }
};
