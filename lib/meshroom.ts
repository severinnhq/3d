import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { mkdir, rm, access } from 'fs/promises';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
export const UPLOADS_BASE = process.env.UPLOADS_BASE || '/tmp/uploads';

const execAsync = promisify(exec);

export const IMAGES_DIR = path.join(process.cwd(), 'images');
export const OUTPUT_DIR = path.join(process.cwd(), 'output');
export const CACHE_DIR = path.join(process.cwd(), 'cache');
export const MESHROOM_PATH = "C:\\Meshroom\\Meshroom-2023.3.0-win64\\Meshroom-2023.3.0\\meshroom_batch.exe";

export const MIN_IMAGES = 20;
export const MAX_IMAGES = 50;
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

export async function processImages(files: File[]) {
  const projectId = uuidv4();
  const projectDir = path.join(OUTPUT_DIR, projectId);
  const inputDir = path.join(projectDir, 'input');

  try {
    // Create necessary directories
    await mkdir(IMAGES_DIR, { recursive: true });
    await mkdir(OUTPUT_DIR, { recursive: true });
    await mkdir(CACHE_DIR, { recursive: true });
    await mkdir(projectDir, { recursive: true });
    await mkdir(inputDir, { recursive: true });

    // Save and resize images
    await Promise.all(
      files.map(async (file, index) => {
        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = `image_${index + 1}.jpg`;
        const filePath = path.join(inputDir, filename);

        // Resize image
        await sharp(buffer)
          .resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 80 })
          .toFile(filePath);

        console.log(`Image ${filename} saved and resized`);
      })
    );

    // Check if Meshroom executable exists
    try {
      await access(MESHROOM_PATH);
      console.log('Meshroom executable found');
    } catch (error) {
      console.error('Meshroom executable not found:', error);
      throw new Error('Meshroom executable not found');
    }

    // Run Meshroom
    console.log('Starting Meshroom process...');
    const { stdout, stderr } = await execAsync(
      `"${MESHROOM_PATH}" --input "${inputDir}" --output "${projectDir}" --cache "${CACHE_DIR}"`
    );
    console.log('Meshroom stdout:', stdout);
    console.error('Meshroom stderr:', stderr);

    return {
      projectId,
      inputDir,
      outputDir: projectDir,
      cacheDir: CACHE_DIR
    };
  } catch (error) {
    console.error('Error in processImages:', error);
    await cleanupProject(projectDir);
    throw error;
  }
}

async function cleanupProject(projectDir: string) {
  try {
    await rm(projectDir, { recursive: true, force: true });
    console.log(`Project directory ${projectDir} cleaned up`);
  } catch (error) {
    console.error(`Error cleaning up project directory ${projectDir}:`, error);
  }
}

