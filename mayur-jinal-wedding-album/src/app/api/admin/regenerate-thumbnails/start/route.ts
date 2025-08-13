import { NextRequest, NextResponse } from 'next/server';
import dbManager from '@/lib/database';
import { createJob, processJob } from '@/lib/job-manager';

let dbInitialized = false;

async function ensureDbInitialized() {
	if (!dbInitialized) {
		await dbManager.initialize();
		dbInitialized = true;
	}
}

export async function POST(request: NextRequest) {
	try {
		await ensureDbInitialized();
		
		// Create job
		const jobId = createJob();
		
		// Start async processing (do not await)
		processJob(jobId);

		return NextResponse.json({ success: true, jobId });
	} catch (error) {
		return NextResponse.json({ success: false, error: 'Failed to start job' }, { status: 500 });
	}
}
