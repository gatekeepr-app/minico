
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from './components/Header';
import InputCard from './components/InputCard';
import MinutesDisplay from './components/MinutesDisplay';
import { AppState, InputMode, MinutesResult } from './types';
import { generateMinutesStream, generateExtraFeature } from './services/geminiService';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    inputMode: 'text',
    inputText: '',
    audioBlob: null,
    audioUrl: null,
    isGenerating: false,
    isRecording: false,
    result: null,
    error: null,
  });

  const [previewContent, setPreviewContent] = useState<string>('');
  const [isLoadingExtra, setIsLoadingExtra] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const setInputMode = (mode: InputMode) => {
    setState(prev => ({ 
      ...prev, 
      inputMode: mode, 
      error: null,
      audioBlob: null,
      audioUrl: null,
      result: null
    }));
    setPreviewContent('');
  };

  const setInputText = (text: string) => {
    setState(prev => ({ ...prev, inputText: text }));
  };

  const handleFileSelect = (file: File) => {
    const url = URL.createObjectURL(file);
    setState(prev => ({ 
      ...prev, 
      audioBlob: file, 
      audioUrl: url,
      error: null 
    }));
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setState(prev => ({ ...prev, audioBlob: blob, audioUrl: url, isRecording: false }));
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setState(prev => ({ ...prev, isRecording: true, error: null }));
    } catch (err) {
      console.error("Recording error:", err);
      setState(prev => ({ ...prev, error: "ACCESS DENIED: MICROPHONE UNAVAILABLE" }));
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && state.isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleGenerate = async () => {
    setState(prev => ({ ...prev, isGenerating: true, error: null, result: null }));
    setPreviewContent('');
    
    let fullText = '';
    try {
      let inputSource: any;
      if (state.inputMode === 'text') {
        inputSource = state.inputText;
      } else if (state.audioBlob) {
        const base64 = await blobToBase64(state.audioBlob);
        inputSource = {
          data: base64,
          mimeType: state.audioBlob.type || 'audio/webm'
        };
      } else {
        throw new Error("EMPTY_INPUT");
      }

      const stream = generateMinutesStream(inputSource);
      
      for await (const chunk of stream) {
        fullText += chunk;
        setPreviewContent(fullText);
      }

      setState(prev => ({
        ...prev,
        isGenerating: false,
        result: {
          content: fullText,
          timestamp: new Date().toLocaleString(),
          type: 'standard'
        }
      }));
    } catch (err: any) {
      setState(prev => ({ ...prev, isGenerating: false, error: err.message || "SYSTEM_FAILURE: PROCESSING_INTERRUPTED" }));
    }
  };

  const handleExtraFeature = async (feature: 'followup' | 'whatsapp' | 'actionItems' | 'attendance') => {
    if (!state.result) return;
    setIsLoadingExtra(true);
    try {
      const content = await generateExtraFeature(state.result.content, feature);
      setState(prev => ({
        ...prev,
        result: {
          content: content,
          timestamp: new Date().toLocaleString(),
          type: feature
        }
      }));
    } catch (err: any) {
      setState(prev => ({ ...prev, error: "EXTENSION_ERROR" }));
    } finally {
      setIsLoadingExtra(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen text-white pb-32">
      <div className="max-w-4xl mx-auto px-6">
        <div className="no-print">
          <Header />
        </div>
        
        {state.error && (
          <div className="mb-10 p-5 bg-red-500/10 border border-red-500/30 text-red-400 rounded-3xl flex items-center space-x-4 no-print animate-pulse">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="font-black text-xs uppercase tracking-widest">{state.error}</p>
          </div>
        )}

        <div className="no-print">
          {!state.isGenerating && !state.result && (
            <InputCard 
              inputMode={state.inputMode}
              setInputMode={setInputMode}
              inputText={state.inputText}
              setInputText={setInputText}
              onFileSelect={handleFileSelect}
              onStartRecording={startRecording}
              onStopRecording={stopRecording}
              isRecording={state.isRecording}
              isGenerating={state.isGenerating}
              onGenerate={handleGenerate}
              audioUrl={state.audioUrl}
            />
          )}
        </div>

        {(state.isGenerating || previewContent) && !state.result && (
          <MinutesDisplay 
            result={{
              content: previewContent || '...',
              timestamp: 'INITIALIZING BUFFER',
              type: 'standard'
            }} 
            onExtraFeature={() => {}}
            isLoadingExtra={false}
            isPreview={true}
          />
        )}

        {state.result && (
          <>
            <div className="no-print mb-8">
              <button 
                onClick={() => setInputMode('text')}
                className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 hover:text-white transition-all flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                New Session
              </button>
            </div>
            <MinutesDisplay 
              result={state.result} 
              onExtraFeature={handleExtraFeature}
              isLoadingExtra={isLoadingExtra}
            />
          </>
        )}
      </div>
      
      <footer className="mt-32 text-center text-white/10 text-[10px] no-print uppercase tracking-[0.6em] font-black">
        <p>&copy; {new Date().getFullYear()} MINICO ELITE • SYNTHESIZED BY GEMINI 3</p>
      </footer>
    </div>
  );
};

export default App;
