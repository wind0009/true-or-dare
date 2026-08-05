import React, { useEffect, useState } from 'react';
import { ExternalLink, MessageCircle, X } from 'lucide-react';
import { sound } from '../utils/sound';

interface WhatsAppCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  callLink: string;
  onSaveCallLink: (link: string) => void;
}

export const WhatsAppCallModal: React.FC<WhatsAppCallModalProps> = ({
  isOpen,
  onClose,
  callLink,
  onSaveCallLink,
}) => {
  const [draft, setDraft] = useState(callLink);

  useEffect(() => setDraft(callLink), [callLink, isOpen]);

  if (!isOpen) return null;

  const cleanLink = draft.trim();
  const validLink = /^https:\/\/(call|chat)\.whatsapp\.com\//i.test(cleanLink);

  const handleSave = () => {
    if (!validLink) return;
    sound.playSuccess();
    onSaveCallLink(cleanLink);
  };

  const handleJoin = () => {
    if (!validLink) return;
    sound.playClick();
    window.open(cleanLink, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-emerald-500/30 bg-[#180d35] p-6 text-white shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400">
              <MessageCircle className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-black">Appel WhatsApp</h2>
              <p className="mt-1 text-xs leading-relaxed text-slate-300">Jouez dans l’app et parlez-vous en vidéo sur WhatsApp.</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl p-2 text-slate-400 hover:bg-white/10 hover:text-white" aria-label="Fermer">
            <X className="h-5 w-5" />
          </button>
        </div>

        <label className="mb-2 block text-xs font-bold text-slate-200">Lien d’appel créé sur WhatsApp</label>
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="https://call.whatsapp.com/..."
          className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
        />
        {cleanLink && !validLink && <p className="mt-2 text-xs text-rose-300">Colle un lien d’appel ou de groupe WhatsApp valide.</p>}

        <p className="mt-3 text-xs leading-relaxed text-slate-400">
          L’hôte crée l’appel de groupe dans WhatsApp, colle le lien ici, puis chaque joueur appuie sur « Rejoindre ».
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={!validLink}
            className="rounded-2xl border border-emerald-500/40 bg-emerald-500/15 px-4 py-3 text-sm font-extrabold text-emerald-200 transition hover:bg-emerald-500/25 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Enregistrer
          </button>
          <button
            type="button"
            onClick={handleJoin}
            disabled={!validLink}
            className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-extrabold text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Rejoindre <ExternalLink className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
