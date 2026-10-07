import React, { useState } from 'react';
import { 
  X, 
  ClipboardList, 
  Search, 
  Layers, 
  Clock, 
  Cpu, 
  ArrowRight, 
  CheckCircle2, 
  Filter,
  Flame,
  Droplets,
  PackageCheck
} from 'lucide-react';
import { LILIN_PROCESSES, TIMAH_PROCESSES } from '../data/initialData';

export default function ProcessVoucherSummaryModal({
  isOpen,
  onClose,
  scheduleBlocks = [],
  activePipeline = 'ALL',
  onSelectProcess = null,
  initialProcessCode = null
}) {
  if (!isOpen) return null;

  const [searchQuery, setSearchQuery] = useState('');
  const [pipelineFilter, setPipelineFilter] = useState(activePipeline === 'ALL' ? 'ALL' : activePipeline);

  // Combine processes based on pipelineFilter
  const allProcesses = React.useMemo(() => {
    if (pipelineFilter === 'Lilin') return LILIN_PROCESSES;
    if (pipelineFilter === 'Timah') return TIMAH_PROCESSES;
    // ALL: unique by code
    const map = new Map();
    [...LILIN_PROCESSES, ...TIMAH_PROCESSES].forEach(p => {
      if (!map.has(p.code)) map.set(p.code, p);
    });
    return Array.from(map.values());
  }, [pipelineFilter]);

  // Aggregate voucher data per process
  const processStats = React.useMemo(() => {
    return allProcesses.map(proc => {
      const blocksForProc = scheduleBlocks.filter(b => b.processCode === proc.code);
      
      // Deduplicate vouchers by voucherNo
      const voucherMap = new Map();
      blocksForProc.forEach(b => {
        if (!voucherMap.has(b.voucherNo)) {
          voucherMap.set(b.voucherNo, {
            voucherNo: b.voucherNo,
            soNumber: b.soNumber || b.voucherNo,
            modelCode: b.modelCode || 'Model',
            biji: Number(b.biji) || 0,
            machineId: b.machineId,
            startHour: b.startHour,
            durationMinutes: b.durationMinutes || Math.round((b.durationHours || 0) * 60),
            durationHours: b.durationHours || 1,
            materialType: b.materialType || proc.pipeline
          });
        }
      });

      const vouchers = Array.from(voucherMap.values());
      const totalBiji = vouchers.reduce((sum, v) => sum + v.biji, 0);

      return {
        ...proc,
        vouchers,
        voucherCount: vouchers.length,
        totalBiji,
        totalBlocks: blocksForProc.length
      };
    });
  }, [allProcesses, scheduleBlocks]);

  // Filtered by search query
  const filteredStats = React.useMemo(() => {
    if (!searchQuery.trim()) return processStats;
    const q = searchQuery.toLowerCase();
    return processStats.filter(ps => 
      ps.name.toLowerCase().includes(q) ||
      ps.code.toLowerCase().includes(q) ||
      ps.vouchers.some(v => 
        v.voucherNo.toLowerCase().includes(q) || 
        v.soNumber.toLowerCase().includes(q) || 
        v.modelCode.toLowerCase().includes(q)
      )
    );
  }, [processStats, searchQuery]);

  // High-level summary figures
  const totalVoucherAssignments = processStats.reduce((sum, ps) => sum + ps.voucherCount, 0);
  const totalUniqueVouchersOverall = new Set(scheduleBlocks.map(b => b.voucherNo)).size;
  const busiestProcess = [...processStats].sort((a, b) => b.voucherCount - a.voucherCount)[0];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0a3866] via-[#145388] to-[#0a3866] text-white p-4 flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shadow-inner">
              <ClipboardList className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-wide flex items-center space-x-2">
                <span>Rekapitulasi Voucher per Subproses Produksi</span>
                <span className="bg-amber-400 text-slate-950 text-[10px] px-2 py-0.5 rounded-full font-black uppercase">
                  Live Status
                </span>
              </h3>
              <p className="text-xs text-blue-100 mt-0.5">
                Monitoring antrean voucher & order yang terjadwal di setiap tahapan subproses kerja
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-slate-50 border-b border-slate-200 shrink-0 text-xs">
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Total Voucher Terdaftar</span>
            <div className="flex items-baseline space-x-1.5 mt-1">
              <span className="text-2xl font-black text-slate-900">{totalUniqueVouchersOverall}</span>
              <span className="text-slate-500 font-semibold text-[11px]">Voucher Unik</span>
            </div>
          </div>

          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Total Alokasi di Proses</span>
            <div className="flex items-baseline space-x-1.5 mt-1">
              <span className="text-2xl font-black text-blue-700">{totalVoucherAssignments}</span>
              <span className="text-slate-500 font-semibold text-[11px]">Antrean Tahapan</span>
            </div>
          </div>

          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Subproses Terbanyak</span>
            <div className="flex items-baseline space-x-1.5 mt-1 truncate">
              <span className="text-lg font-black text-emerald-700 truncate">{busiestProcess?.code || '-'}</span>
              <span className="text-slate-500 font-semibold text-[11px] truncate">({busiestProcess?.voucherCount || 0} Voucher)</span>
            </div>
          </div>

          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Total Biji Terjadwal</span>
            <div className="flex items-baseline space-x-1.5 mt-1">
              <span className="text-2xl font-black text-purple-700">
                {processStats.reduce((sum, ps) => sum + ps.totalBiji, 0)}
              </span>
              <span className="text-slate-500 font-semibold text-[11px]">pcs</span>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="px-4 py-3 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* Pipeline filter tabs */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setPipelineFilter('ALL')}
              className={`px-3 py-1 rounded-lg transition-all ${
                pipelineFilter === 'ALL'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua Proses ({processStats.length})
            </button>
            <button
              onClick={() => setPipelineFilter('Lilin')}
              className={`px-3 py-1 rounded-lg transition-all ${
                pipelineFilter === 'Lilin'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Jalur Lilin (12)
            </button>
            <button
              onClick={() => setPipelineFilter('Timah')}
              className={`px-3 py-1 rounded-lg transition-all ${
                pipelineFilter === 'Timah'
                  ? 'bg-cyan-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Jalur Timah (14)
            </button>
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari voucher, SO, atau nama proses..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Process Cards List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-slate-50/50">
          {filteredStats.map((proc, idx) => {
            const hasVouchers = proc.voucherCount > 0;
            const isInitialMatch = initialProcessCode && proc.code === initialProcessCode;

            return (
              <div 
                key={proc.code}
                className={`bg-white rounded-xl border transition-all p-3.5 shadow-2xs hover:shadow-xs ${
                  isInitialMatch 
                    ? 'border-blue-500 ring-2 ring-blue-500/20' 
                    : hasVouchers
                    ? 'border-slate-300'
                    : 'border-slate-200 opacity-80'
                }`}
              >
                {/* Process Row Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div className="flex items-center space-x-2.5">
                    <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-900 font-extrabold text-xs flex items-center justify-center border border-blue-200">
                      {proc.number || idx + 1}
                    </span>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-sm text-slate-900">
                          {proc.code} — {proc.name}
                        </span>
                        <span className={`text-[10px] px-2 py-0.2 rounded-full font-bold ${
                          proc.pipeline === 'Lilin'
                            ? 'bg-emerald-100 text-emerald-800'
                            : proc.pipeline === 'Timah'
                            ? 'bg-cyan-100 text-cyan-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {proc.pipeline}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3 text-[11px] text-slate-500 mt-0.5">
                        <span>Lead Time: <strong className="text-slate-700">{proc.leadtimeDisplay}</strong></span>
                        <span>•</span>
                        <span>Kapasitas: <strong className="text-slate-700">{proc.capacityUnit}</strong></span>
                        <span>•</span>
                        <span>{proc.machines?.length || 1} Mesin</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Voucher Count Badge & Focus Button */}
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-extrabold flex items-center space-x-1.5 shadow-2xs ${
                      hasVouchers
                        ? 'bg-emerald-500 text-white ring-2 ring-emerald-500/20'
                        : 'bg-slate-100 text-slate-500 border border-slate-200'
                    }`}>
                      <PackageCheck className="w-3.5 h-3.5" />
                      <span>{proc.voucherCount} Voucher Terjadwal</span>
                    </span>

                    {onSelectProcess && (
                      <button
                        onClick={() => {
                          onSelectProcess(proc.code);
                          onClose();
                        }}
                        className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold border border-blue-200 transition-colors flex items-center space-x-1 cursor-pointer"
                        title={`Filter timeline langsung ke proses ${proc.name}`}
                      >
                        <span>Fokus Timeline</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Vouchers List in this Process */}
                {hasVouchers ? (
                  <div className="mt-3">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                      Daftar Voucher yang Dijadwalkan ({proc.voucherCount} Voucher — {proc.totalBiji} pcs):
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {proc.vouchers.map(v => (
                        <div 
                          key={v.voucherNo}
                          className="bg-slate-50 hover:bg-blue-50/60 p-2.5 rounded-lg border border-slate-200 hover:border-blue-300 transition-all text-xs flex flex-col justify-between"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-blue-900">{v.soNumber}</span>
                            <span className="text-[10px] font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-700">
                              {v.voucherNo}
                            </span>
                          </div>
                          
                          <div className="mt-1 text-[11px] text-slate-600 font-semibold truncate">
                            {v.modelCode}
                          </div>

                          <div className="mt-2 pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500 font-medium">
                            <span>Mesin: <strong className="text-slate-800">{v.machineId}</strong></span>
                            <span>{v.biji} pcs</span>
                            <span className="text-blue-700 font-bold">{v.durationMinutes}m</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mt-2.5 py-2 px-3 bg-slate-50 rounded-lg border border-dashed border-slate-200 text-center text-xs text-slate-400">
                    Belum ada voucher yang dialokasikan di tahapan subproses ini.
                  </div>
                )}
              </div>
            );
          })}

          {filteredStats.length === 0 && (
            <div className="py-12 text-center text-slate-400 text-xs">
              Tidak ditemukan subproses yang cocok dengan kata kunci "{searchQuery}".
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-white border-t border-slate-200 flex items-center justify-between shrink-0 text-xs">
          <span className="text-slate-500">
            Menampilkan <strong>{filteredStats.length}</strong> subproses produksi
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
}
