
import React from 'react';
import { Card } from '../types';

interface BingoCardProps {
  card: Card;
  markedNumbers: Set<number>;
  winningCells?: number[];
  onToggleMark?: (num: number) => void;
  compact?: boolean;
}

const BingoCard: React.FC<BingoCardProps> = ({ card, markedNumbers, winningCells = [], onToggleMark, compact = false }) => {
  const colConfigs = [
    { label: 'B', text: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { label: 'I', text: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'N', text: 'text-rose-400', bg: 'bg-rose-500/10' },
    { label: 'G', text: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'O', text: 'text-amber-400', bg: 'bg-amber-500/10' },
  ];

  return (
    <div className={`bg-[#0f172a]/95 rounded-xl md:rounded-[2.5rem] border border-white/10 ${compact ? 'p-1' : 'p-2 md:p-6'} transition-all hover:border-cyan-500/40 shadow-xl w-full max-w-full overflow-hidden`}>
      <div className={`flex justify-between items-center ${compact ? 'mb-1 pb-0.5' : 'mb-2 md:mb-6 pb-2 md:pb-4'} border-b border-white/5`}>
        <h3 className="text-white font-bold flex items-center gap-1 md:gap-3 font-['Orbitron'] text-[6px] md:text-sm tracking-tight md:tracking-[0.2em]">
          <span className="w-0.5 h-0.5 md:w-1 md:h-1 bg-orange-500 rounded-full animate-pulse"></span>
          SLOT #{card.id}
        </h3>
        <span className="text-[5px] md:text-[9px] bg-white/5 text-cyan-400 px-1 md:px-3 py-0.5 rounded-full border border-white/10 uppercase font-bold">Live</span>
      </div>

      <div className={`grid grid-cols-5 ${compact ? 'gap-0.5' : 'gap-1 md:gap-3'} mb-1 md:mb-8`}>
        {colConfigs.map(cfg => (
          <div key={cfg.label} className={`text-center ${compact ? 'py-0.5' : 'py-1.5 md:py-4'} font-bold ${cfg.text} ${cfg.bg} rounded md:rounded-2xl text-[8px] md:text-3xl font-['Orbitron'] border border-white/5`}>
            {cfg.label}
          </div>
        ))}
        
        {Array.from({ length: 25 }).map((_, i) => {
          const row = Math.floor(i / 5);
          const col = i % 5;
          const numberIndex = col * 5 + row;
          const num = card.numbers[numberIndex];
          const isFree = num === 0;
          const isMarked = isFree || markedNumbers.has(num);
          const isWinning = winningCells.includes(i);

          return (
            <div
              key={i}
              onClick={() => !isFree && onToggleMark?.(num)}
              className={`
                aspect-square flex items-center justify-center rounded md:rounded-2xl font-bold cursor-pointer transition-all border overflow-hidden
                ${compact ? 'text-[10px] md:text-2xl' : 'text-sm md:text-5xl'}
                ${isFree ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white border-orange-300 p-0.5' : 'bg-white/5 text-white border-white/5'}
                ${isMarked && !isFree && !isWinning ? `bg-emerald-500 border-white/20 shadow-md scale-[1.02]` : ''}
                ${isWinning ? `!bg-orange-500 !border-orange-300 z-10 scale-[1.05] animate-pulse` : ''}
              `}
            >
              {isFree ? (
                <i className={`fas fa-star ${compact ? 'text-[6px] md:text-xl' : 'text-xs md:text-4xl'}`}></i>
              ) : num}
            </div>
          );
        })}
      </div>

      {!compact && (
        <div className="flex justify-between border-t border-white/5 pt-1 md:pt-6 text-[6px] md:text-[11px] text-white/30 font-bold uppercase">
          <div className="flex flex-col items-center">
            <span className="text-white text-xs md:text-4xl font-['Orbitron']">{markedNumbers.size + 1}</span>
            <span>Synced</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-orange-500 text-xs md:text-4xl font-['Orbitron']">{Math.max(0, 5 - (markedNumbers.size + 1))}</span>
            <span>Req</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default BingoCard;
