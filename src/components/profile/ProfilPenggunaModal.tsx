import React from 'react';
import { X } from 'lucide-react';
import { ProfilPenggunaView } from './ProfilPenggunaView';

interface ProfilPenggunaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab?: (tab: string) => void;
}

export const ProfilPenggunaModal: React.FC<ProfilPenggunaModalProps> = ({
  isOpen,
  onClose,
  onNavigateToTab
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-extrabold text-xs tracking-wide">
              PROFIL PENGGUNA & PEJABAT SPMI • UNIVERSITAS MUHAMMADIYAH ENREKANG
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
            title="Tutup (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          <ProfilPenggunaView
            onNavigateToTab={(tab) => {
              onClose();
              if (onNavigateToTab) onNavigateToTab(tab);
            }}
            onCloseModal={onClose}
          />
        </div>
      </div>
    </div>
  );
};
