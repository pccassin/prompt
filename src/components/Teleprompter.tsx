'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FaPlay, FaPause, FaUndo, FaMinus, FaPlus } from 'react-icons/fa';
import { MdTextIncrease, MdTextDecrease } from 'react-icons/md';

interface TeleprompterProps {
  text: string;
}

export const Teleprompter: React.FC<TeleprompterProps> = ({ text }) => {
  const [isScrolling, setIsScrolling] = useState(false);
  const [speedLevel, setSpeedLevel] = useState(5); // 1-10 scale
  const [fontSize, setFontSize] = useState(32);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);

  // Calculate actual scroll speed based on font size and speed level
  const getScrollSpeed = (deltaTime: number) => {
    const baseSpeed = 0.05; // pixels per millisecond at speed level 5 and font size 32
    const fontSizeFactor = fontSize / 32; // Scale based on font size
    const speedFactor = speedLevel / 5; // Scale based on speed level
    return baseSpeed * fontSizeFactor * speedFactor * deltaTime;
  };

  const scroll = (timestamp: number) => {
    if (!lastTimeRef.current) lastTimeRef.current = timestamp;
    const deltaTime = timestamp - lastTimeRef.current;
    lastTimeRef.current = timestamp;

    if (containerRef.current && contentRef.current) {
      const maxScroll =
        contentRef.current.offsetHeight - containerRef.current.offsetHeight;

      if (containerRef.current.scrollTop >= maxScroll) {
        setIsScrolling(false);
        lastTimeRef.current = 0;
        return;
      }

      const scrollAmount = getScrollSpeed(deltaTime);
      containerRef.current.scrollTop += scrollAmount;
      animationFrameRef.current = requestAnimationFrame(scroll);
    }
  };

  useEffect(() => {
    if (isScrolling) {
      lastTimeRef.current = 0;
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
  }, [isScrolling]);

  const resetScroll = () => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
      setIsScrolling(false);
      lastTimeRef.current = 0;
    }
  };

  const adjustSpeed = (delta: number) => {
    setSpeedLevel((prev) => Math.max(1, Math.min(10, prev + delta)));
  };

  const adjustFontSize = (delta: number) => {
    setFontSize((prev) => Math.max(16, Math.min(72, prev + delta)));
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] bg-black text-white p-4 rounded-lg">
      <div className="flex justify-center space-x-4 mb-4">
        <button
          onClick={() => setIsScrolling(!isScrolling)}
          className="p-2 rounded-full bg-blue-600 hover:bg-blue-700 transition-colors"
          title={isScrolling ? 'Pause' : 'Play'}
        >
          {isScrolling ? <FaPause /> : <FaPlay />}
        </button>
        <button
          onClick={resetScroll}
          className="p-2 rounded-full bg-gray-600 hover:bg-gray-700 transition-colors"
          title="Reset"
        >
          <FaUndo />
        </button>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => adjustSpeed(-1)}
            className="p-2 rounded-full bg-gray-600 hover:bg-gray-700 transition-colors"
            title="Decrease Speed"
          >
            <FaMinus />
          </button>
          <span className="min-w-[3rem] text-center">{speedLevel}/10</span>
          <button
            onClick={() => adjustSpeed(1)}
            className="p-2 rounded-full bg-gray-600 hover:bg-gray-700 transition-colors"
            title="Increase Speed"
          >
            <FaPlus />
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => adjustFontSize(-2)}
            className="p-2 rounded-full bg-gray-600 hover:bg-gray-700 transition-colors"
            title="Decrease Font Size"
          >
            <MdTextDecrease />
          </button>
          <span className="min-w-[3rem] text-center">{fontSize}px</span>
          <button
            onClick={() => adjustFontSize(2)}
            className="p-2 rounded-full bg-gray-600 hover:bg-gray-700 transition-colors"
            title="Increase Font Size"
          >
            <MdTextIncrease />
          </button>
        </div>
      </div>
      <div
        ref={containerRef}
        className="flex-1 overflow-y-scroll mirror-text hide-scrollbar"
        style={{
          perspective: '1000px',
          transform: 'rotateX(10deg)',
        }}
      >
        <div
          ref={contentRef}
          className="whitespace-pre-wrap p-4"
          style={{ fontSize: `${fontSize}px`, lineHeight: '1.5' }}
        >
          {text}
        </div>
      </div>
    </div>
  );
};
