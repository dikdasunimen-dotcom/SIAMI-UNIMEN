import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UnimenLogo } from '../common/UnimenLogo';
import { ExportAMIPDFModal } from './ExportAMIPDFModal';
import { generateAmiReportPdf } from '../../services/amiPdfGenerator';
import {
  FileText,
  Printer,
  Download,
  Building,
  CheckCircle2,
  AlertTriangle,
  Award,
  Layers,
  ShieldCheck,
  Scale,
  Sparkles,
  Filter,
  CheckCircle,
  Clock,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  FileCheck
} from 'lucide-react';

export const ModulLaporan: React.FC = () => {
  const { units, audits, findings, standards, correctiveActions, currentUser } = useApp();

  const [activeReportType, setActiveReportType] = useState<
    'laporan-ami' | 'temuan-ptk' | 'rekap-unit' | 'risiko' | 'rekap-standar'
  >('laporan-ami');

  const [facultyFilter, setFacultyFilter] = useState<string>('all');
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isGeneratingDirectPdf, setIsGeneratingDirectPdf] = useState<boolean>(false);

  const univUnit = units.find(u => u.type === 'Universitas') || units[0];

  // Filtering based on faculty
  let filteredUnits = units;
  let filteredFindings = findings;
  let filteredCorrectiveActions = correctiveActions;
  let currentScopeTitle = 'Seluruh Unit Universitas (Semua Fakultas & Prodi)';

  if (facultyFilter !== 'all') {
    const parent = units.find(u => u.id === facultyFilter);
    if (parent) {
      currentScopeTitle = `${parent.name} (${parent.code})`;
      const childUnits = units.filter(u => u.parentUnitId === parent.id || u.id === parent.id);
      const childIds = childUnits.map(u => u.id);
      filteredUnits = childUnits;
      filteredFindings = findings.filter(f => childIds.includes(f.unitId) || f.unitName.includes(parent.code));
      filteredCorrectiveActions = correctiveActions.filter(c => childIds.includes(c.unitId) || c.unitName.includes(parent.code));
    }
  }

  const mayorCount = filteredFindings.filter(f => f.category === 'Mayor').length;
  const minorCount = filteredFindings.filter(f => f.category === 'Minor').length;
  const obsCount = filteredFindings.filter(f => f.category === 'Observasi').length;

  const totalCap = filteredCorrectiveActions.length;
  const verifiedCap = filteredCorrectiveActions.filter(c => c.status === 'Terverifikasi' || c.status === 'Selesai').length;
  const capRealizationPercent = totalCap > 0 ? Math.round((verifiedCap / totalCap) * 100) : 100;

  const avgScore = filteredUnits.length > 0
    ? (filteredUnits.reduce((acc, u) => acc + u.qualityScore, 0) / filteredUnits.length)
    : 3.42;

  const handlePrint = () => {
    window.print();
  };

  const handleDirectDownloadPdf = () => {
    setIsGeneratingDirectPdf(true);
    setTimeout(() => {
      try {
        const doc = generateAmiReportPdf(
          {
            selectedUnitId: facultyFilter,
            academicYear: '2025/2026',
            semester: 'Genap',
            documentNumber: '042/LPM-UNIMEN/AMI-GENAP/2026',
            includeExecutiveSummary: true,
            includePPEPP: true,
            includeFindings: true,
            includeCorrectiveActions: true,
            includeSignatures: true
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

        const safeTitle = currentScopeTitle.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 25);
        doc.save(`Laporan_AMI_UNIMEN_Genap_2025-2026_${safeTitle}.pdf`);
      } catch (err) {
        console.error('Error generating direct PDF:', err);
      } finally {
        setIsGeneratingDirectPdf(false);
      }
    }, 150);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner (hidden on print) */}
      <div className="print:hidden bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-emerald-500/10 to-transparent pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="p-2 rounded-xl bg-emerald-800 text-white shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Laporan & Ekspor Audit Mutu Internal (AMI) UNIMEN
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
              Format Resmi PDF & Cetak
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1.5 max-w-2xl leading-relaxed">
            Ekspor resmi dokumen Laporan Hasil Audit, Ringkasan Eksekutif Mutu, Matriks Temuan AMI, Rekapitulasi Rencana Tindak Lanjut (PTK/CAP), dan Pengesahan Rektorat berstandar SPMI Permendiktisaintek No. 39 Tahun 2025.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="relative z-10 flex items-center gap-2.5 flex-wrap shrink-0">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs transition active:scale-95"
            title="Cetak via browser atau simpan sebagai PDF"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Cetak Dokumen</span>
          </button>

          <button
            onClick={handleDirectDownloadPdf}
            disabled={isGeneratingDirectPdf}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-sm shadow-emerald-900/20 transition active:scale-95 disabled:opacity-50"
            title="Unduh langsung file PDF Laporan AMI"
          >
            {isGeneratingDirectPdf ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Memproses...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-amber-300" />
                <span>Unduh PDF Cepat</span>
              </>
            )}
          </button>

          <button
            onClick={() => setIsExportModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-900 to-teal-900 hover:from-emerald-950 hover:to-teal-950 text-white font-bold text-xs shadow-md shadow-emerald-950/20 transition active:scale-95 border border-amber-400/40"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Kustomisasi & Ekspor PDF</span>
          </button>
        </div>
      </div>

      {/* Filter and Tab Bar (hidden on print) */}
      <div className="print:hidden bg-white p-3 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Report Section Tabs */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setActiveReportType('laporan-ami')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeReportType === 'laporan-ami'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>1. Ringkasan Eksekutif & Hasil AMI</span>
          </button>

          <button
            onClick={() => setActiveReportType('temuan-ptk')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeReportType === 'temuan-ptk'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>2. Matriks Temuan & Status Tindak Lanjut</span>
          </button>

          <button
            onClick={() => setActiveReportType('rekap-unit')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeReportType === 'rekap-unit'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>3. Rekap Capaian Mutu Fakultas & Prodi</span>
          </button>

          <button
            onClick={() => setActiveReportType('rekap-standar')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeReportType === 'rekap-standar'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>4. Capaian Standar (Permendikti 39 & AIK)</span>
          </button>

          <button
            onClick={() => setActiveReportType('risiko')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeReportType === 'risiko'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>5. Matriks Risiko Mutu & Mitigasi</span>
          </button>
        </div>

        {/* Filter by Faculty dropdown */}
        <div className="flex items-center gap-2 shrink-0">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-bold text-slate-600">Filter Unit:</span>
          <select
            value={facultyFilter}
            onChange={(e) => setFacultyFilter(e.target.value)}
            className="text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-emerald-600"
          >
            <option value="all">Semua Universitas (13 Unit)</option>
            <option value="unit-fai">Fakultas Agama Islam (FAI)</option>
            <option value="unit-fip">Fakultas Ilmu Pendidikan (FIP)</option>
            <option value="unit-fstk">Fakultas Sains, Teknologi & Kes. (FSTK)</option>
            <option value="unit-pasca">Sekolah Pascasarjana</option>
          </select>
        </div>
      </div>

      {/* Printable Report Canvas */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-8 shadow-sm print:p-0 print:border-none print:shadow-none space-y-6">
        {/* Official Letterhead (KOP SURAT) */}
        <div className="text-center pb-4 border-b-2 border-slate-900 space-y-1.5">
          <div className="flex items-center justify-center gap-4">
            <UnimenLogo size="lg" variant="icon" />
            <div className="text-left">
              <h3 className="text-xs font-bold tracking-widest text-slate-600 uppercase">
                Pimpinan Pusat Muhammadiyah • Majelis Pendidikan Tinggi Penelitian dan Pengembangan
              </h3>
              <h1 className="text-lg sm:text-2xl font-extrabold text-emerald-950 uppercase tracking-tight">
                Universitas Muhammadiyah Enrekang (UNIMEN)
              </h1>
              <p className="text-xs sm:text-sm font-bold text-emerald-800">
                Lembaga Penjaminan Mutu (LPM) • Sistem Informasi Audit Mutu Internal (SIAMI)
              </p>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 pt-1">
            Kampus I: Jl. Jenderal Sudirman No. 17 Enrekang, Sulawesi Selatan 91712 | Email: lpm@unimen.ac.id | Telp: (0420) 21123 | Laman: https://unimen.ac.id
          </p>

          {/* Double Rule Divider */}
          <div className="h-1 bg-emerald-900 w-full mt-2" />
          <div className="h-0.5 bg-amber-500 w-full mt-0.5" />
        </div>

        {/* 1. LAPORAN HASIL AMI & RINGKASAN EKSEKUTIF */}
        {activeReportType === 'laporan-ami' && (
          <div className="space-y-6 text-xs text-slate-800">
            <div className="text-center space-y-1">
              <h2 className="text-lg font-extrabold text-slate-900 uppercase">
                Laporan Resmi Hasil Audit Mutu Internal (AMI)
              </h2>
              <p className="font-bold text-emerald-800 text-sm">
                Siklus SPMI Permendiktisaintek No. 39 Tahun 2025 • Tahun Akademik 2025/2026 Semester Genap
              </p>
              <p className="text-xs text-slate-500 font-mono">
                Nomor Dokumen: 042/LPM-UNIMEN/AMI-GENAP/2026
              </p>
            </div>

            {/* Document Metadata Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Lingkup Penjaminan Mutu</span>
                <span className="font-bold text-slate-900 text-xs">{currentScopeTitle}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Periode Audit & RTM</span>
                <span className="font-bold text-slate-900 text-xs">20 Maret - 10 April 2026</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Status Dokumen</span>
                <span className="inline-flex items-center gap-1 font-bold text-emerald-700 text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  FINAL - Tersahkan RTM Universitas
                </span>
              </div>
            </div>

            {/* I. Landasan Yuridis */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="font-bold text-slate-900 block uppercase text-[11px] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                I. Landasan Yuridis & Kerangka Regulasi SPMI
              </span>
              <ul className="list-disc pl-5 space-y-1 text-slate-700 leading-relaxed">
                <li>Permendiktisaintek Nomor 39 Tahun 2025 tentang Penjaminan Mutu Pendidikan Tinggi.</li>
                <li>Standar Nasional Pendidikan Tinggi (SN Dikti) dan Standar Pendidikan Tinggi UNIMEN.</li>
                <li>Standar Al-Islam dan Kemuhammadiyahan (AIK) Majelis Diktilitbang PP Muhammadiyah.</li>
                <li>Statuta dan Standar Kekhasan Agropreneurship & Edutech Universitas Muhammadiyah Enrekang.</li>
              </ul>
            </div>

            {/* II. Ringkasan Eksekutif Skor Mutu */}
            <div className="space-y-3">
              <span className="font-bold text-slate-900 block uppercase text-[11px] flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-700" />
                II. Ringkasan Eksekutif Kinerja Mutu (Executive Summary)
              </span>

              {/* KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-2xs">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase block">Skor Rata-Rata Mutu</span>
                  <span className="text-3xl font-extrabold text-emerald-900 my-1 block">{avgScore.toFixed(2)}</span>
                  <span className="text-[10px] font-semibold text-emerald-700 block">Predikat: Baik Sekali</span>
                </div>

                <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 shadow-2xs">
                  <span className="text-[10px] font-bold text-sky-800 uppercase block">Unit Terverifikasi</span>
                  <span className="text-3xl font-extrabold text-sky-900 my-1 block">{filteredUnits.length} Unit</span>
                  <span className="text-[10px] font-semibold text-sky-700 block">100% Ketercakupan</span>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 shadow-2xs">
                  <span className="text-[10px] font-bold text-amber-800 uppercase block">Total Temuan AMI</span>
                  <span className="text-3xl font-extrabold text-amber-900 my-1 block">{filteredFindings.length}</span>
                  <span className="text-[10px] font-semibold text-amber-700 block">{mayorCount} Mayor • {minorCount} Minor • {obsCount} Obs</span>
                </div>

                <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 shadow-2xs">
                  <span className="text-[10px] font-bold text-teal-800 uppercase block">Realisasi Tindak Lanjut</span>
                  <span className="text-3xl font-extrabold text-teal-900 my-1 block">{capRealizationPercent}%</span>
                  <span className="text-[10px] font-semibold text-teal-700 block">{verifiedCap} dari {totalCap} PTK Terverifikasi</span>
                </div>
              </div>

              {/* Narrative Analysis */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2 leading-relaxed text-slate-700">
                <p>
                  Berdasarkan audit komprehensif yang dilaksanakan oleh Tim Auditor Internal LPM UNIMEN pada periode Semester Genap Tahun Akademik 2025/2026, implementasi 5 pilar SPMI (Penetapan, Pelaksanaan, Evaluasi, Pengendalian, dan Peningkatan - PPEPP) telah terlaksana secara konsisten pada {currentScopeTitle}.
                </p>
                <p>
                  Seluruh program studi telah mengimplementasikan kurikulum berbasis Outcome-Based Education (OBE) dan mengintegrasikan risalah Islam Berkemajuan serta fatwa Majelis Tarjih kontemporer. Sebanyak {totalCap} Rencana Tindakan Koreksi dan Pencegahan (PTK/CAP) telah dirumuskan bersama antara auditee dan auditor, dengan tingkat penyelesaian fisik mencapai {capRealizationPercent}%.
                </p>
              </div>
            </div>

            {/* III. Rekapitulasi Temuan Kritis AMI */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 block uppercase text-[11px] flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-emerald-700" />
                  III. Rekapitulasi Temuan Audit Mutu Internal
                </span>
                <span className="text-xs text-slate-500 font-semibold">
                  Menampilkan {filteredFindings.length} temuan
                </span>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-2xl shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-800 font-bold">
                    <tr>
                      <th className="p-3 border-b">No Temuan</th>
                      <th className="p-3 border-b">Unit Kerja</th>
                      <th className="p-3 border-b">Standar SPMI</th>
                      <th className="p-3 border-b text-center">Kategori</th>
                      <th className="p-3 border-b">Uraian Kesenjangan</th>
                      <th className="p-3 border-b">Tenggat</th>
                      <th className="p-3 border-b text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredFindings.map(f => (
                      <tr key={f.id} className="hover:bg-slate-50/80">
                        <td className="p-3 font-mono font-bold text-slate-900">{f.findingNumber}</td>
                        <td className="p-3 font-semibold text-slate-800">{f.unitName}</td>
                        <td className="p-3 text-slate-600">
                          <span className="font-bold block text-slate-800">{f.standardCode}</span>
                          <span className="text-[11px]">{f.standardName}</span>
                        </td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            f.category === 'Mayor' ? 'bg-rose-100 text-rose-800' :
                            f.category === 'Minor' ? 'bg-amber-100 text-amber-800' : 'bg-sky-100 text-sky-800'
                          }`}>
                            {f.category}
                          </span>
                        </td>
                        <td className="p-3 text-slate-700 max-w-xs">{f.problemDescription}</td>
                        <td className="p-3 text-slate-500 whitespace-nowrap">{f.deadline}</td>
                        <td className="p-3 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                            {f.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* IV. Rekapitulasi Tindak Lanjut & Pencegahan (CAP / PTK) */}
            <div className="space-y-2">
              <span className="font-bold text-slate-900 block uppercase text-[11px] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                IV. Rekapitulasi Rencana Tindak Lanjut & Pencegahan (PTK / CAP)
              </span>

              <div className="overflow-x-auto border border-slate-200 rounded-2xl shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-800 font-bold">
                    <tr>
                      <th className="p-3 border-b">No Temuan</th>
                      <th className="p-3 border-b">Unit Kerja</th>
                      <th className="p-3 border-b">Rencana Tindakan Koreksi & Pencegahan</th>
                      <th className="p-3 border-b">Target Output Bukti</th>
                      <th className="p-3 border-b text-center">Progres</th>
                      <th className="p-3 border-b text-center">Status Verifikasi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredCorrectiveActions.map(c => (
                      <tr key={c.id} className="hover:bg-slate-50/80">
                        <td className="p-3 font-mono font-bold text-slate-900">{c.findingNumber}</td>
                        <td className="p-3 font-semibold text-slate-800">{c.unitName}</td>
                        <td className="p-3 text-slate-700 max-w-sm space-y-1">
                          <div><strong>Koreksi:</strong> {c.correctivePlan}</div>
                          <div className="text-[11px] text-slate-500"><strong>Pencegahan:</strong> {c.preventivePlan}</div>
                        </td>
                        <td className="p-3 text-slate-600">{c.targetOutput}</td>
                        <td className="p-3 text-center">
                          <span className="font-extrabold text-emerald-800">{c.progressPercent}%</span>
                        </td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            c.status === 'Terverifikasi' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {c.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* V. Lembar Tanda Tangan & Pengesahan Dokumen 4 Pimpinan */}
            <div className="pt-8 border-t border-slate-200 space-y-4">
              <span className="font-bold text-slate-900 block uppercase text-[11px] text-center">
                V. Lembar Pengesahan Hasil Audit Mutu Internal (AMI) & Berita Acara RTM
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <p className="text-slate-500 text-[11px]">Enrekang, 10 April 2026</p>
                  <p className="font-bold text-slate-800">Koordinator Auditor Internal,</p>
                  <div className="h-14 flex items-center justify-center font-bold text-emerald-800 italic">
                    [Ttd Digital Terverifikasi]
                  </div>
                  <p className="font-bold underline text-slate-900">Dr. Masnur, S.Pd., M.Pd.</p>
                  <p className="text-[11px] text-slate-500">NIDN: 0917028101</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <p className="text-slate-500 text-[11px]">Menerima Hasil,</p>
                  <p className="font-bold text-slate-800">Dekan / Pimpinan Auditee,</p>
                  <div className="h-14 flex items-center justify-center font-bold text-emerald-800 italic">
                    [Ttd Digital Terverifikasi]
                  </div>
                  <p className="font-bold underline text-slate-900">
                    {facultyFilter === 'unit-fai'
                      ? 'Ahmad Dahlan, S.Pd.I., M.Pd.I.'
                      : facultyFilter === 'unit-fstk'
                      ? 'Dr. Ismaya, S.IP., M.IP.'
                      : facultyFilter === 'unit-pasca'
                      ? 'Dr. Drs. Yunus Busa, M.Si.'
                      : 'Dr. Ilham Assidiq, S.Pd., M.Pd.'}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {facultyFilter === 'unit-fai'
                      ? 'Dekan FAI'
                      : facultyFilter === 'unit-fstk'
                      ? 'Dekan FSTK'
                      : facultyFilter === 'unit-pasca'
                      ? 'Direktur Pascasarjana'
                      : 'Dekan FIP'}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1 relative">
                  <p className="text-slate-500 text-[11px]">Mengetahui,</p>
                  <p className="font-bold text-slate-800">Kepala LPM UNIMEN,</p>
                  <div className="h-14 flex items-center justify-center">
                    <span className="px-2 py-1 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-400">
                      ★ STEMPEL RESMI LPM ★
                    </span>
                  </div>
                  <p className="font-bold underline text-slate-900">Dr. Dian Firdiani, S.Pd., M.Pd.</p>
                  <p className="text-[11px] text-slate-500">NIDN: 0921037702</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <p className="text-slate-500 text-[11px]">Menyetujui & Mengesahkan,</p>
                  <p className="font-bold text-slate-800">Rektor UNIMEN,</p>
                  <div className="h-14 flex items-center justify-center font-bold text-emerald-800 italic">
                    [Ttd & Cap Universitas]
                  </div>
                  <p className="font-bold underline text-slate-900">Dr. Drs. Syawal Sitonda, M.Ag.</p>
                  <p className="text-[11px] text-slate-500">NIDN: 0015086401</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. MATRIKS TEMUAN & STATUS TINDAK LANJUT TERPADU */}
        {activeReportType === 'temuan-ptk' && (
          <div className="space-y-6 text-xs text-slate-800">
            <div className="text-center space-y-1">
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 uppercase">
                Matriks Temuan Audit & Status Rencana Tindak Lanjut (CAP / PTK)
              </h2>
              <p className="text-xs text-slate-600 font-semibold">
                Integrasi Temuan Lapangan, Akar Masalah (Root Cause), Analisis Risiko & Bukti Verifikasi Auditor
              </p>
            </div>

            <div className="space-y-4">
              {filteredFindings.map((finding) => {
                const cap = filteredCorrectiveActions.find(c => c.findingId === finding.id || c.findingNumber === finding.findingNumber);

                return (
                  <div key={finding.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3 shadow-2xs">
                    {/* Header Finding */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-extrabold text-sm text-slate-900">
                          {finding.findingNumber}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          finding.category === 'Mayor' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                          finding.category === 'Minor' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                          'bg-sky-100 text-sky-800 border border-sky-300'
                        }`}>
                          Kategori: {finding.category}
                        </span>
                        <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                          {finding.unitName}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-500 font-medium">
                        Standar: <strong>{finding.standardCode}</strong> ({finding.standardName})
                      </div>
                    </div>

                    {/* Problem Description & Root Cause */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                        <span className="font-bold text-slate-800 block text-[11px]">
                          Uraian Kesenjangan / Bukti Temuan:
                        </span>
                        <p className="text-slate-700 leading-relaxed">{finding.problemDescription}</p>
                        <p className="text-[10px] text-slate-400">Bukti: {finding.evidenceRef}</p>
                      </div>

                      <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                        <span className="font-bold text-slate-800 block text-[11px]">
                          Akar Masalah & Analisis Risiko Mutu:
                        </span>
                        <p className="text-slate-700 leading-relaxed">
                          <strong>Akar Masalah:</strong> {finding.rootCause}
                        </p>
                        <p className="text-rose-700 text-[11px] leading-relaxed">
                          <strong>Risiko Mutu:</strong> {finding.riskAnalysis}
                        </p>
                      </div>
                    </div>

                    {/* Corrective Action Status */}
                    {cap ? (
                      <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs space-y-2">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                            Rencana Tindak Lanjut & Pencegahan (PTK / CAP)
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-emerald-800">
                              Progres: {cap.progressPercent}%
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              cap.status === 'Terverifikasi' ? 'bg-emerald-600 text-white' : 'bg-amber-100 text-amber-800 border border-amber-300'
                            }`}>
                              Status: {cap.status}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-emerald-900">
                          <div>
                            <strong>Tindakan Koreksi:</strong> {cap.correctivePlan}
                          </div>
                          <div>
                            <strong>Tindakan Pencegahan:</strong> {cap.preventivePlan}
                          </div>
                        </div>

                        <div className="pt-1.5 border-t border-emerald-200/80 flex items-center justify-between text-[11px] text-slate-600 flex-wrap gap-2">
                          <div>
                            <strong>Target Output:</strong> {cap.targetOutput} (Tenggat: {cap.targetDate})
                          </div>
                          {cap.auditorVerificationNotes && (
                            <div className="text-emerald-800 font-medium">
                              <strong>Verifikasi Auditor:</strong> {cap.auditorVerificationNotes}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
                        Belum ada dokumen PTK yang diajukan oleh unit kerja untuk temuan ini.
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. REKAP MUTU FAKULTAS & PRODI */}
        {activeReportType === 'rekap-unit' && (
          <div className="space-y-6 text-xs text-slate-800">
            <h2 className="text-base font-extrabold text-slate-900 uppercase text-center">
              Rekapitulasi Kinerja Mutu Fakultas & Program Studi
            </h2>

            <table className="w-full text-left text-xs border border-slate-200">
              <thead className="bg-slate-100 text-slate-700 font-bold">
                <tr>
                  <th className="p-2.5 border">Kode Unit</th>
                  <th className="p-2.5 border">Nama Fakultas / Program Studi</th>
                  <th className="p-2.5 border">Tipe</th>
                  <th className="p-2.5 border">Pimpinan Unit</th>
                  <th className="p-2.5 border text-center">Skor Capaian</th>
                  <th className="p-2.5 border text-center">Target</th>
                  <th className="p-2.5 border text-center">Status Pemenuhan</th>
                </tr>
              </thead>
              <tbody>
                {filteredUnits.map(unit => (
                  <tr key={unit.id} className="border-t hover:bg-slate-50">
                    <td className="p-2.5 border font-mono font-bold">{unit.code}</td>
                    <td className="p-2.5 border font-semibold">{unit.name}</td>
                    <td className="p-2.5 border text-slate-500">{unit.type}</td>
                    <td className="p-2.5 border">{unit.headName}</td>
                    <td className="p-2.5 border text-center font-bold text-emerald-800">
                      {unit.qualityScore.toFixed(2)}
                    </td>
                    <td className="p-2.5 border text-center text-slate-500">
                      {unit.targetScore.toFixed(2)}
                    </td>
                    <td className="p-2.5 border text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {unit.qualityScore >= 3.5 ? 'Memenuhi Standar' : 'Perlu Pengendalian'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 4. CAPAIAN STANDAR */}
        {activeReportType === 'rekap-standar' && (
          <div className="space-y-6 text-xs text-slate-800">
            <h2 className="text-base font-extrabold text-slate-900 uppercase text-center">
              Matriks Capaian Standar Permendiktisaintek No. 39 Tahun 2025 & AIK
            </h2>

            <div className="space-y-4">
              {standards.map(std => (
                <div key={std.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-bold text-emerald-800">{std.code} - {std.title}</span>
                    <span className="text-[11px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                      Bobot: {std.weight}%
                    </span>
                  </div>
                  <p className="text-slate-600">{std.description}</p>
                  <div className="text-[11px] text-slate-500">
                    <strong>Dasar Hukum:</strong> {std.legalBasis} | <strong>PIC:</strong> {std.picUnit}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. DAFTAR RISIKO MUTU */}
        {activeReportType === 'risiko' && (
          <div className="space-y-6 text-xs text-slate-800">
            <h2 className="text-base font-extrabold text-slate-900 uppercase text-center">
              Daftar Risiko Mutu Pendidikan Tinggi & Rencana Mitigasi
            </h2>

            <table className="w-full text-left text-xs border border-slate-200">
              <thead className="bg-slate-100 text-slate-700 font-bold">
                <tr>
                  <th className="p-2.5 border">No Temuan</th>
                  <th className="p-2.5 border">Unit Terkait</th>
                  <th className="p-2.5 border">Identifikasi Risiko Mutu</th>
                  <th className="p-2.5 border">Tingkat Risiko</th>
                  <th className="p-2.5 border">Rekomendasi Tindakan Koreksi (Mitigasi)</th>
                  <th className="p-2.5 border">Status CAP</th>
                </tr>
              </thead>
              <tbody>
                {filteredFindings.map(f => (
                  <tr key={f.id} className="border-t hover:bg-slate-50">
                    <td className="p-2.5 border font-mono font-bold">{f.findingNumber}</td>
                    <td className="p-2.5 border font-semibold">{f.unitName}</td>
                    <td className="p-2.5 border text-slate-700">{f.riskAnalysis}</td>
                    <td className="p-2.5 border font-bold">
                      <span className={f.category === 'Mayor' ? 'text-rose-600' : 'text-amber-600'}>
                        {f.category === 'Mayor' ? 'Tinggi' : f.category === 'Minor' ? 'Sedang' : 'Rendah'}
                      </span>
                    </td>
                    <td className="p-2.5 border text-slate-800">{f.recommendation}</td>
                    <td className="p-2.5 border">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800">
                        {f.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Export Modal */}
      <ExportAMIPDFModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        defaultUnitId={facultyFilter}
      />
    </div>
  );
};
