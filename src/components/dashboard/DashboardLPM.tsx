import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  ClipboardList,
  FileCheck2,
  Users2,
  Calendar,
  Sparkles,
  Download,
  Award,
  Layers,
  ChevronRight,
  Stamp,
  ArrowRight,
  TrendingUp,
  FileText
} from 'lucide-react';
import { MatriksPPEPP } from './MatriksPPEPP';
import { PPEPPPerformanceMatrix } from './PPEPPPerformanceMatrix';
import { ExportAMIPDFModal } from '../reports/ExportAMIPDFModal';

interface DashboardLPMProps {
  onNavigateToTab: (tab: string) => void;
  onOpenAI: () => void;
}

export const DashboardLPM: React.FC<DashboardLPMProps> = ({ onNavigateToTab, onOpenAI }) => {
  const {
    units,
    audits,
    findings,
    correctiveActions,
    standards,
    rtmRecords,
    currentUser
  } = useApp();

  const [isExportPdfOpen, setIsExportPdfOpen] = useState(false);
  const [activeLpmTab, setActiveLpmTab] = useState<'ringkasan' | 'ppepp' | 'verifikasi'>('ringkasan');

  // Stats
  const totalFindings = findings.length;
  const mayorCount = findings.filter(f => f.category === 'Mayor').length;
  const minorCount = findings.filter(f => f.category === 'Minor').length;
  const obsCount = findings.filter(f => f.category === 'Observasi').length;

  const totalAudits = audits.length;
  const completedAudits = audits.filter(a => a.status === 'Selesai').length;

  const pendingVerificationCaps = correctiveActions.filter(c => c.status === 'Diajukan');
  const verifiedCaps = correctiveActions.filter(c => c.status === 'Terverifikasi' || c.status === 'Selesai');

  return (
    <div className="space-y-6">
      {/* LPM Command Center Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-emerald-700/50">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-400/20 border border-emerald-300/40 text-emerald-300 text-xs font-bold mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>LPM & Auditor Internal Command Center • Pelaksana SPMI UNIMEN</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">
              Pusat Kendali Penjaminan Mutu & Audit Internal
            </h1>
            <p className="mt-1.5 text-xs md:text-sm text-emerald-100/90 leading-relaxed">
              Pengawalan siklus PPEPP, pengelolaan bank instrumen Permendiktisaintek No. 39 Tahun 2025, koordinasi audit lapangan, serta verifikasi tindakan koreksi (PTK) seluruh program studi.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-emerald-200">
              <span><strong>Kepala LPM:</strong> Dr. Dian Firdiani, S.Pd., M.Pd.</span>
              <span className="text-emerald-500">•</span>
              <span><strong>Koordinator Auditor:</strong> Dr. Masnur, S.Pd., M.Pd.</span>
              <span className="text-emerald-500">•</span>
              <span><strong>Siklus:</strong> AMI TA 2025/2026</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 shrink-0">
            <button
              onClick={() => onNavigateToTab('audit')}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-md transition transform active:scale-95"
            >
              <ClipboardList className="w-4 h-4" />
              <span>Kelola Pelaksanaan Audit</span>
            </button>
            <button
              onClick={() => setIsExportPdfOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition active:scale-95"
            >
              <Download className="w-4 h-4 text-emerald-300" />
              <span>Ekspor Dokumen AMI Resmi</span>
            </button>
          </div>
        </div>
      </div>

      {/* LPM Quick Sub-Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-2">
        <button
          onClick={() => setActiveLpmTab('ringkasan')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeLpmTab === 'ringkasan'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Ringkasan Audit & Verifikasi Mutu</span>
        </button>
        <button
          onClick={() => setActiveLpmTab('ppepp')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeLpmTab === 'ppepp'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Matriks Kinerja Siklus PPEPP</span>
        </button>
        <button
          onClick={() => setActiveLpmTab('verifikasi')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeLpmTab === 'verifikasi'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileCheck2 className="w-3.5 h-3.5" />
          <span>Antrian Validasi PTK ({pendingVerificationCaps.length})</span>
        </button>
      </div>

      {/* If Tab PPEPP is selected */}
      {activeLpmTab === 'ppepp' ? (
        <div className="space-y-6">
          <PPEPPPerformanceMatrix />
          <MatriksPPEPP />
        </div>
      ) : activeLpmTab === 'verifikasi' ? (
        /* Antrian Verifikasi Tindak Lanjut PTK */
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-emerald-700" />
                <span>Antrian Verifikasi Bukti Tindak Lanjut Perbaikan (PTK)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Daftar perbaikan yang diajukan oleh Program Studi dan menunggu validasi auditor internal LPM.
              </p>
            </div>
            <button
              onClick={() => onNavigateToTab('tindak-lanjut')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800"
            >
              Lihat di Modul Tindak Lanjut →
            </button>
          </div>

          <div className="space-y-3">
            {correctiveActions.map(cap => (
              <div
                key={cap.id}
                className="p-4 rounded-xl border border-slate-200 hover:border-emerald-400 bg-slate-50/50 hover:bg-white transition space-y-2 text-xs"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="font-mono text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {cap.findingNumber}
                    </span>
                    <h4 className="font-bold text-slate-900 mt-1">{cap.unitName}</h4>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                    cap.status === 'Terverifikasi'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {cap.status}
                  </span>
                </div>
                <p className="text-slate-600 text-xs">
                  <strong>Rencana Perbaikan:</strong> {cap.correctivePlan}
                </p>
                <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Target Selesai: <strong>{cap.targetDate}</strong></span>
                  <span>Progress: <strong>{cap.progressPercent}%</strong></span>
                  <button
                    onClick={() => onNavigateToTab('tindak-lanjut')}
                    className="text-emerald-700 hover:text-emerald-900 font-bold"
                  >
                    Verifikasi Dokumen →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Tab Ringkasan Audit */
        <>
          {/* Top 4 KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Audit Terlaksana</span>
                <div className="p-2 bg-emerald-50 rounded-xl text-emerald-700">
                  <ClipboardList className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900">{completedAudits}</span>
                <span className="text-xs font-semibold text-slate-400">/ {totalAudits} Jadwal Audit</span>
              </div>
              <div className="mt-2 text-xs font-semibold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Visitasi Lapangan Berjalan Lancar</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Total Temuan Audit</span>
                <div className="p-2 bg-rose-50 rounded-xl text-rose-700">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-black text-rose-600">{totalFindings}</span>
                <span className="text-xs font-semibold text-slate-500">Temuan Mutu</span>
              </div>
              <div className="mt-2 text-xs text-slate-500 flex items-center gap-1">
                <span className="text-rose-600 font-bold">{mayorCount} Mayor</span>
                <span>•</span>
                <span>{minorCount} Minor</span>
                <span>•</span>
                <span>{obsCount} Obs</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Master Butir Standar</span>
                <div className="p-2 bg-blue-50 rounded-xl text-blue-700">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900">{standards.length}</span>
                <span className="text-xs font-semibold text-slate-400">Pernyataan Standar</span>
              </div>
              <div className="mt-2 text-xs font-semibold text-blue-700 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>SN-Dikti + Standar Khusus AIK</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Sesi RTM Terselenggara</span>
                <div className="p-2 bg-purple-50 rounded-xl text-purple-700">
                  <Users2 className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900">{rtmRecords.length}</span>
                <span className="text-xs font-semibold text-slate-400">Sidang Evaluasi</span>
              </div>
              <div className="mt-2 text-xs font-semibold text-purple-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Tingkat Univ & Fakultas</span>
              </div>
            </div>
          </div>

          {/* Quick Actions Grid for LPM */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              onClick={() => onNavigateToTab('instrumen')}
              className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-emerald-500 transition cursor-pointer shadow-xs group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3 group-hover:scale-105 transition">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-800">
                1. Bank Instrumen AMI
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Atur bobot, rubrik penilaian, dan referensi Permendiktisaintek No. 39 Tahun 2025.
              </p>
            </div>

            <div
              onClick={() => onNavigateToTab('temuan')}
              className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-emerald-500 transition cursor-pointer shadow-xs group"
            >
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center mb-3 group-hover:scale-105 transition">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-rose-800">
                2. Verifikasi Temuan Audit
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Kaji ulang temuan mayor & minor yang dicatatkan auditor sebelum disahkan ke auditee.
              </p>
            </div>

            <div
              onClick={() => onNavigateToTab('rtm')}
              className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-emerald-500 transition cursor-pointer shadow-xs group"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center mb-3 group-hover:scale-105 transition">
                <Users2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-purple-800">
                3. Penjadwalan RTM
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Panggil program studi dan agendakan rapat tinjauan manajemen tingkat universitas.
              </p>
            </div>
          </div>

          {/* Embedded PPEPP Performance Matrix */}
          <PPEPPPerformanceMatrix />
        </>
      )}

      {/* Export AMI PDF Modal */}
      <ExportAMIPDFModal
        isOpen={isExportPdfOpen}
        onClose={() => setIsExportPdfOpen(false)}
      />
    </div>
  );
};
