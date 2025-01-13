import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

type CSMResponse = {
  id: string;
  status: string;
  viewer_url?: string;
};

export async function POST(request: Request) {
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

    // Get host for webhook URL
    const headersList = headers();
    const host = process.env.NEXT_PUBLIC_APP_URL || `https://${headersList.get('host')}`;
    const webhookUrl = `${host}/api/csm-webhook`;

    // Read the file data
    const bytes = await (file as File).arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');

    console.log('Making request to CSM.ai API...');
    
    const csmResponse = await fetch('https://api.3d.csm.ai/v1/models', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': apiKey,
      },
      body: JSON.stringify({
        image: base64Image,
        webhook_url: webhookUrl,
      }),
    });

    const responseText = await csmResponse.text();
    console.log('CSM API Raw Response:', responseText);

    if (!csmResponse.ok) {
      throw new Error(`CSM API request failed: ${csmResponse.status}`);
    }

    const responseData = JSON.parse(responseText) as CSMResponse;

    return NextResponse.json({
      modelId: responseData.id,
      status: 'processing',
    });

  } catch (error) {
    console.error('Error in CSM render:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process image' },
      { status: 500 }
    );
  }
}