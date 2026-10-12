import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CorrectiveAction } from '../../types';
import { ExportAMIPDFModal } from '../reports/ExportAMIPDFModal';
import {
  CheckCircle2,
  Clock,
  FileCheck,
  ExternalLink,
  ShieldCheck,
  Award,
  AlertCircle,
  Building,
  UserCheck,
  ArrowUpRight,
  Download
} from 'lucide-react';

export const TindakLanjut: React.FC = () => {
  const {
    correctiveActions,
    updateCorrectiveActionProgress,
    verifyCorrectiveAction,
    approveCorrectiveActionByDean,
    approveCorrectiveActionByRector,
    currentUser
  } = useApp();

  const [selectedCap, setSelectedCap] = useState<CorrectiveAction | null>(null);
  const [progressInput, setProgressInput] = useState<number>(50);
  const [evidenceNoteInput, setEvidenceNoteInput] = useState<string>('');
  const [evidenceUrlInput, setEvidenceUrlInput] = useState<string>('');
  const [auditorNoteInput, setAuditorNoteInput] = useState<string>('');
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);

  const isAuditorOrAdmin =
    currentUser.role === 'Super Admin' ||
    currentUser.role === 'LPM' ||
    currentUser.role === 'Auditor Internal';

  const isDean =
    currentUser.role === 'Dekan' ||
    currentUser.role === 'Super Admin';

  const isRector =
    currentUser.role === 'Rektor' ||
    currentUser.role === 'Super Admin';

  const handleOpenUpdate = (cap: CorrectiveAction) => {
    setSelectedCap(cap);
    setProgressInput(cap.progressPercent);
    setEvidenceNoteInput(cap.evidenceNotes || '');
    setEvidenceUrlInput(cap.evidenceSubmissionUrl || '');
    setAuditorNoteInput(cap.auditorVerificationNotes || '');
  };

  const handleSaveProgress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCap) return;

    updateCorrectiveActionProgress(
      selectedCap.id,
      progressInput,
      evidenceNoteInput,
      evidenceUrlInput
    );
    setSelectedCap(null);
  };

  const handleVerify = (status: CorrectiveAction['status']) => {
    if (!selectedCap) return;
    verifyCorrectiveAction(selectedCap.id, status, auditorNoteInput);
    setSelectedCap(null);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-emerald-700" />
            <h1 className="text-xl font-bold text-slate-900">
              Rencana & Progres Tindak Lanjut (PTK / Corrective Action Plan)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Monitoring penyelesaian temuan audit, verifikasi bukti perbaikan oleh auditor, dan persetujuan tindak lanjut oleh Dekan & Rektor UNIMEN.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold">
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold transition shadow-xs active:scale-95"
          >
            <Download className="w-3.5 h-3.5 text-amber-300" />
            <span>Ekspor PDF AMI</span>
          </button>
          <span className="px-3 py-1.5 rounded-xl bg-teal-100 text-teal-800 border border-teal-200">
            Total {correctiveActions.length} Program Tindak Lanjut
          </span>
        </div>
      </div>

      {/* Corrective Actions Grid */}
      <div className="space-y-4">
        {correctiveActions.map(cap => {
          const isDone = cap.progressPercent >= 100;

          return (
            <div
              key={cap.id}
              className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4 hover:border-emerald-300 transition"
            >
              {/* Top Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {cap.findingNumber}
                  </span>
                  <span className="text-xs font-bold text-slate-900">
                    {cap.unitName}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full font-bold text-[11px] bg-slate-100 text-slate-700">
                    Target: {cap.targetDate}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                      cap.status === 'Terverifikasi' || cap.status === 'Selesai'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    Status: {cap.status}
                  </span>
                </div>
              </div>

              {/* Plans Description */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-500 uppercase text-[10px] block">
                    Tindakan Koreksi (Corrective Plan)
                  </span>
                  <p className="text-slate-800 font-semibold leading-relaxed">
                    {cap.correctivePlan}
                  </p>
                  <p className="text-[11px] text-emerald-700 font-medium pt-1">
                    Target Output: {cap.targetOutput}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-500 uppercase text-[10px] block">
                    Tindakan Pencegahan (Preventive Plan)
                  </span>
                  <p className="text-slate-700 leading-relaxed">
                    {cap.preventivePlan || 'Penerapan SOP baku dan monitoring berkelanjutan.'}
                  </p>
                </div>
              </div>

              {/* Progress Bar & Evidence Proof */}
              <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">Progres Realisasi Tindak Lanjut:</span>
                  <span className="font-extrabold text-emerald-700 text-sm">{cap.progressPercent}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      isDone ? 'bg-emerald-600' : 'bg-teal-600'
                    }`}
                    style={{ width: `${cap.progressPercent}%` }}
                  />
                </div>

                {/* Evidence link & notes */}
                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="text-slate-600 truncate max-w-md">
                    <strong>Catatan Bukti:</strong> {cap.evidenceNotes || 'Belum ada catatan penyelesaian.'}
                  </div>
                  {cap.evidenceSubmissionUrl && (
                    <a
                      href={cap.evidenceSubmissionUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-900 font-bold"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Lihat Dokumen Hasil Koreksi
                    </a>
                  )}
                </div>

                {/* Auditor Verification Note if available */}
                {cap.auditorVerificationNotes && (
                  <div className="mt-2 p-2 bg-emerald-50 rounded-lg border border-emerald-200 text-[11px] text-emerald-900">
                    <strong>Catatan Verifikasi Auditor ({cap.verifiedBy}):</strong> {cap.auditorVerificationNotes}
                  </div>
                )}
              </div>

              {/* Approvals & Action Buttons Bar */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                {/* Approvals Pills */}
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      cap.approvedByDean ? 'bg-teal-100 text-teal-800' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {cap.approvedByDean ? '✓ Disetujui Dekan' : 'Menunggu Dekan'}
                  </span>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      cap.approvedByRector ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {cap.approvedByRector ? '✓ Disetujui Rektor' : 'Menunggu Rektor'}
                  </span>
                </div>

                {/* Actions Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Auditee / Lead Update Progress */}
                  <button
                    onClick={() => handleOpenUpdate(cap)}
                    className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold transition shadow-xs"
                  >
                    Perbarui Progres & Bukti
                  </button>

                  {/* Dean Approval */}
                  {isDean && !cap.approvedByDean && (
                    <button
                      onClick={() => approveCorrectiveActionByDean(cap.id)}
                      className="px-3 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-bold transition shadow-xs"
                    >
                      Setujui (Dekan)
                    </button>
                  )}

                  {/* Rector Approval */}
                  {isRector && !cap.approvedByRector && (
                    <button
                      onClick={() => approveCorrectiveActionByRector(cap.id)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold transition shadow-xs"
                    >
                      Setujui (Rektor)
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Update Progress & Verification */}
      {selectedCap && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">
                Kelola Tindak Lanjut - {selectedCap.findingNumber}
              </h3>
              <button
                onClick={() => setSelectedCap(null)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProgress} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Persentase Progres Capaian ({progressInput}%)
                </label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={progressInput}
                  onChange={(e) => setProgressInput(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Catatan Bukti / Uraian Perbaikan</label>
                <textarea
                  rows={2}
                  placeholder="Jelaskan dokumen yang telah disusun, rapat yang telah digelar..."
                  value={evidenceNoteInput}
                  onChange={(e) => setEvidenceNoteInput(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Tautan Bukti Dokumen (Cloud/Drive)</label>
                <input
                  type="text"
                  placeholder="https://drive.unimen.ac.id/dokumen/tindak-lanjut/..."
                  value={evidenceUrlInput}
                  onChange={(e) => setEvidenceUrlInput(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg font-mono text-[11px]"
                />
              </div>

              {/* Auditor Verification Section if Auditor/Admin */}
              {isAuditorOrAdmin && (
                <div className="pt-3 border-t border-slate-200 space-y-2">
                  <span className="font-bold text-emerald-900 block">
                    Verifikasi Penyelesaian oleh Auditor:
                  </span>
                  <textarea
                    rows={2}
                    placeholder="Catatan validasi auditor atas kecukupan bukti penyelesaian..."
                    value={auditorNoteInput}
                    onChange={(e) => setAuditorNoteInput(e.target.value)}
                    className="w-full p-2 border border-emerald-300 rounded-lg bg-emerald-50/30"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleVerify('Terverifikasi')}
                      className="px-3 py-1.5 rounded-lg bg-emerald-700 text-white font-bold hover:bg-emerald-800"
                    >
                      ✓ Verifikasi & Tutup Temuan
                    </button>
                    <button
                      type="button"
                      onClick={() => handleVerify('Perlu Perbaikan')}
                      className="px-3 py-1.5 rounded-lg bg-amber-600 text-white font-bold hover:bg-amber-700"
                    >
                      Perlu Perbaikan Tambahan
                    </button>
                  </div>
                </div>
              )}

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedCap(null)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-700 text-white font-bold hover:bg-emerald-800"
                >
                  Simpan Progres
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
