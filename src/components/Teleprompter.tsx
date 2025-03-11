'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FaPlay, FaPause, FaUndo, FaMinus, FaPlus } from 'react-icons/fa';
import { MdTextIncrease, MdTextDecrease } from 'react-icons/md';

interface TeleprompterProps {
  text: string;
}

export const Teleprompter: React.FC<TeleprompterProps> = ({ text }) => {
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(2); // pixels per frame
  const [fontSize, setFontSize] = useState(32);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();

  const scroll = () => {
    if (containerRef.current) {
      containerRef.current.scrollTop += scrollSpeed;
      animationFrameRef.current = requestAnimationFrame(scroll);
    }
  };

  useEffect(() => {
    if (isScrolling) {
      animationFrameRef.current = requestAnimationFrame(scroll);
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isScrolling, scrollSpeed]);

  const resetScroll = () => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
      setIsScrolling(false);
    }
  };

  const adjustSpeed = (delta: number) => {
    setScrollSpeed((prev) => Math.max(0.5, Math.min(10, prev + delta)));
  };

  const adjustFontSize = (delta: number) => {
    setFontSize((prev) => Math.max(16, Math.min(72, prev + delta)));
  };

  return (
    <div className="flex flex-col h-screen bg-black text-white p-4">
      <div className="flex justify-center space-x-4 mb-4">
        <button
          onClick={() => setIsScrolling(!isScrolling)}
          className="p-2 rounded-full bg-blue-600 hover:bg-blue-700"
        >
          {isScrolling ? <FaPause /> : <FaPlay />}
        </button>
        <button
          onClick={resetScroll}
          className="p-2 rounded-full bg-gray-600 hover:bg-gray-700"
        >
          <FaUndo />
        </button>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => adjustSpeed(-0.5)}
            className="p-2 rounded-full bg-gray-600 hover:bg-gray-700"
          >
            <FaMinus />
          </button>
          <span className="min-w-[3rem] text-center">
            {scrollSpeed.toFixed(1)}x
          </span>
          <button
            onClick={() => adjustSpeed(0.5)}
            className="p-2 rounded-full bg-gray-600 hover:bg-gray-700"
          >
            <FaPlus />
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => adjustFontSize(-2)}
            className="p-2 rounded-full bg-gray-600 hover:bg-gray-700"
          >
            <MdTextDecrease />
          </button>
          <span className="min-w-[3rem] text-center">{fontSize}px</span>
          <button
            onClick={() => adjustFontSize(2)}
            className="p-2 rounded-full bg-gray-600 hover:bg-gray-700"
          >
            <MdTextIncrease />
          </button>
        </div>
      </div>
      <div
        ref={containerRef}
        className="flex-1 overflow-y-hidden mirror-text"
        style={{
          perspective: '1000px',
          transform: 'rotateX(10deg)',
        }}
      >
        <div
          className="whitespace-pre-wrap p-4"
          style={{ fontSize: `${fontSize}px`, lineHeight: '1.5' }}
        >
          {text}
        </div>
      </div>
    </div>
  );
};
