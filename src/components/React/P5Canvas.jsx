import React, { useRef, useEffect, useState } from 'react';

/**
 * P5Canvas - A wrapper component for p5.js sketches following Nature of Code patterns
 *
 * @param {Object} props
 * @param {Function} props.sketch - p5 sketch function (receives p5 instance)
 * @param {string} props.githubUrl - Optional GitHub repository URL
 * @param {number} props.width - Canvas width (default: 600)
 * @param {number} props.height - Canvas height (default: 400)
 * @param {string} props.title - Optional title for the simulation
 */


// React에 필요한 훅 가져오고, P5Canvas가 받을 수 있는 props 정의 하기 
const P5Canvas = ({
  sketch,
  githubUrl = '',
  width = null,
  height = null,
  title = ''
}) => { //Ref를 써야지 요소나 객체를 기억해서 값이 변해도 리렌더링이 안됨
  const canvasRef = useRef(null); // 캔버스의 위치 참조용
  const containerRef = useRef(null); // 컨테이너 참조용
  const p5Instance = useRef(null); // p5 인스턴스 저장용
  const isPausedRef = useRef(false); // 일시정지 상태 저장용
  const [isPaused, setIsPaused] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 600, height: 400 });

  useEffect(() => { //useEffect가 실행된다는 것은 클라이언트니까 setIsClient(true)로 설정
    setIsClient(true);
  }, []);

  // 부모 요소 크기 감지
  useEffect(() => {
    if (!containerRef.current) return;

    const updateSize = () => {
      const container = containerRef.current;
      if (container) {
        const w = width || container.clientWidth;
        const h = height || container.clientHeight || 400;
        setCanvasSize({ width: w, height: h });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize); //윈도우 리사이즈 이벤트 리스너
    return () => window.removeEventListener('resize', updateSize);
  }, [width, height]);

  useEffect(() => {
    if (!isClient || !canvasRef.current || !sketch) return;

    // Dynamic import of p5 to avoid SSR issues
    import('p5').then((p5Module) => {
      const p5 = p5Module.default;

      // Create p5 instance
      p5Instance.current = new p5((p) => {
        // Call sketch function once to get setup, draw, reset
        const sketchFunctions = sketch(p);

        p.setup = () => {
          p.createCanvas(canvasSize.width, canvasSize.height);

          // Bind mouse events inside setup
          if (sketchFunctions.mousePressed) {
            p.mousePressed = () => {
              console.log('P5Canvas: mousePressed called');
              return sketchFunctions.mousePressed();
            };
          }
          if (sketchFunctions.mouseDragged) {
            p.mouseDragged = () => {
              console.log('P5Canvas: mouseDragged called');
              return sketchFunctions.mouseDragged();
            };
          }
          if (sketchFunctions.mouseReleased) {
            p.mouseReleased = () => {
              console.log('P5Canvas: mouseReleased called');
              return sketchFunctions.mouseReleased();
            };
          }
          if (sketchFunctions.mouseClicked) {
            p.mouseClicked = () => sketchFunctions.mouseClicked();
          }
          if (sketchFunctions.mouseMoved) {
            p.mouseMoved = () => sketchFunctions.mouseMoved();
          }

          if (sketchFunctions.setup) {
            sketchFunctions.setup();
          }
        };

        p.draw = () => {
          if (!isPausedRef.current && sketchFunctions.draw) {
            sketchFunctions.draw();
          }
        };

        // Expose reset function
        p.resetSketch = () => {
          if (sketchFunctions.reset) {
            sketchFunctions.reset();
          } else {
            // Default reset: clear and restart
            p.clear();
            if (sketchFunctions.setup) {
              sketchFunctions.setup();
            }
          }
        };
      }, canvasRef.current);
    });

    return () => {
      if (p5Instance.current) {
        p5Instance.current.remove();
        p5Instance.current = null;
      }
    };
  }, [isClient, sketch, canvasSize.width, canvasSize.height]);

  // 캔버스 리사이즈
  useEffect(() => {
    if (p5Instance.current && p5Instance.current.resizeCanvas) {
      p5Instance.current.resizeCanvas(canvasSize.width, canvasSize.height);
    }
  }, [canvasSize]);

  // Handle pause/play toggle
  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  const handleReset = () => {
    if (p5Instance.current && p5Instance.current.resetSketch) {
      p5Instance.current.resetSketch();
      setIsPaused(false);
    }
  };

  const handlePauseToggle = () => {
    setIsPaused(!isPaused);
  };

  if (!isClient) {
    return (
      <div className="p5-canvas-wrapper card-base p-1 my-6">
        {title && (
          <h3 className="text-xl font-medium text-90 mb-4">{title}</h3>
        )}
        <div
          ref={containerRef}
          className="canvas-container bg-[var(--codeblock-bg)] rounded-lg overflow-hidden mb-4 flex items-center justify-center w-full"
          style={{minHeight: height ? `${height}px` : '400px'}}
        >
          <p className="text-50">Loading simulation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p5-canvas-wrapper card-base p-1 my-6">
      {title && (
        <h3 className="text-xl font-medium text-90 mb-4">{title}</h3>
      )}

      {/* Canvas container */}
      <div
        ref={containerRef}
        className="canvas-container bg-[var(--codeblock-bg)] rounded-lg overflow-hidden mb-4 flex items-center justify-center w-full"
      >
        <div ref={canvasRef} className="p5-canvas-mount" />
      </div>

      {/* Control panel */}
      <div className="controls-panel flex items-center justify-between">
        {/* Left controls: Reset and Pause/Play */}
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="btn-regular px-4 py-2 rounded-lg font-medium text-sm transition-all"
            aria-label="Reset simulation"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="inline-block w-4 h-4 mr-1.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
              <path d="M3 21v-5h5" />
            </svg>
            초기화
          </button>

          <button
            onClick={handlePauseToggle}
            className="btn-regular px-4 py-2 rounded-lg font-medium text-sm transition-all"
            aria-label={isPaused ? 'Play simulation' : 'Pause simulation'}
          >
            {isPaused ? (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="inline-block w-4 h-4 mr-1.5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
                재시작
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="inline-block w-4 h-4 mr-1.5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
                일시정지
              </>
            )}
          </button>
        </div>

        {/* Right controls: GitHub link */}
        {githubUrl && (
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-plain px-3 py-2 rounded-lg text-sm font-medium inline-flex items-center gap-1.5 hover:scale-105 transition-transform whitespace-nowrap"
            aria-label="View code on GitHub"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 inline-block flex-shrink-0 mr-1.5"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            <span>코드 보기</span>
          </a>
        )}
      </div>
    </div>
  );
};

export default P5Canvas;
