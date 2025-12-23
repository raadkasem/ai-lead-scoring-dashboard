import { NextRequest, NextResponse } from 'next/server';
import { extractInsights } from '@/lib/llm';

export async function POST(request: NextRequest) {
  try {
    const { transcript } = await request.json();

    if (typeof transcript !== 'string') {
      return NextResponse.json(
        { error: 'Transcript must be a string' },
        { status: 400 }
      );
    }

    const insights = await extractInsights(transcript);

    return NextResponse.json({ insights });
  } catch (error) {
    console.error('Extract API error:', error);
    return NextResponse.json(
      { error: 'Failed to extract insights' },
      { status: 500 }
    );
  }
}
