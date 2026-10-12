import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AuditInstance, AuditItemResponse, FindingCategory, isFacultyLeaderRole } from '../../types';
import { PPEPPProgress } from './PPEPPProgress';
import {
  ClipboardList,
  CheckCircle2,
  AlertCircle,
  FileUp,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Building,
  UserCheck,
  Calendar,
  AlertTriangle,
  FileText,
  Search,
  Filter,
  ArrowRight,
  Plus
} from 'lucide-react';

interface PelaksanaanAuditProps {
  onNavigateToTab: (tab: string) => void;
  onOpenAI: () => void;
}

export const PelaksanaanAudit: React.FC<PelaksanaanAuditProps> = ({ onNavigateToTab, onOpenAI }) => {
  const {
    audits,
    auditItems,
    findings,
    correctiveActions,
    rtmRecords,
    currentUser,
    updateAuditScore,
    updateAuditeeNotes,
    addEvidenceToItem,
    verifyEvidence,
    addFinding,
    analyzeEvidenceWithAI,
    validateAuditByDean
  } = useApp();

  const [selectedAuditId, setSelectedAuditId] = useState<string>(audits[0]?.id || '');
  const [activeItemFilter, setActiveItemFilter] = useState<'all' | 'need-score' | 'scored' | 'has-finding'>('all');
  
  // Modal upload evidence
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [uploadItemId, setUploadItemId] = useState<string>('');
  const [evidenceTitle, setEvidenceTitle] = useState<string>('');
  const [evidenceUrl, setEvidenceUrl] = useState<string>('');
  const [evidenceType, setEvidenceType] = useState<string>('PDF');
  const [evidenceNotes, setEvidenceNotes] = useState<string>('');

  // AI evidence analysis loading state per item
  const [aiAnalyzingId, setAiAnalyzingId] = useState<string | null>(null);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<{ [itemId: string]: string }>({});

  // Modal create finding from audit item
  const [showFindingModal, setShowFindingModal] = useState<boolean>(false);
  const [findingItemId, setFindingItemId] = useState<string>('');
  const [findingCategory, setFindingCategory] = useState<FindingCategory>('Minor');
  const [findingProblem, setFindingProblem] = useState<string>('');
  const [findingRootCause, setFindingRootCause] = useState<string>('');
  const [findingRisk, setFindingRisk] = useState<string>('');
  const [findingRecommendation, setFindingRecommendation] = useState<string>('');
  const [findingPic, setFindingPic] = useState<string>('');
  const [findingDeadline, setFindingDeadline] = useState<string>('2026-05-15');

  const selectedAudit = audits.find(a => a.id === selectedAuditId) || audits[0];
  const itemsForAudit = auditItems.filter(i => i.auditId === selectedAudit?.id);

  // Filter items
  const filteredItems = itemsForAudit.filter(item => {
    if (activeItemFilter === 'need-score') return item.score === null;
    if (activeItemFilter === 'scored') return item.score !== null;
    if (activeItemFilter === 'has-finding') return item.hasFinding;
    return true;
  });

  const isAuditorOrAdmin =
    currentUser.role === 'Super Admin' ||
    currentUser.role === 'LPM' ||
    currentUser.role === 'Auditor Internal';

  const isAuditee =
    currentUser.role === 'Ketua Program Studi' ||
    currentUser.role === 'Super Admin';

  const isDean =
    isFacultyLeaderRole(currentUser.role) ||
    currentUser.role === 'Dekan' ||
    currentUser.role === 'Direktur Pascasarjana' ||
    currentUser.role === 'Super Admin';

  const handleOpenUpload = (itemId: string) => {
    setUploadItemId(itemId);
    setEvidenceTitle('');
    setEvidenceUrl('');
    setEvidenceNotes('');
    setShowUploadModal(true);
  };

  const handleSubmitEvidence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadItemId || !evidenceTitle) return;

    addEvidenceToItem(uploadItemId, {
      title: evidenceTitle,
      fileType: evidenceType,
      fileUrl: evidenceUrl || 'https://drive.unimen.ac.id/dokumen/sample-bukti.pdf',
      fileSize: '1.5 MB',
      uploadedBy: currentUser.name,
      notes: evidenceNotes,
    });

    setShowUploadModal(false);
  };

  const handleAnalyzeWithAI = async (item: AuditItemResponse) => {
    setAiAnalyzingId(item.id);
    const primaryEvidence = item.evidences[0];
    try {
      const res = await analyzeEvidenceWithAI({
        standardCode: item.standardCode,
        standardName: item.standardGroup,
        question: item.question,
        indicator: item.indicator,
        evidenceTitle: primaryEvidence?.title || item.mandatoryEvidence,
        evidenceDescription: item.auditeeNotes || 'Tersedia dokumen resmi di portal SPMI.',
      });

      const text = res.result || res.analysis || 'Bukti valid dan sesuai.';
      setAiAnalysisResult(prev => ({ ...prev, [item.id]: text }));

      // If suggestedScore returned and item not scored yet, optionally set it
      if (res.suggestedScore && !item.score) {
        updateAuditScore(item.id, res.suggestedScore as any, 'Rekomendasi AI Skor ' + res.suggestedScore);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAiAnalyzingId(null);
    }
  };

  const handleOpenCreateFinding = (item: AuditItemResponse) => {
    setFindingItemId(item.id);
    setFindingCategory(item.score === 1 ? 'Mayor' : item.score === 2 ? 'Minor' : 'Observasi');
    setFindingProblem(`Kesenjangan pemenuhan standar ${item.standardCode}: ${item.question}`);
    setFindingRootCause('Belum adanya instrumen monitoring berkala dan tindak lanjut di tingkat program studi.');
    setFindingRisk('Potensi pengurangan skor saat asesmen akreditasi LAM/BAN-PT.');
    setFindingRecommendation('GKM bersama Kaprodi menyusun perbaikan dan melengkapi bukti sebelum RTM.');
    setFindingPic(selectedAudit.auditeeHeadName);
    setShowFindingModal(true);
  };

  const handleSubmitFinding = (e: React.FormEvent) => {
    e.preventDefault();
    const item = itemsForAudit.find(i => i.id === findingItemId);
    if (!item) return;

    addFinding({
      findingNumber: `UNIMEN/AMI-2026/F-${Math.floor(100 + Math.random() * 900)}`,
      auditId: selectedAudit.id,
      unitId: selectedAudit.unitId,
      unitName: selectedAudit.unitName,
      standardCode: item.standardCode,
      standardName: item.standardGroup,
      category: findingCategory,
      problemDescription: findingProblem,
      evidenceRef: item.evidences[0]?.title || item.mandatoryEvidence,
      rootCause: findingRootCause,
      riskAnalysis: findingRisk,
      recommendation: findingRecommendation,
      picName: findingPic,
      picRole: 'Ketua Unit / Kaprodi',
      deadline: findingDeadline,
      status: 'Open',
      auditorId: currentUser.id,
      auditorName: currentUser.name,
    });

    setShowFindingModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Workflow Navigation Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ClipboardList className="w-6 h-6 text-emerald-700" />
              <h1 className="text-xl font-bold text-slate-900">
                Pelaksanaan Audit Mutu Internal (AMI)
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Alur kerja terpadu: Penetapan Unit & Auditor ➔ Pengisian Checklist ➔ Unggah Bukti Digital ➔ Analisis AI ➔ Skoring ➔ Perumusan Temuan.
            </p>
          </div>

          {/* Unit Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Pilih Unit Audit:</span>
            <select
              value={selectedAudit?.id}
              onChange={(e) => setSelectedAuditId(e.target.value)}
              className="px-3 py-2 text-xs font-bold rounded-xl border border-slate-300 bg-emerald-50/50 text-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {audits.map(a => (
                <option key={a.id} value={a.id}>
                  {a.unitName} ({a.status})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Audit Meta Card */}
        {selectedAudit && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-400 font-semibold block text-[10px] uppercase">Unit Kerja / Auditee</span>
              <p className="font-bold text-slate-900 mt-0.5">{selectedAudit.unitName}</p>
              <p className="text-slate-500 text-[11px]">{selectedAudit.auditeeHeadName}</p>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block text-[10px] uppercase">Tim Auditor Mutu</span>
              <p className="font-bold text-emerald-900 mt-0.5">{selectedAudit.leadAuditorName}</p>
              <p className="text-slate-500 text-[11px]">Lead Auditor SPMI UNIMEN</p>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block text-[10px] uppercase">Jadwal & Status</span>
              <p className="font-bold text-slate-900 mt-0.5">{selectedAudit.scheduledDate}</p>
              <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 mt-0.5">
                {selectedAudit.status}
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block text-[10px] uppercase">Rata-rata Skor Capaian</span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-xl font-extrabold text-emerald-700">{selectedAudit.scoreAverage.toFixed(2)}</span>
                <span className="text-[11px] text-slate-400">/ 4.00</span>
              </div>
              <span className="text-[11px] text-slate-500">
                {selectedAudit.filledItems} dari {selectedAudit.totalItems} butir terisi
              </span>
            </div>
          </div>
        )}

        {/* Validation Bar for Dean if applicable */}
        {isDean && selectedAudit && (
          <div className="flex items-center justify-between p-3 rounded-xl bg-teal-50 border border-teal-200 text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-700" />
              <span className="font-bold text-teal-900">
                Validasi Hasil AMI Tingkat Fakultas (Dekan)
              </span>
            </div>
            {selectedAudit.deanValidated ? (
              <span className="px-2.5 py-1 rounded-full font-bold bg-teal-200 text-teal-900 text-[11px]">
                ✓ Telah Divalidasi Dekan
              </span>
            ) : (
              <button
                onClick={() => validateAuditByDean(selectedAudit.id)}
                className="px-3 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-bold transition shadow-xs"
              >
                Validasi Hasil AMI Fakultas
              </button>
            )}
          </div>
        )}
      </div>

      {/* Reusable PPEPPProgress Component in the Top Section */}
      {selectedAudit && (
        <PPEPPProgress
          audit={selectedAudit}
          auditItems={itemsForAudit}
          findings={findings}
          correctiveActions={correctiveActions}
          rtmRecords={rtmRecords}
        />
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveItemFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeItemFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            Semua Butir ({itemsForAudit.length})
          </button>
          <button
            onClick={() => setActiveItemFilter('need-score')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeItemFilter === 'need-score' ? 'bg-amber-600 text-white' : 'bg-white text-amber-800 border border-amber-200'
            }`}
          >
            Belum Dinilai ({itemsForAudit.filter(i => i.score === null).length})
          </button>
          <button
            onClick={() => setActiveItemFilter('has-finding')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeItemFilter === 'has-finding' ? 'bg-rose-600 text-white' : 'bg-white text-rose-800 border border-rose-200'
            }`}
          >
            Ada Temuan ({itemsForAudit.filter(i => i.hasFinding).length})
          </button>
        </div>

        <span className="text-xs text-slate-500 font-medium">
          Peran Anda saat ini: <strong className="text-emerald-700">{currentUser.role}</strong>
        </span>
      </div>

      {/* Audit Checklist Items */}
      <div className="space-y-5">
        {filteredItems.map(item => {
          const hasScore = item.score !== null;
          const isAnalyzing = aiAnalyzingId === item.id;
          const aiResult = aiAnalysisResult[item.id];

          return (
            <div
              key={item.id}
              className={`bg-white rounded-2xl border transition-all p-5 shadow-xs space-y-4 ${
                item.hasFinding
                  ? 'border-amber-300 ring-1 ring-amber-200'
                  : 'border-slate-200/90 hover:border-emerald-300'
              }`}
            >
              {/* Item Top Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 border border-slate-200">
                    {item.standardCode}
                  </span>
                  <span className="text-xs font-bold text-slate-700">
                    {item.standardGroup}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500">
                    (Bobot: {item.weight}%)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {item.hasFinding && (
                    <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-rose-100 text-rose-800 border border-rose-200">
                      Ada Temuan Audit
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Siklus {item.ppeppStage}
                  </span>
                </div>
              </div>

              {/* Question */}
              <div>
                <p className="text-sm font-bold text-slate-900 leading-snug">
                  "{item.question}"
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  <strong>Indikator:</strong> {item.indicator} | <strong>Target:</strong> {item.target}
                </p>
              </div>

              {/* Evidence Section */}
              <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                    <FileText className="w-4 h-4 text-emerald-700" />
                    <span>Bukti Digital yang Diunggah ({item.evidences.length} Berkas)</span>
                  </div>

                  <button
                    onClick={() => handleOpenUpload(item.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs transition"
                  >
                    <FileUp className="w-3.5 h-3.5" />
                    Unggah Bukti Baru
                  </button>
                </div>

                {item.evidences.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">
                    Belum ada dokumen bukti yang diunggah. Bukti wajib: <strong>{item.mandatoryEvidence}</strong>
                  </p>
                ) : (
                  <div className="space-y-2">
                    {item.evidences.map(ev => (
                      <div
                        key={ev.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 bg-white rounded-lg border border-slate-200 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px]">
                            {ev.fileType}
                          </span>
                          <span className="font-bold text-slate-900 truncate max-w-xs">{ev.title}</span>
                          <span className="text-[11px] text-slate-400">({ev.fileSize})</span>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          <a
                            href={ev.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-emerald-700 hover:text-emerald-900 font-bold"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Buka Bukti
                          </a>

                          {isAuditorOrAdmin && (
                            <button
                              onClick={() => verifyEvidence(item.id, ev.id, !ev.isVerified)}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                ev.isVerified
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                              }`}
                            >
                              {ev.isVerified ? '✓ Terverifikasi' : 'Verifikasi Bukti'}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* AI Evidence Reader Button */}
                <div className="pt-1 flex items-center justify-between">
                  <button
                    onClick={() => handleAnalyzeWithAI(item)}
                    disabled={isAnalyzing}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-700 text-white text-xs font-bold hover:from-emerald-700 hover:to-teal-800 transition shadow-xs disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    {isAnalyzing ? 'Sedang Menganalisis Bukti...' : 'Minta Analisis Bukti AI (Permendikti 39/2025)'}
                  </button>

                  <span className="text-[11px] text-slate-400">
                    Wajib: {item.mandatoryEvidence}
                  </span>
                </div>

                {/* AI Analysis Result Output Box */}
                {aiResult && (
                  <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-xs space-y-1">
                    <div className="flex items-center gap-1 text-amber-900 font-bold">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>Hasil Analisis Kelayakan Bukti oleh SIAMI AI:</span>
                    </div>
                    <p className="text-slate-700 whitespace-pre-line leading-relaxed text-[11px]">
                      {aiResult}
                    </p>
                  </div>
                )}
              </div>

              {/* Auditee Notes Input */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Catatan Auditee (Penjelasan Keterlaksanaan):
                </label>
                <textarea
                  rows={2}
                  placeholder="Tuliskan keterangan implementasi, tautan repository atau klarifikasi auditee..."
                  value={item.auditeeNotes || ''}
                  onChange={(e) => updateAuditeeNotes(item.id, e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Auditor Scoring & Findings Bar */}
              <div className="pt-3 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Scoring buttons (1-4) */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Penilaian Skor Auditor:
                  </span>
                  <div className="flex items-center gap-2">
                    {[
                      { score: 4, label: '4 - Melampaui', color: 'bg-emerald-600 text-white', inactive: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
                      { score: 3, label: '3 - Memenuhi', color: 'bg-teal-600 text-white', inactive: 'bg-teal-50 text-teal-800 border-teal-200' },
                      { score: 2, label: '2 - Sebagian', color: 'bg-amber-600 text-white', inactive: 'bg-amber-50 text-amber-800 border-amber-200' },
                      { score: 1, label: '1 - Tidak Memenuhi', color: 'bg-rose-600 text-white', inactive: 'bg-rose-50 text-rose-800 border-rose-200' },
                    ].map(btn => (
                      <button
                        key={btn.score}
                        disabled={!isAuditorOrAdmin}
                        onClick={() => updateAuditScore(item.id, btn.score as any)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition ${
                          item.score === btn.score
                            ? `${btn.color} shadow-sm`
                            : `${btn.inactive} hover:bg-slate-100`
                        } ${!isAuditorOrAdmin ? 'opacity-70 cursor-not-allowed' : ''}`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Create finding button if score is 1 or 2 */}
                <div className="flex items-center gap-2 self-end md:self-center">
                  {isAuditorOrAdmin && (
                    <button
                      onClick={() => handleOpenCreateFinding(item)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 transition"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Buat Temuan Audit
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Upload Bukti */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">
                Unggah Dokumen Bukti Digital
              </h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitEvidence} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Judul / Nama Dokumen Bukti</label>
                <input
                  type="text"
                  placeholder="Contoh: SK_Penetapan_CPL_Dekan_2025.pdf"
                  value={evidenceTitle}
                  onChange={(e) => setEvidenceTitle(e.target.value)}
                  required
                  className="w-full p-2.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Format Berkas</label>
                  <select
                    value={evidenceType}
                    onChange={(e) => setEvidenceType(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="PDF">PDF</option>
                    <option value="XLSX">Excel (.xlsx)</option>
                    <option value="DOCX">Word (.docx)</option>
                    <option value="LINK">Link URL / Cloud Drive</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Pengunggah</label>
                  <input
                    type="text"
                    disabled
                    value={currentUser.name}
                    className="w-full p-2 border border-slate-200 bg-slate-100 rounded-lg text-slate-600"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Tautan File / Cloud Drive (Opsional)</label>
                <input
                  type="text"
                  placeholder="https://drive.unimen.ac.id/dokumen/..."
                  value={evidenceUrl}
                  onChange={(e) => setEvidenceUrl(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Keterangan Tambahan</label>
                <textarea
                  rows={2}
                  placeholder="Keterangan pasal, lembar pengesahan, atau konteks bukti..."
                  value={evidenceNotes}
                  onChange={(e) => setEvidenceNotes(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-700 text-white font-bold hover:bg-emerald-800"
                >
                  Simpan Bukti Digital
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Create Finding */}
      {showFindingModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                Formulir Temuan Audit Mutu Internal
              </h3>
              <button
                onClick={() => setShowFindingModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitFinding} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Kategori Temuan</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Observasi', 'Minor', 'Mayor'] as FindingCategory[]).map(cat => (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => setFindingCategory(cat)}
                      className={`p-2 rounded-lg border font-bold text-xs ${
                        findingCategory === cat
                          ? cat === 'Mayor'
                            ? 'bg-rose-600 text-white border-rose-600'
                            : cat === 'Minor'
                            ? 'bg-amber-600 text-white border-amber-600'
                            : 'bg-blue-600 text-white border-blue-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Uraian Masalah / Kesenjangan</label>
                <textarea
                  rows={2}
                  required
                  value={findingProblem}
                  onChange={(e) => setFindingProblem(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Akar Masalah (Root Cause)</label>
                <textarea
                  rows={2}
                  value={findingRootCause}
                  onChange={(e) => setFindingRootCause(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Analisis Risiko Mutu</label>
                <textarea
                  rows={2}
                  value={findingRisk}
                  onChange={(e) => setFindingRisk(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Rekomendasi Tindakan Koreksi (SMART)</label>
                <textarea
                  rows={2}
                  value={findingRecommendation}
                  onChange={(e) => setFindingRecommendation(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">PIC Penyelesaian</label>
                  <input
                    type="text"
                    value={findingPic}
                    onChange={(e) => setFindingPic(e.target.value)}
                    required
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tenggat Waktu (Deadline)</label>
                  <input
                    type="date"
                    value={findingDeadline}
                    onChange={(e) => setFindingDeadline(e.target.value)}
                    required
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowFindingModal(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-rose-600 text-white font-bold hover:bg-rose-700"
                >
                  Simpan Temuan Audit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
