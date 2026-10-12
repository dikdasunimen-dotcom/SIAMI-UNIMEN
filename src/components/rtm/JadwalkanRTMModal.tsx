import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { RTMRecord, Unit, Finding, isFacultyLeaderRole, SummonedFindingRef } from '../../types';
import { UnimenLogo } from '../common/UnimenLogo';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  AlertTriangle,
  Building2,
  FileText,
  X,
  CheckCircle2,
  Sparkles,
  Layers,
  ChevronDown,
  ShieldAlert
} from 'lucide-react';

interface JadwalkanRTMModalProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedProdi?: Unit | null;
  preSelectedFindings?: Finding[] | null;
  editingRecord?: RTMRecord | null;
}

export const JadwalkanRTMModal: React.FC<JadwalkanRTMModalProps> = ({
  isOpen,
  onClose,
  preSelectedProdi,
  preSelectedFindings,
  editingRecord,
}) => {
  const { units, findings, currentUser, addRTMRecord, updateRTMRecord } = useApp();

  const isDean = isFacultyLeaderRole(currentUser.role) || currentUser.role === 'Dekan' || currentUser.role === 'Direktur Pascasarjana';

  // State variables
  const [level, setLevel] = useState<'Universitas' | 'Fakultas'>('Universitas');
  const [meetingNumber, setMeetingNumber] = useState('');
  const [agenda, setAgenda] = useState('');
  const [leadName, setLeadName] = useState(currentUser.name);
  const [leadRole, setLeadRole] = useState<string>(currentUser.role);
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 5);
    return d.toISOString().split('T')[0];
  });
  const [scheduledTime, setScheduledTime] = useState('09:30 - 12:30 WITA');
  const [location, setLocation] = useState('Ruang Sidang Senat Gedung Rektorat UNIMEN Lt. 3 / Zoom ID: 882-991-002');
  const [urgencyLevel, setUrgencyLevel] = useState<'Tinggi (Temuan Mayor)' | 'Sedang (Minor)' | 'Rutin Siklus AMI'>('Sedang (Minor)');
  const [summonNotes, setSummonNotes] = useState('');
  const [selectedProdiIds, setSelectedProdiIds] = useState<string[]>([]);
  const [selectedFindingIds, setSelectedFindingIds] = useState<string[]>([]);
  const [participantsInput, setParticipantsInput] = useState('');

  // Default values setup
  useEffect(() => {
    if (editingRecord) {
      setLevel(editingRecord.level);
      setMeetingNumber(editingRecord.meetingNumber || `UNIMEN/RTM/2026/${Math.floor(100 + Math.random() * 900)}`);
      setAgenda(editingRecord.agenda);
      setLeadName(editingRecord.leadName);
      setLeadRole(editingRecord.leadRole || (editingRecord.level === 'Universitas' ? 'Rektor' : 'Dekan'));
      setDate(editingRecord.date);
      setScheduledTime(editingRecord.scheduledTime || '09:30 - 12:30 WITA');
      setLocation(editingRecord.location || 'Ruang Sidang Senat UNIMEN');
      setUrgencyLevel(editingRecord.urgencyLevel || 'Sedang (Minor)');
      setSummonNotes(editingRecord.summonNotes || '');
      setSelectedProdiIds(editingRecord.summonedUnitIds || (editingRecord.unitId ? [editingRecord.unitId] : []));
      setSelectedFindingIds(editingRecord.summonedFindings?.map(f => f.findingId) || []);
      setParticipantsInput(editingRecord.participants.join(', '));
    } else {
      const defaultLvl = isDean ? 'Fakultas' : 'Universitas';
      setLevel(defaultLvl);

      const generatedNum = defaultLvl === 'Universitas'
        ? `UNIMEN/R/UND-RTM/IV/2026/0${Math.floor(10 + Math.random() * 90)}`
        : `UNIMEN/${currentUser.unitName.split(' ')[0] || 'FAK'}/UND-RTM/IV/2026/0${Math.floor(10 + Math.random() * 90)}`;
      setMeetingNumber(generatedNum);

      if (defaultLvl === 'Universitas') {
        setLeadName('Dr. Drs. Syawal Sitonda, M.Ag.');
        setLeadRole('Rektor Universitas Muhammadiyah Enrekang');
        setLocation('Ruang Sidang Senat, Gedung Rektorat UNIMEN Lt. 3 / Zoom ID: 882-991-002');
        setParticipantsInput('Rektor, Wakil Rektor I, Ketua LPM, Ketua LPPM, Para Dekan Fakultas, Kaprodi Terkait, Tim Penjaminan Mutu');
      } else {
        setLeadName(currentUser.name);
        setLeadRole(currentUser.role);
        setLocation('Ruang Rapat Dekanat Gedung Kampus UNIMEN');
        setParticipantsInput('Dekan, Wakil Dekan, Gugus Kendali Mutu (GKM), Kaprodi Terpanggil, Ketua UJM Prodi');
      }

      if (preSelectedProdi) {
        setSelectedProdiIds([preSelectedProdi.id]);
        setAgenda(`Rapat Tinjauan Manajemen & Evaluasi Pimpinan Tingkat ${defaultLvl}: Pertanggungjawaban Temuan Audit ${preSelectedProdi.name}`);
        setSummonNotes(`Pimpinan memanggil Ketua Program Studi ${preSelectedProdi.name} dan tim mutu prodi untuk memberikan klarifikasi dan rencana penyelesaian tindak lanjut temuan audit mutu.`);
      } else {
        setAgenda(`Rapat Tinjauan Manajemen (RTM) Siklus AMI Genap 2025/2026 Tingkat ${defaultLvl}`);
        setSummonNotes('Pimpinan memanggil pimpinan unit dan program studi terkait untuk evaluasi progres penutupan temuan AMI.');
      }

      if (preSelectedFindings && preSelectedFindings.length > 0) {
        setSelectedFindingIds(preSelectedFindings.map(f => f.id));
        const hasMayor = preSelectedFindings.some(f => f.category === 'Mayor');
        if (hasMayor) setUrgencyLevel('Tinggi (Temuan Mayor)');
      } else {
        setSelectedFindingIds([]);
      }
    }
  }, [editingRecord, preSelectedProdi, preSelectedFindings, isOpen, isDean]);

  if (!isOpen) return null;

  // Filter study programs available to be summoned
  const selectableUnits = units.filter(u => {
    if (u.type !== 'Program Studi' && u.type !== 'Lembaga' && u.type !== 'Fakultas') return false;
    if (level === 'Fakultas' && isDean && currentUser.unitId && currentUser.unitId !== 'unit-unimen') {
      return u.parentUnitId === currentUser.unitId || u.facultyId === currentUser.unitId || u.id === currentUser.unitId;
    }
    return true;
  });

  // Findings available for selected prodis
  const availableFindings = findings.filter(f => {
    if (selectedProdiIds.length === 0) return true;
    return selectedProdiIds.includes(f.unitId) || selectedProdiIds.some(pid => {
      const u = units.find(unit => unit.id === pid);
      return u && f.unitName.includes(u.name);
    });
  });

  const toggleProdiSelection = (prodiId: string) => {
    setSelectedProdiIds(prev => {
      const exists = prev.includes(prodiId);
      const next = exists ? prev.filter(id => id !== prodiId) : [...prev, prodiId];
      // Also update agenda if first selection
      if (!exists && next.length === 1 && !agenda.includes('Evaluasi Khusus')) {
        const u = units.find(unit => unit.id === prodiId);
        if (u) {
          setAgenda(`Hearing & Evaluasi Pimpinan RTM: Pertanggungjawaban Temuan Mutu ${u.name}`);
        }
      }
      return next;
    });
  };

  const toggleFindingSelection = (findingId: string) => {
    setSelectedFindingIds(prev =>
      prev.includes(findingId) ? prev.filter(id => id !== findingId) : [...prev, findingId]
    );
  };

  const handleSelectAllFindings = () => {
    if (selectedFindingIds.length === availableFindings.length) {
      setSelectedFindingIds([]);
    } else {
      setSelectedFindingIds(availableFindings.map(f => f.id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agenda.trim()) return;

    const chosenUnits = units.filter(u => selectedProdiIds.includes(u.id));
    const chosenFindings: SummonedFindingRef[] = findings
      .filter(f => selectedFindingIds.includes(f.id))
      .map(f => ({
        findingId: f.id,
        findingNumber: f.findingNumber,
        unitName: f.unitName,
        standardCode: f.standardCode,
        category: f.category,
        problemDescription: f.problemDescription,
        status: f.status,
      }));

    const parsedParticipants = participantsInput
      .split(',')
      .map(p => p.trim())
      .filter(Boolean);

    const targetUnitId = level === 'Universitas' ? 'unit-unimen' : (currentUser.unitId || 'unit-fakultas');
    const targetUnitName = level === 'Universitas'
      ? 'Universitas Muhammadiyah Enrekang'
      : (currentUser.unitName || 'Fakultas Terkait');

    if (editingRecord) {
      updateRTMRecord(editingRecord.id, {
        level,
        meetingNumber,
        agenda,
        leadName,
        leadRole,
        date,
        scheduledTime,
        location,
        urgencyLevel,
        summonNotes,
        summonedUnitIds: selectedProdiIds,
        summonedUnitNames: chosenUnits.map(u => u.name),
        summonedFindings: chosenFindings,
        participants: parsedParticipants.length > 0 ? parsedParticipants : editingRecord.participants,
      });
    } else {
      addRTMRecord({
        meetingNumber,
        level,
        unitId: targetUnitId,
        unitName: targetUnitName,
        date,
        scheduledTime,
        location,
        leadName,
        leadRole,
        agenda,
        sessionStatus: 'Terjadwal',
        urgencyLevel,
        summonedUnitIds: selectedProdiIds,
        summonedUnitNames: chosenUnits.map(u => u.name),
        summonedFindings: chosenFindings,
        summonNotes,
        requiredAuditeeRoles: ['Ketua Program Studi', 'Ketua GKM/UJM', 'PIC Temuan Terkait'],
        participants: parsedParticipants.length > 0 ? parsedParticipants : [
          leadName,
          'Ketua LPM / GKM',
          'Para Kaprodi Terpanggil',
          'Auditor Terkait'
        ],
        discussionSummary: `Agenda sidang RTM telah dijadwalkan oleh ${leadName} untuk memanggil ${chosenUnits.length} Program Studi / Unit Kerja berdasarkan temuan audit internal.`,
        decisions: [
          {
            id: `dec-${Date.now()}-01`,
            item: `Klarifikasi Hasil Temuan Audit ${chosenUnits.map(u => u.code).join(', ')}`,
            action: 'Prodi wajib menyiapkan formulir klarifikasi dan bukti penutupan CAP sebelum hearing pimpinan berlangsung.',
            pic: chosenUnits.map(u => u.headName || u.name).join(' & '),
            deadline: date,
            ppeppTarget: 'Pengendalian'
          }
        ],
        status: 'Draft',
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full my-8 shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header with Institutional Branding */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-5 border-b border-emerald-800 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <UnimenLogo size="sm" variant="icon" />
              <div>
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-amber-300 block">
                  Penjadwalan Resmi & Pemanggilan Prodi
                </span>
                <h2 className="text-base font-extrabold text-white">
                  {editingRecord ? 'Perbarui Jadwal Rapat Tinjauan Manajemen (RTM)' : 'Jadwalkan RTM & Panggil Program Studi'}
                </h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/20 text-emerald-200 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
          {/* Level & Nomor Surat */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-800 block mb-1">
                Tingkatan RTM <span className="text-rose-500">*</span>
              </label>
              <select
                value={level}
                onChange={(e) => {
                  const val = e.target.value as any;
                  setLevel(val);
                  if (val === 'Universitas') {
                    setLeadName('Dr. Drs. Syawal Sitonda, M.Ag.');
                    setLeadRole('Rektor Universitas Muhammadiyah Enrekang');
                  } else {
                    setLeadName(currentUser.name);
                    setLeadRole(currentUser.role);
                  }
                }}
                className="w-full p-2.5 border border-slate-300 rounded-xl bg-white font-medium focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              >
                <option value="Universitas">Tingkat Universitas (Dipimpin Rektorat)</option>
                <option value="Fakultas">Tingkat Fakultas (Dipimpin Dekanat)</option>
              </select>
              <span className="text-[10px] text-slate-400 mt-1 block">
                {level === 'Universitas'
                  ? 'Forum tertinggi seluruh universitas melibatkan para Dekan & Pimpinan Lembaga.'
                  : 'Forum fakultas dipimpin Dekan mengevaluasi prodi-prodi di bawah naungannya.'}
              </span>
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">
                Nomor Surat Undangan / Pemanggilan <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={meetingNumber}
                onChange={(e) => setMeetingNumber(e.target.value)}
                placeholder="Contoh: UNIMEN/R/UND-RTM/IV/2026/021"
                className="w-full p-2.5 border border-slate-300 rounded-xl font-mono text-xs focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Agenda & Urgensi */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="font-bold text-slate-800 block mb-1">
                Agenda Utama Sidang RTM <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={agenda}
                onChange={(e) => setAgenda(e.target.value)}
                placeholder="Contoh: Hearing Pertanggungjawaban Temuan AMI & Penyelarasan Kurikulum OBE..."
                className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 font-medium"
              />
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">
                Tingkat Urgensi Sidang
              </label>
              <select
                value={urgencyLevel}
                onChange={(e) => setUrgencyLevel(e.target.value as any)}
                className="w-full p-2.5 border border-slate-300 rounded-xl bg-white font-medium focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              >
                <option value="Tinggi (Temuan Mayor)">🔴 Tinggi (Temuan Mayor Kritis)</option>
                <option value="Sedang (Minor)">🟡 Sedang (Evaluasi Temuan Minor)</option>
                <option value="Rutin Siklus AMI">🟢 Rutin Siklus AMI</option>
              </select>
            </div>
          </div>

          {/* Tanggal, Waktu & Lokasi */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="font-bold text-slate-800 block mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                Tanggal Pelaksanaan <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-700" />
                Waktu Pelaksanaan
              </label>
              <input
                type="text"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                placeholder="09:00 - 12:30 WITA"
                className="w-full p-2.5 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                Tempat / Ruang Sidang
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ruang Senat Rektorat / Zoom UNIMEN"
                className="w-full p-2.5 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Pimpinan Sidang */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-800 block mb-1">
                Pimpinan Sidang RTM <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={leadName}
                onChange={(e) => setLeadName(e.target.value)}
                placeholder="Nama Rektor atau Dekan..."
                className="w-full p-2.5 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">
                Jabatan Pimpinan Sidang
              </label>
              <input
                type="text"
                value={leadRole}
                onChange={(e) => setLeadRole(e.target.value)}
                placeholder="Contoh: Rektor / Dekan Fakultas..."
                className="w-full p-2.5 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* BAGIAN UTAMA: PEMANGGILAN PRODI & TEMUAN AUDIT */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-emerald-700" />
                  1. Pilih Program Studi & Unit Kerja yang Dipanggil Hadir ({selectedProdiIds.length} dipilih)
                </label>
                <span className="text-[10px] text-slate-400 font-medium">Klik untuk memilih</span>
              </div>
              <p className="text-[11px] text-slate-500 mb-3">
                Pimpinan memanggil Kaprodi dan tim jaminan mutu unit terkait untuk mempertanggungjawabkan temuan audit.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 bg-white rounded-xl border border-slate-200">
                {selectableUnits.map(unit => {
                  const isSelected = selectedProdiIds.includes(unit.id);
                  const unitFindingsCount = findings.filter(f => f.unitId === unit.id || f.unitName.includes(unit.name)).length;
                  const hasMayor = findings.some(f => (f.unitId === unit.id || f.unitName.includes(unit.name)) && f.category === 'Mayor');

                  return (
                    <div
                      key={unit.id}
                      onClick={() => toggleProdiSelection(unit.id)}
                      className={`p-2.5 rounded-xl border cursor-pointer transition flex items-center justify-between text-xs ${
                        isSelected
                          ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500 text-emerald-950 font-bold'
                          : 'bg-slate-50/60 hover:bg-slate-100 border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 shrink-0"
                        />
                        <div className="truncate">
                          <span className="text-[10px] font-bold block text-slate-400 uppercase">{unit.code}</span>
                          <span className="truncate block font-semibold">{unit.name}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        {hasMayor && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-rose-100 text-rose-800 border border-rose-300">
                            Mayor
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-200 text-slate-700">
                          {unitFindingsCount} Temuan
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SELEKSI TEMUAN AUDIT YANG DITELAAH */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  2. Butir Temuan Audit yang Ditelaah dalam Sidang ({selectedFindingIds.length} dipilih)
                </label>
                {availableFindings.length > 0 && (
                  <button
                    type="button"
                    onClick={handleSelectAllFindings}
                    className="text-[10px] text-emerald-700 hover:text-emerald-800 font-bold underline"
                  >
                    {selectedFindingIds.length === availableFindings.length ? 'Batal Pilih Semua' : 'Pilih Semua Temuan'}
                  </button>
                )}
              </div>
              <p className="text-[11px] text-slate-500 mb-2">
                Temuan terpilih akan dicantumkan secara resmi dalam surat panggilan dan matriks evaluasi pimpinan.
              </p>

              {availableFindings.length === 0 ? (
                <div className="p-4 bg-white rounded-xl border border-dashed border-slate-300 text-center text-slate-400 text-xs">
                  Pilih program studi di atas untuk memuat butir temuan audit terkait.
                </div>
              ) : (
                <div className="space-y-1.5 max-h-52 overflow-y-auto p-2 bg-white rounded-xl border border-slate-200">
                  {availableFindings.map(f => {
                    const isSelected = selectedFindingIds.includes(f.id);
                    return (
                      <div
                        key={f.id}
                        onClick={() => toggleFindingSelection(f.id)}
                        className={`p-2.5 rounded-xl border cursor-pointer transition flex items-start gap-2.5 text-xs ${
                          isSelected
                            ? 'bg-amber-50/70 border-amber-400 ring-1 ring-amber-400'
                            : 'bg-slate-50/40 hover:bg-slate-100 border-slate-200'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="mt-0.5 w-4 h-4 rounded text-amber-600 focus:ring-amber-500 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-0.5">
                            <span className="font-mono text-[10px] font-bold text-slate-700 bg-slate-200/80 px-1.5 py-0.5 rounded">
                              {f.findingNumber}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                              f.category === 'Mayor'
                                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                : f.category === 'Minor'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-blue-100 text-blue-800 border border-blue-200'
                            }`}>
                              {f.category}
                            </span>
                            <span className="text-[10px] font-semibold text-slate-500">
                              {f.unitName}
                            </span>
                          </div>
                          <p className="text-slate-800 text-xs font-medium leading-snug line-clamp-2">
                            {f.problemDescription}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Catatan / Arahan Pemanggilan untuk Kaprodi */}
          <div>
            <label className="font-bold text-slate-800 block mb-1">
              Catatan & Instruksi Khusus Pimpinan untuk Prodi yang Dipanggil
            </label>
            <textarea
              rows={3}
              value={summonNotes}
              onChange={(e) => setSummonNotes(e.target.value)}
              placeholder="Contoh: Ketua Program Studi wajib membawa draf revisi RPS, portofolio asesmen OBE, dan SK penetapan PIC penyelesaian sebelum sidang evaluasi dimulai..."
              className="w-full p-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Catatan ini akan dicetak di lembar Surat Panggilan RTM resmi dan diteruskan ke Kaprodi.
            </span>
          </div>

          {/* Peserta Sidang RTM */}
          <div>
            <label className="font-bold text-slate-800 block mb-1">
              Peserta Sidang yang Diundang (Pisahkan dengan koma)
            </label>
            <input
              type="text"
              value={participantsInput}
              onChange={(e) => setParticipantsInput(e.target.value)}
              placeholder="Rektor, Para Dekan, Ketua LPM, Kaprodi Terpanggil, Gugus Kendali Mutu..."
              className="w-full p-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 font-medium"
            />
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold transition text-xs"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold shadow-md transition active:scale-95 text-xs flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              {editingRecord ? 'Simpan Perubahan Jadwal RTM' : 'Terbitkan Jadwal & Kirim Panggilan Prodi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
