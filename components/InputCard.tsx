
import React, { useState, useRef } from 'react';
import { InputMode } from '../types';

interface InputCardProps {
  inputMode: InputMode;
  setInputMode: (mode: InputMode) => void;
  inputText: string;
  setInputText: (text: string) => void;
  onFileSelect: (file: File) => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  isRecording: boolean;
  isGenerating: boolean;
  onGenerate: () => void;
  audioUrl: string | null;
}

const InputCard: React.FC<InputCardProps> = ({
  inputMode,
  setInputMode,
  inputText,
  setInputText,
  onFileSelect,
  onStartRecording,
  onStopRecording,
  isRecording,
  isGenerating,
  onGenerate,
  audioUrl
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div className="glass-card rounded-[2.5rem] overflow-hidden transition-all duration-500">
      <div className="flex bg-white/5 p-2 gap-2">
        {(['text', 'record', 'upload'] as InputMode[]).map((mode) => (
          <button
            key={mode}
            onClick={() => setInputMode(mode)}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest rounded-2xl transition-all ${
              inputMode === mode 
                ? 'bg-white text-black shadow-lg' 
                : 'text-white/40 hover:text-white hover:bg-white/5'
            }`}
          >
            {mode === 'record' ? 'Voice' : mode === 'upload' ? 'File' : 'Text'}
          </button>
        ))}
      </div>

      <div className="p-8 sm:p-10">
        {inputMode === 'text' && (
          <div className="space-y-4">
            <textarea
              className="w-full h-72 p-6 rounded-3xl bg-black/40 border border-white/10 focus:border-orange-500/50 outline-none transition-all resize-none text-white text-lg font-light leading-relaxed placeholder:text-white/20"
              placeholder="Paste meeting discussions or messy notes here..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
          </div>
        )}

        {inputMode === 'record' && (
          <div className="flex flex-col items-center justify-center space-y-10 py-12">
            <div className={`relative flex items-center justify-center`}>
               {isRecording && (
                <div className="absolute w-40 h-40 bg-orange-500/20 rounded-full animate-ping"></div>
               )}
               <button
                onClick={isRecording ? onStopRecording : onStartRecording}
                className={`z-10 w-28 h-28 rounded-full flex items-center justify-center transition-all shadow-2xl ${
                  isRecording 
                  ? 'bg-white text-black scale-110' 
                  : 'soft-horizon text-white hover:scale-105'
                }`}
              >
                {isRecording ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <rect x="6" y="6" width="12" height="12" rx="2" strokeWidth={2} fill="currentColor" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                )}
              </button>
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white tracking-tight">
                {isRecording ? 'Capturing Session...' : 'Start Voice Engine'}
              </h3>
              <p className="text-white/40 mt-3 text-sm tracking-wide uppercase font-bold">
                SECURE REAL-TIME TRANSCRIPTION
              </p>
            </div>
            {audioUrl && !isRecording && (
              <audio src={audioUrl} controls className="w-full max-w-md brightness-75 invert" />
            )}
          </div>
        )}

        {inputMode === 'upload' && (
          <div className="py-12">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-white/10 rounded-[2.5rem] p-16 flex flex-col items-center justify-center cursor-pointer hover:border-orange-500/30 hover:bg-white/5 transition-all group"
            >
              <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white/40 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <p className="text-white font-bold text-lg">Drop audio logs</p>
              <p className="text-white/30 text-xs mt-2 uppercase tracking-widest">Multi-format support enabled</p>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="audio/*"
              />
            </div>
            {audioUrl && (
              <div className="mt-8 flex flex-col items-center">
                <p className="text-xs text-orange-400 font-black uppercase tracking-widest mb-4">Payload Loaded</p>
                <audio src={audioUrl} controls className="w-full max-w-md brightness-75 invert" />
              </div>
            )}
          </div>
        )}

        <div className="mt-10 pt-8 border-t border-white/5 flex justify-center">
          <button
            disabled={isGenerating || (inputMode === 'text' && !inputText) || (inputMode !== 'text' && !audioUrl)}
            onClick={onGenerate}
            className={`w-full py-5 rounded-3xl font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center space-x-4 ${
              isGenerating 
                ? 'bg-white/10 text-white/40 cursor-not-allowed' 
                : 'glow-button text-black'
            }`}
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>Generate Intelligence</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InputCard;
