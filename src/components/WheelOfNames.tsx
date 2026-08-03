import React, { useRef, useEffect, useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Player } from '../types';
import { sound } from '../utils/sound';

interface WheelOfNamesProps {
  players: Player[];
  onSelectPlayer: (player: Player) => void;
  isSpinning: boolean;
  setIsSpinning: (val: boolean) => void;
  selectedPlayer: Player | null;
}

// Vibrant Wheel of Names palette
const SLICE_COLORS = [
  '#E53935', // Red
  '#1E88E5', // Blue
  '#43A047', // Green
  '#FB8C00', // Orange
  '#8E24AA', // Purple
  '#00ACC1', // Cyan/Teal
  '#FDD835', // Yellow
  '#D81B60', // Pink/Rose
  '#3949AB', // Indigo
  '#00897B', // Dark Teal
  '#7CB342', // Light Green
  '#F4511E', // Deep Orange
];

export const WheelOfNames: React.FC<WheelOfNamesProps> = ({
  players,
  onSelectPlayer,
  isSpinning,
  setIsSpinning,
  selectedPlayer,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wheelDiskRef = useRef<HTMLDivElement | null>(null);
  const pointerRef = useRef<HTMLDivElement | null>(null);

  const rotationRef = useRef<number>(0);
  const animationRef = useRef<number | null>(null);
  const winnerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pointerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const spinningRef = useRef<boolean>(false);
  const lastTickSegmentRef = useRef<number>(-1);

  // Drag-to-spin state
  const isDraggingRef = useRef<boolean>(false);
  const suppressClickRef = useRef<boolean>(false);
  const lastDragAngleRef = useRef<number>(0);
  const dragVelocitiesRef = useRef<{ angle: number; time: number }[]>([]);

  const [winner, setWinner] = useState<Player | null>(selectedPlayer);
  const [displaySize, setDisplaySize] = useState<number>(360);

  const numPlayers = players.length;
  const sliceAngle = (2 * Math.PI) / Math.max(numPlayers, 1);

  // 1. Fluid Responsive Sizing (Min 280px, Max 420px)
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        const size = Math.min(width - 24, 420);
        setDisplaySize(Math.max(280, size));
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // 2. Pre-render the Wheel Disk Texture ONCE onto Canvas
  const renderWheelDisk = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const size = displaySize;

    canvas.width = size * dpr;
    canvas.height = size * dpr;

    ctx.save();
    ctx.scale(dpr, dpr);

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - 12; // Radius leaving space for pegs

    ctx.clearRect(0, 0, size, size);

    if (numPlayers === 0) {
      ctx.fillStyle = '#1e1b4b';
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Ajoutez au moins 2 joueurs !', centerX, centerY);
      ctx.restore();
      return;
    }

    ctx.translate(centerX, centerY);

    // Draw Slices
    for (let i = 0; i < numPlayers; i++) {
      const startAngle = i * sliceAngle;
      const endAngle = startAngle + sliceAngle;
      const color = players[i].color || SLICE_COLORS[i % SLICE_COLORS.length];

      // Slice wedge
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();

      // White slice divider line
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Radial Player Name
      ctx.save();
      const textAngle = startAngle + sliceAngle / 2;
      ctx.rotate(textAngle);

      ctx.fillStyle = '#ffffff';
      // Auto font size calculation matching Wheel of Names
      const fontSize = Math.max(12, Math.min(18, (radius * 0.42) / Math.max(1, Math.log2(numPlayers + 1))));
      ctx.font = `900 ${fontSize}px system-ui, -apple-system, sans-serif`;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';

      // Drop shadow for name contrast
      ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;

      const nameText = `${players[i].avatar ? players[i].avatar + ' ' : ''}${players[i].name}`;
      const maxTextWidth = radius - 50;
      let fitText = nameText;
      if (ctx.measureText(fitText).width > maxTextWidth) {
        while (fitText.length > 3 && ctx.measureText(fitText + '…').width > maxTextWidth) {
          fitText = fitText.slice(0, -1);
        }
        fitText += '…';
      }

      ctx.fillText(fitText, radius - 20, 0);
      ctx.restore();
    }

    // Draw Gold Metallic Pegs around wheel edge
    for (let i = 0; i < numPlayers; i++) {
      const pegAngle = i * sliceAngle;
      const pegX = Math.cos(pegAngle) * (radius - 5);
      const pegY = Math.sin(pegAngle) * (radius - 5);

      // Gold Dot
      ctx.beginPath();
      ctx.arc(pegX, pegY, 4.5, 0, 2 * Math.PI);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#d97706';
      ctx.stroke();

      // Shiny center
      ctx.beginPath();
      ctx.arc(pegX - 1, pegY - 1, 1.5, 0, 2 * Math.PI);
      ctx.fillStyle = '#fbbf24';
      ctx.fill();
    }

    // Outer wheel border
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, 2 * Math.PI);
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#1e1b4b';
    ctx.stroke();

    ctx.restore();
  }, [displaySize, numPlayers, players, sliceAngle]);

  // Re-draw wheel disk on changes
  useEffect(() => {
    renderWheelDisk();
  }, [renderWheelDisk]);

  // Apply GPU Transform Rotation
  const setWheelRotation = (rad: number) => {
    rotationRef.current = rad;
    if (wheelDiskRef.current) {
      wheelDiskRef.current.style.transform = `rotate(${rad}rad)`;
    }
  };

  // Set initial position
  useEffect(() => {
    setWheelRotation(rotationRef.current);
  }, []);

  // 3. Ultra-Smooth GPU Physics Spin Animation
  const spinWheel = useCallback(
    (targetWinnerIndex?: number) => {
      // A ref is used in addition to React state: state updates are asynchronous,
      // so fast repeated taps must not be able to start two animations at once.
      if (spinningRef.current || numPlayers < 2) return;

      sound.playClick();
      spinningRef.current = true;
      setIsSpinning(true);
      setWinner(null);

      const winnerIndex =
        targetWinnerIndex !== undefined
          ? targetWinnerIndex
          : Math.floor(Math.random() * numPlayers);
      const chosenPlayer = players[winnerIndex];

      // Top pointer is at 12 o'clock (1.5 * PI or 270 degrees)
      const segmentCenter = winnerIndex * sliceAngle + sliceAngle / 2;
      const targetBase = (1.5 * Math.PI - segmentCenter) % (2 * Math.PI);

      // Slight random position within segment for authenticity
      const jitter = (Math.random() - 0.5) * (sliceAngle * 0.7);

      // 7 to 11 full turns for authentic Wheel of Names momentum
      const fullTurns = (7 + Math.floor(Math.random() * 4)) * 2 * Math.PI;

      // Keep the value small between rounds to avoid precision issues after many spins.
      const startRot = ((rotationRef.current % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
      setWheelRotation(startRot);
      const currentNormalized = ((startRot % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
      let delta = (targetBase - currentNormalized + 2 * Math.PI) % (2 * Math.PI);
      if (delta < Math.PI * 0.5) delta += 2 * Math.PI;

      const finalRot = startRot + fullTurns + delta + jitter;
      const totalDist = finalRot - startRot;

      const duration = 5000; // 5.0 seconds
      const startTime = performance.now();

      const animateFrame = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Quartic ease-out curve (100% fluid GPU deceleration curve)
        const easeOut = 1 - Math.pow(1 - progress, 4.2);
        const currentRot = startRot + totalDist * easeOut;

        setWheelRotation(currentRot);

        // Calculate segment currently passing top pointer (12 o'clock = 1.5 * PI)
        const pointerAngleOnWheel = (1.5 * Math.PI - currentRot) % (2 * Math.PI);
        const normalizedPointer = (pointerAngleOnWheel + 2 * Math.PI) % (2 * Math.PI);
        const currentSegment = Math.floor(normalizedPointer / sliceAngle) % numPlayers;

        // Play tick sound & trigger needle bounce on segment change
        if (currentSegment !== lastTickSegmentRef.current) {
          lastTickSegmentRef.current = currentSegment;

          // Sound pitch dynamically decreases as wheel slows down
          const speedFactor = 1 - progress;
          sound.playTick(0.85 + speedFactor * 0.6);

          // Needle deflection tilt animation
          if (pointerRef.current) {
            const tilt = Math.min(22, 10 + speedFactor * 16);
            pointerRef.current.style.transform = `rotate(-${tilt}deg)`;
            if (pointerTimerRef.current) clearTimeout(pointerTimerRef.current);
            pointerTimerRef.current = setTimeout(() => {
              if (pointerRef.current) pointerRef.current.style.transform = 'rotate(0deg)';
            }, 50);
          }
        }

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animateFrame);
        } else {
          spinningRef.current = false;
          setIsSpinning(false);
          setWinner(chosenPlayer);
          sound.playWinner();

          // Confetti explosion
          try {
            confetti({
              particleCount: 110,
              spread: 80,
              origin: { y: 0.55 },
              colors: [
                chosenPlayer.color || '#f43f5e',
                '#3b82f6',
                '#a855f7',
                '#10b981',
                '#f59e0b',
                '#ec4899',
              ],
            });
          } catch (e) {}

          if (winnerTimerRef.current) clearTimeout(winnerTimerRef.current);
          winnerTimerRef.current = setTimeout(() => {
            onSelectPlayer(chosenPlayer);
          }, 1000);
        }
      };

      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      animationRef.current = requestAnimationFrame(animateFrame);
    },
    [numPlayers, players, sliceAngle, onSelectPlayer, setIsSpinning]
  );

  // 4. Drag / Flick gesture handling
  const getAngleFromCenter = (clientX: number, clientY: number) => {
    if (!containerRef.current) return 0;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    return Math.atan2(clientY - centerY, clientX - centerX);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (spinningRef.current || numPlayers < 2) return;
    isDraggingRef.current = true;
    suppressClickRef.current = false;
    const angle = getAngleFromCenter(e.clientX, e.clientY);
    lastDragAngleRef.current = angle;
    dragVelocitiesRef.current = [{ angle, time: performance.now() }];
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const currentAngle = getAngleFromCenter(e.clientX, e.clientY);
    let delta = currentAngle - lastDragAngleRef.current;

    if (delta > Math.PI) delta -= 2 * Math.PI;
    if (delta < -Math.PI) delta += 2 * Math.PI;

    if (Math.abs(delta) > 0.02) suppressClickRef.current = true;

    setWheelRotation(rotationRef.current + delta);
    lastDragAngleRef.current = currentAngle;

    const now = performance.now();
    dragVelocitiesRef.current.push({ angle: currentAngle, time: now });
    if (dragVelocitiesRef.current.length > 5) dragVelocitiesRef.current.shift();
  };

  const handlePointerUp = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    const samples = dragVelocitiesRef.current;
    if (samples.length >= 2) {
      const last = samples[samples.length - 1];
      const first = samples[0];
      const dt = (last.time - first.time) / 1000;
      if (dt > 0.01) {
        let dAngle = last.angle - first.angle;
        if (dAngle > Math.PI) dAngle -= 2 * Math.PI;
        if (dAngle < -Math.PI) dAngle += 2 * Math.PI;
        const vel = Math.abs(dAngle / dt);
        if (vel > 1.2) {
          spinWheel();
        }
      }
    }
  };

  useEffect(() => {
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (winnerTimerRef.current) clearTimeout(winnerTimerRef.current);
      if (pointerTimerRef.current) clearTimeout(pointerTimerRef.current);
      spinningRef.current = false;
      setIsSpinning(false);
    };
  }, [setIsSpinning]);

  const handleWheelClick = () => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }
    spinWheel();
  };

  return (
    <div className="w-full flex flex-col items-center justify-center py-2 px-2 select-none">
      
      {/* Title / Status */}
      <div className="text-center mb-3">
        <h2 className="text-xl sm:text-2xl font-black text-white flex items-center justify-center gap-2 tracking-tight">
          <span>La Roue des Prénoms 🎡</span>
        </h2>
        <p className="text-xs sm:text-sm font-medium text-slate-300 mt-1">
          {isSpinning ? (
            <span className="text-amber-300 font-bold animate-pulse">
              La roue tourne à toute vitesse... ⚡
            </span>
          ) : winner ? (
            <span className="text-emerald-300 font-extrabold text-sm sm:text-base">
              🎉 C'est au tour de {winner.name} !
            </span>
          ) : (
            'Cliquez ou faites glisser la roue pour lancer le tirage !'
          )}
        </p>
      </div>

      {/* Main Wheel Container */}
      <div
        ref={containerRef}
        className="relative flex items-center justify-center my-2 w-full max-w-[420px]"
      >
        {/* Glow backdrop */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-purple-600/30 via-rose-500/30 to-amber-500/30 blur-2xl animate-pulse"></div>

        {/* TOP TICKER NEEDLE (12 O'Clock Pointer) */}
        <div
          ref={pointerRef}
          className="absolute -top-3 z-30 transition-transform duration-75 ease-out drop-shadow-[0_6px_10px_rgba(0,0,0,0.5)] origin-top pointer-events-none"
        >
          <svg width="42" height="48" viewBox="0 0 42 48" fill="none">
            <path
              d="M21 46 L6 10 C4 6 7 2 11 2 L31 2 C35 2 38 6 36 10 L21 46 Z"
              fill="#F43F5E"
              stroke="#FFFFFF"
              strokeWidth="3"
            />
            <circle cx="21" cy="14" r="5.5" fill="#FFFFFF" />
          </svg>
        </div>

        {/* ROTATING GPU WHEEL DISK */}
        <div
          onClick={handleWheelClick}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onPointerLeave={handlePointerUp}
          className={`relative z-10 rounded-full transition-transform touch-none cursor-pointer ${
            isSpinning ? 'cursor-not-allowed' : 'hover:scale-[1.015] active:scale-95'
          }`}
          style={{ width: displaySize, height: displaySize }}
        >
          {/* Wheel Canvas Container (Accelerated with will-change: transform) */}
          <div
            ref={wheelDiskRef}
            className="w-full h-full rounded-full overflow-hidden"
            style={{ willChange: 'transform' }}
          >
            <canvas
              ref={canvasRef}
              style={{ width: displaySize, height: displaySize }}
              className="drop-shadow-[0_15px_35px_rgba(0,0,0,0.6)]"
            />
          </div>

          {/* CENTER HUB BUTTON (FIXED COVER OVER ROTATING DISK) */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-slate-900 border-4 border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.4)] flex flex-col items-center justify-center text-center p-1 cursor-pointer pointer-events-none"
          >
            <span className="text-white font-black text-xs sm:text-sm tracking-tight leading-none">
              TOURNER
            </span>
            <span className="text-rose-400 font-extrabold text-[9px] sm:text-[10px] mt-0.5">
              LA ROUE 🎡
            </span>
          </div>

        </div>

      </div>

    </div>
  );
};
