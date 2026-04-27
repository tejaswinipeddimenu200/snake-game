/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, SkipForward, SkipBack, Volume2, Trophy, RotateCcw, Monitor } from 'lucide-react';

const GRID_SIZE = 20;
const INITIAL_SPEED = 150;
const SPEED_INCREMENT = 2;

type Point = { x: number; y: number };
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

const TRACKS = [
  { id: 1, title: "Neon Skyline", artist: "SynthWave AI", duration: "3:42", cover: "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?w=400&h=400&fit=crop" },
  { id: 2, title: "Cyber Cruise", artist: "Digital Architect", duration: "4:15", cover: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=400&h=400&fit=crop" },
  { id: 3, title: "Data Stream", artist: "Binary Pulse", duration: "2:58", cover: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=400&fit=crop" },
];

export default function App() {
  // --- Game State ---
  const [snake, setSnake] = useState<Point[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Point>({ x: 15, y: 15 });
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isPaused, setIsPaused] = useState(true);
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const directionRef = useRef<Direction>('RIGHT');

  // --- Music State ---
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const currentTrack = TRACKS[currentTrackIndex];

  // --- Game Logic ---
  const generateFood = useCallback((currentSnake: Point[]) => {
    let newFood;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      const isOnSnake = currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
      if (!isOnSnake) break;
    }
    return newFood;
  }, []);

  const moveSnake = useCallback(() => {
    if (isGameOver || isPaused) return;

    setSnake((prevSnake) => {
      const head = prevSnake[0];
      const newHead = { ...head };

      switch (directionRef.current) {
        case 'UP': newHead.y -= 1; break;
        case 'DOWN': newHead.y += 1; break;
        case 'LEFT': newHead.x -= 1; break;
        case 'RIGHT': newHead.x += 1; break;
      }

      // Wall collision
      if (
        newHead.x < 0 || newHead.x >= GRID_SIZE ||
        newHead.y < 0 || newHead.y >= GRID_SIZE
      ) {
        setIsGameOver(true);
        return prevSnake;
      }

      // Self collision
      if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
        setIsGameOver(true);
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      // Food collision
      if (newHead.x === food.x && newHead.y === food.y) {
        setScore(s => s + 10);
        setSpeed(prev => Math.max(80, prev - SPEED_INCREMENT));
        setFood(generateFood(newSnake));
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [food, generateFood, isGameOver, isPaused]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp': if (direction !== 'DOWN') setDirection('UP'); break;
        case 'ArrowDown': if (direction !== 'UP') setDirection('DOWN'); break;
        case 'ArrowLeft': if (direction !== 'RIGHT') setDirection('LEFT'); break;
        case 'ArrowRight': if (direction !== 'LEFT') setDirection('RIGHT'); break;
        case ' ': setIsPaused(p => !p); break;
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [direction]);

  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  useEffect(() => {
    const interval = setInterval(moveSnake, speed);
    return () => clearInterval(interval);
  }, [moveSnake, speed]);

  useEffect(() => {
    if (score > highScore) setHighScore(score);
  }, [score, highScore]);

  const resetGame = () => {
    setSnake([{ x: 10, y: 10 }]);
    setFood({ x: 15, y: 15 });
    setDirection('RIGHT');
    directionRef.current = 'RIGHT';
    setIsGameOver(false);
    setScore(0);
    setSpeed(INITIAL_SPEED);
    setIsPaused(false);
  };

  // --- Music Logic ---
  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setProgress(p => (p >= 100 ? 0 : p + 0.5));
      }, 200);
      return () => clearInterval(interval);
    }
  }, [isPlaying]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  const nextTrack = () => {
    setCurrentTrackIndex((i) => (i + 1) % TRACKS.length);
    setProgress(0);
  };
  const prevTrack = () => {
    setCurrentTrackIndex((i) => (i - 1 + TRACKS.length) % TRACKS.length);
    setProgress(0);
  };

  return (
    <div className="h-screen bg-[#050505] text-[#E0E0E0] font-sans flex flex-col overflow-hidden">
      {/* Navigation Bar */}
      <nav className="h-16 border-b border-[#333] flex items-center justify-between px-8 bg-[#0A0A0B] z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#00FF9C] rounded shadow-[0_0_15px_rgba(0,255,156,0.6)]"></div>
          <span className="text-xl font-bold tracking-widest text-[#00FF9C]">NEON<span className="text-white">BEAT</span></span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-xs uppercase tracking-[0.2em] font-semibold text-gray-500">
          <span>Game Mode: Classic</span>
          <span>Audio: High Fidelity</span>
          <span>User: Player_One</span>
        </div>
      </nav>

      <main className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Playlist */}
        <aside className="w-72 border-r border-[#222] bg-[#0A0A0B] flex flex-col p-6 hidden lg:flex">
          <h2 className="text-[10px] uppercase tracking-[0.3em] text-[#FF2E63] font-bold mb-6">Playlist / Tracklist</h2>
          <div className="space-y-4">
            {TRACKS.map((track, idx) => (
              <div 
                key={track.id}
                onClick={() => {
                  setCurrentTrackIndex(idx);
                  setProgress(0);
                }}
                className={`p-3 border rounded-lg transition-all cursor-pointer ${
                  currentTrackIndex === idx 
                    ? 'border-[#00FF9C] bg-[rgba(0,255,156,0.05)]' 
                    : 'border-transparent hover:border-[#333]'
                }`}
              >
                <div className={`text-sm font-medium ${currentTrackIndex === idx ? 'text-[#00FF9C]' : 'text-white/80'}`}>
                  {track.id.toString().padStart(2, '0')}. {track.title}
                </div>
                <div className="text-[10px] text-gray-500 mt-1">{track.artist} • {track.duration}</div>
              </div>
            ))}
          </div>
          
          <div className="mt-auto p-4 bg-[#111] rounded-xl border border-[#222]">
            <div className="flex justify-between text-[10px] mb-2 font-mono">
              <span className="text-gray-500 uppercase">Input Stream</span>
              <span className="text-[#00FF9C]">Active</span>
            </div>
            <div className="flex items-end gap-1 h-12">
              {[20, 60, 90, 40, 70, 30, 85].map((h, i) => (
                <motion.div 
                  key={i}
                  animate={{ height: isPlaying ? `${h}%` : '10%' }}
                  transition={{ duration: 0.3, repeat: isPlaying ? Infinity : 0, repeatType: 'reverse', delay: i * 0.1 }}
                  className={`flex-1 bg-[#00FF9C] shadow-[0_0_10px_#00FF9C] ${i > 3 ? 'opacity-40' : 'opacity-80'}`}
                />
              ))}
            </div>
          </div>
        </aside>

        {/* Center Section: Game Stage */}
        <section className="flex-1 flex flex-col items-center justify-center bg-black relative">
          <div className="absolute inset-0 opacity-10 bg-grid-dots" />
          
          <div className="relative w-full max-w-[500px] aspect-square bg-[#050505] border-2 border-[#333] shadow-[0_0_50px_rgba(0,0,0,1)] z-10 overflow-hidden">
            {/* CRT Effect */}
            <div className="absolute inset-0 pointer-events-none z-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_2px,3px_100%]" />

            <div 
              className="w-full h-full grid"
              style={{ 
                gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
                gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)` 
              }}
            >
              {/* Food */}
              <motion.div 
                animate={{ scale: [0.8, 1.1, 0.8] }}
                transition={{ repeat: Infinity, duration: 0.6 }}
                className="absolute bg-[#FF2E63] shadow-[0_0_15px_#FF2E63] rounded-sm m-1"
                style={{
                  width: `${100 / GRID_SIZE}%`,
                  height: `${100 / GRID_SIZE}%`,
                  left: `${(food.x * 100) / GRID_SIZE}%`,
                  top: `${(food.y * 100) / GRID_SIZE}%`,
                }}
              />

              {/* Snake */}
              {snake.map((segment, i) => (
                <div 
                  key={i}
                  className="absolute bg-[#00FF9C] rounded-sm m-0.5"
                  style={{
                    width: `${100 / GRID_SIZE}%`,
                    height: `${100 / GRID_SIZE}%`,
                    left: `${(segment.x * 100) / GRID_SIZE}%`,
                    top: `${(segment.y * 100) / GRID_SIZE}%`,
                    opacity: 1 - (i * 0.04),
                    boxShadow: i === 0 ? '0 0 10px #00FF9C' : 'none'
                  }}
                />
              ))}

              {/* Overlays */}
              <AnimatePresence>
                {(isGameOver || isPaused) && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/80 backdrop-blur-md z-30 flex flex-col items-center justify-center p-8 text-center"
                  >
                    {isGameOver ? (
                      <div>
                        <h2 className="text-6xl font-black text-[#FF2E63] italic tracking-tighter mb-2">SYSTEM FAILURE</h2>
                        <p className="text-gray-500 font-mono text-[10px] uppercase tracking-widest mb-8">Data Stream Compromised</p>
                        <button 
                          onClick={resetGame}
                          className="px-8 py-3 bg-[#FF2E63] text-white font-bold uppercase tracking-[0.2em] text-xs hover:bg-white hover:text-black transition-all"
                        >
                          Re-Initialize
                        </button>
                      </div>
                    ) : (
                      <div>
                        <div className="w-16 h-16 border-2 border-[#00FF9C] rounded flex items-center justify-center mb-6 animate-pulse mx-auto">
                          <div className="w-8 h-8 bg-[#00FF9C]/20 rounded-sm" />
                        </div>
                        <h2 className="text-4xl font-black text-white italic tracking-tighter mb-4">SUSPENDED</h2>
                        <button 
                          onClick={() => setIsPaused(false)}
                          className="px-8 py-3 border border-[#00FF9C] text-[#00FF9C] font-bold uppercase tracking-[0.2em] text-xs hover:bg-[#00FF9C] hover:text-black transition-all"
                        >
                          Resume Stream
                        </button>
                        <p className="mt-8 text-[10px] text-gray-500 font-mono">[SPACE] to toggle focus</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* Right Sidebar: Stats & Controls */}
        <aside className="w-72 border-l border-[#222] bg-[#0A0A0B] flex flex-col p-8 hidden xl:flex">
          <div className="mb-12">
            <h3 className="text-[10px] uppercase tracking-[0.3em] text-gray-500 font-bold mb-2">Session Score</h3>
            <div className="text-6xl font-black text-white italic tracking-tighter">{score}</div>
            <div className="text-[10px] text-[#00FF9C] font-bold mt-2 uppercase tracking-wider">
              {score >= highScore && score > 0 ? 'High Score Achieved' : `Best: ${highScore}`}
            </div>
          </div>

          <div className="space-y-8">
            <div className="border-t border-[#222] pt-6">
              <div className="flex justify-between items-end">
                <span className="text-[10px] uppercase text-gray-500 tracking-widest font-bold">Velocity</span>
                <span className="text-2xl font-bold font-mono">{(INITIAL_SPEED / speed).toFixed(1)}x</span>
              </div>
              <div className="w-full h-1 bg-[#1A1A1D] mt-3 rounded-full overflow-hidden">
                <motion.div 
                  animate={{ width: `${Math.min(100, (INITIAL_SPEED / speed) * 40)}%` }}
                  className="h-full bg-[#FF2E63] shadow-[0_0_10px_#FF2E63]" 
                />
              </div>
            </div>

            <div>
              <h3 className="text-[10px] uppercase tracking-[0.3em] text-gray-500 font-bold mb-4">Command Input</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#111] p-3 rounded text-center border border-[#222]">
                  <span className="text-[10px] block text-gray-500 mb-1 uppercase">Direction</span>
                  <span className="text-xs font-bold font-mono">ARROWS</span>
                </div>
                <div className="bg-[#111] p-3 rounded text-center border border-[#222]">
                  <span className="text-[10px] block text-gray-500 mb-1 uppercase">Pause</span>
                  <span className="text-xs font-bold font-mono">SPACE</span>
                </div>
              </div>
            </div>

            <div className="bg-[#111]/50 border border-white/5 rounded-xl p-4 mt-auto">
              <p className="text-[9px] text-[#00FF9C]/60 uppercase tracking-widest leading-relaxed">
                Notice: System monitoring active. Performance metrics synchronized with regional synth nodes.
              </p>
            </div>
          </div>
        </aside>
      </main>

      {/* Footer: Media Controls */}
      <footer className="h-24 bg-[#0A0A0B] border-t border-[#333] px-8 flex items-center justify-between z-20">
        <div className="flex items-center gap-4 w-72">
          <div className="w-12 h-12 bg-[#111] border border-[#222] flex items-center justify-center rounded overflow-hidden">
             <motion.img 
              key={currentTrack.cover}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              src={currentTrack.cover} 
              className="w-full h-full object-cover opacity-60"
            />
          </div>
          <div className="hidden md:block">
            <div className="text-sm font-bold truncate max-w-[150px] uppercase tracking-tighter">{currentTrack.title}</div>
            <div className="text-[10px] text-[#00FF9C] uppercase tracking-wider font-bold">Now Playing</div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3 flex-1 max-w-xl mx-auto">
          <div className="flex items-center gap-8">
            <button 
              onClick={prevTrack}
              className="text-gray-500 hover:text-white transition-colors"
            >
              <SkipBack className="w-5 h-5 fill-current" />
            </button>
            <button 
              onClick={togglePlay}
              className="w-10 h-10 rounded-full border border-[#00FF9C] flex items-center justify-center text-[#00FF9C] bg-[rgba(0,255,156,0.1)] hover:bg-[#00FF9C] hover:text-black transition-all"
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
            </button>
            <button 
              onClick={nextTrack}
              className="text-gray-500 hover:text-white transition-colors"
            >
              <SkipForward className="w-5 h-5 fill-current" />
            </button>
          </div>
          
          <div className="w-full flex items-center gap-4">
            <span className="text-[10px] font-mono text-gray-500">0:00</span>
            <div className="flex-1 h-1 bg-[#1A1A1D] rounded-full overflow-hidden">
              <motion.div 
                animate={{ width: `${progress}%` }}
                className="h-full bg-[#00FF9C] shadow-[0_0_5px_#00FF9C]" 
              />
            </div>
            <span className="text-[10px] font-mono text-gray-500">{currentTrack.duration}</span>
          </div>
        </div>

        <div className="w-72 hidden md:flex justify-end gap-6 items-center">
          <div className="flex items-center gap-3">
            <Volume2 className="w-4 h-4 text-gray-500" />
            <div className="w-24 h-1 bg-[#1A1A1D] rounded-full overflow-hidden">
              <div className="w-3/4 h-full bg-[#00FF9C]/60"></div>
            </div>
          </div>
          <div className="text-gray-500 hover:text-white cursor-pointer px-2">
            <div className="w-1.5 h-1.5 bg-gray-500 rounded-full mb-0.5" />
            <div className="w-1.5 h-1.5 bg-gray-500 rounded-full mb-0.5" />
            <div className="w-1.5 h-1.5 bg-gray-500 rounded-full" />
          </div>
        </div>
      </footer>
    </div>
  );
}
