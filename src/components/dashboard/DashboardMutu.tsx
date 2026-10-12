import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { isFacultyLeaderRole } from '../../types';
import { DashboardFakultas } from './DashboardFakultas';
import { DashboardRektor } from './DashboardRektor';
import { DashboardLPM } from './DashboardLPM';
import { DashboardKaprodi } from './DashboardKaprodi';
import { DashboardAuditorLapangan } from './DashboardAuditorLapangan';
import { MatriksPPEPP } from './MatriksPPEPP';
import { PPEPPPerformanceMatrix } from './PPEPPPerformanceMatrix';
import { MatriksCapaianMutuFakultasProdi } from './MatriksCapaianMutuFakultasProdi';
import { ExportAMIPDFModal } from '../reports/ExportAMIPDFModal';
import {
  TrendingUp,
  Award,
  AlertTriangle,
  CheckCircle2,
  Building,
  GraduationCap,
  Sparkles,
  ArrowUpRight,
  ShieldAlert,
  BarChart3,
  BookOpen,
  Calendar,
  Layers,
  ChevronRight,
  Download,
  Users2,
  ShieldCheck,
  ClipboardList,
  UserCheck
} from 'lucide-react';

interface DashboardMutuProps {
  onNavigateToTab: (tab: string) => void;
  onOpenAI: () => void;
}

export const DashboardMutu: React.FC<DashboardMutuProps> = ({ onNavigateToTab, onOpenAI }) => {
  const { units, audits, findings, correctiveActions, standards, currentUser, generateExecutiveSummaryWithAI } = useApp();
  
  // Faculty units (FAI, FIP, FSTK, and Pascasarjana)
  const facultyUnits = units.filter(u => u.type === 'Fakultas' || u.type === 'Program Pascasarjana');
  const prodiUnits = units.filter(u => u.type === 'Program Studi');

  const isCurrentUserFacultyLeader =
    isFacultyLeaderRole(currentUser.role) ||
    currentUser.role === 'Dekan' ||
    currentUser.role === 'Direktur Pascasarjana';
  const userFacultyUnit = facultyUnits.find(f => f.id === currentUser.unitId);

  // Helper to determine initial role-specific view based on logged in user
  const getInitialViewForRole = (): string => {
    if (currentUser.role === 'Rektor') return 'role-rektor';
    if (currentUser.role === 'LPM') return 'role-lpm';
    if (currentUser.role === 'Auditor Internal') return 'role-auditor';
    if (currentUser.role === 'Ketua Program Studi') return 'role-kaprodi';
    if (isCurrentUserFacultyLeader && userFacultyUnit) return userFacultyUnit.id;
    return 'all';
  };

  // Set default active view
  const [activeView, setActiveView] = useState<string>(getInitialViewForRole);

  // Automatically sync activeView when user role changes
  useEffect(() => {
    setActiveView(getInitialViewForRole());
  }, [currentUser.id, currentUser.role, currentUser.unitId]);

  const [aiSummary, setAiSummary] = useState<string>('');
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);
  const [isExportPdfOpen, setIsExportPdfOpen] = useState<boolean>(false);

  // University Score calculation
  const univUnit = units.find(u => u.type === 'Universitas') || units[0];

  // Findings summary
  const totalFindings = findings.length;
  const mayorCount = findings.filter(f => f.category === 'Mayor').length;
  const minorCount = findings.filter(f => f.category === 'Minor').length;
  const observasiCount = findings.filter(f => f.category === 'Observasi').length;

  // Corrective action resolution rate
  const resolvedCapCount = correctiveActions.filter(c => c.status === 'Terverifikasi' || c.status === 'Selesai').length;
  const capResolutionPercent = correctiveActions.length > 0
    ? Math.round((resolvedCapCount / correctiveActions.length) * 100)
    : 80;

  // Standar count
  const pendidikanStdCount = standards.filter(s => s.category === 'STANDAR PENDIDIKAN').length;
  const penelitianStdCount = standards.filter(s => s.category === 'STANDAR PENELITIAN').length;
  const pkmStdCount = standards.filter(s => s.category === 'STANDAR PENGABDIAN').length;
  const aikStdCount = standards.filter(s => s.category === 'STANDAR AIK DAN KEKHASAN').length;

  const handleGenerateSummary = async () => {
    setIsLoadingAi(true);
    try {
      const summary = await generateExecutiveSummaryWithAI({
        programName: 'Siklus AMI UNIMEN 2025/2026 Genap',
        year: '2025/2026',
        universityAverage: univUnit.qualityScore,
        totalFindings,
        mayorCount,
        minorCount,
        obsCount: observasiCount,
        unitData: units.slice(0, 5).map(u => ({ name: u.name, score: u.qualityScore }))
      });
      setAiSummary(summary);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingAi(false);
    }
  };

  const selectedFacultyUnit = facultyUnits.find(f => f.id === activeView);

  const filteredProdis = activeView === 'all'
    ? prodiUnits
    : prodiUnits.filter(p => p.parentUnitId === activeView);

  return (
    <div className="space-y-6">
      {/* Role-Specific Dashboard Switcher Bar */}
      <div className="bg-white p-2.5 rounded-2xl border border-slate-200/90 shadow-xs space-y-2">
        <div className="flex items-center justify-between px-2 pt-1 pb-1 text-xs">
          <div className="flex items-center gap-2 text-slate-700 font-bold">
            <UserCheck className="w-4 h-4 text-emerald-700" />
            <span>Pilih Dashboard Sesuai Peran:</span>
            <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              Peran Anda: {currentUser.role}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            Eksplorasi sudut pandang peran pejabat SPMI UNIMEN
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {/* 1. Dashboard Rektor */}
          <button
            onClick={() => setActiveView('role-rektor')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${
              activeView === 'role-rektor'
                ? 'bg-slate-900 text-amber-300 shadow-xs ring-2 ring-amber-400/40'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
            title="Dashboard Eksekutif Rektorat (Dr. Drs. Syawal Sitonda, M.Ag.)"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Rektorat</span>
          </button>

          {/* 2. Dashboard LPM & Auditor Internal */}
          <button
            onClick={() => setActiveView('role-lpm')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${
              activeView === 'role-lpm'
                ? 'bg-emerald-800 text-white shadow-xs ring-2 ring-emerald-500/40'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
            title="Dashboard Kepala LPM & Koordinator Auditor Internal (Dr. Dian Firdiani & Dr. Masnur)"
          >
            <Award className="w-3.5 h-3.5 text-emerald-300" />
            <span>LPM & Auditor Int.</span>
          </button>

          {/* 3. Dashboard Kaprodi (Auditee) */}
          <button
            onClick={() => setActiveView('role-kaprodi')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${
              activeView === 'role-kaprodi'
                ? 'bg-teal-800 text-white shadow-xs ring-2 ring-teal-500/40'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
            title="Dashboard Kinerja Ketua Program Studi / Auditee AMI"
          >
            <GraduationCap className="w-3.5 h-3.5 text-teal-300" />
            <span>Kaprodi (Auditee)</span>
          </button>

          {/* 4. Dashboard Auditor Lapangan */}
          <button
            onClick={() => setActiveView('role-auditor')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${
              activeView === 'role-auditor'
                ? 'bg-indigo-900 text-white shadow-xs ring-2 ring-indigo-500/40'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
            title="Dashboard Auditor Internal Lapangan (Pemeriksaan Butir & Bukti)"
          >
            <ClipboardList className="w-3.5 h-3.5 text-indigo-300" />
            <span>Auditor Lapangan</span>
          </button>

          {/* Divider */}
          <span className="text-slate-300 font-thin px-0.5">|</span>

          {/* 5. Fakultas Options */}
          {facultyUnits.map(f => {
            const isSelected = activeView === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setActiveView(f.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-emerald-700 text-white shadow-xs ring-2 ring-emerald-400/40'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
                title={`Dashboard Dekan / Pimpinan ${f.name}`}
              >
                <Building className="w-3.5 h-3.5" />
                <span>Dekan {f.code}</span>
              </button>
            );
          })}

          {/* 6. Overview Universitas */}
          <button
            onClick={() => setActiveView('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${
              activeView === 'all'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
            title="Dashboard Agregat Seluruh Universitas"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Agregat UNIMEN</span>
          </button>
        </div>
      </div>

      {/* Render the Active Dashboard View */}
      {activeView === 'role-rektor' ? (
        <DashboardRektor onNavigateToTab={onNavigateToTab} onOpenAI={onOpenAI} />
      ) : activeView === 'role-lpm' ? (
        <DashboardLPM onNavigateToTab={onNavigateToTab} onOpenAI={onOpenAI} />
      ) : activeView === 'role-kaprodi' ? (
        <DashboardKaprodi onNavigateToTab={onNavigateToTab} onOpenAI={onOpenAI} />
      ) : activeView === 'role-auditor' ? (
        <DashboardAuditorLapangan onNavigateToTab={onNavigateToTab} onOpenAI={onOpenAI} />
      ) : selectedFacultyUnit ? (
        <DashboardFakultas
          facultyUnit={selectedFacultyUnit}
          onNavigateToTab={onNavigateToTab}
          onOpenAI={onOpenAI}
        />
      ) : (
        <>
          {/* Top Banner / Welcome */}
          <div className="relative overflow-hidden bg-gradient-to-r from-emerald-800 via-teal-800 to-sky-900 rounded-2xl p-6 text-white shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-emerald-200 text-xs font-semibold mb-3 border border-white/10">
              <Award className="w-3.5 h-3.5" />
              Siklus AMI Semester Genap 2025/2026
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Dashboard Mutu Internal UNIMEN
            </h1>
            <p className="mt-2 text-emerald-100 text-sm leading-relaxed">
              Pemantauan terpadu implementasi <strong>Permendiktisaintek No. 39 Tahun 2025</strong>, siklus PPEPP, Standar Nasional Pendidikan Tinggi, dan Standar Kekhasan AIK & Agropreneurship Universitas Muhammadiyah Enrekang.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 shrink-0">
            <button
              onClick={() => onNavigateToTab('rtm')}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs backdrop-blur-md border border-emerald-500/50 transition shadow-sm active:scale-95"
            >
              <Users2 className="w-4 h-4 text-amber-300" />
              Sidang RTM & Panggil Prodi
            </button>
            <button
              onClick={() => setIsExportPdfOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-950 to-teal-950 hover:from-black hover:to-emerald-950 text-white font-bold text-xs backdrop-blur-md border border-amber-400/50 transition shadow-sm active:scale-95"
            >
              <Download className="w-4 h-4 text-amber-300" />
              Ekspor Laporan PDF
            </button>
            <button
              onClick={handleGenerateSummary}
              disabled={isLoadingAi}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold text-xs shadow-md transition transform active:scale-95 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              {isLoadingAi ? 'Menganalisis...' : 'AI Ringkasan Rektor'}
            </button>
            <button
              onClick={() => onNavigateToTab('audit')}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs backdrop-blur-md border border-white/20 transition"
            >
              Lihat Progres AMI
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Decorative background circle */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* AI Summary Box (if generated) */}
      {aiSummary && (
        <div className="bg-gradient-to-br from-amber-50 to-emerald-50 border border-emerald-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Ringkasan Eksekutif Pimpinan & RTM (Analisis AI)</span>
            </div>
            <button
              onClick={() => setAiSummary('')}
              className="text-xs text-slate-400 hover:text-slate-600 font-medium"
            >
              Tutup
            </button>
          </div>
          <div className="prose prose-sm text-slate-700 whitespace-pre-line text-xs leading-relaxed max-w-none">
            {aiSummary}
          </div>
        </div>
      )}

      {/* 4 Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Nilai Mutu Universitas */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Nilai Mutu Universitas
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{univUnit.qualityScore.toFixed(2)}</span>
            <span className="text-xs text-slate-400 font-semibold">/ 4.00</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800">
              Baik Sekali
            </span>
            <span className="text-slate-500">Target: {univUnit.targetScore.toFixed(2)}</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
            <div
              className="bg-emerald-600 h-1.5 rounded-full"
              style={{ width: `${(univUnit.qualityScore / 4.0) * 100}%` }}
            />
          </div>
        </div>

        {/* Metric 2: Status Pelaksanaan AMI */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Status Program AMI
            </span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {audits.filter(a => a.status === 'Selesai' || a.status === 'Review').length}
            </span>
            <span className="text-xs text-slate-400 font-semibold">/ {audits.length} Unit</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="px-2 py-0.5 rounded-full font-bold bg-sky-100 text-sky-800">
              Tahap Pelaksanaan
            </span>
            <span className="text-slate-500 font-medium">Siklus Genap 2026</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
            <div
              className="bg-sky-600 h-1.5 rounded-full"
              style={{ width: `${(audits.filter(a => a.status === 'Selesai' || a.status === 'Review').length / (audits.length || 1)) * 100}%` }}
            />
          </div>
        </div>

        {/* Metric 3: Total Temuan Audit */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Temuan Audit
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{totalFindings}</span>
            <span className="text-xs text-slate-400 font-semibold">Butir Kesenjangan</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] font-bold">
            <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800">{mayorCount} Mayor</span>
            <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">{minorCount} Minor</span>
            <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">{observasiCount} Obs</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 flex overflow-hidden">
            <div style={{ width: `${(mayorCount / (totalFindings || 1)) * 100}%` }} className="bg-rose-500" />
            <div style={{ width: `${(minorCount / (totalFindings || 1)) * 100}%` }} className="bg-amber-500" />
            <div style={{ width: `${(observasiCount / (totalFindings || 1)) * 100}%` }} className="bg-blue-500" />
          </div>
        </div>

        {/* Metric 4: Penyelesaian Tindak Lanjut (PTK) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Penyelesaian Tindak Lanjut
            </span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{capResolutionPercent}%</span>
            <span className="text-xs text-emerald-600 font-bold">Selesai/Verifikasi</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-slate-500">{resolvedCapCount} dari {correctiveActions.length} Rencana CAP</span>
            <span className="font-semibold text-teal-700">Terverifikasi</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
            <div
              className="bg-teal-600 h-1.5 rounded-full"
              style={{ width: `${capResolutionPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Heatmap Matriks Kinerja Siklus PPEPP Per Fakultas & Prodi */}
      <PPEPPPerformanceMatrix
        selectedFacultyId={activeView !== 'all' ? activeView : undefined}
        onNavigateToTab={onNavigateToTab}
      />

      {/* Matriks Pelaksanaan Siklus PPEPP */}
      <MatriksPPEPP selectedFacultyId={activeView !== 'all' ? activeView : undefined} />

      {/* Matriks Capaian Mutu Fakultas & Program Studi */}
      <MatriksCapaianMutuFakultasProdi onNavigateToTab={onNavigateToTab} />

      {/* Grid: Capaian Fakultas & Prodi and Standar Mutu Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Mutu Fakultas & Program Studi */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Building className="w-5 h-5 text-emerald-700" />
                Capaian Mutu Fakultas & Program Studi
              </h2>
              <p className="text-xs text-slate-500">
                Nilai kinerja audit mutu internal per unit kerja
              </p>
            </div>

            {/* Filter Dropdown */}
            <select
              value={activeView}
              onChange={(e) => setActiveView(e.target.value)}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Semua Fakultas & Unit</option>
              {facultyUnits.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>

          {/* Fakultas Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {facultyUnits.map(fak => (
              <div
                key={fak.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-emerald-50/40 hover:border-emerald-300 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600">{fak.code}</span>
                  <span className="text-xs font-extrabold text-emerald-800">{fak.qualityScore.toFixed(2)}</span>
                </div>
                <p className="text-xs font-semibold text-slate-900 mt-1 line-clamp-1">{fak.name}</p>
                <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
                  <span>Dekan: {fak.headName.split(',')[0]}</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1 mt-2">
                  <div
                    className="bg-emerald-600 h-1 rounded-full"
                    style={{ width: `${(fak.qualityScore / 4.0) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Table of Program Studi */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Program Studi</th>
                  <th className="py-2.5 px-3">Fakultas</th>
                  <th className="py-2.5 px-3">Ketua Prodi</th>
                  <th className="py-2.5 px-3 text-center">Skor Mutu</th>
                  <th className="py-2.5 px-3 text-center">Temuan</th>
                  <th className="py-2.5 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProdis.map(prodi => {
                  const parent = facultyUnits.find(f => f.id === prodi.parentUnitId);
                  const isGood = prodi.qualityScore >= 3.5;
                  return (
                    <tr key={prodi.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-3 font-bold text-slate-900">
                        {prodi.name}
                      </td>
                      <td className="py-3 px-3 text-slate-600 font-medium">
                        {parent?.code || 'UNIMEN'}
                      </td>
                      <td className="py-3 px-3 text-slate-600 truncate max-w-[120px]">
                        {prodi.headName}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded-full font-bold ${
                          isGood ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {prodi.qualityScore.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="text-slate-600 font-medium">
                          {prodi.totalFindings} ({prodi.resolvedFindings} tuntas)
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => onNavigateToTab('audit')}
                          className="text-emerald-700 hover:text-emerald-900 font-bold hover:underline"
                        >
                          Audit Unit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Col: Standar Mutu Breakdown & Quick Links */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-3">
              <BookOpen className="w-5 h-5 text-emerald-700" />
              Kelompok Standar Mutu
            </h2>
            <div className="space-y-3">
              <div
                onClick={() => onNavigateToTab('standar')}
                className="p-3 rounded-xl border border-slate-200 hover:border-emerald-400 bg-slate-50/50 hover:bg-emerald-50/30 transition cursor-pointer flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-bold text-slate-900">A. Standar Pendidikan</p>
                  <p className="text-[11px] text-slate-500">Permendiktisaintek 39/2025</p>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {pendidikanStdCount} Standar
                </span>
              </div>

              <div
                onClick={() => onNavigateToTab('standar')}
                className="p-3 rounded-xl border border-slate-200 hover:border-teal-400 bg-slate-50/50 hover:bg-teal-50/30 transition cursor-pointer flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-bold text-slate-900">B. Standar Penelitian</p>
                  <p className="text-[11px] text-slate-500">Luaran, Proses, Masukan LPPM</p>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                  {penelitianStdCount} Standar
                </span>
              </div>

              <div
                onClick={() => onNavigateToTab('standar')}
                className="p-3 rounded-xl border border-slate-200 hover:border-sky-400 bg-slate-50/50 hover:bg-sky-50/30 transition cursor-pointer flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-bold text-slate-900">C. Standar Pengabdian</p>
                  <p className="text-[11px] text-slate-500">Dampak Masyarakat & Inovasi PkM</p>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
                  {pkmStdCount} Standar
                </span>
              </div>

              <div
                onClick={() => onNavigateToTab('standar')}
                className="p-3 rounded-xl border border-slate-200 hover:border-amber-400 bg-slate-50/50 hover:bg-amber-50/30 transition cursor-pointer flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-bold text-slate-900">D. Standar AIK & Kekhasan</p>
                  <p className="text-[11px] text-slate-500">Edutech & Agropreneurship Enrekang</p>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                  {aikStdCount} Standar
                </span>
              </div>
            </div>
          </div>

          {/* AI Auditor Advisory Widget */}
          <div className="bg-gradient-to-br from-emerald-900 to-teal-950 text-white rounded-2xl p-5 shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                SIAMI AI Auditor Assistant
              </span>
            </div>
            <p className="text-xs text-emerald-100 leading-relaxed mb-4">
              Gunakan kecerdasan buatan untuk menganalisis kecukupan bukti digital, rekomendasi RCA 5-Whys temuan, dan prediksi risiko akreditasi.
            </p>
            <button
              onClick={onOpenAI}
              className="w-full py-2 px-3 rounded-xl bg-white text-emerald-900 hover:bg-emerald-50 text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Buka Konsultasi AI Auditor
            </button>
          </div>
        </div>
      </div>
      </>
      )}
      {/* Export AMI PDF Modal */}
      <ExportAMIPDFModal
        isOpen={isExportPdfOpen}
        onClose={() => setIsExportPdfOpen(false)}
        defaultUnitId={activeView !== 'all' ? activeView : undefined}
      />
    </div>
  );
};
