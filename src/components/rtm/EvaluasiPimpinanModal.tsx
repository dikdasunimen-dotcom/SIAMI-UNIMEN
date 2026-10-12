import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RTMRecord, RTMDecision } from '../../types';
import { UnimenLogo } from '../common/UnimenLogo';
import {
  Gavel,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Calendar,
  Clock,
  Plus,
  Trash2,
  FileCheck2,
  Sparkles,
  Award,
  Layers,
  X,
  Send
} from 'lucide-react';

interface EvaluasiPimpinanModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: RTMRecord;
}

export const EvaluasiPimpinanModal: React.FC<EvaluasiPimpinanModalProps> = ({
  isOpen,
  onClose,
  record,
}) => {
  const { updateRTMRecord, findings, correctiveActions, currentUser } = useApp();

  const [discussionSummary, setDiscussionSummary] = useState(record.discussionSummary || '');
  const [leadershipDirective, setLeadershipDirective] = useState(
    record.evaluationOutcome?.leadershipDirective ||
    `Pimpinan menginstruksikan seluruh prodi terpanggil untuk menuntaskan tindakan koreksi dan pencegahan selambat-lambatnya dalam tempo 30 hari kalender.`
  );
  const [overallStatus, setOverallStatus] = useState<'Memuaskan' | 'Perlu Perbaikan Segera' | 'Peringatan Mutu'>(
    record.evaluationOutcome?.overallStatus || 'Perlu Perbaikan Segera'
  );
  const [ppeppNextMilestone, setPpeppNextMilestone] = useState(
    record.evaluationOutcome?.ppeppNextMilestone || 'Evaluasi Pengendalian & Audit Penutupan Temuan Tahap II'
  );

  // Dynamic decisions list
  const [decisions, setDecisions] = useState<RTMDecision[]>(
    record.decisions && record.decisions.length > 0
      ? record.decisions
      : [
          {
            id: `dec-${Date.now()}-1`,
            item: `Percepatan Penutupan Temuan ${record.summonedUnitNames?.[0] || record.unitName}`,
            action: 'Prodi wajib menyerahkan revisi bukti fisik dan rubrik OBE ke GKM/LPM.',
            pic: 'Ketua Program Studi & Gugus Kendali Mutu',
            deadline: '2026-05-15',
            ppeppTarget: 'Pengendalian',
            budgetSupport: 'Fasilitas Workshop Institusi'
          }
        ]
  );

  // New decision draft inputs
  const [newItem, setNewItem] = useState('');
  const [newAction, setNewAction] = useState('');
  const [newPic, setNewPic] = useState('');
  const [newDeadline, setNewDeadline] = useState('2026-05-30');
  const [newTarget, setNewTarget] = useState('Pengendalian');
  const [newBudget, setNewBudget] = useState('');

  if (!isOpen) return null;

  const handleAddDecision = () => {
    if (!newItem.trim() || !newAction.trim()) return;
    const newDec: RTMDecision = {
      id: `dec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      item: newItem,
      action: newAction,
      pic: newPic || 'Pimpinan Unit Terkait',
      deadline: newDeadline,
      ppeppTarget: newTarget,
      budgetSupport: newBudget || undefined,
    };
    setDecisions(prev => [...prev, newDec]);
    setNewItem('');
    setNewAction('');
    setNewPic('');
    setNewBudget('');
  };

  const handleRemoveDecision = (id: string) => {
    setDecisions(prev => prev.filter(d => d.id !== id));
  };

  const handleSaveEvaluation = (e: React.FormEvent) => {
    e.preventDefault();

    updateRTMRecord(record.id, {
      sessionStatus: 'Selesai',
      status: 'Disetujui',
      discussionSummary,
      decisions,
      evaluationOutcome: {
        overallStatus,
        leadershipDirective,
        ppeppNextMilestone,
        evaluatedAt: new Date().toISOString().split('T')[0],
      },
    });

    onClose();
  };

  // Find linked findings and corrective actions
  const linkedFindingIds = record.summonedFindings?.map(f => f.findingId) || [];
  const detailedFindings = findings.filter(f => linkedFindingIds.includes(f.id));

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full my-8 shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white p-5 border-b border-emerald-800 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                <Gavel className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-amber-300 block">
                  Sidang Evaluasi Tingkat Pimpinan • Siklus PPEPP
                </span>
                <h2 className="text-base font-extrabold text-white">
                  Evaluasi & Penetapan Kebijakan Pimpinan: {record.agenda}
                </h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/20 text-emerald-200 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <form onSubmit={handleSaveEvaluation} className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
          {/* Metadata Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Nomor Surat</span>
              <span className="font-mono font-bold text-slate-800 text-[11px]">{record.meetingNumber || '-'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Tingkatan</span>
              <span className="font-bold text-emerald-800">RTM Tingkat {record.level}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Pimpinan Sidang</span>
              <span className="font-bold text-slate-800 truncate block">{record.leadName}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Waktu Sidang</span>
              <span className="font-bold text-slate-800">{record.date} ({record.scheduledTime || 'Pagi'})</span>
            </div>
          </div>

          {/* Prodi yang Dipanggil Hadir */}
          {record.summonedUnitNames && record.summonedUnitNames.length > 0 && (
            <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-200">
              <span className="font-bold text-emerald-900 block mb-1.5 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-emerald-700" />
                Program Studi & Unit Kerja yang Menjalani Evaluasi:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {record.summonedUnitNames.map((name, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 font-bold text-[11px] border border-emerald-300"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Temuan Audit yang Ditelaah */}
          {detailedFindings.length > 0 && (
            <div className="space-y-2">
              <span className="font-bold text-slate-900 text-xs block flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Daftar Temuan Audit yang Dievaluasi Pertanggungjawabannya ({detailedFindings.length} Butir):
              </span>
              <div className="space-y-2">
                {detailedFindings.map(f => {
                  const cap = correctiveActions.find(c => c.findingId === f.id);
                  return (
                    <div
                      key={f.id}
                      className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {f.findingNumber}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                            f.category === 'Mayor'
                              ? 'bg-rose-100 text-rose-800 border border-rose-300'
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}>
                            {f.category}
                          </span>
                          <span className="font-bold text-slate-800 text-[11px]">{f.unitName}</span>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          Standar: {f.standardCode}
                        </span>
                      </div>

                      <p className="text-xs text-slate-700 leading-snug font-medium">
                        {f.problemDescription}
                      </p>

                      {cap && (
                        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-700">Rencana Tindak Lanjut (CAP) Prodi:</span>
                            <span className="font-extrabold text-emerald-800">
                              Progres: {cap.progressPercent}% ({cap.status})
                            </span>
                          </div>
                          <p className="italic text-slate-600">"{cap.correctivePlan}"</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Notulen & Ringkasan Klarifikasi Hearing */}
          <div>
            <label className="font-bold text-slate-800 block mb-1">
              Notulen Sidang RTM & Hasil Klarifikasi Pimpinan <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={discussionSummary}
              onChange={(e) => setDiscussionSummary(e.target.value)}
              placeholder="Catat rangkuman klarifikasi yang disampaikan Kaprodi, komitmen yang disepakati, serta evaluasi menyeluruh pimpinan..."
              className="w-full p-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
            />
          </div>

          {/* Arahan & Instruksi Khusus Pimpinan (Rector / Dean Directives) */}
          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2">
            <label className="font-extrabold text-amber-950 block text-xs flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-600" />
              Arahan & Instruksi Kebijakan Pimpinan (Mandat Rektor / Dekan)
            </label>
            <textarea
              rows={2}
              value={leadershipDirective}
              onChange={(e) => setLeadershipDirective(e.target.value)}
              placeholder="Instruksi pimpinan tertinggi yang mengikat bagi unit kerja..."
              className="w-full p-2.5 border border-amber-300 rounded-xl bg-white text-xs focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
            />
          </div>

          {/* Butir Keputusan Pimpinan (Decisions Table) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 text-xs block">
                Daftar Butir Keputusan & Kebijakan Hasil RTM ({decisions.length} Butir):
              </label>
              <span className="text-[10px] text-slate-400">Termasuk alokasi anggaran dan PIC</span>
            </div>

            {/* Existing decisions table */}
            {decisions.length > 0 && (
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3">Topik Masalah</th>
                      <th className="py-2 px-3">Instruksi / Kebijakan</th>
                      <th className="py-2 px-3">PIC</th>
                      <th className="py-2 px-3">Dukungan Anggaran / Fasilitas</th>
                      <th className="py-2 px-3">Tenggat</th>
                      <th className="py-2 px-3 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {decisions.map(dec => (
                      <tr key={dec.id}>
                        <td className="py-2 px-3 font-bold text-slate-900">{dec.item}</td>
                        <td className="py-2 px-3 text-slate-700">{dec.action}</td>
                        <td className="py-2 px-3 font-semibold text-emerald-800">{dec.pic}</td>
                        <td className="py-2 px-3 text-slate-600">{dec.budgetSupport || '-'}</td>
                        <td className="py-2 px-3 text-rose-600 font-semibold">{dec.deadline}</td>
                        <td className="py-2 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveDecision(dec.id)}
                            className="text-slate-400 hover:text-rose-600 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Add new decision sub-form */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="text-[11px] font-bold text-slate-700 block">
                + Tambah Butir Keputusan Baru:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Butir Masalah / Topik..."
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  className="p-2 border border-slate-300 rounded-lg bg-white text-xs"
                />
                <input
                  type="text"
                  placeholder="Tindakan / Kebijakan Pimpinan..."
                  value={newAction}
                  onChange={(e) => setNewAction(e.target.value)}
                  className="p-2 border border-slate-300 rounded-lg bg-white text-xs"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                <input
                  type="text"
                  placeholder="PIC Penanggung Jawab..."
                  value={newPic}
                  onChange={(e) => setNewPic(e.target.value)}
                  className="p-2 border border-slate-300 rounded-lg bg-white text-xs"
                />
                <input
                  type="text"
                  placeholder="Dukungan Dana (opsional)..."
                  value={newBudget}
                  onChange={(e) => setNewBudget(e.target.value)}
                  className="p-2 border border-slate-300 rounded-lg bg-white text-xs"
                />
                <select
                  value={newTarget}
                  onChange={(e) => setNewTarget(e.target.value)}
                  className="p-2 border border-slate-300 rounded-lg bg-white text-xs"
                >
                  <option value="Pengendalian">Fase: Pengendalian</option>
                  <option value="Peningkatan">Fase: Peningkatan</option>
                </select>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    className="p-2 border border-slate-300 rounded-lg bg-white text-xs flex-1"
                  />
                  <button
                    type="button"
                    onClick={handleAddDecision}
                    className="px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-xs shrink-0"
                  >
                    Tambah
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Status Penilaian & Milestone PPEPP */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div>
              <label className="font-bold text-slate-800 block mb-1">
                Hasil Evaluasi Kesiapan Mutu
              </label>
              <select
                value={overallStatus}
                onChange={(e) => setOverallStatus(e.target.value as any)}
                className="w-full p-2.5 border border-slate-300 rounded-xl bg-white font-semibold text-xs"
              >
                <option value="Memuaskan">🟢 Memuaskan (Progres Sangat Baik)</option>
                <option value="Perlu Perbaikan Segera">🟡 Perlu Perbaikan Segera (Dalam Pemantauan)</option>
                <option value="Peringatan Mutu">🔴 Peringatan Mutu (Temuan Mayor Tertahan)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">
                Milestone Siklus PPEPP Selanjutnya
              </label>
              <input
                type="text"
                value={ppeppNextMilestone}
                onChange={(e) => setPpeppNextMilestone(e.target.value)}
                placeholder="Contoh: Audit Verifikasi Penutupan Temuan Tahap II..."
                className="w-full p-2.5 border border-slate-300 rounded-xl font-medium text-xs"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs"
            >
              Tutup
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold shadow-md transition active:scale-95 text-xs flex items-center gap-2"
            >
              <FileCheck2 className="w-4 h-4" />
              Selesaikan Evaluasi & Terbitkan Berita Acara RTM
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
