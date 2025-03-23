
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from 'https://esm.sh/@aws-sdk/client-s3@3.282.0'
import {
  RekognitionClient,
  CreateCollectionCommand,
  IndexFacesCommand,
  SearchFacesByImageCommand,
  CompareFacesCommand,
  ListCollectionsCommand,
  DeleteFacesCommand,
} from 'https://esm.sh/@aws-sdk/client-rekognition@3.282.0'

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Create AWS clients
const s3Client = new S3Client({
  region: Deno.env.get('AWS_REGION') || '',
  credentials: {
    accessKeyId: Deno.env.get('AWS_ACCESS_KEY_ID') || '',
    secretAccessKey: Deno.env.get('AWS_SECRET_ACCESS_KEY') || '',
  },
})

const rekognitionClient = new RekognitionClient({
  region: Deno.env.get('AWS_REGION') || '',
  credentials: {
    accessKeyId: Deno.env.get('AWS_ACCESS_KEY_ID') || '',
    secretAccessKey: Deno.env.get('AWS_SECRET_ACCESS_KEY') || '',
  },
})

// Collection name for FUD students
const COLLECTION_ID = 'fud-students-faces'
const S3_BUCKET_NAME = 'fud-student-images'

// Function to ensure the collection exists
async function ensureCollectionExists() {
  try {
    // List existing collections
    const listCollectionsCommand = new ListCollectionsCommand({})
    const collections = await rekognitionClient.send(listCollectionsCommand)
    
    // If our collection doesn't exist, create it
    if (!collections.CollectionIds?.includes(COLLECTION_ID)) {
      console.log(`Creating collection: ${COLLECTION_ID}`)
      const createCollectionCommand = new CreateCollectionCommand({
        CollectionId: COLLECTION_ID,
      })
      await rekognitionClient.send(createCollectionCommand)
      console.log(`Collection ${COLLECTION_ID} created successfully`)
    } else {
      console.log(`Collection ${COLLECTION_ID} already exists`)
    }
    return true
  } catch (error) {
    console.error('Error ensuring collection exists:', error)
    return false
  }
}

// Function to upload image to S3
async function uploadImageToS3(imageData: string, studentId: string): Promise<string> {
  try {
    // Remove the data URL prefix and convert to binary
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '')
    const binaryData = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0))
    
    // Generate S3 key with student ID for organization
    const key = `students/${studentId}/face.jpg`
    
    // Upload to S3
    await s3Client.send(
      new PutObjectCommand({
        Bucket: S3_BUCKET_NAME,
        Key: key,
        Body: binaryData,
        ContentType: 'image/jpeg',
      })
    )
    
    // Return the S3 URL
    return `https://${S3_BUCKET_NAME}.s3.${Deno.env.get('AWS_REGION')}.amazonaws.com/${key}`
  } catch (error) {
    console.error('Error uploading to S3:', error)
    throw new Error('Failed to upload image to S3')
  }
}

// Function to index a face in Rekognition
async function indexFace(studentId: string, imageData: string): Promise<string> {
  try {
    // Ensure collection exists
    await ensureCollectionExists()
    
    // Remove the data URL prefix and convert to binary
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '')
    const binaryData = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0))
    
    // Index the face in Rekognition
    const indexCommand = new IndexFacesCommand({
      CollectionId: COLLECTION_ID,
      ExternalImageId: studentId,
      Image: {
        Bytes: binaryData,
      },
      MaxFaces: 1,
      QualityFilter: 'HIGH',
    })
    
    const indexResult = await rekognitionClient.send(indexCommand)
    
    if (!indexResult.FaceRecords || indexResult.FaceRecords.length === 0) {
      throw new Error('No face detected in the image')
    }
    
    const faceId = indexResult.FaceRecords[0].Face?.FaceId
    
    if (!faceId) {
      throw new Error('Failed to obtain FaceId')
    }
    
    console.log(`Successfully indexed face with ID: ${faceId}`)
    return faceId
  } catch (error) {
    console.error('Error indexing face:', error)
    throw new Error('Failed to index face in Rekognition')
  }
}

// Function to verify a face against Rekognition collection
async function verifyFace(imageData: string): Promise<{ matched: boolean; studentId?: string; confidence?: number }> {
  try {
    // Ensure collection exists
    await ensureCollectionExists()
    
    // Remove the data URL prefix and convert to binary
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '')
    const binaryData = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0))
    
    // Search for matching faces in the collection
    const searchCommand = new SearchFacesByImageCommand({
      CollectionId: COLLECTION_ID,
      Image: {
        Bytes: binaryData,
      },
      MaxFaces: 1,
      FaceMatchThreshold: 90, // Require high confidence
    })
    
    const searchResult = await rekognitionClient.send(searchCommand)
    
    if (!searchResult.FaceMatches || searchResult.FaceMatches.length === 0) {
      console.log('No matching faces found')
      return { matched: false }
    }
    
    const bestMatch = searchResult.FaceMatches[0]
    const studentId = bestMatch.Face?.ExternalImageId
    const confidence = bestMatch.Similarity
    
    console.log(`Face match found: StudentID=${studentId}, Confidence=${confidence}%`)
    
    return {
      matched: true,
      studentId,
      confidence,
    }
  } catch (error) {
    console.error('Error verifying face:', error)
    throw new Error('Failed to verify face against Rekognition')
  }
}

// Function to compare two face images directly
async function compareFaces(sourceImage: string, targetImage: string): Promise<{ matched: boolean; confidence?: number }> {
  try {
    // Remove the data URL prefix and convert to binary for both images
    const sourceBase64 = sourceImage.replace(/^data:image\/\w+;base64,/, '')
    const sourceBinary = Uint8Array.from(atob(sourceBase64), (c) => c.charCodeAt(0))
    
    const targetBase64 = targetImage.replace(/^data:image\/\w+;base64,/, '')
    const targetBinary = Uint8Array.from(atob(targetBase64), (c) => c.charCodeAt(0))
    
    // Use Rekognition to compare the faces
    const compareCommand = new CompareFacesCommand({
      SourceImage: {
        Bytes: sourceBinary,
      },
      TargetImage: {
        Bytes: targetBinary,
      },
      SimilarityThreshold: 90,
    })
    
    const compareResult = await rekognitionClient.send(compareCommand)
    
    if (!compareResult.FaceMatches || compareResult.FaceMatches.length === 0) {
      console.log('No matching faces found in direct comparison')
      return { matched: false }
    }
    
    const bestMatch = compareResult.FaceMatches[0]
    const confidence = bestMatch.Similarity
    
    console.log(`Direct face comparison match: Confidence=${confidence}%`)
    
    return {
      matched: true,
      confidence,
    }
  } catch (error) {
    console.error('Error comparing faces:', error)
    throw new Error('Failed to compare faces')
  }
}

// Function to delete a face from the collection
async function deleteFace(faceId: string): Promise<boolean> {
  try {
    const deleteCommand = new DeleteFacesCommand({
      CollectionId: COLLECTION_ID,
      FaceIds: [faceId],
    })
    
    const deleteResult = await rekognitionClient.send(deleteCommand)
    
    if (deleteResult.DeletedFaces && deleteResult.DeletedFaces.includes(faceId)) {
      console.log(`Successfully deleted face with ID: ${faceId}`)
      return true
    } else {
      console.log(`Failed to delete face with ID: ${faceId}`)
      return false
    }
  } catch (error) {
    console.error('Error deleting face:', error)
    return false
  }
}

// Create Supabase client
const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? '',
  {
    global: {
      headers: { Authorization: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '' },
    },
  }
)

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }
  
  try {
    // Get the request path and action
    const url = new URL(req.url)
    const action = url.pathname.split('/').pop()
    
    // Parse request body
    const requestData = await req.json()
    
    let responseBody = {}
    
    // Handle different actions
    switch (action) {
      case 'register-face':
        const { studentId, imageData } = requestData
        
        if (!studentId || !imageData) {
          return new Response(
            JSON.stringify({ error: 'Missing required parameters' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        
        // Upload image to S3
        const s3Url = await uploadImageToS3(imageData, studentId)
        
        // Index face with Rekognition
        const faceId = await indexFace(studentId, imageData)
        
        // Update Supabase with face_id and face_image_url
        const { data, error } = await supabaseClient
          .from('student_biometrics')
          .upsert(
            {
              student_id: studentId,
              face_id: faceId,
              face_image_url: s3Url,
              has_face: true,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'student_id' }
          )
          .select()
        
        if (error) {
          throw new Error(`Supabase error: ${error.message}`)
        }
        
        responseBody = {
          success: true,
          faceId,
          imageUrl: s3Url,
          message: 'Face registered successfully',
        }
        break
        
      case 'verify-face':
        const { verifyImageData } = requestData
        
        if (!verifyImageData) {
          return new Response(
            JSON.stringify({ error: 'Missing image data' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        
        // Verify face against Rekognition collection
        const verificationResult = await verifyFace(verifyImageData)
        
        if (!verificationResult.matched) {
          responseBody = {
            success: false,
            message: 'Face verification failed. No matching face found.',
          }
        } else {
          // Get student data from Supabase
          const { data: studentData, error: studentError } = await supabaseClient
            .from('fud_students')
            .select('id, name, reg_number, level, department')
            .eq('id', verificationResult.studentId)
            .single()
          
          if (studentError) {
            throw new Error(`Supabase error: ${studentError.message}`)
          }
          
          responseBody = {
            success: true,
            matched: true,
            confidence: verificationResult.confidence,
            student: studentData,
            message: 'Face verified successfully',
          }
        }
        break
        
      case 'delete-face':
        const { faceIdToDelete } = requestData
        
        if (!faceIdToDelete) {
          return new Response(
            JSON.stringify({ error: 'Missing face ID' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        
        const deleteResult = await deleteFace(faceIdToDelete)
        
        if (deleteResult) {
          // Update Supabase to remove face_id
          const { error: updateError } = await supabaseClient
            .from('student_biometrics')
            .update({
              face_id: null,
              has_face: false,
              updated_at: new Date().toISOString(),
            })
            .eq('face_id', faceIdToDelete)
          
          if (updateError) {
            throw new Error(`Supabase error: ${updateError.message}`)
          }
          
          responseBody = {
            success: true,
            message: 'Face deleted successfully',
          }
        } else {
          responseBody = {
            success: false,
            message: 'Failed to delete face',
          }
        }
        break
        
      default:
        return new Response(
          JSON.stringify({ error: 'Unknown action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
    
    return new Response(
      JSON.stringify(responseBody),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error processing request:', error)
    
    return new Response(
      JSON.stringify({ error: error.message || 'An unknown error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
