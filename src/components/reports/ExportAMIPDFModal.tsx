import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { generateAmiReportPdf } from '../../services/amiPdfGenerator';
import { UnimenLogo } from '../common/UnimenLogo';
import {
  FileText,
  Download,
  Printer,
  X,
  CheckCircle2,
  AlertTriangle,
  Building2,
  ShieldCheck,
  Calendar,
  Layers,
  Settings2,
  Eye,
  Award,
  Sparkles,
  HelpCircle
} from 'lucide-react';

interface ExportAMIPDFModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultUnitId?: string;
}

export const ExportAMIPDFModal: React.FC<ExportAMIPDFModalProps> = ({
  isOpen,
  onClose,
  defaultUnitId = 'all'
}) => {
  const { units, audits, findings, correctiveActions, standards, currentUser } = useApp();

  const [selectedUnitId, setSelectedUnitId] = useState<string>(defaultUnitId);
  const [academicYear, setAcademicYear] = useState<string>('2025/2026');
  const [semester, setSemester] = useState<'Ganjil' | 'Genap'>('Genap');
  const [documentNumber, setDocumentNumber] = useState<string>('042/LPM-UNIMEN/AMI-GENAP/2026');

  // Included sections
  const [includeExecutiveSummary, setIncludeExecutiveSummary] = useState<boolean>(true);
  const [includePPEPP, setIncludePPEPP] = useState<boolean>(true);
  const [includeFindings, setIncludeFindings] = useState<boolean>(true);
  const [includeCorrectiveActions, setIncludeCorrectiveActions] = useState<boolean>(true);
  const [includeSignatures, setIncludeSignatures] = useState<boolean>(true);

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [previewTab, setPreviewTab] = useState<'preview' | 'stats'>('preview');

  if (!isOpen) return null;

  // Filter Target Data based on selected unit
  let targetUnits = units;
  let targetFindings = findings;
  let targetCorrectiveActions = correctiveActions;
  let scopeLabel = 'Seluruh Universitas (Semua Fakultas & Prodi)';

  if (selectedUnitId !== 'all') {
    const unit = units.find(u => u.id === selectedUnitId);
    if (unit) {
      if (unit.type === 'Fakultas' || unit.type === 'Program Pascasarjana') {
        const childUnits = units.filter(u => u.parentUnitId === unit.id || u.id === unit.id);
        const childUnitIds = childUnits.map(u => u.id);
        targetUnits = childUnits;
        targetFindings = findings.filter(f => childUnitIds.includes(f.unitId) || f.unitName.includes(unit.code));
        targetCorrectiveActions = correctiveActions.filter(c => childUnitIds.includes(c.unitId) || c.unitName.includes(unit.code));
        scopeLabel = `${unit.name} (${unit.code})`;
      } else {
        targetUnits = [unit];
        targetFindings = findings.filter(f => f.unitId === unit.id || f.unitName === unit.name);
        targetCorrectiveActions = correctiveActions.filter(c => c.unitId === unit.id || c.unitName === unit.name);
        scopeLabel = `${unit.name} (${unit.code})`;
      }
    }
  }

  const mayorCount = targetFindings.filter(f => f.category === 'Mayor').length;
  const minorCount = targetFindings.filter(f => f.category === 'Minor').length;
  const obsCount = targetFindings.filter(f => f.category === 'Observasi').length;
  const verifiedCapCount = targetCorrectiveActions.filter(c => c.status === 'Terverifikasi' || c.status === 'Selesai').length;
  const capPercent = targetCorrectiveActions.length > 0
    ? Math.round((verifiedCapCount / targetCorrectiveActions.length) * 100)
    : 100;
  const avgQualityScore = targetUnits.length > 0
    ? (targetUnits.reduce((acc, u) => acc + u.qualityScore, 0) / targetUnits.length)
    : 3.42;

  const handleDownloadPdf = () => {
    setIsGenerating(true);
    setTimeout(() => {
      try {
        const doc = generateAmiReportPdf(
          {
            selectedUnitId,
            academicYear,
            semester,
            documentNumber,
            includeExecutiveSummary,
            includePPEPP,
            includeFindings,
            includeCorrectiveActions,
            includeSignatures
          },
          {
            units,
            audits,
            findings,
            correctiveActions,
            standards,
            currentUser
          }
        );

        const safeScope = scopeLabel.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
        const filename = `Laporan_AMI_UNIMEN_${academicYear.replace('/', '-')}_${semester}_${safeScope}.pdf`;
        doc.save(filename);
      } catch (err) {
        console.error('Error generating PDF:', err);
      } finally {
        setIsGenerating(false);
      }
    }, 150);
  };

  const handleDirectPrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-5xl my-auto flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white border-b border-emerald-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <UnimenLogo size="sm" variant="icon" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold tracking-tight">
                  Ekspor Laporan Resmi AMI ke Format PDF
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400 text-amber-950 uppercase tracking-wider">
                  Branding UNIMEN
                </span>
              </div>
              <p className="text-xs text-emerald-200">
                Lembaga Penjaminan Mutu • Standar SPMI Permendiktisaintek No. 39/2025 & AIK
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body with 2-Column Layout */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
          {/* Left Column: Configuration Settings (5 cols) */}
          <div className="lg:col-span-5 p-5 space-y-5 bg-slate-50/60 overflow-y-auto">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                <Settings2 className="w-4 h-4 text-emerald-700" />
                Parameter Laporan Audit
              </h3>

              {/* 1. Scope Selector */}
              <div className="space-y-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Cakupan Unit Kerja / Fakultas:
                  </label>
                  <select
                    value={selectedUnitId}
                    onChange={(e) => setSelectedUnitId(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-emerald-600"
                  >
                    <option value="all">★ Seluruh Universitas (Semua Fakultas & Prodi)</option>
                    <optgroup label="Fakultas & Sekolah Pascasarjana">
                      <option value="unit-fai">Fakultas Agama Islam (FAI) & 3 Prodi</option>
                      <option value="unit-fip">Fakultas Ilmu Pendidikan (FIP) & 6 Prodi</option>
                      <option value="unit-fstk">Fakultas Sains, Teknologi dan Kesehatan (FSTK) & 3 Prodi</option>
                      <option value="unit-pasca">Sekolah Pascasarjana & 2 Prodi Magister</option>
                    </optgroup>
                    <optgroup label="Program Studi Spesifik">
                      {units.filter(u => u.type === 'Program Studi').map(p => (
                        <option key={p.id} value={p.id}>
                          {p.code} - {p.name}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Tahun Akademik:
                    </label>
                    <select
                      value={academicYear}
                      onChange={(e) => setAcademicYear(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-medium"
                    >
                      <option value="2025/2026">2025/2026</option>
                      <option value="2024/2025">2024/2025</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Semester:
                    </label>
                    <select
                      value={semester}
                      onChange={(e) => setSemester(e.target.value as 'Ganjil' | 'Genap')}
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-medium"
                    >
                      <option value="Genap">Semester Genap</option>
                      <option value="Ganjil">Semester Ganjil</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Nomor Dokumen Resmi LPM:
                  </label>
                  <input
                    type="text"
                    value={documentNumber}
                    onChange={(e) => setDocumentNumber(e.target.value)}
                    className="w-full text-xs font-mono px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800"
                    placeholder="Contoh: 042/LPM-UNIMEN/AMI-GENAP/2026"
                  />
                </div>
              </div>
            </div>

            {/* 2. Component Checkboxes */}
            <div className="space-y-2 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="block text-xs font-bold text-slate-700 mb-1">
                Struktur Dokumen PDF yang Disertakan:
              </span>

              <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer p-1.5 rounded-lg hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={includeExecutiveSummary}
                  onChange={(e) => setIncludeExecutiveSummary(e.target.checked)}
                  className="rounded text-emerald-700 focus:ring-emerald-600 w-4 h-4"
                />
                <span className="font-semibold">I. Ringkasan Eksekutif & Skor Mutu (Executive Summary)</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer p-1.5 rounded-lg hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={includePPEPP}
                  onChange={(e) => setIncludePPEPP(e.target.checked)}
                  className="rounded text-emerald-700 focus:ring-emerald-600 w-4 h-4"
                />
                <span className="font-semibold">II. Matriks Kinerja Siklus PPEPP (5 Pilar SPMI)</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer p-1.5 rounded-lg hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={includeFindings}
                  onChange={(e) => setIncludeFindings(e.target.checked)}
                  className="rounded text-emerald-700 focus:ring-emerald-600 w-4 h-4"
                />
                <span className="font-semibold">III. Matriks Temuan Audit AMI (Mayor, Minor, Observasi)</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer p-1.5 rounded-lg hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={includeCorrectiveActions}
                  onChange={(e) => setIncludeCorrectiveActions(e.target.checked)}
                  className="rounded text-emerald-700 focus:ring-emerald-600 w-4 h-4"
                />
                <span className="font-semibold">IV. Status Tindak Lanjut & Rencana Pencegahan (PTK / CAP)</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer p-1.5 rounded-lg hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={includeSignatures}
                  onChange={(e) => setIncludeSignatures(e.target.checked)}
                  className="rounded text-emerald-700 focus:ring-emerald-600 w-4 h-4"
                />
                <span className="font-semibold">V. Lembar Pengesahan Resmi 4 Pimpinan + Stempel LPM</span>
              </label>
            </div>

            {/* Quick Scope Summary Card */}
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs space-y-1.5 text-emerald-900">
              <div className="flex items-center gap-1.5 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>Ringkasan Data Siap Ekspor</span>
              </div>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                Unit tercakup: <strong>{targetUnits.length} Unit</strong> • Total Temuan: <strong>{targetFindings.length}</strong> ({mayorCount} Mayor, {minorCount} Minor, {obsCount} Obs) • Rencana Tindak Lanjut: <strong>{targetCorrectiveActions.length} PTK</strong> ({capPercent}% Terealisasi).
              </p>
            </div>
          </div>

          {/* Right Column: Live Document Preview (7 cols) */}
          <div className="lg:col-span-7 p-5 flex flex-col bg-slate-100/70 overflow-hidden">
            {/* Preview Navigation Tabs */}
            <div className="flex items-center justify-between mb-3 shrink-0">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreviewTab('preview')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    previewTab === 'preview'
                      ? 'bg-emerald-800 text-white shadow-2xs'
                      : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  Pratinjau Dokumen Cetak (A4)
                </button>
                <button
                  onClick={() => setPreviewTab('stats')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    previewTab === 'stats'
                      ? 'bg-emerald-800 text-white shadow-2xs'
                      : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                  }`}
                >
                  <Award className="w-3.5 h-3.5" />
                  Statistik Skor & Kepatuhan
                </button>
              </div>

              <span className="text-[11px] font-semibold text-slate-500">
                Format: PDF Standar A4
              </span>
            </div>

            {/* Document Preview Paper Canvas */}
            <div className="flex-1 overflow-y-auto bg-white rounded-2xl border border-slate-300 shadow-sm p-5 text-slate-800 text-xs space-y-4">
              {previewTab === 'preview' ? (
                <div className="space-y-4">
                  {/* Official UNIMEN Letterhead Preview */}
                  <div className="pb-3 border-b-2 border-slate-800 text-center space-y-0.5">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-900 to-amber-500 text-white font-extrabold flex items-center justify-center text-sm shadow-xs border-2 border-amber-300 shrink-0">
                        M
                      </div>
                      <div className="text-left">
                        <span className="text-[9px] font-bold text-slate-500 uppercase block tracking-wider">
                          Pimpinan Pusat Muhammadiyah • Majelis Diktilitbang
                        </span>
                        <h4 className="text-xs sm:text-sm font-extrabold text-emerald-950 uppercase">
                          Universitas Muhammadiyah Enrekang (UNIMEN)
                        </h4>
                        <span className="text-[10px] font-bold text-emerald-800 block">
                          Lembaga Penjaminan Mutu (LPM) • Sistem Informasi Audit Mutu Internal (SIAMI)
                        </span>
                      </div>
                    </div>
                    <div className="pt-1.5 flex items-center justify-between text-[8px] text-slate-400">
                      <span>Jl. Jenderal Sudirman No. 17 Enrekang 91712</span>
                      <span>Email: lpm@unimen.ac.id</span>
                      <span>Klasifikasi: RAHASIA TERBATAS</span>
                    </div>
                    {/* Double Divider */}
                    <div className="h-0.5 bg-emerald-900 w-full mt-1" />
                    <div className="h-[1px] bg-amber-500 w-full mt-0.5" />
                  </div>

                  {/* Title */}
                  <div className="text-center space-y-0.5">
                    <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 uppercase tracking-tight">
                      Laporan Hasil Audit Mutu Internal (AMI)
                    </h3>
                    <p className="text-[10px] font-bold text-emerald-800">
                      Tahun Akademik {academicYear} Semester {semester}
                    </p>
                    <p className="text-[9px] text-slate-500 font-mono">
                      Nomor: {documentNumber}
                    </p>
                  </div>

                  {/* Metadata Table */}
                  <div className="grid grid-cols-2 gap-2 text-[10px] bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <div>
                      <span className="text-slate-500 font-medium">Lingkup Unit Kerja:</span>
                      <p className="font-bold text-slate-800">{scopeLabel}</p>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium">Status & Pengesahan:</span>
                      <p className="font-bold text-emerald-800">FINAL - Tersahkan RTM</p>
                    </div>
                  </div>

                  {/* Section I: Executive Summary Preview */}
                  {includeExecutiveSummary && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-900 border-l-4 border-emerald-700 pl-2">
                        <span>I. Ringkasan Eksekutif Kinerja Mutu</span>
                      </div>

                      <div className="grid grid-cols-4 gap-2 text-center">
                        <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200">
                          <span className="text-[9px] font-bold text-emerald-800 block">Skor Mutu</span>
                          <span className="text-base font-extrabold text-emerald-900">{avgQualityScore.toFixed(2)}</span>
                          <span className="text-[8px] text-emerald-700 block">Baik Sekali</span>
                        </div>
                        <div className="p-2 rounded-lg bg-sky-50 border border-sky-200">
                          <span className="text-[9px] font-bold text-sky-800 block">Unit Tercakup</span>
                          <span className="text-base font-extrabold text-sky-900">{targetUnits.length} Unit</span>
                          <span className="text-[8px] text-sky-700 block">100% Selesai</span>
                        </div>
                        <div className="p-2 rounded-lg bg-amber-50 border border-amber-200">
                          <span className="text-[9px] font-bold text-amber-800 block">Temuan AMI</span>
                          <span className="text-base font-extrabold text-amber-900">{targetFindings.length}</span>
                          <span className="text-[8px] text-amber-700 block">{mayorCount} Mayor / {minorCount} Minor</span>
                        </div>
                        <div className="p-2 rounded-lg bg-teal-50 border border-teal-200">
                          <span className="text-[9px] font-bold text-teal-800 block">Realisasi PTK</span>
                          <span className="text-base font-extrabold text-teal-900">{capPercent}%</span>
                          <span className="text-[8px] text-teal-700 block">Terverifikasi</span>
                        </div>
                      </div>

                      <p className="text-[10px] text-slate-600 leading-relaxed italic bg-slate-50/70 p-2 rounded-lg border border-slate-200/80">
                        "Evaluasi komprehensif mengonfirmasi pemenuhan standar kurikulum OBE, standar penelitian agropreneurship, serta integrasi nilai AIK Berkemajuan. Temuan telah diakomodasi ke dalam agenda Rapat Tinjauan Manajemen (RTM)."
                      </p>
                    </div>
                  )}

                  {/* Section III: Matriks Temuan Preview */}
                  {includeFindings && (
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-900 border-l-4 border-emerald-700 pl-2">
                        <span>III. Daftar Temuan Audit Mutu Internal ({targetFindings.length} Temuan)</span>
                      </div>

                      <div className="overflow-x-auto border border-slate-200 rounded-lg">
                        <table className="w-full text-left text-[9px]">
                          <thead className="bg-emerald-900 text-white font-bold">
                            <tr>
                              <th className="p-1.5">No Temuan</th>
                              <th className="p-1.5">Unit Kerja</th>
                              <th className="p-1.5">Standar</th>
                              <th className="p-1.5">Kat.</th>
                              <th className="p-1.5">Uraian Kesenjangan</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            {targetFindings.slice(0, 4).map(f => (
                              <tr key={f.id} className="hover:bg-slate-50">
                                <td className="p-1.5 font-mono font-bold text-slate-800">{f.findingNumber}</td>
                                <td className="p-1.5">{f.unitName}</td>
                                <td className="p-1.5">{f.standardCode}</td>
                                <td className="p-1.5 font-bold">
                                  <span className={`px-1.5 py-0.5 rounded text-[8px] ${
                                    f.category === 'Mayor' ? 'bg-rose-100 text-rose-800' :
                                    f.category === 'Minor' ? 'bg-amber-100 text-amber-800' : 'bg-sky-100 text-sky-800'
                                  }`}>
                                    {f.category}
                                  </span>
                                </td>
                                <td className="p-1.5 text-slate-600 truncate max-w-[150px]">{f.problemDescription}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {targetFindings.length > 4 && (
                        <p className="text-[9px] text-slate-400 text-center italic">
                          ...dan {targetFindings.length - 4} temuan lainnya tercetak lengkap di PDF resmi.
                        </p>
                      )}
                    </div>
                  )}

                  {/* Section IV: Status Tindak Lanjut Preview */}
                  {includeCorrectiveActions && (
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-900 border-l-4 border-emerald-700 pl-2">
                        <span>IV. Rekapitulasi Rencana Tindak Lanjut (PTK / CAP)</span>
                      </div>

                      <div className="overflow-x-auto border border-slate-200 rounded-lg">
                        <table className="w-full text-left text-[9px]">
                          <thead className="bg-emerald-900 text-white font-bold">
                            <tr>
                              <th className="p-1.5">No Temuan</th>
                              <th className="p-1.5">Rencana Tindakan Koreksi</th>
                              <th className="p-1.5">Tenggat</th>
                              <th className="p-1.5">Progres</th>
                              <th className="p-1.5">Status PTK</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            {targetCorrectiveActions.slice(0, 3).map(cap => (
                              <tr key={cap.id} className="hover:bg-slate-50">
                                <td className="p-1.5 font-mono font-bold text-slate-800">{cap.findingNumber}</td>
                                <td className="p-1.5 text-slate-600 truncate max-w-[160px]">{cap.correctivePlan}</td>
                                <td className="p-1.5 text-slate-500">{cap.targetDate}</td>
                                <td className="p-1.5 font-bold text-emerald-800">{cap.progressPercent}%</td>
                                <td className="p-1.5">
                                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                                    cap.status === 'Terverifikasi' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                  }`}>
                                    {cap.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Section V: Pengesahan Preview */}
                  {includeSignatures && (
                    <div className="pt-2 border-t border-slate-200 grid grid-cols-4 gap-2 text-center text-[8px]">
                      <div>
                        <span className="text-slate-400 block">Koordinator Auditor,</span>
                        <div className="h-8 flex items-center justify-center font-bold text-emerald-700 italic text-[9px]">
                          [Ttd Digital]
                        </div>
                        <p className="font-bold underline text-slate-800">Dr. Masnur, S.Pd., M.Pd.</p>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Dekan / Auditee,</span>
                        <div className="h-8 flex items-center justify-center font-bold text-emerald-700 italic text-[9px]">
                          [Ttd Digital]
                        </div>
                        <p className="font-bold underline text-slate-800">
                          {selectedUnitId === 'unit-fai'
                            ? 'Ahmad Dahlan, S.Pd.I., M.Pd.I.'
                            : selectedUnitId === 'unit-fstk'
                            ? 'Dr. Ismaya, S.IP., M.IP.'
                            : selectedUnitId === 'unit-pasca'
                            ? 'Dr. Drs. Yunus Busa, M.Si.'
                            : 'Dr. Ilham Assidiq, S.Pd., M.Pd.'}
                        </p>
                      </div>
                      <div className="relative">
                        <span className="text-slate-400 block">Kepala LPM,</span>
                        <div className="h-8 flex items-center justify-center">
                          <span className="px-1 py-0.5 border border-emerald-600 rounded text-[7px] text-emerald-800 font-bold bg-emerald-50">
                            ★ CAP LPM ★
                          </span>
                        </div>
                        <p className="font-bold underline text-slate-800">Dr. Dian Firdiani, S.Pd., M.Pd.</p>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Rektor UNIMEN,</span>
                        <div className="h-8 flex items-center justify-center font-bold text-emerald-700 italic text-[9px]">
                          [Disahkan]
                        </div>
                        <p className="font-bold underline text-slate-800">Dr. Drs. Syawal Sitonda, M.Ag.</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <h4 className="font-bold text-sm text-slate-900">
                    Statistik & Detail Kinerja Penjaminan Mutu ({scopeLabel})
                  </h4>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                      <span className="text-[10px] text-slate-500 font-bold uppercase">Distribusi Kategori Temuan:</span>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-rose-700 font-bold">Mayor (Tinggi):</span>
                          <span>{mayorCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-amber-700 font-bold">Minor (Sedang):</span>
                          <span>{minorCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sky-700 font-bold">Observasi (Rendah):</span>
                          <span>{obsCount}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                      <span className="text-[10px] text-slate-500 font-bold uppercase">Status Tindak Lanjut (PTK):</span>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-emerald-700 font-bold">Terverifikasi:</span>
                          <span>{verifiedCapCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-amber-700 font-bold">Dalam Proses:</span>
                          <span>{targetCorrectiveActions.length - verifiedCapCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-700 font-bold">Persentase Sukses:</span>
                          <span className="font-bold text-emerald-800">{capPercent}%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-950 space-y-2">
                    <div className="font-bold flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-700" />
                      Rekomendasi RTM Berbasis Laporan
                    </div>
                    <ul className="list-disc pl-5 space-y-1 text-[11px] text-emerald-900">
                      <li>Percepatan pengesahan bantuan stimulan penyelesaian tugas akhir doktor dosen S3 FST & FIP.</li>
                      <li>Integrasi modul e-Reviewer terpusat SIM-LPPM untuk proposal riset dan pengabdian 2026.</li>
                      <li>Pendampingan berkala Halal Center dan sertifikasi P-IRT produk mahasiswa agropreneurship binaan prodi.</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer with Action Buttons */}
        <div className="px-6 py-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Dokumen siap diekspor ke PDF resmi berkualitas tinggi (Vector Font & Grid Terformat)</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={handleDirectPrint}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span>Cetak Browser</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isGenerating}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 active:scale-95 text-white font-bold text-xs shadow-md shadow-emerald-900/20 transition disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Membuat PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-amber-300" />
                  <span>Unduh File PDF Resmi (.pdf)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
