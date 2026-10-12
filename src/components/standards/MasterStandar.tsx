import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StandardCategory, StandardItem } from '../../types';
import {
  BookOpenCheck,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Scale,
  Sparkles,
  Edit2,
  Trash2,
  Layers,
  FileCheck2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export const MasterStandar: React.FC = () => {
  const { standards, addStandard, updateStandard, deleteStandard, currentUser } = useApp();
  const [activeCategory, setActiveCategory] = useState<StandardCategory | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedStandardId, setExpandedStandardId] = useState<string | null>(standards[0]?.id || null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state for adding standard
  const [formCategory, setFormCategory] = useState<StandardCategory>('STANDAR PENDIDIKAN');
  const [formGroup, setFormGroup] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formLegalBasis, setFormLegalBasis] = useState('Permendiktisaintek No. 39 Tahun 2025');
  const [formPic, setFormPic] = useState('LPM & Program Studi');
  const [formWeight, setFormWeight] = useState<number>(10);

  // Permission check
  const canManageAll = currentUser.role === 'Super Admin' || currentUser.role === 'LPM';
  const canManageResearch = canManageAll || currentUser.role === 'LPPM';
  const canManageAik = canManageAll || currentUser.role === 'L2AIK';

  const canEditCategory = (cat: StandardCategory) => {
    if (canManageAll) return true;
    if (cat === 'STANDAR PENELITIAN' || cat === 'STANDAR PENGABDIAN') return canManageResearch;
    if (cat === 'STANDAR AIK DAN KEKHASAN') return canManageAik;
    return false;
  };

  const filteredStandards = standards.filter(std => {
    const matchesCategory = activeCategory === 'ALL' || std.category === activeCategory;
    const matchesQuery =
      std.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      std.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      std.groupName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      std.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const handleCreateStandard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCode || !formTitle) return;

    addStandard({
      code: formCode,
      category: formCategory,
      groupName: formGroup || 'Standar Mutu Tambahan',
      title: formTitle,
      description: formDesc,
      legalBasis: formLegalBasis,
      picUnit: formPic,
      weight: formWeight,
      indicators: [
        {
          id: `ind-${Date.now()}-1`,
          code: `${formCode}-IND-01`,
          name: `Indikator Pemenuhan ${formTitle}`,
          description: `Tersedia bukti dokumen formal pemenuhan standar di tingkat unit.`,
          target: `100% unit memenuhi standar`,
          mandatoryEvidence: `SK / Dokumen Kebijakan & Laporan Keterlaksanaan`,
          ppeppCycle: 'Pelaksanaan'
        }
      ]
    });

    setShowAddModal(false);
    // Reset form
    setFormCode('');
    setFormTitle('');
    setFormDesc('');
    setFormGroup('');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <BookOpenCheck className="w-6 h-6 text-emerald-700" />
            <h1 className="text-xl font-bold text-slate-900">
              Master Standar Mutu Pendidikan Tinggi UNIMEN
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Berbasis <strong>Permendiktisaintek No. 39 Tahun 2025</strong>, SN Dikti, dan Standar Khusus AIK & Agropreneurship Universitas Muhammadiyah Enrekang.
          </p>
        </div>

        {(canManageAll || canManageResearch || canManageAik) && (
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Tambah Butir Standar
          </button>
        )}
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveCategory('ALL')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
            activeCategory === 'ALL'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Semua Standar ({standards.length})
        </button>

        <button
          onClick={() => setActiveCategory('STANDAR PENDIDIKAN')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
            activeCategory === 'STANDAR PENDIDIKAN'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white text-emerald-800 hover:bg-emerald-50 border border-emerald-200'
          }`}
        >
          A. Standar Pendidikan (Permendikti 39/25)
        </button>

        <button
          onClick={() => setActiveCategory('STANDAR PENELITIAN')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
            activeCategory === 'STANDAR PENELITIAN'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'bg-white text-teal-800 hover:bg-teal-50 border border-teal-200'
          }`}
        >
          B. Standar Penelitian (LPPM)
        </button>

        <button
          onClick={() => setActiveCategory('STANDAR PENGABDIAN')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
            activeCategory === 'STANDAR PENGABDIAN'
              ? 'bg-sky-700 text-white shadow-xs'
              : 'bg-white text-sky-800 hover:bg-sky-50 border border-sky-200'
          }`}
        >
          C. Standar Pengabdian (PkM)
        </button>

        <button
          onClick={() => setActiveCategory('STANDAR AIK DAN KEKHASAN')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
            activeCategory === 'STANDAR AIK DAN KEKHASAN'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white text-amber-900 hover:bg-amber-50 border border-amber-300'
          }`}
        >
          D. Standar AIK & Agropreneurship
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="Cari butir standar, kode (STD-...), indikator, dasar hukum, atau PIC..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
        />
      </div>

      {/* Standards List / Accordion */}
      <div className="space-y-4">
        {filteredStandards.map(std => {
          const isExpanded = expandedStandardId === std.id;
          const canEditThis = canEditCategory(std.category);

          return (
            <div
              key={std.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden transition-all"
            >
              {/* Card Header */}
              <div
                onClick={() => setExpandedStandardId(isExpanded ? null : std.id)}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer hover:bg-slate-50/70 transition"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 border border-slate-200">
                      {std.code}
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {std.groupName}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      Bobot: {std.weight}%
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {std.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-1">
                    {std.description}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                  <div className="text-right hidden sm:block">
                    <span className="text-[11px] font-semibold text-slate-400 block">Dasar Hukum:</span>
                    <span className="text-xs text-slate-600 font-medium truncate max-w-[180px] block">
                      {std.legalBasis}
                    </span>
                  </div>

                  <button className="p-1.5 text-slate-400 hover:text-slate-600">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Card Expanded Content */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-2 border-t border-slate-100 bg-slate-50/40 space-y-4">
                  {/* Detailed Description & Legal Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-white rounded-xl border border-slate-200 text-xs">
                    <div>
                      <span className="font-bold text-slate-400 uppercase text-[10px] block">Uraian Standar</span>
                      <p className="text-slate-700 mt-0.5">{std.description}</p>
                    </div>
                    <div>
                      <span className="font-bold text-slate-400 uppercase text-[10px] block">Dasar Regulasi</span>
                      <p className="text-slate-700 font-medium mt-0.5">{std.legalBasis}</p>
                    </div>
                    <div>
                      <span className="font-bold text-slate-400 uppercase text-[10px] block">Penanggung Jawab (PIC)</span>
                      <p className="text-emerald-800 font-bold mt-0.5">{std.picUnit}</p>
                    </div>
                  </div>

                  {/* Indicators Table */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <FileCheck2 className="w-4 h-4 text-emerald-700" />
                      Indikator Kinerja & Bukti Wajib ({std.indicators.length} Indikator)
                    </h4>
                    <div className="overflow-x-auto bg-white rounded-xl border border-slate-200">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                          <tr>
                            <th className="py-2.5 px-3">Kode & Indikator</th>
                            <th className="py-2.5 px-3">Target Mutu</th>
                            <th className="py-2.5 px-3">Bukti Wajib (Verifikasi Digital)</th>
                            <th className="py-2.5 px-3 text-center">Siklus PPEPP</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {std.indicators.map(ind => (
                            <tr key={ind.id} className="hover:bg-slate-50/60">
                              <td className="py-3 px-3">
                                <span className="font-mono text-[10px] text-slate-500 block">{ind.code}</span>
                                <span className="font-bold text-slate-900">{ind.name}</span>
                                <p className="text-[11px] text-slate-500 mt-0.5">{ind.description}</p>
                              </td>
                              <td className="py-3 px-3 font-medium text-emerald-800">
                                {ind.target}
                              </td>
                              <td className="py-3 px-3 text-slate-700">
                                <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-medium text-[11px]">
                                  {ind.mandatoryEvidence}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-center">
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                                  {ind.ppeppCycle}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Actions footer if authorized */}
                  {canEditThis && (
                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        onClick={() => deleteStandard(std.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Hapus Butir
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal Add Standard */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">
                Tambah Butir Standar Mutu Baru
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateStandard} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Kategori Standar</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as StandardCategory)}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="STANDAR PENDIDIKAN">STANDAR PENDIDIKAN (Permendiktisaintek 39/2025)</option>
                  <option value="STANDAR PENELITIAN">STANDAR PENELITIAN (LPPM)</option>
                  <option value="STANDAR PENGABDIAN">STANDAR PENGABDIAN (PkM)</option>
                  <option value="STANDAR AIK DAN KEKHASAN">STANDAR AIK DAN KEKHASAN (Agropreneurship & Edutech)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kode Standar</label>
                  <input
                    type="text"
                    placeholder="Contoh: STD-PEND-005"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    required
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Grup / Klaster</label>
                  <input
                    type="text"
                    placeholder="Contoh: Standar Pengelolaan"
                    value={formGroup}
                    onChange={(e) => setFormGroup(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Judul Standar</label>
                <input
                  type="text"
                  placeholder="Contoh: Standar Tata Kelola dan Pengelolaan Program Studi"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  required
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Deskripsi & Ruang Lingkup</label>
                <textarea
                  rows={2}
                  placeholder="Jelaskan parameter yang diatur dalam standar mutu ini..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Dasar Regulasi</label>
                  <input
                    type="text"
                    value={formLegalBasis}
                    onChange={(e) => setFormLegalBasis(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Bobot (%)</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={formWeight}
                    onChange={(e) => setFormWeight(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-700 text-white font-bold hover:bg-emerald-800"
                >
                  Simpan Standar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
