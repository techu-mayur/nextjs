import { NextRequest, NextResponse } from 'next/server';
import dbManager from '@/lib/database';
import { v4 as uuidv4 } from 'uuid';

let dbInitialized = false;

async function ensureDbInitialized() {
	if (!dbInitialized) {
		await dbManager.initialize();
		dbInitialized = true;
	}
}

interface JobState {
	total: number;
	processed: number;
	updated: number;
	done: boolean;
	error?: string;
	startedAt: number;
	finishedAt?: number;
	message: string;
}

// Use a simple in-memory store (will be reset on each serverless function invocation)
// In production, you'd use Redis or a database
const jobs = new Map<string, JobState>();

async function processJob(jobId: string) {
	try {
		await ensureDbInitialized();
		const state = jobs.get(jobId);
		if (!state) return;

		state.message = "Initializing...";
		const allMedia = await dbManager.getAllMedia();
		state.total = allMedia.length;
		state.message = `Found ${allMedia.length} media items`;

		if (allMedia.length === 0) {
			state.message = "No media items found";
			state.done = true;
			state.finishedAt = Date.now();
			jobs.set(jobId, state);
			return;
		}

		// For Vercel deployment, we'll update the database with external thumbnail URLs
		// instead of generating them locally
		for (const item of allMedia) {
			try {
				state.message = `Processing ${item.filename}...`;
				
				if (item.filetype === 'image') {
					// For images, use the original file as thumbnail (external hosting)
					const thumbPath = item.filepath; // Use original path since it's already on external host
					await dbManager.updateMediaThumbPath(item.id, thumbPath);
					state.updated++;
				} else if (item.filetype === 'video') {
					// For videos, create a poster path based on filename
					const posterName = `${item.filename.replace(/\.[^/.]+$/, '')}-poster.jpg`;
					const posterPath = `/uploads/__thumbs/${posterName}`;
					await dbManager.updateMediaPosterPath(item.id, posterPath);
					state.updated++;
				}
			} catch (error) {
				console.error(`Error processing ${item.filename}:`, error);
				// Continue with next item
			}
			state.processed++;
		}

		state.message = `Completed! Updated ${state.updated} items`;
		state.done = true;
		state.finishedAt = Date.now();
		jobs.set(jobId, state);
	} catch (error: any) {
		const state = jobs.get(jobId);
		if (state) {
			state.error = error?.message || 'Unknown error';
			state.message = `Error: ${state.error}`;
			state.done = true;
			state.finishedAt = Date.now();
			jobs.set(jobId, state);
		}
	}
}

export async function POST(request: NextRequest) {
	try {
		// Create job
		const jobId = uuidv4();
		jobs.set(jobId, { 
			total: 0, 
			processed: 0, 
			updated: 0, 
			done: false, 
			startedAt: Date.now(),
			message: "Starting..."
		});
		
		// Start async processing (do not await)
		processJob(jobId);

		return NextResponse.json({ success: true, jobId });
	} catch (error) {
		return NextResponse.json({ success: false, error: 'Failed to start job' }, { status: 500 });
	}
}

// Export a helper to be used by status route (same module scope)
export function getJob(jobId: string): JobState | undefined {
	return jobs.get(jobId);
}
