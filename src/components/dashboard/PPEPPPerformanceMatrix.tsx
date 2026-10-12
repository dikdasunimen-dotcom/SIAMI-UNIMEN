import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Layers,
  Building2,
  GraduationCap,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ChevronDown,
  ChevronRight,
  Search,
  Filter,
  Eye,
  Info,
  TrendingUp,
  FileText,
  ShieldCheck,
  Download,
  Sparkles,
  Maximize2,
  X,
  Award
} from 'lucide-react';
import { PPEPPStage } from '../../types';

export interface PPEPPUnitScore {
  stage: PPEPPStage;
  percentage: number;
  status: 'Melampaui' | 'Sesuai' | 'Dalam Proses' | 'Perlu Perhatian' | 'Kritis';
  evidenceCount: number;
  totalRequiredEvidence: number;
  notes: string;
  auditFindingsCount: number;
  lastUpdated: string;
}

export interface PPEPPDetailModalData {
  unitId: string;
  unitName: string;
  unitCode: string;
  facultyName: string;
  stage: PPEPPStage;
  stageFullName: string;
  score: PPEPPUnitScore;
  indicators: {
    code: string;
    name: string;
    target: string;
    realization: string;
    status: 'Tuntas' | 'In Progress' | 'Kesenjangan';
  }[];
  documents: {
    code: string;
    title: string;
    verified: boolean;
  }[];
}

interface PPEPPPerformanceMatrixProps {
  selectedFacultyId?: string;
  className?: string;
  onNavigateToTab?: (tab: string) => void;
}

export const PPEPPPerformanceMatrix: React.FC<PPEPPPerformanceMatrixProps> = ({
  selectedFacultyId,
  className = '',
  onNavigateToTab
}) => {
  const { units, audits, findings, correctiveActions } = useApp();

  const [activeFacultyFilter, setActiveFacultyFilter] = useState<string>(selectedFacultyId || 'all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStageFocus, setSelectedStageFocus] = useState<string>('all');
  const [collapsedFaculties, setCollapsedFaculties] = useState<Record<string, boolean>>({});
  const [selectedCellDetail, setSelectedCellDetail] = useState<PPEPPDetailModalData | null>(null);
  const [viewDensity, setViewDensity] = useState<'heatmap-dense' | 'heatmap-badge'>('heatmap-badge');

  // Sync when selectedFacultyId changes externally
  React.useEffect(() => {
    if (selectedFacultyId) {
      setActiveFacultyFilter(selectedFacultyId);
    }
  }, [selectedFacultyId]);

  // Faculties & Programs
  const facultyUnits = useMemo(() => {
    return units.filter(u => u.type === 'Fakultas' || u.type === 'Program Pascasarjana');
  }, [units]);

  const allProdiUnits = useMemo(() => {
    return units.filter(u => u.type === 'Program Studi');
  }, [units]);

  // PPEPP stages definition
  const ppeppStagesList: { key: PPEPPStage; label: string; code: string; desc: string; color: string }[] = [
    {
      key: 'Penetapan',
      code: 'P1',
      label: 'Penetapan (P)',
      desc: 'Standar Mutu SPMI, SK Rektor, Target IKU/IKT 2025/2026',
      color: 'emerald'
    },
    {
      key: 'Pelaksanaan',
      code: 'P2',
      label: 'Pelaksanaan (P)',
      desc: 'Pembelajaran OBE, BKD/LKD, Riset Simlitabmas & PkM AIK',
      color: 'teal'
    },
    {
      key: 'Evaluasi',
      code: 'E',
      label: 'Evaluasi (E)',
      desc: 'Audit Mutu Internal (AMI), Desk Evaluation & Uji Lapangan',
      color: 'sky'
    },
    {
      key: 'Pengendalian',
      code: 'P3',
      label: 'Pengendalian (P)',
      desc: 'Rapat Tinjauan Manajemen (RTM) & Tindak Lanjut Temuan (PTK)',
      color: 'amber'
    },
    {
      key: 'Peningkatan',
      code: 'P4',
      label: 'Peningkatan (P)',
      desc: 'Kaji Ulang Standar, Benchmarking & Continuous Improvement',
      color: 'indigo'
    }
  ];

  // Helper calculation for deterministic PPEPP completion matrix per unit
  const computeUnitPPEPP = useMemo(() => {
    const scoresMap: Record<string, Record<PPEPPStage, PPEPPUnitScore>> = {};

    units.forEach(u => {
      const unitAudits = audits.filter(a => a.unitId === u.id);
      const unitFindings = findings.filter(f => f.unitId === u.id);
      const mayorCount = unitFindings.filter(f => f.category === 'Mayor').length;
      const minorCount = unitFindings.filter(f => f.category === 'Minor').length;
      const openFindings = unitFindings.filter(f => f.status !== 'Closed' && f.status !== 'Verified').length;

      // Base quality score factor (scale 1-4 mapped to 70-100%)
      const scoreFactor = Math.min(100, Math.max(60, Math.round(((u.qualityScore || 3.4) / 4.0) * 100)));

      // 1. Penetapan: standard establishment is universally high at UNIMEN (95-100%)
      const penetapanScore = u.type === 'Fakultas' ? 100 : Math.min(100, scoreFactor + 6);

      // 2. Pelaksanaan: OBE implementation & learning evidence (85-98%)
      const pelaksanaanScore = Math.min(100, Math.max(70, scoreFactor - (openFindings > 1 ? 4 : 0)));

      // 3. Evaluasi: AMI compliance, desk audit & field check (80-96%)
      const isAuditDone = unitAudits.some(a => a.status === 'Selesai' || a.status === 'Review');
      const evaluasiScore = isAuditDone ? Math.min(98, scoreFactor + 2) : Math.max(72, scoreFactor - 8);

      // 4. Pengendalian: RTM & resolution of findings (65-95%)
      const resolutionRatio = u.totalFindings > 0 ? (u.resolvedFindings / u.totalFindings) : 1;
      const pengendalianScore = Math.min(96, Math.max(62, Math.round(70 + resolutionRatio * 26 - mayorCount * 5)));

      // 5. Peningkatan: CQI benchmarking and standard upgrading (70-92%)
      const peningkatanScore = Math.min(95, Math.max(65, Math.round(scoreFactor - 6 + (u.qualityScore >= 3.55 ? 5 : 0))));

      const getStatusLabel = (val: number): PPEPPUnitScore['status'] => {
        if (val >= 95) return 'Melampaui';
        if (val >= 85) return 'Sesuai';
        if (val >= 75) return 'Dalam Proses';
        if (val >= 65) return 'Perlu Perhatian';
        return 'Kritis';
      };

      scoresMap[u.id] = {
        Penetapan: {
          stage: 'Penetapan',
          percentage: penetapanScore,
          status: getStatusLabel(penetapanScore),
          evidenceCount: 12,
          totalRequiredEvidence: 12,
          notes: 'Standar SPMI telah disahkan melalui SK Rektor UNIMEN & diselaraskan dengan SN-Dikti 2025.',
          auditFindingsCount: 0,
          lastUpdated: '15 Jan 2026'
        },
        Pelaksanaan: {
          stage: 'Pelaksanaan',
          percentage: pelaksanaanScore,
          status: getStatusLabel(pelaksanaanScore),
          evidenceCount: u.type === 'Fakultas' ? 24 : 18,
          totalRequiredEvidence: u.type === 'Fakultas' ? 25 : 20,
          notes: 'Implementasi RPS OBE, presensi digital, dan pemantauan BKD dosen semester berjalan.',
          auditFindingsCount: minorCount,
          lastUpdated: '02 Feb 2026'
        },
        Evaluasi: {
          stage: 'Evaluasi',
          percentage: evaluasiScore,
          status: getStatusLabel(evaluasiScore),
          evidenceCount: 16,
          totalRequiredEvidence: 18,
          notes: 'Asesmen kecukupan instrumen AMI dan verifikasi bukti sahih oleh tim auditor internal.',
          auditFindingsCount: unitFindings.length,
          lastUpdated: '18 Feb 2026'
        },
        Pengendalian: {
          stage: 'Pengendalian',
          percentage: pengendalianScore,
          status: getStatusLabel(pengendalianScore),
          evidenceCount: u.resolvedFindings,
          totalRequiredEvidence: Math.max(1, u.totalFindings),
          notes: `${u.resolvedFindings} dari ${u.totalFindings} butir temuan telah diverifikasi tindakan koreksinya (CAP).`,
          auditFindingsCount: openFindings,
          lastUpdated: '25 Feb 2026'
        },
        Peningkatan: {
          stage: 'Peningkatan',
          percentage: peningkatanScore,
          status: getStatusLabel(peningkatanScore),
          evidenceCount: 8,
          totalRequiredEvidence: 10,
          notes: 'Penyusunan baseline standar baru dan program pembinaan unggul berbasis riset agropreneurship.',
          auditFindingsCount: 0,
          lastUpdated: '01 Mar 2026'
        }
      };
    });

    return scoresMap;
  }, [units, audits, findings]);

  // Color coding function for heatmap cells
  const getHeatmapColor = (percentage: number) => {
    if (percentage >= 95) {
      return {
        bg: 'bg-emerald-600',
        badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
        text: 'text-white',
        border: 'border-emerald-700',
        label: 'Melampaui Standar (≥95%)',
        accent: 'from-emerald-600 to-emerald-700'
      };
    }
    if (percentage >= 85) {
      return {
        bg: 'bg-emerald-500',
        badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        text: 'text-white',
        border: 'border-emerald-600',
        label: 'Memenuhi Standar (85-94%)',
        accent: 'from-emerald-500 to-teal-600'
      };
    }
    if (percentage >= 75) {
      return {
        bg: 'bg-teal-500',
        badgeBg: 'bg-teal-50 text-teal-700 border-teal-200',
        text: 'text-white',
        border: 'border-teal-600',
        label: 'Sesuai Target (75-84%)',
        accent: 'from-teal-500 to-sky-600'
      };
    }
    if (percentage >= 65) {
      return {
        bg: 'bg-amber-400',
        badgeBg: 'bg-amber-50 text-amber-900 border-amber-300',
        text: 'text-slate-900',
        border: 'border-amber-500',
        label: 'Perlu Perhatian (65-74%)',
        accent: 'from-amber-400 to-amber-500'
      };
    }
    return {
      bg: 'bg-rose-500',
      badgeBg: 'bg-rose-50 text-rose-800 border-rose-300',
      text: 'text-white',
      border: 'border-rose-600',
      label: 'Kritis / Mayor (<65%)',
      accent: 'from-rose-500 to-red-600'
    };
  };

  // Toggle faculty collapse
  const toggleFacultyCollapse = (facultyId: string) => {
    setCollapsedFaculties(prev => ({
      ...prev,
      [facultyId]: !prev[facultyId]
    }));
  };

  // Filtered data
  const filteredFaculties = useMemo(() => {
    if (activeFacultyFilter === 'all') return facultyUnits;
    return facultyUnits.filter(f => f.id === activeFacultyFilter);
  }, [facultyUnits, activeFacultyFilter]);

  // Overall university averages per stage
  const universityStageAverages = useMemo(() => {
    const averages: Record<PPEPPStage, { avg: number; count: number }> = {
      Penetapan: { avg: 0, count: 0 },
      Pelaksanaan: { avg: 0, count: 0 },
      Evaluasi: { avg: 0, count: 0 },
      Pengendalian: { avg: 0, count: 0 },
      Peningkatan: { avg: 0, count: 0 }
    };

    allProdiUnits.forEach(p => {
      const scoreObj = computeUnitPPEPP[p.id];
      if (scoreObj) {
        ppeppStagesList.forEach(st => {
          averages[st.key].avg += scoreObj[st.key]?.percentage || 0;
          averages[st.key].count += 1;
        });
      }
    });

    return {
      Penetapan: Math.round(averages.Penetapan.avg / (averages.Penetapan.count || 1)),
      Pelaksanaan: Math.round(averages.Pelaksanaan.avg / (averages.Pelaksanaan.count || 1)),
      Evaluasi: Math.round(averages.Evaluasi.avg / (averages.Evaluasi.count || 1)),
      Pengendalian: Math.round(averages.Pengendalian.avg / (averages.Pengendalian.count || 1)),
      Peningkatan: Math.round(averages.Peningkatan.avg / (averages.Peningkatan.count || 1))
    };
  }, [allProdiUnits, computeUnitPPEPP]);

  // Handle cell click to open detail
  const handleCellClick = (unit: typeof units[0], stage: PPEPPStage) => {
    const parentFaculty = facultyUnits.find(f => f.id === unit.parentUnitId) || unit;
    const score = computeUnitPPEPP[unit.id]?.[stage] || {
      stage,
      percentage: 85,
      status: 'Sesuai',
      evidenceCount: 10,
      totalRequiredEvidence: 12,
      notes: 'Data siklus operasional standar.',
      auditFindingsCount: 0,
      lastUpdated: 'Feb 2026'
    };

    const stageMeta = ppeppStagesList.find(s => s.key === stage);

    // Mock high-standard indicators based on stage
    const sampleIndicators = [
      {
        code: `IND-${stage.substring(0, 3).toUpperCase()}-01`,
        name: `Kepatuhan Pemenuhan Standar Mutu ${stage}`,
        target: '100% Sesuai Kriteria SN-Dikti & Rencana Strategis UNIMEN',
        realization: `${score.percentage}% Terpenuhi Sah`,
        status: (score.percentage >= 85 ? 'Tuntas' : score.percentage >= 70 ? 'In Progress' : 'Kesenjangan') as 'Tuntas' | 'In Progress' | 'Kesenjangan'
      },
      {
        code: `IND-${stage.substring(0, 3).toUpperCase()}-02`,
        name: 'Kelengkapan Dokumen Portofolio & Bukti Fisik / Digital',
        target: `${score.totalRequiredEvidence} Dokumen Utama Valid`,
        realization: `${score.evidenceCount} Dokumen Terverifikasi Tim Asesor`,
        status: (score.evidenceCount >= score.totalRequiredEvidence ? 'Tuntas' : 'In Progress') as 'Tuntas' | 'In Progress' | 'Kesenjangan'
      },
      {
        code: `IND-${stage.substring(0, 3).toUpperCase()}-03`,
        name: 'Tindak Lanjut Rekomendasi Auditor & Evaluasi Berkala',
        target: 'Zero Critical Findings / 100% Tindak Lanjut Terjadwal',
        realization: score.auditFindingsCount === 0 ? 'Nihil Kesenjangan Mayor' : `${score.auditFindingsCount} Butir Perbaikan Dalam Proses`,
        status: (score.auditFindingsCount === 0 ? 'Tuntas' : 'Kesenjangan') as 'Tuntas' | 'In Progress' | 'Kesenjangan'
      }
    ];

    const sampleDocuments = [
      { code: `DOC-${stage.substring(0, 3).toUpperCase()}-01`, title: `Surat Pengesahan Standar & Panduan Mutu ${stage} UNIMEN`, verified: true },
      { code: `DOC-${stage.substring(0, 3).toUpperCase()}-02`, title: `Berita Acara Pelaksanaan Siklus & Verifikasi Lapangan`, verified: score.percentage >= 75 },
      { code: `DOC-${stage.substring(0, 3).toUpperCase()}-03`, title: `Laporan Hasil Evaluasi Diri & Analisis Ketercapaian IKU`, verified: score.percentage >= 85 },
      { code: `DOC-${stage.substring(0, 3).toUpperCase()}-04`, title: `Matriks Pengendalian Tindak Lanjut CAP & Verifikasi GKM/UJM`, verified: score.percentage >= 90 }
    ];

    setSelectedCellDetail({
      unitId: unit.id,
      unitName: unit.name,
      unitCode: unit.code,
      facultyName: parentFaculty.name,
      stage,
      stageFullName: stageMeta?.label || stage,
      score,
      indicators: sampleIndicators,
      documents: sampleDocuments
    });
  };

  return (
    <div className={`bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden ${className}`}>
      {/* Header Panel */}
      <div className="p-5 sm:p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-emerald-50/20">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-700 to-teal-800 text-amber-300 flex items-center justify-center shadow-xs">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                    Matriks Kinerja Siklus PPEPP
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Heatmap Interaktif
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Visualisasi capaian 5 pilar SPMI (Penetapan, Pelaksanaan, Evaluasi, Pengendalian, Peningkatan) per Fakultas & Program Studi UNIMEN
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions & View Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Toggle */}
            <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-xs font-medium">
              <button
                onClick={() => setViewDensity('heatmap-badge')}
                className={`px-2.5 py-1 rounded-md transition ${
                  viewDensity === 'heatmap-badge'
                    ? 'bg-white text-slate-900 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Tampilkan Nilai & Status"
              >
                Tampilan Detail
              </button>
              <button
                onClick={() => setViewDensity('heatmap-dense')}
                className={`px-2.5 py-1 rounded-md transition ${
                  viewDensity === 'heatmap-dense'
                    ? 'bg-white text-slate-900 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Tampilan Heatmap Ringkas"
              >
                Heatmap Murni
              </button>
            </div>

            {/* Stage Focus Selector */}
            <select
              value={selectedStageFocus}
              onChange={(e) => setSelectedStageFocus(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Fokus: Seluruh 5 Siklus</option>
              {ppeppStagesList.map(st => (
                <option key={st.key} value={st.key}>Fokus: {st.label}</option>
              ))}
            </select>

            {/* Quick Export Hint */}
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-medium flex items-center gap-1.5 shadow-xs"
              title="Cetak matriks PPEPP"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Cetak / Ekspor</span>
            </button>
          </div>
        </div>

        {/* 5-Pillar Campus-Wide Progress Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 mt-5">
          {ppeppStagesList.map((st) => {
            const avg = universityStageAverages[st.key];
            const colorInfo = getHeatmapColor(avg);
            const isFocused = selectedStageFocus === 'all' || selectedStageFocus === st.key;

            return (
              <div
                key={st.key}
                onClick={() => setSelectedStageFocus(selectedStageFocus === st.key ? 'all' : st.key)}
                className={`cursor-pointer rounded-xl p-3 border transition ${
                  isFocused
                    ? 'bg-white border-slate-200 shadow-xs ring-1 ring-emerald-500/30'
                    : 'bg-slate-50/70 border-slate-200/60 opacity-60 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-md bg-emerald-700 text-amber-300 text-[11px] font-extrabold flex items-center justify-center">
                      {st.code}
                    </span>
                    <span className="font-bold text-slate-800 truncate">{st.key}</span>
                  </div>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${colorInfo.badgeBg}`}>
                    {avg}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${colorInfo.accent} transition-all duration-500`}
                    style={{ width: `${avg}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1.5 truncate" title={st.desc}>
                  {st.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Filter bar: Faculty tabs + search input */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-5 pt-4 border-t border-slate-100">
          {/* Faculty Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setActiveFacultyFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                activeFacultyFilter === 'all'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Semua Unit ({allProdiUnits.length} Prodi)
            </button>
            {facultyUnits.map(f => {
              const isSelected = activeFacultyFilter === f.id;
              const prodiCount = allProdiUnits.filter(p => p.parentUnitId === f.id).length;
              return (
                <button
                  key={f.id}
                  onClick={() => setActiveFacultyFilter(f.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span>{f.code}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {prodiCount}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Prodi */}
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari program studi atau kaprodi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Heatmap Legend */}
      <div className="px-5 py-2.5 bg-slate-50/80 border-b border-slate-200/80 flex flex-wrap items-center justify-between text-[11px] gap-2">
        <div className="flex items-center gap-1.5 font-bold text-slate-700">
          <Info className="w-3.5 h-3.5 text-emerald-700" />
          <span>Panduan Skala Warna Heatmap Mutu:</span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-600 border border-emerald-700 inline-block" />
            <span className="text-slate-700 font-medium">≥ 95% (Melampaui Standar)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-500 border border-emerald-600 inline-block" />
            <span className="text-slate-700 font-medium">85 - 94% (Memenuhi Standar)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-teal-500 border border-teal-600 inline-block" />
            <span className="text-slate-700 font-medium">75 - 84% (Sesuai Target)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-amber-400 border border-amber-500 inline-block" />
            <span className="text-slate-700 font-medium">65 - 74% (Perlu Perhatian)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-rose-500 border border-rose-600 inline-block" />
            <span className="text-slate-700 font-medium">&lt; 65% (Kritis / Mayor)</span>
          </div>
        </div>
        <span className="text-[10px] text-slate-400 italic">
          *Klik sel untuk rincian indikator & bukti
        </span>
      </div>

      {/* Main Heatmap Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100/80 text-[11px] font-bold text-slate-700 border-b border-slate-200">
              <th className="py-3 px-4 w-72 min-w-[280px]">Unit Kerja (Fakultas / Program Studi)</th>
              <th className="py-3 px-3 w-28 text-center">Akreditasi / IPK</th>
              {ppeppStagesList
                .filter(st => selectedStageFocus === 'all' || selectedStageFocus === st.key)
                .map(st => (
                  <th key={st.key} className="py-3 px-2 text-center min-w-[130px]">
                    <div className="flex flex-col items-center">
                      <span className="font-extrabold text-slate-900">{st.label}</span>
                      <span className="text-[10px] font-normal text-slate-500">{st.code}</span>
                    </div>
                  </th>
                ))}
              <th className="py-3 px-3 w-28 text-center">Indeks PPEPP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {filteredFaculties.map(faculty => {
              const isCollapsed = collapsedFaculties[faculty.id] || false;
              const facultyScores = computeUnitPPEPP[faculty.id];
              const facultyProdis = allProdiUnits.filter(p => {
                const matchParent = p.parentUnitId === faculty.id;
                const matchQuery =
                  searchQuery === '' ||
                  p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  p.headName.toLowerCase().includes(searchQuery.toLowerCase());
                return matchParent && matchQuery;
              });

              // Average score of this faculty
              const facultyAvgPPEPP = Math.round(
                ppeppStagesList.reduce((acc, st) => acc + (facultyScores?.[st.key]?.percentage || 0), 0) /
                  ppeppStagesList.length
              );

              return (
                <React.Fragment key={faculty.id}>
                  {/* Faculty Header Row */}
                  <tr className="bg-slate-50 hover:bg-slate-100/90 transition border-y-2 border-slate-200/80 font-bold">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => toggleFacultyCollapse(faculty.id)}
                          className="flex items-center gap-2 text-left group"
                        >
                          <span className="p-1 rounded bg-slate-200 text-slate-600 group-hover:bg-emerald-700 group-hover:text-white transition">
                            {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-emerald-700" />
                              <span className="text-slate-900 font-extrabold">{faculty.name}</span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                                {faculty.code}
                              </span>
                            </div>
                            <span className="text-[11px] font-normal text-slate-500">
                              Pimpinan: {faculty.headName} • {facultyProdis.length} Program Studi
                            </span>
                          </div>
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex flex-col items-center">
                        <span className="font-extrabold text-emerald-800 text-xs">
                          {faculty.qualityScore.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold">Skala 4.00</span>
                      </div>
                    </td>

                    {/* Faculty Heatmap Cells */}
                    {ppeppStagesList
                      .filter(st => selectedStageFocus === 'all' || selectedStageFocus === st.key)
                      .map(st => {
                        const score = facultyScores?.[st.key] || {
                          stage: st.key,
                          percentage: 90,
                          status: 'Sesuai',
                          evidenceCount: 10,
                          totalRequiredEvidence: 10,
                          notes: '',
                          auditFindingsCount: 0,
                          lastUpdated: ''
                        };
                        const colorInfo = getHeatmapColor(score.percentage);

                        return (
                          <td key={st.key} className="py-2 px-2 text-center">
                            <button
                              onClick={() => handleCellClick(faculty, st.key)}
                              className={`w-full py-2 px-2.5 rounded-lg transition-transform hover:scale-105 shadow-2xs flex flex-col items-center justify-center cursor-pointer border ${colorInfo.bg} ${colorInfo.text} ${colorInfo.border}`}
                              title={`Klik untuk detail ${faculty.name} - ${st.label}: ${score.percentage}%`}
                            >
                              <span className="font-extrabold text-sm">{score.percentage}%</span>
                              {viewDensity === 'heatmap-badge' && (
                                <span className="text-[10px] font-semibold opacity-90 truncate max-w-full">
                                  {score.status}
                                </span>
                              )}
                            </button>
                          </td>
                        );
                      })}

                    {/* Faculty Overall PPEPP Index */}
                    <td className="py-3 px-3 text-center">
                      <div className="inline-flex flex-col items-center px-2 py-1 rounded-lg bg-emerald-100 text-emerald-900 border border-emerald-300">
                        <span className="font-extrabold text-xs">{facultyAvgPPEPP}%</span>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-800">
                          {facultyAvgPPEPP >= 90 ? 'Unggul' : 'Baik Sekali'}
                        </span>
                      </div>
                    </td>
                  </tr>

                  {/* Study Program Rows (if not collapsed) */}
                  {!isCollapsed && facultyProdis.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-4 px-6 text-center text-xs text-slate-400 italic">
                        Tidak ada program studi yang cocok dengan pencarian di fakultas ini.
                      </td>
                    </tr>
                  )}

                  {!isCollapsed &&
                    facultyProdis.map(prodi => {
                      const prodiScores = computeUnitPPEPP[prodi.id];
                      const prodiAvgPPEPP = Math.round(
                        ppeppStagesList.reduce((acc, st) => acc + (prodiScores?.[st.key]?.percentage || 0), 0) /
                          ppeppStagesList.length
                      );

                      return (
                        <tr key={prodi.id} className="hover:bg-emerald-50/20 transition group">
                          {/* Unit Title */}
                          <td className="py-2.5 px-4 pl-10 border-r border-slate-100">
                            <div className="flex items-start gap-2">
                              <GraduationCap className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                              <div>
                                <div className="font-semibold text-slate-800 group-hover:text-emerald-800 transition">
                                  {prodi.name}
                                </div>
                                <div className="text-[11px] text-slate-400">
                                  Kaprodi: {prodi.headName} • <span className="font-mono">{prodi.code}</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Quality Score & Status */}
                          <td className="py-2 px-3 text-center border-r border-slate-100">
                            <span className="inline-block px-2 py-0.5 rounded font-extrabold text-slate-800 bg-slate-100 text-xs">
                              {prodi.qualityScore.toFixed(2)}
                            </span>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              {prodi.totalFindings > 0 ? (
                                <span className="text-amber-600 font-semibold">{prodi.totalFindings} Temuan</span>
                              ) : (
                                <span className="text-emerald-600 font-semibold">Nihil Temuan</span>
                              )}
                            </div>
                          </td>

                          {/* Heatmap Columns for 5 Stages */}
                          {ppeppStagesList
                            .filter(st => selectedStageFocus === 'all' || selectedStageFocus === st.key)
                            .map(st => {
                              const score = prodiScores?.[st.key] || {
                                stage: st.key,
                                percentage: 80,
                                status: 'Sesuai',
                                evidenceCount: 5,
                                totalRequiredEvidence: 6,
                                notes: '',
                                auditFindingsCount: 0,
                                lastUpdated: ''
                              };
                              const colorInfo = getHeatmapColor(score.percentage);

                              return (
                                <td key={st.key} className="py-1.5 px-2 text-center">
                                  <button
                                    onClick={() => handleCellClick(prodi, st.key)}
                                    className={`w-full py-1.5 px-2 rounded-md transition-all hover:scale-105 hover:shadow-sm cursor-pointer flex flex-col items-center justify-center border ${colorInfo.bg} ${colorInfo.text} ${colorInfo.border}`}
                                    title={`Klik untuk detail ${prodi.name} - ${st.label}: ${score.percentage}% (${score.status})`}
                                  >
                                    <span className="font-bold text-xs">{score.percentage}%</span>
                                    {viewDensity === 'heatmap-badge' && (
                                      <span className="text-[9px] font-medium opacity-90 truncate max-w-full">
                                        {score.status}
                                      </span>
                                    )}
                                  </button>
                                </td>
                              );
                            })}

                          {/* Aggregate PPEPP Column */}
                          <td className="py-2 px-3 text-center border-l border-slate-100">
                            <div className="flex flex-col items-center">
                              <span className="font-bold text-slate-800 text-xs">{prodiAvgPPEPP}%</span>
                              <div className="w-16 bg-slate-200 rounded-full h-1 mt-1 overflow-hidden">
                                <div
                                  className={`h-full ${
                                    prodiAvgPPEPP >= 90
                                      ? 'bg-emerald-600'
                                      : prodiAvgPPEPP >= 80
                                      ? 'bg-teal-600'
                                      : 'bg-amber-500'
                                  }`}
                                  style={{ width: `${prodiAvgPPEPP}%` }}
                                />
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Heatmap Footer Statistics and Quick Notes */}
      <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-600 gap-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <span>
            Berdasarkan Standar SPMI UNIMEN Sesuai Permendiktisaintek No. 39 Tahun 2025 & SN-Dikti
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span>Total Program Studi Aktif: <strong className="text-slate-900">{allProdiUnits.length} Unit</strong></span>
          <span className="text-slate-300">|</span>
          <span>Rerata Capaian Universitas: <strong className="text-emerald-700">89.4% (Baik Sekali)</strong></span>
        </div>
      </div>

      {/* Interactive Modal / Drawer for Cell Detail */}
      {selectedCellDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-400 text-slate-950">
                    {selectedCellDetail.stageFullName}
                  </span>
                  <span className="text-xs text-emerald-200 font-mono">
                    {selectedCellDetail.unitCode}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white">
                  {selectedCellDetail.unitName}
                </h3>
                <p className="text-xs text-emerald-200/80 mt-0.5">
                  Fakultas: {selectedCellDetail.facultyName}
                </p>
              </div>
              <button
                onClick={() => setSelectedCellDetail(null)}
                className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-slate-800">
              {/* Score Highlight Card */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <div className="text-xs text-slate-500 font-semibold">Tingkat Capaian Standar</div>
                  <div className="text-2xl font-black text-slate-900 mt-0.5 flex items-baseline gap-2">
                    <span>{selectedCellDetail.score.percentage}%</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${getHeatmapColor(selectedCellDetail.score.percentage).badgeBg}`}>
                      {selectedCellDetail.score.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {selectedCellDetail.score.notes}
                  </div>
                </div>
                <div className="text-right border-l border-slate-200 pl-4">
                  <div className="text-xs text-slate-500 font-semibold">Bukti Terverifikasi</div>
                  <div className="text-base font-bold text-emerald-700 mt-0.5">
                    {selectedCellDetail.score.evidenceCount} / {selectedCellDetail.score.totalRequiredEvidence} Dokumen
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Update: {selectedCellDetail.score.lastUpdated}
                  </div>
                </div>
              </div>

              {/* Indikator SPMI Breakdown */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-emerald-700" />
                  Rincian Indikator Standar Mutu ({selectedCellDetail.stage})
                </h4>
                <div className="space-y-2">
                  {selectedCellDetail.indicators.map((ind) => (
                    <div key={ind.code} className="p-3 rounded-lg border border-slate-200/90 bg-white hover:bg-slate-50/50 transition text-xs">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span className="font-mono text-[10px] px-1 py-0.5 bg-slate-100 rounded text-slate-600">
                              {ind.code}
                            </span>
                            <span>{ind.name}</span>
                          </div>
                          <div className="text-slate-500 mt-1 text-[11px]">
                            <strong>Target:</strong> {ind.target}
                          </div>
                          <div className="text-slate-700 mt-0.5 text-[11px]">
                            <strong>Realisasi:</strong> {ind.realization}
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                          ind.status === 'Tuntas'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ind.status === 'In Progress'
                            ? 'bg-sky-100 text-sky-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {ind.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dokumen Portofolio & Bukti */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-700" />
                  Dokumen Pendukung Siklus Terdaftar
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {selectedCellDetail.documents.map((doc) => (
                    <div key={doc.code} className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/60 flex items-center justify-between">
                      <div className="truncate pr-2">
                        <span className="font-mono text-[10px] text-slate-500 block">{doc.code}</span>
                        <span className="font-medium text-slate-800 truncate block">{doc.title}</span>
                      </div>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        doc.verified ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {doc.verified ? 'Sah' : 'Pending'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Audit Mutu Internal Universitas Muhammadiyah Enrekang
              </span>
              <div className="flex items-center gap-2">
                {onNavigateToTab && (
                  <button
                    onClick={() => {
                      setSelectedCellDetail(null);
                      onNavigateToTab('audit');
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-700 text-white hover:bg-emerald-800 transition"
                  >
                    Buka Modul AMI
                  </button>
                )}
                <button
                  onClick={() => setSelectedCellDetail(null)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 transition"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
