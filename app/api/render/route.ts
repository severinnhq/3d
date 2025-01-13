import { NextResponse } from 'next/server';
import { processImages } from '@/lib/meshroom';
import { validateFiles } from '@/lib/validate';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('images') as File[];
    
    // Validate input
    try {
      validateFiles(files);
    } catch (error) {
      console.error('Validation error:', error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Validation error' },
        { status: 400 }
      );
    }

    // Process images
    try {
      console.log('Starting image processing...');
      const result = await processImages(files);
      console.log('Image processing completed:', result);
      
      return NextResponse.json({ 
        projectId: result.projectId,
        message: 'Processing started',
        estimatedTime: '30-60 minutes'
      });
    } catch (error) {
      console.error('Processing error:', error);
      return NextResponse.json(
        { error: 'Failed to process images with Meshroom', details: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Failed to process request', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

