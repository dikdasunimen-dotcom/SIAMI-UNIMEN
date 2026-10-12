import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Finding, FindingCategory, FindingStatus } from '../../types';
import { ExportAMIPDFModal } from '../reports/ExportAMIPDFModal';
import {
  AlertTriangle,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  User,
  Calendar,
  Layers,
  FileCheck2,
  Plus,
  Download
} from 'lucide-react';

interface ModulTemuanProps {
  onNavigateToTab: (tab: string) => void;
}

export const ModulTemuan: React.FC<ModulTemuanProps> = ({ onNavigateToTab }) => {
  const {
    findings,
    updateFindingStatus,
    deleteFinding,
    currentUser,
    analyzeRootCauseWithAI,
    addCorrectiveAction,
    correctiveActions
  } = useApp();

  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // AI RCA modal
  const [rcaFinding, setRcaFinding] = useState<Finding | null>(null);
  const [rcaLoading, setRcaLoading] = useState<boolean>(false);
  const [rcaResult, setRcaResult] = useState<string>('');

  // CAP creation modal
  const [capFinding, setCapFinding] = useState<Finding | null>(null);
  const [capPlan, setCapPlan] = useState<string>('');
  const [capPreventive, setCapPreventive] = useState<string>('');
  const [capTargetOutput, setCapTargetOutput] = useState<string>('');
  const [capDate, setCapDate] = useState<string>('2026-05-30');
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);

  const filteredFindings = findings.filter(f => {
    const matchesCategory = categoryFilter === 'ALL' || f.category === categoryFilter;
    const matchesStatus = statusFilter === 'ALL' || f.status === statusFilter;
    const matchesSearch =
      f.findingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.problemDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.standardCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.unitName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.picName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesStatus && matchesSearch;
  });

  const handleRunRca = async (finding: Finding) => {
    setRcaFinding(finding);
    setRcaLoading(true);
    setRcaResult('');
    try {
      const res = await analyzeRootCauseWithAI({
        findingNumber: finding.findingNumber,
        standardCode: finding.standardCode,
        standardName: finding.standardName,
        problemDescription: finding.problemDescription,
        findingCategory: finding.category,
      });
      setRcaResult(res.result || res.rootCause || 'Analisis 5-Whys selesai.');
    } catch (err) {
      console.error(err);
      setRcaResult('Gagal menganalisis akar masalah secara online.');
    } finally {
      setRcaLoading(false);
    }
  };

  const handleOpenCapModal = (finding: Finding) => {
    setCapFinding(finding);
    setCapPlan(`Tindakan koreksi atas temuan ${finding.findingNumber}: ${finding.recommendation}`);
    setCapPreventive(`Tindakan preventif: Mengintegrasikan monitoring berkala pada GKM unit.`);
    setCapTargetOutput(`Dokumen perbaikan dan bukti terlaksananya rekomendasi audit.`);
    setCapDate(finding.deadline || '2026-05-30');
  };

  const handleSubmitCap = (e: React.FormEvent) => {
    e.preventDefault();
    if (!capFinding) return;

    addCorrectiveAction({
      findingId: capFinding.id,
      findingNumber: capFinding.findingNumber,
      unitId: capFinding.unitId,
      unitName: capFinding.unitName,
      correctivePlan: capPlan,
      preventivePlan: capPreventive,
      targetOutput: capTargetOutput,
      targetDate: capDate,
      progressPercent: 10,
      status: 'In Progress' as any,
    });

    setCapFinding(null);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-amber-600" />
            <h1 className="text-xl font-bold text-slate-900">
              Daftar Temuan Audit Mutu Internal (AMI)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pengelolaan ketidaksesuaian kategori <strong>Mayor</strong>, <strong>Minor</strong>, dan <strong>Observasi</strong> dilengkapi analisis akar masalah (5-Whys), mitigasi risiko akreditasi, dan rekomendasi perbaikan SMART.
          </p>
        </div>

        {/* Quick Stats Pill & Export Button */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-2xs transition active:scale-95"
          >
            <Download className="w-3.5 h-3.5 text-amber-300" />
            <span>Ekspor PDF AMI</span>
          </button>
          <span className="px-3 py-1 rounded-xl bg-rose-100 text-rose-800 border border-rose-200 text-xs font-bold">
            {findings.filter(f => f.category === 'Mayor').length} Mayor
          </span>
          <span className="px-3 py-1 rounded-xl bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold">
            {findings.filter(f => f.category === 'Minor').length} Minor
          </span>
          <span className="px-3 py-1 rounded-xl bg-blue-100 text-blue-800 border border-blue-200 text-xs font-bold">
            {findings.filter(f => f.category === 'Observasi').length} Observasi
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Cari nomor temuan, uraian masalah, unit kerja, standar, atau PIC..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="ALL">Semua Kategori</option>
          <option value="Mayor">Mayor</option>
          <option value="Minor">Minor</option>
          <option value="Observasi">Observasi</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="ALL">Semua Status</option>
          <option value="Open">Open</option>
          <option value="In Progress">In Progress</option>
          <option value="Verified">Verified</option>
          <option value="Closed">Closed</option>
        </select>
      </div>

      {/* Findings Cards */}
      <div className="space-y-4">
        {filteredFindings.map(finding => {
          const isMayor = finding.category === 'Mayor';
          const isMinor = finding.category === 'Minor';
          const hasCap = correctiveActions.some(c => c.findingId === finding.id);

          return (
            <div
              key={finding.id}
              className={`bg-white rounded-2xl border p-5 shadow-xs space-y-4 transition ${
                isMayor
                  ? 'border-rose-300 ring-1 ring-rose-200/50'
                  : isMinor
                  ? 'border-amber-300 ring-1 ring-amber-200/50'
                  : 'border-slate-200'
              }`}
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-slate-100 text-slate-900 border border-slate-200">
                    {finding.findingNumber}
                  </span>
                  <span className="text-xs font-bold text-slate-800">
                    {finding.unitName}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                      isMayor
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : isMinor
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-blue-100 text-blue-800 border border-blue-200'
                    }`}
                  >
                    Kategori: {finding.category}
                  </span>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                      finding.status === 'Closed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : finding.status === 'Verified'
                        ? 'bg-teal-100 text-teal-800'
                        : finding.status === 'In Progress'
                        ? 'bg-sky-100 text-sky-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    Status: {finding.status}
                  </span>
                </div>
              </div>

              {/* Standard Code & Problem */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                  <span>Standar: <strong>{finding.standardCode} - {finding.standardName}</strong></span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 leading-relaxed">
                  {finding.problemDescription}
                </h3>
                <p className="text-xs text-slate-500">
                  <strong>Bukti/Fakta Lapangan:</strong> {finding.evidenceRef}
                </p>
              </div>

              {/* Grid: Root Cause, Risk & Recommendation */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3.5 bg-slate-50/70 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="font-bold text-slate-400 uppercase text-[10px] block">
                    Akar Masalah (Root Cause)
                  </span>
                  <p className="text-slate-700 mt-1 leading-relaxed">
                    {finding.rootCause || 'Perlu pendalaman lebih lanjut melalui analisis 5-Whys.'}
                  </p>
                </div>
                <div>
                  <span className="font-bold text-slate-400 uppercase text-[10px] block">
                    Analisis Risiko Akreditasi
                  </span>
                  <p className="text-slate-700 mt-1 leading-relaxed">
                    {finding.riskAnalysis || 'Risiko ketidaksesuaian kriteria LAM/BAN-PT.'}
                  </p>
                </div>
                <div>
                  <span className="font-bold text-slate-400 uppercase text-[10px] block">
                    Rekomendasi Tindakan (SMART)
                  </span>
                  <p className="text-emerald-900 font-medium mt-1 leading-relaxed">
                    {finding.recommendation}
                  </p>
                </div>
              </div>

              {/* Footer Meta & Actions */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-4 text-slate-500 text-[11px]">
                  <span>PIC: <strong>{finding.picName}</strong></span>
                  <span>Tenggat Waktu: <strong className="text-rose-600">{finding.deadline}</strong></span>
                  <span>Auditor: {finding.auditorName}</span>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {/* AI Root Cause Analyzer Trigger */}
                  <button
                    onClick={() => handleRunRca(finding)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-bold border border-emerald-200 transition"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    AI 5-Whys RCA
                  </button>

                  {/* Create / View CAP */}
                  {hasCap ? (
                    <button
                      onClick={() => onNavigateToTab('tindak-lanjut')}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-sky-50 text-sky-800 hover:bg-sky-100 font-bold border border-sky-200 transition"
                    >
                      Lihat Rencana CAP
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleOpenCapModal(finding)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold transition shadow-xs"
                    >
                      Buat Tindak Lanjut (CAP)
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal AI Root Cause Analysis (5-Whys) */}
      {rcaFinding && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Analisis Akar Masalah (5-Whys & Fishbone) - {rcaFinding.findingNumber}
                </h3>
              </div>
              <button
                onClick={() => setRcaFinding(null)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
              <span className="font-bold text-slate-500 uppercase text-[10px]">Temuan Terpilih:</span>
              <p className="font-bold text-slate-800">{rcaFinding.problemDescription}</p>
              <p className="text-slate-500">Unit: {rcaFinding.unitName} | Standar: {rcaFinding.standardCode}</p>
            </div>

            {rcaLoading ? (
              <div className="py-8 text-center text-xs text-slate-500 space-y-2">
                <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p>AI sedang memproses penelusuran 5-Whys dan diagram sebab-akibat...</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50/50 to-emerald-50/50 border border-emerald-200 text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                  {rcaResult}
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setRcaFinding(null)}
                    className="px-4 py-2 rounded-lg bg-emerald-700 text-white font-bold hover:bg-emerald-800 text-xs"
                  >
                    Selesai & Tutup
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Create CAP */}
      {capFinding && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">
                Rencana Tindak Lanjut (Corrective Action Plan) - {capFinding.findingNumber}
              </h3>
              <button
                onClick={() => setCapFinding(null)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitCap} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Rencana Tindakan Koreksi (Corrective Action)</label>
                <textarea
                  rows={2}
                  required
                  value={capPlan}
                  onChange={(e) => setCapPlan(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Rencana Tindakan Pencegahan (Preventive Action)</label>
                <textarea
                  rows={2}
                  value={capPreventive}
                  onChange={(e) => setCapPreventive(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Target Output Terukur</label>
                <input
                  type="text"
                  required
                  value={capTargetOutput}
                  onChange={(e) => setCapTargetOutput(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Target Tanggal Selesai</label>
                <input
                  type="date"
                  required
                  value={capDate}
                  onChange={(e) => setCapDate(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCapFinding(null)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-700 text-white font-bold hover:bg-emerald-800"
                >
                  Simpan Rencana CAP
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Export AMI PDF Modal */}
      <ExportAMIPDFModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />
    </div>
  );
};
