import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  GraduationCap,
  Award,
  AlertTriangle,
  CheckCircle2,
  FileCheck2,
  Upload,
  Calendar,
  Users2,
  FileText,
  Download,
  ChevronRight,
  ExternalLink,
  BookOpen,
  Sparkles,
  ShieldCheck,
  Building
} from 'lucide-react';
import { ExportAMIPDFModal } from '../reports/ExportAMIPDFModal';
import { DokumenResmiRTMModal } from '../rtm/DokumenResmiRTMModal';
import { RTMRecord } from '../../types';

interface DashboardKaprodiProps {
  onNavigateToTab: (tab: string) => void;
  onOpenAI: () => void;
}

export const DashboardKaprodi: React.FC<DashboardKaprodiProps> = ({ onNavigateToTab, onOpenAI }) => {
  const {
    units,
    audits,
    findings,
    correctiveActions,
    rtmRecords,
    currentUser
  } = useApp();

  const [isExportPdfOpen, setIsExportPdfOpen] = useState(false);
  const [selectedRtmRecord, setSelectedRtmRecord] = useState<RTMRecord | null>(null);

  // Prodis list
  const prodiUnits = units.filter(u => u.type === 'Program Studi');

  // Identify Current User's Prodi
  // If the user's unit is already a Prodi, use it; otherwise default to the first matching or S1 PGSD
  const initialProdi = prodiUnits.find(p => p.id === currentUser.unitId || p.name.includes(currentUser.unitName)) || prodiUnits[0];
  const [selectedProdiId, setSelectedProdiId] = useState<string>(initialProdi.id);

  const activeProdi = prodiUnits.find(p => p.id === selectedProdiId) || initialProdi;
  const parentFaculty = units.find(u => u.id === activeProdi.parentUnitId);

  // Filter Findings & Corrective Actions for this Prodi
  const prodiFindings = findings.filter(f => f.unitId === activeProdi.id || f.unitName.includes(activeProdi.name) || f.unitName.includes(activeProdi.code));
  const mayorFindings = prodiFindings.filter(f => f.category === 'Mayor');
  const minorFindings = prodiFindings.filter(f => f.category === 'Minor');
  const obsFindings = prodiFindings.filter(f => f.category === 'Observasi');

  const prodiCaps = correctiveActions.filter(c => c.unitId === activeProdi.id || c.unitName.includes(activeProdi.name) || c.unitName.includes(activeProdi.code));
  const verifiedCaps = prodiCaps.filter(c => c.status === 'Terverifikasi' || c.status === 'Selesai');
  const capPercent = prodiCaps.length > 0 ? Math.round((verifiedCaps.length / prodiCaps.length) * 100) : 100;

  // Audits for this prodi
  const prodiAudit = audits.find(a => a.unitId === activeProdi.id);

  // RTM summoning status: Is this prodi summoned in any RTM?
  const summonedRtm = rtmRecords.find(r => r.summonedUnitNames?.some(name => name.toLowerCase().includes(activeProdi.name.toLowerCase()) || name.toLowerCase().includes(activeProdi.code.toLowerCase())));

  return (
    <div className="space-y-6">
      {/* Kaprodi Executive Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-teal-900 via-emerald-900 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-emerald-700/50">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-400/20 border border-emerald-300/40 text-emerald-300 text-xs font-bold mb-3">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Dashboard Kinerja Program Studi • Portal Auditee AMI</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">
              {activeProdi.name}
            </h1>
            <p className="mt-1.5 text-xs md:text-sm text-emerald-100/90 leading-relaxed">
              Monitoring kepatuhan 9 kriteria akreditasi, penyelesaian tindakan koreksi temuan audit (PTK), kesiapan berkas kurikulum OBE, dan pelaporan evaluasi pimpinan.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-emerald-200">
              <span><strong>Ketua Program Studi:</strong> {activeProdi.headName}</span>
              <span className="text-emerald-500">•</span>
              <span><strong>Fakultas:</strong> {parentFaculty?.name || 'Fakultas'}</span>
              <span className="text-emerald-500">•</span>
              <span><strong>Kode:</strong> {activeProdi.code}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 shrink-0">
            {/* Prodi Selector Switcher */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-1 border border-white/20">
              <select
                value={selectedProdiId}
                onChange={(e) => setSelectedProdiId(e.target.value)}
                className="bg-transparent text-white font-bold text-xs px-3 py-1.5 rounded-lg outline-none cursor-pointer focus:bg-emerald-900"
              >
                {prodiUnits.map(p => (
                  <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setIsExportPdfOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-md transition transform active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Unduh Berita Acara Audit</span>
            </button>
          </div>
        </div>
      </div>

      {/* RTM Summoning Alert if prodi is called */}
      {summonedRtm && (
        <div className="p-4 bg-amber-50 border-2 border-amber-400/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm animate-pulse">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-200 text-amber-900 rounded-xl font-bold">
              <Users2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                Perhatian: {activeProdi.name} Terpanggil dalam Sidang RTM ({summonedRtm.meetingNumber || 'RTM-UNIMEN'})
              </h3>
              <p className="text-xs text-amber-900 mt-0.5">
                Pimpinan Universitas / Dekan menjadwalkan evaluasi khusus terkait: <strong>{summonedRtm.agenda}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedRtmRecord(summonedRtm)}
            className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition shrink-0"
          >
            Buka Dokumen Panggilan →
          </button>
        </div>
      )}

      {/* Top 4 Kaprodi KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Skor Mutu Prodi</span>
            <div className="p-2 bg-emerald-50 rounded-xl text-emerald-700">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{activeProdi.qualityScore.toFixed(2)}</span>
            <span className="text-xs font-semibold text-slate-400">/ target {activeProdi.targetScore.toFixed(2)}</span>
          </div>
          <div className="mt-2 text-xs font-semibold text-emerald-700 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Memenuhi Standar Akreditasi Unggul</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Temuan Audit Lapangan</span>
            <div className="p-2 bg-rose-50 rounded-xl text-rose-700">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-rose-600">{prodiFindings.length}</span>
            <span className="text-xs font-semibold text-slate-500">Total Butir</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1">
            <span className="text-rose-600 font-bold">{mayorFindings.length} Mayor</span>
            <span>•</span>
            <span>{minorFindings.length} Minor</span>
            <span>•</span>
            <span>{obsFindings.length} Obs</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Penyelesaian Tindakan Koreksi (PTK)</span>
            <div className="p-2 bg-purple-50 rounded-xl text-purple-700">
              <FileCheck2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{capPercent}%</span>
            <span className="text-xs font-semibold text-slate-400">({verifiedCaps.length}/{prodiCaps.length})</span>
          </div>
          <div className="mt-2 text-xs font-semibold text-purple-700 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Telah Dikirimkan ke Auditor</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Status Audit Mutu Lapangan</span>
            <div className="p-2 bg-blue-50 rounded-xl text-blue-700">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-xl font-bold text-slate-900">{prodiAudit?.status || 'Selesai'}</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Lead Auditor: <strong>Dr. Masnur, S.Pd., M.Pd.</strong>
          </div>
        </div>
      </div>

      {/* Main Grid: Action items for Kaprodi */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Temuan Audit & Form Tindak Lanjut PTK */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Daftar Temuan Audit Mutu Internal (AMI) Prodi</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Butir temuan yang memerlukan tindak lanjut perbaikan dan pengunggahan bukti dokumen.
                </p>
              </div>
              <button
                onClick={() => onNavigateToTab('temuan')}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800"
              >
                Lihat di Tab Temuan →
              </button>
            </div>

            {prodiFindings.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs bg-slate-50 rounded-xl border border-slate-200">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <p className="font-bold text-slate-700">Tidak ada temuan terbuka pada program studi ini.</p>
                <p className="text-[11px] text-slate-500 mt-1">Seluruh butir standar mutu terpenuhi dengan predikat memuaskan.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {prodiFindings.map(f => (
                  <div
                    key={f.id}
                    className="p-4 rounded-xl border border-slate-200 hover:border-emerald-500 bg-slate-50/50 hover:bg-white transition space-y-2 text-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          f.category === 'Mayor' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {f.category}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400">ID: {f.id}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">{f.createdAt}</span>
                    </div>

                    <p className="font-bold text-slate-900">{f.problemDescription}</p>
                    <p className="text-slate-600 text-[11px] bg-white p-2.5 rounded-lg border border-slate-100">
                      <strong>Rekomendasi Auditor:</strong> {f.recommendation}
                    </p>

                    <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Status: <strong>{f.status}</strong></span>
                      <button
                        onClick={() => onNavigateToTab('tindak-lanjut')}
                        className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold flex items-center gap-1 shadow-2xs"
                      >
                        <Upload className="w-3 h-3" />
                        <span>Unggah Bukti Perbaikan (PTK)</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Dokumen Persyaratan & Bukti Digital Kurikulum OBE */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-700" />
              <span>Kelengkapan Berkas Kurikulum OBE & Mutu Prodi</span>
            </h2>
            <p className="text-xs text-slate-500">
              Daftar dokumen eviden wajib yang diinspeksi auditor internal UNIMEN sesuai Permendiktisaintek No. 39 Tahun 2025:
            </p>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900">1. RPS Berbasis Outcome-Based Education (OBE)</h4>
                  <p className="text-[11px] text-slate-500">Rencana Pembelajaran Semester selaras CPL</p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-200 text-emerald-900">Lengkap</span>
              </div>

              <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900">2. Portofolio Asesmen & Evaluasi CPL</h4>
                  <p className="text-[11px] text-slate-500">Rekapitulasi pencapaian kelulusan mahasiswa</p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-200 text-emerald-900">Lengkap</span>
              </div>

              <div className="p-3 rounded-xl border border-amber-200 bg-amber-50/50 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900">3. Luaran Penelitian & Pengabdian Dosen</h4>
                  <p className="text-[11px] text-slate-500">Publikasi jurnal bereputasi Sinta & HKI</p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-200 text-amber-900">Perlu Pembaruan</span>
              </div>

              <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900">4. Sertifikasi BTA & Kemuhammadiyahan (AIK)</h4>
                  <p className="text-[11px] text-slate-500">Sertifikat baca tulis Al-Qur'an mahasiswa prodi</p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-200 text-emerald-900">Lengkap</span>
              </div>
            </div>

            <button
              onClick={() => onNavigateToTab('audit')}
              className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
            >
              <span>Buka Formulir Evaluasi Diri Prodi</span>
              <ChevronRight className="w-4 h-4" />
            </button>
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
