import React, { useState, useMemo, useEffect } from 'react';
import { 
  BarChart3, 
  Layers, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Activity, 
  Filter, 
  Search, 
  Download, 
  Printer, 
  RefreshCw, 
  ArrowUpDown, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Table, 
  Grid3X3, 
  Eye, 
  Scale, 
  Cpu, 
  User, 
  ArrowRight,
  TrendingUp,
  SlidersHorizontal,
  Flame,
  Sparkles,
  Info
} from 'lucide-react';
import { 
  LILIN_VISUAL_COLUMNS, 
  TIMAH_VISUAL_COLUMNS, 
  getCompleteFactoryVouchers, 
  calculateReportMetrics, 
  exportToCSV 
} from '../utils/planRealUtils';
import DetailVoucherPlanRealModal from './DetailVoucherPlanRealModal';

export default function LaporanPlanReal({
  orders = [],
  scheduleBlocks = [],
  transactions = [],
  sysInfo
}) {
  // View mode: 'visual-matrix' (Gambar 1 adapted) or 'detailed-table' (Formal report)
  const [viewMode, setViewMode] = useState('visual-matrix');

  // Pipeline tab filter: 'Lilin' (default matching Gambar 1) or 'Timah' or 'ALL'
  const [selectedPipeline, setSelectedPipeline] = useState('Lilin');

  // Status condition filter: 'ALL' | 'OVERDUE' | 'ON PLAN' | 'ON TRACK'
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Search keyword
  const [searchQuery, setSearchQuery] = useState('');

  // Process specific filter
  const [processFilter, setProcessFilter] = useState('ALL');

  // Selected voucher for drilldown detail modal
  const [selectedVoucherModal, setSelectedVoucherModal] = useState(null);

  // Pagination state (Gambar 1 shows e.g. HAL 5/6)
  const [currentPage, setCurrentPage] = useState(5); // default page 5 to match Gambar 1 screenshot!
  const [itemsPerPage, setItemsPerPage] = useState(15);

  // Auto-refresh timer state
  const [lastUpdateTime, setLastUpdateTime] = useState(() => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load baseline vouchers & merge with any live orders in the app
  const [vouchersData, setVouchersData] = useState(() => getCompleteFactoryVouchers());

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      const d = new Date();
      setLastUpdateTime(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`);
      setVouchersData(getCompleteFactoryVouchers());
      setIsRefreshing(false);
    }, 400);
  };

  // Filter vouchers based on pipeline, status, process, search
  const filteredVouchers = useMemo(() => {
    return vouchersData.filter(v => {
      // 1. Pipeline filter
      if (selectedPipeline !== 'ALL' && v.materialType !== selectedPipeline) {
        return false;
      }
      // 2. Status condition filter
      if (statusFilter !== 'ALL' && v.condition !== statusFilter) {
        return false;
      }
      // 3. Process filter
      if (processFilter !== 'ALL' && v.actualStage !== processFilter && v.plannedStage !== processFilter) {
        return false;
      }
      // 4. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const vNo = (v.voucherNo || '').toLowerCase();
        const mCode = (v.modelCode || '').toLowerCase();
        const mName = (v.modelName || '').toLowerCase();
        const op = (v.operator || '').toLowerCase();
        const mc = (v.machine || '').toLowerCase();
        if (!vNo.includes(q) && !mCode.includes(q) && !mName.includes(q) && !op.includes(q) && !mc.includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [vouchersData, selectedPipeline, statusFilter, processFilter, searchQuery]);

  // Overall KPI statistics
  const metrics = useMemo(() => {
    return calculateReportMetrics(filteredVouchers);
  }, [filteredVouchers]);

  // Active columns for the visual board
  const visualColumns = useMemo(() => {
    if (selectedPipeline === 'Timah') return TIMAH_VISUAL_COLUMNS;
    return LILIN_VISUAL_COLUMNS; // default Lilin matching Gambar 1
  }, [selectedPipeline]);

  // Count vouchers in each visual column for the header badges: CEL (32), SOL (41), etc.
  const columnCounts = useMemo(() => {
    const counts = {};
    visualColumns.forEach(c => {
      counts[c.code] = filteredVouchers.filter(v => v.actualStage === c.code).length;
    });
    return counts;
  }, [filteredVouchers, visualColumns]);

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredVouchers.length / itemsPerPage));
  const effectiveCurrentPage = Math.min(currentPage, totalPages);
  const paginatedVouchers = useMemo(() => {
    const startIdx = (effectiveCurrentPage - 1) * itemsPerPage;
    return filteredVouchers.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredVouchers, effectiveCurrentPage, itemsPerPage]);

  return (
    <div className="space-y-4 pb-12 animate-in fade-in">
      
      {/* 1. TOP HEADER BANNER MATCHING GAMBAR 1 */}
      <div className="bg-[#cbd5e1] border-2 border-[#94a3b8] rounded-xl px-4 py-3 shadow-xs">
        <div className="flex flex-col md:flex-row items-center justify-between text-center md:text-left gap-2">
          <div className="flex items-center flex-wrap justify-center md:justify-start gap-2 text-slate-900 font-black text-xs md:text-sm tracking-wide">
            <span className="uppercase text-blue-900 font-extrabold flex items-center">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 mr-2 animate-ping"></span>
              VISUAL {selectedPipeline.toUpperCase()} : {sysInfo?.currentDateStr?.toUpperCase() || '07 OKTOBER 2026'}
            </span>
            <span className="text-slate-400 hidden sm:inline">----</span>
            <span className="text-slate-800">
              UPDATE TERAKHIR PUKUL : <span className="font-mono text-blue-900">{lastUpdateTime}</span>
            </span>
            <span className="text-slate-400 hidden sm:inline">----</span>
            <span className="bg-blue-900 text-white px-2 py-0.5 rounded text-xs">
              {filteredVouchers.length} VOUCHER
            </span>
            <span className="text-slate-400 hidden sm:inline">----</span>
            <span className="font-bold text-slate-700">
              HAL {effectiveCurrentPage}/{totalPages}
            </span>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={handleManualRefresh}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 shadow-2xs transition-colors"
              title="Refresh Data Sekarang"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={() => exportToCSV(filteredVouchers)}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-2xs transition-colors"
              title="Export ke Excel / CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export Excel</span>
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold shadow-2xs transition-colors"
              title="Cetak Laporan"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cetak</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. EXECUTIVE KPI CARDS: OVERDUE, ON PLAN, ON TRACK, TOTALS */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Total Voucher */}
        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Voucher</span>
            <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <Layers className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-xl font-black text-slate-900">{metrics.total}</span>
            <span className="text-xs text-slate-400">Voucher</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex justify-between">
            <span>{metrics.totalRealBiji} biji</span>
            <span>{metrics.totalRealBerat} gr</span>
          </div>
        </div>

        {/* ON PLAN (Hijau) */}
        <div 
          onClick={() => setStatusFilter(statusFilter === 'ON PLAN' ? 'ALL' : 'ON PLAN')}
          className={`bg-white rounded-xl border p-3.5 shadow-2xs cursor-pointer transition-all hover:border-emerald-400 ${
            statusFilter === 'ON PLAN' ? 'ring-2 ring-emerald-500 border-emerald-500 bg-emerald-50/20' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">On Plan (Tepat)</span>
            <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-xl font-black text-emerald-700">{metrics.onPlanCount}</span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded">
              {metrics.onPlanPercent}%
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 truncate">
            Sesuai jadwal rencana shift
          </p>
        </div>

        {/* ON TRACK (Biru) */}
        <div 
          onClick={() => setStatusFilter(statusFilter === 'ON TRACK' ? 'ALL' : 'ON TRACK')}
          className={`bg-white rounded-xl border p-3.5 shadow-2xs cursor-pointer transition-all hover:border-blue-400 ${
            statusFilter === 'ON TRACK' ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-50/20' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">On Track (Lancar)</span>
            <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <Activity className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-xl font-black text-blue-700">{metrics.onTrackCount}</span>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded">
              {metrics.onTrackPercent}%
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 truncate">
            Dalam batas lead time normal
          </p>
        </div>

        {/* OVERDUE (Merah) */}
        <div 
          onClick={() => setStatusFilter(statusFilter === 'OVERDUE' ? 'ALL' : 'OVERDUE')}
          className={`bg-white rounded-xl border p-3.5 shadow-2xs cursor-pointer transition-all hover:border-rose-400 ${
            statusFilter === 'OVERDUE' ? 'ring-2 ring-rose-500 border-rose-500 bg-rose-50/20' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">Overdue (Terlambat)</span>
            <span className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-xl font-black text-rose-700">{metrics.overdueCount}</span>
            <span className="text-xs font-bold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded">
              {metrics.overduePercent}%
            </span>
          </div>
          <p className="text-[11px] text-rose-600 font-semibold mt-1 truncate">
            Perlu eskalasi / prioritas
          </p>
        </div>

        {/* RATA-RATA DEVIASI WAKTU */}
        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Rata-rata Delay</span>
            <span className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-xl font-black text-amber-700">{metrics.avgDelayHours}</span>
            <span className="text-xs text-slate-500 font-semibold">Jam / Voucher</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 truncate">
            Dari {metrics.overdueCount} voucher terlambat
          </p>
        </div>
      </div>

      {/* 3. CONTROL & FILTER BAR */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Left: Jalur Switcher & View Mode */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Jalur Lilin vs Timah */}
            <div className="bg-slate-100 p-1 rounded-xl flex items-center space-x-1 border border-slate-200 text-xs">
              <button
                onClick={() => {
                  setSelectedPipeline('Lilin');
                  setCurrentPage(5); // Gambar 1 default
                }}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  selectedPipeline === 'Lilin'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Jalur Lilin (10 Proses)
              </button>
              <button
                onClick={() => {
                  setSelectedPipeline('Timah');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  selectedPipeline === 'Timah'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Jalur Timah (14 Proses)
              </button>
              <button
                onClick={() => setSelectedPipeline('ALL')}
                className={`px-2.5 py-1.5 rounded-lg font-semibold transition-all ${
                  selectedPipeline === 'ALL'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semua
              </button>
            </div>

            {/* View Mode Toggle: Matriks Visual vs Tabel Rinci */}
            <div className="bg-slate-100 p-1 rounded-xl flex items-center space-x-1 border border-slate-200 text-xs">
              <button
                onClick={() => setViewMode('visual-matrix')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                  viewMode === 'visual-matrix'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Tampilan Matriks Alur seperti Gambar 1"
              >
                <Grid3X3 className="w-3.5 h-3.5 text-blue-600" />
                <span>Matriks Visual (Gaya Gambar 1)</span>
              </button>
              <button
                onClick={() => setViewMode('detailed-table')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                  viewMode === 'detailed-table'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Tabel Laporan Analisis Rinci"
              >
                <Table className="w-3.5 h-3.5 text-blue-600" />
                <span>Tabel Laporan Rinci</span>
              </button>
            </div>
          </div>

          {/* Right: Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari no voucher, model, tukang..."
              className="w-full pl-9 pr-8 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Status Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 flex items-center">
              <Filter className="w-3 h-3 mr-1" />
              Filter Status:
            </span>
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                statusFilter === 'ALL'
                  ? 'bg-slate-800 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Semua ({vouchersData.length})
            </button>
            <button
              onClick={() => setStatusFilter('OVERDUE')}
              className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors flex items-center space-x-1 ${
                statusFilter === 'OVERDUE'
                  ? 'bg-rose-600 text-white border-rose-600 shadow-2xs'
                  : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-500 inline-block"></span>
              <span>Overdue ({metrics.overdueCount})</span>
            </button>
            <button
              onClick={() => setStatusFilter('ON PLAN')}
              className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors flex items-center space-x-1 ${
                statusFilter === 'ON PLAN'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
              <span>On Plan ({metrics.onPlanCount})</span>
            </button>
            <button
              onClick={() => setStatusFilter('ON TRACK')}
              className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors flex items-center space-x-1 ${
                statusFilter === 'ON TRACK'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                  : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span>
              <span>On Track ({metrics.onTrackCount})</span>
            </button>
          </div>

          {/* Quick Pagination selector */}
          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <span>Tampil:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-slate-50 border border-slate-200 rounded px-2 py-0.5 text-xs font-semibold"
            >
              <option value={10}>10 Baris</option>
              <option value={15}>15 Baris</option>
              <option value={25}>25 Baris</option>
              <option value={50}>50 Baris</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. MAIN CONTENT VIEW: MODE 1 (MATRIKS VISUAL) OR MODE 2 (TABEL RINCI) */}
      {viewMode === 'visual-matrix' ? (
        /* MODE 1: VISUAL PROCESS MATRIX (MATCHING GAMBAR 1 DESIGN LANGUAGE) */
        <div className="bg-white border-2 border-slate-300 rounded-xl overflow-hidden shadow-xs">
          
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full border-collapse select-none min-w-[1100px]">
              
              {/* TABLE HEADER MATCHING GAMBAR 1 */}
              <thead>
                <tr className="bg-[#0b1b3d] text-white text-[11px] border-b-2 border-slate-800">
                  <th className="py-2.5 px-2 w-14 text-center font-black border-r border-slate-700 bg-[#08142c]">
                    #
                  </th>
                  {visualColumns.map((col) => {
                    const count = columnCounts[col.code] || 0;
                    return (
                      <th 
                        key={col.code}
                        className="py-2 px-2 text-center border-r border-slate-700 min-w-[120px] font-bold"
                      >
                        <div className="font-extrabold text-xs tracking-wider text-amber-300">
                          {col.label} ({count})
                        </div>
                        <div className="text-[10px] text-slate-300 font-medium truncate uppercase">
                          {col.subLabel}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>

              {/* TABLE BODY (VOUCHER ROWS) */}
              <tbody className="divide-y divide-slate-300 text-xs">
                {paginatedVouchers.length === 0 ? (
                  <tr>
                    <td 
                      colSpan={visualColumns.length + 1} 
                      className="py-12 text-center text-slate-400 font-semibold bg-slate-50"
                    >
                      Tidak ada voucher yang sesuai dengan kriteria filter saat ini.
                    </td>
                  </tr>
                ) : (
                  paginatedVouchers.map((voucher, rowIdx) => {
                    // Global row number matching Gambar 1 (e.g. Row 57..67 on Hal 5/6)
                    const absoluteRowNumber = (effectiveCurrentPage - 1) * itemsPerPage + rowIdx + 1;

                    return (
                      <tr 
                        key={voucher.voucherNo}
                        className="hover:bg-slate-50/80 transition-colors h-20"
                      >
                        {/* Column #: Row Number (e.g. 57, 58, 59...) */}
                        <td className="text-center font-bold text-slate-700 bg-slate-100/70 border-r border-slate-300 px-1 py-1">
                          {absoluteRowNumber}
                        </td>

                        {/* Process columns */}
                        {visualColumns.map((col) => {
                          const isActualStage = voucher.actualStage === col.code;
                          const isPlannedStage = voucher.plannedStage === col.code;

                          // If this cell is the actual stage where voucher is currently located
                          if (isActualStage) {
                            // Determine color styling based on condition: OVERDUE, ON PLAN, ON TRACK
                            let cardBg = 'bg-[#fef08a] border-[#eab308] text-slate-950'; // default yellow matching Gambar 1
                            let badgeStyle = 'bg-amber-200 text-amber-900 border-amber-400';

                            if (voucher.condition === 'OVERDUE') {
                              cardBg = 'bg-[#ffe4e6] border-[#f43f5e] text-rose-950 shadow-xs ring-1 ring-rose-400';
                              badgeStyle = 'bg-rose-600 text-white font-black';
                            } else if (voucher.condition === 'ON PLAN') {
                              cardBg = 'bg-[#dcfce7] border-[#22c55e] text-emerald-950';
                              badgeStyle = 'bg-emerald-600 text-white font-black';
                            } else if (voucher.condition === 'ON TRACK') {
                              cardBg = 'bg-[#e0f2fe] border-[#0284c7] text-blue-950';
                              badgeStyle = 'bg-blue-600 text-white font-black';
                            }

                            return (
                              <td 
                                key={col.code}
                                className="p-1 border-r border-slate-300 align-middle bg-slate-50/30"
                              >
                                <div 
                                  onClick={() => setSelectedVoucherModal(voucher)}
                                  className={`rounded-lg border-2 p-1.5 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md text-center flex flex-col justify-between min-h-[68px] ${cardBg}`}
                                  title={`Klik untuk melihat detail perbandingan Plan vs Real voucher ${voucher.voucherNo}`}
                                >
                                  {/* Line 1: Voucher Number & Condition Badge */}
                                  <div className="flex items-center justify-between gap-1">
                                    <span className="font-black text-[11px] tracking-wide truncate">
                                      {voucher.voucherNo}
                                    </span>
                                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-extrabold uppercase shrink-0 ${badgeStyle}`}>
                                      {voucher.condition === 'OVERDUE' ? 'OVERDUE' : voucher.condition}
                                    </span>
                                  </div>

                                  {/* Line 2: Qty / Biji & Gram (matches "(40)" in Gambar 1) */}
                                  <div className="my-0.5">
                                    <span className="font-extrabold text-xs">
                                      ({voucher.realBiji || voucher.biji})
                                    </span>
                                    <span className="text-[10px] text-slate-600 ml-1">
                                      {voucher.realBeratGr || voucher.beratTotalGr}g
                                    </span>
                                  </div>

                                  {/* Line 3: Plan vs Real info */}
                                  {voucher.condition === 'OVERDUE' ? (
                                    <div className="text-[9px] font-bold text-rose-700 bg-rose-100/80 rounded px-1 py-0.2 truncate">
                                      Plan: {voucher.plannedStage} ({voucher.delayText})
                                    </div>
                                  ) : (
                                    <div className="text-[9px] text-slate-600 truncate">
                                      Plan: {voucher.plannedStage} • Tepat
                                    </div>
                                  )}

                                  {/* Line 4: Entry Date & Time (matches "03-10 11:39" in Gambar 1) */}
                                  <div className="text-[9px] font-semibold text-slate-500 mt-0.5 flex justify-between items-center">
                                    <span>{voucher.entryDate}</span>
                                    <span className="text-[8px] bg-black/10 px-1 rounded">{voucher.machine}</span>
                                  </div>
                                </div>
                              </td>
                            );
                          }

                          // If this cell is the PLANNED stage but actual is delayed (Ghost Target Indicator)
                          if (isPlannedStage && voucher.condition === 'OVERDUE') {
                            return (
                              <td 
                                key={col.code}
                                className="p-1 border-r border-slate-300 align-middle bg-rose-50/20"
                              >
                                <div 
                                  onClick={() => setSelectedVoucherModal(voucher)}
                                  className="border border-dashed border-rose-300 bg-white/70 rounded-lg p-1 text-center cursor-pointer hover:bg-rose-50 transition-colors"
                                  title={`Target Rencana: ${voucher.voucherNo} seharusnya berada di tahap ini!`}
                                >
                                  <span className="text-[9px] font-extrabold text-rose-600 block">
                                    🎯 Target: {voucher.voucherNo}
                                  </span>
                                  <span className="text-[8px] text-slate-500 block truncate">
                                    Tertinggal di {voucher.actualStage}
                                  </span>
                                </div>
                              </td>
                            );
                          }

                          // Empty cell on this process
                          return (
                            <td 
                              key={col.code}
                              className="border-r border-slate-300 bg-white"
                            ></td>
                          );
                        })}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* TABLE FOOTER & PAGINATION BAR (HAL 5/6) */}
          <div className="bg-slate-100 border-t border-slate-300 px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="text-xs text-slate-600 font-semibold">
              Menampilkan {paginatedVouchers.length} dari {filteredVouchers.length} voucher (Halaman {effectiveCurrentPage} dari {totalPages})
            </div>

            <div className="flex items-center space-x-1 text-xs">
              <button
                disabled={effectiveCurrentPage <= 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-bold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5 inline mr-1" />
                Sebelumnya
              </button>

              {/* Page Number Buttons */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 rounded-lg font-bold text-xs transition-colors ${
                    pageNum === effectiveCurrentPage
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              <button
                disabled={effectiveCurrentPage >= totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-bold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
              >
                Selanjutnya
                <ChevronRight className="w-3.5 h-3.5 inline ml-1" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* MODE 2: DETAILED TABULAR PLAN VS REAL REPORT */
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-black border-b border-slate-200 text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-3 w-12 text-center">#</th>
                  <th className="py-3 px-3">No. Voucher & Model</th>
                  <th className="py-3 px-3">Jalur & Unit</th>
                  <th className="py-3 px-3">Posisi Rencana (Plan)</th>
                  <th className="py-3 px-3">Posisi Lapangan (Real)</th>
                  <th className="py-3 px-3">Kondisi Status</th>
                  <th className="py-3 px-3">Deviasi Lead Time</th>
                  <th className="py-3 px-3">PIC / Mesin</th>
                  <th className="py-3 px-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {paginatedVouchers.map((v, idx) => {
                  const absoluteRow = (effectiveCurrentPage - 1) * itemsPerPage + idx + 1;
                  
                  // Status badge styling
                  let statusBadge = (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-700 border border-blue-300 inline-flex items-center space-x-1">
                      <Activity className="w-3 h-3 mr-1" />
                      ON TRACK
                    </span>
                  );
                  if (v.condition === 'OVERDUE') {
                    statusBadge = (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-700 border border-rose-300 inline-flex items-center space-x-1 animate-pulse">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        OVERDUE
                      </span>
                    );
                  } else if (v.condition === 'ON PLAN') {
                    statusBadge = (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-700 border border-emerald-300 inline-flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        ON PLAN
                      </span>
                    );
                  }

                  return (
                    <tr 
                      key={v.voucherNo}
                      className={`hover:bg-slate-50 transition-colors ${
                        v.condition === 'OVERDUE' ? 'bg-rose-50/20' : ''
                      }`}
                    >
                      <td className="py-3 px-3 text-center font-bold text-slate-500">
                        {absoluteRow}
                      </td>

                      {/* No Voucher & Model */}
                      <td className="py-3 px-3">
                        <div className="font-black text-slate-900 tracking-wide">
                          {v.voucherNo}
                        </div>
                        <div className="text-[11px] text-slate-600 font-semibold truncate max-w-xs">
                          {v.modelCode} - {v.modelName}
                        </div>
                      </td>

                      {/* Jalur & Unit */}
                      <td className="py-3 px-3">
                        <div className="flex items-center space-x-1 font-semibold text-slate-800">
                          <span>{v.realBiji || v.biji} bj</span>
                          <span className="text-slate-400">/</span>
                          <span>{v.realBeratGr || v.beratTotalGr}g</span>
                        </div>
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                          v.materialType === 'Lilin' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-800'
                        }`}>
                          {v.materialType}
                        </span>
                      </td>

                      {/* Posisi Plan */}
                      <td className="py-3 px-3">
                        <div className="font-bold text-indigo-700">
                          Tahap {v.plannedStage}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Target Selesai: {v.plannedFinishHours || '-'}
                        </div>
                      </td>

                      {/* Posisi Real */}
                      <td className="py-3 px-3">
                        <div className="font-bold text-blue-700">
                          Tahap {v.actualStage}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Masuk: {v.entryDate}
                        </div>
                      </td>

                      {/* Kondisi Status */}
                      <td className="py-3 px-3">
                        {statusBadge}
                      </td>

                      {/* Deviasi Waktu */}
                      <td className="py-3 px-3">
                        <div className={`font-bold ${
                          v.condition === 'OVERDUE' ? 'text-rose-600' : 'text-slate-700'
                        }`}>
                          {v.delayText || 'Tepat Waktu'}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[180px]">
                          {v.reason || '-'}
                        </div>
                      </td>

                      {/* PIC / Mesin */}
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-800">
                          {v.machine || '-'}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">
                          {v.operator || '-'}
                        </div>
                      </td>

                      {/* Aksi */}
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => setSelectedVoucherModal(v)}
                          className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-bold text-[11px] border border-blue-200 transition-colors"
                        >
                          Lihat Detail
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table pagination */}
          <div className="bg-slate-50 border-t border-slate-200 px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
            <span className="text-slate-600 font-semibold">
              Menampilkan {paginatedVouchers.length} dari {filteredVouchers.length} voucher (Halaman {effectiveCurrentPage} dari {totalPages})
            </span>
            <div className="flex items-center space-x-1">
              <button
                disabled={effectiveCurrentPage <= 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="px-2.5 py-1 bg-white border border-slate-300 rounded font-bold disabled:opacity-40"
              >
                Prev
              </button>
              <span className="px-2 font-bold text-slate-700">
                {effectiveCurrentPage} / {totalPages}
              </span>
              <button
                disabled={effectiveCurrentPage >= totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="px-2.5 py-1 bg-white border border-slate-300 rounded font-bold disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>

        </div>
      )}

      {/* 5. LEGEND & PANDUAN PENGGUNA */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center">
          <Info className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
          Keterangan Warna & Panduan Laporan Plan vs Real
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="flex items-start space-x-2.5 p-2.5 rounded-lg bg-rose-50/70 border border-rose-200">
            <span className="w-3 h-3 rounded-full bg-rose-500 mt-0.5 shrink-0"></span>
            <div>
              <span className="font-bold text-rose-900 block">Kategori OVERDUE (Merah)</span>
              <p className="text-[11px] text-rose-700 mt-0.5">
                Voucher tertinggal di belakang jadwal rencana (posisi fisik tertinggal dari target jam shift atau lead time subproses terlampaui).
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-2.5 p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200">
            <span className="w-3 h-3 rounded-full bg-emerald-500 mt-0.5 shrink-0"></span>
            <div>
              <span className="font-bold text-emerald-900 block">Kategori ON PLAN (Hijau)</span>
              <p className="text-[11px] text-emerald-700 mt-0.5">
                Voucher berada tepat di tahapan yang dijadwalkan pada jam berjalan, durasi kerja tepat memenuhi target rencana.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-2.5 p-2.5 rounded-lg bg-blue-50/70 border border-blue-200">
            <span className="w-3 h-3 rounded-full bg-blue-500 mt-0.5 shrink-0"></span>
            <div>
              <span className="font-bold text-blue-900 block">Kategori ON TRACK (Biru)</span>
              <p className="text-[11px] text-blue-700 mt-0.5">
                Voucher sedang aktif dikerjakan dalam toleransi jalur produksi normal dan diproyeksikan selesai tepat waktu.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 6. DRILL-DOWN MODAL FOR VOUCHER */}
      <DetailVoucherPlanRealModal
        isOpen={Boolean(selectedVoucherModal)}
        onClose={() => setSelectedVoucherModal(null)}
        voucher={selectedVoucherModal}
      />

    </div>
  );
}
