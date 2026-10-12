import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Unit, Finding, isFacultyLeaderRole } from '../../types';
import {
  Building2,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Search,
  Filter,
  ArrowRight,
  ShieldAlert,
  Flame,
  Award,
  BookOpen,
  ChevronRight,
  Clock
} from 'lucide-react';

interface MatriksPemanggilanProdiProps {
  onPanggilProdi: (prodi: Unit, findingsForProdi: Finding[]) => void;
  onFilterRTMByProdi?: (prodiId: string) => void;
}

export const MatriksPemanggilanProdi: React.FC<MatriksPemanggilanProdiProps> = ({
  onPanggilProdi,
  onFilterRTMByProdi,
}) => {
  const { units, findings, audits, currentUser, rtmRecords } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [facultyFilter, setFacultyFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'MEMERLUKAN_PANGGILAN' | 'AMAN'>('ALL');

  // Filter study programs and faculties
  const studyProgramsAndUnits = units.filter(u => {
    // Show Program Studi and relevant academic units
    return u.type === 'Program Studi' || u.type === 'Fakultas' || u.type === 'Lembaga';
  });

  // Calculate stats for each unit
  const prodiMetrics = studyProgramsAndUnits.map(unit => {
    const unitFindings = findings.filter(f => f.unitId === unit.id || f.unitName.includes(unit.name));
    const mayorCount = unitFindings.filter(f => f.category === 'Mayor').length;
    const minorCount = unitFindings.filter(f => f.category === 'Minor').length;
    const observasiCount = unitFindings.filter(f => f.category === 'Observasi').length;
    const openCount = unitFindings.filter(f => f.status === 'Open').length;
    const progressCount = unitFindings.filter(f => f.status === 'In Progress').length;
    const closedCount = unitFindings.filter(f => f.status === 'Closed').length;

    // Associated audit instance
    const audit = audits.find(a => a.unitId === unit.id);
    const score = audit ? audit.scoreAverage : 3.4;

    // Check if prodi is already summoned in scheduled/completed RTMs
    const relatedRTMs = rtmRecords.filter(r =>
      r.summonedUnitIds?.includes(unit.id) ||
      r.summonedUnitNames?.some(name => name.includes(unit.name)) ||
      r.unitId === unit.id
    );

    const hasScheduledRTM = relatedRTMs.some(r => r.sessionStatus === 'Terjadwal' || r.status === 'Draft');

    // Need summons urgency: has mayor findings, has open findings >= 2, or score < 3.2
    const isUrgent = mayorCount > 0 || (openCount + progressCount >= 2) || (score < 3.2);

    return {
      unit,
      audit,
      score,
      totalFindings: unitFindings.length,
      mayorCount,
      minorCount,
      observasiCount,
      openCount,
      progressCount,
      closedCount,
      unitFindings,
      relatedRTMs,
      hasScheduledRTM,
      isUrgent,
    };
  });

  // Role-based filtering if user is a Dean: focus on their faculty's prodis
  const isDean = isFacultyLeaderRole(currentUser.role) || currentUser.role === 'Dekan' || currentUser.role === 'Direktur Pascasarjana';

  const filteredMetrics = prodiMetrics.filter(item => {
    // If dean, prefer their faculty
    if (isDean && currentUser.unitId && currentUser.unitId !== 'unit-unimen') {
      const isUnderFaculty = item.unit.parentUnitId === currentUser.unitId || item.unit.facultyId === currentUser.unitId || item.unit.id === currentUser.unitId;
      if (!isUnderFaculty) return false;
    }

    // Faculty filter
    if (facultyFilter !== 'ALL') {
      if (item.unit.parentUnitId !== facultyFilter && item.unit.facultyId !== facultyFilter && item.unit.id !== facultyFilter) {
        return false;
      }
    }

    // Status filter
    if (statusFilter === 'MEMERLUKAN_PANGGILAN') {
      if (item.openCount + item.progressCount === 0) return false;
    } else if (statusFilter === 'AMAN') {
      if (item.openCount + item.progressCount > 0) return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.unit.name.toLowerCase().includes(q);
      const matchCode = item.unit.code.toLowerCase().includes(q);
      const matchHead = (item.unit.headName || '').toLowerCase().includes(q);
      if (!matchName && !matchCode && !matchHead) return false;
    }

    return true;
  });

  // Leadership permissions
  const canSummon =
    currentUser.role === 'Super Admin' ||
    currentUser.role === 'Rektor' ||
    currentUser.role === 'LPM' ||
    currentUser.role === 'Dekan' ||
    currentUser.role === 'Direktur Pascasarjana' ||
    isFacultyLeaderRole(currentUser.role);

  return (
    <div className="space-y-5">
      {/* Informative Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-5 rounded-2xl shadow-sm border border-emerald-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider uppercase bg-amber-400 text-emerald-950">
                Fasilitas Pimpinan
              </span>
              <h2 className="text-lg font-extrabold text-white">
                Matriks Pemanggilan Program Studi Berdasarkan Temuan AMI
              </h2>
            </div>
            <p className="text-xs text-emerald-100 max-w-3xl leading-relaxed">
              Pimpinan universitas (Rektorat) dan Dekanat dapat memantau prodi dengan akumulasi temuan audit, temuan mayor belum terselesaikan, atau capaian standar di bawah target, lalu melakukan <strong>Pemanggilan Resmi RTM</strong> untuk evaluasi pertanggungjawaban tingkat pimpinan.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="px-3.5 py-2 rounded-xl bg-white/10 backdrop-blur-xs border border-white/20 text-center">
              <span className="text-[10px] uppercase font-bold text-amber-300 block">Perlu Hearing</span>
              <span className="text-xl font-extrabold text-white">
                {prodiMetrics.filter(m => m.openCount > 0).length}
              </span>
              <span className="text-[9px] text-emerald-200">Unit / Prodi</span>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-rose-500/20 backdrop-blur-xs border border-rose-400/30 text-center">
              <span className="text-[10px] uppercase font-bold text-rose-300 block">Temuan Mayor</span>
              <span className="text-xl font-extrabold text-rose-300">
                {prodiMetrics.reduce((acc, curr) => acc + curr.mayorCount, 0)}
              </span>
              <span className="text-[9px] text-rose-200">Kritis</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama prodi, kode, atau nama ketua prodi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Faculty Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={facultyFilter}
              onChange={(e) => setFacultyFilter(e.target.value)}
              className="text-xs p-2 border border-slate-200 rounded-xl bg-slate-50 font-medium text-slate-700"
            >
              <option value="ALL">Semua Fakultas & Unit</option>
              <option value="unit-fai">Fakultas Agama Islam (FAI)</option>
              <option value="unit-fkip">Fakultas Ilmu Pendidikan (FIP)</option>
              <option value="unit-fst">Fakultas Sains dan Teknologi (FSTK)</option>
              <option value="unit-pasca">Sekolah Pascasarjana</option>
              <option value="unit-lppm">Lembaga LPPM & Unit Khusus</option>
            </select>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="text-xs p-2 border border-slate-200 rounded-xl bg-slate-50 font-medium text-slate-700"
          >
            <option value="ALL">Semua Status Temuan</option>
            <option value="MEMERLUKAN_PANGGILAN">Perlu Evaluasi (Ada Temuan Terbuka)</option>
            <option value="AMAN">Tuntas (Semua Temuan Closed)</option>
          </select>
        </div>
      </div>

      {/* Grid of Study Programs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMetrics.map(item => {
          const {
            unit,
            score,
            totalFindings,
            mayorCount,
            minorCount,
            observasiCount,
            openCount,
            progressCount,
            closedCount,
            unitFindings,
            hasScheduledRTM,
            isUrgent,
          } = item;

          const openTotal = openCount + progressCount;

          return (
            <div
              key={unit.id}
              className={`bg-white rounded-2xl border p-5 shadow-xs transition hover:shadow-md flex flex-col justify-between ${
                mayorCount > 0
                  ? 'border-rose-300 ring-1 ring-rose-200 bg-rose-50/20'
                  : openTotal > 0
                  ? 'border-amber-300 bg-amber-50/15'
                  : 'border-slate-200/90'
              }`}
            >
              <div className="space-y-3">
                {/* Header: Unit Code & Type */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                      {unit.code} • {unit.type}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug pt-1">
                      {unit.name}
                    </h3>
                  </div>

                  {/* Urgency Pill */}
                  {mayorCount > 0 ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300 shrink-0 animate-pulse">
                      <Flame className="w-3 h-3 text-rose-600" />
                      Kritis (Mayor)
                    </span>
                  ) : openTotal > 0 ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 shrink-0">
                      <Clock className="w-3 h-3 text-amber-600" />
                      {openTotal} Belum Tuntas
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shrink-0">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Tuntas
                    </span>
                  )}
                </div>

                {/* Kaprodi / Head Name */}
                <div className="text-xs text-slate-500 bg-slate-50 p-2 rounded-xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="block text-[10px] text-slate-400 font-semibold uppercase">Pimpinan Unit / Kaprodi</span>
                    <span className="font-bold text-slate-800 text-[11px] truncate max-w-[200px] block">
                      {unit.headName || 'Pimpinan Unit'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="block text-[10px] text-slate-400 font-semibold uppercase">Skor Mutu</span>
                    <span className={`font-extrabold text-xs ${
                      score >= 3.5 ? 'text-emerald-700' : score >= 3.0 ? 'text-teal-700' : 'text-amber-700'
                    }`}>
                      {score.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Findings Breakdown Counters */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                    <span>Temuan Audit Internal:</span>
                    <span className="font-bold text-slate-800">{totalFindings} Butir</span>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
                    <div className="p-2 rounded-xl bg-rose-50 border border-rose-200">
                      <span className="block text-[10px] font-bold text-rose-700 uppercase">Mayor</span>
                      <span className="text-sm font-extrabold text-rose-800">{mayorCount}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-amber-50 border border-amber-200">
                      <span className="block text-[10px] font-bold text-amber-700 uppercase">Minor</span>
                      <span className="text-sm font-extrabold text-amber-800">{minorCount}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-blue-50 border border-blue-200">
                      <span className="block text-[10px] font-bold text-blue-700 uppercase">Observasi</span>
                      <span className="text-sm font-extrabold text-blue-800">{observasiCount}</span>
                    </div>
                  </div>
                </div>

                {/* Specific open findings preview if any */}
                {unitFindings.length > 0 && (
                  <div className="pt-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                      Fokus Pokok Temuan:
                    </span>
                    <ul className="space-y-1 text-[11px] text-slate-600">
                      {unitFindings.slice(0, 2).map(f => (
                        <li key={f.id} className="flex items-start gap-1.5">
                          <span className={`mt-0.5 w-1.5 h-1.5 rounded-full shrink-0 ${
                            f.category === 'Mayor' ? 'bg-rose-500' : 'bg-amber-500'
                          }`} />
                          <span className="line-clamp-1 leading-snug">
                            <strong>{f.standardCode}:</strong> {f.problemDescription}
                          </span>
                        </li>
                      ))}
                      {unitFindings.length > 2 && (
                        <li className="text-[10px] text-slate-400 font-medium pl-3">
                          +{unitFindings.length - 2} temuan lainnya...
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                {/* Scheduled RTM Tag if already exists */}
                {hasScheduledRTM && (
                  <div className="p-2 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-[11px] font-medium flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span>Sudah terjadwal dalam agenda RTM terdaftar.</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 mt-3 border-t border-slate-100 flex items-center gap-2">
                {canSummon && (
                  <button
                    onClick={() => onPanggilProdi(unit, unitFindings)}
                    className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 shadow-xs ${
                      mayorCount > 0
                        ? 'bg-rose-600 hover:bg-rose-700 text-white'
                        : openTotal > 0
                        ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                        : 'bg-slate-800 hover:bg-slate-900 text-white'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    Panggil ke Sidang RTM
                  </button>
                )}

                {onFilterRTMByProdi && item.relatedRTMs.length > 0 && (
                  <button
                    onClick={() => onFilterRTMByProdi(unit.id)}
                    title="Lihat riwayat RTM unit ini"
                    className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-semibold"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredMetrics.length === 0 && (
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500">
          <Building2 className="w-10 h-10 mx-auto text-slate-300 mb-2" />
          <p className="font-semibold text-sm">Tidak ada program studi yang cocok dengan filter.</p>
          <p className="text-xs text-slate-400 mt-1">Coba sesuaikan kata kunci pencarian atau kriteria filter fakultas.</p>
        </div>
      )}
    </div>
  );
};
