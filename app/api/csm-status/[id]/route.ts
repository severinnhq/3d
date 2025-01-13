// app/api/csm-status/[id]/route.ts
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!process.env.CSM_API_KEY) {
    return NextResponse.json(
      { error: 'CSM API key not configured' },
      { status: 500 }
    );
  }

  try {
    const modelId = params.id;

    const response = await fetch(`https://api.3d.csm.ai/v1/models/${modelId}`, {
      headers: {
        'Authorization': process.env.CSM_API_KEY, // Changed: removed 'Bearer ' prefix
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch model status');
    }

    const data = await response.json();

    return NextResponse.json({
      status: data.status,
      viewerUrl: data.viewer_url,
    });

  } catch (error) {
    console.error('Error checking model status:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to check status' },
      { status: 500 }
    );
  }
}