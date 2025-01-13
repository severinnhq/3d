// app/api/csm-render/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  // Check API key first
  const apiKey = process.env.CSM_API_KEY;
  if (!apiKey) {
    console.error('CSM API key is missing');
    return NextResponse.json(
      { error: 'CSM API key not configured' },
      { status: 500 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      console.error('No file in request');
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Log file details for debugging
    console.log('File received:', {
      name: (file as File).name,
      type: (file as File).type,
      size: (file as File).size
    });

    // Read the file data
    const bytes = await (file as File).arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');

    console.log('Making request to 3D CSM.ai API...');
    
    // Make request to 3D CSM.ai API with updated endpoint and auth format
    try {
      const csmResponse = await fetch('https://api.3d.csm.ai/v1/models', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': apiKey, // Changed: removed 'Bearer ' prefix
        },
        body: JSON.stringify({
          image: base64Image,
          webhook_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/csm-webhook`,
        }),
      });

      // Log the complete response for debugging
      const responseText = await csmResponse.text();
      console.log('CSM API Raw Response:', responseText);

      if (!csmResponse.ok) {
        let errorMessage = 'CSM API request failed';
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          console.error('Failed to parse error response:', e);
        }
        throw new Error(`${errorMessage} (Status: ${csmResponse.status})`);
      }

      const responseData = JSON.parse(responseText);
      console.log('CSM API Success:', responseData);

      return NextResponse.json({
        modelId: responseData.id,
        status: 'processing',
      });

    } catch (fetchError: any) {
      console.error('CSM API Fetch Error:', fetchError);
      throw new Error(`CSM API request failed: ${fetchError.message}`);
    }

  } catch (error: any) {
    console.error('Detailed error in CSM API:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to process image',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}