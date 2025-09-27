
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { S3 } from "https://deno.land/x/s3@0.5.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

// Create a Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// AWS configuration
const AWS_REGION = Deno.env.get('AWS_REGION') || 'us-east-1';
const AWS_ACCESS_KEY_ID = Deno.env.get('AWS_ACCESS_KEY_ID') || '';
const AWS_SECRET_ACCESS_KEY = Deno.env.get('AWS_SECRET_ACCESS_KEY') || '';
const COLLECTION_ID = "fud_students_faces";

// Helper function to convert base64 to buffer
function base64ToBuffer(base64String: string): Uint8Array {
  // Remove data URL prefix if present
  const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');
  const binary = atob(base64Data);
  const buffer = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    buffer[i] = binary.charCodeAt(i);
  }
  return buffer;
}

// Function to make AWS API requests
async function callAWSAPI(path: string, method: string, body: object) {
  try {
    // AWS Rekognition endpoint URL
    const endpoint = `https://rekognition.${AWS_REGION}.amazonaws.com`;
    const url = `${endpoint}/${path}`;
    
    // AWS SigV4 Authentication (simplified)
    const date = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '');
    const dateStamp = date.slice(0, 8);
    const service = 'rekognition';
    
    const headers: Record<string, string> = {
      'X-Amz-Date': date,
      'X-Amz-Target': `RekognitionService.${path.split('/').pop()}`,
      'Content-Type': 'application/x-amz-json-1.1',
      'Host': `rekognition.${AWS_REGION}.amazonaws.com`
    };
    
    // Create canonical request for SigV4
    // Implementing a simplified version of AWS SigV4 signing - production should use a proper library
    const authHeader = `AWS4-HMAC-SHA256 Credential=${AWS_ACCESS_KEY_ID}/${dateStamp}/${AWS_REGION}/${service}/aws4_request`;
    
    // Add credentials header
    headers['Authorization'] = authHeader;
    
    // Make the request to AWS
    const response = await fetch(url, {
      method: method,
      headers: headers,
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      console.error(`AWS API error: ${response.status} ${response.statusText}`);
      const errorData = await response.text();
      console.error('Error details:', errorData);
      throw new Error(`AWS API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('AWS API call failed:', error);
    throw error;
  }
}

// Function to ensure AWS Face Collection exists
async function ensureFaceCollectionExists() {
  try {
    // Check if collection exists
    const listCollectionsResponse = await callAWSAPI('', 'POST', {
      "Operation": "ListCollections"
    });
    
    const collections = listCollectionsResponse.CollectionIds || [];
    if (!collections.includes(COLLECTION_ID)) {
      // Create the collection if it doesn't exist
      await callAWSAPI('', 'POST', {
        "Operation": "CreateCollection",
        "CollectionId": COLLECTION_ID
      });
      console.log(`Created face collection: ${COLLECTION_ID}`);
    }
    
    return true;
  } catch (error) {
    console.error('Error ensuring face collection exists:', error);
    return false;
  }
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

    // Ensure AWS face collection exists
    if (!await ensureFaceCollectionExists()) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Could not initialize AWS face recognition'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      );
    }

    // Handle different actions
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

        try {
          // Get student data to associate with the face
          const { data: studentData, error: studentError } = await supabase
            .from('fud_students')
            .select('*')
            .eq('id', requestData.studentId)
            .single();

          if (studentError || !studentData) {
            throw new Error('Student not found');
          }

          // Convert base64 image to buffer
          const imageBuffer = base64ToBuffer(requestData.imageData);

          // Index face in AWS Rekognition
          const indexFaceResponse = await callAWSAPI('', 'POST', {
            "Operation": "IndexFaces",
            "CollectionId": COLLECTION_ID,
            "Image": {
              "Bytes": Array.from(imageBuffer)
            },
            "ExternalImageId": requestData.studentId,
            "DetectionAttributes": ["DEFAULT"]
          });

          if (!indexFaceResponse.FaceRecords || indexFaceResponse.FaceRecords.length === 0) {
            throw new Error('No faces detected in the image');
          }

          const faceId = indexFaceResponse.FaceRecords[0].Face.FaceId;

          // Store face ID in the database
          const { error: updateError } = await supabase
            .from('student_biometrics')
            .update({
              face_id: faceId,
              face_image_url: requestData.imageData,
              has_face: true
            })
            .eq('student_id', requestData.studentId);

          if (updateError) {
            throw new Error(`Failed to update biometric data: ${updateError.message}`);
          }

          return new Response(
            JSON.stringify({
              success: true,
              faceId: faceId,
              imageUrl: requestData.imageData,
              message: 'Face registered successfully'
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );
        } catch (error) {
          console.error('Error in face registration:', error);
          return new Response(
            JSON.stringify({
              success: false,
              message: `Face registration failed: ${error instanceof Error ? error.message : 'Unknown error'}`
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 500
            }
          );
        }

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

        try {
          // Convert base64 image to buffer
          const imageBuffer = base64ToBuffer(requestData.verifyImageData);

          // Search faces in AWS Rekognition
          const searchFacesResponse = await callAWSAPI('', 'POST', {
            "Operation": "SearchFacesByImage",
            "CollectionId": COLLECTION_ID,
            "Image": {
              "Bytes": Array.from(imageBuffer)
            },
            "MaxFaces": 1,
            "FaceMatchThreshold": 70
          });

          console.log('Search faces response:', JSON.stringify(searchFacesResponse));

          // Check if any faces matched
          if (!searchFacesResponse.FaceMatches || searchFacesResponse.FaceMatches.length === 0) {
            return new Response(
              JSON.stringify({
                success: true,
                matched: false,
                message: 'No matching face found'
              }),
              {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
              }
            );
          }

          // Get the highest confidence match
          const bestMatch = searchFacesResponse.FaceMatches[0];
          const confidence = bestMatch.Similarity;
          const studentId = bestMatch.Face.ExternalImageId;

          // Get student data
          const { data: studentData, error: studentError } = await supabase
            .from('fud_students')
            .select('*')
            .eq('id', studentId)
            .single();

          if (studentError || !studentData) {
            throw new Error('Student not found for the matched face');
          }

          return new Response(
            JSON.stringify({
              success: true,
              matched: true,
              confidence: confidence,
              student: {
                id: studentData.id,
                name: studentData.name,
                reg_number: studentData.reg_number,
                level: studentData.level,
                department: studentData.department
              },
              message: 'Face matched successfully'
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );
        } catch (error) {
          console.error('Error in face verification:', error);
          return new Response(
            JSON.stringify({
              success: false,
              message: `Face verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 500
            }
          );
        }

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

        try {
          // Delete face from AWS Rekognition
          await callAWSAPI('', 'POST', {
            "Operation": "DeleteFaces",
            "CollectionId": COLLECTION_ID,
            "FaceIds": [requestData.faceIdToDelete]
          });

          // Update the database to reflect the deletion
          const { error: updateError } = await supabase
            .from('student_biometrics')
            .update({
              face_id: null,
              has_face: false
            })
            .eq('face_id', requestData.faceIdToDelete);

          if (updateError) {
            console.error('Error updating database after face deletion:', updateError);
          }

          return new Response(
            JSON.stringify({
              success: true,
              message: `Face ${requestData.faceIdToDelete} deleted successfully`
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );
        } catch (error) {
          console.error('Error in face deletion:', error);
          return new Response(
            JSON.stringify({
              success: false,
              message: `Face deletion failed: ${error instanceof Error ? error.message : 'Unknown error'}`
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 500
            }
          );
        }

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
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
