import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  UserCheck,
  Building,
  Mail,
  Phone,
  Camera,
  CheckCircle2,
  FileCheck2,
  QrCode,
  Sparkles,
  RefreshCw,
  Send,
  ExternalLink,
  ShieldCheck,
  Award,
  IdCard,
  User as UserIcon,
  Upload,
  Calendar,
  Layers,
  AlertTriangle,
  ClipboardList,
  GraduationCap,
  Users2,
  ChevronRight,
  Stamp,
  BookOpen
} from 'lucide-react';
import { UnimenLogo } from '../common/UnimenLogo';

interface ProfilPenggunaViewProps {
  onNavigateToTab?: (tab: string) => void;
  onCloseModal?: () => void;
}

export const ProfilPenggunaView: React.FC<ProfilPenggunaViewProps> = ({ onNavigateToTab, onCloseModal }) => {
  const {
    currentUser,
    updateUser,
    units,
    users,
    switchUserById,
    findings,
    correctiveActions,
    rtmRecords,
    audits
  } = useApp();

  // Form states initialized with current user data
  const [name, setName] = useState(currentUser.name || '');
  const [unitId, setUnitId] = useState(currentUser.unitId || '');
  const [unitName, setUnitName] = useState(currentUser.unitName || '');
  const [nipOrNidn, setNipOrNidn] = useState(currentUser.nipOrNidn || currentUser.nidn || '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [whatsapp, setWhatsapp] = useState(currentUser.whatsapp || currentUser.phone || '');
  const [avatar, setAvatar] = useState(currentUser.avatar || currentUser.photoUrl || '');
  const [academicTitle, setAcademicTitle] = useState(currentUser.academicTitle || 'Lektor');
  const [specialty, setSpecialty] = useState(currentUser.specialty || '');

  const [activeTab, setActiveTab] = useState<'biodata' | 'dashboard-peran' | 'pengesahan' | 'idcard'>('biodata');
  const [isSaved, setIsSaved] = useState(false);

  // Synchronize form when currentUser changes
  useEffect(() => {
    setName(currentUser.name || '');
    setUnitId(currentUser.unitId || '');
    setUnitName(currentUser.unitName || '');
    setNipOrNidn(currentUser.nipOrNidn || currentUser.nidn || '');
    setEmail(currentUser.email || '');
    setWhatsapp(currentUser.whatsapp || currentUser.phone || '');
    setAvatar(currentUser.avatar || currentUser.photoUrl || '');
    setAcademicTitle(currentUser.academicTitle || 'Lektor');
    setSpecialty(currentUser.specialty || '');
  }, [currentUser.id, currentUser]);

  // Handle preset avatar selection
  const avatarPresets = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
  ];

  // Handle local image file upload preview
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Unit Selection
  const handleUnitChange = (selectedId: string) => {
    setUnitId(selectedId);
    const matchedUnit = units.find(u => u.id === selectedId);
    if (matchedUnit) {
      setUnitName(matchedUnit.name);
    }
  };

  // Handle Save
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    updateUser(currentUser.id, {
      name: name.trim(),
      unitId,
      unitName: unitName.trim(),
      nipOrNidn: nipOrNidn.trim(),
      nidn: nipOrNidn.trim(),
      email: email.trim(),
      phone: whatsapp.trim(),
      whatsapp: whatsapp.trim(),
      avatar: avatar.trim(),
      photoUrl: avatar.trim(),
      academicTitle,
      specialty: specialty.trim()
    });

    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      if (onCloseModal) onCloseModal();
    }, 2000);
  };

  // Clean WhatsApp for link
  const cleanPhone = whatsapp.replace(/\D/g, '');
  const waLink = cleanPhone ? `https://wa.me/${cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone}` : null;

  // Contextual Data for Role Dashboard tab
  const userUnit = units.find(u => u.id === currentUser.unitId) || units[0];
  const userFindings = findings.filter(f => f.unitId === currentUser.unitId || f.unitName.includes(currentUser.unitName));
  const userMayorCount = userFindings.filter(f => f.category === 'Mayor').length;
  const userCaps = correctiveActions.filter(c => c.unitId === currentUser.unitId || c.unitName.includes(currentUser.unitName));
  const userAudits = audits.filter(a => a.unitId === currentUser.unitId || a.leadAuditorName?.includes(currentUser.name));
  const userRtm = rtmRecords.filter(r => r.unitId === currentUser.unitId || (r.summonedUnitNames?.some(s => s.toLowerCase().includes(currentUser.unitName.toLowerCase()))));

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-6 rounded-2xl shadow-md border border-emerald-700/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400 text-slate-950 uppercase tracking-wider">
              Profil Pengguna & Penyelaras Pengesahan
            </span>
            <span className="text-xs text-emerald-200">• SIAMI UNIMEN</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black">
            Profil & Dashboard Peran Pengelola Mutu
          </h1>
          <p className="text-xs text-emerald-100/90 mt-1 max-w-2xl leading-relaxed">
            Data identitas ini disinkronkan langsung ke seluruh lembar pengesahan Audit Mutu Internal (AMI), Berita Acara RTM, dan dokumen penetapan mutu Universitas Muhammadiyah Enrekang.
          </p>
        </div>

        {/* Quick Role Switcher inside Profile */}
        <div className="flex flex-col sm:flex-row items-center gap-2 shrink-0">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-1.5 border border-white/20">
            <label className="text-[10px] text-emerald-200 block px-1 font-semibold">Ganti Profil Cepat:</label>
            <select
              value={currentUser.id}
              onChange={(e) => switchUserById(e.target.value)}
              className="bg-transparent text-white font-bold text-xs px-2 py-1 rounded-lg outline-none cursor-pointer focus:bg-emerald-950 max-w-[220px]"
            >
              {users.map(u => (
                <option key={u.id} value={u.id} className="bg-slate-900 text-white">
                  {u.role}: {u.name}
                </option>
              ))}
            </select>
          </div>

          {onCloseModal && (
            <button
              onClick={onCloseModal}
              className="self-stretch px-4 py-2 text-xs font-bold bg-white/10 hover:bg-white/20 text-white rounded-xl transition border border-white/20"
            >
              Tutup Jendela
            </button>
          )}
        </div>
      </div>

      {isSaved && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center gap-3 text-emerald-900 text-xs font-bold animate-pulse shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
          <span>Profil berhasil diperbarui dan disinkronkan ke seluruh lembar pengesahan SIAMI UNIMEN!</span>
        </div>
      )}

      {/* Sub-Navigation Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('biodata')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === 'biodata'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <UserIcon className="w-3.5 h-3.5" />
          <span>Data Profil & Kontak</span>
        </button>

        <button
          onClick={() => setActiveTab('dashboard-peran')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === 'dashboard-peran'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Dashboard Kinerja Peran ({currentUser.role})</span>
        </button>

        <button
          onClick={() => setActiveTab('pengesahan')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === 'pengesahan'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Stamp className="w-3.5 h-3.5" />
          <span>Tanda Tangan & Lembar Pengesahan</span>
        </button>

        <button
          onClick={() => setActiveTab('idcard')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === 'idcard'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <IdCard className="w-3.5 h-3.5" />
          <span>Kartu Identitas Digital (ID Card)</span>
        </button>
      </div>

      {/* TAB 1: BIODATA & EDIT FORM */}
      {activeTab === 'biodata' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Form Column */}
          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-emerald-700" />
                <span>Formulir Kelengkapan Data Profil</span>
              </h2>
              <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                Peran: {currentUser.role}
              </span>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              {/* Foto Profil / Avatar */}
              <div>
                <label className="block font-bold text-slate-700 mb-2">
                  Foto Profil (Unggah Berkas / URL / Preset)
                </label>
                <div className="flex items-center gap-4">
                  <div className="relative group">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 border-2 border-emerald-600 flex items-center justify-center shadow-xs">
                      {avatar ? (
                        <img src={avatar} alt={name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl font-black text-emerald-800">
                          {name ? name.charAt(0) : 'U'}
                        </span>
                      )}
                    </div>
                    <label
                      htmlFor="upload-avatar"
                      className="absolute inset-0 bg-black/40 text-white rounded-2xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer text-[10px] font-bold"
                      title="Ganti Foto"
                    >
                      <Camera className="w-4 h-4 mb-0.5" />
                      <span>Ubah</span>
                    </label>
                    <input
                      id="upload-avatar"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <label
                        htmlFor="upload-avatar-btn"
                        className="px-3 py-1.5 rounded-lg border border-slate-300 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer transition"
                      >
                        <Upload className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Unggah Foto</span>
                      </label>
                      <input
                        id="upload-avatar-btn"
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />

                      <span className="text-[11px] text-slate-400">atau pilih avatar akademik:</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {avatarPresets.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setAvatar(preset)}
                          className={`w-7 h-7 rounded-full overflow-hidden border-2 transition ${
                            avatar === preset ? 'border-emerald-600 ring-2 ring-emerald-300' : 'border-slate-200 opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img src={preset} alt="preset" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* URL Foto Opsional */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  URL Tautan Foto Profil (Opsional)
                </label>
                <input
                  type="url"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  placeholder="https://domain.com/foto-anda.jpg"
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 text-xs text-slate-800"
                />
              </div>

              {/* Nama & Gelar Lengkap */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nama & Gelar Lengkap <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Dr. Masnur, S.Pd., M.Pd."
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 text-xs text-slate-900 font-semibold"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Nama ini tercetak otomatis pada lembar pengesahan resmi & laporan audit.
                </span>
              </div>

              {/* Unit Kerja */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Unit Kerja / Fakultas / Program Studi <span className="text-rose-500">*</span>
                </label>
                <select
                  value={unitId}
                  onChange={(e) => handleUnitChange(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 text-xs text-slate-800 bg-white"
                >
                  <option value="">-- Pilih Unit Kerja Terdaftar --</option>
                  {units.map(u => (
                    <option key={u.id} value={u.id}>
                      [{u.type}] {u.name} ({u.code})
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={unitName}
                  onChange={(e) => setUnitName(e.target.value)}
                  placeholder="Ketik nama unit kerja secara detail jika diperlukan"
                  className="w-full mt-1.5 p-2 rounded-lg border border-slate-200 outline-none focus:border-emerald-500 text-[11px] text-slate-700"
                />
              </div>

              {/* Grid 2 Kolom: NIDN & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    NIDN / NIP / NBM <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={nipOrNidn}
                    onChange={(e) => setNipOrNidn(e.target.value)}
                    placeholder="Contoh: 0917028101"
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 text-xs font-mono text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Email Institusi (@unimen.ac.id) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@unimen.ac.id"
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 text-xs text-slate-800"
                  />
                </div>
              </div>

              {/* Grid 2 Kolom: No WhatsApp & Jabatan Fungsional */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    No. WhatsApp Aktif <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      required
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="081234567890"
                      className="flex-1 p-2.5 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 text-xs text-slate-800 font-mono"
                    />
                    {waLink && (
                      <a
                        href={waLink}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center shrink-0 shadow-2xs"
                        title="Uji Kirim Pesan WhatsApp Langsung"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Jabatan Fungsional Akademik
                  </label>
                  <select
                    value={academicTitle}
                    onChange={(e) => setAcademicTitle(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 text-xs text-slate-800 bg-white"
                  >
                    <option value="Tenaga Pengajar">Tenaga Pengajar</option>
                    <option value="Asisten Ahli">Asisten Ahli</option>
                    <option value="Lektor">Lektor</option>
                    <option value="Lektor Kepala">Lektor Kepala</option>
                    <option value="Guru Besar">Guru Besar (Profesor)</option>
                  </select>
                </div>
              </div>

              {/* Spesialisasi / Kepakaran Mutu */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Spesialisasi Keilmuan & Bidang Kepakaran Mutu
                </label>
                <input
                  type="text"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  placeholder="Contoh: Audit Mutu Kurikulum OBE, Etnomatematika, Standar Akreditasi LAM"
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 text-xs text-slate-800"
                />
              </div>

              {/* Tombol Simpan */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <p className="text-[11px] text-slate-400">
                  Perubahan akan segera tercatat di basis data lokal.
                </p>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs shadow-md transition flex items-center gap-1.5 active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Simpan & Sinkronkan Profil</span>
                </button>
              </div>
            </form>
          </div>

          {/* Quick Summary Card on Right */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 border-2 border-emerald-600 shrink-0">
                  {avatar ? (
                    <img src={avatar} alt={name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-xl text-emerald-800">
                      {name ? name.charAt(0) : 'U'}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{name || 'Nama Belum Diatur'}</h3>
                  <p className="text-xs font-semibold text-emerald-700">{currentUser.role}</p>
                  <p className="text-[11px] text-slate-500">{unitName || 'Unit Kerja'}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">NIDN / NIP</span>
                  <span className="font-mono font-bold text-slate-800">{nipOrNidn || '-'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Email</span>
                  <span className="text-slate-800 font-medium">{email || '-'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">No. WhatsApp</span>
                  <span className="font-mono text-emerald-700 font-bold">{whatsapp || '-'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Jabatan Akademik</span>
                  <span className="font-bold text-slate-800">{academicTitle || '-'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Spesialisasi</span>
                  <span className="text-slate-700 max-w-[180px] text-right truncate font-medium">{specialty || '-'}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('dashboard-peran')}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5"
              >
                <span>Buka Dashboard Kinerja Peran</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DASHBOARD KINERJA PERAN SAYA */}
      {activeTab === 'dashboard-peran' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold mb-1 border border-emerald-200">
                <Award className="w-3.5 h-3.5" />
                <span>Ringkasan Tugas & Tanggung Jawab Peran</span>
              </div>
              <h2 className="text-base font-bold text-slate-900">
                Dashboard Peran: {currentUser.role} ({name})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Unit Kerja: <strong>{unitName}</strong> • NIDN: <strong>{nipOrNidn}</strong>
              </p>
            </div>

            {onNavigateToTab && (
              <button
                onClick={() => onNavigateToTab('dashboard')}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 shadow-2xs"
              >
                <span>Buka Dashboard Mutu Penuh</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Role Context Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
              <span className="text-[11px] font-semibold text-slate-500">Skor Mutu Unit Anda</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{userUnit.qualityScore.toFixed(2)}</p>
              <p className="text-[11px] text-slate-400">Target Capaian: {userUnit.targetScore.toFixed(2)}</p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
              <span className="text-[11px] font-semibold text-slate-500">Temuan Audit Terkait</span>
              <p className="text-2xl font-black text-rose-600 mt-1">{userFindings.length}</p>
              <p className="text-[11px] text-slate-400">Mayor: {userMayorCount} Butir</p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
              <span className="text-[11px] font-semibold text-slate-500">Tindakan Koreksi (PTK)</span>
              <p className="text-2xl font-black text-purple-600 mt-1">{userCaps.length}</p>
              <p className="text-[11px] text-slate-400">Status Penyelesaian Tindak Lanjut</p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
              <span className="text-[11px] font-semibold text-slate-500">Agenda Sidang RTM</span>
              <p className="text-2xl font-black text-blue-600 mt-1">{userRtm.length}</p>
              <p className="text-[11px] text-slate-400">Evaluasi Tingkat Pimpinan</p>
            </div>
          </div>

          {/* Role Description & Scope of Authority */}
          <div className="p-5 rounded-xl border border-emerald-200 bg-emerald-50/40 text-xs space-y-2">
            <h3 className="font-bold text-emerald-950 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Kewenangan & Tanggung Jawab Jabatan Penjaminan Mutu</span>
            </h3>
            <p className="text-emerald-900 leading-relaxed text-[11px]">
              {currentUser.role === 'Rektor'
                ? 'Sebagai Pimpinan Sidang Mutu Tertinggi Universitas Muhammadiyah Enrekang, Anda berwenang mengesahkan Berita Acara RTM, menandatangani Laporan Hasil AMI, menetapkan SK Kebijakan SPMI, serta memanggil Dekan dan Kaprodi untuk evaluasi tingkat pimpinan.'
                : currentUser.role === 'LPM'
                ? 'Sebagai Lembaga Penjaminan Mutu, Anda mengawal seluruh siklus PPEPP, memvalidasi butir instrumen, menetapkan auditor internal lapangan, memberikan stempel digital resmi LPM, serta mengkoordinasikan sidang RTM universitas.'
                : currentUser.role === 'Auditor Internal'
                ? 'Sebagai Koordinator / Anggota Auditor Internal, Anda bertanggung jawab mengaudit kertas kerja, memeriksa dokumen CPL/RPS, mencatat temuan mayor/minor, dan memverifikasi bukti perbaikan PTK yang diunggah oleh auditee.'
                : currentUser.role.includes('Dekan') || currentUser.role.includes('Pascasarjana')
                ? 'Sebagai Pimpinan Fakultas / Direktur Pascasarjana, Anda mengkoordinasikan penjaminan mutu seluruh program studi di bawah fakultas, menandatangani lembar pengesahan fakultas, dan memimpin sidang RTM fakultas.'
                : 'Sebagai Ketua Program Studi (Auditee), Anda bertanggung jawab memenuhi 9 kriteria akreditasi, melengkapi berkas kurikulum OBE, merespons temuan audit dengan form tindakan koreksi (PTK), dan menghadiri evaluasi RTM.'}
            </p>
          </div>

          {/* Quick Shortcuts to Modules */}
          {onNavigateToTab && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <button
                onClick={() => onNavigateToTab('audit')}
                className="p-3 rounded-xl border border-slate-200 hover:border-emerald-500 bg-white hover:bg-emerald-50 transition text-left flex items-center justify-between"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Modul Pelaksanaan Audit</h4>
                  <p className="text-[10px] text-slate-500">Kertas kerja & penilaian instrumen</p>
                </div>
                <ChevronRight className="w-4 h-4 text-emerald-700 shrink-0" />
              </button>

              <button
                onClick={() => onNavigateToTab('rtm')}
                className="p-3 rounded-xl border border-slate-200 hover:border-emerald-500 bg-white hover:bg-emerald-50 transition text-left flex items-center justify-between"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Modul RTM & Evaluasi</h4>
                  <p className="text-[10px] text-slate-500">Jadwal sidang & panggilan prodi</p>
                </div>
                <ChevronRight className="w-4 h-4 text-emerald-700 shrink-0" />
              </button>

              <button
                onClick={() => onNavigateToTab('laporan')}
                className="p-3 rounded-xl border border-slate-200 hover:border-emerald-500 bg-white hover:bg-emerald-50 transition text-left flex items-center justify-between"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Laporan & Cetak PDF</h4>
                  <p className="text-[10px] text-slate-500">Lembar pengesahan & ekspor dokumen</p>
                </div>
                <ChevronRight className="w-4 h-4 text-emerald-700 shrink-0" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: TANDA TANGAN & LEMBAR PENGESAHAN */}
      {activeTab === 'pengesahan' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Stamp className="w-4 h-4 text-emerald-700" />
              <span>Pratinjau Format Lembar Pengesahan Resmi Dokumen AMI</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Simulasi tampilan blok tanda tangan elektronik resmi 4 pimpinan universitas pada dokumen AMI dan berita acara RTM.
            </p>
          </div>

          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-6">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              LEMBAR PENGESAHAN AUDIT MUTU INTERNAL (AMI) TA 2025/2026
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              {/* Kolom 1: Koordinator Auditor Internal */}
              <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1 shadow-2xs">
                <p className="text-slate-400 text-[10px]">Enrekang, 10 April 2026</p>
                <p className="font-bold text-slate-800 text-[11px]">Koordinator Auditor,</p>
                <div className="h-12 flex items-center justify-center font-bold text-emerald-700 italic text-[10px]">
                  [Ttd Digital Terverifikasi]
                </div>
                <p className="font-bold underline text-slate-900 text-xs">Dr. Masnur, S.Pd., M.Pd.</p>
                <p className="text-[10px] text-slate-500 font-mono">NIDN: 0917028101</p>
              </div>

              {/* Kolom 2: Dekan / Auditee */}
              <div className={`p-3 rounded-xl bg-white border space-y-1 shadow-2xs ${
                currentUser.role.includes('Dekan') ? 'border-emerald-500 ring-2 ring-emerald-300' : 'border-slate-200'
              }`}>
                <p className="text-slate-400 text-[10px]">Menerima Hasil,</p>
                <p className="font-bold text-slate-800 text-[11px]">Dekan / Pimpinan Auditee,</p>
                <div className="h-12 flex items-center justify-center font-bold text-emerald-700 italic text-[10px]">
                  [Ttd Digital Terverifikasi]
                </div>
                <p className="font-bold underline text-slate-900 text-xs">
                  {currentUser.role.includes('Dekan') ? name : 'Dr. Ilham Assidiq, S.Pd., M.Pd.'}
                </p>
                <p className="text-[10px] text-slate-500 font-mono">
                  {currentUser.role.includes('Dekan') ? nipOrNidn : 'NIDN: 0920037101'}
                </p>
              </div>

              {/* Kolom 3: Kepala LPM */}
              <div className={`p-3 rounded-xl bg-white border space-y-1 shadow-2xs ${
                currentUser.role === 'LPM' ? 'border-emerald-500 ring-2 ring-emerald-300' : 'border-slate-200'
              }`}>
                <p className="text-slate-400 text-[10px]">Mengetahui,</p>
                <p className="font-bold text-slate-800 text-[11px]">Kepala LPM UNIMEN,</p>
                <div className="h-12 flex items-center justify-center">
                  <span className="px-1.5 py-0.5 border border-emerald-600 rounded text-[8px] text-emerald-800 font-bold bg-emerald-50">
                    ★ CAP RESMI LPM ★
                  </span>
                </div>
                <p className="font-bold underline text-slate-900 text-xs">
                  {currentUser.role === 'LPM' ? name : 'Dr. Dian Firdiani, S.Pd., M.Pd.'}
                </p>
                <p className="text-[10px] text-slate-500 font-mono">
                  {currentUser.role === 'LPM' ? nipOrNidn : 'NIDN: 0921037702'}
                </p>
              </div>

              {/* Kolom 4: Rektor */}
              <div className={`p-3 rounded-xl bg-white border space-y-1 shadow-2xs ${
                currentUser.role === 'Rektor' ? 'border-emerald-500 ring-2 ring-emerald-300' : 'border-slate-200'
              }`}>
                <p className="text-slate-400 text-[10px]">Mengesahkan,</p>
                <p className="font-bold text-slate-800 text-[11px]">Rektor UNIMEN,</p>
                <div className="h-12 flex items-center justify-center font-bold text-emerald-700 italic text-[10px]">
                  [Ttd & Cap Universitas]
                </div>
                <p className="font-bold underline text-slate-900 text-xs">
                  {currentUser.role === 'Rektor' ? name : 'Dr. Drs. Syawal Sitonda, M.Ag.'}
                </p>
                <p className="text-[10px] text-slate-500 font-mono">
                  {currentUser.role === 'Rektor' ? nipOrNidn : 'NIDN: 0015086401'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: KARTU IDENTITAS DIGITAL (ID CARD) */}
      {activeTab === 'idcard' && (
        <div className="flex justify-center py-4">
          <div className="w-full max-w-md bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white rounded-3xl p-6 shadow-2xl border-2 border-emerald-500/40 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-44 h-44 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <UnimenLogo size="sm" variant="badge" />
              <div>
                <h3 className="text-xs font-black tracking-wider uppercase text-emerald-400">
                  UNIVERSITAS MUHAMMADIYAH ENREKANG
                </h3>
                <p className="text-[10px] text-emerald-200 font-medium">
                  SISTEM INFORMASI AUDIT MUTU INTERNAL (SIAMI)
                </p>
              </div>
            </div>

            {/* Card Body */}
            <div className="py-5 flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-800 border-2 border-emerald-400 shadow-md shrink-0">
                {avatar ? (
                  <img src={avatar} alt={name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-black text-2xl text-emerald-400">
                    {name ? name.charAt(0) : 'U'}
                  </div>
                )}
              </div>

              <div className="overflow-hidden">
                <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 font-bold text-[9px] uppercase tracking-wider mb-1 border border-emerald-400/30">
                  {currentUser.role}
                </span>
                <h4 className="text-sm font-extrabold text-white truncate">{name}</h4>
                <p className="text-[11px] text-slate-300 truncate font-medium">{unitName}</p>
                <p className="text-[10px] text-emerald-300 font-mono mt-0.5">NIDN: {nipOrNidn}</p>
              </div>
            </div>

            {/* Card Footer */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
              <div>
                <p className="text-slate-300 font-semibold">{email}</p>
                <p className="font-mono text-emerald-400">WA: {whatsapp}</p>
              </div>

              <div className="p-1.5 bg-white rounded-lg text-slate-950 shrink-0">
                <QrCode className="w-7 h-7" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
