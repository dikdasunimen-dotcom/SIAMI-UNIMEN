import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Unit, AuditInstance, isFacultyLeaderRole } from '../../types';
import { FACULTY_ROLE_DEFINITIONS } from '../../data/seedData';
import { MatriksPPEPP } from './MatriksPPEPP';
import {
  Building,
  GraduationCap,
  Award,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Users2,
  Users,
  Calendar,
  Sparkles,
  ArrowRight,
  TrendingUp,
  FileText,
  FileCheck2,
  Layers,
  ChevronRight,
  Search,
  Filter,
  Check,
  X,
  ExternalLink,
  BookOpen
} from 'lucide-react';

interface DashboardFakultasProps {
  facultyUnit: Unit;
  onNavigateToTab: (tab: string) => void;
  onOpenAI: () => void;
}

export const DashboardFakultas: React.FC<DashboardFakultasProps> = ({
  facultyUnit,
  onNavigateToTab,
  onOpenAI
}) => {
  const {
    units,
    audits,
    findings,
    correctiveActions,
    rtmRecords,
    currentUser,
    validateAuditByDean,
    askAIAssistant
  } = useApp();

  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'need-validate' | 'validated' | 'high-score'>('all');

  // Role definition for this faculty
  const roleDefinition = FACULTY_ROLE_DEFINITIONS[facultyUnit.id];

  // Prodis under this faculty
  const prodis = units.filter(u => u.parentUnitId === facultyUnit.id);
  const prodiIds = prodis.map(p => p.id);

  // Audits for this faculty's prodis
  const facultyAudits = audits.filter(a => prodiIds.includes(a.unitId));

  // Findings for this faculty's prodis
  const facultyFindings = findings.filter(f => prodiIds.includes(f.unitId));
  const mayorCount = facultyFindings.filter(f => f.category === 'Mayor').length;
  const minorCount = facultyFindings.filter(f => f.category === 'Minor').length;
  const obsCount = facultyFindings.filter(f => f.category === 'Observasi').length;

  // Corrective actions for this faculty
  const facultyCaps = correctiveActions.filter(c => prodiIds.includes(c.unitId));
  const resolvedCapCount = facultyCaps.filter(c => c.status === 'Terverifikasi' || c.status === 'Selesai').length;
  const capResolutionPercent = facultyCaps.length > 0
    ? Math.round((resolvedCapCount / facultyCaps.length) * 100)
    : 85;

  // RTM records for this faculty
  const facultyRtm = rtmRecords.filter(r => r.unitId === facultyUnit.id || (r.level === 'Fakultas' && r.unitName.includes(facultyUnit.name)));

  // Is current logged in user the dean of this faculty or admin?
  const isDeanOfThisFaculty =
    currentUser.role === 'Super Admin' ||
    (isFacultyLeaderRole(currentUser.role) && currentUser.unitId === facultyUnit.id) ||
    (currentUser.role === 'Dekan' && currentUser.unitId === facultyUnit.id) ||
    (currentUser.role === 'Direktur Pascasarjana' && currentUser.unitId === facultyUnit.id);

  // Average score of prodis
  const avgProdiScore = prodis.length > 0
    ? Number((prodis.reduce((acc, p) => acc + p.qualityScore, 0) / prodis.length).toFixed(2))
    : facultyUnit.qualityScore;

  // Validation counts
  const validatedAuditsCount = facultyAudits.filter(a => a.deanValidated).length;
  const pendingValidationCount = facultyAudits.length - validatedAuditsCount;

  // Accreditation body indicator per faculty
  const accreditationAgency = facultyUnit.code === 'FAI'
    ? 'LAMBAK (Lembaga Akreditasi Mandiri Bidang Agama Kristen & Islam)'
    : facultyUnit.code === 'FIP'
    ? 'LAMDIK (Lembaga Akreditasi Mandiri Kependidikan)'
    : facultyUnit.code === 'FSTK'
    ? 'LAM-PTKes / LAM INFOKOM / BAN-PT'
    : 'BAN-PT (Program Magister)';

  const handleAiFacultyConsult = async () => {
    setIsAiLoading(true);
    try {
      const prompt = `Analisis Kinerja Mutu SPMI Permendiktisaintek 39/2025 untuk ${facultyUnit.name} UNIMEN:
- Pimpinan: ${facultyUnit.headName}
- Nilai Rata-rata Fakultas: ${avgProdiScore} dari 4.00
- Jumlah Program Studi: ${prodis.length} prodi (${prodis.map(p => p.name).join(', ')})
- Temuan: ${mayorCount} Mayor, ${minorCount} Minor, ${obsCount} Observasi
- Tingkat Penyelesaian CAP: ${capResolutionPercent}%
- Validasi Hasil AMI: ${validatedAuditsCount} dari ${facultyAudits.length} divalidasi

Berikan 3 arahan strategis prioritas bagi Dekan/Direktur untuk mempersiapkan RTM Fakultas dan akreditasi program studi (${accreditationAgency}).`;

      const response = await askAIAssistant(prompt);
      setAiAnalysis(response);
    } catch (err) {
      setAiAnalysis('Gagal memuat rekomendasi AI Fakultas.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleValidateAllProdi = () => {
    facultyAudits.forEach(audit => {
      validateAuditByDean(audit.id);
    });
  };

  const handleToggleValidation = (auditId: string) => {
    validateAuditByDean(auditId);
  };

  // Filter prodis
  const filteredProdis = prodis.filter(prodi => {
    const audit = audits.find(a => a.unitId === prodi.id);
    const matchesSearch = prodi.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prodi.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prodi.headName.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    if (statusFilter === 'need-validate') {
      return audit ? !audit.deanValidated : false;
    }
    if (statusFilter === 'validated') {
      return audit ? !!audit.deanValidated : true;
    }
    if (statusFilter === 'high-score') {
      return prodi.qualityScore >= 3.5;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Faculty Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 rounded-2xl p-6 text-white shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-emerald-200 text-xs font-semibold border border-white/10">
              <Building className="w-3.5 h-3.5" />
              <span>Dashboard Mutu Pimpinan {facultyUnit.type}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              {facultyUnit.name}
            </h1>
            <p className="text-emerald-100 text-xs leading-relaxed">
              Pimpinan: <strong>{facultyUnit.headName}</strong> | Membawahi <strong>{prodis.length} Program Studi</strong> dalam implementasi Permendiktisaintek No. 39 Tahun 2025 dan SPMI PPEPP UNIMEN.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-900/60 border border-emerald-400/30 text-emerald-200 font-medium">
                Akreditasi: {accreditationAgency}
              </span>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-teal-900/60 border border-teal-400/30 text-teal-200 font-medium">
                Status RTM Fakultas: {facultyRtm.length > 0 ? 'Terselenggara' : 'Terjadwal'}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 shrink-0">
            <button
              onClick={handleAiFacultyConsult}
              disabled={isAiLoading}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold text-xs shadow-md transition transform active:scale-95 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              {isAiLoading ? 'Menganalisis...' : 'AI Rekomendasi Dekan'}
            </button>
            <button
              onClick={() => onNavigateToTab('pengguna-fakultas')}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs shadow-md transition transform active:scale-95"
            >
              <Users className="w-4 h-4 text-emerald-700" />
              Kelola Akses Dosen & Prodi
            </button>
            <button
              onClick={() => onNavigateToTab('rtm')}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs backdrop-blur-md border border-white/20 transition"
            >
              <Users2 className="w-4 h-4" />
              RTM Tingkat {facultyUnit.type}
            </button>
          </div>
        </div>
      </div>

      {/* Role Profile & Managed Study Programs Banner */}
      {roleDefinition && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-base border border-emerald-300">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">
                    Definisi Peran: {roleDefinition.role}
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {facultyUnit.code}
                  </span>
                  {isDeanOfThisFaculty && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                      Akses Penuh Aktif
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pejabat: <strong>{roleDefinition.headName}</strong> (NIDN: {roleDefinition.headNidn}) | Email: {roleDefinition.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold text-[11px]">
                {prodis.length} Program Studi Binaan
              </span>
              <button
                onClick={() => onNavigateToTab('laporan')}
                className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold text-[11px] transition inline-flex items-center gap-1"
              >
                <FileText className="w-3.5 h-3.5" />
                Laporan Mutu
              </button>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            {roleDefinition.description}
          </p>

          {/* Managed Programs Badges */}
          <div className="pt-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Daftar Program Studi Binaan ({roleDefinition.prodiNames.length} Prodi):
            </span>
            <div className="flex flex-wrap gap-2">
              {roleDefinition.prodiNames.map((name, idx) => (
                <div
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-50 text-slate-800 text-xs font-semibold border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition cursor-default"
                >
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* AI Advisory Result Box if generated */}
      {aiAnalysis && (
        <div className="bg-gradient-to-br from-amber-50 to-emerald-50 border border-emerald-200 rounded-2xl p-5 shadow-xs space-y-2 animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Arahan Mutu Strategis untuk {facultyUnit.name}</span>
            </div>
            <button
              onClick={() => setAiAnalysis('')}
              className="text-xs text-slate-400 hover:text-slate-600 font-medium"
            >
              Tutup
            </button>
          </div>
          <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">
            {aiAnalysis}
          </p>
        </div>
      )}

      {/* Faculty KPI Cards (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Nilai Mutu Rata-Rata */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Nilai Mutu {facultyUnit.code}
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{avgProdiScore.toFixed(2)}</span>
            <span className="text-xs text-slate-400">/ 4.00</span>
          </div>
          <div className="mt-2 text-xs flex justify-between items-center text-slate-500">
            <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
              {avgProdiScore >= 3.5 ? 'Baik Sekali' : 'Baik'}
            </span>
            <span>Target: {facultyUnit.targetScore.toFixed(2)}</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
            <div
              className="bg-emerald-600 h-1.5 rounded-full"
              style={{ width: `${(avgProdiScore / 4.0) * 100}%` }}
            />
          </div>
        </div>

        {/* KPI 2: Ketercakupan Program Studi */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Program Studi Diaudit
            </span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{prodis.length}</span>
            <span className="text-xs text-slate-400 font-semibold">Prodi Aktif</span>
          </div>
          <div className="mt-2 text-xs flex justify-between items-center text-slate-500">
            <span>Validasi Dekan: {validatedAuditsCount}/{facultyAudits.length}</span>
            <span className={`font-semibold ${pendingValidationCount > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
              {pendingValidationCount > 0 ? `${pendingValidationCount} Belum` : '100% Valid'}
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden flex">
            <div
              className="bg-emerald-600 h-1.5"
              style={{ width: `${(validatedAuditsCount / (facultyAudits.length || 1)) * 100}%` }}
            />
            <div
              className="bg-amber-400 h-1.5"
              style={{ width: `${(pendingValidationCount / (facultyAudits.length || 1)) * 100}%` }}
            />
          </div>
        </div>

        {/* KPI 3: Temuan Mutu dalam Fakultas */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Temuan Audit Fakultas
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{facultyFindings.length}</span>
            <span className="text-xs text-slate-400">Butir</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] font-bold">
            <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800">{mayorCount} Mayor</span>
            <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">{minorCount} Minor</span>
            <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">{obsCount} Obs</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 flex overflow-hidden">
            <div style={{ width: `${(mayorCount / (facultyFindings.length || 1)) * 100}%` }} className="bg-rose-500" />
            <div style={{ width: `${(minorCount / (facultyFindings.length || 1)) * 100}%` }} className="bg-amber-500" />
            <div style={{ width: `${(obsCount / (facultyFindings.length || 1)) * 100}%` }} className="bg-blue-500" />
          </div>
        </div>

        {/* KPI 4: Ketercapaian CAP & Validasi */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Tindak Lanjut (CAP)
            </span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{capResolutionPercent}%</span>
            <span className="text-xs text-emerald-600 font-bold">Realisasi</span>
          </div>
          <div className="mt-2 text-xs flex justify-between items-center text-slate-500">
            <span>{resolvedCapCount} dari {facultyCaps.length || 3} CAP</span>
            <span className="font-bold text-teal-700">Telah Divalidasi</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
            <div
              className="bg-teal-600 h-1.5 rounded-full"
              style={{ width: `${capResolutionPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Dekan Quick Action Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-700" />
            Kewenangan Validasi & RTM {facultyUnit.type}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Sebagai {facultyUnit.type === 'Program Pascasarjana' ? 'Direktur Pascasarjana' : 'Dekan'}, Anda berwenang memvalidasi hasil AMI seluruh program studi binaan dan memimpin RTM tingkat fakultas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isDeanOfThisFaculty && (
            <button
              onClick={handleValidateAllProdi}
              className="px-3.5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-xs transition inline-flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              Validasi Seluruh Hasil AMI Prodi ({prodis.length})
            </button>
          )}

          <button
            onClick={() => onNavigateToTab('rtm')}
            className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition inline-flex items-center gap-1.5 shadow-xs"
          >
            <Users2 className="w-3.5 h-3.5 text-amber-300" />
            Jadwalkan RTM & Panggil Prodi {facultyUnit.code}
          </button>

          <button
            onClick={() => onNavigateToTab('laporan')}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition inline-flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5" />
            Rekap Mutu {facultyUnit.code}
          </button>
        </div>
      </div>

      {/* Program Studi Table Under this Faculty */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-emerald-700" />
              Daftar Program Studi Binaan {facultyUnit.name} ({prodis.length} Prodi)
            </h2>
            <p className="text-xs text-slate-500">
              Pantau status evaluasi audit mutu, perolehan skor, dan penuntasan temuan per program studi
            </p>
          </div>

          {/* Search & Filter Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nama/kode prodi..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-emerald-500 w-48"
              />
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-[11px]">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-bold transition ${
                  statusFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                }`}
              >
                Semua ({prodis.length})
              </button>
              <button
                onClick={() => setStatusFilter('need-validate')}
                className={`px-2.5 py-1 rounded-lg font-bold transition ${
                  statusFilter === 'need-validate' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-500'
                }`}
              >
                Perlu Validasi ({pendingValidationCount})
              </button>
              <button
                onClick={() => setStatusFilter('validated')}
                className={`px-2.5 py-1 rounded-lg font-bold transition ${
                  statusFilter === 'validated' ? 'bg-white text-teal-700 shadow-xs' : 'text-slate-500'
                }`}
              >
                Tervalidasi ({validatedAuditsCount})
              </button>
              <button
                onClick={() => setStatusFilter('high-score')}
                className={`px-2.5 py-1 rounded-lg font-bold transition ${
                  statusFilter === 'high-score' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500'
                }`}
              >
                Skor &ge; 3.5
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-3">Kode</th>
                <th className="py-3 px-3">Nama Program Studi</th>
                <th className="py-3 px-3">Ketua Program Studi</th>
                <th className="py-3 px-3 text-center">Status AMI</th>
                <th className="py-3 px-3 text-center">Skor Mutu</th>
                <th className="py-3 px-3 text-center">Target</th>
                <th className="py-3 px-3 text-center">Temuan</th>
                <th className="py-3 px-3 text-center">Validasi Dekan</th>
                <th className="py-3 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProdis.map(prodi => {
                const audit = audits.find(a => a.unitId === prodi.id);
                const isGood = prodi.qualityScore >= 3.5;
                const validated = audit ? !!audit.deanValidated : true;
                const auditStatus = audit?.status || 'Pelaksanaan';

                return (
                  <tr key={prodi.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-3 font-mono font-bold text-slate-500">
                      {prodi.code}
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-900">
                      <div>{prodi.name}</div>
                      <div className="text-[10px] text-slate-400 font-normal">
                        Fakultas: {facultyUnit.code}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {prodi.headName}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        auditStatus === 'Selesai'
                          ? 'bg-emerald-100 text-emerald-800'
                          : auditStatus === 'Review'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {auditStatus}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded-full font-bold ${
                        isGood ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {prodi.qualityScore.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center text-slate-500">
                      {prodi.targetScore.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-center font-medium">
                      <span className="text-slate-700">
                        {prodi.totalFindings} ({prodi.resolvedFindings} tuntas)
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      {isDeanOfThisFaculty && audit ? (
                        <button
                          onClick={() => handleToggleValidation(audit.id)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition inline-flex items-center gap-1 ${
                            validated
                              ? 'bg-teal-100 text-teal-800 border border-teal-200 hover:bg-teal-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-200 hover:bg-amber-200'
                          }`}
                          title={validated ? 'Klik untuk membatalkan validasi' : 'Klik untuk memvalidasi'}
                        >
                          {validated ? (
                            <>
                              <Check className="w-3 h-3" />
                              Divalidasi
                            </>
                          ) : (
                            <>
                              <ShieldCheck className="w-3 h-3" />
                              Validasi Sekarang
                            </>
                          )}
                        </button>
                      ) : (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          validated
                            ? 'bg-teal-100 text-teal-800 border border-teal-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}>
                          {validated ? '✓ Divalidasi' : 'Belum Validasi'}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => onNavigateToTab('audit')}
                        className="text-emerald-700 hover:text-emerald-900 font-bold hover:underline inline-flex items-center gap-1"
                      >
                        Detail Audit
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Matriks Pelaksanaan Siklus PPEPP untuk Fakultas Ini */}
      <MatriksPPEPP selectedFacultyId={facultyUnit.id} />
    </div>
  );
};
