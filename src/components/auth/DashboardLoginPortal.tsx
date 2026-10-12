import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UnimenLogo } from '../common/UnimenLogo';
import { MatriksPPEPP } from '../dashboard/MatriksPPEPP';
import { PPEPPPerformanceMatrix } from '../dashboard/PPEPPPerformanceMatrix';
import { MatriksCapaianMutuFakultasProdi } from '../dashboard/MatriksCapaianMutuFakultasProdi';
import campusBannerImage from '../../assets/images/unimen_campus_banner_1791766736943.jpg';
import {
  ShieldCheck,
  Lock,
  User,
  ArrowRight,
  MapPin,
  Award,
  Sparkles,
  BookOpen,
  Layers,
  CheckCircle2,
  Building,
  GraduationCap,
  ExternalLink,
  KeyRound,
  Eye,
  EyeOff,
  Compass,
  FileText
} from 'lucide-react';

interface DashboardLoginPortalProps {
  onSuccessLogin?: () => void;
}

export const DashboardLoginPortal: React.FC<DashboardLoginPortalProps> = ({ onSuccessLogin }) => {
  const { users, currentUser, switchUserById, login } = useApp();
  const [activeTab, setActiveTab] = useState<'login' | 'ppepp' | 'capaian'>('login');
  const [authMethod, setAuthMethod] = useState<'sso' | 'personas'>('personas');
  
  // Login form state
  const [identifier, setIdentifier] = useState('0915017601'); // Dekan FAI as prefill
  const [password, setPassword] = useState('••••••••••');
  const [selectedFacultyRole, setSelectedFacultyRole] = useState('user-dekan-fai');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLoginError('');

    setTimeout(() => {
      // Find matching user by NIP/NIDN or email or selected id
      const matched = users.find(
        u => u.nipOrNidn === identifier || u.email.toLowerCase() === identifier.toLowerCase() || u.id === selectedFacultyRole
      );

      if (matched) {
        if (login) {
          login(matched.id);
        } else {
          switchUserById(matched.id);
        }
        if (onSuccessLogin) onSuccessLogin();
      } else {
        // Fallback to current selected persona
        if (login) {
          login(selectedFacultyRole);
        } else {
          switchUserById(selectedFacultyRole);
        }
        if (onSuccessLogin) onSuccessLogin();
      }
      setIsSubmitting(false);
    }, 400);
  };

  const handleQuickLogin = (userId: string) => {
    if (login) {
      login(userId);
    } else {
      switchUserById(userId);
    }
    if (onSuccessLogin) onSuccessLogin();
  };

  // Structured Persona Groups for Faculty & Institutional Roles
  const quickRoleCards = [
    {
      group: 'Pimpinan Universitas & Lembaga Penjaminan Mutu (LPM)',
      roles: [
        { id: 'user-superadmin', label: 'Super Admin', sub: 'Akses Sistem Penuh SIAMI', role: 'Super Admin', badge: 'bg-purple-100 text-purple-800' },
        { id: 'user-rektor', label: 'Rektor UNIMEN', sub: 'Dr. Drs. Syawal Sitonda, M.Ag.', role: 'Rektor', badge: 'bg-amber-100 text-amber-800' },
        { id: 'user-lpm', label: 'Kepala LPM UNIMEN', sub: 'Dr. Dian Firdiani, S.Pd., M.Pd.', role: 'LPM', badge: 'bg-blue-100 text-blue-800' },
        { id: 'user-auditor', label: 'Koordinator Auditor Internal', sub: 'Dr. Masnur, S.Pd., M.Pd.', role: 'Auditor Internal', badge: 'bg-emerald-100 text-emerald-800' },
      ]
    },
    {
      group: 'Pimpinan Fakultas & Program Pascasarjana',
      roles: [
        { id: 'user-dekan-fai', label: 'Dekan Fakultas Agama Islam (FAI)', sub: 'Ahmad Dahlan, S.Pd.I., M.Pd.I.', role: 'Dekan', badge: 'bg-emerald-100 text-emerald-800' },
        { id: 'user-dekan-fip', label: 'Dekan Fakultas Ilmu Pendidikan (FIP)', sub: 'Dr. Ilham Assidiq, S.Pd., M.Pd.', role: 'Dekan', badge: 'bg-blue-100 text-blue-800' },
        { id: 'user-dekan-fstk', label: 'Dekan Fak. Sains, Teknologi & Kes (FSTK)', sub: 'Dr. Ismaya, S.IP., M.IP.', role: 'Dekan', badge: 'bg-teal-100 text-teal-800' },
        { id: 'user-direktur-pasca', label: 'Direktur Program Pascasarjana', sub: 'Dr. Drs. Yunus Busa, M.Si.', role: 'Direktur', badge: 'bg-indigo-100 text-indigo-800' },
      ]
    },
    {
      group: 'Admin Fakultas & Tim Gugus Kendali Mutu (GKM)',
      roles: [
        { id: 'user-admin-fai', label: 'Admin Fakultas Agama Islam', sub: 'Kelola Dosen & 3 Prodi FAI', role: 'Admin Fakultas', badge: 'bg-emerald-50 text-emerald-800' },
        { id: 'user-admin-fip', label: 'Admin Fakultas Ilmu Pendidikan', sub: 'Kelola Dosen & 6 Prodi FIP', role: 'Admin Fakultas', badge: 'bg-blue-50 text-blue-800' },
        { id: 'user-admin-fstk', label: 'Admin FSTK', sub: 'Kelola Dosen & 9 Prodi FSTK', role: 'Admin Fakultas', badge: 'bg-teal-50 text-teal-800' },
        { id: 'user-admin-pasca', label: 'Admin Pascasarjana', sub: 'Kelola Dosen & 2 Prodi S2', role: 'Admin Fakultas', badge: 'bg-indigo-50 text-indigo-800' },
        { id: 'user-gkm-fai', label: 'Ketua GKM FAI', sub: 'Gugus Kendali Mutu FAI', role: 'GKM', badge: 'bg-purple-100 text-purple-800' },
      ]
    },
    {
      group: 'Ketua Program Studi (Kaprodi Auditee) & Dosen',
      roles: [
        { id: 'user-kaprodi-pai', label: 'Kaprodi S1 Pend. Agama Islam', sub: 'Nur Syamsiah, M.Pd.I. (FAI)', role: 'Kaprodi', badge: 'bg-slate-100 text-slate-800' },
        { id: 'user-kaprodi-pgsd', label: 'Kaprodi S1 PGSD', sub: 'Dr. Andi Asraf, M.Pd. (FIP)', role: 'Kaprodi', badge: 'bg-slate-100 text-slate-800' },
        { id: 'user-kaprodi-agrotek', label: 'Kaprodi S1 Agroteknologi', sub: 'Nurhidayah, M.Si. (FSTK)', role: 'Kaprodi', badge: 'bg-slate-100 text-slate-800' },
        { id: 'user-kaprodi-gizi', label: 'Kaprodi S1 Gizi', sub: 'Sri Wahyuni, M.Si. (FSTK)', role: 'Kaprodi', badge: 'bg-slate-100 text-slate-800' },
        { id: 'user-kaprodi-s2-pendas', label: 'Kaprodi S2 Pendidikan Dasar', sub: 'Dr. Muh. Yunus, M.Pd. (Pasca)', role: 'Kaprodi', badge: 'bg-slate-100 text-slate-800' },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-100/80 flex flex-col font-sans">
      {/* Institutional Top Accent Ribbon (Gold & Muhammadiyah Green) */}
      <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 via-emerald-600 to-teal-800" />

      {/* Main Top Header of the Login Portal */}
      <header className="bg-white border-b border-slate-200/90 shadow-2xs sticky top-0 z-30 backdrop-blur-md bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Institutional Identity Lockup */}
          <div className="flex items-center gap-3.5">
            <UnimenLogo size="lg" variant="full" />
          </div>

          {/* Right Header Navigation & Badges */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Permendiktisaintek Pill */}
            <div className="hidden lg:flex flex-col text-right">
              <span className="text-[11px] font-bold text-emerald-800">
                Permendiktisaintek No. 39 Tahun 2025
              </span>
              <span className="text-[10px] text-slate-500">
                Siklus SPMI PPEPP Berkelanjutan
              </span>
            </div>

            {/* Direct Dashboard Access Button */}
            <button
              onClick={() => handleQuickLogin(currentUser.id)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-800 hover:to-teal-900 shadow-sm transition active:scale-95"
            >
              <span>Masuk Dashboard Mutu</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Campus Hero Photographic Banner Section */}
      <section className="relative overflow-hidden bg-slate-950 text-white">
        {/* Background Image with Mountains & Campus */}
        <div className="absolute inset-0 z-0">
          <img
            src={campusBannerImage}
            alt="Gedung Kampus Universitas Muhammadiyah Enrekang dengan panorama Pegunungan Karst Enrekang"
            className="w-full h-full object-cover object-center scale-105 filter brightness-[0.78] contrast-[1.05]"
          />
          {/* Gradient Overlay with Muhammadiyah Green & Midnight tones */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-emerald-950/75 to-slate-950/85" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(16,185,129,0.2),transparent_70%)]" />
        </div>

        {/* Content Inside Banner */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left 8 Cols: Institutional Credentials & Geotag */}
            <div className="lg:col-span-8 space-y-4">
              {/* Badges Bar */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-900/80 border border-emerald-400/50 text-emerald-200 text-xs font-bold backdrop-blur-md">
                  <Award className="w-3.5 h-3.5 text-amber-300" />
                  Terakreditasi Baik Sekali BAN-PT & LAM
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-200 text-xs font-bold backdrop-blur-md">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                  Sertifikasi SPMI PPEPP 2025/2026
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-slate-200 text-xs font-semibold backdrop-blur-md">
                  ISO 9001:2015
                </span>
              </div>

              {/* Title & Headline */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
                Gerbang Portal SPMI & Sistem Informasi Audit Mutu Internal (SIAMI)
              </h1>

              {/* Visi Riset Berkemajuan */}
              <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 max-w-2xl">
                <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider mb-1">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Visi Riset & Pendidikan Berkemajuan UNIMEN
                </div>
                <p className="text-xs sm:text-sm text-slate-100 leading-relaxed italic">
                  &ldquo;Menjadi Universitas Unggul Berbasis Agropreneurship dan Nilai-Nilai Keislaman yang Berkemajuan di Kawasan Timur Indonesia pada Tahun 2035.&rdquo;
                </p>
              </div>

              {/* Geotag Lokasi Resmi */}
              <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-emerald-200/90 pt-1">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    <strong>Kampus Utama:</strong> Jl. Jenderal Sudirman No. 17, Batili, Enrekang, Sulawesi Selatan 91711
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Compass className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Geotag: 3°33&apos;54.2&quot;S 119°46&apos;22.1&quot;E • Elevasi: 110 mdpl Pegunungan Enrekang</span>
                </div>
              </div>
            </div>

            {/* Right 4 Cols: Quick Stat Pill */}
            <div className="lg:col-span-4 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-5 space-y-3.5 text-white shadow-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-xs font-semibold text-emerald-200">Cakupan Audit SPMI</span>
                <span className="text-xs font-extrabold text-amber-300">Siklus Genap 2026</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-2xl font-black text-amber-300">4</div>
                  <div className="text-[11px] text-slate-200 font-medium">Fakultas & Pasca</div>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-2xl font-black text-emerald-300">20</div>
                  <div className="text-[11px] text-slate-200 font-medium">Program Studi</div>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-2xl font-black text-sky-300">24</div>
                  <div className="text-[11px] text-slate-200 font-medium">Standar SPMI</div>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-2xl font-black text-teal-300">3.58</div>
                  <div className="text-[11px] text-slate-200 font-medium">Rerata Mutu / 4.00</div>
                </div>
              </div>
              <p className="text-[11px] text-slate-300 text-center">
                Dipantau langsung oleh <strong>Lembaga Penjaminan Mutu (LPM)</strong> dan Pimpinan Rektorat.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area: Login Portal & Interactive Matriks */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        {/* Navigation Tabs between Login Form, Matriks PPEPP, and Matriks Capaian Mutu */}
        <div className="flex items-center justify-between flex-wrap gap-3 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('login')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'login'
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <KeyRound className="w-4 h-4" />
              <span>Autentikasi & Masuk Portal</span>
            </button>

            <button
              onClick={() => setActiveTab('ppepp')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'ppepp'
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Matriks Pelaksanaan Siklus PPEPP</span>
            </button>

            <button
              onClick={() => setActiveTab('capaian')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'capaian'
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Building className="w-4 h-4" />
              <span>Capaian Mutu Fakultas & Prodi</span>
            </button>
          </div>

          <div className="text-xs text-slate-500 font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Server SIAMI UNIMEN Online</span>
          </div>
        </div>

        {/* Tab 1: Login Interface */}
        {activeTab === 'login' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left 5 Cols: Institutional SSO Login Box */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-md p-6 sm:p-7 space-y-6">
              <div>
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase tracking-wider">
                  <Lock className="w-4 h-4 text-emerald-700" />
                  <span>Portal Single Sign-On (SSO) UNIMEN</span>
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 mt-1">
                  Masuk Akun Pengguna
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Gunakan NIP/NIDN atau email institusi <code>@unimen.ac.id</code> yang terdaftar pada Lembaga Penjaminan Mutu.
                </p>
              </div>

              {/* Method Switcher */}
              <div className="flex items-center p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setAuthMethod('personas')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                    authMethod === 'personas'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Pilih Peran Institusi (Cepat)
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMethod('sso')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                    authMethod === 'sso'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Kredensial NIP / NIDN
                </button>
              </div>

              {authMethod === 'sso' ? (
                /* Standard SSO Form */
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      NIP / NIDN / Email Institusi
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="0915017601 atau user@unimen.ac.id"
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Kata Sandi SSO
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-9 pr-10 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                      <input type="checkbox" defaultChecked className="rounded text-emerald-600 focus:ring-emerald-500" />
                      <span>Ingat sesi di perangkat ini</span>
                    </label>
                    <a href="#reset" onClick={(e) => { e.preventDefault(); alert('Silakan hubungi BAPSI / Admin LPM UNIMEN di Gedung Rektorat Lt. 2.'); }} className="text-emerald-700 font-bold hover:underline">
                      Lupa Sandi?
                    </a>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-emerald-800 hover:bg-emerald-900 shadow-md transition flex items-center justify-center gap-2 active:scale-95 disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <span>Memverifikasi Otorisasi...</span>
                    ) : (
                      <>
                        <span>Masuk ke SIAMI UNIMEN</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* Fast Persona Selector */
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Pilih Akun / Peran Pengguna untuk Masuk:
                    </label>
                    <select
                      value={selectedFacultyRole}
                      onChange={(e) => {
                        setSelectedFacultyRole(e.target.value);
                        const found = users.find(u => u.id === e.target.value);
                        if (found) setIdentifier(found.nipOrNidn);
                      }}
                      className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-300 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <optgroup label="Pimpinan Universitas & LPM">
                        <option value="user-superadmin">Super Admin (Akses Penuh)</option>
                        <option value="user-rektor">Rektor UNIMEN (Dr. Drs. Syawal Sitonda, M.Ag.)</option>
                        <option value="user-lpm">Kepala LPM UNIMEN (Dr. Dian Firdiani, S.Pd., M.Pd.)</option>
                        <option value="user-auditor">Koordinator Auditor Internal (Dr. Masnur, S.Pd., M.Pd.)</option>
                      </optgroup>
                      <optgroup label="Pimpinan Fakultas & Pascasarjana">
                        <option value="user-dekan-fai">Dekan Fakultas Agama Islam (Ahmad Dahlan, S.Pd.I., M.Pd.I.)</option>
                        <option value="user-dekan-fip">Dekan Fakultas Ilmu Pendidikan (Dr. Ilham Assidiq, S.Pd., M.Pd.)</option>
                        <option value="user-dekan-fstk">Dekan Fak. Sains, Teknologi & Kes (Dr. Ismaya, S.IP., M.IP.)</option>
                        <option value="user-direktur-pasca">Direktur Program Pascasarjana (Dr. Drs. Yunus Busa, M.Si.)</option>
                      </optgroup>
                      <optgroup label="Admin Fakultas (Pengelola Akses Dosen & Prodi)">
                        <option value="user-admin-fai">Admin Fakultas Agama Islam (3 Prodi)</option>
                        <option value="user-admin-fip">Admin Fakultas Ilmu Pendidikan (6 Prodi)</option>
                        <option value="user-admin-fstk">Admin FSTK (9 Prodi)</option>
                        <option value="user-admin-pasca">Admin Program Pascasarjana (2 Prodi)</option>
                      </optgroup>
                      <optgroup label="Ketua Program Studi (Auditee)">
                        <option value="user-kaprodi-pai">Kaprodi S1 Pendidikan Agama Islam (Fadil, S.Ag., M.Ag.)</option>
                        <option value="user-kaprodi-pgsd">Kaprodi S1 PGSD (Muhammad Idham Haliq, S.Pd., M.Pd.)</option>
                        <option value="user-kaprodi-agrotek">Kaprodi S1 Agroteknologi (Dr. Suharman, S.P., M.P.)</option>
                        <option value="user-kaprodi-gizi">Kaprodi S1 Gizi (Sri Wahyuni, S.Gz., M.Si.)</option>
                        <option value="user-kaprodi-s2-pendas">Kaprodi S2 Pendidikan Dasar (Dr. Masnur, S.Pd., M.Pd.)</option>
                      </optgroup>
                    </select>
                  </div>

                  <button
                    onClick={() => handleQuickLogin(selectedFacultyRole)}
                    className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-emerald-800 to-teal-800 hover:from-emerald-900 hover:to-teal-900 shadow-md transition flex items-center justify-center gap-2 active:scale-95"
                  >
                    <span>Masuk Sebagai Peran Terpilih</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Security & Regulatory Footer Note */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Enkripsi SSL 256-bit
                </span>
                <span>PDDikti SPMI Ready</span>
              </div>
            </div>

            {/* Right 7 Cols: Quick Institutional Role Grid & System Guidelines */}
            <div className="lg:col-span-7 space-y-6">
              {/* Guidance Box */}
              <div className="bg-gradient-to-br from-emerald-900 via-teal-950 to-slate-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
                <div className="relative z-10 space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-400/30">
                    <Sparkles className="w-3.5 h-3.5" />
                    Standar Visual & Tata Kelola Mutu Perguruan Tinggi
                  </div>
                  <h3 className="text-lg font-extrabold tracking-tight">
                    Sistem Penjaminan Mutu Internal Berbasis PPEPP
                  </h3>
                  <p className="text-xs text-emerald-100 leading-relaxed max-w-xl">
                    Dirancang khusus untuk mendukung operasional 4 Fakultas dan Sekolah Pascasarjana Universitas Muhammadiyah Enrekang dalam pemenuhan IKU, visitasi akreditasi LAM, serta audit berkala LPM.
                  </p>
                </div>
              </div>

              {/* Categorized Direct Access Cards */}
              <div className="space-y-4">
                <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                  Akses Cepat Pengguna Institusi UNIMEN (Klik Langsung Masuk)
                </h4>

                <div className="space-y-4">
                  {quickRoleCards.map((group, gIdx) => (
                    <div key={gIdx} className="bg-white rounded-xl border border-slate-200 p-4 space-y-2.5 shadow-2xs">
                      <p className="text-xs font-bold text-slate-900 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-600" />
                        {group.group}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {group.roles.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => handleQuickLogin(item.id)}
                            className="p-2.5 rounded-lg border border-slate-100 hover:border-emerald-300 bg-slate-50/70 hover:bg-emerald-50/50 text-left transition flex items-center justify-between group"
                          >
                            <div className="overflow-hidden pr-2">
                              <p className="text-xs font-bold text-slate-900 group-hover:text-emerald-900 truncate">
                                {item.label}
                              </p>
                              <p className="text-[10px] text-slate-400 truncate">
                                {item.sub}
                              </p>
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${item.badge}`}>
                              Masuk
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Matriks Pelaksanaan Siklus PPEPP */}
        {activeTab === 'ppepp' && (
          <div className="space-y-6">
            <PPEPPPerformanceMatrix />
            <MatriksPPEPP />
          </div>
        )}

        {/* Tab 3: Matriks Capaian Mutu Fakultas & Program Studi */}
        {activeTab === 'capaian' && (
          <div className="space-y-4">
            <MatriksCapaianMutuFakultasProdi />
          </div>
        )}

        {/* Section: Dual Matriks Overview Visible on Login Page for Institutional Preview */}
        {activeTab === 'login' && (
          <div className="space-y-8 pt-4">
            {/* PPEPP Performance Matrix Heatmap Preview */}
            <PPEPPPerformanceMatrix />

            {/* Matriks PPEPP Narrative Preview */}
            <MatriksPPEPP />

            {/* Capaian Mutu Fakultas & Prodi Preview */}
            <MatriksCapaianMutuFakultasProdi />
          </div>
        )}
      </main>

      {/* Institutional Portal Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <UnimenLogo size="sm" variant="icon" />
            <div>
              <p className="font-bold text-white">UNIVERSITAS MUHAMMADIYAH ENREKANG</p>
              <p className="text-[11px] text-slate-400">
                Sekolah Pascasarjana • Lembaga Penjaminan Mutu (LPM) • Pangkalan Data Mutu SPMI
              </p>
            </div>
          </div>

          <div className="text-center md:text-right text-[11px] space-y-0.5">
            <p className="text-slate-300">
              Jl. Jenderal Sudirman No. 17, Batili, Enrekang, Sulawesi Selatan 91711
            </p>
            <p className="text-slate-500">
              © {new Date().getFullYear()} Universitas Muhammadiyah Enrekang. Hak Cipta Dilindungi Undang-Undang.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
