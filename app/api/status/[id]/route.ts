// app/api/status/[id]/route.ts
import { NextResponse } from 'next/server';
import path from 'path';
import { access } from 'fs/promises';
import { UPLOADS_BASE } from '@/lib/meshroom';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const projectDir = path.join(UPLOADS_BASE, params.id);
    const outputDir = path.join(projectDir, 'output');
    
    try {
      await access(path.join(outputDir, 'texturedMesh.obj'));
      return NextResponse.json({ status: 'completed' });
    } catch {
      // Check if project exists
      try {
        await access(projectDir);
        return NextResponse.json({ status: 'processing' });
      } catch {
        return NextResponse.json(
          { error: 'Project not found' },
          { status: 404 }
        );
      }
    }
  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json(
      { error: 'Failed to check status' },
      { status: 500 }
    );
  }
}