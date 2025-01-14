import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Extract the ID from the URL path
    const projectId = request.url.split('/').pop();

    const response = await fetch(`/3drender-git-main-severinnhqs-projects.vercel.app/${projectId}`);
    const data = await response.json();
    
    return NextResponse.json({
      status: data.status
    });

  } catch (error) {
    console.error('Error checking status:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to check status' },
      { status: 500 }
    );
  }
}