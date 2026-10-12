import React, { useState } from 'react';
import { RTMRecord } from '../../types';
import { UnimenLogo } from '../common/UnimenLogo';
import {
  FileText,
  Printer,
  X,
  Download,
  Calendar,
  Building,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Send
} from 'lucide-react';

interface DokumenResmiRTMModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: RTMRecord;
}

export const DokumenResmiRTMModal: React.FC<DokumenResmiRTMModalProps> = ({
  isOpen,
  onClose,
  record,
}) => {
  const [activeDocTab, setActiveDocTab] = useState<'UNDANGAN' | 'BERITA_ACARA'>('UNDANGAN');

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const isUniv = record.level === 'Universitas';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-3xl max-w-4xl w-full my-8 shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:border-none print:my-0">
        {/* Modal Controls Bar (hidden during print) */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800 shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-amber-400" />
            <div>
              <span className="text-[10px] text-amber-300 font-extrabold uppercase block tracking-wider">
                Dokumen Resmi Institusi UNIMEN
              </span>
              <h2 className="text-sm font-bold text-white">
                {record.meetingNumber || 'Dokumen RTM'} • Tingkat {record.level}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Doc Switcher */}
            <div className="bg-slate-800 p-1 rounded-xl flex items-center gap-1">
              <button
                onClick={() => setActiveDocTab('UNDANGAN')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  activeDocTab === 'UNDANGAN'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Surat Panggilan & Undangan
              </button>
              <button
                onClick={() => setActiveDocTab('BERITA_ACARA')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  activeDocTab === 'BERITA_ACARA'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Berita Acara & Risalah Sidang
              </button>
            </div>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs shadow-sm transition active:scale-95"
            >
              <Printer className="w-4 h-4" />
              Cetak / Simpan PDF
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Paper */}
        <div className="p-8 sm:p-12 overflow-y-auto bg-white font-serif text-slate-900 leading-normal text-xs print:p-4 print:text-black">
          {/* KOP SURAT RESMI UNIVERSITAS MUHAMMADIYAH ENREKANG */}
          <div className="border-b-4 border-double border-slate-900 pb-3 mb-6 flex items-center gap-4">
            <UnimenLogo size="xl" variant="icon" />
            <div className="flex-1 text-center font-sans">
              <h4 className="text-[11px] font-bold tracking-widest text-slate-700 uppercase">
                MAJELIS PENDIDIKAN TINGGI PENELITIAN DAN PENGEMBANGAN
              </h4>
              <h3 className="text-sm font-extrabold tracking-wider text-slate-800 uppercase">
                PIMPINAN PUSAT MUHAMMADIYAH
              </h3>
              <h1 className="text-lg sm:text-xl font-black text-emerald-900 tracking-tight uppercase">
                UNIVERSITAS MUHAMMADIYAH ENREKANG
              </h1>
              <p className="text-[10px] font-semibold text-slate-700">
                {isUniv
                  ? 'LEMBAGA PENJAMINAN MUTU (LPM) & KANTOR REKTORAT'
                  : `DEKANAT ${record.unitName.toUpperCase()}`}
              </p>
              <p className="text-[9px] text-slate-500 font-normal">
                Kampus 1: Jl. Jend. Sudirman No. 17 Enrekang, Sulawesi Selatan 91711 | Website: unimen.ac.id | Email: lpm@unimen.ac.id
              </p>
            </div>
          </div>

          {activeDocTab === 'UNDANGAN' ? (
            /* ================= DOKUMEN 1: SURAT PANGGILAN & UNDANGAN RESMI ================= */
            <div className="space-y-4">
              {/* Nomor Surat & Tanggal */}
              <div className="flex justify-between items-start text-xs font-sans">
                <div className="space-y-1">
                  <div><strong>Nomor</strong> : {record.meetingNumber || 'UNIMEN/R/UND-RTM/IV/2026/012'}</div>
                  <div><strong>Lampiran</strong> : 1 (Satu) Berkas Matriks Temuan Audit Mutu</div>
                  <div><strong>Perihal</strong> : <span className="font-bold underline">Undangan RTM & Pemanggilan Klarifikasi Temuan Audit Mutu Internal (AMI)</span></div>
                </div>
                <div className="text-right">
                  Enrekang, {record.date}
                </div>
              </div>

              {/* Penerima Surat */}
              <div className="pt-2 text-xs font-sans space-y-1">
                <div>Kepada Yth.</div>
                <div className="font-bold">
                  {record.summonedUnitNames && record.summonedUnitNames.length > 0
                    ? record.summonedUnitNames.map((name, i) => (
                        <div key={i}>1. Ketua Program Studi / Pimpinan {name}</div>
                      ))
                    : <div>1. Para Ketua Program Studi & Pimpinan Unit Kerja</div>}
                  <div>2. Gugus Kendali Mutu (GKM) / Unit Jaminan Mutu (UJM) Terkait</div>
                </div>
                <div>di,- Tempat</div>
              </div>

              {/* Salam Pembuka */}
              <div className="pt-2 italic font-sans text-xs">
                Assalamu’alaikum Warahmatullahi Wabarakatuh
              </div>

              {/* Batang Tubuh Surat */}
              <div className="space-y-3 text-justify font-sans text-xs leading-relaxed">
                <p>
                  Ba’da salam, semoga limpahan rahmat, taufiq, dan hidayah Allah Subhanahu Wata’ala senantiasa menyertai seluruh aktivitas kita dalam memajukan caturdharma perguruan tinggi di Universitas Muhammadiyah Enrekang.
                </p>
                <p>
                  Berdasarkan hasil pelaksanaan Audit Mutu Internal (AMI) Siklus Tahun Akademik 2025/2026 dan ketentuan Permendiktisaintek No. 39 Tahun 2025 mengenai tahapan <strong>Pengendalian (P)</strong> dan <strong>Peningkatan (P)</strong> dalam siklus SPMI PPEPP, bersama ini Pimpinan Universitas / Fakultas mengundang Bapak/Ibu untuk hadir dalam sidang evaluasi <strong>Rapat Tinjauan Manajemen (RTM)</strong> yang akan diselenggarakan pada:
                </p>

                {/* Kotak Jadwal Pertemuan */}
                <div className="bg-slate-50 border border-slate-300 p-3.5 rounded-lg space-y-1.5 my-2">
                  <div className="grid grid-cols-4 gap-2">
                    <span className="font-bold text-slate-700">Hari / Tanggal</span>
                    <span className="col-span-3 font-semibold text-slate-900">: {record.date}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <span className="font-bold text-slate-700">Waktu</span>
                    <span className="col-span-3 font-semibold text-slate-900">: {record.scheduledTime || '09:00 WITA - Selesai'}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <span className="font-bold text-slate-700">Tempat</span>
                    <span className="col-span-3 font-semibold text-slate-900">: {record.location || 'Ruang Sidang Senat UNIMEN'}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <span className="font-bold text-slate-700">Pimpinan Sidang</span>
                    <span className="col-span-3 font-semibold text-slate-900">: {record.leadName} ({record.leadRole || 'Pimpinan Sidang'})</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <span className="font-bold text-slate-700">Agenda Sidang</span>
                    <span className="col-span-3 font-bold text-emerald-900">: {record.agenda}</span>
                  </div>
                </div>

                {/* Catatan / Mandat Khusus Pimpinan */}
                {record.summonNotes && (
                  <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg text-slate-800">
                    <span className="font-bold block text-amber-950 mb-0.5">Instruksi Khusus untuk Pimpinan Unit / Kaprodi yang Dipanggil:</span>
                    <p className="italic">{record.summonNotes}</p>
                  </div>
                )}

                <p>
                  Mengingat pentingnya agenda rapat ini dalam menentukan status pengendalian mutu dan rekomendasi kebijakan alokasi sumber daya institusi, kehadiran Bapak/Ibu tepat pada waktunya sangat diharapkan tanpa diwakilkan.
                </p>
                <p>
                  Demikian surat undangan ini kami sampaikan, atas perhatian dan kerja sama yang baik diucapkan terima kasih.
                </p>
              </div>

              {/* Salam Penutup */}
              <div className="pt-2 italic font-sans text-xs">
                Nashrun Minallah Wa Fathun Qarib<br />
                Wassalamu’alaikum Warahmatullahi Wabarakatuh
              </div>

              {/* Kolom Tanda Tangan Surat */}
              <div className="pt-6 flex justify-end font-sans text-xs">
                <div className="text-center w-64 space-y-16">
                  <div>
                    <span className="block font-bold">Enrekang, {record.date}</span>
                    <span className="block font-semibold text-slate-700">{record.leadRole || 'Pimpinan Sidang RTM'}</span>
                  </div>
                  <div>
                    <span className="font-bold underline block">{record.leadName}</span>
                    <span className="text-[10px] text-slate-500">NIDN / NBM Pimpinan UNIMEN</span>
                  </div>
                </div>
              </div>

              {/* Lampiran Temuan Audit yang Ditelaah */}
              {record.summonedFindings && record.summonedFindings.length > 0 && (
                <div className="pt-8 border-t border-slate-300 page-break-before font-sans">
                  <div className="text-center font-bold mb-3">
                    <span className="block uppercase underline">LAMPIRAN SURAT PEMANGGILAN SIDANG RTM</span>
                    <span className="text-[11px] text-slate-600 block">Daftar Butir Temuan Audit Mutu Internal yang Wajib Diklarifikasi</span>
                  </div>

                  <table className="w-full border-collapse border border-slate-400 text-xs text-left">
                    <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-400">
                      <tr>
                        <th className="border border-slate-400 p-2 text-center w-8">No</th>
                        <th className="border border-slate-400 p-2">Nomor Temuan</th>
                        <th className="border border-slate-400 p-2">Unit / Prodi</th>
                        <th className="border border-slate-400 p-2">Kategori</th>
                        <th className="border border-slate-400 p-2">Uraian Temuan Mutu</th>
                        <th className="border border-slate-400 p-2 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {record.summonedFindings.map((f, idx) => (
                        <tr key={f.findingId}>
                          <td className="border border-slate-400 p-2 text-center font-bold">{idx + 1}</td>
                          <td className="border border-slate-400 p-2 font-mono text-[10px] font-bold">{f.findingNumber}</td>
                          <td className="border border-slate-400 p-2 font-semibold">{f.unitName}</td>
                          <td className="border border-slate-400 p-2 font-bold">{f.category}</td>
                          <td className="border border-slate-400 p-2 text-[11px]">{f.problemDescription}</td>
                          <td className="border border-slate-400 p-2 text-center font-bold">{f.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            /* ================= DOKUMEN 2: BERITA ACARA & RISALAH SIDANG RTM ================= */
            <div className="space-y-4 font-sans text-xs">
              {/* Judul Berita Acara */}
              <div className="text-center space-y-0.5 mb-4">
                <h2 className="text-sm font-extrabold tracking-wide uppercase underline">
                  BERITA ACARA & RISALAH SIDANG RAPAT TINJAUAN MANAJEMEN (RTM)
                </h2>
                <p className="text-[11px] font-semibold text-slate-700">
                  Nomor Berita Acara: BA-RTM/{record.level.toUpperCase()}/{record.meetingNumber?.replace(/\//g, '-') || '2026-01'}
                </p>
                <p className="text-[10px] text-slate-500">
                  Siklus Sistem Penjaminan Mutu Internal (SPMI) • PPEPP Permendiktisaintek 39/2025
                </p>
              </div>

              {/* Keterangan Pelaksanaan */}
              <div className="p-3 bg-slate-50 border border-slate-300 rounded-lg space-y-1 leading-relaxed">
                <p>
                  Pada hari ini, tanggal <strong>{record.date}</strong>, telah diselenggarakan Rapat Tinjauan Manajemen (RTM) Tingkat <strong>{record.level}</strong> bertempat di <strong>{record.location || 'Kampus UNIMEN'}</strong>, dipimpin langsung oleh <strong>{record.leadName}</strong> selaku <strong>{record.leadRole || 'Pimpinan Sidang'}</strong>.
                </p>
                <p>
                  Sidang dihadiri oleh pimpinan universitas, dekanat, pimpinan lembaga penjaminan mutu, serta ketua program studi terundang untuk mengevaluasi dan merumuskan kebijakan tindak lanjut hasil Audit Mutu Internal (AMI).
                </p>
              </div>

              {/* Rangkuman Evaluasi Pimpinan */}
              <div className="space-y-1">
                <h3 className="font-bold text-slate-900 uppercase text-xs">
                  I. Rangkuman Hasil Evaluasi & Arahan Pimpinan Sidang:
                </h3>
                <div className="p-3 bg-white border border-slate-300 rounded-lg text-slate-800 leading-relaxed whitespace-pre-line">
                  {record.discussionSummary}
                </div>
              </div>

              {/* Arahan Kebijakan Khusus Pimpinan jika ada */}
              {record.evaluationOutcome?.leadershipDirective && (
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg space-y-0.5">
                  <span className="font-bold text-amber-950 block">Mandat Kebijakan Pimpinan Tertinggi:</span>
                  <p className="text-slate-800 italic">{record.evaluationOutcome.leadershipDirective}</p>
                </div>
              )}

              {/* Tabel Keputusan & Tindakan Pengendalian */}
              <div className="space-y-1.5 pt-2">
                <h3 className="font-bold text-slate-900 uppercase text-xs">
                  II. Matriks Penetapan Keputusan Kebijakan & Dukungan Institusi ({record.decisions.length} Butir Kebijakan):
                </h3>
                <table className="w-full border-collapse border border-slate-400 text-left text-xs">
                  <thead className="bg-slate-100 font-bold border-b border-slate-400 text-slate-800">
                    <tr>
                      <th className="border border-slate-400 p-2 w-8 text-center">No</th>
                      <th className="border border-slate-400 p-2">Butir Masalah</th>
                      <th className="border border-slate-400 p-2">Tindakan / Kebijakan</th>
                      <th className="border border-slate-400 p-2">PIC</th>
                      <th className="border border-slate-400 p-2">Dukungan Anggaran / Fasilitas</th>
                      <th className="border border-slate-400 p-2">Tenggat</th>
                      <th className="border border-slate-400 p-2 text-center">Fase</th>
                    </tr>
                  </thead>
                  <tbody>
                    {record.decisions.map((dec, idx) => (
                      <tr key={dec.id}>
                        <td className="border border-slate-400 p-2 text-center font-bold">{idx + 1}</td>
                        <td className="border border-slate-400 p-2 font-bold">{dec.item}</td>
                        <td className="border border-slate-400 p-2">{dec.action}</td>
                        <td className="border border-slate-400 p-2 font-semibold text-emerald-900">{dec.pic}</td>
                        <td className="border border-slate-400 p-2">{dec.budgetSupport || '-'}</td>
                        <td className="border border-slate-400 p-2 font-medium text-rose-700">{dec.deadline}</td>
                        <td className="border border-slate-400 p-2 text-center font-bold">{dec.ppeppTarget}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Status Akhir Evaluasi */}
              {record.evaluationOutcome && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-emerald-950 block">Status Hasil Evaluasi RTM:</span>
                    <span className="font-bold text-emerald-800 text-sm">
                      {record.evaluationOutcome.overallStatus}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-slate-600 block">Milestone SPMI Selanjutnya:</span>
                    <span className="font-bold text-slate-800">{record.evaluationOutcome.ppeppNextMilestone}</span>
                  </div>
                </div>
              )}

              {/* Tanda Tangan Berita Acara 3 Pihak */}
              <div className="pt-8 grid grid-cols-3 gap-4 text-center text-xs">
                <div className="space-y-16">
                  <div>
                    <span className="block font-bold">Pimpinan Sidang RTM</span>
                    <span className="block text-slate-600">{record.leadRole || 'Pimpinan'}</span>
                  </div>
                  <div>
                    <span className="font-bold underline block">{record.leadName}</span>
                    <span className="text-[10px] text-slate-500">NIDN / Pimpinan UNIMEN</span>
                  </div>
                </div>

                <div className="space-y-16">
                  <div>
                    <span className="block font-bold">Kepala Lembaga Penjaminan Mutu</span>
                    <span className="block text-slate-600">LPM UNIMEN</span>
                  </div>
                  <div>
                    <span className="font-bold underline block">Dr. Dian Firdiani, S.Pd., M.Pd.</span>
                    <span className="text-[10px] text-slate-500">Kepala LPM UNIMEN</span>
                  </div>
                </div>

                <div className="space-y-16">
                  <div>
                    <span className="block font-bold">Perwakilan Auditee Terpanggil</span>
                    <span className="block text-slate-600">Ketua Program Studi</span>
                  </div>
                  <div>
                    <span className="font-bold underline block">
                      {record.summonedUnitNames?.[0] ? 'Kaprodi Terpanggil' : 'Pimpinan Auditee'}
                    </span>
                    <span className="text-[10px] text-slate-500">Ketua Program Studi / Unit</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
