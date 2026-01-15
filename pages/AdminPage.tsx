import React, { useEffect, useState } from 'react';

interface DepositRecord {
  id: number;
  from: { id?: number; name?: string } | null;
  text: string;
  date: string;
  approved?: boolean;
}

const AdminPage: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [deposits, setDeposits] = useState<DepositRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:3001' : '';

  const fetchDeposits = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/deposits`);
      const data = await res.json();
      setDeposits(data || []);
    } catch (e) {
      console.error(e);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchDeposits(); }, []);

  const approve = async (id: number) => {
    try {
      await fetch(`${API_BASE}/admin/approve/${id}`, { method: 'POST' });
      setDeposits(prev => prev.map(d => d.id === id ? ({ ...d, approved: true }) : d));
    } catch (e) { console.error(e); }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-start justify-center p-6 z-[999]">
      <div className="bg-[#071229] rounded-lg w-full max-w-2xl p-6 border border-white/10">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-white font-bold">Admin — Deposits</h3>
          <div className="flex items-center gap-2">
            <button className="text-sm text-cyan-300" onClick={fetchDeposits}>{loading ? 'Refreshing...' : 'Refresh'}</button>
            <button className="text-sm text-white/70" onClick={onClose}>Close</button>
          </div>
        </div>

        <div className="space-y-3 max-h-[60vh] overflow-auto">
          {deposits.length === 0 && <div className="text-white/40">No deposits yet.</div>}
          {deposits.map(d => (
            <div key={d.id} className="p-3 bg-white/2 rounded border border-white/5 flex justify-between items-start">
              <div>
                <div className="text-sm text-white/80">{d.from?.name || 'Unknown'} · <span className="text-xs text-white/40">{new Date(d.date).toLocaleString()}</span></div>
                <div className="mt-2 text-xs text-white/60 whitespace-pre-wrap">{d.text}</div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="text-xs text-white/40">ID: {d.id}</div>
                <div>
                  {d.approved ? (
                    <span className="text-emerald-400 font-bold">Approved</span>
                  ) : (
                    <button className="bg-cyan-600 px-3 py-1 rounded text-xs" onClick={() => approve(d.id)}>Approve</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
