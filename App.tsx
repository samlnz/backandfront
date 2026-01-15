
import React, { useState, useEffect, useMemo } from 'react';
import { GamePhase, PlayerWinData } from './types';
import LobbyPage from './pages/LobbyPage';
import SelectionPage from './pages/SelectionPage';
import GamePage from './pages/GamePage';
import WinnerPage from './pages/WinnerPage';
import IndependentAdmin from './pages/IndependentAdmin';
import { cardGenerator } from './services/cardGenerator';

const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:3001' : window.location.origin;

const App: React.FC = () => {
  const [hasEntered, setHasEntered] = useState(false);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [playerName, setPlayerName] = useState('Explorer');
  const [playerId, setPlayerId] = useState('0000');
  const [balance, setBalance] = useState(0);
  
  const [serverTimeOffset, setServerTimeOffset] = useState(0);
  const [isOffline, setIsOffline] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [serverState, setServerState] = useState<any>({
    phase: 'SELECTION',
    roundId: 0,
    nextPhaseTime: Date.now() + 60000,
    participants: [],
    calledNumbers: []
  });

  const isAdminView = new URLSearchParams(window.location.search).get('view') === 'admin';

  useEffect(() => {
    if ((window as any).Telegram?.WebApp) {
      const tg = (window as any).Telegram.WebApp;
      tg.expand();
      const user = tg.initDataUnsafe?.user;
      if (user) {
        setPlayerName(user.first_name + (user.last_name ? ` ${user.last_name}` : ''));
        setPlayerId(user.id.toString());
      }
    } else {
      const randomId = localStorage.getItem('bingo_temp_id') || Math.floor(1000 + Math.random() * 9000).toString();
      localStorage.setItem('bingo_temp_id', randomId);
      setPlayerId(randomId);
    }
  }, []);

  useEffect(() => {
    if (!playerId || playerId === '0000') return;
    
    const fetchBalance = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/balance/${playerId}`);
        if (res.ok) {
          const data = await res.json();
          setBalance(data.balance);
        }
      } catch (e) {
        console.warn("Balance fetch failed");
      }
    };

    fetchBalance();
    const inv = setInterval(fetchBalance, 5000); 
    return () => clearInterval(inv);
  }, [playerId]);

  useEffect(() => {
    const fetchState = async () => {
      try {
        const start = Date.now();
        const res = await fetch(`${API_BASE}/api/game/state`);
        
        if (res.ok) {
          const data = await res.json();
          const latency = (Date.now() - start) / 2;
          const newOffset = data.serverTime - (Date.now() - latency);
          setServerTimeOffset(newOffset);
          setServerState(data);
          setIsOffline(false);
        } else {
          setIsOffline(true);
        }
      } catch (e) {
        setIsOffline(true);
      }
    };

    const interval = setInterval(fetchState, 2000);
    fetchState();
    return () => clearInterval(interval);
  }, []);

  const handleJoin = async (cards: number[]) => {
    setErrorMsg(null);
    try {
      const res = await fetch(`${API_BASE}/api/game/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, name: playerName, cardIds: cards })
      });
      if (!res.ok) {
        const err = await res.json();
        setErrorMsg(err.error || "Action failed");
      } else {
        setSelectedCards(cards);
      }
    } catch (e) {
      setErrorMsg("Network Sync Failed");
    }
  };

  const winnerData = useMemo<PlayerWinData | null>(() => {
    if (!serverState || serverState.phase !== 'WINNER' || !serverState.winner) return null;
    const win = serverState.winner;
    const card = cardGenerator.generateCard(win.cardId);
    return {
      playerName: win.name,
      playerId: win.playerId,
      cardNumbers: [win.cardId, 0],
      winningLines: { card1: ["BINGO"], card2: [] },
      totalLines: 1,
      gameTime: serverState.calledNumbers.length * 3.5,
      calledNumbersCount: serverState.calledNumbers.length,
      cardData: {
        card1: {
          numbers: card.numbers,
          markedNumbers: serverState.calledNumbers,
          winningCells: [], 
          winningLines: ["BINGO"]
        },
        card2: { numbers: [], markedNumbers: [], winningCells: [], winningLines: [] }
      }
    };
  }, [serverState]);

  const currentSyncedTime = (Date.now() + serverTimeOffset) / 1000;

  if (isAdminView) return <IndependentAdmin />;
  
  if (isOffline) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center p-8 text-center font-['Orbitron']">
        <div className="space-y-6">
          <div className="text-cyan-500 text-7xl animate-pulse"><i className="fas fa-satellite-dish"></i></div>
          <h2 className="text-white text-3xl font-bold tracking-tighter">WAITING FOR NETWORK</h2>
          <p className="text-cyan-400/40 text-sm uppercase tracking-widest">Synchronizing with celestial engine...</p>
        </div>
      </div>
    );
  }

  if (!hasEntered) return <LobbyPage onStart={() => setHasEntered(true)} />;

  return (
    <div className="min-h-screen bg-[#020617] font-['Rajdhani'] selection:bg-cyan-500 selection:text-white">
      {errorMsg && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] bg-red-500 text-white px-6 py-3 rounded-full font-bold shadow-xl animate-bounce">
          {errorMsg}
        </div>
      )}

      {serverState.phase === 'SELECTION' && (
        <SelectionPage 
          playerName={playerName} playerId={playerId} balance={balance}
          selectedCards={selectedCards} 
          networkSelections={serverState.participants?.filter((p: any) => p.playerId !== playerId).flatMap((p: any) => p.cardIds.map((cid: any) => ({ id: cid, username: p.name }))) || []}
          onToggleCard={(id) => {
            const next = selectedCards.includes(id) ? selectedCards.filter(x => x !== id) : [...selectedCards, id].slice(0, 2);
            handleJoin(next);
          }}
          onRandomAssign={() => handleJoin([Math.floor(Math.random()*500)+1, Math.floor(Math.random()*500)+1])}
          onClearSelection={() => handleJoin([])}
          globalTime={currentSyncedTime} 
          roundEndTime={(serverState.nextPhaseTime) / 1000}
          roundId={serverState.roundId}
        />
      )}
      
      {serverState.phase === 'PLAYING' && (
        <GamePage 
          selectedCards={selectedCards} playerName={playerName} playerId={playerId} balance={balance}
          onWin={() => {}} 
          globalTime={currentSyncedTime} 
          roundStartTime={(serverState.phaseStartTime) / 1000}
          roundId={serverState.roundId} 
          activeParticipantCount={serverState.participants?.length || 0}
          serverCalledNumbers={serverState.calledNumbers || []}
        />
      )}
      
      {serverState.phase === 'WINNER' && (
        <WinnerPage 
          data={winnerData || { 
            playerName: "Finalizing...", playerId: "0", cardNumbers: [0, 0], 
            winningLines: { card1: [], card2: [] }, totalLines: 0, gameTime: 0, 
            calledNumbersCount: 0, 
            cardData: { 
              card1: { numbers: [], markedNumbers: [], winningCells: [], winningLines: [] }, 
              card2: { numbers: [], markedNumbers: [], winningCells: [], winningLines: [] } 
            } 
          }} 
          onRestart={() => {}} 
          currentPlayerId={playerId} 
          userDidParticipate={selectedCards.length > 0} 
        />
      )}

      <div className="fixed bottom-6 right-6 flex flex-col items-end gap-3 z-50">
        <button 
          onClick={() => (window as any).Telegram?.WebApp?.close()}
          className="bg-white/5 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full text-[10px] font-bold text-white/40 uppercase hover:text-white transition-colors"
        >
          Close App
        </button>
      </div>
    </div>
  );
};

export default App;
