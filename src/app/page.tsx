'use client';

import { useState } from 'react';
import { Teleprompter } from '@/components/Teleprompter';
import { TextInput } from '@/components/TextInput';

export default function Home() {
  const [text, setText] = useState('');

  return (
    <main className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">Prompt</h1>
        <div className="grid gap-8">
          <TextInput onTextChange={setText} />
          {text && <Teleprompter text={text} />}
        </div>
      </div>
    </main>
  );
}
