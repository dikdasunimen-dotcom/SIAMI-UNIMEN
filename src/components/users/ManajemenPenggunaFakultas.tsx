import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { User, UserRole, isFacultyLeaderRole } from '../../types';
import { FACULTY_ROLE_DEFINITIONS } from '../../data/seedData';
import {
  Users,
  UserCheck,
  ShieldCheck,
  Building,
  GraduationCap,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  KeyRound,
  Download,
  RefreshCw,
  Award,
  BookOpen,
  ChevronRight,
  ShieldAlert,
  FileSpreadsheet,
  Layers,
  Sparkles,
  Phone,
  Mail,
  Clock,
  Briefcase,
  UserPlus,
  AlertCircle
} from 'lucide-react';

interface ManajemenPenggunaFakultasProps {
  onNavigateToTab?: (tab: string) => void;
}

export const ManajemenPenggunaFakultas: React.FC<ManajemenPenggunaFakultasProps> = ({ onNavigateToTab }) => {
  const { currentUser, users, addUser, updateUser, deleteUser, toggleUserStatus, units } = useApp();

  // Determine current user faculty affiliation
  const userFacultyUnit = useMemo(() => {
    if (currentUser.unitId && (currentUser.unitId === 'unit-fai' || currentUser.unitId === 'unit-fip' || currentUser.unitId === 'unit-fstk' || currentUser.unitId === 'unit-pasca')) {
      return currentUser.unitId;
    }
    if (currentUser.facultyId) {
      return currentUser.facultyId;
    }
    // Check if user is dekan
    if (currentUser.role === 'Dekan Fakultas Agama Islam') return 'unit-fai';
    if (currentUser.role === 'Dekan Fakultas Ilmu Pendidikan') return 'unit-fip';
    if (currentUser.role === 'Dekan Fakultas Sains, Teknologi dan Kesehatan') return 'unit-fstk';
    if (currentUser.role === 'Direktur Program Pascasarjana') return 'unit-pasca';
    return 'all';
  }, [currentUser]);

  // Selected faculty filter state (for super admin / LPM, or default to user's faculty)
  const [selectedFacultyId, setSelectedFacultyId] = useState<string>(() => {
    if (userFacultyUnit !== 'all') return userFacultyUnit;
    return 'unit-fai'; // default to FAI
  });

  // Active sub-tab
  const [activeSubTab, setActiveSubTab] = useState<'direktori' | 'struktur' | 'matriks' | 'log'>('direktori');

  // Filters for direktori tab
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProdiFilter, setSelectedProdiFilter] = useState('all');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [assigningProdiModal, setAssigningProdiModal] = useState<{ prodiId: string; prodiName: string } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New user form state
  const [formData, setFormData] = useState({
    name: '',
    nipOrNidn: '',
    email: '',
    phone: '',
    role: 'Dosen' as UserRole,
    unitId: '',
    jabatanStruktural: '',
    academicTitle: 'Lektor',
    specialty: '',
    canUploadEvidence: true,
    canValidateProdi: false,
    canViewFacultyReport: true,
    isFacultyAuditor: false,
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // List of 4 main faculties in UNIMEN
  const facultyOptions = [
    {
      id: 'unit-fai',
      name: 'Fakultas Agama Islam (FAI)',
      code: 'FAI',
      prodiCount: 3,
      prodiList: ['Pendidikan Agama Islam', 'Manajemen Pendidikan Islam', 'Pendidikan Bahasa Arab'],
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    },
    {
      id: 'unit-fip',
      name: 'Fakultas Ilmu Pendidikan (FIP)',
      code: 'FIP',
      prodiCount: 6,
      prodiList: [
        'Pendidikan Guru Sekolah Dasar',
        'Pendidikan Matematika',
        'Pendidikan Bahasa Inggris',
        'Bimbingan dan Konseling',
        'Pendidikan Nonformal',
        'Pendidikan Kepelatihan Olahraga',
      ],
      badge: 'bg-blue-100 text-blue-800 border-blue-200',
    },
    {
      id: 'unit-fstk',
      name: 'Fakultas Sains, Teknologi dan Kesehatan (FSTK)',
      code: 'FSTK',
      prodiCount: 9,
      prodiList: [
        'Perpustakaan dan Sains Informasi',
        'Biokewirausahaan',
        'Manajemen Bisnis Internasional',
        'Agroteknologi',
        'Teknik Sipil',
        'Rekayasa Sistem Komputer',
        'Informatika',
        'Administrasi Rumah Sakit',
        'Gizi',
      ],
      badge: 'bg-purple-100 text-purple-800 border-purple-200',
    },
    {
      id: 'unit-pasca',
      name: 'Program Pascasarjana (Pasca)',
      code: 'PASCA',
      prodiCount: 2,
      prodiList: ['Pendidikan Dasar', 'Pendidikan Umum dan Karakter'],
      badge: 'bg-amber-100 text-amber-800 border-amber-200',
    },
  ];

  // Restrict faculty selection if user is a specific faculty leader / admin
  const isGlobalAdmin = currentUser.role === 'Super Admin' || currentUser.role === 'LPM' || currentUser.role === 'Rektor';
  const effectiveFacultyId = isGlobalAdmin ? selectedFacultyId : (userFacultyUnit !== 'all' ? userFacultyUnit : selectedFacultyId);
  const currentFacultyDef = FACULTY_ROLE_DEFINITIONS[effectiveFacultyId] || FACULTY_ROLE_DEFINITIONS['unit-fai'];
  const currentFacultyMeta = facultyOptions.find(f => f.id === effectiveFacultyId) || facultyOptions[0];

  // Prodis under the active faculty
  const prodisUnderFaculty = useMemo(() => {
    return units.filter(u => u.type === 'Program Studi' && u.parentUnitId === effectiveFacultyId);
  }, [units, effectiveFacultyId]);

  // Users belonging to this faculty (either directly unitId === facultyId or prodi under this faculty or facultyId === facultyId)
  const facultyUsers = useMemo(() => {
    const prodiIds = new Set(prodisUnderFaculty.map(p => p.id));
    return users.filter(u => {
      if (u.unitId === effectiveFacultyId) return true;
      if (u.facultyId === effectiveFacultyId) return true;
      if (prodiIds.has(u.unitId)) return true;
      return false;
    });
  }, [users, effectiveFacultyId, prodisUnderFaculty]);

  // Filtered users for table
  const filteredUsers = useMemo(() => {
    return facultyUsers.filter(u => {
      // Search
      const matchSearch =
        searchTerm === '' ||
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.nipOrNidn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.specialty && u.specialty.toLowerCase().includes(searchTerm.toLowerCase()));

      // Filter prodi
      const matchProdi = selectedProdiFilter === 'all' || u.unitId === selectedProdiFilter;

      // Filter role
      const matchRole = selectedRoleFilter === 'all' || u.role === selectedRoleFilter;

      // Filter status
      const matchStatus =
        selectedStatusFilter === 'all' ||
        (selectedStatusFilter === 'Aktif' && (u.status === 'Aktif' || !u.status)) ||
        (selectedStatusFilter === 'Non-aktif' && u.status === 'Non-aktif');

      return matchSearch && matchProdi && matchRole && matchStatus;
    });
  }, [facultyUsers, searchTerm, selectedProdiFilter, selectedRoleFilter, selectedStatusFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = facultyUsers.length;
    const active = facultyUsers.filter(u => u.status === 'Aktif' || !u.status).length;
    const kaprodiCount = facultyUsers.filter(u => u.role === 'Ketua Program Studi').length;
    const ujmCount = facultyUsers.filter(u => u.role === 'Ketua UJM Prodi').length;
    const gkmCount = facultyUsers.filter(u => u.role === 'Ketua GKM Fakultas').length;
    const auditorCount = facultyUsers.filter(u => u.isFacultyAuditor || u.role === 'Auditor Internal').length;

    return { total, active, kaprodiCount, ujmCount, gkmCount, auditorCount };
  }, [facultyUsers]);

  // Handle open add modal
  const handleOpenAddModal = () => {
    setFormData({
      name: '',
      nipOrNidn: '',
      email: '',
      phone: '',
      role: 'Dosen',
      unitId: prodisUnderFaculty[0]?.id || effectiveFacultyId,
      jabatanStruktural: 'Dosen Homebase Program Studi',
      academicTitle: 'Lektor',
      specialty: '',
      canUploadEvidence: true,
      canValidateProdi: false,
      canViewFacultyReport: true,
      isFacultyAuditor: false,
    });
    setEditingUser(null);
    setIsAddModalOpen(true);
  };

  // Handle open edit modal
  const handleOpenEditModal = (u: User) => {
    setEditingUser(u);
    setFormData({
      name: u.name,
      nipOrNidn: u.nipOrNidn,
      email: u.email,
      phone: u.phone || '',
      role: u.role,
      unitId: u.unitId,
      jabatanStruktural: u.jabatanStruktural || '',
      academicTitle: u.academicTitle || 'Lektor',
      specialty: u.specialty || '',
      canUploadEvidence: u.canUploadEvidence ?? true,
      canValidateProdi: u.canValidateProdi ?? false,
      canViewFacultyReport: u.canViewFacultyReport ?? true,
      isFacultyAuditor: u.isFacultyAuditor ?? false,
    });
    setIsAddModalOpen(true);
  };

  // Handle save user (add or update)
  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.nipOrNidn.trim() || !formData.email.trim()) {
      showToast('Mohon lengkapi nama, NIDN, dan email!');
      return;
    }

    const assignedUnit = units.find(un => un.id === formData.unitId) || units[0];

    if (editingUser) {
      updateUser(editingUser.id, {
        name: formData.name,
        nipOrNidn: formData.nipOrNidn,
        nidn: formData.nipOrNidn,
        email: formData.email,
        phone: formData.phone,
        whatsapp: formData.phone,
        role: formData.role,
        unitId: formData.unitId,
        unitName: assignedUnit.name,
        facultyId: effectiveFacultyId,
        jabatanStruktural: formData.jabatanStruktural,
        academicTitle: formData.academicTitle,
        specialty: formData.specialty,
        canUploadEvidence: formData.canUploadEvidence,
        canValidateProdi: formData.canValidateProdi,
        canViewFacultyReport: formData.canViewFacultyReport,
        isFacultyAuditor: formData.isFacultyAuditor,
      });
      showToast(`Data pengguna "${formData.name}" berhasil diperbarui.`);
    } else {
      addUser({
        name: formData.name,
        nipOrNidn: formData.nipOrNidn,
        nidn: formData.nipOrNidn,
        email: formData.email,
        phone: formData.phone,
        whatsapp: formData.phone,
        role: formData.role,
        unitId: formData.unitId,
        unitName: assignedUnit.name,
        facultyId: effectiveFacultyId,
        jabatanStruktural: formData.jabatanStruktural,
        academicTitle: formData.academicTitle,
        specialty: formData.specialty,
        canUploadEvidence: formData.canUploadEvidence,
        canValidateProdi: formData.canValidateProdi,
        canViewFacultyReport: formData.canViewFacultyReport,
        isFacultyAuditor: formData.isFacultyAuditor,
        status: 'Aktif',
      });
      showToast(`Dosen/Pengguna baru "${formData.name}" berhasil didaftarkan ke ${assignedUnit.name}.`);
    }

    setIsAddModalOpen(false);
  };

  // Handle delete user
  const handleDeleteUser = (u: User) => {
    if (confirm(`Apakah Anda yakin ingin menghapus akses ${u.name} (${u.role}) dari lingkungan ${currentFacultyMeta.name}?`)) {
      deleteUser(u.id);
      showToast(`Akses ${u.name} berhasil dihapus.`);
    }
  };

  // Handle quick assign kaprodi or UJM for a prodi
  const handleQuickAssign = (prodiId: string, roleToAssign: 'Ketua Program Studi' | 'Ketua UJM Prodi', userId: string) => {
    const userToAssign = facultyUsers.find(u => u.id === userId);
    if (!userToAssign) return;

    const prodi = units.find(p => p.id === prodiId);
    if (!prodi) return;

    // Update the chosen user
    updateUser(userId, {
      role: roleToAssign,
      unitId: prodiId,
      unitName: prodi.name,
      jabatanStruktural: roleToAssign === 'Ketua Program Studi' ? `Ketua Program Studi ${prodi.name}` : `Ketua Unit Jaminan Mutu (UJM) ${prodi.name}`,
      canValidateProdi: roleToAssign === 'Ketua Program Studi',
    });

    showToast(`${userToAssign.name} berhasil ditugaskan sebagai ${roleToAssign} di ${prodi.name}.`);
    setAssigningProdiModal(null);
  };

  // Export to CSV simulation
  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Nama,NIDN/NIP,Email,Program Studi / Unit,Peran,Jabatan Struktural,Status,Auditor Internal']
        .concat(
          facultyUsers.map(
            u =>
              `"${u.name}","${u.nipOrNidn}","${u.email}","${u.unitName}","${u.role}","${u.jabatanStruktural || '-'}","${u.status || 'Aktif'}","${u.isFacultyAuditor ? 'Ya' : 'Tidak'}"`
          )
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Daftar_Pengguna_${currentFacultyMeta.code}_UNIMEN.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Daftar pengguna ${currentFacultyMeta.code} berhasil diekspor.`);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-emerald-500/40 animate-fade-in text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Modul Khusus Admin & Pimpinan Fakultas
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-semibold text-slate-500">Struktur SPMI UNIMEN</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2.5">
              <Users className="w-6 h-6 text-emerald-700" />
              Manajemen Akses Dosen & Pengelola Prodi
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl">
              Pengelolaan akun dosen, penetapan Ketua Program Studi, Tim Gugus Kendali Mutu (GKM) Fakultas,
              Unit Jaminan Mutu (UJM) Prodi, serta auditor internal pendamping sesuai struktur organisasi Universitas Muhammadiyah Enrekang.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 shadow-2xs transition"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Ekspor Data (CSV)</span>
            </button>

            <button
              onClick={() => showToast('Sinkronisasi data dosen dengan PDDIKTI dan SIMPEG UNIMEN berhasil!')}
              className="px-3.5 py-2 rounded-xl border border-emerald-300 bg-emerald-50/70 hover:bg-emerald-100/70 text-emerald-800 font-bold text-xs flex items-center gap-1.5 transition"
            >
              <RefreshCw className="w-3.5 h-3.5 text-emerald-700" />
              <span>Sinkron SIMPEG UNIMEN</span>
            </button>

            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition"
            >
              <UserPlus className="w-4 h-4" />
              <span>Tambah Dosen / Akun</span>
            </button>
          </div>
        </div>

        {/* Faculty Selector Bar (Available for Global Admin or shows scope for faculty admin) */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-emerald-700" />
              Pilih Lingkup Fakultas / Pascasarjana:
            </span>
            {!isGlobalAdmin && (
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                Akses Terkunci ke: {currentFacultyMeta.name}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {facultyOptions.map(fac => {
              const isSelected = effectiveFacultyId === fac.id;
              const isAllowed = isGlobalAdmin || userFacultyUnit === fac.id || userFacultyUnit === 'all';

              return (
                <button
                  key={fac.id}
                  disabled={!isAllowed}
                  onClick={() => setSelectedFacultyId(fac.id)}
                  className={`text-left p-3.5 rounded-xl border transition flex flex-col justify-between ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/80 shadow-xs ring-2 ring-emerald-500/20'
                      : isAllowed
                      ? 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300'
                      : 'border-slate-200/50 bg-slate-50/50 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-extrabold text-slate-900 line-clamp-1">{fac.name}</span>
                    <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${fac.badge}`}>
                      {fac.code}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                    <span>{fac.prodiCount} Program Studi</span>
                    <span className="font-semibold text-emerald-700">
                      {users.filter(u => u.unitId === fac.id || u.facultyId === fac.id || units.some(un => un.parentUnitId === fac.id && un.id === u.unitId)).length} Dosen
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Scope Banner: Detailed description of current faculty & its prodis */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-emerald-800 text-emerald-200 font-extrabold text-[10px] rounded uppercase tracking-wider">
                {currentFacultyDef.facultyCode}
              </span>
              <h2 className="text-lg font-bold">{currentFacultyDef.facultyName}</h2>
            </div>
            <p className="text-xs text-emerald-100 max-w-2xl">{currentFacultyDef.description}</p>
          </div>

          <div className="bg-emerald-950/50 border border-emerald-700/50 p-3 rounded-xl shrink-0 text-right md:min-w-[240px]">
            <p className="text-[10px] text-emerald-300 uppercase font-semibold">Pimpinan Unit</p>
            <p className="text-xs font-bold text-white mt-0.5">{currentFacultyDef.headName}</p>
            <p className="text-[11px] text-emerald-200 font-mono">NIDN: {currentFacultyDef.headNidn}</p>
          </div>
        </div>

        {/* Prodi List Pills */}
        <div className="mt-4 pt-3 border-t border-emerald-800/80">
          <p className="text-[11px] font-semibold text-emerald-300 mb-1.5 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            Program Studi di Bawah Naungan {currentFacultyDef.facultyName} ({currentFacultyDef.prodiNames.length} Prodi):
          </p>
          <div className="flex flex-wrap gap-1.5">
            {currentFacultyDef.prodiNames.map((pName, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 text-[11px] bg-emerald-800/80 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-lg border border-emerald-600/60 font-medium transition"
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-300" />
                {pName}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-semibold text-slate-500">Total Dosen/Staff</p>
          <p className="text-xl font-extrabold text-slate-900 mt-0.5">{stats.total}</p>
          <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">{stats.active} Akun Aktif</p>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-semibold text-slate-500">Program Studi</p>
          <p className="text-xl font-extrabold text-slate-900 mt-0.5">{prodisUnderFaculty.length}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Semua Terdaftar</p>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-semibold text-slate-500">Ketua Prodi</p>
          <p className="text-xl font-extrabold text-emerald-700 mt-0.5">{stats.kaprodiCount}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Penanggung Jawab</p>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-semibold text-slate-500">Ketua UJM Prodi</p>
          <p className="text-xl font-extrabold text-blue-700 mt-0.5">{stats.ujmCount}</p>
          <p className="text-[10px] text-blue-600 font-semibold mt-0.5">Unit Mutu Prodi</p>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-semibold text-slate-500">Tim GKM Fakultas</p>
          <p className="text-xl font-extrabold text-purple-700 mt-0.5">{stats.gkmCount || 1}</p>
          <p className="text-[10px] text-purple-600 font-semibold mt-0.5">Gugus Mutu Fak.</p>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-semibold text-slate-500">Auditor Fakultas</p>
          <p className="text-xl font-extrabold text-amber-700 mt-0.5">{stats.auditorCount}</p>
          <p className="text-[10px] text-amber-600 font-semibold mt-0.5">Tersertifikasi SPMI</p>
        </div>
      </div>

      {/* Sub Navigation Bar */}
      <div className="border-b border-slate-200 flex items-center gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('direktori')}
          className={`pb-3 pt-1 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition whitespace-nowrap ${
            activeSubTab === 'direktori'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Direktori Pengguna & Hak Akses ({facultyUsers.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('struktur')}
          className={`pb-3 pt-1 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition whitespace-nowrap ${
            activeSubTab === 'struktur'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Struktur Tim Mutu Prodi (UJM & GKM)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('matriks')}
          className={`pb-3 pt-1 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition whitespace-nowrap ${
            activeSubTab === 'matriks'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Matriks Hak Akses & Wewenang (RBAC)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('log')}
          className={`pb-3 pt-1 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition whitespace-nowrap ${
            activeSubTab === 'log'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Log Aktivitas & Audit Trail</span>
        </button>
      </div>

      {/* SUB-TAB 1: DIREKTORI PENGGUNA & HAK AKSES */}
      {activeSubTab === 'direktori' && (
        <div className="space-y-4">
          {/* Search & Filters */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari berdasarkan nama, NIDN, email, atau bidang keahlian..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/60"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Prodi Filter */}
              <select
                value={selectedProdiFilter}
                onChange={e => setSelectedProdiFilter(e.target.value)}
                className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-700 font-medium focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">Semua Program Studi</option>
                {prodisUnderFaculty.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>

              {/* Role Filter */}
              <select
                value={selectedRoleFilter}
                onChange={e => setSelectedRoleFilter(e.target.value)}
                className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-700 font-medium focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">Semua Peran</option>
                <option value="Ketua Program Studi">Ketua Program Studi</option>
                <option value="Ketua UJM Prodi">Ketua UJM Prodi</option>
                <option value="Ketua GKM Fakultas">Ketua GKM Fakultas</option>
                <option value="Dosen">Dosen Homebase</option>
                <option value="Admin Fakultas">Admin Fakultas</option>
                <option value="Auditor Internal">Auditor Internal</option>
              </select>

              {/* Status Filter */}
              <select
                value={selectedStatusFilter}
                onChange={e => setSelectedStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-700 font-medium focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">Semua Status</option>
                <option value="Aktif">Aktif</option>
                <option value="Non-aktif">Non-aktif</option>
              </select>

              {(searchTerm || selectedProdiFilter !== 'all' || selectedRoleFilter !== 'all' || selectedStatusFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedProdiFilter('all');
                    setSelectedRoleFilter('all');
                    setSelectedStatusFilter('all');
                  }}
                  className="px-2.5 py-2 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                >
                  Reset Filter
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3.5 px-4">Nama Lengkap & NIDN</th>
                    <th className="py-3.5 px-4">Homebase / Unit</th>
                    <th className="py-3.5 px-4">Peran & Jabatan</th>
                    <th className="py-3.5 px-4">Hak Akses SPMI</th>
                    <th className="py-3.5 px-4 text-center">Status Akun</th>
                    <th className="py-3.5 px-4">Login Terakhir</th>
                    <th className="py-3.5 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                        <p className="font-semibold text-sm">Tidak ada pengguna yang cocok dengan kriteria pencarian</p>
                        <p className="text-xs text-slate-400 mt-1">Coba sesuaikan kata kunci atau filter yang Anda pilih</p>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map(u => {
                      const isActive = u.status === 'Aktif' || !u.status;

                      // Badge role styling
                      let roleBadge = 'bg-slate-100 text-slate-700 border-slate-200';
                      if (u.role.includes('Dekan') || u.role.includes('Direktur')) {
                        roleBadge = 'bg-emerald-100 text-emerald-800 border-emerald-200';
                      } else if (u.role === 'Ketua Program Studi') {
                        roleBadge = 'bg-blue-100 text-blue-800 border-blue-200';
                      } else if (u.role === 'Ketua UJM Prodi') {
                        roleBadge = 'bg-indigo-100 text-indigo-800 border-indigo-200';
                      } else if (u.role === 'Ketua GKM Fakultas') {
                        roleBadge = 'bg-purple-100 text-purple-800 border-purple-200';
                      } else if (u.role === 'Admin Fakultas') {
                        roleBadge = 'bg-amber-100 text-amber-800 border-amber-200';
                      }

                      return (
                        <tr key={u.id} className="hover:bg-slate-50/70 transition">
                          {/* Nama & NIDN */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-emerald-700/10 text-emerald-800 font-bold flex items-center justify-center text-xs shrink-0 border border-emerald-600/20">
                                {u.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-bold text-slate-900">{u.name}</p>
                                <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5 font-mono">
                                  <span>NIDN: {u.nipOrNidn}</span>
                                  <span>•</span>
                                  <span className="text-slate-400">{u.email}</span>
                                </div>
                                {u.specialty && (
                                  <p className="text-[10px] text-slate-400 italic line-clamp-1 mt-0.5">
                                    Kepakaran: {u.specialty}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Unit / Homebase */}
                          <td className="py-3 px-4">
                            <span className="font-semibold text-slate-700 block line-clamp-1">{u.unitName}</span>
                            {u.academicTitle && (
                              <span className="text-[10px] text-slate-400 font-medium">
                                Fungsional: {u.academicTitle}
                              </span>
                            )}
                          </td>

                          {/* Peran & Jabatan */}
                          <td className="py-3 px-4">
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-extrabold border ${roleBadge}`}>
                              {u.role}
                            </span>
                            {u.jabatanStruktural && (
                              <p className="text-[10px] text-slate-500 font-medium mt-1 line-clamp-1">
                                {u.jabatanStruktural}
                              </p>
                            )}
                          </td>

                          {/* Hak Akses SPMI */}
                          <td className="py-3 px-4">
                            <div className="flex flex-wrap gap-1">
                              {u.canUploadEvidence !== false && (
                                <span className="text-[9px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-semibold" title="Bisa unggah bukti kinerja">
                                  Unggah Bukti
                                </span>
                              )}
                              {u.canValidateProdi && (
                                <span className="text-[9px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-bold" title="Bisa validasi hasil audit prodi">
                                  Validasi AMI
                                </span>
                              )}
                              {u.isFacultyAuditor && (
                                <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold" title="Bisa bertugas sebagai auditor internal">
                                  Auditor
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Status Akun */}
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => {
                                toggleUserStatus(u.id);
                                showToast(`Status akun ${u.name} diubah menjadi ${isActive ? 'Non-aktif' : 'Aktif'}.`);
                              }}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition inline-flex items-center gap-1 ${
                                isActive
                                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                  : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                              }`}
                              title="Klik untuk mengubah status aktif/non-aktif"
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-600' : 'bg-slate-400'}`} />
                              <span>{isActive ? 'Aktif' : 'Non-aktif'}</span>
                            </button>
                          </td>

                          {/* Login Terakhir */}
                          <td className="py-3 px-4 text-slate-500 text-[11px]">
                            {u.lastLogin || 'Belum ada riwayat'}
                          </td>

                          {/* Aksi */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => showToast(`Link reset password SSO UNIMEN telah dikirim ke ${u.email}.`)}
                                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition"
                                title="Kirim Reset Password SSO UNIMEN"
                              >
                                <KeyRound className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleOpenEditModal(u)}
                                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition"
                                title="Edit Data & Hak Akses"
                              >
                                <Edit2 className="w-3.5 h-3.5 text-blue-600" />
                              </button>

                              <button
                                onClick={() => handleDeleteUser(u)}
                                className="p-1.5 rounded-lg border border-slate-200 hover:bg-rose-50 text-rose-600 transition"
                                title="Hapus Akses"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span>
                Menampilkan <b>{filteredUsers.length}</b> dari total <b>{facultyUsers.length}</b> personil terdaftar di {currentFacultyMeta.name}
              </span>
              <span className="text-[11px] text-slate-400">
                Terhubung dengan Autentikasi Tunggal (SSO) UNIMEN
              </span>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: STRUKTUR ORGANISASI TIM MUTU PRODI (UJM & GKM) */}
      {activeSubTab === 'struktur' && (
        <div className="space-y-6">
          {/* Level Fakultas Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-purple-100 text-purple-800 uppercase">
                Tingkat Fakultas
              </span>
              <h3 className="font-bold text-sm text-slate-900">
                Pimpinan & Gugus Kendali Mutu (GKM) {currentFacultyMeta.name}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              {/* Dekan Card */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Dekan / Direktur
                </span>
                <p className="font-bold text-sm text-slate-900 mt-1">{currentFacultyDef.headName}</p>
                <p className="text-xs text-slate-500 font-mono mt-0.5">NIDN: {currentFacultyDef.headNidn}</p>
                <p className="text-[11px] text-emerald-700 font-semibold mt-2">
                  Penanggung Jawab Mutu & Pengambil Keputusan RTM
                </p>
              </div>

              {/* Ketua GKM Card */}
              <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/40">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider">
                    Ketua GKM Fakultas
                  </span>
                  <span className="text-[9px] bg-purple-200 text-purple-800 px-1.5 py-0.5 rounded font-bold">
                    Auditor Mutu
                  </span>
                </div>
                {(() => {
                  const gkmUser = facultyUsers.find(u => u.role === 'Ketua GKM Fakultas');
                  return (
                    <>
                      <p className="font-bold text-sm text-slate-900 mt-1">
                        {gkmUser ? gkmUser.name : 'Belum Ditunjuk'}
                      </p>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">
                        {gkmUser ? `NIDN: ${gkmUser.nipOrNidn}` : '-'}
                      </p>
                      <p className="text-[11px] text-purple-700 font-semibold mt-2">
                        Koordinasi Pra-Audit & Pengawalan PPEPP Fakultas
                      </p>
                    </>
                  );
                })()}
              </div>

              {/* Admin/KTU Fakultas Card */}
              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40">
                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">
                  Tata Usaha / Admin Fakultas
                </span>
                {(() => {
                  const adminUser = facultyUsers.find(u => u.role === 'Admin Fakultas');
                  return (
                    <>
                      <p className="font-bold text-sm text-slate-900 mt-1">
                        {adminUser ? adminUser.name : 'Staff Tata Usaha'}
                      </p>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">
                        {adminUser ? `NIP/NIDN: ${adminUser.nipOrNidn}` : '-'}
                      </p>
                      <p className="text-[11px] text-amber-700 font-semibold mt-2">
                        Pengelolaan Akun Dosen & Dokumen Administrasi
                      </p>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* Level Prodi List Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-emerald-700" />
                  Struktur Penjaminan Mutu Program Studi (UJM & Dosen)
                </h3>
                <p className="text-xs text-slate-500">
                  Daftar Ketua Program Studi dan Ketua Unit Jaminan Mutu (UJM) per program studi di lingkungan {currentFacultyMeta.name}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {prodisUnderFaculty.map(prodi => {
                const kaprodi = facultyUsers.find(u => u.unitId === prodi.id && u.role === 'Ketua Program Studi');
                const ujm = facultyUsers.find(u => u.unitId === prodi.id && u.role === 'Ketua UJM Prodi');
                const prodiLecturers = facultyUsers.filter(u => u.unitId === prodi.id);

                return (
                  <div key={prodi.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs hover:border-emerald-300 transition">
                    <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 font-mono">{prodi.code}</span>
                        <h4 className="font-bold text-sm text-slate-900">{prodi.name}</h4>
                      </div>
                      <button
                        onClick={() => setAssigningProdiModal({ prodiId: prodi.id, prodiName: prodi.name })}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-[11px] font-bold text-slate-700 transition shrink-0"
                      >
                        Atur Tim Mutu
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-3">
                      {/* Kaprodi Box */}
                      <div className="p-2.5 rounded-lg bg-blue-50/60 border border-blue-100">
                        <span className="text-[10px] font-bold text-blue-700 uppercase block">Ketua Program Studi</span>
                        <p className="text-xs font-bold text-slate-900 mt-1 line-clamp-1">
                          {kaprodi ? kaprodi.name : 'Belum Ditetapkan'}
                        </p>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                          {kaprodi ? `NIDN: ${kaprodi.nipOrNidn}` : '-'}
                        </p>
                      </div>

                      {/* UJM Box */}
                      <div className="p-2.5 rounded-lg bg-indigo-50/60 border border-indigo-100">
                        <span className="text-[10px] font-bold text-indigo-700 uppercase block">Ketua UJM Prodi</span>
                        <p className="text-xs font-bold text-slate-900 mt-1 line-clamp-1">
                          {ujm ? ujm.name : 'Belum Ditetapkan'}
                        </p>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                          {ujm ? `NIDN: ${ujm.nipOrNidn}` : '-'}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Total Dosen Homebase: <b>{prodiLecturers.length}</b> dosen</span>
                      <span className="text-emerald-700 font-semibold">Skor Mutu: {prodi.qualityScore.toFixed(2)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: MATRIKS HAK AKSES & WEWENANG (RBAC) */}
      {activeSubTab === 'matriks' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              Matriks Kewenangan Peran (Role-Based Access Control) SPMI UNIMEN
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Standar hak akses sistem berdasarkan Keputusan Rektor tentang Tata Kelola SPMI dan Siklus PPEPP di Universitas Muhammadiyah Enrekang.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200 rounded-lg">
              <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="p-3 border-r border-slate-200">Peran Pengguna</th>
                  <th className="p-3 text-center border-r border-slate-200">Unggah Bukti OBE</th>
                  <th className="p-3 text-center border-r border-slate-200">Evaluasi Diri (LED)</th>
                  <th className="p-3 text-center border-r border-slate-200">Validasi Tingkat Prodi</th>
                  <th className="p-3 text-center border-r border-slate-200">Validasi Tingkat Fak.</th>
                  <th className="p-3 text-center border-r border-slate-200">Pelaksanaan RTM Fak.</th>
                  <th className="p-3 text-center border-r border-slate-200">Kelola Akses Dosen</th>
                  <th className="p-3 text-center">Beri Skor Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                <tr className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-900 border-r border-slate-100">Dekan / Direktur Pascasarjana</td>
                  <td className="p-3 text-center border-r border-slate-100"><CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                  <td className="p-3 text-center border-r border-slate-100"><CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                  <td className="p-3 text-center border-r border-slate-100"><CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                  <td className="p-3 text-center border-r border-slate-100"><CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                  <td className="p-3 text-center border-r border-slate-100"><CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                  <td className="p-3 text-center border-r border-slate-100"><CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                  <td className="p-3 text-center"><XCircle className="w-4 h-4 text-slate-300 mx-auto" /></td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-900 border-r border-slate-100">Admin / KTU Fakultas</td>
                  <td className="p-3 text-center border-r border-slate-100"><CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                  <td className="p-3 text-center border-r border-slate-100"><CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                  <td className="p-3 text-center border-r border-slate-100"><XCircle className="w-4 h-4 text-slate-300 mx-auto" /></td>
                  <td className="p-3 text-center border-r border-slate-100"><CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                  <td className="p-3 text-center border-r border-slate-100"><XCircle className="w-4 h-4 text-slate-300 mx-auto" /></td>
                  <td className="p-3 text-center border-r border-slate-100"><CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                  <td className="p-3 text-center"><XCircle className="w-4 h-4 text-slate-300 mx-auto" /></td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-900 border-r border-slate-100">Ketua GKM Fakultas</td>
                  <td className="p-3 text-center border-r border-slate-100"><CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                  <td className="p-3 text-center border-r border-slate-100"><CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                  <td className="p-3 text-center border-r border-slate-100"><CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                  <td className="p-3 text-center border-r border-slate-100"><CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                  <td className="p-3 text-center border-r border-slate-100"><CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                  <td className="p-3 text-center border-r border-slate-100"><XCircle className="w-4 h-4 text-slate-300 mx-auto" /></td>
                  <td className="p-3 text-center"><CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-900 border-r border-slate-100">Ketua Program Studi</td>
                  <td className="p-3 text-center border-r border-slate-100"><CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                  <td className="p-3 text-center border-r border-slate-100"><CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                  <td className="p-3 text-center border-r border-slate-100"><CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                  <td className="p-3 text-center border-r border-slate-100"><XCircle className="w-4 h-4 text-slate-300 mx-auto" /></td>
                  <td className="p-3 text-center border-r border-slate-100"><XCircle className="w-4 h-4 text-slate-300 mx-auto" /></td>
                  <td className="p-3 text-center border-r border-slate-100"><XCircle className="w-4 h-4 text-slate-300 mx-auto" /></td>
                  <td className="p-3 text-center"><XCircle className="w-4 h-4 text-slate-300 mx-auto" /></td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-900 border-r border-slate-100">Ketua Unit Jaminan Mutu (UJM)</td>
                  <td className="p-3 text-center border-r border-slate-100"><CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                  <td className="p-3 text-center border-r border-slate-100"><CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                  <td className="p-3 text-center border-r border-slate-100"><CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                  <td className="p-3 text-center border-r border-slate-100"><XCircle className="w-4 h-4 text-slate-300 mx-auto" /></td>
                  <td className="p-3 text-center border-r border-slate-100"><XCircle className="w-4 h-4 text-slate-300 mx-auto" /></td>
                  <td className="p-3 text-center border-r border-slate-100"><XCircle className="w-4 h-4 text-slate-300 mx-auto" /></td>
                  <td className="p-3 text-center"><XCircle className="w-4 h-4 text-slate-300 mx-auto" /></td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-900 border-r border-slate-100">Dosen Homebase / Auditee</td>
                  <td className="p-3 text-center border-r border-slate-100"><CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                  <td className="p-3 text-center border-r border-slate-100"><CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                  <td className="p-3 text-center border-r border-slate-100"><XCircle className="w-4 h-4 text-slate-300 mx-auto" /></td>
                  <td className="p-3 text-center border-r border-slate-100"><XCircle className="w-4 h-4 text-slate-300 mx-auto" /></td>
                  <td className="p-3 text-center border-r border-slate-100"><XCircle className="w-4 h-4 text-slate-300 mx-auto" /></td>
                  <td className="p-3 text-center border-r border-slate-100"><XCircle className="w-4 h-4 text-slate-300 mx-auto" /></td>
                  <td className="p-3 text-center"><XCircle className="w-4 h-4 text-slate-300 mx-auto" /></td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-900 border-r border-slate-100">Auditor Internal Mutu</td>
                  <td className="p-3 text-center border-r border-slate-100"><XCircle className="w-4 h-4 text-slate-300 mx-auto" /></td>
                  <td className="p-3 text-center border-r border-slate-100"><XCircle className="w-4 h-4 text-slate-300 mx-auto" /></td>
                  <td className="p-3 text-center border-r border-slate-100"><XCircle className="w-4 h-4 text-slate-300 mx-auto" /></td>
                  <td className="p-3 text-center border-r border-slate-100"><XCircle className="w-4 h-4 text-slate-300 mx-auto" /></td>
                  <td className="p-3 text-center border-r border-slate-100"><XCircle className="w-4 h-4 text-slate-300 mx-auto" /></td>
                  <td className="p-3 text-center border-r border-slate-100"><XCircle className="w-4 h-4 text-slate-300 mx-auto" /></td>
                  <td className="p-3 text-center"><CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: LOG AKTIVITAS & AUDIT TRAIL */}
      {activeSubTab === 'log' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-700" />
                Catatan Aktivitas Akses & Otentikasi Terkini
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Pemantauan sesi login dan perubahan data personil di lingkungan {currentFacultyMeta.name}
              </p>
            </div>
            <button
              onClick={() => showToast('Log aktivitas telah disegarkan.')}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              <span>Segarkan Log</span>
            </button>
          </div>

          <div className="space-y-3">
            {[
              {
                user: currentFacultyDef.headName,
                action: 'Login SSO UNIMEN Berhasil',
                detail: `Mengakses Dashboard Fakultas & Validasi Hasil Audit Siklus Genap 2025/2026`,
                time: '15 menit yang lalu',
                badge: 'bg-emerald-100 text-emerald-800',
              },
              {
                user: 'Admin Fakultas',
                action: 'Pembaruan Data Dosen',
                detail: `Menyesuaikan hak akses dokumen bukti dan kepakaran untuk pengisian instrumen OBE`,
                time: '1 jam yang lalu',
                badge: 'bg-blue-100 text-blue-800',
              },
              {
                user: 'Ketua GKM Fakultas',
                action: 'Sinkronisasi Status Akun',
                detail: `Verifikasi berkas kesiapan evaluasi diri LED program studi sebelum jadwal visitasi`,
                time: '3 jam yang lalu',
                badge: 'bg-purple-100 text-purple-800',
              },
              {
                user: 'Sistem SSO UNIMEN',
                action: 'Sinkronisasi Otomatis PDDIKTI',
                detail: `Sinkronisasi 28 data NIDN dan status aktif dosen di lingkungan ${currentFacultyMeta.name}`,
                time: 'Kemarin, 23:00 WITA',
                badge: 'bg-slate-100 text-slate-700',
              },
            ].map((log, idx) => (
              <div key={idx} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-600" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">{log.user}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${log.badge}`}>
                        {log.action}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{log.detail}</p>
                  </div>
                </div>
                <span className="text-[11px] text-slate-400 shrink-0 font-medium">{log.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: TAMBAH / EDIT DOSEN */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    {editingUser ? 'Edit Data & Hak Akses Dosen' : 'Tambah Dosen / Akun Pengelola Baru'}
                  </h3>
                  <p className="text-xs text-slate-500">{currentFacultyMeta.name}</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Lengkap beserta Gelar <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Dr. Ir. Ahmad Sudirman, M.T."
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    NIDN / NIP <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 0914028301"
                    value={formData.nipOrNidn}
                    onChange={e => setFormData({ ...formData, nipOrNidn: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Institusi (@unimen.ac.id) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="nama@unimen.ac.id"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Homebase Program Studi <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.unitId}
                    onChange={e => setFormData({ ...formData, unitId: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value={effectiveFacultyId}>Tingkat Fakultas ({currentFacultyMeta.code})</option>
                    {prodisUnderFaculty.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Peran di SIAMI UNIMEN <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="Dosen">Dosen Homebase (Auditee)</option>
                    <option value="Ketua Program Studi">Ketua Program Studi (Kaprodi)</option>
                    <option value="Ketua UJM Prodi">Ketua Unit Jaminan Mutu (UJM)</option>
                    <option value="Ketua GKM Fakultas">Ketua Gugus Kendali Mutu (GKM)</option>
                    <option value="Admin Fakultas">Admin / KTU Fakultas</option>
                    <option value="Auditor Internal">Auditor Internal Mutu</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Jabatan Fungsional
                  </label>
                  <select
                    value={formData.academicTitle}
                    onChange={e => setFormData({ ...formData, academicTitle: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="Tenaga Pendidik">Tenaga Pendidik / Asisten</option>
                    <option value="Asisten Ahli">Asisten Ahli</option>
                    <option value="Lektor">Lektor</option>
                    <option value="Lektor Kepala">Lektor Kepala</option>
                    <option value="Guru Besar">Guru Besar / Profesor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    No. Handphone / WhatsApp
                  </label>
                  <input
                    type="text"
                    placeholder="0812xxxxxxxx"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Jabatan Struktural / Tugas Tambahan
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Sekretaris Prodi / Anggota Tim Kurikulum OBE"
                  value={formData.jabatanStruktural}
                  onChange={e => setFormData({ ...formData, jabatanStruktural: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Bidang Kepakaran / Riset
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Pembelajaran Tematik & Pendidikan Karakter"
                  value={formData.specialty}
                  onChange={e => setFormData({ ...formData, specialty: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Permissions Checkbox Group */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Hak Akses Khusus Modul SPMI
                </span>

                <label className="flex items-center gap-2 text-xs text-slate-700 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.canUploadEvidence}
                    onChange={e => setFormData({ ...formData, canUploadEvidence: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Izinkan mengunggah bukti dokumen OBE & RPS (Auditee)</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-slate-700 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.canValidateProdi}
                    onChange={e => setFormData({ ...formData, canValidateProdi: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Hak validasi hasil audit internal tingkat program studi</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-slate-700 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.canViewFacultyReport}
                    onChange={e => setFormData({ ...formData, canViewFacultyReport: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Hak melihat laporan rekapitulasi mutu tingkat fakultas</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-slate-700 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFacultyAuditor}
                    onChange={e => setFormData({ ...formData, isFacultyAuditor: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Ditugaskan sebagai Auditor Mutu Internal Fakultas</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition shadow-xs"
                >
                  {editingUser ? 'Simpan Perubahan' : 'Daftarkan Pengguna'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ATUR TIM MUTU PRODI CEPAT */}
      {assigningProdiModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-emerald-700 uppercase">Penetapan Tim Mutu</span>
                <h3 className="font-bold text-sm text-slate-900">{assigningProdiModal.prodiName}</h3>
              </div>
              <button
                onClick={() => setAssigningProdiModal(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Pilih dosen di bawah lingkungan fakultas untuk ditugaskan memimpin penjaminan mutu di prodi ini:
            </p>

            {/* Kaprodi Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">
                Pilih Ketua Program Studi (Kaprodi):
              </label>
              <select
                onChange={e => {
                  if (e.target.value) {
                    handleQuickAssign(assigningProdiModal.prodiId, 'Ketua Program Studi', e.target.value);
                  }
                }}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                defaultValue=""
              >
                <option value="" disabled>-- Pilih Dosen untuk Kaprodi --</option>
                {facultyUsers.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} (NIDN: {u.nipOrNidn})
                  </option>
                ))}
              </select>
            </div>

            {/* UJM Selector */}
            <div className="space-y-1.5 pt-2">
              <label className="block text-xs font-bold text-slate-800">
                Pilih Ketua Unit Jaminan Mutu (UJM Prodi):
              </label>
              <select
                onChange={e => {
                  if (e.target.value) {
                    handleQuickAssign(assigningProdiModal.prodiId, 'Ketua UJM Prodi', e.target.value);
                  }
                }}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                defaultValue=""
              >
                <option value="" disabled>-- Pilih Dosen untuk Ketua UJM --</option>
                {facultyUsers.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} (NIDN: {u.nipOrNidn})
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setAssigningProdiModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
