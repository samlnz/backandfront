
import React from 'react';

interface LobbyPageProps {
  onStart: () => void;
}

const LobbyPage: React.FC<LobbyPageProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050b1a] via-[#101827] to-[#1e1b4b] flex items-center justify-center p-3 md:p-4">
      <div className="max-w-4xl w-full bg-black/60 backdrop-blur-xl p-6 md:p-10 rounded-2xl md:rounded-3xl border border-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.1)] animate-fade-in text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-amber-500 via-white to-amber-500 animate-shimmer"></div>
        
        <div className="mb-4 md:mb-8">
          <div className="text-4xl md:text-7xl text-amber-400 mb-3 md:mb-6 animate-star inline-block">
            <i className="fas fa-star"></i>
          </div>
          <h1 className="text-3xl md:text-7xl font-['Orbitron'] font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-white to-amber-200 mb-1 md:mb-2 drop-shadow-lg tracking-tighter">
            STAR BINGO
          </h1>
          <p className="text-xs md:text-xl text-amber-100/70 tracking-[0.2em] md:tracking-widest uppercase font-light">Celestial Network Hub</p>
        </div>

        <div className="grid md:grid-cols-3 gap-3 md:gap-6 mb-6 md:mb-12">
          {[
            { icon: 'comet', title: 'Stellar Rounds', desc: 'Cycles open every 5m' },
            { icon: 'eye', title: 'Live Stream', desc: 'Watch any ongoing round' },
            { icon: 'user-astronaut', title: 'Verified', desc: 'Deterministic card sets' }
          ].map((item, i) => (
            <div key={i} className="bg-amber-500/5 p-3 md:p-6 rounded-xl md:rounded-2xl border border-amber-500/10 hover:border-amber-400 transition-all group">
              <i className={`fas fa-${item.icon} text-xl md:text-3xl text-amber-400 mb-2 md:mb-4 group-hover:scale-110 transition-transform`}></i>
              <h3 className="text-amber-300 text-xs md:text-base font-bold mb-1 font-['Orbitron']">{item.title}</h3>
              <p className="text-amber-100/50 text-[10px] md:text-sm leading-tight">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="mb-6 md:mb-12">
          <button 
            onClick={onStart}
            className="group relative inline-flex items-center gap-3 md:gap-4 px-10 md:px-16 py-4 md:py-6 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full text-xl md:text-3xl font-bold shadow-lg hover:scale-105 transition-all active:scale-95 text-white"
          >
            <i className="fas fa-rocket text-sm md:text-xl"></i>
            ገባ በሉ
            <div className="absolute -inset-1 rounded-full bg-amber-400/10 blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </button>
        </div>

        <div className="bg-black/40 rounded-xl md:rounded-2xl p-3 md:p-6 border-l-4 border-amber-500 text-left">
          <h2 className="text-amber-400 text-xs md:text-base font-bold mb-2 md:mb-4 flex items-center gap-2 md:gap-3 font-['Orbitron']">
            <i className="fas fa-satellite-dish"></i>
            STATUS
          </h2>
          <p className="text-amber-100/60 text-[10px] md:text-sm leading-relaxed mb-2 md:mb-4">
            A stellar cycle is concluding. Join now to enter the next celestial selection window.
          </p>
          <ul className="space-y-1.5 md:space-y-3 text-amber-100/50 text-[9px] md:text-xs">
            <li className="flex items-center gap-2"><span className="w-1 h-1 bg-amber-500 rounded-full"></span> Auto-transition every cycle.</li>
            <li className="flex items-center gap-2"><span className="w-1 h-1 bg-amber-500 rounded-full"></span> Live broadcast active.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LobbyPage;
