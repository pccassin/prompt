import { NextResponse } from 'next/server';

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
    // In a production environment, you would:
    // 1. Use proper Google Docs API credentials
    // 2. Implement proper authentication
    // 3. Handle rate limiting and caching

    // For now, we'll use a simple fetch to get the document content
    const response = await fetch(
      `https://docs.google.com/document/d/${docId}/export?format=txt`
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
