import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ClipboardList,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  Calendar,
  Search,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  FileSpreadsheet,
  Award,
  Layers,
  Sparkles
} from 'lucide-react';

interface DashboardAuditorLapanganProps {
  onNavigateToTab: (tab: string) => void;
  onOpenAI: () => void;
}

export const DashboardAuditorLapangan: React.FC<DashboardAuditorLapanganProps> = ({
  onNavigateToTab,
  onOpenAI
}) => {
  const { audits, findings, correctiveActions, units, currentUser } = useApp();

  const [searchQuery, setSearchQuery] = useState('');

  // Assigned Audits
  const assignedAudits = audits;
  const filteredAudits = assignedAudits.filter(a =>
    a.unitName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (a.leadAuditorName && a.leadAuditorName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const pendingVerificationCaps = correctiveActions.filter(c => c.status === 'Diajukan');
  const openFindings = findings.filter(f => f.status === 'Open' || f.status === 'In Progress');

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-emerald-950 text-white rounded-2xl p-6 shadow-xl border border-teal-700/50 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-400/20 border border-teal-300/40 text-teal-300 text-xs font-bold mb-3">
            <ClipboardList className="w-3.5 h-3.5" />
            <span>Kertas Kerja & Dashboard Auditor Internal Lapangan</span>
          </div>
          <h1 className="text-2xl font-black">
            Portal Penugasan & Audit Mutu Lapangan
          </h1>
          <p className="mt-1 text-xs text-slate-300">
            Pemeriksaan eviden butir instrumen SN-Dikti, pencatatan temuan visitasi (Mayor/Minor/Observasi), dan validasi dokumen perbaikan auditee.
          </p>
          <div className="mt-3 flex items-center gap-3 text-xs text-teal-200">
            <span><strong>Auditor:</strong> {currentUser.name}</span>
            <span>•</span>
            <span><strong>Unit:</strong> {currentUser.unitName}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 shrink-0">
          <button
            onClick={() => onNavigateToTab('audit')}
            className="px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-md transition"
          >
            Buka Kertas Kerja Audit
          </button>
          <button
            onClick={() => onNavigateToTab('temuan')}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition"
          >
            Catat Temuan Baru
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Jadwal Visitasi Lapangan</span>
            <Calendar className="w-5 h-5 text-teal-600" />
          </div>
          <p className="text-3xl font-black text-slate-900 mt-2">{assignedAudits.length}</p>
          <p className="text-xs text-teal-700 font-semibold mt-1">Unit & Prodi Terdaftar</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Temuan Mutu Aktif</span>
            <AlertTriangle className="w-5 h-5 text-rose-600" />
          </div>
          <p className="text-3xl font-black text-rose-600 mt-2">{openFindings.length}</p>
          <p className="text-xs text-slate-500 mt-1">Dalam proses perbaikan oleh auditee</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Menunggu Validasi Bukti</span>
            <FileCheck2 className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl font-black text-purple-600 mt-2">{pendingVerificationCaps.length}</p>
          <p className="text-xs text-purple-700 font-semibold mt-1">Dokumen PTK terunggah</p>
        </div>
      </div>

      {/* Assigned Audit List */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Daftar Penugasan Audit Unit Kerja</h3>
            <p className="text-xs text-slate-500">Klik unit kerja untuk memulai pemeriksaan instrumen dan penilaian CPL/RPS.</p>
          </div>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari prodi / auditee..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 outline-none focus:border-teal-500"
            />
          </div>
        </div>

        <div className="space-y-2.5">
          {filteredAudits.map(audit => (
            <div
              key={audit.id}
              className="p-4 rounded-xl border border-slate-200 hover:border-teal-500 bg-slate-50/50 hover:bg-white transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div>
                <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  {audit.programName || 'Siklus AMI 2025/2026'}
                </span>
                <h4 className="font-bold text-slate-900 mt-1">{audit.unitName}</h4>
                <p className="text-slate-500 text-[11px]">
                  Lead Auditor: <strong>{audit.leadAuditorName}</strong> {audit.memberAuditorName ? `• Anggota: ${audit.memberAuditorName}` : ''}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                  audit.status === 'Selesai'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {audit.status}
                </span>
                <button
                  onClick={() => onNavigateToTab('audit')}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-teal-700 text-white font-bold rounded-lg transition"
                >
                  Periksa Instrumen →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
