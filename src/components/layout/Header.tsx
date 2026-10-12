import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UnimenLogo } from '../common/UnimenLogo';
import {
  ShieldCheck,
  Sparkles,
  RefreshCw,
  Bell,
  Building2,
  ChevronDown,
  KeyRound,
  LogOut,
  UserCircle
} from 'lucide-react';
import { ProfilPenggunaModal } from '../profile/ProfilPenggunaModal';

interface HeaderProps {
  onOpenAI: () => void;
  onNavigateToTab?: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAI, onNavigateToTab }) => {
  const { currentUser, switchUserById, resetDataToSeed, findings, users, logout } = useApp();
  const unverifiedFindings = findings.filter(f => f.status === 'Open').length;
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const userPersonaGroups = [
    {
      group: 'Pimpinan Universitas & LPM',
      items: [
        { id: 'user-superadmin', label: 'Super Admin', sub: 'Akses Sistem Penuh', badge: 'bg-purple-100 text-purple-800' },
        { id: 'user-rektor', label: 'Rektor UNIMEN', sub: 'Dr. Drs. Syawal Sitonda, M.Ag.', badge: 'bg-amber-100 text-amber-800' },
        { id: 'user-lpm', label: 'Kepala LPM', sub: 'Dr. Dian Firdiani, S.Pd., M.Pd.', badge: 'bg-blue-100 text-blue-800' },
        { id: 'user-auditor', label: 'Koordinator Auditor Internal', sub: 'Dr. Masnur, S.Pd., M.Pd.', badge: 'bg-emerald-100 text-emerald-800' },
        { id: 'user-lppm', label: 'Ketua LPPM', sub: 'Penelitian & PkM', badge: 'bg-orange-100 text-orange-800' },
        { id: 'user-l2aik', label: 'Ketua L2AIK', sub: 'Nilai Islam & AIK', badge: 'bg-green-100 text-green-800' },
      ]
    },
    {
      group: 'Pimpinan Fakultas & Pascasarjana',
      items: [
        { id: 'user-dekan-fai', label: 'Dekan Fakultas Agama Islam (FAI)', sub: 'Ahmad Dahlan, S.Pd.I., M.Pd.I.', badge: 'bg-emerald-100 text-emerald-800' },
        { id: 'user-dekan-fip', label: 'Dekan Fakultas Ilmu Pendidikan (FIP)', sub: 'Dr. Ilham Assidiq, S.Pd., M.Pd.', badge: 'bg-blue-100 text-blue-800' },
        { id: 'user-dekan-fstk', label: 'Dekan Fak. Sains, Teknologi & Kes (FSTK)', sub: 'Dr. Ismaya, S.IP., M.IP.', badge: 'bg-teal-100 text-teal-800' },
        { id: 'user-direktur-pasca', label: 'Direktur Program Pascasarjana', sub: 'Dr. Drs. Yunus Busa, M.Si.', badge: 'bg-indigo-100 text-indigo-800' },
      ]
    },
    {
      group: 'Admin Fakultas & Tim GKM Mutu',
      items: [
        { id: 'user-admin-fai', label: 'Admin Fakultas Agama Islam (FAI)', sub: 'Tata Usaha FAI (3 Prodi)', badge: 'bg-emerald-50 text-emerald-800' },
        { id: 'user-admin-fip', label: 'Admin Fakultas Ilmu Pendidikan (FIP)', sub: 'Tata Usaha FIP (6 Prodi)', badge: 'bg-blue-50 text-blue-800' },
        { id: 'user-admin-fstk', label: 'Admin Fak. Sains, Teknologi & Kes (FSTK)', sub: 'Tata Usaha FSTK (9 Prodi)', badge: 'bg-teal-50 text-teal-800' },
        { id: 'user-admin-pasca', label: 'Admin Program Pascasarjana', sub: 'Tata Usaha Pasca (2 Prodi)', badge: 'bg-indigo-50 text-indigo-800' },
        { id: 'user-gkm-fai', label: 'Ketua GKM FAI', sub: 'Gugus Kendali Mutu FAI', badge: 'bg-purple-100 text-purple-800' },
      ]
    },
    {
      group: 'Ketua Program Studi (Auditee)',
      items: [
        { id: 'user-kaprodi-pai', label: 'Kaprodi S1 Pendidikan Agama Islam', sub: 'Fadil, S.Ag., M.Ag.', badge: 'bg-slate-100 text-slate-800' },
        { id: 'user-kaprodi-pgsd', label: 'Kaprodi S1 PGSD', sub: 'Muhammad Idham Haliq, S.Pd., M.Pd.', badge: 'bg-slate-100 text-slate-800' },
        { id: 'user-kaprodi-agrotek', label: 'Kaprodi S1 Agroteknologi', sub: 'Dr. Suharman, S.P., M.P.', badge: 'bg-slate-100 text-slate-800' },
        { id: 'user-kaprodi-gizi', label: 'Kaprodi S1 Gizi', sub: 'Sri Wahyuni, S.Gz., M.Si.', badge: 'bg-slate-100 text-slate-800' },
        { id: 'user-kaprodi-s2-pendas', label: 'Kaprodi S2 Pendidikan Dasar', sub: 'Dr. Masnur, S.Pd., M.Pd.', badge: 'bg-slate-100 text-slate-800' },
      ]
    }
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Identity */}
          <div className="flex items-center gap-3">
            <UnimenLogo size="md" variant="full" />
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Access to Institutional Login Portal */}
            <button
              onClick={() => onNavigateToTab ? onNavigateToTab('login') : logout()}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-emerald-800 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-lg transition"
              title="Buka Portal Login & Matriks SPMI Institusi"
            >
              <KeyRound className="w-3.5 h-3.5 text-emerald-700" />
              <span>Portal Login</span>
            </button>

            {/* Quick Profile Button */}
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition shadow-2xs"
              title="Lihat & Edit Profil Pengguna (Nama & Gelar Lengkap, NIDN, WhatsApp, Foto)"
            >
              <UserCircle className="w-3.5 h-3.5 text-emerald-700" />
              <span className="hidden sm:inline">Profil</span>
            </button>

            {/* AI Assistant Quick Trigger */}
            <button
              onClick={onOpenAI}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-lg shadow-sm transition-all transform active:scale-95"
              title="Buka SIAMI AI Assistant"
            >
              <Sparkles className="w-4 h-4 animate-pulse text-amber-300" />
              <span className="hidden sm:inline">SIAMI AI</span>
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                title={`${unverifiedFindings} temuan terbuka`}
              >
                <Bell className="w-5 h-5" />
                {unverifiedFindings > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unverifiedFindings}
                  </span>
                )}
              </button>
            </div>

            {/* Role Switcher (Crucial for Reviewer to test all 8 roles) */}
            <div className="relative group">
              <div className="flex items-center gap-2 p-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-white hover:shadow-xs transition cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs border border-emerald-300 overflow-hidden shrink-0">
                  {currentUser.avatar ? (
                    <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                  ) : (
                    <span>{currentUser.name.charAt(0)}</span>
                  )}
                </div>
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <span className="max-w-[130px] truncate">{currentUser.name}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <div className="text-[11px] text-emerald-700 font-semibold truncate max-w-[130px]">
                    {currentUser.role}
                  </div>
                </div>
              </div>

              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-1 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-2 hidden group-hover:block hover:block z-50">
                <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                  <div className="overflow-hidden pr-2">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Pengguna Aktif
                    </p>
                    <p className="text-xs text-emerald-800 font-bold truncate">
                      {currentUser.name}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate">
                      {currentUser.unitName}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsProfileModalOpen(true)}
                    className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 shrink-0 shadow-2xs"
                    title="Buka Formulir Profil"
                  >
                    <UserCircle className="w-3 h-3" />
                    <span>Edit Profil</span>
                  </button>
                </div>
                <div className="max-h-72 overflow-y-auto py-1 divide-y divide-slate-100">
                  {userPersonaGroups.map((grp, gIdx) => (
                    <div key={gIdx} className="py-1.5">
                      <p className="px-4 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                        {grp.group}
                      </p>
                      {grp.items.map(item => {
                        const isCurrent = currentUser.id === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => switchUserById(item.id)}
                            className={`w-full text-left px-4 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition ${
                              isCurrent ? 'bg-emerald-50 font-bold text-emerald-800' : 'text-slate-700'
                            }`}
                          >
                            <div className="flex flex-col pr-2 overflow-hidden">
                              <span className="truncate">{item.label}</span>
                              <span className="text-[10px] text-slate-400 font-normal truncate">{item.sub}</span>
                            </div>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${item.badge}`}>
                              {isCurrent ? 'Aktif' : 'Pilih'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
                <div className="px-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <button
                    onClick={() => onNavigateToTab ? onNavigateToTab('login') : logout()}
                    className="inline-flex items-center gap-1 text-slate-600 hover:text-emerald-800 font-bold px-2 py-1 rounded hover:bg-emerald-50"
                  >
                    <LogOut className="w-3 h-3 text-emerald-700" />
                    Portal Login Institusi
                  </button>
                  <button
                    onClick={resetDataToSeed}
                    className="inline-flex items-center gap-1 text-slate-400 hover:text-rose-600 font-medium px-2 py-1 rounded hover:bg-rose-50"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Reset Data
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profil Pengguna Modal */}
      <ProfilPenggunaModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onNavigateToTab={onNavigateToTab}
      />
    </header>
  );
};
