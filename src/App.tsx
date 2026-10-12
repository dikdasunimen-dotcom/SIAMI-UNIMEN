import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Sidebar, ActiveTab } from './components/layout/Sidebar';
import { DashboardMutu } from './components/dashboard/DashboardMutu';
import { MasterStandar } from './components/standards/MasterStandar';
import { InstrumenAudit } from './components/instruments/InstrumenAudit';
import { PelaksanaanAudit } from './components/audit/PelaksanaanAudit';
import { ModulTemuan } from './components/findings/ModulTemuan';
import { TindakLanjut } from './components/corrective/TindakLanjut';
import { RapatTinjauanManajemen } from './components/rtm/RapatTinjauanManajemen';
import { ModulLaporan } from './components/reports/ModulLaporan';
import { ManajemenPenggunaFakultas } from './components/users/ManajemenPenggunaFakultas';
import { DashboardLoginPortal } from './components/auth/DashboardLoginPortal';
import { AIAssistantDrawer } from './components/ai/AIAssistantDrawer';
import { ProfilPenggunaView } from './components/profile/ProfilPenggunaView';
import {
  LayoutDashboard,
  BookOpenCheck,
  ClipboardList,
  AlertTriangle,
  CheckCircle2,
  Users2,
  FileText,
  Sparkles,
  Menu,
  X,
  UserCircle
} from 'lucide-react';

function MainApp() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isAIDrawerOpen, setIsAIDrawerOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const { currentUser, isLoggedIn } = useApp();

  const isInstrumenAllowed =
    currentUser.role === 'Super Admin' ||
    currentUser.role === 'LPM' ||
    currentUser.role === 'Auditor Internal';

  // Automatically redirect if current role is not permitted to access instrumen
  useEffect(() => {
    if (activeTab === 'instrumen' && !isInstrumenAllowed) {
      setActiveTab('dashboard');
    }
  }, [currentUser.role, activeTab, isInstrumenAllowed]);

  const handleNavigateToTab = (tab: string) => {
    if (tab === 'instrumen' && !isInstrumenAllowed) {
      setActiveTab('dashboard');
      return;
    }
    setActiveTab(tab as ActiveTab);
  };

  if (!isLoggedIn || activeTab === 'login') {
    return (
      <DashboardLoginPortal
        onSuccessLogin={() => setActiveTab('dashboard')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        onOpenAI={() => setIsAIDrawerOpen(true)}
        onNavigateToTab={handleNavigateToTab}
      />

      {/* Mobile Tab Bar Header */}
      <div className="md:hidden bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-between">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="flex items-center gap-2 text-xs font-bold text-slate-700 p-1.5 rounded-lg border border-slate-200"
        >
          {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          <span>Menu Navigasi ({activeTab})</span>
        </button>

        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
          {currentUser.role}
        </span>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 p-4 space-y-2 z-20">
          {[
            { id: 'dashboard', label: 'Dashboard Mutu', icon: LayoutDashboard },
            { id: 'standar', label: 'Master Standar', icon: BookOpenCheck },
            ...(isInstrumenAllowed ? [{ id: 'instrumen', label: 'Instrumen AMI', icon: ClipboardList }] : []),
            { id: 'audit', label: 'Pelaksanaan Audit', icon: ClipboardList },
            { id: 'temuan', label: 'Temuan Audit', icon: AlertTriangle },
            { id: 'tindak-lanjut', label: 'Tindak Lanjut (PTK)', icon: CheckCircle2 },
            { id: 'rtm', label: 'RTM Univ & Fakultas', icon: Users2 },
            { id: 'laporan', label: 'Laporan & Rekap Mutu', icon: FileText },
            { id: 'pengguna-fakultas', label: 'Pengguna & Dosen Fakultas', icon: Users2 },
            { id: 'profil', label: 'Profil Pengguna', icon: UserCircle },
            { id: 'login', label: 'Portal Login & Matriks Kampus', icon: LayoutDashboard },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id as ActiveTab);
                setIsMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2 ${
                activeTab === item.id ? 'bg-emerald-700 text-white' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Main Body */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex">
        {/* Desktop Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardMutu
              onNavigateToTab={handleNavigateToTab}
              onOpenAI={() => setIsAIDrawerOpen(true)}
            />
          )}

          {activeTab === 'standar' && <MasterStandar />}

          {activeTab === 'instrumen' && isInstrumenAllowed && <InstrumenAudit />}

          {activeTab === 'audit' && (
            <PelaksanaanAudit
              onNavigateToTab={handleNavigateToTab}
              onOpenAI={() => setIsAIDrawerOpen(true)}
            />
          )}

          {activeTab === 'temuan' && (
            <ModulTemuan onNavigateToTab={handleNavigateToTab} />
          )}

          {activeTab === 'tindak-lanjut' && <TindakLanjut />}

          {activeTab === 'rtm' && <RapatTinjauanManajemen />}

          {activeTab === 'laporan' && <ModulLaporan />}

          {activeTab === 'pengguna-fakultas' && (
            <ManajemenPenggunaFakultas onNavigateToTab={handleNavigateToTab} />
          )}

          {activeTab === 'profil' && (
            <ProfilPenggunaView onNavigateToTab={handleNavigateToTab} />
          )}

          {activeTab === 'ai-assistant' && (
            <div className="space-y-4">
              <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-emerald-700" />
                    SIAMI AI Auditor Assistant (Gemini 3.8)
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">
                    Asisten cerdas SPMI Permendiktisaintek No. 39 Tahun 2025, Siklus PPEPP, dan Standar AIK UNIMEN.
                  </p>
                </div>
                <button
                  onClick={() => setIsAIDrawerOpen(true)}
                  className="px-4 py-2 rounded-xl bg-emerald-700 text-white font-bold text-xs shadow-xs"
                >
                  Buka Panel Penuh
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  onClick={() => setIsAIDrawerOpen(true)}
                  className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-emerald-400 cursor-pointer shadow-xs transition"
                >
                  <h3 className="font-bold text-sm text-slate-900 mb-1">
                    1. Analisis Bukti Dokumen Digital
                  </h3>
                  <p className="text-xs text-slate-500">
                    Memeriksa kesesuaian dokumen CPL, RPS OBE, luaran publikasi Sinta, dan sertifikasi BTA terhadap butir audit.
                  </p>
                </div>

                <div
                  onClick={() => setIsAIDrawerOpen(true)}
                  className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-emerald-400 cursor-pointer shadow-xs transition"
                >
                  <h3 className="font-bold text-sm text-slate-900 mb-1">
                    2. Analisis Akar Masalah (5-Whys & Fishbone)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Menemukan penyebab mendasar temuan audit untuk mencegah pengulangan pada siklus AMI berikutnya.
                  </p>
                </div>

                <div
                  onClick={() => setIsAIDrawerOpen(true)}
                  className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-emerald-400 cursor-pointer shadow-xs transition"
                >
                  <h3 className="font-bold text-sm text-slate-900 mb-1">
                    3. Perumusan Tindakan Koreksi (SMART)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Menghasilkan rekomendasi rencana tindak lanjut (CAP) yang terukur dan memiliki target waktu realistis.
                  </p>
                </div>

                <div
                  onClick={() => setIsAIDrawerOpen(true)}
                  className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-emerald-400 cursor-pointer shadow-xs transition"
                >
                  <h3 className="font-bold text-sm text-slate-900 mb-1">
                    4. Prediksi Risiko Mutu & Akreditasi
                  </h3>
                  <p className="text-xs text-slate-500">
                    Memproyeksikan potensi risiko penurunan peringkat akreditasi LAM/BAN-PT berdasarkan tren capaian indikator.
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* SIAMI AI Assistant Slide-over Drawer */}
      <AIAssistantDrawer
        isOpen={isAIDrawerOpen}
        onClose={() => setIsAIDrawerOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
