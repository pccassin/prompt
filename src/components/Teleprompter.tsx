'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  FaGripVertical,
  FaTimes,
  FaGithub,
} from 'react-icons/fa';
import {
  MdTextIncrease,
  MdTextDecrease,
  MdOpacity,
  MdSpeed,
  MdPictureInPicture,
} from 'react-icons/md';
import { BsTextParagraph } from 'react-icons/bs';
import ReactDOM from 'react-dom/client';
import GitHubMarkdownSelector from './GitHubMarkdownSelector';

interface TeleprompterProps {
  text: string;
}

// Feature flag for mini-player mode
const ENABLE_MINI_PLAYER = true;

// Helper function to clone styles from main window to external window
const cloneStyles = (sourceDoc: Document, targetDoc: Document) => {
  // Add base styles
  const baseStyles = document.createElement('style');
  baseStyles.textContent = `
    .hide-scrollbar::-webkit-scrollbar {
      display: none;
    }
    .hide-scrollbar {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
    body {
      margin: 0;
      padding: 0;
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      background-color: #000;
      color: #fff;
    }
    .flex {
      display: flex;
    }
    .flex-col {
      flex-direction: column;
    }
    .flex-1 {
      flex: 1;
    }
    .h-full {
      height: 100%;
    }
    .w-full {
      width: 100%;
    }
    .text-white {
      color: #fff;
    }
    .p-2 {
      padding: 0.5rem;
    }
    .border-b {
      border-bottom-width: 1px;
    }
    .border-gray-700 {
      border-color: #374151;
    }
    .bg-gray-900 {
      background-color: #111827;
    }
    .bg-black {
      background-color: #000;
    }
    .justify-between {
      justify-content: space-between;
    }
    .items-center {
      align-items: center;
    }
    .space-x-2 > * + * {
      margin-left: 0.5rem;
    }
    .space-x-1 > * + * {
      margin-left: 0.25rem;
    }
    .cursor-move {
      cursor: move;
    }
    .text-xs {
      font-size: 0.75rem;
    }
    .font-medium {
      font-weight: 500;
    }
    .rounded-full {
      border-radius: 9999px;
    }
    .bg-blue-600 {
      background-color: #2563eb;
    }
    .hover\\:bg-blue-700:hover {
      background-color: #1d4ed8;
    }
    .bg-gray-600 {
      background-color: #4b5563;
    }
    .hover\\:bg-gray-700:hover {
      background-color: #374151;
    }
    .transition-colors {
      transition-property: background-color;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
      transition-duration: 150ms;
    }
    .overflow-y-auto {
      overflow-y: auto;
    }
    .whitespace-pre-wrap {
      white-space: pre-wrap;
    }
    .mini-player-container {
      display: flex;
      flex-direction: column;
      height: 100vh;
      width: 100vw;
      overflow: hidden;
    }
    .mini-player-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem;
      background-color: #111827;
      border-bottom: 1px solid #374151;
    }
    .mini-player-content {
      flex: 1;
      overflow-y: auto;
      scroll-behavior: smooth;
    }
    .mini-player-text {
      white-space: pre-wrap;
      padding: 1rem;
    }
  `;
  targetDoc.head.appendChild(baseStyles);
};

// External window component
const ExternalWindowTeleprompter = ({
  text,
  fontSize,
  lineHeight,
  isPlaying,
  speedMultiplier,
  isInfiniteScroll,
  opacity,
  fileName,
  onPlayPause,
  onClose,
}: {
  text: string;
  fontSize: number;
  lineHeight: number;
  isPlaying: boolean;
  speedMultiplier: number;
  isInfiniteScroll: boolean;
  opacity: number;
  fileName?: string;
  onPlayPause: () => void;
  onClose: () => void;
}) => {
  return (
    <div
      className="mini-player-container"
      style={{ backgroundColor: `rgba(0, 0, 0, ${opacity})` }}
    >
      <div className="mini-player-header">
        <div className="flex items-center space-x-2">
          <FaGripVertical className="text-xs text-gray-400" />
          <span className="text-xs font-medium text-white">Teleprompter</span>
          {fileName && (
            <span className="text-xs text-gray-400 ml-2">{fileName}</span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={onPlayPause}
            className="p-1 rounded-full bg-blue-600 hover:bg-blue-700 transition-colors text-xs"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <FaPause size={10} /> : <FaPlay size={10} />}
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded-full bg-gray-600 hover:bg-gray-700 transition-colors text-xs"
            title="Close Window"
          >
            <FaTimes size={10} />
          </button>
        </div>
      </div>
      <div
        className="mini-player-content hide-scrollbar"
        id="external-container"
      >
        <div
          className="mini-player-text"
          id="external-content"
          style={{
            fontSize: `${Math.max(12, fontSize * 0.6)}px`,
            lineHeight: lineHeight,
            opacity: opacity,
          }}
        >
          {text}
          {isInfiniteScroll && text && (
            <>
              <div style={{ height: '1rem' }} /> {/* Spacer */}
              {text}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default function Teleprompter({ text: initialText }: TeleprompterProps) {
  const [text, setText] = useState(initialText || '');
  const [isScrolling, setIsScrolling] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [fontSize, setFontSize] = useState(32);
  const [lineHeight, setLineHeight] = useState(1.5);
  const [opacity, setOpacity] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [isInfiniteScroll, setIsInfiniteScroll] = useState(false);
  const [externalWindow, setExternalWindow] = useState<Window | null>(null);
  const externalAnimationRef = useRef<number>();
  const externalLastTimeRef = useRef<number>(0);
  const [showGitHubSelector, setShowGitHubSelector] = useState(false);
  const [currentFileName, setCurrentFileName] = useState('');

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
      const maxScroll = contentRef.current.offsetHeight / 2; // Half of the duplicated content

      if (containerRef.current.scrollTop >= maxScroll) {
        // Reset to the beginning of the first copy
        containerRef.current.scrollTop = 0;
        setPosition(0);
      }

      const scrollAmount = getScrollSpeed(deltaTime);
      containerRef.current.scrollTop += scrollAmount;
      animationFrameRef.current = requestAnimationFrame(scroll);
    }
  };

  // Separate scroll function for external window
  const scrollExternal = useCallback(
    (timestamp: number) => {
      if (!externalWindow) return;

      if (!externalLastTimeRef.current) externalLastTimeRef.current = timestamp;
      const deltaTime = timestamp - externalLastTimeRef.current;
      externalLastTimeRef.current = timestamp;

      const externalContainer =
        externalWindow.document.getElementById('external-container');
      const externalContent =
        externalWindow.document.getElementById('external-content');

      if (externalContainer && externalContent) {
        const maxScroll = externalContent.offsetHeight / 2;

        if (externalContainer.scrollTop >= maxScroll) {
          externalContainer.scrollTop = 0;
        }

        const scrollAmount = getScrollSpeed(deltaTime);
        externalContainer.scrollTop += scrollAmount;
        externalAnimationRef.current =
          externalWindow.requestAnimationFrame(scrollExternal);
      }
    },
    [externalWindow, speedMultiplier, fontSize]
  );

  // Animation for main window
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

  // Animation for external window
  useEffect(() => {
    if (isScrolling && externalWindow) {
      externalLastTimeRef.current = 0;
      externalAnimationRef.current =
        externalWindow.requestAnimationFrame(scrollExternal);
    } else {
      if (externalAnimationRef.current && externalWindow) {
        externalWindow.cancelAnimationFrame(externalAnimationRef.current);
        externalAnimationRef.current = undefined;
      }
    }

    return () => {
      if (externalAnimationRef.current && externalWindow) {
        externalWindow.cancelAnimationFrame(externalAnimationRef.current);
        externalAnimationRef.current = undefined;
      }
    };
  }, [isScrolling, externalWindow, scrollExternal]);

  const resetScroll = () => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
      setIsScrolling(false);
      setIsPlaying(false);
      setPosition(0);
      lastTimeRef.current = 0;
    }

    // Also reset the external window scroll
    if (externalWindow) {
      const externalContainer =
        externalWindow.document.getElementById('external-container');
      if (externalContainer) {
        externalContainer.scrollTop = 0;
        externalLastTimeRef.current = 0;
      }
    }
  };

  const adjustSpeed = (delta: number) => {
    setSpeedMultiplier((prev) => Math.max(0.5, Math.min(5, prev + delta)));
  };

  const adjustFontSize = (delta: number) => {
    setFontSize((prev) => Math.max(16, Math.min(72, prev + delta)));

    // Update the external window's font size
    if (externalWindow) {
      const externalContent =
        externalWindow.document.getElementById('external-content');
      if (externalContent) {
        externalContent.style.fontSize = `${Math.max(
          12,
          (fontSize + delta) * 0.6
        )}px`;
      }
    }
  };

  const handleLineHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      setLineHeight(Math.max(1, Math.min(3, value)));

      // Update the external window's line height
      if (externalWindow) {
        const externalContent =
          externalWindow.document.getElementById('external-content');
        if (externalContent) {
          externalContent.style.lineHeight = `${value}`;
        }
      }
    }
  };

  const adjustOpacity = (delta: number) => {
    const newOpacity = Math.max(0.3, Math.min(1, opacity + delta));
    setOpacity(newOpacity);

    // Apply opacity to external window
    if (externalWindow) {
      const externalContent =
        externalWindow.document.getElementById('external-content');
      if (externalContent) {
        externalContent.style.opacity = String(newOpacity);
      }

      // Update background for true translucency
      const container = externalWindow.document.querySelector(
        '.mini-player-container'
      ) as HTMLElement;
      if (container) {
        container.style.backgroundColor = `rgba(0, 0, 0, ${newOpacity})`;
      }
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

      // Also fast forward the external window
      if (externalWindow) {
        const externalContainer =
          externalWindow.document.getElementById('external-container');
        if (externalContainer) {
          externalContainer.scrollTop += 100;
        }
      }
    }
  };

  const handleFastBackward = () => {
    const newPosition = Math.max(0, position - 100);
    setPosition(newPosition);
    if (containerRef.current) {
      containerRef.current.scrollTop = newPosition;

      // Also fast backward the external window
      if (externalWindow) {
        const externalContainer =
          externalWindow.document.getElementById('external-container');
        if (externalContainer) {
          externalContainer.scrollTop -= 100;
        }
      }
    }
  };

  const toggleInfiniteScroll = () => {
    setIsInfiniteScroll(!isInfiniteScroll);
  };

  const openExternalWindow = useCallback(() => {
    // Only run this on the client side
    if (typeof window === 'undefined') return;

    if (externalWindow) {
      externalWindow.close();
      setExternalWindow(null);
      return;
    }

    // Open a new window
    const newWindow = window.open(
      '',
      'Teleprompter',
      'width=400,height=600,resizable=yes,scrollbars=yes'
    );

    if (newWindow) {
      setExternalWindow(newWindow);

      // Add base HTML structure
      newWindow.document.write(
        '<html><head><title>Teleprompter</title></head><body><div id="root"></div></body></html>'
      );

      // Clone styles to new window
      cloneStyles(document, newWindow.document);

      // Create a root for React
      const root = ReactDOM.createRoot(
        newWindow.document.getElementById('root') as HTMLElement
      );

      // Render the teleprompter in the new window
      root.render(
        <ExternalWindowTeleprompter
          text={text}
          fontSize={fontSize}
          lineHeight={lineHeight}
          isPlaying={isPlaying}
          speedMultiplier={speedMultiplier}
          isInfiniteScroll={isInfiniteScroll}
          opacity={opacity}
          fileName={currentFileName}
          onPlayPause={handlePlayPause}
          onClose={() => {
            newWindow.close();
            setExternalWindow(null);
          }}
        />
      );

      // Handle window close
      newWindow.addEventListener('beforeunload', () => {
        setExternalWindow(null);
      });
    }
  }, [
    externalWindow,
    text,
    fontSize,
    lineHeight,
    isPlaying,
    speedMultiplier,
    isInfiniteScroll,
    opacity,
    currentFileName,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (externalWindow) {
        externalWindow.close();
      }
    };
  }, [externalWindow]);

  const handleMarkdownSelect = (markdownContent: string, fileName: string) => {
    setText(markdownContent);
    setCurrentFileName(fileName);
    setShowGitHubSelector(false);

    // Reset scroll position
    resetScroll();
  };

  return (
    <>
      {/* Main teleprompter */}
      <div
        ref={wrapperRef}
        className="w-full transition-all duration-300 ease-in-out"
      >
        <div className="flex flex-col h-[calc(100vh-12rem)] bg-black text-white rounded-lg overflow-hidden">
          <div className="flex justify-between items-center p-2 border-b border-gray-700">
            <div className="flex items-center space-x-2">
              <FaGripVertical className="cursor-move" />
              <span className="text-sm font-medium">Prompt Controls</span>
              {currentFileName && (
                <span className="text-xs text-gray-400 ml-2">
                  File: {currentFileName}
                </span>
              )}
            </div>
          </div>
          <div className="flex-1 p-4 flex flex-col overflow-hidden">
            <div className="flex justify-center space-x-2 mb-4 flex-wrap gap-2">
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleFastBackward}
                  className="p-2 rounded-full bg-gray-600 hover:bg-gray-700 transition-colors"
                  title="Fast Backward"
                >
                  <FaFastBackward />
                </button>
                <button
                  onClick={handlePlayPause}
                  data-action={isPlaying ? 'pause' : 'play'}
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
              </div>
              <div className="flex items-center space-x-2">
                <MdSpeed className="text-gray-400" />
                <button
                  onClick={() => adjustSpeed(-0.5)}
                  className="p-2 rounded-full bg-gray-600 hover:bg-gray-700 transition-colors"
                  title="Decrease Speed"
                >
                  <FaMinus />
                </button>
                <span data-display="speed" className="min-w-[3rem] text-center">
                  {speedMultiplier}x
                </span>
                <button
                  onClick={() => adjustSpeed(0.5)}
                  data-action="speed-up"
                  className="p-2 rounded-full bg-gray-600 hover:bg-gray-700 transition-colors"
                  title="Increase Speed"
                >
                  <FaPlus />
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <MdTextIncrease className="text-gray-400" />
                <button
                  onClick={() => adjustFontSize(-2)}
                  className="p-2 rounded-full bg-gray-600 hover:bg-gray-700 transition-colors"
                  title="Decrease Font Size"
                >
                  <MdTextDecrease />
                </button>
                <span
                  data-display="fontSize"
                  className="min-w-[3rem] text-center"
                >
                  {fontSize}px
                </span>
                <button
                  onClick={() => adjustFontSize(2)}
                  data-action="font-up"
                  className="p-2 rounded-full bg-gray-600 hover:bg-gray-700 transition-colors"
                  title="Increase Font Size"
                >
                  <MdTextIncrease />
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <BsTextParagraph className="text-gray-400" />
                <input
                  type="number"
                  value={lineHeight}
                  onChange={handleLineHeightChange}
                  step="0.1"
                  min="1"
                  max="3"
                  id="line-height"
                  name="line-height"
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
              <div className="flex items-center space-x-2">
                <MdOpacity className="text-gray-400" />
                <button
                  onClick={() => adjustOpacity(-0.1)}
                  className="p-2 rounded-full bg-gray-600 hover:bg-gray-700 transition-colors"
                  title="Decrease Opacity"
                >
                  <FaMinus />
                </button>
                <span
                  data-display="opacity"
                  className="min-w-[3rem] text-center flex items-center gap-1"
                >
                  {Math.round(opacity * 100)}%
                </span>
                <button
                  onClick={() => adjustOpacity(0.1)}
                  data-action="opacity-up"
                  className="p-2 rounded-full bg-gray-600 hover:bg-gray-700 transition-colors"
                  title="Increase Opacity"
                >
                  <FaPlus />
                </button>
              </div>
              {ENABLE_MINI_PLAYER && (
                <button
                  onClick={openExternalWindow}
                  className={`p-2 rounded-full transition-colors ${
                    externalWindow
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                  title={
                    externalWindow
                      ? 'Close External Window'
                      : 'Open External Window'
                  }
                >
                  <MdPictureInPicture />
                </button>
              )}

              {/* GitHub Integration Button */}
              <button
                onClick={() => setShowGitHubSelector(true)}
                className="p-2 rounded-full bg-gray-600 hover:bg-gray-700 transition-colors"
                title="Load from GitHub"
              >
                <FaGithub />
              </button>
            </div>
            <div
              ref={containerRef}
              className="flex-1 overflow-y-auto mirror-text hide-scrollbar"
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
                {isInfiniteScroll && text && (
                  <>
                    <div className="h-8" /> {/* Spacer */}
                    {text}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* GitHub Markdown Selector Modal */}
      {showGitHubSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl h-[80vh]">
            <GitHubMarkdownSelector
              onSelectMarkdown={handleMarkdownSelect}
              onClose={() => setShowGitHubSelector(false)}
            />
          </div>
        </div>
      )}

      <div className="fixed bottom-4 right-4 text-xs text-gray-400 z-40">
        <a
          href="https://linkedin.com/in/pccassin"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-blue-400 transition-colors"
        >
          Product engineered by Paulo Cassin
        </a>
      </div>
    </>
  );
}
