import React from 'react';
import { useApp } from '../../context/AppContext';
import { isFacultyLeaderRole } from '../../types';
import {
  LayoutDashboard,
  BookOpenCheck,
  FileSpreadsheet,
  ClipboardList,
  AlertTriangle,
  CheckCircle2,
  Users2,
  Users,
  FileText,
  Sparkles,
  Award,
  Layers,
  KeyRound,
  LogOut,
  UserCircle
} from 'lucide-react';

export type ActiveTab =
  | 'dashboard'
  | 'standar'
  | 'instrumen'
  | 'audit'
  | 'temuan'
  | 'tindak-lanjut'
  | 'rtm'
  | 'laporan'
  | 'pengguna-fakultas'
  | 'profil'
  | 'login'
  | 'ai-assistant';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { currentUser, findings, correctiveActions, rtmRecords } = useApp();

  const openFindingsCount = findings.filter(f => f.status === 'Open' || f.status === 'In Progress').length;
  const pendingCapCount = correctiveActions.filter(c => c.status === 'Diajukan').length;
  const scheduledRtmCount = rtmRecords.filter(r => r.sessionStatus === 'Terjadwal' || r.status === 'Draft').length;

  const navItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Dashboard Mutu',
      icon: LayoutDashboard,
      badge: null,
      roles: ['Super Admin', 'Rektor', 'LPM', 'Auditor Internal', 'Dekan', 'Direktur Pascasarjana', 'Ketua Program Studi', 'LPPM', 'L2AIK'],
    },
    {
      id: 'standar' as ActiveTab,
      label: 'Master Standar Mutu',
      icon: BookOpenCheck,
      badge: 'Permendikti 39/25',
      roles: ['Super Admin', 'Rektor', 'LPM', 'Auditor Internal', 'Dekan', 'Direktur Pascasarjana', 'Ketua Program Studi', 'LPPM', 'L2AIK'],
    },
    {
      id: 'instrumen' as ActiveTab,
      label: 'Instrumen AMI',
      icon: FileSpreadsheet,
      badge: null,
      roles: ['Super Admin', 'LPM', 'Auditor Internal'],
    },
    {
      id: 'audit' as ActiveTab,
      label: 'Pelaksanaan Audit',
      icon: ClipboardList,
      badge: 'Workflow',
      roles: ['Super Admin', 'Rektor', 'LPM', 'Auditor Internal', 'Dekan', 'Direktur Pascasarjana', 'Ketua Program Studi', 'LPPM', 'L2AIK'],
    },
    {
      id: 'temuan' as ActiveTab,
      label: 'Temuan Audit',
      icon: AlertTriangle,
      badge: openFindingsCount > 0 ? `${openFindingsCount}` : null,
      badgeColor: 'bg-amber-100 text-amber-800',
      roles: ['Super Admin', 'Rektor', 'LPM', 'Auditor Internal', 'Dekan', 'Direktur Pascasarjana', 'Ketua Program Studi', 'LPPM', 'L2AIK'],
    },
    {
      id: 'tindak-lanjut' as ActiveTab,
      label: 'Tindak Lanjut (PTK)',
      icon: CheckCircle2,
      badge: pendingCapCount > 0 ? `${pendingCapCount}` : null,
      badgeColor: 'bg-blue-100 text-blue-800',
      roles: ['Super Admin', 'Rektor', 'LPM', 'Auditor Internal', 'Dekan', 'Direktur Pascasarjana', 'Ketua Program Studi', 'LPPM', 'L2AIK'],
    },
    {
      id: 'rtm' as ActiveTab,
      label: 'RTM & Evaluasi Prodi',
      icon: Users2,
      badge: scheduledRtmCount > 0 ? `${scheduledRtmCount} Terjadwal` : 'PPEPP',
      badgeColor: 'bg-amber-100 text-amber-800',
      roles: ['Super Admin', 'Rektor', 'LPM', 'Auditor Internal', 'Dekan', 'Direktur Pascasarjana', 'LPPM', 'L2AIK', 'Ketua Program Studi'],
    },
    {
      id: 'laporan' as ActiveTab,
      label: 'Laporan & Rekap Mutu',
      icon: FileText,
      badge: 'PDF / Cetak',
      roles: ['Super Admin', 'Rektor', 'LPM', 'Auditor Internal', 'Dekan', 'Direktur Pascasarjana', 'Ketua Program Studi', 'LPPM', 'L2AIK'],
    },
    {
      id: 'pengguna-fakultas' as ActiveTab,
      label: 'Pengguna & Dosen Fak.',
      icon: Users,
      badge: 'Fakultas',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      roles: ['Super Admin', 'Rektor', 'LPM', 'Dekan', 'Direktur Pascasarjana', 'Admin Fakultas', 'Ketua GKM Fakultas', 'Ketua Program Studi', 'Ketua UJM Prodi'],
    },
    {
      id: 'profil' as ActiveTab,
      label: 'Profil Pengguna',
      icon: UserCircle,
      badge: 'Bio/NIDN',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      roles: ['Super Admin', 'Rektor', 'LPM', 'Auditor Internal', 'Dekan', 'Direktur Pascasarjana', 'Ketua Program Studi', 'LPPM', 'L2AIK', 'Admin Fakultas', 'Ketua GKM Fakultas', 'Ketua UJM Prodi', 'Dosen'],
    },
    {
      id: 'ai-assistant' as ActiveTab,
      label: 'SIAMI AI Auditor',
      icon: Sparkles,
      badge: 'Gemini 3.8',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      roles: ['Super Admin', 'Rektor', 'LPM', 'Auditor Internal', 'Dekan', 'Direktur Pascasarjana', 'Ketua Program Studi', 'LPPM', 'L2AIK'],
    },
  ];

  const filteredNavItems = navItems.filter(item => {
    if (item.roles.includes(currentUser.role)) return true;
    if (isFacultyLeaderRole(currentUser.role) && (item.roles.includes('Dekan') || item.roles.includes('Direktur Pascasarjana'))) {
      return true;
    }
    return false;
  });

  return (
    <aside className="w-64 bg-white border-r border-slate-200 shrink-0 hidden md:block min-h-[calc(100vh-4rem)]">
      <div className="p-4 space-y-6">
        {/* User Card (Clickable to open profile) */}
        <div
          onClick={() => setActiveTab('profil')}
          className="p-3 bg-gradient-to-br from-slate-50 to-emerald-50/50 hover:bg-emerald-50/80 rounded-xl border border-slate-200/80 hover:border-emerald-300 transition cursor-pointer group shadow-2xs"
          title="Klik untuk membuka & mengedit Profil Pengguna"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-sm shadow-xs overflow-hidden shrink-0">
              {currentUser.avatar ? (
                <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
              ) : (
                <span>{currentUser.name.charAt(0)}</span>
              )}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-xs font-bold text-slate-900 group-hover:text-emerald-900 truncate flex items-center justify-between">
                <span>{currentUser.name}</span>
              </p>
              <p className="text-[11px] font-semibold text-emerald-700 truncate">{currentUser.role}</p>
              <p className="text-[10px] text-slate-500 truncate">{currentUser.unitName}</p>
            </div>
          </div>
          <div className="mt-2 pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-400 group-hover:text-emerald-700 font-medium">
            <span>Kelola Profil & TTD</span>
            <span className="text-[11px] font-bold">→</span>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Modul Utama SPMI
          </p>
          {filteredNavItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all group ${
                  isActive
                    ? 'bg-emerald-700 text-white shadow-sm shadow-emerald-700/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-700'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : item.badgeColor || 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* SPMI PPEPP Cycle Indicator Card */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-2">
            <Layers className="w-3.5 h-3.5 text-emerald-600" />
            <span>Siklus SPMI PPEPP</span>
          </div>
          <div className="grid grid-cols-5 gap-1 text-center text-[10px] font-semibold">
            <span className="p-1 rounded bg-emerald-100 text-emerald-800" title="Penetapan Standar">P</span>
            <span className="p-1 rounded bg-teal-100 text-teal-800" title="Pelaksanaan Standar">P</span>
            <span className="p-1 rounded bg-sky-100 text-sky-800" title="Evaluasi (AMI)">E</span>
            <span className="p-1 rounded bg-amber-100 text-amber-800" title="Pengendalian (RTM)">P</span>
            <span className="p-1 rounded bg-purple-100 text-purple-800" title="Peningkatan Standar">P</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-2 text-center">
            Universitas Muhammadiyah Enrekang
          </p>
        </div>

        {/* Portal Login & Gerbang Mutu Trigger */}
        <button
          onClick={() => setActiveTab('login')}
          className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold transition shadow-xs"
        >
          <KeyRound className="w-3.5 h-3.5 text-emerald-700" />
          <span>Portal Login & Matriks Kampus</span>
        </button>
      </div>
    </aside>
  );
};
