import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Search,
  Filter,
  Download,
  FileCheck,
  Scale
} from 'lucide-react';

export const InstrumenAudit: React.FC = () => {
  const { standards, auditItems } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredItems = auditItems.filter(item => {
    const parentStd = standards.find(s => s.code === item.standardCode);
    const matchesCategory = selectedCategory === 'ALL' || (parentStd && parentStd.category === selectedCategory);
    const matchesSearch =
      item.standardCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.indicator.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-emerald-700" />
            <h1 className="text-xl font-bold text-slate-900">
              Instrumen & Rubrik Audit Mutu Internal (AMI)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Matriks butir audit berbasis rubrik skala 1-4, indikator capaian SN Dikti / Permendiktisaintek 39/2025, bukti digital wajib, dan panduan penilaian auditor.
          </p>
        </div>

        {/* Rubric Score Explanations Badge */}
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold">
          <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-200">
            4 = Melampaui Standar
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-teal-100 text-teal-800 border border-teal-200">
            3 = Memenuhi Standar
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 border border-amber-200">
            2 = Sebagian Memenuhi
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 border border-rose-200">
            1 = Tidak Memenuhi
          </span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Cari pertanyaan instrumen audit, kode standar, atau indikator..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="ALL">Semua Kategori Standar</option>
          <option value="STANDAR PENDIDIKAN">Standar Pendidikan (Permendikti 39/2025)</option>
          <option value="STANDAR PENELITIAN">Standar Penelitian (LPPM)</option>
          <option value="STANDAR PENGABDIAN">Standar Pengabdian (PkM)</option>
          <option value="STANDAR AIK DAN KEKHASAN">Standar AIK & Agropreneurship</option>
        </select>
      </div>

      {/* Audit Items Cards */}
      <div className="space-y-4">
        {filteredItems.map((item, index) => {
          return (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 hover:border-emerald-300 transition space-y-4"
            >
              {/* Item Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {item.standardCode}
                  </span>
                  <span className="text-xs font-bold text-slate-700">
                    {item.standardGroup}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-semibold text-slate-400">Bobot:</span>
                  <span className="px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-800">
                    {item.weight}%
                  </span>
                  <span className="px-2 py-0.5 rounded-full font-bold bg-teal-50 text-teal-800 border border-teal-200 text-[10px]">
                    Siklus {item.ppeppStage}
                  </span>
                </div>
              </div>

              {/* Question & Indicators */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Pertanyaan Audit:
                </div>
                <p className="text-sm font-bold text-slate-900 leading-snug">
                  "{item.question}"
                </p>
              </div>

              {/* Grid: Target & Mandatory Evidence */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-slate-50/70 rounded-xl border border-slate-200/80 text-xs">
                <div>
                  <span className="font-bold text-slate-500 uppercase text-[10px] block">
                    Indikator & Target Capaian
                  </span>
                  <p className="font-semibold text-slate-800 mt-0.5">{item.indicator}</p>
                  <p className="text-emerald-700 font-medium text-[11px] mt-0.5">
                    Target: {item.target}
                  </p>
                </div>
                <div>
                  <span className="font-bold text-slate-500 uppercase text-[10px] block">
                    Bukti Wajib (Evidence Document)
                  </span>
                  <p className="text-slate-700 font-medium mt-0.5">
                    {item.mandatoryEvidence}
                  </p>
                </div>
              </div>

              {/* Rubric Matrix Table for this item */}
              <div className="pt-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Rubrik Penilaian Skor (Kriteria Asesmen):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/50">
                    <span className="font-bold text-emerald-900 block">Skor 4 - Melampaui</span>
                    <p className="text-[11px] text-emerald-800 mt-0.5">
                      Memenuhi seluruh target standar, dokumen valid dan tersosialisasi, memiliki keunggulan agropreneurship/inovasi berkelanjutan.
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl border border-teal-200 bg-teal-50/50">
                    <span className="font-bold text-teal-900 block">Skor 3 - Memenuhi</span>
                    <p className="text-[11px] text-teal-800 mt-0.5">
                      Memenuhi tolok ukur standar regulasi, bukti fisik lengkap, konsisten dijalankan sesuai SOP.
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl border border-amber-200 bg-amber-50/50">
                    <span className="font-bold text-amber-900 block">Skor 2 - Sebagian</span>
                    <p className="text-[11px] text-amber-800 mt-0.5">
                      Sebagian indikator terlaksana, namun ada dokumen pendukung atau monev periodik yang belum lengkap.
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl border border-rose-200 bg-rose-50/50">
                    <span className="font-bold text-rose-900 block">Skor 1 - Tidak Memenuhi</span>
                    <p className="text-[11px] text-rose-800 mt-0.5">
                      Belum memiliki instrumen/bukti pelaksanaan sama sekali atau terjadi pelanggaran kepatuhan standar.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
