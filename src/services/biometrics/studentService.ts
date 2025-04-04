
import { supabase } from '@/integrations/supabase/client';

// Student data related operations
export const studentService = {
  // Get student by registration number
  async getStudentByRegNumber(regNumber: string) {
    // Convert the input to uppercase for consistency
    const normalizedRegNumber = regNumber.toUpperCase();
    
    const { data, error } = await supabase
      .from('fud_students')
      .select('id, name, reg_number, level, department')
      .ilike('reg_number', normalizedRegNumber)
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
    // Convert registration number to uppercase before saving
    const normalizedStudentData = {
      ...studentData,
      reg_number: studentData.reg_number.toUpperCase()
    };
    
    const { data, error } = await supabase
      .from('fud_students')
      .insert(normalizedStudentData)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return data;
  }
};
