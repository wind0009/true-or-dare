import React, { useMemo, useState } from 'react';
import { Copy, Radio, Users, Wifi, X } from 'lucide-react';
import { RoomMember, makeRoomCode } from '../services/onlineRoom';
import { sound } from '../utils/sound';

interface OnlineRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  connected: boolean;
  roomCode: string;
  members: RoomMember[];
  onConnect: (code: string, displayName: string, isHost: boolean) => Promise<void>;
  onLeave: () => void;
}

export const OnlineRoomModal: React.FC<OnlineRoomModalProps> = ({ isOpen, onClose, connected, roomCode, members, onConnect, onLeave }) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const suggestedCode = useMemo(() => makeRoomCode(), [isOpen]);

  if (!isOpen) return null;

  const connect = async (nextCode: string, isHost: boolean) => {
    if (!name.trim()) return setError('Entre ton prénom pour rejoindre la salle.');
    setLoading(true);
    setError('');
    try {
      await onConnect(nextCode, name.trim(), isHost);
      sound.playSuccess();
    } catch {
      setError('Impossible de rejoindre la salle. Réessaie dans quelques secondes.');
    } finally {
      setLoading(false);
    }
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      sound.playClick();
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-cyan-500/30 bg-[#180d35] p-6 text-white shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/15 text-cyan-300"><Radio className="h-6 w-6" /></div>
            <div><h2 className="text-lg font-black">Salle en ligne</h2><p className="mt-1 text-xs text-slate-300">La roue est partagée avec tout le groupe.</p></div>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl p-2 text-slate-400 hover:bg-white/10 hover:text-white"><X className="h-5 w-5" /></button>
        </div>

        {!connected ? <>
          <label className="mb-2 block text-xs font-bold text-slate-200">Ton prénom</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex. Maya" maxLength={20} className="mb-4 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-cyan-400" />
          <button type="button" disabled={loading} onClick={() => connect(suggestedCode, true)} className="mb-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-500 py-3 text-sm font-extrabold text-slate-950 disabled:opacity-50"><Wifi className="h-4 w-4" /> Créer une salle</button>
          <div className="relative my-4 border-t border-slate-700"><span className="absolute left-1/2 -top-2.5 -translate-x-1/2 bg-[#180d35] px-3 text-[10px] text-slate-400">OU</span></div>
          <label className="mb-2 block text-xs font-bold text-slate-200">Code reçu</label>
          <div className="flex gap-2"><input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="ABC123" maxLength={6} className="min-w-0 flex-1 rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-center text-sm font-black tracking-[0.2em] outline-none focus:border-cyan-400" /><button type="button" disabled={loading || code.trim().length < 6} onClick={() => connect(code.trim(), false)} className="rounded-2xl bg-purple-600 px-4 text-sm font-extrabold disabled:opacity-50">Rejoindre</button></div>
          {error && <p className="mt-3 text-xs text-rose-300">{error}</p>}
        </> : <>
          <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-4 text-center">
            <p className="text-xs font-bold text-cyan-200">CODE DE LA SALLE</p>
            <div className="mt-1 flex items-center justify-center gap-2"><span className="text-3xl font-black tracking-[0.22em]">{roomCode}</span><button type="button" onClick={copyCode} className="rounded-xl p-2 text-cyan-200 hover:bg-white/10"><Copy className="h-4 w-4" /></button></div>
            <p className="mt-2 text-xs text-slate-300">Partage ce code avec tes amis.</p>
          </div>
          <div className="mt-4"><p className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-300"><Users className="h-4 w-4" /> Dans la salle ({members.length})</p><div className="space-y-2">{members.map((member) => <div key={member.id} className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold">{member.name}</div>)}</div></div>
          <button type="button" onClick={onLeave} className="mt-5 w-full rounded-2xl bg-slate-800 py-3 text-sm font-bold text-slate-300 hover:bg-slate-700">Quitter la salle</button>
        </>}
      </div>
    </div>
  );
};
