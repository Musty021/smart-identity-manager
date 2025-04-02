
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FaceRecognitionRequest {
  action: 'register-face' | 'verify-face' | 'delete-face';
  studentId?: string;
  imageData?: string;
  verifyImageData?: string;
  faceIdToDelete?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get request body
    const requestData: FaceRecognitionRequest = await req.json();
    console.log(`Processing ${requestData.action} request`);

    // Mock responses based on the requested action
    switch (requestData.action) {
      case 'register-face':
        if (!requestData.studentId || !requestData.imageData) {
          return new Response(
            JSON.stringify({
              success: false,
              message: 'Missing required parameters: studentId and imageData are required'
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 400
            }
          );
        }

        // Mock a successful face registration
        return new Response(
          JSON.stringify({
            success: true,
            faceId: `face_${Date.now()}_${requestData.studentId}`,
            imageUrl: requestData.imageData, // In a real implementation, we'd store the image in S3
            message: 'Face registered successfully'
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );

      case 'verify-face':
        if (!requestData.verifyImageData) {
          return new Response(
            JSON.stringify({
              success: false,
              message: 'Missing required parameter: verifyImageData'
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 400
            }
          );
        }

        // Mock a successful face verification (80% success rate for testing)
        const isMatch = Math.random() > 0.2;
        const confidence = isMatch ? 90 + Math.random() * 9.9 : 60 + Math.random() * 29.9;

        return new Response(
          JSON.stringify({
            success: true,
            matched: isMatch,
            confidence: parseFloat(confidence.toFixed(1)),
            student: isMatch ? {
              id: `student_${Date.now()}`,
              name: 'John Doe',
              reg_number: 'FUD/2023/001',
              level: '400',
              department: 'Computer Science'
            } : null,
            message: isMatch ? 'Face matched successfully' : 'No match found'
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );

      case 'delete-face':
        if (!requestData.faceIdToDelete) {
          return new Response(
            JSON.stringify({
              success: false,
              message: 'Missing required parameter: faceIdToDelete'
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 400
            }
          );
        }

        // Mock a successful face deletion
        return new Response(
          JSON.stringify({
            success: true,
            message: `Face ${requestData.faceIdToDelete} deleted successfully`
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );

      default:
        return new Response(
          JSON.stringify({
            success: false,
            message: `Unknown action: ${requestData.action}`
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400
          }
        );
    }
  } catch (error) {
    console.error('Error processing request:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Internal server error',
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
