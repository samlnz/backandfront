
import React, { useEffect, useState } from 'react';

interface User {
  id: string;
  username: string;
  balance: number;
}

interface Transaction {
  type: string;
  userId: string;
  amount: number;
  ref?: string;
  date: number;
}

interface DashboardData {
  onlineCount: number;
  totalBalance: number;
  users: User[];
  transactions: Transaction[];
  withdrawals: any[];
}

const IndependentAdmin: React.FC<{ onExit?: () => void }> = ({ onExit }) => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'finance' | 'ledger'>('users');
  const [loading, setLoading] = useState(false);

  const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:3001' : '';

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/dashboard`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    const inv = setInterval(fetchDashboard, 5000);
    return () => clearInterval(inv);
  }, []);

  const handleAction = async (type: string, id: any, action: string) => {
    try {
      await fetch(`${API_BASE}/api/admin/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, id, action })
      });
      fetchDashboard();
    } catch (e) {
      console.error(e);
    }
  };

  if (!data) return <div className="p-10 text-white font-['Orbitron']">SYNCING PROTOCOLS...</div>;

  return (
    <div className="min-h-screen bg-[#050b1a] p-4 md:p-8 font-['Rajdhani'] text-white">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Navbar */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-cyan-500/20 rounded-lg border border-cyan-500/30">
              <i className="fas fa-shield-alt text-cyan-400"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold font-['Orbitron'] tracking-tighter">FINANCIAL <span className="text-cyan-400">CORE</span></h1>
              <p className="text-[8px] text-white/30 uppercase tracking-[0.2em]">Stellar Admin Protocol</p>
            </div>
          </div>

          <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
            {['users', 'finance', 'ledger'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-4 py-2 rounded-lg text-[10px] font-bold transition-all uppercase ${activeTab === tab ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20' : 'text-white/30'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-[8px] text-white/40 uppercase">Global Pool</p>
              <p className="text-lg font-bold font-['Orbitron'] text-emerald-400">{data.totalBalance.toLocaleString()} ETB</p>
            </div>
            {onExit && (
              <button onClick={onExit} className="w-10 h-10 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>
        </div>

        {activeTab === 'users' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.users.map(u => (
              <div key={u.id} className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-white/90">{u.username}</h3>
                    <p className="text-[10px] text-white/30 uppercase">UID: {u.id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold font-['Orbitron'] text-cyan-400">{u.balance.toLocaleString()}</p>
                    <p className="text-[8px] text-white/20 uppercase">Available</p>
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <button className="flex-1 py-2 bg-white/5 border border-white/10 rounded-lg text-[9px] font-bold uppercase hover:bg-white/10">Adjust</button>
                  <button className="flex-1 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-[9px] font-bold uppercase">Limit</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'ledger' && (
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
             <div className="p-4 border-b border-white/10 bg-white/2">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-cyan-400">Live Transaction Stream</h3>
             </div>
             <div className="divide-y divide-white/5 max-h-[60vh] overflow-y-auto">
               {data.transactions.map((tx, i) => (
                 <div key={i} className="p-4 flex justify-between items-center hover:bg-white/2 transition-colors">
                    <div className="flex items-center gap-4">
                       <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                         tx.type.includes('win') ? 'bg-emerald-500/20 text-emerald-400' : 
                         tx.type.includes('fee') ? 'bg-red-500/20 text-red-400' : 'bg-cyan-500/20 text-cyan-400'
                       }`}>
                          <i className={`fas ${
                            tx.type.includes('win') ? 'fa-arrow-up' : 
                            tx.type.includes('fee') ? 'fa-arrow-down' : 'fa-exchange-alt'
                          }`}></i>
                       </div>
                       <div>
                          <p className="text-xs font-bold capitalize">{tx.type.replace('_', ' ')}</p>
                          <p className="text-[9px] text-white/30">{new Date(tx.date).toLocaleString()} • User: {tx.userId}</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className={`font-bold font-['Orbitron'] ${tx.amount < 0 || tx.type.includes('fee') ? 'text-red-400' : 'text-emerald-400'}`}>
                         {tx.amount > 0 && !tx.type.includes('fee') ? '+' : ''}{tx.amount}
                       </p>
                       {tx.ref && <p className="text-[9px] text-white/20 font-mono">REF: {tx.ref}</p>}
                    </div>
                 </div>
               ))}
             </div>
          </div>
        )}

        {activeTab === 'finance' && (
          <div className="grid md:grid-cols-2 gap-8">
             <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-sm font-['Orbitron'] mb-6 flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-orange-500 rounded-full"></span>
                  PENDING WITHDRAWALS
                </h3>
                <div className="space-y-3">
                   {data.withdrawals.length === 0 && <p className="text-center py-10 text-white/20 text-xs">No pending requests</p>}
                   {data.withdrawals.map(w => (
                     <div key={w.id} className="bg-black/30 p-4 rounded-xl border border-white/5">
                        <div className="flex justify-between mb-4">
                           <div>
                              <p className="font-bold">{w.username}</p>
                              <p className="text-xl font-bold text-orange-400 font-['Orbitron']">{w.amount} ETB</p>
                           </div>
                           <button 
                             onClick={() => handleAction('withdrawal', w.id, 'approve')}
                             className="px-6 py-2 bg-orange-500 text-white rounded-lg text-[10px] font-bold shadow-lg shadow-orange-500/20"
                           >
                             PAY NOW
                           </button>
                        </div>
                        <div className="bg-white/5 p-3 rounded-lg text-[10px] font-mono text-amber-200 border border-white/5">
                           {w.info}
                        </div>
                     </div>
                   ))}
                </div>
             </div>

             <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-sm font-['Orbitron'] mb-6 flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-cyan-500 rounded-full"></span>
                  RECONCILIATION
                </h3>
                <div className="space-y-4">
                   <div className="p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-xl">
                      <p className="text-[10px] text-cyan-400 uppercase font-bold mb-1">Total Network Value</p>
                      <p className="text-3xl font-bold font-['Orbitron'] text-white">{data.totalBalance.toLocaleString()}</p>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                         <p className="text-[9px] text-white/40 uppercase font-bold">Total Fees Collected</p>
                         <p className="text-lg font-bold">1,240 ETB</p>
                      </div>
                      <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                         <p className="text-[9px] text-white/40 uppercase font-bold">Active Sessions</p>
                         <p className="text-lg font-bold">{data.onlineCount}</p>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IndependentAdmin;
