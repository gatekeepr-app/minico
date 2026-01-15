
import React from 'react';
import { MinutesResult } from '../types';

interface MinutesDisplayProps {
  result: MinutesResult;
  onExtraFeature: (feature: 'followup' | 'whatsapp' | 'actionItems' | 'attendance') => void;
  isLoadingExtra: boolean;
  isPreview?: boolean;
}

const MinutesDisplay: React.FC<MinutesDisplayProps> = ({ 
  result, 
  onExtraFeature,
  isLoadingExtra,
  isPreview = false
}) => {
  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result.content);
    alert('Minico intelligence copied to clipboard.');
  };

  const renderContent = (text: string) => {
    // Basic cleaning to remove any potential raw leading hashtags or double asterisks that weren't caught
    return text.split('\n').map((line, idx) => {
      let currentLine = line.trim();
      
      // Handle bolding **text** -> <strong>text</strong>
      const processedLine = currentLine.split(/(\*\*.*?\*\*)/).map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={pIdx} className="font-bold text-white">{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      // Headers (Remove actual hashtags from display)
      if (currentLine.startsWith('## ')) {
        return <h2 key={idx} className="text-xl font-black uppercase tracking-[0.2em] border-b border-white/10 pb-4 mt-12 mb-6 text-white serif-title">{currentLine.replace('## ', '')}</h2>;
      }
      if (currentLine.startsWith('### ')) {
        return <h3 key={idx} className="text-lg font-bold mt-8 mb-4 text-white soft-horizon px-4 py-1 rounded inline-block">{currentLine.replace('### ', '')}</h3>;
      }
      
      // Lists (Remove dots/stars if needed, but standard bullets are fine)
      if (currentLine.startsWith('* ') || currentLine.startsWith('- ')) {
        return <li key={idx} className="ml-6 mb-3 text-white/70 list-disc font-light">{processedLine.map(p => typeof p === 'string' ? p.replace(/^[*-\s]+/, '') : p)}</li>;
      }
      
      if (currentLine.match(/^\d+\. /)) {
        return <div key={idx} className="ml-6 mb-3 text-white font-medium">{processedLine}</div>;
      }

      if (currentLine === '') return <div key={idx} className="h-6" />;
      
      return <p key={idx} className="mb-4 text-white/80 leading-relaxed text-base font-light">{processedLine}</p>;
    });
  };

  return (
    <div className={`mt-20 space-y-12 ${isPreview ? 'opacity-70 animate-pulse scale-[0.98]' : 'animate-in fade-in slide-in-from-bottom-8 duration-700'} pb-20`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 no-print">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-white uppercase">
            {isPreview ? 'Synthesizing Intelligence...' : 'Intelligence Log'}
          </h2>
          <p className="text-white/40 text-xs font-bold tracking-widest mt-2 uppercase">
            {isPreview ? 'Processing secure buffer' : 'DRAFT STATUS: VERIFIED BY MINICO AI'}
          </p>
        </div>
        {!isPreview && (
          <div className="flex items-center space-x-3">
            <button 
              onClick={handleCopy}
              className="flex items-center space-x-2 px-6 py-3 text-white bg-white/5 border border-white/10 hover:bg-white/10 rounded-2xl transition-all"
            >
              <span className="text-xs font-bold uppercase tracking-widest">Copy</span>
            </button>
            <button 
              onClick={handlePrint}
              className="flex items-center space-x-2 px-6 py-3 glow-button text-black rounded-2xl transition-all font-black"
            >
              <span className="text-xs font-bold uppercase tracking-widest">Export PDF</span>
            </button>
          </div>
        )}
      </div>

      <div className="document-sheet p-10 sm:p-20 rounded-[3rem] relative shadow-2xl overflow-hidden">
        {/* Glow Header Artifact */}
        <div className="absolute top-0 right-0 w-full h-40 soft-horizon opacity-10 pointer-events-none rounded-t-[3rem]" style={{maskImage: 'linear-gradient(to bottom, black, transparent)', WebkitMaskImage: 'linear-gradient(to bottom, black, transparent)'}}></div>
        
        <div className="mb-16 text-center relative z-10">
           <div className="inline-block p-4 mb-6 rounded-2xl soft-horizon">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
           </div>
           <h1 className="text-4xl font-black text-white uppercase tracking-[0.1em]">Minico Intel</h1>
           <p className="text-[10px] text-white/30 uppercase tracking-[0.4em] mt-4 font-bold tracking-widest">Encrypted Institutional Record • {result.timestamp}</p>
        </div>

        <div className="prose prose-invert max-w-none relative z-10">
          {renderContent(result.content)}
        </div>

        {!isPreview && (
          <div className="mt-24 pt-12 border-t border-white/5 text-[10px] text-white/20 uppercase tracking-[0.5em] flex justify-between font-bold">
             <span>LOG ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
             <span>MINICO ELITE SECURE</span>
          </div>
        )}
      </div>

      {!isPreview && (
        <div className="glass-card rounded-[3rem] p-10 no-print">
          <h3 className="text-xl font-black mb-8 text-white uppercase tracking-widest flex items-center">
            <div className="w-2 h-2 rounded-full bg-orange-500 mr-3 animate-pulse"></div>
            Task Expansion
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {id: 'followup', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', label: 'Email', color: 'blue'},
              {id: 'whatsapp', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z', label: 'Brief', color: 'emerald'},
              {id: 'actionItems', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01', label: 'Actions', color: 'orange'},
              {id: 'attendance', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', label: 'Roster', color: 'purple'}
            ].map((item) => (
              <button 
                key={item.id}
                disabled={isLoadingExtra}
                onClick={() => onExtraFeature(item.id as any)}
                className="flex flex-col items-center p-6 bg-white/5 rounded-[2rem] hover:bg-white/10 transition-all border border-white/5 group disabled:opacity-50"
              >
                <div className={`w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white/60 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                </div>
                <span className="text-[10px] uppercase tracking-[0.2em] font-black text-white/50 group-hover:text-white">{item.label}</span>
              </button>
            ))}
          </div>
          
          {isLoadingExtra && (
            <div className="mt-8 flex items-center justify-center space-x-3 text-white/60 animate-pulse">
              <div className="w-4 h-4 rounded-full border-2 border-t-white border-white/10 animate-spin"></div>
              <span className="text-[10px] uppercase tracking-[0.3em] font-black">Synthesizing...</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MinutesDisplay;
