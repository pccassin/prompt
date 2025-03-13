'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  FaPlay,
  FaPause,
  FaUndo,
  FaMinus,
  FaPlus,
  FaExpand,
  FaCompress,
  FaFastForward,
  FaFastBackward,
} from 'react-icons/fa';
import { MdTextIncrease, MdTextDecrease, MdOpacity } from 'react-icons/md';

interface TeleprompterProps {
  text: string;
}

// Feature flag for PIP mode
const ENABLE_PIP_MODE = true;

export default function Teleprompter({ text }: TeleprompterProps) {
  const [isScrolling, setIsScrolling] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState(1); // 1x, 2x, etc.
  const [fontSize, setFontSize] = useState(32);
  const [lineHeight, setLineHeight] = useState(1.5);
  const [isPIPMode, setIsPIPMode] = useState(false);
  const [opacity, setOpacity] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [isInfiniteScroll, setIsInfiniteScroll] = useState(false);

  // Calculate actual scroll speed based on font size and speed multiplier
  const getScrollSpeed = (deltaTime: number) => {
    const baseSpeed = 0.05; // pixels per millisecond at 1x speed and font size 32
    const fontSizeFactor = fontSize / 32; // Scale based on font size
    return baseSpeed * fontSizeFactor * speedMultiplier * deltaTime;
  };

  const scroll = (timestamp: number) => {
    if (!lastTimeRef.current) lastTimeRef.current = timestamp;
    const deltaTime = timestamp - lastTimeRef.current;
    lastTimeRef.current = timestamp;

    if (containerRef.current && contentRef.current) {
      const maxScroll =
        contentRef.current.offsetHeight - containerRef.current.offsetHeight;

      if (containerRef.current.scrollTop >= maxScroll) {
        if (isInfiniteScroll) {
          // Reset to top for infinite scroll
          containerRef.current.scrollTop = 0;
          setPosition(0);
        } else {
          setIsScrolling(false);
          setIsPlaying(false);
          lastTimeRef.current = 0;
          return;
        }
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

  // Handle PIP mode drag functionality
  useEffect(() => {
    if (!ENABLE_PIP_MODE || !isPIPMode || !wrapperRef.current) return;

    let isDragging = false;
    let currentX: number;
    let currentY: number;
    let initialX: number;
    let initialY: number;

    const dragStart = (e: MouseEvent) => {
      if (e.target instanceof HTMLButtonElement) return; // Don't drag when clicking buttons
      initialX = e.clientX - currentX;
      initialY = e.clientY - currentY;
      isDragging = true;
    };

    const dragEnd = () => {
      isDragging = false;
    };

    const drag = (e: MouseEvent) => {
      if (!isDragging) return;
      e.preventDefault();
      currentX = e.clientX - initialX;
      currentY = e.clientY - initialY;

      // Keep within viewport bounds
      const wrapper = wrapperRef.current!;
      const rect = wrapper.getBoundingClientRect();
      const maxX = window.innerWidth - rect.width;
      const maxY = window.innerHeight - rect.height;

      currentX = Math.max(0, Math.min(currentX, maxX));
      currentY = Math.max(0, Math.min(currentY, maxY));

      wrapper.style.transform = `translate(${currentX}px, ${currentY}px)`;
    };

    const element = wrapperRef.current;
    currentX = 0;
    currentY = 0;
    element.style.transform = 'translate(0px, 0px)';

    element.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);

    return () => {
      element.removeEventListener('mousedown', dragStart);
      document.removeEventListener('mousemove', drag);
      document.removeEventListener('mouseup', dragEnd);
    };
  }, [isPIPMode]);

  const resetScroll = () => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
      setIsScrolling(false);
      setIsPlaying(false);
      setPosition(0);
      lastTimeRef.current = 0;
    }
  };

  const adjustSpeed = (delta: number) => {
    setSpeedMultiplier((prev) => Math.max(0.5, Math.min(5, prev + delta)));
  };

  const adjustFontSize = (delta: number) => {
    setFontSize((prev) => Math.max(16, Math.min(72, prev + delta)));
  };

  const handleLineHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      setLineHeight(Math.max(1, Math.min(3, value)));
    }
  };

  const adjustOpacity = (delta: number) => {
    setOpacity((prev) => Math.max(0.3, Math.min(1, prev + delta)));
  };

  const togglePIPMode = () => {
    if (!ENABLE_PIP_MODE) return;
    setIsPIPMode(!isPIPMode);
    // Reset position when toggling PIP mode
    if (wrapperRef.current) {
      wrapperRef.current.style.transform = 'translate(0px, 0px)';
    }
    // Force a reflow to ensure styles are applied
    if (containerRef.current) {
      containerRef.current.style.display = 'none';
      containerRef.current.offsetHeight; // Force reflow
      containerRef.current.style.display = '';
    }
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    setIsScrolling(!isPlaying);
  };

  const handleFastForward = () => {
    if (containerRef.current) {
      const newPosition = Math.min(
        position + 100,
        containerRef.current.scrollHeight - containerRef.current.clientHeight
      );
      setPosition(newPosition);
      containerRef.current.scrollTop = newPosition;
    }
  };

  const handleFastBackward = () => {
    const newPosition = Math.max(0, position - 100);
    setPosition(newPosition);
    if (containerRef.current) {
      containerRef.current.scrollTop = newPosition;
    }
  };

  const toggleInfiniteScroll = () => {
    setIsInfiniteScroll(!isInfiniteScroll);
  };

  return (
    <div
      ref={wrapperRef}
      className={`${
        isPIPMode
          ? 'fixed top-4 right-4 w-96 z-50 cursor-move shadow-2xl rounded-lg'
          : 'w-full'
      } transition-all duration-300 ease-in-out`}
      style={{
        opacity: opacity,
        transform: isPIPMode ? undefined : 'none',
      }}
    >
      <div
        className={`flex flex-col ${
          isPIPMode ? 'h-64' : 'h-[calc(100vh-12rem)]'
        } bg-black text-white p-4 rounded-lg`}
      >
        <div className="flex justify-center space-x-2 mb-4 flex-wrap gap-2">
          <button
            onClick={handleFastBackward}
            className="p-2 rounded-full bg-gray-600 hover:bg-gray-700 transition-colors"
            title="Fast Backward"
          >
            <FaFastBackward />
          </button>
          <button
            onClick={handlePlayPause}
            className="p-2 rounded-full bg-blue-600 hover:bg-blue-700 transition-colors"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <FaPause /> : <FaPlay />}
          </button>
          <button
            onClick={handleFastForward}
            className="p-2 rounded-full bg-gray-600 hover:bg-gray-700 transition-colors"
            title="Fast Forward"
          >
            <FaFastForward />
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
              onClick={() => adjustSpeed(-0.5)}
              className="p-2 rounded-full bg-gray-600 hover:bg-gray-700 transition-colors"
              title="Decrease Speed"
            >
              <FaMinus />
            </button>
            <span className="min-w-[3rem] text-center">{speedMultiplier}x</span>
            <button
              onClick={() => adjustSpeed(0.5)}
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
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={lineHeight}
              onChange={handleLineHeightChange}
              step="0.1"
              min="1"
              max="3"
              className="w-16 bg-gray-700 rounded px-2 py-1 text-center"
              title="Line Height"
            />
          </div>
          <button
            onClick={toggleInfiniteScroll}
            className={`p-2 rounded-full transition-colors ${
              isInfiniteScroll
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-gray-600 hover:bg-gray-700'
            }`}
            title={
              isInfiniteScroll
                ? 'Disable Infinite Scroll'
                : 'Enable Infinite Scroll'
            }
          >
            <FaUndo className={isInfiniteScroll ? 'text-green-200' : ''} />
          </button>
          {ENABLE_PIP_MODE && (
            <>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => adjustOpacity(-0.1)}
                  className="p-2 rounded-full bg-gray-600 hover:bg-gray-700 transition-colors"
                  title="Decrease Opacity"
                >
                  <FaMinus />
                </button>
                <span className="min-w-[3rem] text-center flex items-center gap-1">
                  <MdOpacity />
                  {Math.round(opacity * 100)}%
                </span>
                <button
                  onClick={() => adjustOpacity(0.1)}
                  className="p-2 rounded-full bg-gray-600 hover:bg-gray-700 transition-colors"
                  title="Increase Opacity"
                >
                  <FaPlus />
                </button>
              </div>
              <button
                onClick={togglePIPMode}
                className="p-2 rounded-full bg-gray-600 hover:bg-gray-700 transition-colors"
                title={isPIPMode ? 'Exit PIP Mode' : 'Enter PIP Mode'}
              >
                {isPIPMode ? <FaCompress /> : <FaExpand />}
              </button>
            </>
          )}
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
            style={{
              fontSize: `${fontSize}px`,
              lineHeight: lineHeight,
              transition:
                'font-size 0.2s ease-in-out, line-height 0.2s ease-in-out',
            }}
          >
            {text}
          </div>
        </div>
      </div>
    </div>
  );
}
