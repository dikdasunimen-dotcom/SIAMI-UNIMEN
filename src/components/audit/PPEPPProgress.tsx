import React, { useState } from 'react';
import { PPEPPStage, AuditInstance, AuditItemResponse, Finding, CorrectiveAction, RTMRecord } from '../../types';
import {
  Layers,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  FileText,
  ShieldCheck,
  Award,
  ArrowRight
} from 'lucide-react';

export interface PPEPPProgressProps {
  currentPhase?: PPEPPStage;
  audit?: AuditInstance;
  auditItems?: AuditItemResponse[];
  findings?: Finding[];
  correctiveActions?: CorrectiveAction[];
  rtmRecords?: RTMRecord[];
  showDetails?: boolean;
  className?: string;
  onPhaseSelect?: (phase: PPEPPStage) => void;
}

interface PhaseConfig {
  id: PPEPPStage;
  name: string;
  shortName: string;
  code: string;
  description: string;
  deliverables: string[];
  activeColor: string;
  completedColor: string;
  bgLight: string;
  borderLight: string;
  textColor: string;
}

const PPEPP_PHASES: PhaseConfig[] = [
  {
    id: 'Penetapan',
    name: 'Penetapan',
    shortName: 'Penetapan',
    code: 'P-1',
    description: 'Penetapan Standar Mutu, Butir Instrumen SN Dikti & Permendiktisaintek 39/2025, serta Standar AIK UNIMEN.',
    deliverables: ['Buku Standar SPMI', 'Instrumen AMI', 'SK Penetapan Target CPL'],
    activeColor: 'from-emerald-500 to-emerald-600',
    completedColor: 'bg-emerald-600',
    bgLight: 'bg-emerald-50/70',
    borderLight: 'border-emerald-200',
    textColor: 'text-emerald-800'
  },
  {
    id: 'Pelaksanaan',
    name: 'Pelaksanaan',
    shortName: 'Pelaksanaan',
    code: 'P-2',
    description: 'Implementasi standar oleh program studi & pengunggahan bukti digital wajib (RPS OBE, publikasi, portofolio).',
    deliverables: ['Berkas RPS LMS', 'Publikasi Jurnal Sinta/Scopus', 'Sertifikasi BTA & AIK'],
    activeColor: 'from-teal-500 to-teal-600',
    completedColor: 'bg-teal-600',
    bgLight: 'bg-teal-50/70',
    borderLight: 'border-teal-200',
    textColor: 'text-teal-800'
  },
  {
    id: 'Evaluasi',
    name: 'Evaluasi',
    shortName: 'Evaluasi',
    code: 'E',
    description: 'Desk evaluation dan visitasi lapangan oleh Auditor Internal, verifikasi bukti, serta penilaian skor 1–4.',
    deliverables: ['Checklist Audit Terisi', 'Skor Capaian 1-4', 'Berita Acara AMI'],
    activeColor: 'from-sky-500 to-sky-600',
    completedColor: 'bg-sky-600',
    bgLight: 'bg-sky-50/70',
    borderLight: 'border-sky-200',
    textColor: 'text-sky-800'
  },
  {
    id: 'Pengendalian',
    name: 'Pengendalian',
    shortName: 'Pengendalian',
    code: 'P-3',
    description: 'Perumusan temuan Mayor/Minor/Observasi, Corrective Action Plan (CAP), validasi Dekan, dan RTM.',
    deliverables: ['Matriks Temuan Audit', 'Formulir Rencana CAP/PTK', 'Risalah RTM'],
    activeColor: 'from-amber-500 to-amber-600',
    completedColor: 'bg-amber-600',
    bgLight: 'bg-amber-50/70',
    borderLight: 'border-amber-200',
    textColor: 'text-amber-800'
  },
  {
    id: 'Peningkatan',
    name: 'Peningkatan',
    shortName: 'Peningkatan',
    code: 'P-4',
    description: 'Tindakan pencegahan, verifikasi penyelesaian temuan oleh auditor, persetujuan Rektor, dan pemutakhiran standar.',
    deliverables: ['CAP Terverifikasi', 'Persetujuan Pimpinan', 'Target Standar Baru'],
    activeColor: 'from-purple-500 to-purple-600',
    completedColor: 'bg-purple-600',
    bgLight: 'bg-purple-50/70',
    borderLight: 'border-purple-200',
    textColor: 'text-purple-800'
  }
];

export const PPEPPProgress: React.FC<PPEPPProgressProps> = ({
  currentPhase,
  audit,
  auditItems = [],
  findings = [],
  correctiveActions = [],
  rtmRecords = [],
  showDetails = true,
  className = '',
  onPhaseSelect
}) => {
  const [selectedPhaseId, setSelectedPhaseId] = useState<PPEPPStage | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(true);

  // Compute stats if audit data is provided
  const totalItems = auditItems.length || 1;
  const itemsWithEvidence = auditItems.filter(i => i.evidences && i.evidences.length > 0).length;
  const scoredItems = auditItems.filter(i => i.score !== null).length;
  
  const auditFindings = audit ? findings.filter(f => f.auditId === audit.id) : findings;
  const totalFindingsCount = auditFindings.length;
  const capsForAudit = correctiveActions.filter(c =>
    auditFindings.some(f => f.id === c.findingId)
  );
  const totalCaps = capsForAudit.length;
  const verifiedCaps = capsForAudit.filter(c => c.status === 'Terverifikasi' || c.status === 'Selesai').length;

  // Determine stage completion & percentages
  const phaseStats: Record<PPEPPStage, { percent: number; isCompleted: boolean; isActive: boolean }> = {
    Penetapan: {
      percent: 100,
      isCompleted: true,
      isActive: false
    },
    Pelaksanaan: {
      percent: Math.min(100, Math.round((itemsWithEvidence / totalItems) * 100)),
      isCompleted: itemsWithEvidence === totalItems,
      isActive: itemsWithEvidence < totalItems
    },
    Evaluasi: {
      percent: Math.min(100, Math.round((scoredItems / totalItems) * 100)),
      isCompleted: scoredItems === totalItems,
      isActive: itemsWithEvidence === totalItems && scoredItems < totalItems
    },
    Pengendalian: {
      percent: totalFindingsCount === 0 && scoredItems === totalItems
        ? 100
        : totalFindingsCount > 0
        ? Math.min(100, Math.round((totalCaps / totalFindingsCount) * 80 + (audit?.deanValidated ? 20 : 0)))
        : Math.round((scoredItems / totalItems) * 50),
      isCompleted: totalFindingsCount === 0 && scoredItems === totalItems
        ? true
        : totalCaps >= totalFindingsCount && totalFindingsCount > 0 && !!audit?.deanValidated,
      isActive: scoredItems === totalItems && (!audit?.deanValidated || totalCaps < totalFindingsCount)
    },
    Peningkatan: {
      percent: totalFindingsCount === 0 && scoredItems === totalItems
        ? 100
        : totalCaps > 0
        ? Math.min(100, Math.round((verifiedCaps / totalCaps) * 100))
        : 0,
      isCompleted: totalCaps > 0 && verifiedCaps === totalCaps,
      isActive: totalCaps > 0 && verifiedCaps < totalCaps
    }
  };

  // Resolve active phase
  let activePhaseName: PPEPPStage = currentPhase || 'Evaluasi';
  if (!currentPhase) {
    if (scoredItems === totalItems && totalCaps >= totalFindingsCount && verifiedCaps === totalCaps && totalCaps > 0) {
      activePhaseName = 'Peningkatan';
    } else if (scoredItems === totalItems) {
      activePhaseName = 'Pengendalian';
    } else if (itemsWithEvidence === totalItems) {
      activePhaseName = 'Evaluasi';
    } else {
      activePhaseName = 'Pelaksanaan';
    }
  }

  // Calculate overall cycle completion percentage
  const overallPercent = Math.round(
    (phaseStats.Penetapan.percent +
      phaseStats.Pelaksanaan.percent +
      phaseStats.Evaluasi.percent +
      phaseStats.Pengendalian.percent +
      phaseStats.Peningkatan.percent) / 5
  );

  const activePhaseConfig = PPEPP_PHASES.find(p => p.id === activePhaseName) || PPEPP_PHASES[2];
  const inspectedPhase = PPEPP_PHASES.find(p => p.id === (selectedPhaseId || activePhaseName)) || activePhaseConfig;

  return (
    <div className={`bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs transition-all space-y-4 ${className}`}>
      {/* Component Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-xs">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">
                Visualisasi Siklus SPMI PPEPP
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                Fase Aktif: {activePhaseConfig.name}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Progres pentahapan mutu berkelanjutan sesuai <strong>Permendiktisaintek No. 39 Tahun 2025</strong>
            </p>
          </div>
        </div>

        {/* Overall Completion Metric & Accordion Toggle */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Kelulusan Siklus
            </span>
            <div className="flex items-baseline gap-1 justify-end">
              <span className="text-lg font-extrabold text-emerald-700">
                {overallPercent}%
              </span>
              <span className="text-[11px] text-slate-400 font-semibold">Tuntas</span>
            </div>
          </div>

          {showDetails && (
            <button
              onClick={() => setIsDetailOpen(!isDetailOpen)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              title={isDetailOpen ? 'Sembunyikan Rincian' : 'Tampilkan Rincian'}
            >
              {isDetailOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Segmented Horizontal Bar */}
      <div className="space-y-2">
        <div className="grid grid-cols-5 gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/90">
          {PPEPP_PHASES.map((phase, index) => {
            const stat = phaseStats[phase.id];
            const isCurrent = activePhaseName === phase.id;
            const isCompleted = stat.percent >= 100;
            const isInspected = (selectedPhaseId || activePhaseName) === phase.id;

            return (
              <button
                key={phase.id}
                onClick={() => {
                  setSelectedPhaseId(phase.id);
                  if (onPhaseSelect) onPhaseSelect(phase.id);
                }}
                className={`group relative rounded-lg p-2.5 transition-all text-left flex flex-col justify-between overflow-hidden cursor-pointer ${
                  isInspected
                    ? 'ring-2 ring-emerald-600 shadow-sm bg-white'
                    : isCurrent
                    ? 'bg-white shadow-xs'
                    : 'hover:bg-white/80'
                }`}
              >
                {/* Segment Header */}
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                    {phase.code}
                  </span>
                  {isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  ) : isCurrent ? (
                    <span className="w-2 h-2 rounded-full bg-sky-500 animate-ping shrink-0" />
                  ) : (
                    <Clock className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                  )}
                </div>

                {/* Phase Name */}
                <div className="text-xs font-bold text-slate-900 truncate w-full">
                  {phase.name}
                </div>

                {/* Segment Horizontal Mini Progress Track */}
                <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isCompleted
                        ? 'bg-emerald-600'
                        : isCurrent
                        ? `bg-gradient-to-r ${phase.activeColor}`
                        : 'bg-slate-400'
                    }`}
                    style={{ width: `${stat.percent}%` }}
                  />
                </div>

                {/* Percentage label */}
                <div className="flex items-center justify-between mt-1.5 text-[10px] text-slate-500 w-full">
                  <span className="text-[9px] truncate">
                    {isCompleted ? '100%' : isCurrent ? 'Aktif' : 'Terjadwal'}
                  </span>
                  <span className="font-bold text-slate-700">
                    {stat.percent}%
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Detailed Drill-down Box for the inspected phase */}
      {showDetails && isDetailOpen && (
        <div className={`p-4 rounded-xl border ${inspectedPhase.bgLight} ${inspectedPhase.borderLight} space-y-3 animate-in fade-in duration-200`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200/60">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${inspectedPhase.completedColor}`} />
              <h4 className="font-bold text-xs text-slate-900">
                Fase {inspectedPhase.code}: {inspectedPhase.name}
              </h4>
              <span className="text-[10px] px-2 py-0.2 rounded-full font-bold bg-white text-slate-700 border border-slate-200">
                Progres: {phaseStats[inspectedPhase.id].percent}%
              </span>
            </div>

            <p className="text-[11px] text-slate-600">
              {inspectedPhase.description}
            </p>
          </div>

          {/* Deliverables / Output list */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
            {inspectedPhase.deliverables.map((item, idx) => (
              <div
                key={idx}
                className="p-2.5 bg-white/90 rounded-lg border border-slate-200/80 shadow-2xs flex items-center gap-2"
              >
                <div className="w-5 h-5 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 text-[10px] font-bold">
                  {idx + 1}
                </div>
                <span className="font-medium text-slate-800 text-[11px] truncate">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
