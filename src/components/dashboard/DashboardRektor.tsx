import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Award,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Users2,
  FileCheck2,
  FileText,
  Calendar,
  Building,
  GraduationCap,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Download,
  ExternalLink,
  DollarSign,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { ExportAMIPDFModal } from '../reports/ExportAMIPDFModal';
import { DokumenResmiRTMModal } from '../rtm/DokumenResmiRTMModal';
import { RTMRecord } from '../../types';

interface DashboardRektorProps {
  onNavigateToTab: (tab: string) => void;
  onOpenAI: () => void;
}

export const DashboardRektor: React.FC<DashboardRektorProps> = ({ onNavigateToTab, onOpenAI }) => {
  const {
    units,
    findings,
    correctiveActions,
    rtmRecords,
    currentUser,
    generateExecutiveSummaryWithAI,
    updateRTMRecord
  } = useApp();

  const [isExportPdfOpen, setIsExportPdfOpen] = useState(false);
  const [selectedRtmRecord, setSelectedRtmRecord] = useState<RTMRecord | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiPolicyBrief, setAiPolicyBrief] = useState<string>('');
  const [selectedFacultyFilter, setSelectedFacultyFilter] = useState<string>('all');

  // University Unit
  const univUnit = units.find(u => u.type === 'Universitas') || units[0];
  const facultyUnits = units.filter(u => u.type === 'Fakultas' || u.type === 'Program Pascasarjana');
  const prodiUnits = units.filter(u => u.type === 'Program Studi');

  // University Findings
  const totalFindings = findings.length;
  const mayorFindings = findings.filter(f => f.category === 'Mayor');
  const minorFindings = findings.filter(f => f.category === 'Minor');
  const obsFindings = findings.filter(f => f.category === 'Observasi');

  // Corrective Actions
  const totalCaps = correctiveActions.length;
  const verifiedCaps = correctiveActions.filter(c => c.status === 'Terverifikasi' || c.status === 'Selesai');
  const capResolutionPercent = totalCaps > 0 ? Math.round((verifiedCaps.length / totalCaps) * 100) : 80;

  // University RTM Records
  const univRtmRecords = rtmRecords.filter(r => r.level === 'Universitas');
  const pendingRtmSignatures = rtmRecords.filter(r => r.sessionStatus !== 'Selesai');

  // Generate Policy Brief with AI
  const handleGeneratePolicyBrief = async () => {
    setIsAiLoading(true);
    try {
      const brief = await generateExecutiveSummaryWithAI({
        programName: 'Briefing Kebijakan Rektorat UNIMEN 2025/2026',
        year: '2025/2026',
        universityAverage: univUnit.qualityScore,
        totalFindings,
        mayorCount: mayorFindings.length,
        minorCount: minorFindings.length,
        obsCount: obsFindings.length,
        unitData: facultyUnits.map(f => ({ name: f.name, score: f.qualityScore }))
      });
      setAiPolicyBrief(brief);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Sign RTM as Rector
  const handleRatifyRtm = (record: RTMRecord) => {
    updateRTMRecord(record.id, {
      sessionStatus: 'Selesai',
      status: 'Disetujui',
      evaluationOutcome: {
        overallStatus: 'Memuaskan',
        leadershipDirective: `Disahkan oleh Rektor UNIMEN Dr. Drs. Syawal Sitonda, M.Ag. pada ${new Date().toLocaleDateString('id-ID')}`
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Executive Rector Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-emerald-950 text-white rounded-2xl p-6 shadow-xl border border-indigo-900/40">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-300/40 text-amber-300 text-xs font-bold mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Dashboard Eksekutif Rektorat • Pimpinan Sidang Mutu Tertinggi</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">
              Kinerja Penjaminan Mutu Internal UNIMEN
            </h1>
            <p className="mt-1.5 text-xs md:text-sm text-slate-300 leading-relaxed">
              Otoritas pengesahan Berita Acara RTM, evaluasi capaian 20 Program Studi di bawah 4 Fakultas & Pascasarjana, serta penetapan kebijakan tindak lanjut Permendiktisaintek No. 39 Tahun 2025.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-300">
              <span><strong>Rektor:</strong> Dr. Drs. Syawal Sitonda, M.Ag.</span>
              <span className="text-slate-500">•</span>
              <span><strong>NIDN:</strong> 0015086401</span>
              <span className="text-slate-500">•</span>
              <span><strong>Periode Audit:</strong> TA 2025/2026 Genap</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 shrink-0">
            <button
              onClick={() => onNavigateToTab('rtm')}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition transform active:scale-95"
            >
              <Users2 className="w-4 h-4" />
              <span>Sidang RTM & Panggil Prodi</span>
            </button>
            <button
              onClick={() => setIsExportPdfOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition active:scale-95"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Ekspor Laporan Rektor (PDF)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top 4 Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Skor Mutu Institusi</span>
            <div className="p-2 bg-emerald-50 rounded-xl text-emerald-700">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{univUnit.qualityScore.toFixed(2)}</span>
            <span className="text-xs font-semibold text-slate-400">/ target {univUnit.targetScore.toFixed(2)}</span>
          </div>
          <div className="mt-2 text-xs font-semibold text-emerald-700 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Kategori Sangat Baik (Predikat Unggul)</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Program Studi Terakreditasi</span>
            <div className="p-2 bg-blue-50 rounded-xl text-blue-700">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{prodiUnits.length}</span>
            <span className="text-xs font-semibold text-slate-400">Prodi (4 Fakultas/Pasca)</span>
          </div>
          <div className="mt-2 text-xs font-semibold text-blue-700 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>100% Mengimplementasikan PPEPP</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Temuan Audit Butuh Intervensi</span>
            <div className="p-2 bg-rose-50 rounded-xl text-rose-700">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-rose-600">{mayorFindings.length}</span>
            <span className="text-xs font-semibold text-slate-500">Mayor ({totalFindings} Total)</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1">
            <span>Minor: <strong>{minorFindings.length}</strong></span>
            <span>•</span>
            <span>Observasi: <strong>{obsFindings.length}</strong></span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Penyelesaian PTK & RTM</span>
            <div className="p-2 bg-purple-50 rounded-xl text-purple-700">
              <FileCheck2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{capResolutionPercent}%</span>
            <span className="text-xs font-semibold text-slate-400">({verifiedCaps.length}/{totalCaps})</span>
          </div>
          <div className="mt-2 text-xs font-semibold text-purple-700 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Dokumen Terverifikasi Tim LPM</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Faculty Aggregation & Rector RTM Approval Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Faculty Quality Matrix & Action Allocation */}
        <div className="lg:col-span-7 space-y-6">
          {/* Faculty Performance Comparison */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Building className="w-4 h-4 text-emerald-700" />
                  <span>Capaian Mutu Fakultas & Program Pascasarjana</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Rekapitulasi nilai audit SPMI berdasarkan pimpinan fakultas masing-masing.
                </p>
              </div>
              <button
                onClick={() => onNavigateToTab('laporan')}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                <span>Lihat Laporan Lengkap</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {facultyUnits.map(fac => {
                const facProdis = prodiUnits.filter(p => p.parentUnitId === fac.id);
                const facFindings = findings.filter(f => facProdis.map(p => p.id).includes(f.unitId));
                const facMayor = facFindings.filter(f => f.category === 'Mayor').length;

                return (
                  <div
                    key={fac.id}
                    className="p-4 rounded-xl border border-slate-200 hover:border-emerald-500 bg-slate-50/50 hover:bg-white transition space-y-2 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900">{fac.code}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        fac.qualityScore >= 3.5 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        Skor: {fac.qualityScore.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-800 line-clamp-1">{fac.name}</p>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Pimpinan: <strong>{fac.headName}</strong>
                    </p>
                    <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-600">
                      <span>{facProdis.length} Program Studi</span>
                      <span className={facMayor > 0 ? 'text-rose-600 font-bold' : 'text-emerald-700 font-semibold'}>
                        {facMayor > 0 ? `${facMayor} Temuan Mayor` : 'Nihil Mayor'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Strategic Policy Brief for Rector */}
          <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-emerald-950 p-6 rounded-2xl text-white shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-300" />
                <h3 className="text-sm font-bold">Rekomendasi Kebijakan Mutu Rektorat (Gemini AI)</h3>
              </div>
              <button
                onClick={handleGeneratePolicyBrief}
                disabled={isAiLoading}
                className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-900 rounded-lg text-xs font-bold flex items-center gap-1.5 transition disabled:opacity-50"
              >
                <span>{isAiLoading ? 'Menganalisis...' : 'Analisis Kebijakan'}</span>
              </button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {aiPolicyBrief || 'Klik tombol di atas untuk menganalisis temuan audit di 20 program studi secara otomatis dan menghasilkan telaah staf strategis untuk pengambilan keputusan pimpinan universitas.'}
            </p>
          </div>
        </div>

        {/* Right Column: RTM Ratification & Rector Signature Queue */}
        <div className="lg:col-span-5 space-y-6">
          {/* Rector RTM Ratification Box */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-emerald-700" />
                  <span>Antrian Pengesahan Berita Acara RTM</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Dokumen evaluasi tingkat pimpinan yang menunggu tanda tangan Rektor.
                </p>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                {rtmRecords.length} Sesi Terdata
              </span>
            </div>

            <div className="space-y-3">
              {rtmRecords.slice(0, 4).map(rec => {
                const isRatified = rec.sessionStatus === 'Selesai' || rec.status === 'Disetujui';

                return (
                  <div
                    key={rec.id}
                    className="p-3.5 rounded-xl border border-slate-200 hover:border-emerald-400 bg-slate-50/60 hover:bg-white transition space-y-2 shadow-2xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          No: {rec.meetingNumber || 'RTM-UNIMEN'}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900">{rec.agenda}</h4>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                        isRatified
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {isRatified ? 'Disahkan' : 'Menunggu Rektor'}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 line-clamp-2">
                      Fokus: {rec.discussionSummary || 'Evaluasi tindak lanjut temuan audit prodi terpanggil.'}
                    </p>

                    <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between text-xs">
                      <button
                        onClick={() => setSelectedRtmRecord(rec)}
                        className="text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1 text-[11px]"
                      >
                        <FileText className="w-3 h-3" />
                        <span>Buka Berita Acara</span>
                      </button>

                      {!isRatified && (
                        <button
                          onClick={() => handleRatifyRtm(rec)}
                          className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-[10px] shadow-xs transition"
                        >
                          Sahkan TTE Rektor
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => onNavigateToTab('rtm')}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
            >
              <span>Buka Modul Penjadwalan RTM Lengkap</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Strategic Interventions Priority Box */}
          <div className="bg-amber-50/60 p-5 rounded-2xl border border-amber-200 text-xs space-y-3">
            <h3 className="font-bold text-amber-900 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-amber-700" />
              <span>Prioritas Alokasi Anggaran Mutu Rektorat</span>
            </h3>
            <p className="text-amber-800 text-[11px] leading-relaxed">
              Berdasarkan hasil audit AMI TA 2025/2026, unit kerja berikut direkomendasikan menerima intervensi pendanaan sarana & peningkatan SDM:
            </p>
            <ul className="space-y-1.5 text-amber-900 text-[11px] font-medium">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                <span><strong>S1 Informatika (FSTK):</strong> Penguatan laboratorium komputasi & akreditasi LAM-INFOKOM.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                <span><strong>S1 Teknik Sipil (FSTK):</strong> Peralatan pengujian material beton & studi lapangan.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                <span><strong>S1 Agroteknologi:</strong> Fasilitas agropreneurship komoditas unggulan Enrekang.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* RTM Document Modal */}
      {selectedRtmRecord && (
        <DokumenResmiRTMModal
          record={selectedRtmRecord}
          isOpen={!!selectedRtmRecord}
          onClose={() => setSelectedRtmRecord(null)}
        />
      )}

      {/* Export AMI PDF Modal */}
      <ExportAMIPDFModal
        isOpen={isExportPdfOpen}
        onClose={() => setIsExportPdfOpen(false)}
      />
    </div>
  );
};
