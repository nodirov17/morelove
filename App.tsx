
import React from 'react';
import { HeartCanvas } from './HeartCanvas.tsx';

const App: React.FC = () => {
  return (
    <div className="relative w-full h-screen bg-black flex flex-col items-center justify-center overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-10 left-10 opacity-20 pointer-events-none">
        <h1 className="text-red-500 text-2xl font-thin tracking-widest uppercase">Ethereal Core</h1>
      </div>
      
      {/* Main Animation Component */}
      <HeartCanvas />

      {/* Footer Info */}
      <div className="absolute bottom-10 text-center pointer-events-none">
        <p className="text-zinc-500 text-xs tracking-[0.3em] uppercase">Faqat sen mening qalbimda qolasan!</p>
      </div>

      {/* Interaction Hint */}
      <div className="absolute bottom-20 opacity-40 animate-pulse text-zinc-400 text-[10px] uppercase tracking-tighter">
        FAQAT SEN...)
      </div>
    </div>
  );
};

export default App;
