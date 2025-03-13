'use client';

import React, { useState } from 'react';
import { FaGoogle } from 'react-icons/fa';

interface GoogleDocsInputProps {
  onTextChange: (text: string) => void;
}

export default function GoogleDocsInput({
  onTextChange,
}: GoogleDocsInputProps) {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Extract document ID from URL
      const docId = url.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1];
      if (!docId) {
        throw new Error('Invalid Google Docs URL');
      }

      // Use the Google Docs export URL directly
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
      onTextChange(text);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load document');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mb-4">
      <form onSubmit={handleSubmit} className="flex flex-col space-y-2">
        <div className="flex items-center space-x-2">
          <FaGoogle className="text-blue-500" />
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste Google Docs URL"
            className="flex-1 bg-gray-700 rounded px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : 'Load'}
          </button>
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </form>
    </div>
  );
}
