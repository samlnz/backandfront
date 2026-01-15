
import React from 'react';
import { cardGenerator } from '../services/cardGenerator';
import BingoCard from '../components/BingoCard';

interface NetworkUser {
  id: number;
  username: string;
}

interface SelectionPageProps {
  playerName: string;
  playerId: string;
  balance: number;
  selectedCards: number[];
  networkSelections: NetworkUser[];
  onToggleCard: (id: number) => void;
  onRandomAssign: () => void;
  onClearSelection: () => void;
  globalTime: number;
  roundEndTime: number;
  roundId: number;
}

const SelectionPage: React.FC<SelectionPageProps> = ({ 
  playerName, 
  playerId, 
  balance,
  selectedCards, 
  networkSelections,
  onToggleCard, 
  onRandomAssign, 
  onClearSelection, 
  globalTime, 
  roundEndTime, 
  roundId 
}) => {
  const timeLeft = Math.max(0, roundEndTime - globalTime);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden p-1.5 md:p-6">
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/20 via-blue-400/10 to-cyan-300/20 pointer-events-none"></div>
      
      <div className="max-w-[1900px] mx-auto space-y-2 md:space-y-4 relative z-10">
        {/* Responsive Header */}
        <div className="bg-black/60 backdrop-blur-xl rounded-xl md:rounded-2xl p-2.5 md:p-4 border border-white/10 flex flex-col lg:flex-row justify-between items-center gap-2.5 md:gap-4">
          <div className="flex items-center gap-3 md:gap-4 w-full lg:w-auto">
            <div className="w-9 h-9 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-cyan-500 flex items-center justify-center text-lg md:text-xl font-bold shadow-lg shadow-cyan-500/20">
              {playerName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-white text-sm md:text-lg font-bold font-['Orbitron'] leading-tight">{playerName}</h2>
              <p className="text-white/40 text-[8px] md:text-[10px] uppercase tracking-widest">ROUND #{roundId} • ID: {playerId}</p>
            </div>
          </div>

          <div className="flex flex-row items-center gap-2 md:gap-4 w-full lg:w-auto">
            {/* Closes In Block */}
            <div className={`flex-1 sm:flex-none px-4 md:px-8 py-1 md:py-2 rounded-lg md:rounded-xl border transition-all duration-300 ${timeLeft <= 10 ? 'border-red-500 bg-red-500/10 animate-pulse' : 'border-cyan-500/30 bg-white/5'}`}>
              <p className="text-[6px] md:text-[8px] uppercase tracking-[0.1em] text-white/40 text-center font-bold">CLOSES IN</p>
              <p className={`text-sm md:text-2xl font-bold font-['Orbitron'] text-center ${timeLeft <= 10 ? 'text-red-500' : 'text-cyan-400'}`}>
                {formatTime(timeLeft)}
              </p>
            </div>

            {/* Wallet Block */}
            <div className="flex-1 sm:flex-none bg-emerald-500/10 border border-emerald-500/30 px-4 md:px-8 py-1 md:py-2 rounded-lg md:rounded-xl flex flex-col items-center">
              <p className="text-[6px] md:text-[8px] uppercase tracking-[0.1em] text-emerald-400 font-bold">WALLET</p>
              <p className="text-sm md:text-2xl font-bold font-['Orbitron'] text-white">
                {balance.toLocaleString()} <span className="text-[8px] text-white/40">ETB</span>
              </p>
            </div>

            {/* Players Block */}
            <div className="flex-1 sm:flex-none bg-emerald-500/10 border border-emerald-500/30 px-4 md:px-8 py-1 md:py-2 rounded-lg md:rounded-xl flex flex-col items-center">
              <p className="text-[6px] md:text-[8px] uppercase tracking-[0.1em] text-emerald-400 font-bold">PLAYERS</p>
              <p className="text-sm md:text-2xl font-bold font-['Orbitron'] text-white">
                {networkSelections.length + selectedCards.length}
              </p>
            </div>
          </div>

          <div className="flex gap-2 w-full lg:w-auto">
            <div className="flex-1 lg:flex-none bg-white/5 px-4 md:px-6 py-1 md:py-2 rounded-lg md:rounded-xl border border-white/10 text-center flex flex-row lg:flex-col justify-center items-center gap-2">
              <p className="text-sm md:text-2xl font-bold text-orange-500 font-['Orbitron']">{selectedCards.length}/2</p>
              <p className="text-[6px] md:text-[8px] uppercase text-white/40 font-bold tracking-widest">SLOTS</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-2.5 md:gap-4">
          {/* Main Card Selection Pool */}
          <div className="lg:col-span-7 bg-white/5 backdrop-blur-md p-3 md:p-6 rounded-2xl md:rounded-[2.5rem] border border-white/10 flex flex-col shadow-2xl">
            <div className="flex flex-row justify-between items-center mb-3 md:mb-6 gap-2">
              <h2 className="text-[8px] md:text-[11px] font-['Orbitron'] font-bold text-white flex items-center gap-2 uppercase tracking-[0.1em] md:tracking-[0.3em]">
                <span className="w-1.5 h-3 bg-orange-500 rounded-full"></span>
                SELECT NODES
              </h2>
              <div className="text-[6px] md:text-[9px] text-cyan-400/60 uppercase font-bold tracking-widest bg-cyan-500/5 px-2 md:px-4 py-1 rounded-full border border-cyan-500/10">
                Tap to toggle
              </div>
            </div>
            
            <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 xl:grid-cols-10 gap-1.5 md:gap-2 overflow-y-auto max-h-[40vh] lg:max-h-[70vh] pr-1.5 custom-scrollbar">
              {Array.from({ length: 500 }).map((_, i) => {
                const num = i + 1;
                const isSelected = selectedCards.includes(num);
                const takenInfo = networkSelections.find(n => n.id === num);
                const isTaken = !!takenInfo;
                
                return (
                  <button
                    key={num}
                    onClick={() => !isTaken && onToggleCard(num)}
                    disabled={isTaken}
                    className={`
                      aspect-square flex flex-col items-center justify-center font-bold transition-all relative border rounded-lg md:rounded-xl overflow-hidden
                      ${isSelected 
                        ? 'bg-orange-500 border-white text-white shadow-md z-20 scale-105 text-sm md:text-2xl' 
                        : isTaken
                          ? 'bg-green-500/30 border-green-400 text-green-300 cursor-not-allowed text-xs md:text-xl'
                          : 'bg-black/40 border-white/10 text-white/40 hover:text-white hover:border-orange-500/50 text-sm md:text-2xl'}
                    `}
                  >
                    <span className={isTaken ? 'mb-0.5' : ''}>{num}</span>
                    {isTaken && (
                      <div className="absolute bottom-0 left-0 right-0 bg-green-500/40 py-0.5 border-t border-green-400/50">
                        <span className="text-[5px] md:text-[8px] font-black uppercase tracking-tighter text-white whitespace-nowrap px-0.5 block truncate">
                          {takenInfo.username.replace('@','')}
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-2.5 md:gap-4">
            {/* Verification Preview */}
            <div className="bg-black/40 backdrop-blur-md p-3 md:p-6 rounded-2xl md:rounded-[2.5rem] border border-white/5 flex-grow">
              <h2 className="text-[8px] md:text-xs font-['Orbitron'] font-bold text-white/60 mb-3 md:mb-6 uppercase tracking-widest flex justify-between items-center">
                <span>Preview</span>
                <span className="bg-orange-500/20 text-orange-400 px-3 py-0.5 rounded-full text-[8px] md:text-[10px]">{selectedCards.length}/2</span>
              </h2>
              <div className="grid grid-cols-2 gap-2 md:gap-4">
                {selectedCards.length === 0 ? (
                  <div className="col-span-full py-6 md:py-12 flex flex-col items-center justify-center text-white/10 border border-dashed border-white/5 rounded-2xl text-center p-4">
                    <i className="fas fa-eye text-xl md:text-3xl mb-2 opacity-10"></i>
                    <p className="text-[10px] md:text-sm font-medium">Waiting Selection</p>
                  </div>
                ) : (
                  selectedCards.map((num) => (
                    <div key={num} className="bg-black/40 p-0.5 rounded-lg md:rounded-2xl border border-orange-500/10">
                       <BingoCard card={cardGenerator.generateCard(num)} markedNumbers={new Set()} compact />
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Controls */}
            <div className="grid grid-cols-2 gap-2.5 md:gap-4">
              <button 
                onClick={onRandomAssign}
                className="py-3 md:py-5 rounded-xl md:rounded-2xl bg-orange-500/20 border border-orange-500/40 text-orange-400 font-bold hover:bg-orange-500/40 transition-all uppercase tracking-widest text-[9px] md:text-[11px] flex items-center justify-center gap-2 md:gap-3 shadow-lg"
              >
                <i className="fas fa-random text-xs md:text-base"></i> RANDOM
              </button>
              
              <button 
                onClick={onClearSelection}
                className="py-3 md:py-5 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 text-white/40 font-bold hover:text-white hover:bg-white/10 transition-all uppercase tracking-widest text-[9px] md:text-[11px]"
              >
                RESET
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectionPage;
