import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Building2,
  GraduationCap,
  Award,
  TrendingUp,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  BarChart3
} from 'lucide-react';

interface MatriksCapaianMutuFakultasProdiProps {
  onNavigateToTab?: (tab: string) => void;
  className?: string;
}

export const MatriksCapaianMutuFakultasProdi: React.FC<MatriksCapaianMutuFakultasProdiProps> = ({
  onNavigateToTab,
  className = ''
}) => {
  const { units, audits, findings, correctiveActions } = useApp();
  const [selectedFaculty, setSelectedFaculty] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const facultyUnits = useMemo(() => {
    return units.filter(u => u.type === 'Fakultas' || u.type === 'Program Pascasarjana');
  }, [units]);

  const allProdiUnits = useMemo(() => {
    return units.filter(u => u.type === 'Program Studi');
  }, [units]);

  // Accreditation & Lembaga Akreditasi mapping for realism and institutional standards
  const prodiMetaMap: Record<string, { lam: string; akred: string; siklusStatus: string; ketuaUjm: string }> = {
    // FAI
    'unit-prodi-pai': { lam: 'LAMDIK', akred: 'Unggul', siklusStatus: 'Selesai (Terverifikasi)', ketuaUjm: 'Ust. Marwan, M.Pd.I.' },
    'unit-prodi-mpi': { lam: 'LAMDIK', akred: 'Baik Sekali', siklusStatus: 'Selesai (Review RTM)', ketuaUjm: 'Fathurrahman, S.Pd.I., M.Pd.' },
    'unit-prodi-pba': { lam: 'LAMDIK', akred: 'Baik Sekali', siklusStatus: 'Tindak Lanjut CAP', ketuaUjm: 'Zulhijjah, Lc., M.A.' },
    // FIP
    'unit-prodi-pgsd': { lam: 'LAMDIK', akred: 'Unggul', siklusStatus: 'Selesai (Terverifikasi)', ketuaUjm: 'Ahmad Alimuddin, S.Pd., M.Pd.' },
    'unit-prodi-pmat': { lam: 'LAMDIK', akred: 'Unggul', siklusStatus: 'Selesai (Review RTM)', ketuaUjm: 'Wahab S., S.Pd., M.Pd.' },
    'unit-prodi-pbi': { lam: 'LAMDIK', akred: 'Baik Sekali', siklusStatus: 'Selesai (Terverifikasi)', ketuaUjm: 'Sri Megawati, S.Pd., M.Hum.' },
    'unit-prodi-bk': { lam: 'LAMDIK', akred: 'Baik Sekali', siklusStatus: 'Selesai (Review RTM)', ketuaUjm: 'Marlina, S.Pd., M.Pd.' },
    'unit-prodi-pnf': { lam: 'LAMDIK', akred: 'Baik Sekali', siklusStatus: 'Tindak Lanjut CAP', ketuaUjm: 'Husnul Khatimah, S.Pd., M.Pd.' },
    'unit-prodi-pko': { lam: 'LAMDIK', akred: 'Baik Sekali', siklusStatus: 'Tindak Lanjut CAP', ketuaUjm: 'Andi Asrul, S.Pd., M.Or.' },
    // FSTK
    'unit-prodi-psi': { lam: 'BAN-PT', akred: 'Baik Sekali', siklusStatus: 'Selesai (Review RTM)', ketuaUjm: 'Salmiah, S.I.Pust., M.A.' },
    'unit-prodi-bio': { lam: 'BAN-PT', akred: 'Baik Sekali', siklusStatus: 'Selesai (Review RTM)', ketuaUjm: 'M. Yusuf, S.Si., M.Si.' },
    'unit-prodi-mbi': { lam: 'BAN-PT', akred: 'Baik Sekali', siklusStatus: 'Tindak Lanjut CAP', ketuaUjm: 'Fitrah Ramadhan, S.E., M.M.' },
    'unit-prodi-agrotek': { lam: 'BAN-PT / LAM PT', akred: 'Unggul', siklusStatus: 'Selesai (Terverifikasi)', ketuaUjm: 'Dr. Ilham, S.P., M.Si.' },
    'unit-prodi-sipil': { lam: 'LAM TEKNIK', akred: 'Baik Sekali', siklusStatus: 'Selesai (Review RTM)', ketuaUjm: 'Ir. Hasanuddin, S.T., M.T.' },
    'unit-prodi-rsk': { lam: 'LAM INFOKOM', akred: 'Baik Sekali', siklusStatus: 'Tindak Lanjut CAP', ketuaUjm: 'Indra Gunawan, S.T., M.T.' },
    'unit-prodi-inf': { lam: 'LAM INFOKOM', akred: 'Baik Sekali', siklusStatus: 'Selesai (Terverifikasi)', ketuaUjm: 'Nasrullah, S.Kom., M.Cs.' },
    'unit-prodi-ars': { lam: 'LAM-PTKes', akred: 'Baik', siklusStatus: 'Tindak Lanjut CAP', ketuaUjm: 'Siti Rahmah, S.Kep., M.Kes.' },
    'unit-prodi-gizi': { lam: 'LAM-PTKes', akred: 'Baik Sekali', siklusStatus: 'Selesai (Terverifikasi)', ketuaUjm: 'Nur Indah, S.Gz., M.Si.' },
    // Pascasarjana
    'unit-prodi-s2-pendas': { lam: 'LAMDIK', akred: 'Unggul', siklusStatus: 'Selesai (Terverifikasi)', ketuaUjm: 'Dr. Musdalifah, M.Pd.' },
    'unit-prodi-s2-puk': { lam: 'LAMDIK', akred: 'Unggul', siklusStatus: 'Selesai (Review RTM)', ketuaUjm: 'Dr. Hasriani, M.Pd.' },
  };

  const filteredProdis = useMemo(() => {
    return allProdiUnits.filter(prodi => {
      const matchFaculty = selectedFaculty === 'all' || prodi.parentUnitId === selectedFaculty;
      const matchSearch =
        prodi.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prodi.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prodi.headName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchFaculty && matchSearch;
    });
  }, [allProdiUnits, selectedFaculty, searchQuery]);

  // Overall Statistics
  const avgUnivScore = (
    allProdiUnits.reduce((acc, curr) => acc + curr.qualityScore, 0) / (allProdiUnits.length || 1)
  ).toFixed(2);

  const unggulCount = Object.values(prodiMetaMap).filter(p => p.akred === 'Unggul').length;
  const totalFindingsCount = allProdiUnits.reduce((acc, curr) => acc + curr.totalFindings, 0);
  const resolvedFindingsCount = allProdiUnits.reduce((acc, curr) => acc + curr.resolvedFindings, 0);

  return (
    <div className={`bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-6 ${className}`}>
      {/* Title & Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-sm shadow-xs">
              <Building2 className="w-4 h-4" />
            </span>
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
              Matriks Capaian Mutu Fakultas & Program Studi UNIMEN
            </h2>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
              Audit AMI 2025/2026
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Rekapitulasi capaian standar, skor kinerja SPMI, akreditasi LAM/BAN-PT, dan status audit 20 program studi di bawah 4 Fakultas/Pascasarjana.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari prodi atau kaprodi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* 4 Faculty Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {facultyUnits.map((fak) => {
          const prodisInFak = allProdiUnits.filter(p => p.parentUnitId === fak.id);
          const isSelected = selectedFaculty === fak.id;
          const isUnggul = fak.qualityScore >= 3.65;

          return (
            <div
              key={fak.id}
              onClick={() => setSelectedFaculty(isSelected ? 'all' : fak.id)}
              className={`p-4 rounded-xl border transition cursor-pointer relative ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-50/50 shadow-md ring-2 ring-emerald-400/20'
                  : 'border-slate-200 hover:border-emerald-300 bg-slate-50/60 hover:bg-white hover:shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500">{fak.code}</span>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                  isUnggul ? 'bg-emerald-100 text-emerald-800' : 'bg-teal-100 text-teal-800'
                }`}>
                  {isUnggul ? 'Unggul' : 'Baik Sekali'}
                </span>
              </div>

              <h3 className="text-xs font-bold text-slate-900 line-clamp-1">{fak.name}</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Dekan: {fak.headName.split(',')[0]}</p>

              <div className="mt-3 flex items-baseline justify-between">
                <div>
                  <span className="text-2xl font-black text-slate-900">{fak.qualityScore.toFixed(2)}</span>
                  <span className="text-[10px] text-slate-400 font-semibold"> / 4.00</span>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  {prodisInFak.length} Prodi
                </span>
              </div>

              <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2.5">
                <div
                  className="bg-emerald-600 h-1.5 rounded-full"
                  style={{ width: `${(fak.qualityScore / 4.0) * 100}%` }}
                />
              </div>

              <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between">
                <span>Target: {fak.targetScore.toFixed(2)}</span>
                <span className="text-emerald-700 font-bold">
                  {isSelected ? 'Filter Aktif' : 'Klik Filter'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Segmented Filter Bar */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto">
        <button
          onClick={() => setSelectedFaculty('all')}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition shrink-0 ${
            selectedFaculty === 'all'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Semua Fakultas (20 Prodi)
        </button>
        {facultyUnits.map((f) => {
          const prodiCount = allProdiUnits.filter(p => p.parentUnitId === f.id).length;
          return (
            <button
              key={f.id}
              onClick={() => setSelectedFaculty(f.id)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition shrink-0 flex items-center gap-1.5 ${
                selectedFaculty === f.id
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>{f.code}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                selectedFaculty === f.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
              }`}>
                {prodiCount}
              </span>
            </button>
          );
        })}
      </div>

      {/* Program Studi Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-2xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900 text-white font-bold">
            <tr>
              <th className="py-3 px-3.5 w-12 text-center">No</th>
              <th className="py-3 px-3.5 min-w-[200px]">Program Studi</th>
              <th className="py-3 px-3.5 w-36">Fakultas</th>
              <th className="py-3 px-3.5 w-32 text-center">Akreditasi</th>
              <th className="py-3 px-3.5 w-28 text-center">Skor Mutu</th>
              <th className="py-3 px-3.5 w-28 text-center">Temuan KTS</th>
              <th className="py-3 px-3.5 min-w-[170px]">Ketua Prodi & UJM</th>
              <th className="py-3 px-3.5 w-36 text-center">Status Siklus</th>
              {onNavigateToTab && <th className="py-3 px-3.5 w-20 text-right">Aksi</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {filteredProdis.map((prodi, idx) => {
              const faculty = facultyUnits.find(f => f.id === prodi.parentUnitId);
              const meta = prodiMetaMap[prodi.id] || {
                lam: 'BAN-PT',
                akred: 'Baik Sekali',
                siklusStatus: 'Selesai',
                ketuaUjm: 'Tim UJM Prodi'
              };
              const isUnggul = prodi.qualityScore >= 3.65;
              const isGood = prodi.qualityScore >= 3.50;

              return (
                <tr key={prodi.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-3.5 text-center text-slate-400 font-bold">
                    {idx + 1}
                  </td>
                  <td className="py-3 px-3.5">
                    <p className="font-bold text-slate-900">{prodi.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{prodi.code}</p>
                  </td>
                  <td className="py-3 px-3.5">
                    <span className="font-semibold text-slate-700">{faculty?.code || 'UNIMEN'}</span>
                    <p className="text-[10px] text-slate-400 truncate">{faculty?.name}</p>
                  </td>
                  <td className="py-3 px-3.5 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      meta.akred === 'Unggul'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : meta.akred === 'Baik Sekali'
                        ? 'bg-blue-100 text-blue-800 border border-blue-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}>
                      {meta.akred}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-0.5">{meta.lam}</p>
                  </td>
                  <td className="py-3 px-3.5 text-center">
                    <div className="flex flex-col items-center">
                      <span className={`font-black text-sm ${
                        isUnggul ? 'text-emerald-700' : isGood ? 'text-teal-700' : 'text-amber-700'
                      }`}>
                        {prodi.qualityScore.toFixed(2)}
                      </span>
                      <span className="text-[10px] text-slate-400">Target: {prodi.targetScore.toFixed(2)}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3.5 text-center">
                    <span className="font-bold text-slate-800">{prodi.totalFindings} Butir</span>
                    <p className="text-[10px] text-emerald-600 font-medium">
                      {prodi.resolvedFindings} tuntas
                    </p>
                  </td>
                  <td className="py-3 px-3.5">
                    <p className="font-semibold text-slate-800 text-[11px] truncate max-w-[170px]">
                      Kaprodi: {prodi.headName}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate max-w-[170px]">
                      UJM: {meta.ketuaUjm}
                    </p>
                  </td>
                  <td className="py-3 px-3.5 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      meta.siklusStatus.includes('Terverifikasi')
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : meta.siklusStatus.includes('Review')
                        ? 'bg-sky-50 text-sky-700 border border-sky-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {meta.siklusStatus}
                    </span>
                  </td>
                  {onNavigateToTab && (
                    <td className="py-3 px-3.5 text-right">
                      <button
                        onClick={() => onNavigateToTab('audit')}
                        className="text-emerald-700 hover:text-emerald-900 font-bold hover:underline"
                      >
                        Audit
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Aggregate Institutional Badge */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase">Rerata Mutu Universitas</p>
            <p className="text-base font-extrabold text-slate-900">{avgUnivScore} / 4.00 (Baik Sekali)</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase">Prodi Terakreditasi Unggul</p>
            <p className="text-base font-extrabold text-slate-900">{unggulCount} dari 20 Program Studi</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase">Tindak Lanjut CAP / PTK</p>
            <p className="text-base font-extrabold text-slate-900">{resolvedFindingsCount} dari {totalFindingsCount} Temuan Tuntas</p>
          </div>
        </div>
      </div>
    </div>
  );
};
