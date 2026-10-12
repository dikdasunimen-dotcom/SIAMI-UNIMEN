import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RTMRecord, Unit, Finding, isFacultyLeaderRole } from '../../types';
import { UnimenLogo } from '../common/UnimenLogo';
import { MatriksPemanggilanProdi } from './MatriksPemanggilanProdi';
import { JadwalkanRTMModal } from './JadwalkanRTMModal';
import { EvaluasiPimpinanModal } from './EvaluasiPimpinanModal';
import { DokumenResmiRTMModal } from './DokumenResmiRTMModal';
import {
  Users2,
  Calendar,
  CheckCircle2,
  Layers,
  Building,
  Plus,
  FileText,
  Clock,
  Sparkles,
  AlertTriangle,
  Gavel,
  Printer,
  ChevronRight,
  Flame,
  Search,
  Filter,
  Trash2,
  Edit,
  ShieldCheck,
  MapPin,
  Send,
  Eye
} from 'lucide-react';

export const RapatTinjauanManajemen: React.FC = () => {
  const { rtmRecords, currentUser, deleteRTMRecord, updateRTMRecord, findings } = useApp();

  // Navigation tab within RTM module
  const [activeMainTab, setActiveMainTab] = useState<'JADWAL' | 'MATRIKS_PEMANGGILAN' | 'PANGGILAN_PRODI'>('JADWAL');

  // Filter state for records
  const [levelFilter, setLevelFilter] = useState<'ALL' | 'Universitas' | 'Fakultas'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Terjadwal' | 'Selesai'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedProdiForSummon, setSelectedProdiForSummon] = useState<Unit | null>(null);
  const [selectedFindingsForSummon, setSelectedFindingsForSummon] = useState<Finding[] | null>(null);
  const [editingRecord, setEditingRecord] = useState<RTMRecord | null>(null);

  const [activeEvaluationRecord, setActiveEvaluationRecord] = useState<RTMRecord | null>(null);
  const [activeDocumentRecord, setActiveDocumentRecord] = useState<RTMRecord | null>(null);

  // Leadership permissions
  const canScheduleUnivRTM =
    currentUser.role === 'Super Admin' ||
    currentUser.role === 'Rektor' ||
    currentUser.role === 'LPM';

  const canScheduleFacultyRTM =
    currentUser.role === 'Super Admin' ||
    currentUser.role === 'Dekan' ||
    currentUser.role === 'Direktur Pascasarjana' ||
    isFacultyLeaderRole(currentUser.role);

  const canManage = canScheduleUnivRTM || canScheduleFacultyRTM;

  // Filtered RTM records
  const filteredRecords = rtmRecords.filter(record => {
    // Level filter
    if (levelFilter !== 'ALL' && record.level !== levelFilter) return false;

    // Status filter
    if (statusFilter !== 'ALL') {
      const recordStatus = record.sessionStatus || (record.status === 'Disetujui' ? 'Selesai' : 'Terjadwal');
      if (statusFilter === 'Terjadwal' && recordStatus !== 'Terjadwal' && recordStatus !== 'Sedang Berlangsung') {
        return false;
      }
      if (statusFilter === 'Selesai' && recordStatus !== 'Selesai') {
        return false;
      }
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchAgenda = record.agenda.toLowerCase().includes(q);
      const matchLead = record.leadName.toLowerCase().includes(q);
      const matchNum = (record.meetingNumber || '').toLowerCase().includes(q);
      const matchProdi = record.summonedUnitNames?.some(name => name.toLowerCase().includes(q));
      if (!matchAgenda && !matchLead && !matchNum && !matchProdi) return false;
    }

    return true;
  });

  // Calculate quick stats
  const scheduledCount = rtmRecords.filter(r => (r.sessionStatus === 'Terjadwal' || r.status === 'Draft')).length;
  const completedCount = rtmRecords.filter(r => (r.sessionStatus === 'Selesai' || r.status === 'Disetujui')).length;
  const totalDecisionsCount = rtmRecords.reduce((acc, curr) => acc + (curr.decisions?.length || 0), 0);
  const criticalFindingsInRTM = findings.filter(f => f.category === 'Mayor' && f.status === 'Open').length;

  // Handler for summoning prodi from matrix
  const handlePanggilProdi = (prodi: Unit, findingsForProdi: Finding[]) => {
    setSelectedProdiForSummon(prodi);
    setSelectedFindingsForSummon(findingsForProdi);
    setEditingRecord(null);
    setIsScheduleModalOpen(true);
  };

  const handleOpenNewSchedule = () => {
    setSelectedProdiForSummon(null);
    setSelectedFindingsForSummon(null);
    setEditingRecord(null);
    setIsScheduleModalOpen(true);
  };

  const handleEditRecord = (record: RTMRecord) => {
    setEditingRecord(record);
    setSelectedProdiForSummon(null);
    setSelectedFindingsForSummon(null);
    setIsScheduleModalOpen(true);
  };

  const handleDeleteRecord = (id: string) => {
    if (confirm('Apakah Anda yakin ingin membatalkan dan menghapus agenda RTM ini?')) {
      deleteRTMRecord(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Institutional Top Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300">
                Siklus SPMI PPEPP • Fase Pengendalian & Peningkatan
              </span>
              <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                Permendiktisaintek 39/2025
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <Users2 className="w-7 h-7 text-emerald-700 shrink-0" />
              <span>Rapat Tinjauan Manajemen (RTM) & Evaluasi Pimpinan</span>
            </h1>

            <p className="text-xs text-slate-500 max-w-3xl leading-relaxed">
              Forum sidang pimpinan tertinggi Universitas Muhammadiyah Enrekang (Rektorat) dan Fakultas (Dekanat) untuk mengevaluasi hasil <strong>Audit Mutu Internal (AMI)</strong>, <strong>memanggil program studi terkait</strong> untuk klarifikasi pertanggungjawaban temuan, serta menetapkan keputusan kebijakan alokasi sumber daya.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2.5 shrink-0">
            <button
              onClick={() => setActiveMainTab('MATRIKS_PEMANGGILAN')}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition active:scale-95"
            >
              <Building className="w-4 h-4 text-amber-400" />
              Matriks Pemanggilan Prodi
            </button>

            {canManage && (
              <button
                onClick={handleOpenNewSchedule}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-800 hover:to-teal-900 text-white font-extrabold text-xs shadow-md shadow-emerald-800/20 transition active:scale-95"
              >
                <Plus className="w-4 h-4 text-amber-300" />
                Jadwalkan RTM & Panggil Prodi
              </button>
            )}
          </div>
        </div>

        {/* Quick KPI Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-slate-100 text-xs">
          <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200">
            <span className="text-[10px] font-bold text-emerald-800 uppercase block mb-0.5">
              Total Sidang RTM
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black text-emerald-950">{rtmRecords.length}</span>
              <span className="text-[10px] text-emerald-700 font-semibold">Sidang Terdaftar</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200">
            <span className="text-[10px] font-bold text-amber-800 uppercase block mb-0.5">
              RTM Terjadwal / Butuh Hearing
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black text-amber-950">{scheduledCount}</span>
              <span className="text-[10px] text-amber-700 font-semibold">Agenda Aktif</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-teal-50/70 border border-teal-200">
            <span className="text-[10px] font-bold text-teal-800 uppercase block mb-0.5">
              Berita Acara Terbit
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black text-teal-950">{completedCount}</span>
              <span className="text-[10px] text-teal-700 font-semibold">Selesai & Disahkan</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold text-slate-600 uppercase block mb-0.5">
              Kebijakan Pimpinan Terbit
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black text-slate-900">{totalDecisionsCount}</span>
              <span className="text-[10px] text-slate-500 font-semibold">Butir Keputusan</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Subtabs Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveMainTab('JADWAL')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold flex items-center gap-2 transition ${
            activeMainTab === 'JADWAL'
              ? 'bg-emerald-800 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Jadwal & Risalah Sidang RTM ({rtmRecords.length})
        </button>

        <button
          onClick={() => setActiveMainTab('MATRIKS_PEMANGGILAN')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold flex items-center gap-2 transition ${
            activeMainTab === 'MATRIKS_PEMANGGILAN'
              ? 'bg-emerald-800 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Building className="w-4 h-4" />
          Matriks Pemanggilan Prodi Berdasarkan Temuan
          {criticalFindingsInRTM > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-rose-500 text-white font-black">
              {criticalFindingsInRTM} Mayor
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveMainTab('PANGGILAN_PRODI')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold flex items-center gap-2 transition ${
            activeMainTab === 'PANGGILAN_PRODI'
              ? 'bg-emerald-800 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Send className="w-4 h-4" />
          Surat Panggilan Masuk untuk Program Studi
        </button>
      </div>

      {/* VIEW 1: JADWAL & RISALAH RTM */}
      {activeMainTab === 'JADWAL' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between text-xs">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari agenda sidang, pimpinan, nomor surat, atau prodi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              />
            </div>

            {/* Level Filter */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setLevelFilter('ALL')}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs transition ${
                    levelFilter === 'ALL' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  Semua Tingkat
                </button>
                <button
                  onClick={() => setLevelFilter('Universitas')}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs transition ${
                    levelFilter === 'Universitas' ? 'bg-emerald-700 text-white shadow-2xs' : 'text-emerald-800'
                  }`}
                >
                  Universitas (Rektorat)
                </button>
                <button
                  onClick={() => setLevelFilter('Fakultas')}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs transition ${
                    levelFilter === 'Fakultas' ? 'bg-teal-700 text-white shadow-2xs' : 'text-teal-800'
                  }`}
                >
                  Fakultas (Dekanat)
                </button>
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="p-2 border border-slate-200 rounded-xl bg-slate-50 font-medium text-slate-700 text-xs"
              >
                <option value="ALL">Semua Status</option>
                <option value="Terjadwal">Terjadwal (Akan Datang)</option>
                <option value="Selesai">Selesai (Berita Acara Terbit)</option>
              </select>
            </div>
          </div>

          {/* RTM Records Cards List */}
          <div className="space-y-4">
            {filteredRecords.map(record => {
              const isUniv = record.level === 'Universitas';
              const isScheduled = record.sessionStatus === 'Terjadwal' || record.status === 'Draft';

              return (
                <div
                  key={record.id}
                  className={`bg-white rounded-3xl border p-6 shadow-xs space-y-5 transition hover:border-emerald-400 ${
                    isScheduled
                      ? 'border-amber-300 ring-1 ring-amber-100 bg-amber-50/10'
                      : 'border-slate-200/90'
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Level Badge */}
                      <span
                        className={`px-3 py-1 rounded-xl text-xs font-extrabold ${
                          isUniv
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            : 'bg-teal-100 text-teal-900 border border-teal-300'
                        }`}
                      >
                        RTM Tingkat {record.level}
                      </span>

                      {/* Nomor Surat */}
                      {record.meetingNumber && (
                        <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-xl border border-slate-200">
                          {record.meetingNumber}
                        </span>
                      )}

                      {/* Urgency Badge */}
                      {record.urgencyLevel && (
                        <span className={`px-2.5 py-1 rounded-xl text-[11px] font-bold ${
                          record.urgencyLevel.includes('Mayor')
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          {record.urgencyLevel}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      {/* Session Status Pill */}
                      {isScheduled ? (
                        <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1.5 animate-pulse">
                          <Clock className="w-3.5 h-3.5 text-amber-700" />
                          Terjadwal (Menunggu Sidang)
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                          Selesai & Berita Acara Disahkan
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Agenda Title & Details */}
                  <div className="space-y-2">
                    <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                      {record.agenda}
                    </h3>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-emerald-700 shrink-0" />
                        <div>
                          <span className="block text-[10px] text-slate-400 font-bold uppercase">Tanggal & Waktu</span>
                          <span className="font-bold text-slate-800">{record.date} ({record.scheduledTime || '09:00 WITA'})</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Gavel className="w-4 h-4 text-emerald-700 shrink-0" />
                        <div>
                          <span className="block text-[10px] text-slate-400 font-bold uppercase">Pimpinan Sidang</span>
                          <span className="font-bold text-slate-800 truncate block">{record.leadName}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
                        <div>
                          <span className="block text-[10px] text-slate-400 font-bold uppercase">Tempat / Ruang</span>
                          <span className="font-bold text-slate-800 truncate block">{record.location || 'Kampus UNIMEN'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* PROGRAM STUDI YANG DIPANGGIL HADIR */}
                  {record.summonedUnitNames && record.summonedUnitNames.length > 0 && (
                    <div className="p-3.5 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-extrabold uppercase text-emerald-950 flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5 text-emerald-700" />
                          Program Studi & Unit yang Dipanggil Hadir ({record.summonedUnitNames.length} Unit):
                        </span>
                        <span className="text-[10px] text-emerald-700 font-semibold">
                          Wajib Hadir: Kaprodi, GKM/UJM & PIC
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {record.summonedUnitNames.map((name, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-xl bg-white font-bold text-emerald-950 text-xs border border-emerald-300 shadow-2xs"
                          >
                            {name}
                          </span>
                        ))}
                      </div>

                      {record.summonNotes && (
                        <p className="text-[11px] text-emerald-900 italic pt-1 border-t border-emerald-200/60 mt-1">
                          <strong>Catatan Panggilan:</strong> {record.summonNotes}
                        </p>
                      )}
                    </div>
                  )}

                  {/* TEMUAN AUDIT YANG DITELAAH */}
                  {record.summonedFindings && record.summonedFindings.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        Butir Temuan Audit AMI yang Ditelaah ({record.summonedFindings.length} Butir):
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                        {record.summonedFindings.map(f => (
                          <div
                            key={f.findingId}
                            className="p-2.5 bg-slate-50/80 rounded-xl border border-slate-200 space-y-1"
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-mono text-[10px] font-bold bg-white px-1.5 py-0.5 rounded border border-slate-200">
                                {f.findingNumber}
                              </span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                                f.category === 'Mayor'
                                  ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                  : 'bg-amber-100 text-amber-800 border border-amber-300'
                              }`}>
                                {f.category}
                              </span>
                            </div>
                            <p className="text-slate-800 font-medium line-clamp-2 leading-snug text-[11px]">
                              {f.problemDescription}
                            </p>
                            <span className="text-[10px] text-slate-500 block truncate">
                              Unit: {f.unitName}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* NOTULEN / RINGKASAN DISKUSI */}
                  <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 text-xs space-y-1">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase block tracking-wider">
                      Notulen Pembahasan & Hasil Sidang Evaluasi
                    </span>
                    <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                      {record.discussionSummary}
                    </p>

                    {/* Arahan Kebijakan Pimpinan */}
                    {record.evaluationOutcome?.leadershipDirective && (
                      <div className="pt-2 mt-2 border-t border-slate-200">
                        <span className="text-[10px] font-bold text-amber-900 block uppercase">
                          Mandat Kebijakan Pimpinan Tertinggi:
                        </span>
                        <p className="text-slate-800 italic text-[11px]">
                          "{record.evaluationOutcome.leadershipDirective}"
                        </p>
                      </div>
                    )}
                  </div>

                  {/* DECISIONS TABLE */}
                  {record.decisions && record.decisions.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block">
                        Keputusan & Kebijakan Pimpinan ({record.decisions.length} Butir):
                      </span>
                      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                            <tr>
                              <th className="py-2.5 px-3">Topik Masalah</th>
                              <th className="py-2.5 px-3">Instruksi Kebijakan</th>
                              <th className="py-2.5 px-3">PIC</th>
                              <th className="py-2.5 px-3">Dukungan Anggaran / Sarpras</th>
                              <th className="py-2.5 px-3">Deadline</th>
                              <th className="py-2.5 px-3 text-center">Fase</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {record.decisions.map(dec => (
                              <tr key={dec.id}>
                                <td className="py-2.5 px-3 font-bold text-slate-900">{dec.item}</td>
                                <td className="py-2.5 px-3 text-slate-700">{dec.action}</td>
                                <td className="py-2.5 px-3 font-semibold text-emerald-800">{dec.pic}</td>
                                <td className="py-2.5 px-3 text-slate-600 font-medium">{dec.budgetSupport || '-'}</td>
                                <td className="py-2.5 px-3 font-semibold text-rose-600">{dec.deadline}</td>
                                <td className="py-2.5 px-3 text-center">
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                    {dec.ppeppTarget}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* ACTION BUTTONS FOOTER */}
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      {/* Lihat / Cetak Dokumen Resmi */}
                      <button
                        onClick={() => setActiveDocumentRecord(record)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition active:scale-95 shadow-xs"
                      >
                        <Printer className="w-3.5 h-3.5 text-amber-400" />
                        Lihat Surat Panggilan & Berita Acara (Cetak)
                      </button>

                      {/* Masuk Sesi Evaluasi Pimpinan */}
                      {canManage && (
                        <button
                          onClick={() => setActiveEvaluationRecord(record)}
                          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-extrabold transition active:scale-95 shadow-xs ${
                            isScheduled
                              ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                              : 'bg-teal-50 text-teal-900 border border-teal-300 hover:bg-teal-100'
                          }`}
                        >
                          <Gavel className="w-3.5 h-3.5" />
                          {isScheduled ? 'Mulai Sesi Evaluasi Pimpinan' : 'Tinjau / Edit Evaluasi Pimpinan'}
                        </button>
                      )}
                    </div>

                    {/* Secondary Actions (Edit & Delete) */}
                    {canManage && (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleEditRecord(record)}
                          title="Edit Jadwal & Panggilan"
                          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 font-semibold"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteRecord(record.id)}
                          title="Hapus Agenda"
                          className="p-2 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-600 font-semibold"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {filteredRecords.length === 0 && (
              <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-500 space-y-2">
                <Calendar className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                <h4 className="font-bold text-slate-800 text-sm">Tidak ada jadwal RTM yang cocok dengan kriteria.</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Silakan gunakan tombol "+ Jadwalkan RTM & Panggil Prodi" di atas untuk membuat jadwal sidang evaluasi baru.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: MATRIKS PEMANGGILAN PRODI */}
      {activeMainTab === 'MATRIKS_PEMANGGILAN' && (
        <MatriksPemanggilanProdi
          onPanggilProdi={handlePanggilProdi}
          onFilterRTMByProdi={(prodiId) => {
            setActiveMainTab('JADWAL');
            setSearchQuery(prodiId);
          }}
        />
      )}

      {/* VIEW 3: SURAT PANGGILAN MASUK UNTUK PROGRAM STUDI */}
      {activeMainTab === 'PANGGILAN_PRODI' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white p-5 rounded-3xl shadow-xs">
            <div className="flex items-center gap-3">
              <Send className="w-6 h-6 text-amber-400" />
              <div>
                <h2 className="text-base font-extrabold text-white">
                  Panel Informasi Pemanggilan Sidang RTM (Perspektif Program Studi)
                </h2>
                <p className="text-xs text-emerald-100 mt-0.5">
                  Menampilkan seluruh agenda pemanggilan resmi dari Rektorat / Dekanat kepada Ketua Program Studi beserta daftar bukti yang wajib disiapkan.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rtmRecords
              .filter(r => r.summonedUnitNames && r.summonedUnitNames.length > 0)
              .map(record => {
                const isScheduled = record.sessionStatus === 'Terjadwal' || record.status === 'Draft';
                return (
                  <div
                    key={record.id}
                    className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-xl border border-slate-200">
                          {record.meetingNumber || 'UND-RTM'}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isScheduled
                            ? 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        }`}>
                          {isScheduled ? 'Panggilan Aktif' : 'Telah Dievaluasi'}
                        </span>
                      </div>

                      <h4 className="font-extrabold text-slate-900 text-sm leading-snug">
                        {record.agenda}
                      </h4>

                      <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 font-semibold">Tingkatan Sidang:</span>
                          <span className="font-bold text-emerald-900">RTM Tingkat {record.level}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 font-semibold">Pimpinan Sidang:</span>
                          <span className="font-bold text-slate-800">{record.leadName}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 font-semibold">Waktu Sidang:</span>
                          <span className="font-bold text-slate-800">{record.date} ({record.scheduledTime || 'Pagi'})</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 font-semibold">Tempat:</span>
                          <span className="font-bold text-slate-800">{record.location || 'Kampus UNIMEN'}</span>
                        </div>
                      </div>

                      {/* Unit Terpanggil */}
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                          Prodi Terpanggil Hadir:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {record.summonedUnitNames?.map((u, i) => (
                            <span key={i} className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200 text-[11px] font-bold">
                              {u}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Checklist Persiapan untuk Kaprodi */}
                      <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-2xl text-[11px] space-y-1.5">
                        <span className="font-extrabold text-amber-950 block">
                          Checklist Dokumen Wajib Dibawa oleh Kaprodi:
                        </span>
                        <ul className="space-y-1 text-slate-700">
                          <li className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            Formulir Tindakan Koreksi & Pencegahan (CAP) bertandatangan
                          </li>
                          <li className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            Bukti fisik penuntasan temuan AMI (dokumen/link drive)
                          </li>
                          <li className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            Laporan evaluasi diri dan portofolio asesmen CPL/OBE
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100">
                      <button
                        onClick={() => setActiveDocumentRecord(record)}
                        className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition active:scale-95"
                      >
                        <Printer className="w-3.5 h-3.5 text-amber-400" />
                        Buka Lembar Surat Panggilan Resmi
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* MODAL 1: JADWALKAN RTM & PANGGIL PRODI */}
      <JadwalkanRTMModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        preSelectedProdi={selectedProdiForSummon}
        preSelectedFindings={selectedFindingsForSummon}
        editingRecord={editingRecord}
      />

      {/* MODAL 2: SESI EVALUASI PIMPINAN */}
      {activeEvaluationRecord && (
        <EvaluasiPimpinanModal
          isOpen={Boolean(activeEvaluationRecord)}
          onClose={() => setActiveEvaluationRecord(null)}
          record={activeEvaluationRecord}
        />
      )}

      {/* MODAL 3: CETAK DOKUMEN RESMI UNIMEN */}
      {activeDocumentRecord && (
        <DokumenResmiRTMModal
          isOpen={Boolean(activeDocumentRecord)}
          onClose={() => setActiveDocumentRecord(null)}
          record={activeDocumentRecord}
        />
      )}
    </div>
  );
};
