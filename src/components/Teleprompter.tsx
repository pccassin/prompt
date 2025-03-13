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
  FaGripVertical,
} from 'react-icons/fa';
import {
  MdTextIncrease,
  MdTextDecrease,
  MdOpacity,
  MdSpeed,
} from 'react-icons/md';
import { BsTextParagraph } from 'react-icons/bs';

interface TeleprompterProps {
  text: string;
}

// Feature flag for PIP mode
const ENABLE_PIP_MODE = true;

export default function Teleprompter({ text }: TeleprompterProps) {
  const [isScrolling, setIsScrolling] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
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
  const [pipSize, setPipSize] = useState({ width: 384, height: 256 });
  const [isPipFloating, setIsPipFloating] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStartSize, setResizeStartSize] = useState({
    width: 0,
    height: 0,
  });
  const [resizeStartPos, setResizeStartPos] = useState({ x: 0, y: 0 });

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

  const handlePipResizeStart = (e: React.MouseEvent) => {
    if (!isPIPMode) return;
    e.preventDefault();
    setIsResizing(true);
    setResizeStartSize(pipSize);
    setResizeStartPos({ x: e.clientX, y: e.clientY });
  };

  const handlePipResizeMove = (e: MouseEvent) => {
    if (!isResizing) return;
    e.preventDefault();
    const deltaX = e.clientX - resizeStartPos.x;
    const deltaY = e.clientY - resizeStartPos.y;
    setPipSize({
      width: Math.max(200, Math.min(800, resizeStartSize.width + deltaX)),
      height: Math.max(150, Math.min(600, resizeStartSize.height + deltaY)),
    });
  };

  const handlePipResizeEnd = () => {
    setIsResizing(false);
  };

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handlePipResizeMove);
      document.addEventListener('mouseup', handlePipResizeEnd);
    }
    return () => {
      document.removeEventListener('mousemove', handlePipResizeMove);
      document.removeEventListener('mouseup', handlePipResizeEnd);
    };
  }, [isResizing]);

  const togglePipFloating = () => {
    setIsPipFloating(!isPipFloating);
    if (!isPipFloating && wrapperRef.current) {
      // Create a new window for floating mode
      const width = pipSize.width;
      const height = pipSize.height;
      const left = (window.screen.width - width) / 2;
      const top = (window.screen.height - height) / 2;

      const popup = window.open(
        '',
        'Prompt PIP',
        `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`
      );

      if (popup) {
        // Get all styles from the current document
        const styles = Array.from(document.styleSheets)
          .map((sheet) => {
            try {
              return Array.from(sheet.cssRules)
                .map((rule) => rule.cssText)
                .join('\n');
            } catch (e) {
              return '';
            }
          })
          .join('\n');

        // Create a new document with all necessary styles and scripts
        popup.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Prompt PIP</title>
              <style>
                ${styles}
                body { margin: 0; background: black; color: white; }
                .pip-container { width: 100%; height: 100%; }
                .mirror-text { transform: scaleY(-1); }
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
              </style>
            </head>
            <body>
              <div class="pip-container">
                ${wrapperRef.current.innerHTML}
              </div>
              <script>
                // Initialize state in the popup window
                let isPlaying = false;
                let speedMultiplier = 1;
                let fontSize = 32;
                let opacity = 1;
                let isInfiniteScroll = false;
                let lineHeight = 1.5;

                // SVG icons for play/pause
                const playIcon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M96 448V64c0-17.7 14.3-32 32-32h32c17.7 0 32 14.3 32 32V448c0 17.7-14.3 32-32 32H128c-17.7 0-32-14.3-32-32zm96-416h32c17.7 0 32 14.3 32 32V448c0 17.7-14.3 32-32 32H192c-17.7 0-32-14.3-32-32V64c0-17.7 14.3-32 32-32z"/></svg>';
                const pauseIcon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M464 256A208 208 0 1 0 48 256a208 208 0 1 0 416 0zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zM188.3 147.1c7.6-4.2 16.8-4.1 24.3 .5l144 88c7.1 4.4 11.5 12 11.5 19.8s-4.4 15.4-11.5 19.8l-144 88c-7.4 4.5-16.7 4.7-24.3 .5s-12.3-12.2-12.3-20.3V167.4c0-8.1 4.9-15.4 12.3-20.3z"/></svg>';

                // Re-initialize controls in the new window
                window.addEventListener('load', () => {
                  const container = document.querySelector('.pip-container');
                  if (container) {
                    // Re-attach event listeners
                    const buttons = container.querySelectorAll('button');
                    buttons.forEach(button => {
                      button.addEventListener('click', (e) => {
                        const action = e.target.closest('button').getAttribute('data-action');
                        if (action) {
                          // Handle actions locally in the popup
                          switch (action) {
                            case 'play':
                              isPlaying = !isPlaying;
                              window.opener.postMessage({ type: 'pip-state', state: { isPlaying } }, '*');
                              break;
                            case 'pause':
                              isPlaying = false;
                              window.opener.postMessage({ type: 'pip-state', state: { isPlaying } }, '*');
                              break;
                            case 'speed-up':
                              speedMultiplier = Math.min(5, speedMultiplier + 0.5);
                              window.opener.postMessage({ type: 'pip-state', state: { speedMultiplier } }, '*');
                              break;
                            case 'speed-down':
                              speedMultiplier = Math.max(0.5, speedMultiplier - 0.5);
                              window.opener.postMessage({ type: 'pip-state', state: { speedMultiplier } }, '*');
                              break;
                            case 'font-up':
                              fontSize = Math.min(72, fontSize + 2);
                              window.opener.postMessage({ type: 'pip-state', state: { fontSize } }, '*');
                              break;
                            case 'font-down':
                              fontSize = Math.max(16, fontSize - 2);
                              window.opener.postMessage({ type: 'pip-state', state: { fontSize } }, '*');
                              break;
                            case 'opacity-up':
                              opacity = Math.min(1, opacity + 0.1);
                              window.opener.postMessage({ type: 'pip-state', state: { opacity } }, '*');
                              break;
                            case 'opacity-down':
                              opacity = Math.max(0.3, opacity - 0.1);
                              window.opener.postMessage({ type: 'pip-state', state: { opacity } }, '*');
                              break;
                            case 'dock':
                              window.opener.postMessage({ type: 'pip-action', action: 'dock' }, '*');
                              break;
                            case 'close':
                              window.opener.postMessage({ type: 'pip-action', action: 'close' }, '*');
                              break;
                          }
                          // Update UI
                          updateUI();
                        }
                      });
                    });

                    // Add line height input handler
                    const lineHeightInput = container.querySelector('input[type="number"]');
                    if (lineHeightInput) {
                      lineHeightInput.addEventListener('change', (e) => {
                        const value = parseFloat(e.target.value);
                        if (!isNaN(value)) {
                          lineHeight = Math.max(1, Math.min(3, value));
                          updateUI();
                        }
                      });
                    }
                  }
                });

                function updateUI() {
                  const container = document.querySelector('.pip-container');
                  if (container) {
                    // Update speed display
                    const speedDisplay = container.querySelector('[data-display="speed"]');
                    if (speedDisplay) speedDisplay.textContent = speedMultiplier + 'x';

                    // Update font size display
                    const fontSizeDisplay = container.querySelector('[data-display="fontSize"]');
                    if (fontSizeDisplay) fontSizeDisplay.textContent = fontSize + 'px';

                    // Update opacity display
                    const opacityDisplay = container.querySelector('[data-display="opacity"]');
                    if (opacityDisplay) opacityDisplay.textContent = Math.round(opacity * 100) + '%';

                    // Update play/pause button
                    const playButton = container.querySelector('[data-action="play"]');
                    if (playButton) {
                      playButton.innerHTML = isPlaying ? pauseIcon : playIcon;
                    }

                    // Update container opacity
                    container.style.opacity = opacity;

                    // Update text styles
                    const content = container.querySelector('.whitespace-pre-wrap');
                    if (content) {
                      content.style.fontSize = fontSize + 'px';
                      content.style.lineHeight = lineHeight;
                    }
                  }
                }

                // Listen for messages from the main window
                window.addEventListener('message', (event) => {
                  if (event.data.type === 'pip-update') {
                    const container = document.querySelector('.pip-container');
                    if (container) {
                      container.innerHTML = event.data.content;
                    }
                  }
                });
              </script>
            </body>
          </html>
        `);
        popup.document.close();

        // Store the popup window reference
        const popupRef = popup;

        // Listen for messages from the popup
        window.addEventListener('message', (event) => {
          if (event.data.type === 'pip-state') {
            // Update state in the main window
            const { state } = event.data;
            if (state.isPlaying !== undefined) setIsPlaying(state.isPlaying);
            if (state.speedMultiplier !== undefined)
              setSpeedMultiplier(state.speedMultiplier);
            if (state.fontSize !== undefined) setFontSize(state.fontSize);
            if (state.opacity !== undefined) setOpacity(state.opacity);
          } else if (event.data.type === 'pip-action') {
            // Handle actions from the popup
            switch (event.data.action) {
              case 'dock':
                setIsPipFloating(false);
                popupRef.close();
                break;
              case 'close':
                setIsPIPMode(false);
                setIsPipFloating(false);
                popupRef.close();
                break;
            }
          }
        });
      }
    }
  };

  return (
    <>
      <div
        ref={wrapperRef}
        className={`${
          isPIPMode
            ? `fixed z-50 cursor-move shadow-2xl rounded-lg ${
                isPipFloating ? 'border-2 border-blue-500' : ''
              }`
            : 'w-full'
        } transition-all duration-300 ease-in-out`}
        style={{
          opacity: opacity,
          transform: isPIPMode ? undefined : 'none',
          width: isPIPMode ? `${pipSize.width}px` : '100%',
          height: isPIPMode ? `${pipSize.height}px` : 'auto',
        }}
      >
        <div
          className={`flex flex-col ${
            isPIPMode ? 'h-full' : 'h-[calc(100vh-12rem)]'
          } bg-black text-white rounded-lg overflow-hidden`}
        >
          <div className="flex justify-between items-center p-2 border-b border-gray-700">
            <div className="flex items-center space-x-2">
              <FaGripVertical className="cursor-move" />
              <span className="text-sm font-medium">Prompt Controls</span>
            </div>
            {isPIPMode && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={togglePipFloating}
                  data-action="dock"
                  className="text-xs px-2 py-1 rounded bg-blue-600 hover:bg-blue-700"
                  title={isPipFloating ? 'Dock PIP' : 'Float PIP'}
                >
                  {isPipFloating ? 'Dock' : 'Float'}
                </button>
                <button
                  onClick={() => setIsPIPMode(false)}
                  data-action="close"
                  className="text-xs px-2 py-1 rounded bg-red-600 hover:bg-red-700"
                >
                  Close
                </button>
              </div>
            )}
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
              className="flex-1 overflow-y-auto mirror-text hide-scrollbar"
              style={{
                perspective: '1000px',
                transform: 'rotateX(10deg)',
                height: isPIPMode ? `${pipSize.height - 120}px` : 'auto',
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
          {isPIPMode && (
            <div
              className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
              onMouseDown={handlePipResizeStart}
            />
          )}
        </div>
      </div>
      <div className="fixed bottom-4 right-4 text-xs text-gray-400 z-50">
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
