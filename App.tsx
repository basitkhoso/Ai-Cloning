import React, { useState, useRef } from 'react';
import { VOICE_OPTIONS } from './types';
import VoiceSelector from './components/VoiceSelector';
import AudioPlayer from './components/AudioPlayer';
import { generateSpeech, generateClonedSpeech } from './services/geminiService';
import { fileToBase64 } from './utils/audioUtils';

type AppMode = 'standard' | 'clone';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>('standard');
  const [text, setText] = useState<string>('Tum kese hou');
  const [selectedVoice, setSelectedVoice] = useState<string>(VOICE_OPTIONS[2].id); // Default to Kore
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [audioData, setAudioData] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Voice Clone State
  const [cloneFile, setCloneFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        setError("File size too large. Please upload an audio file under 5MB.");
        return;
      }
      setCloneFile(file);
      setError(null);
    }
  };

  const handleGenerate = async () => {
    if (!text.trim()) {
      setError("Please enter some text to generate speech.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setAudioData(null);

    try {
      let base64Data;
      
      if (mode === 'standard') {
        base64Data = await generateSpeech(text, selectedVoice);
      } else {
        if (!cloneFile) {
          throw new Error("Please upload an audio reference file for voice cloning.");
        }
        const audioBase64 = await fileToBase64(cloneFile);
        base64Data = await generateClonedSpeech(text, audioBase64, cloneFile.type);
      }
      
      setAudioData(base64Data);
    } catch (err: any) {
      setError(err.message || "Something went wrong while generating speech.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-lg sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
                <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 2.485.735 4.817 2.038 6.784.172.262.112.604-.14.798-.624.476-1.2.993-1.722 1.546-.46.488-.092 1.31.57 1.31h5.768a6.44 6.44 0 002.973-1.02L10.94 21.06c.944.945 2.56.276 2.56-1.06V4.06zM18.5 12a6.5 6.5 0 00-1.905-4.596l-1.061 1.061a5 5 0 010 7.07l1.06 1.061A6.5 6.5 0 0018.5 12zM20.5 12a8.5 8.5 0 00-2.49-6.01l-1.06 1.061a7 7 0 010 9.9l1.06 1.06A8.5 8.5 0 0020.5 12z" />
              </svg>
            </div>
            <h1 className="font-bold text-lg tracking-tight">Gemini <span className="text-indigo-400">TTS Studio</span></h1>
          </div>
          <a href="https://ai.google.dev/gemini-api/docs/speech" target="_blank" rel="noreferrer" className="text-xs font-medium text-slate-400 hover:text-indigo-400 transition-colors">
            Powered by Gemini 2.5
          </a>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        
        {/* Mode Switcher */}
        <div className="bg-slate-900/50 p-1 rounded-xl inline-flex border border-slate-800">
          <button
            onClick={() => setMode('standard')}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              mode === 'standard' 
                ? 'bg-indigo-600 text-white shadow-lg' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Standard Voices
          </button>
          <button
            onClick={() => setMode('clone')}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              mode === 'clone' 
                ? 'bg-purple-600 text-white shadow-lg' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Voice Cloning
          </button>
        </div>

        {/* Input Section */}
        <section className="space-y-6">
          <div>
            <label htmlFor="text-input" className="block text-sm font-medium text-slate-400 mb-2 uppercase tracking-wider">
              Text to Speech
            </label>
            <div className="relative">
              <textarea
                id="text-input"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter text to generate speech..."
                className="w-full h-32 bg-slate-900/50 border border-slate-700 rounded-xl p-4 text-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none placeholder-slate-600"
                disabled={isLoading}
              />
              <div className="absolute bottom-4 right-4 text-xs text-slate-500 font-mono">
                {text.length} chars
              </div>
            </div>
          </div>

          {mode === 'standard' ? (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
               <label className="block text-sm font-medium text-slate-400 mb-3 uppercase tracking-wider">
                Select Voice
              </label>
              <VoiceSelector 
                selectedVoice={selectedVoice} 
                onSelect={setSelectedVoice} 
                disabled={isLoading} 
              />
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <label className="block text-sm font-medium text-slate-400 mb-3 uppercase tracking-wider">
                Upload Reference Voice
              </label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`
                  border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200
                  flex flex-col items-center gap-3
                  ${cloneFile 
                    ? 'border-purple-500/50 bg-purple-500/5' 
                    : 'border-slate-700 hover:border-purple-500/50 hover:bg-slate-900'
                  }
                `}
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="audio/*"
                  className="hidden"
                />
                
                {cloneFile ? (
                  <>
                    <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-slate-200 font-medium">{cloneFile.name}</p>
                      <p className="text-slate-500 text-sm">{(cloneFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setCloneFile(null); }}
                      className="text-xs text-red-400 hover:text-red-300 underline mt-1"
                    >
                      Remove file
                    </button>
                  </>
                ) : (
                  <>
                     <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-slate-300 font-medium">Click to upload an audio sample</p>
                      <p className="text-slate-500 text-sm">MP3, WAV, or AAC (Max 5MB)</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3 rounded-lg flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mt-0.5 flex-shrink-0">
                <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isLoading || !text.trim() || (mode === 'clone' && !cloneFile)}
            className={`
              w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all duration-200
              flex items-center justify-center gap-3
              ${isLoading 
                ? 'bg-slate-800 text-slate-400 cursor-not-allowed' 
                : mode === 'standard'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-purple-500/25 hover:shadow-purple-500/40 hover:-translate-y-0.5'
              }
            `}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {mode === 'standard' ? 'Generating Audio...' : 'Cloning Voice...'}
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
                  <path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.751 6.751 0 01-6 6.709v2.291h3a.75.75 0 010 1.5h-7.5a.75.75 0 010-1.5h3v-2.291a6.751 6.751 0 01-6-6.709v-1.5A.75.75 0 016 10.5z" />
                </svg>
                {mode === 'standard' ? 'Generate Speech' : 'Clone & Generate'}
              </>
            )}
          </button>
        </section>

        {/* Output Section */}
        {audioData && (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-2 h-2 rounded-full ${mode === 'standard' ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]' : 'bg-purple-400 shadow-[0_0_10px_rgba(192,132,252,0.5)]'}`}></div>
              <h2 className={`text-sm font-medium ${mode === 'standard' ? 'text-emerald-400' : 'text-purple-400'} uppercase tracking-wider`}>
                {mode === 'standard' ? 'Result Generated' : 'Cloned Audio Generated'}
              </h2>
            </div>
            <AudioPlayer base64Data={audioData} />
          </section>
        )}

        <section className="pt-12 border-t border-slate-800">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">About Gemini TTS & Cloning</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="p-4 bg-slate-900/30 rounded-lg border border-slate-800/50">
               <div className="text-indigo-400 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                  </svg>
               </div>
               <h4 className="text-slate-200 font-medium mb-1">Fast & Responsive</h4>
               <p className="text-sm text-slate-500">Powered by the low-latency Gemini 2.5 Flash model.</p>
             </div>
             <div className="p-4 bg-slate-900/30 rounded-lg border border-slate-800/50">
               <div className="text-indigo-400 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                  </svg>
               </div>
               <h4 className="text-slate-200 font-medium mb-1">Standard & Custom</h4>
               <p className="text-sm text-slate-500">Choose from 5 pre-built voices or clone a style from audio.</p>
             </div>
             <div className="p-4 bg-slate-900/30 rounded-lg border border-slate-800/50">
               <div className="text-indigo-400 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                  </svg>
               </div>
               <h4 className="text-slate-200 font-medium mb-1">Mobile Ready</h4>
               <p className="text-sm text-slate-500">Fully responsive design for generating speech on the go.</p>
             </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default App;
