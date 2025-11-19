import React, { useEffect, useRef, useState } from 'react';
import { decode, decodeAudioData, createWavBlob } from '../utils/audioUtils';

interface AudioPlayerProps {
  base64Data: string | null;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ base64Data }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const startTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number>(0);

  useEffect(() => {
    // Cleanup on unmount or data change
    return () => {
      stopAudio();
    };
  }, [base64Data]);

  const stopAudio = () => {
    if (sourceRef.current) {
      try {
        sourceRef.current.stop();
      } catch (e) {
        // Ignore if already stopped
      }
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setIsPlaying(false);
    setProgress(0);
  };

  const playAudio = async () => {
    if (!base64Data) return;

    // Initialize AudioContext if needed (must be user triggered in some browsers)
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 24000
      });
    } else if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }

    // Stop any current playback
    stopAudio();

    try {
      const ctx = audioContextRef.current;
      const bytes = decode(base64Data);
      const buffer = await decodeAudioData(bytes, ctx, 24000, 1);
      
      setDuration(buffer.duration);

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination); // Connect to speakers
      
      source.onended = () => {
        setIsPlaying(false);
        setProgress(100);
        cancelAnimationFrame(animationFrameRef.current);
      };

      sourceRef.current = source;
      startTimeRef.current = ctx.currentTime;
      source.start();
      setIsPlaying(true);

      // Animation loop for progress
      const updateProgress = () => {
        if (!ctx || !startTimeRef.current) return;
        const elapsed = ctx.currentTime - startTimeRef.current;
        const p = Math.min((elapsed / buffer.duration) * 100, 100);
        setProgress(p);
        
        if (p < 100) {
          animationFrameRef.current = requestAnimationFrame(updateProgress);
        }
      };
      updateProgress();

    } catch (error) {
      console.error("Failed to play audio", error);
      setIsPlaying(false);
    }
  };

  const handleDownload = () => {
    if (!base64Data) return;

    try {
      const bytes = decode(base64Data);
      const wavBlob = createWavBlob(bytes, 24000);
      const url = URL.createObjectURL(wavBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `gemini-tts-${Date.now()}.wav`;
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to create download", error);
    }
  };

  if (!base64Data) return null;

  return (
    <div className="mt-8 bg-slate-800/80 border border-slate-700 rounded-xl p-6 backdrop-blur-sm">
      <div className="flex items-center gap-6">
        <button
          onClick={isPlaying ? stopAudio : playAudio}
          className={`
            flex items-center justify-center w-14 h-14 rounded-full 
            transition-all duration-300 shadow-lg flex-shrink-0
            ${isPlaying 
              ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/30' 
              : 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-indigo-500/30 pl-1'
            }
          `}
        >
          {isPlaying ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
            </svg>
          )}
        </button>

        <div className="flex-1">
          <div className="flex justify-between text-xs text-slate-400 mb-2 font-mono">
            <span>{isPlaying ? 'PLAYING' : 'READY'}</span>
            <span>{duration > 0 ? `${duration.toFixed(1)}s` : '--'}</span>
          </div>
          <div className="h-2 bg-slate-900 rounded-full overflow-hidden relative">
            <div 
              className="h-full bg-indigo-500 transition-all duration-100 ease-linear rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="hidden sm:flex space-x-1 h-8 items-end">
           {/* Fake visualizer bars */}
           {[...Array(5)].map((_, i) => (
             <div 
                key={i} 
                className={`w-1 bg-indigo-400 rounded-t-sm transition-all duration-150 ${isPlaying ? 'animate-bounce' : 'h-2 opacity-30'}`}
                style={{ 
                  height: isPlaying ? `${Math.random() * 100}%` : '20%',
                  animationDelay: `${i * 0.1}s`
                }}
             />
           ))}
        </div>

        <div className="border-l border-slate-700 pl-6 ml-2">
          <button
            onClick={handleDownload}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-colors border border-slate-600"
            title="Download WAV"
            aria-label="Download Audio"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M7.5 10.5l4.5 4.5m0 0l4.5-4.5m-4.5 4.5V3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;