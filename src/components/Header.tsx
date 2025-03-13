'use client';

import React from 'react';
import { FaVideo } from 'react-icons/fa';

export default function Header() {
  return (
    <header className="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
      <div className="container mx-auto flex items-center justify-center space-x-2">
        <FaVideo className="text-2xl" />
        <h1 className="text-2xl font-display font-bold">Prompt</h1>
      </div>
    </header>
  );
}
