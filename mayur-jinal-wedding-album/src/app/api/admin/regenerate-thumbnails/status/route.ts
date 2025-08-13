import { NextRequest, NextResponse } from 'next/server';
import { getJob } from '@/app/api/admin/regenerate-thumbnails/start/route';

export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url);
	const jobId = searchParams.get('jobId') || '';
	if (!jobId) {
		return NextResponse.json({ success: false, error: 'jobId required' }, { status: 400 });
	}
	const job = getJob(jobId);
	if (!job) {
		return NextResponse.json({ success: false, error: 'Job not found' }, { status: 404 });
	}
	return NextResponse.json({ success: true, job });
}
