import { NextRequest, NextResponse } from 'next/server';
import { createWriteStream } from 'fs';
import archiver from 'archiver';
import path from 'path';
import fs from 'fs';

export async function POST(request: NextRequest) {
  try {
    const { files } = await request.json();

    if (!files || !Array.isArray(files) || files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No files provided' },
        { status: 400 }
      );
    }

    // Create a temporary ZIP file
    const zipPath = path.join(process.cwd(), 'temp', `download-${Date.now()}.zip`);
    const output = createWriteStream(zipPath);
    const archive = archiver('zip', {
      zlib: { level: 9 } // Maximum compression
    });

    // Pipe archive data to the file
    archive.pipe(output);

    // Add each file to the archive
    for (const file of files) {
      const filePath = path.join(process.cwd(), 'public', file.filepath);
      
      // Check if file exists
      if (fs.existsSync(filePath)) {
        // Add file to archive with a clean filename
        const fileName = file.filename || path.basename(file.filepath);
        archive.file(filePath, { name: fileName });
      }
    }

    // Finalize the archive
    await archive.finalize();

    // Wait for the write stream to finish
    await new Promise<void>((resolve, reject) => {
      output.on('close', () => resolve());
      output.on('error', reject);
    });

    // Read the ZIP file and send it
    const zipBuffer = fs.readFileSync(zipPath);
    
    // Clean up temporary file
    fs.unlinkSync(zipPath);

    // Return the ZIP file
    return new NextResponse(zipBuffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="wedding-album-${new Date().toISOString().split('T')[0]}.zip"`,
        'Content-Length': zipBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('Error creating ZIP:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create ZIP file' },
      { status: 500 }
    );
  }
}
