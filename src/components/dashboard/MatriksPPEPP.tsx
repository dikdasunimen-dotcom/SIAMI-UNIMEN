import React, { useState } from 'react';
import {
  Layers,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Users,
  Building2,
  Calendar,
  Sparkles
} from 'lucide-react';

interface MatriksPPEPPProps {
  selectedFacultyId?: string;
  className?: string;
}

export const MatriksPPEPP: React.FC<MatriksPPEPPProps> = ({
  selectedFacultyId,
  className = ''
}) => {
  const [activeStage, setActiveStage] = useState<string | null>(null);
  const [facultyFilter, setFacultyFilter] = useState<string>(selectedFacultyId || 'all');

  const ppeppStages = [
    {
      id: 'penetapan',
      letter: 'P',
      name: 'Penetapan (P)',
      title: 'Penetapan Standar SPMI UNIMEN',
      status: '100% Selesai',
      statusColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      badgeColor: 'bg-emerald-600 text-white',
      desc: 'Perumusan, penyelarasan, dan pengesahan 24 Standar Mutu SPMI Universitas Muhammadiyah Enrekang berbasis SN Dikti & Permendiktisaintek No. 39 Tahun 2025.',
      pic: 'LPM, Senat Universitas, & SK Rektor UNIMEN',
      timeline: 'Awal Tahun Akademik (Agustus 2025)',
      progress: 100,
      dokumenUtama: [
        { kode: 'DK-01', judul: 'Dokumen Kebijakan SPMI UNIMEN 2025-2029' },
        { kode: 'MM-02', judul: 'Manual Mutu Standar Pendidikan, Penelitian, & PkM' },
        { kode: 'STD-24', judul: '24 Butir Standar Mutu Termasuk Kekhasan AIK & Agropreneurship' },
        { kode: 'SK-REK', judul: 'SK Rektor No. 142/KEP/II.3.AU/2025 tentang Instrumen SPMI' }
      ],
      detailFakultas: {
        fai: 'Penetapan Standar Khusus Kemahiran Bahasa Arab & Fikih Tarbiyah (3 Prodi)',
        fip: 'Penetapan Standar Microteaching, Pedagogi Modern & Lab Sekolah Dasar (6 Prodi)',
        fstk: 'Penetapan Standar K3 Lab Sains, Komputasi Cloud & Agropreneurship Kalosi (9 Prodi)',
        pasca: 'Penetapan Standar Tesis Bereputasi Scopus & Publikasi SINTA 2 (2 Prodi S2)'
      }
    },
    {
      id: 'pelaksanaan',
      letter: 'P',
      name: 'Pelaksanaan (P)',
      title: 'Pelaksanaan Standar di Seluruh Unit',
      status: '94.2% Terlaksana',
      statusColor: 'bg-teal-100 text-teal-800 border-teal-300',
      badgeColor: 'bg-teal-600 text-white',
      desc: 'Penerapan standar operasional pada proses pembelajaran OBE, penelitian dosen-mahasiswa, pengabdian masyarakat terintegrasi AIK, dan tata kelola 4 Fakultas.',
      pic: 'Dekan, Direktur Pascasarjana, Kaprodi, GKM & Dosen',
      timeline: 'Sepanjang Semester Berjalan (Sep 2025 - Feb 2026)',
      progress: 94,
      dokumenUtama: [
        { kode: 'RPS-OBE', judul: 'Rencana Pembelajaran Semester Berbasis Capaian OBE' },
        { kode: 'BKD-SM', judul: 'Laporan Kinerja Beban Kerja Dosen (BKD/LKD) Terverifikasi' },
        { kode: 'SIMLIT', judul: 'Laporan Kemajuan Penelitian & PkM pada Simlitabmas UNIMEN' },
        { kode: 'PORT-MK', judul: 'Portofolio Penilaian Asesmen Berbasis Rubrik Holistik' }
      ],
      detailFakultas: {
        fai: 'Implementasi Kurikulum Integrasi Islam-Sains & Halaqah Dosen FAI',
        fip: 'Praktik Lapangan Persekolahan (PLP) & Program Kampus Mengajar Mitra',
        fstk: 'Praktikum Lapangan Agroteknologi di Kebun Riset & Workshop RSK/Sipil',
        pasca: 'Bimbingan Kolokium Tesis & Ujian Naskah Berkelanjutan S2'
      }
    },
    {
      id: 'evaluasi',
      letter: 'E',
      name: 'Evaluasi (E)',
      title: 'Audit Mutu Internal (AMI) & Monev',
      status: 'Sedang Berlangsung (80%)',
      statusColor: 'bg-sky-100 text-sky-800 border-sky-300 animate-pulse',
      badgeColor: 'bg-sky-600 text-white',
      desc: 'Pemeriksaan kepatuhan, kesesuaian, dan efektivitas implementasi standar melalui Audit Mutu Internal Semester Genap 2025/2026 oleh auditor internal bersertifikat.',
      pic: 'LPM UNIMEN & 18 Auditor Internal Tersertifikasi',
      timeline: 'Februari - Maret 2026 (Audit Lapangan)',
      progress: 80,
      dokumenUtama: [
        { kode: 'INST-AMI', judul: 'Instrumen Desk Evaluation & Audit Lapangan AMI' },
        { kode: 'KK-AUD', judul: 'Kertas Kerja Auditor & Verifikasi Bukti Fisik/Digital' },
        { kode: 'BA-VISIT', judul: 'Berita Acara Visitasi Audit Mutu Internal' },
        { kode: 'DAFTAR-KTS', judul: 'Daftar Temuan KTS Mayor, Minor, & Catatan Observasi' }
      ],
      detailFakultas: {
        fai: 'Audit Lapangan Tuntas pada 3 Prodi (PAI, MPI, PBA) dengan skor rata-rata 3.55',
        fip: 'Audit Lapangan Tuntas pada 6 Prodi (PGSD, Mat, Bing, BK, PNF, PKO) skor 3.52',
        fstk: 'Desk Evaluation 9 Prodi selesai, visitasi lapangan berlangsung (7/9 prodi)',
        pasca: 'Audit Prodi S2 Pendas & S2 PUK tuntas dengan skor memuaskan 3.62'
      }
    },
    {
      id: 'pengendalian',
      letter: 'P',
      name: 'Pengendalian (P)',
      title: 'Rapat Tinjauan Manajemen (RTM) & PTK',
      status: '85% Ditindaklanjuti',
      statusColor: 'bg-amber-100 text-amber-800 border-amber-300',
      badgeColor: 'bg-amber-600 text-white',
      desc: 'Analisis akar masalah (RCA 5-Whys), penetapan Corrective Action Plan (CAP), dan pelaksanaan RTM berjenjang dari tingkat Fakultas hingga Rektorat.',
      pic: 'Rektorat, Dekan Fakultas, Tim GKM & Kaprodi Auditee',
      timeline: 'Maret - April 2026 (Jadwal RTM Terpadu)',
      progress: 85,
      dokumenUtama: [
        { kode: 'NOT-RTM', judul: 'Notulensi & Keputusan Rapat Tinjauan Manajemen' },
        { kode: 'FRM-PTK', judul: 'Formulir Permintaan Tindakan Koreksi (PTK/CAP)' },
        { kode: 'RCA-LOG', judul: 'Matriks Analisis Akar Masalah (5-Whys Method)' },
        { kode: 'LOG-VERIF', judul: 'Buku Log Closing Temuan Auditor Internal' }
      ],
      detailFakultas: {
        fai: '2 dari 3 temuan telah diverifikasi closing oleh Auditor Lead FAI',
        fip: '5 dari 6 temuan PTK telah tuntas tindakan koreksi dokumen kurikulum',
        fstk: 'Tindakan perbaikan kalibrasi instrumen laboratorium sedang berjalan',
        pasca: 'RTM Pascasarjana menjadwalkan penambahan reviewer jurnal internasional'
      }
    },
    {
      id: 'peningkatan',
      letter: 'P',
      name: 'Peningkatan (P)',
      title: 'Peningkatan Standar & Kaizen Berkelanjutan',
      status: 'Terjadwal 2026/2027',
      statusColor: 'bg-purple-100 text-purple-800 border-purple-300',
      badgeColor: 'bg-purple-600 text-white',
      desc: 'Menaikkan tolok ukur standar mutu melampaui SN Dikti, benchmarking dengan PTMA Unggul nasional, serta pemutakhiran target indikator kinerja universitas.',
      pic: 'Rektor, Senat Akademik, LPM, & Dewan Penyantun',
      timeline: 'Mei - Juli 2026 (Persiapan Siklus Baru)',
      progress: 60,
      dokumenUtama: [
        { kode: 'BENCH-01', judul: 'Laporan Benchmarking SPMI PTMA Unggul Nasional' },
        { kode: 'REV-IKU', judul: 'Naskah Pemutakhiran Target IKU Menuju Akreditasi Unggul' },
        { kode: 'DOK-KAIZEN', judul: 'Rencana Pengembangan Laboratorium Agropreneurship 2027' },
        { kode: 'DRAFT-STD', judul: 'Draft Peningkatan Standar SPMI UNIMEN Siklus 2026/2027' }
      ],
      detailFakultas: {
        fai: 'Peningkatan target akreditasi LAMDIK Unggul untuk Prodi S1 PAI & MPI',
        fip: 'Rencana pembukaan konsentrasi S2 PGSD dan sertifikasi profesi guru (PPG)',
        fstk: 'Peningkatan akreditasi LAM INFOKOM & Akreditasi Internasional Agroteknologi',
        pasca: 'Peningkatan hibah tesis magister bersama mitra universitas luar negeri'
      }
    }
  ];

  return (
    <div className={`bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-6 ${className}`}>
      {/* Header Matriks */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm shadow-xs">
              <Layers className="w-4 h-4" />
            </span>
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
              Matriks Pelaksanaan Siklus SPMI PPEPP UNIMEN
            </h2>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              Permendiktisaintek No. 39 Tahun 2025
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
            Siklus penjaminan mutu internal berkelanjutan: <strong>Penetapan, Pelaksanaan, Evaluasi, Pengendalian, dan Peningkatan</strong> pada 4 Fakultas & 20 Program Studi.
          </p>
        </div>

        {/* Scope Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold hidden sm:inline">Lingkup Fakultas:</span>
          <select
            value={facultyFilter}
            onChange={(e) => setFacultyFilter(e.target.value)}
            className="px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-300 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">Seluruh Universitas (UNIMEN)</option>
            <option value="unit-fai">Fakultas Agama Islam (3 Prodi)</option>
            <option value="unit-fip">Fakultas Ilmu Pendidikan (6 Prodi)</option>
            <option value="unit-fstk">Fakultas Sains, Teknologi & Kesehatan (9 Prodi)</option>
            <option value="unit-pasca">Program Pascasarjana (2 Prodi)</option>
          </select>
        </div>
      </div>

      {/* 5-Step Visual Cycle Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {ppeppStages.map((stage, idx) => {
          const isExpanded = activeStage === stage.id;
          return (
            <div
              key={stage.id}
              onClick={() => setActiveStage(isExpanded ? null : stage.id)}
              className={`p-4 rounded-xl border transition cursor-pointer relative ${
                isExpanded
                  ? 'border-emerald-500 bg-emerald-50/50 shadow-md ring-2 ring-emerald-400/20'
                  : 'border-slate-200 hover:border-emerald-300 bg-slate-50/60 hover:bg-white hover:shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center ${stage.badgeColor}`}>
                  {idx + 1}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${stage.statusColor}`}>
                  {stage.status}
                </span>
              </div>
              <h3 className="text-xs font-bold text-slate-900 line-clamp-1">{stage.name}</h3>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{stage.title}</p>
              
              {/* Progress bar */}
              <div className="w-full bg-slate-200 rounded-full h-1.5 mt-3">
                <div
                  className="bg-emerald-600 h-1.5 rounded-full transition-all"
                  style={{ width: `${stage.progress}%` }}
                />
              </div>

              <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                <span>{stage.progress}% Tercapai</span>
                {isExpanded ? <ChevronUp className="w-3 h-3 text-emerald-700" /> : <ChevronDown className="w-3 h-3" />}
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Matrix Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-2xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900 text-white font-bold">
            <tr>
              <th className="py-3 px-3.5 w-16 text-center">Fase</th>
              <th className="py-3 px-3.5 w-44">Tahapan Siklus</th>
              <th className="py-3 px-3.5 min-w-[220px]">Deskripsi & Ruang Lingkup</th>
              <th className="py-3 px-3.5 min-w-[200px]">Dokumen Acuan & Bukti Fisik</th>
              <th className="py-3 px-3.5 w-40">Penanggung Jawab</th>
              <th className="py-3 px-3.5 w-32 text-center">Status SPMI</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {ppeppStages.map((stage) => {
              const isSelected = activeStage === stage.id;
              let facultyNote = stage.detailFakultas.fai;
              if (facultyFilter === 'unit-fip') facultyNote = stage.detailFakultas.fip;
              if (facultyFilter === 'unit-fstk') facultyNote = stage.detailFakultas.fstk;
              if (facultyFilter === 'unit-pasca') facultyNote = stage.detailFakultas.pasca;
              if (facultyFilter === 'all') facultyNote = 'Teraplikasi serentak pada FAI, FIP, FSTK, dan Sekolah Pascasarjana UNIMEN';

              return (
                <tr
                  key={stage.id}
                  className={`hover:bg-emerald-50/30 transition ${isSelected ? 'bg-emerald-50/40' : ''}`}
                >
                  <td className="py-3.5 px-3.5 text-center align-top">
                    <span className={`inline-flex w-7 h-7 rounded-xl font-extrabold text-xs items-center justify-center ${stage.badgeColor}`}>
                      {stage.letter}
                    </span>
                  </td>
                  <td className="py-3.5 px-3.5 align-top">
                    <p className="font-extrabold text-slate-900">{stage.name}</p>
                    <p className="text-[11px] text-emerald-800 font-semibold mt-0.5">{stage.title}</p>
                    <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-400">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{stage.timeline}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-3.5 align-top">
                    <p className="text-slate-700 leading-relaxed">{stage.desc}</p>
                    <div className="mt-2 p-2 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
                      <span className="font-bold text-emerald-800">Fokus Fakultas: </span>
                      {facultyNote}
                    </div>
                  </td>
                  <td className="py-3.5 px-3.5 align-top">
                    <ul className="space-y-1">
                      {stage.dokumenUtama.map((dok, dIdx) => (
                        <li key={dIdx} className="flex items-start gap-1.5 text-[11px] text-slate-600">
                          <FileText className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
                          <span>
                            <strong className="text-slate-800 font-semibold">{dok.kode}:</strong> {dok.judul}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="py-3.5 px-3.5 align-top">
                    <div className="flex items-center gap-1.5 text-slate-800 font-semibold text-[11px]">
                      <Users className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                      <span>{stage.pic}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-3.5 align-top text-center">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${stage.statusColor}`}>
                      {stage.status}
                    </span>
                    <div className="mt-2 text-[10px] text-slate-400 font-medium">
                      Progres: {stage.progress}%
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer Notes on Permendiktisaintek 39/2025 */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 via-teal-50 to-slate-50 border border-emerald-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-emerald-900 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>
            Setiap siklus PPEPP UNIMEN diaudit secara transparan, terdokumentasi dalam repositori digital, dan dilaporkan berkala ke Pangkalan Data Pendidikan Tinggi (PDDikti).
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] text-slate-500 font-bold">LPM UNIMEN v2026</span>
        </div>
      </div>
    </div>
  );
};
