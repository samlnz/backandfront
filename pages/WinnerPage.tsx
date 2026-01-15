
import React from 'react';
import { PlayerWinData } from '../types';
import BingoCard from '../components/BingoCard';

interface WinnerPageProps {
  data: PlayerWinData;
  onRestart: () => void;
  currentPlayerId?: string;
  userDidParticipate: boolean;
}

const WinnerPage: React.FC<WinnerPageProps> = ({ data, currentPlayerId, userDidParticipate }) => {
  const isLocalWinner = userDidParticipate && currentPlayerId === data.playerId;
  
  const winIdx = data.cardData.card1.winningCells.length > 0 ? 0 : 1;
  const winCardId = data.cardNumbers[winIdx];
  const winCardData = winIdx === 0 ? data.cardData.card1 : data.cardData.card2;

  return (
    <div className="min-h-screen bg-[#020202] flex flex-col items-center justify-center p-3 md:p-4 relative overflow-hidden font-['Rajdhani']">
      <div className={`absolute inset-0 pointer-events-none opacity-50 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] ${isLocalWinner ? 'from-green-500/30' : userDidParticipate ? 'from-red-500/20' : 'from-cyan-500/20'} via-transparent to-transparent`}></div>
      
      <div className={`max-w-4xl w-full bg-[#0a0f1e] border-2 md:border-4 ${isLocalWinner ? 'border-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.3)]' : userDidParticipate ? 'border-white/10' : 'border-cyan-500/20'} p-5 md:p-10 rounded-3xl md:rounded-[40px] z-10 space-y-5 md:space-y-10 text-center animate-fade-in`}>
        <div className="space-y-2 md:space-y-4">
          <div className={`text-5xl md:text-9xl ${isLocalWinner ? 'text-yellow-400 animate-bounce' : 'text-white/10'}`}>
            <i className={`fas ${isLocalWinner ? 'fa-award' : userDidParticipate ? 'fa-flag-checkered' : 'fa-satellite'}`}></i>
          </div>
          <h1 className={`text-3xl md:text-7xl font-['Orbitron'] font-bold ${isLocalWinner ? 'text-emerald-500' : 'text-white'}`}>
            {isLocalWinner ? 'BINGO!' : userDidParticipate ? 'ROUND OVER' : 'VIEW OVER'}
          </h1>
          <p className="text-[8px] md:text-sm text-cyan-400/40 uppercase tracking-[0.3em] md:tracking-[0.5em] font-bold">
            {userDidParticipate ? 'Protocol Verification Success' : 'Network Broadcast Terminated'}
          </p>
        </div>

        <div className={`grid md:grid-cols-2 gap-4 md:gap-8 items-center bg-white/5 p-4 md:p-10 rounded-2xl md:rounded-[3rem] border ${isLocalWinner ? 'border-emerald-500/40' : 'border-white/10'}`}>
          <div className="space-y-4 md:space-y-8 text-left">
            <div className="flex items-center gap-3 md:gap-6">
               <div className={`w-12 h-12 md:w-20 md:h-20 rounded-xl md:rounded-2xl bg-gradient-to-br ${isLocalWinner ? 'from-emerald-400 to-emerald-800' : 'from-white/10 to-white/5'} flex items-center justify-center text-xl md:text-4xl font-bold border border-white/20 shadow-xl text-white`}>
                 {data.playerName.charAt(0)}
               </div>
               <div>
                 <h2 className={`text-lg md:text-3xl font-bold font-['Orbitron'] ${isLocalWinner ? 'text-emerald-400' : 'text-white'}`}>{data.playerName}</h2>
                 <p className="text-white/20 tracking-widest text-[8px] md:text-[10px] uppercase font-bold mt-0.5">UID: {data.playerId}</p>
               </div>
            </div>
            
            <div className="space-y-3 md:space-y-4">
               <div className="bg-black/80 p-3 md:p-5 rounded-xl md:rounded-2xl border border-white/5">
                 <div className="flex justify-between items-center">
                   <span className="text-[8px] md:text-[10px] text-white/40 uppercase font-bold tracking-widest">Prize</span>
                   <span className={`text-xs md:text-sm font-bold font-['Orbitron'] ${isLocalWinner ? 'text-emerald-400' : 'text-white/20'}`}>
                     {isLocalWinner ? '+840.00 ETB' : '0.00 ETB'}
                   </span>
                 </div>
                 {!userDidParticipate && (
                   <p className="text-[7px] md:text-[9px] text-orange-500/60 uppercase font-bold mt-1.5">Observer Mode</p>
                 )}
               </div>

               <div className="grid grid-cols-2 gap-3 md:gap-4">
                 <div className="bg-black/40 p-2 md:p-4 rounded-xl md:rounded-2xl border border-white/5 text-center">
                   <div className="text-sm md:text-xl font-bold font-['Orbitron'] text-white">{data.totalLines}</div>
                   <div className="text-[7px] md:text-[8px] text-white/30 uppercase font-bold">Lines</div>
                 </div>
                 <div className="bg-black/40 p-2 md:p-4 rounded-xl md:rounded-2xl border border-white/5 text-center">
                   <div className="text-sm md:text-xl font-bold font-['Orbitron'] text-white">{Math.floor(data.gameTime)}s</div>
                   <div className="text-[7px] md:text-[8px] text-white/30 uppercase font-bold">Time</div>
                 </div>
               </div>
            </div>
          </div>
          
          <div className="relative group max-w-[240px] mx-auto md:max-w-none">
            <div className="absolute -inset-2 bg-orange-500/5 blur-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <BingoCard 
              card={{ id: winCardId, numbers: winCardData.numbers, type: 'Fixed' }} 
              markedNumbers={new Set(winCardData.markedNumbers)} 
              winningCells={winCardData.winningCells} 
              compact 
            />
          </div>
        </div>

        <div className="pt-2">
           <div className="flex flex-col items-center gap-1.5">
              <div className="w-full bg-white/5 h-0.5 md:h-1 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-500 animate-[shimmer_2s_infinite]"></div>
              </div>
              <span className="text-[8px] md:text-xs font-['Orbitron'] font-bold text-cyan-400 uppercase tracking-[0.2em] md:tracking-[0.3em] animate-pulse">
                SYNCING NEXT CYCLE...
              </span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default WinnerPage;
