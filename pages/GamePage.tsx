
import React, { useState, useEffect, useMemo } from 'react';
import { PlayerWinData } from '../types';
import { cardGenerator } from '../services/cardGenerator';
import BingoCard from '../components/BingoCard';

interface GamePageProps {
  selectedCards: number[];
  playerName: string;
  playerId: string;
  balance: number;
  onWin: (data: PlayerWinData) => void;
  globalTime: number;
  roundStartTime: number;
  roundId: number;
  activeParticipantCount: number;
  serverCalledNumbers?: number[];
}

const COLUMN_CONFIG = {
  'B': { color: 'text-cyan-400', bg: 'bg-cyan-600' },
  'I': { color: 'text-purple-400', bg: 'bg-purple-600' },
  'N': { color: 'text-rose-400', bg: 'bg-rose-600' },
  'G': { color: 'text-emerald-400', bg: 'bg-emerald-500' },
  'O': { color: 'text-amber-400', bg: 'bg-amber-600' }
};

const GamePage: React.FC<GamePageProps> = ({ 
  selectedCards, playerName, balance, roundId, activeParticipantCount, serverCalledNumbers = [] 
}) => {
  const isSpectator = selectedCards.length === 0;
  const prizePool = Math.floor(activeParticipantCount * 10 * 0.80);
  
  const [marked, setMarked] = useState<{ [key: number]: Set<number> }>({});
  
  const currentNumber = serverCalledNumbers.length > 0 ? serverCalledNumbers[serverCalledNumbers.length - 1] : null;
  const recentNumbers = useMemo(() => [...serverCalledNumbers].reverse().slice(0, 6), [serverCalledNumbers]);

  useEffect(() => {
    if (serverCalledNumbers.length > 0) {
      const latest = serverCalledNumbers[serverCalledNumbers.length - 1];
      selectedCards.forEach(cid => {
        const cardNumbers = cardGenerator.generateCard(cid).numbers;
        if (cardNumbers.includes(latest)) {
          setMarked(prev => {
            const nextSet = new Set(prev[cid] || []);
            nextSet.add(latest);
            return { ...prev, [cid]: nextSet };
          });
        }
      });
    }
  }, [serverCalledNumbers, selectedCards]);

  const getLetter = (n: number) => {
    if (n <= 15) return 'B';
    if (n <= 30) return 'I';
    if (n <= 45) return 'N';
    if (n <= 60) return 'G';
    return 'O';
  };

  return (
    <div className="min-h-screen bg-[#050b1a] p-2 md:p-8 font-['Rajdhani'] flex flex-col gap-4">
      <div className="max-w-[1900px] mx-auto w-full flex flex-col gap-4">
        
        <div className="bg-[#0f172a]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-3 md:p-6 flex flex-row justify-between items-center gap-4 shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl bg-cyan-500 flex items-center justify-center text-xl md:text-2xl font-bold shadow-lg text-white">
              {playerName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-sm md:text-3xl font-bold font-['Orbitron'] text-white">#{roundId}</h2>
              <p className="text-[6px] md:text-[9px] text-white/40 uppercase tracking-widest font-bold">LIVE HUB SYNC</p>
            </div>
          </div>
          
          <div className="flex gap-2 items-center">
            <div className="bg-white/5 px-4 py-1 rounded-lg border border-white/10 text-center">
              <p className="text-[5px] md:text-[8px] text-white/30 uppercase font-bold tracking-[0.1em]">WALLET</p>
              <p className="text-sm md:text-xl font-bold text-white font-['Orbitron']">{balance.toLocaleString()}</p>
            </div>
            <div className="bg-emerald-500/10 px-4 py-1 rounded-lg border border-emerald-500/20 text-center">
              <p className="text-[5px] md:text-[8px] text-emerald-400/60 uppercase font-bold tracking-[0.1em]">POOL</p>
              <p className="text-sm md:text-xl font-bold text-emerald-400 font-['Orbitron']">{prizePool.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 lg:col-span-4 bg-[#0f172a]/60 border border-white/10 rounded-2xl p-4 md:p-8 shadow-2xl backdrop-blur-3xl">
            <h3 className="text-[8px] md:text-[10px] font-bold text-cyan-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse"></span> STELLAR LEDGER
            </h3>
            <div className="grid grid-cols-5 gap-1 md:gap-3">
              {(['B', 'I', 'N', 'G', 'O'] as const).map(letter => (
                <div key={letter} className="flex flex-col gap-1 md:gap-3">
                  <div className={`text-center font-bold text-[10px] md:text-2xl py-2 md:py-4 rounded-xl ${COLUMN_CONFIG[letter].bg} text-white font-['Orbitron']`}>{letter}</div>
                  {Array.from({ length: 15 }).map((_, i) => {
                    const n = (letter === 'B' ? 1 : letter === 'I' ? 16 : letter === 'N' ? 31 : letter === 'G' ? 46 : 61) + i;
                    const isCalled = serverCalledNumbers.includes(n);
                    return (
                      <div key={n} className={`aspect-square flex items-center justify-center rounded-md md:rounded-xl text-[8px] md:text-lg font-bold border transition-colors ${isCalled ? 'bg-orange-500 text-white border-orange-400' : 'bg-white/5 text-white/10 border-white/5'}`}>{n}</div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          <div className="col-span-12 lg:col-span-8 flex flex-col gap-4">
            <div className="bg-[#0f172a]/90 border border-cyan-500/30 rounded-2xl p-4 md:p-6 shadow-2xl flex flex-row items-center gap-4">
              <div className="w-24 h-24 md:w-48 md:h-48 rounded-2xl bg-black border border-emerald-500 flex flex-col items-center justify-center relative shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                <span className="text-2xl md:text-8xl font-bold font-['Orbitron'] text-white">{currentNumber || '--'}</span>
                {currentNumber && <div className={`absolute -bottom-1 px-4 py-1 rounded-full font-bold text-[8px] md:text-sm text-white ${COLUMN_CONFIG[getLetter(currentNumber) as keyof typeof COLUMN_CONFIG].bg}`}>{getLetter(currentNumber)}</div>}
              </div>
              <div className="flex-grow space-y-4">
                <p className="text-[6px] md:text-[9px] text-white/30 uppercase font-bold tracking-widest">RECENT BALLS</p>
                <div className="grid grid-cols-5 gap-2">
                  {recentNumbers.slice(1, 6).map((num, idx) => {
                    const letter = getLetter(num) as keyof typeof COLUMN_CONFIG;
                    return (
                      <div key={idx} className="bg-white/5 border border-white/5 p-2 rounded-xl flex flex-col items-center">
                        <span className={`text-[6px] md:text-[8px] font-bold ${COLUMN_CONFIG[letter].color}`}>{letter}</span>
                        <span className="text-xs md:text-xl font-bold text-white">{num}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 overflow-y-auto max-h-[60vh] pr-2 custom-scrollbar">
              {isSpectator ? (
                <div className="flex flex-col items-center justify-center py-10 border border-dashed border-white/10 rounded-2xl text-center gap-4">
                   <p className="text-sm md:text-xl text-white/20 uppercase font-bold tracking-[0.2em]">Observing Global Broadcast</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {selectedCards.map(cid => (
                    <BingoCard 
                      key={cid} 
                      card={cardGenerator.generateCard(cid)} 
                      markedNumbers={marked[cid] || new Set()} 
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamePage;
