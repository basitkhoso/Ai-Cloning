import React from 'react';
import { VOICE_OPTIONS, VoiceOption } from '../types';

interface VoiceSelectorProps {
  selectedVoice: string;
  onSelect: (voiceId: string) => void;
  disabled?: boolean;
}

const VoiceSelector: React.FC<VoiceSelectorProps> = ({ selectedVoice, onSelect, disabled }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {VOICE_OPTIONS.map((voice: VoiceOption) => (
        <button
          key={voice.id}
          onClick={() => onSelect(voice.id)}
          disabled={disabled}
          className={`
            relative p-4 rounded-xl border text-left transition-all duration-200
            ${
              selectedVoice === voice.id
                ? 'bg-indigo-600/20 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.3)]'
                : 'bg-slate-800/50 border-slate-700 hover:border-slate-600 hover:bg-slate-800'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`font-semibold ${selectedVoice === voice.id ? 'text-indigo-300' : 'text-slate-200'}`}>
              {voice.name}
            </span>
            <span className="text-xs px-2 py-1 rounded-full bg-slate-900 text-slate-400 border border-slate-700">
              {voice.gender}
            </span>
          </div>
          <p className="text-sm text-slate-400">
            {voice.description}
          </p>
          
          {selectedVoice === voice.id && (
            <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.8)] animate-pulse" />
          )}
        </button>
      ))}
    </div>
  );
};

export default VoiceSelector;