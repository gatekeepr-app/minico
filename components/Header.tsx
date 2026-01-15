
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="mb-12 text-center pt-8">
      <div className="inline-flex items-center justify-center w-14 h-14 mb-6 soft-horizon rounded-2xl shadow-xl">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
      <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl uppercase">Minico</h1>
      <p className="mt-4 text-slate-400 max-w-lg mx-auto font-medium text-sm tracking-wide">
        ELITE MEETING INTELLIGENCE FOR INSTITUTIONS
      </p>
    </header>
  );
};

export default Header;
