'use client';

import React, { useState, useCallback } from 'react';
import { FaUpload, FaLink, FaKeyboard } from 'react-icons/fa';

interface TextInputProps {
  onTextChange: (text: string) => void;
}

export const TextInput: React.FC<TextInputProps> = ({ onTextChange }) => {
  const [inputMode, setInputMode] = useState<'text' | 'file' | 'link'>('text');
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    onTextChange(e.target.value);
    setError('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      if (file.type === 'text/plain') {
        const text = await file.text();
        setText(text);
        onTextChange(text);
      } else if (file.type === 'application/pdf') {
        // Note: PDF parsing would be handled server-side in a production environment
        setError('PDF support coming soon!');
      } else {
        setError('Please upload a .txt or .pdf file');
      }
    } catch (err) {
      setError('Error reading file');
      console.error(err);
    }
  };

  const handleGoogleDocsLink = async (link: string) => {
    // In a production environment, this would be handled server-side
    // with proper Google Docs API integration
    setError('Google Docs integration coming soon!');
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 bg-gray-800 rounded-lg">
      <div className="flex justify-center space-x-4 mb-4">
        <button
          onClick={() => setInputMode('text')}
          className={`p-2 rounded-full ${
            inputMode === 'text' ? 'bg-blue-600' : 'bg-gray-600'
          } hover:bg-blue-700`}
        >
          <FaKeyboard />
        </button>
        <button
          onClick={() => setInputMode('file')}
          className={`p-2 rounded-full ${
            inputMode === 'file' ? 'bg-blue-600' : 'bg-gray-600'
          } hover:bg-blue-700`}
        >
          <FaUpload />
        </button>
        <button
          onClick={() => setInputMode('link')}
          className={`p-2 rounded-full ${
            inputMode === 'link' ? 'bg-blue-600' : 'bg-gray-600'
          } hover:bg-blue-700`}
        >
          <FaLink />
        </button>
      </div>

      {inputMode === 'text' && (
        <textarea
          value={text}
          onChange={handleTextChange}
          className="w-full h-48 p-4 bg-gray-700 text-white rounded-lg resize-none"
          placeholder="Enter your text here..."
        />
      )}

      {inputMode === 'file' && (
        <div className="flex flex-col items-center">
          <input
            type="file"
            accept=".txt,.pdf"
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Choose File
          </label>
        </div>
      )}

      {inputMode === 'link' && (
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Paste Google Docs link..."
            className="flex-1 p-2 bg-gray-700 text-white rounded-lg"
            onChange={(e) => setText(e.target.value)}
          />
          <button
            onClick={() => handleGoogleDocsLink(text)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Import
          </button>
        </div>
      )}

      {error && <div className="mt-4 text-red-500 text-center">{error}</div>}
    </div>
  );
};
