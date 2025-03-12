'use client';

import React from 'react';
import { FaVideo } from 'react-icons/fa';

export const Header: React.FC = () => {
  return (
    <header className="w-full bg-gradient-to-r from-blue-900 to-black p-4 shadow-lg">
      <div className="container mx-auto flex items-center justify-center">
        <div className="flex items-center gap-2">
          <FaVideo className="text-blue-400 text-3xl animate-pulse" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-white bg-clip-text text-transparent">
            Prompt
          </h1>
        </div>
      </div>
    </header>
  );
};
