import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const docId = searchParams.get('docId');

  if (!docId) {
    return NextResponse.json(
      { error: 'Document ID is required' },
      { status: 400 }
    );
  }

  try {
    // Use the Google Docs export URL
    const response = await fetch(
      `https://docs.google.com/document/d/${docId}/export?format=txt`,
      {
        headers: {
          Accept: 'text/plain',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch document');
    }

    const text = await response.text();
    return NextResponse.json({ text });
  } catch (error) {
    console.error('Error fetching Google Doc:', error);
    return NextResponse.json(
      { error: 'Failed to fetch document' },
      { status: 500 }
    );
  }
}
