import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  Layers, 
  Clock, 
  CheckCircle2, 
  Filter, 
  Search, 
  Download, 
  Printer, 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight, 
  Table, 
  Grid3X3, 
  Info,
  ArrowRight
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
  // View mode: 'visual-matrix' (Board visual) or 'detailed-table' (Formal report)
  const [viewMode, setViewModeState] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('view') || 'visual-matrix';
  });

  const setViewMode = (mode) => {
    setViewModeState(mode);
    try {
      const url = new URL(window.location);
      url.searchParams.set('view', mode);
      window.history.replaceState({}, '', url);
    } catch (e) {}
  };

  // Pipeline tab filter: 'Lilin' (default) | 'Timah' | 'ALL'
  const [selectedPipeline, setSelectedPipeline] = useState('Lilin');

  // Status indicator filter: 'ALL' | 'REALIZED' (Hijau) | 'SCHEDULED' (Kuning) | 'PAST_TARGET' (Kuning Melewati Target)
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Search keyword
  const [searchQuery, setSearchQuery] = useState('');

  // Process specific filter
  const [processFilter, setProcessFilter] = useState('ALL');

  // Selected voucher for drilldown detail modal
  const [selectedVoucherModal, setSelectedVoucherModal] = useState(null);

  // Pagination state (default page 5 to match initial board view)
  const [currentPage, setCurrentPage] = useState(5);
  const [itemsPerPage, setItemsPerPage] = useState(15);

  // Auto-refresh timer state
  const [lastUpdateTime, setLastUpdateTime] = useState(() => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load baseline vouchers
  const [vouchersData, setVouchersData] = useState(() => getCompleteFactoryVouchers());

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      const d = new Date();
      setLastUpdateTime(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`);
      setVouchersData(getCompleteFactoryVouchers());
      setIsRefreshing(false);
    }, 350);
  };

  // Filter vouchers based on pipeline, 2 status indicators (Green & Yellow), process, search
  const filteredVouchers = useMemo(() => {
    return vouchersData.filter(v => {
      // 1. Pipeline filter
      if (selectedPipeline !== 'ALL' && v.materialType !== selectedPipeline) {
        return false;
      }
      
      // 2. Status filter: Hijau vs Kuning vs Kuning Melewati Target
      const isGreen = v.indicatorColor === 'green' || v.status === 'REALIZED';
      if (statusFilter === 'REALIZED' && !isGreen) {
        return false;
      }
      if (statusFilter === 'SCHEDULED' && isGreen) {
        return false;
      }
      if (statusFilter === 'PAST_TARGET' && (isGreen || !v.isPastTarget)) {
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
    return LILIN_VISUAL_COLUMNS;
  }, [selectedPipeline]);

  // Count vouchers in each visual column for header badges: CEL (32), SOL (41), etc.
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
      
      {/* 1. TOP HEADER BANNER (CLEAN & MINIMALIST) */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-100">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                  Laporan Plan vs Real
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-700 border border-slate-200">
                  {selectedPipeline === 'ALL' ? 'Semua Jalur' : `Jalur ${selectedPipeline}`}
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                <span>Tanggal: <strong className="text-slate-700">{sysInfo?.currentDateStr || 'Rabu, 07 Okt 2026'}</strong></span>
                <span>•</span>
                <span>Update: <strong className="text-slate-700 font-mono">{lastUpdateTime} WIB</strong></span>
                <span>•</span>
                <span>Total: <strong className="text-slate-700">{filteredVouchers.length} Voucher</strong></span>
                <span>•</span>
                <span>Hal {effectiveCurrentPage}/{totalPages}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={handleManualRefresh}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 shadow-2xs transition-colors cursor-pointer"
              title="Perbarui Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={() => exportToCSV(filteredVouchers)}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-2xs transition-colors cursor-pointer"
              title="Export Laporan ke Excel CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export Excel</span>
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold shadow-2xs transition-colors cursor-pointer"
              title="Cetak Laporan"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cetak</span>
            </button>
          </div>

        </div>
      </div>

      {/* 2. RINGKASAN INDIKATOR (HANYA HIJAU & KUNING - MINIMALIST 3 KARTU) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        
        {/* Total Voucher Dipantau */}
        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Voucher</span>
            <span className="p-1.5 bg-slate-100 text-slate-600 rounded-lg">
              <Layers className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-slate-900">{metrics.total}</span>
            <span className="text-xs text-slate-400 font-medium">Voucher</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1.5 flex justify-between">
            <span>{metrics.totalRealBiji} biji diproses</span>
            <span>{metrics.totalRealBerat} gr total</span>
          </div>
        </div>

        {/* INDIKATOR 1 (HIJAU): SUDAH TEREALISASI */}
        <div 
          onClick={() => setStatusFilter(statusFilter === 'REALIZED' ? 'ALL' : 'REALIZED')}
          className={`bg-white rounded-xl border p-3.5 shadow-2xs cursor-pointer transition-all hover:border-emerald-400 ${
            statusFilter === 'REALIZED' ? 'ring-2 ring-emerald-500 border-emerald-500 bg-emerald-50/20' : 'border-slate-200'
          }`}
          title="Klik untuk memfilter voucher yang sudah terealisasi"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider flex items-center">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5"></span>
              Terealisasi (Hijau)
            </span>
            <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-emerald-700">{metrics.realizedCount}</span>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-full">
              {metrics.realizedPercent}% Selesai
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5 truncate">
            Selesai sesuai target planning
          </p>
        </div>

        {/* INDIKATOR 2 (KUNING): SEDANG DI-SCHEDULE */}
        <div 
          onClick={() => setStatusFilter(statusFilter === 'SCHEDULED' ? 'ALL' : 'SCHEDULED')}
          className={`bg-white rounded-xl border p-3.5 shadow-2xs cursor-pointer transition-all hover:border-amber-400 ${
            statusFilter === 'SCHEDULED' ? 'ring-2 ring-amber-500 border-amber-500 bg-amber-50/20' : 'border-slate-200'
          }`}
          title="Klik untuk memfilter voucher yang sedang di-schedule"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider flex items-center">
              <span className="w-2 h-2 rounded-full bg-amber-500 mr-1.5"></span>
              Sedang Di-Schedule (Kuning)
            </span>
            <span className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-amber-700">{metrics.scheduledCount}</span>
            <span className="text-xs font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full">
              {metrics.scheduledPercent}% Aktif
            </span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1.5 flex items-center justify-between">
            <span className="text-slate-600 font-medium">{metrics.onTargetCount} Dalam Target</span>
            <span className="text-amber-800 font-bold">{metrics.pastTargetCount} Lewat Target</span>
          </div>
        </div>

      </div>

      {/* 3. CONTROL & FILTER BAR (MINIMALIST & CLEAN) */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs space-y-3">
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Jalur & View Switcher */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            
            {/* Jalur Selector */}
            <div className="bg-slate-100 p-1 rounded-xl flex items-center space-x-1 border border-slate-200 text-xs">
              <button
                onClick={() => { setSelectedPipeline('Lilin'); setCurrentPage(5); }}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  selectedPipeline === 'Lilin'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Jalur Lilin
              </button>
              <button
                onClick={() => { setSelectedPipeline('Timah'); setCurrentPage(1); }}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  selectedPipeline === 'Timah'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Jalur Timah
              </button>
              <button
                onClick={() => setSelectedPipeline('ALL')}
                className={`px-2.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
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
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  viewMode === 'visual-matrix'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Tampilan Matriks Alur Visual"
              >
                <Grid3X3 className="w-3.5 h-3.5 text-blue-600" />
                <span>Matriks Visual</span>
              </button>
              <button
                onClick={() => setViewMode('detailed-table')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  viewMode === 'detailed-table'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Tabel Laporan Analisis Rinci"
              >
                <Table className="w-3.5 h-3.5 text-blue-600" />
                <span>Tabel Rinci</span>
              </button>
            </div>

          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari no voucher, model, mesin..."
              className="w-full pl-9 pr-8 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
              >
                ×
              </button>
            )}
          </div>

        </div>

        {/* Status Filter Pills: HANYA KUNING & HIJAU */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
          
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 flex items-center">
              <Filter className="w-3 h-3 mr-1" />
              Filter Status:
            </span>
            
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                statusFilter === 'ALL'
                  ? 'bg-slate-800 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Semua ({vouchersData.length})
            </button>

            {/* 🟢 HIJAU: Terealisasi */}
            <button
              onClick={() => setStatusFilter('REALIZED')}
              className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors flex items-center space-x-1 cursor-pointer ${
                statusFilter === 'REALIZED'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
              <span>🟢 Terealisasi ({metrics.realizedCount})</span>
            </button>

            {/* 🟡 KUNING: Sedang Di-Schedule */}
            <button
              onClick={() => setStatusFilter('SCHEDULED')}
              className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors flex items-center space-x-1 cursor-pointer ${
                statusFilter === 'SCHEDULED'
                  ? 'bg-amber-500 text-slate-950 border-amber-500 font-extrabold shadow-2xs'
                  : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
              <span>🟡 Sedang Di-Schedule ({metrics.scheduledCount})</span>
            </button>

            {/* Sub-filter Kuning: Melewati Target Planning */}
            <button
              onClick={() => setStatusFilter(statusFilter === 'PAST_TARGET' ? 'ALL' : 'PAST_TARGET')}
              className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors flex items-center space-x-1 cursor-pointer ${
                statusFilter === 'PAST_TARGET'
                  ? 'bg-amber-600 text-white border-amber-600 font-bold shadow-2xs'
                  : 'bg-white text-amber-900 border-amber-200 hover:bg-amber-50'
              }`}
              title="Voucher sedang di-schedule yang waktu targetnya telah lewat"
            >
              <span>⚠️ Melewati Target Planning ({metrics.pastTargetCount})</span>
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
              className="bg-slate-50 border border-slate-200 rounded px-2 py-0.5 text-xs font-semibold cursor-pointer"
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
        /* MODE 1: MATRIKS VISUAL (CLEAN & TO THE POINT) */
        <div className="bg-white border border-slate-300 rounded-xl overflow-hidden shadow-xs">
          
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full border-collapse select-none min-w-[1100px]">
              
              {/* TABLE HEADER */}
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
                        className="py-2 px-2 text-center border-r border-slate-700 min-w-[136px] font-bold"
                        title={col.name}
                      >
                        <div className="font-extrabold text-xs tracking-wider text-amber-300">
                          {col.label} ({count})
                        </div>
                        <div className="text-[10px] text-slate-300 font-medium truncate">
                          {col.subLabel}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>

              {/* TABLE BODY (VOUCHER ROWS) */}
              <tbody className="divide-y divide-slate-200 text-xs">
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
                    const absoluteRowNumber = (effectiveCurrentPage - 1) * itemsPerPage + rowIdx + 1;
                    const isGreen = voucher.indicatorColor === 'green' || voucher.status === 'REALIZED';

                    return (
                      <tr 
                        key={voucher.voucherNo}
                        className="hover:bg-slate-50/80 transition-colors h-20"
                      >
                        {/* Row Number */}
                        <td className="text-center font-bold text-slate-700 bg-slate-100/70 border-r border-slate-200 px-1 py-1">
                          {absoluteRowNumber}
                        </td>

                        {/* Process columns */}
                        {visualColumns.map((col) => {
                          const isActualStage = voucher.actualStage === col.code;

                          // If this cell is the actual stage where voucher is currently located
                          if (isActualStage) {
                            return (
                              <td 
                                key={col.code}
                                className="p-1 border-r border-slate-200 align-middle bg-slate-50/30"
                              >
                                <div 
                                  onClick={() => setSelectedVoucherModal(voucher)}
                                  className={`rounded-lg border-2 p-1.5 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md text-left flex flex-col justify-between min-h-[68px] ${
                                    isGreen
                                      ? 'bg-emerald-50 border-emerald-400 text-emerald-950'
                                      : 'bg-amber-50 border-amber-300 text-amber-950'
                                  }`}
                                  title={`Klik untuk melihat detail Plan vs Real voucher ${voucher.voucherNo}`}
                                >
                                  {/* Line 1: No Voucher + Badge Status */}
                                  <div className="flex items-center justify-between gap-1">
                                    <span className="font-black text-[10.5px] tracking-tight shrink-0 font-mono">
                                      {voucher.voucherNo}
                                    </span>
                                    <span className={`text-[8.5px] px-1 py-0.2 rounded font-black shrink-0 ${
                                      isGreen
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-amber-500 text-slate-950'
                                    }`}>
                                      {isGreen ? '🟢 Selesai' : '🟡 Di-Schedule'}
                                    </span>
                                  </div>

                                  {/* Line 2: Model & Qty */}
                                  <div className="my-0.5 flex items-center justify-between text-[10.5px]">
                                    <span className="font-semibold text-slate-600 truncate max-w-[65px]">
                                      {voucher.modelCode}
                                    </span>
                                    <span className="font-extrabold text-slate-900">
                                      ({voucher.realBiji || voucher.biji} bj • {voucher.realBeratGr || voucher.beratTotalGr}g)
                                    </span>
                                  </div>

                                  {/* Line 3: Kondisi Target Planning */}
                                  {isGreen ? (
                                    <div className="text-[9px] font-semibold text-emerald-700 truncate">
                                      ✓ Selesai Sesuai Planning
                                    </div>
                                  ) : voucher.isPastTarget ? (
                                    <div className="text-[9px] font-bold text-amber-900 bg-amber-200/90 rounded px-1 py-0.2 truncate border border-amber-300">
                                      Seharusnya di: {voucher.plannedStage} ({voucher.delayHours || 12}j lalu)
                                    </div>
                                  ) : (
                                    <div className="text-[9px] text-slate-600 truncate">
                                      Target: {voucher.plannedFinishHours || 'Hari Ini'}
                                    </div>
                                  )}

                                  {/* Line 4: Info Mesin & Tanggal */}
                                  <div className="text-[9px] font-semibold text-slate-500 mt-0.5 flex justify-between items-center">
                                    <span>{voucher.entryDate}</span>
                                    <span className="text-[8px] bg-black/5 px-1 rounded font-bold">{voucher.machine}</span>
                                  </div>

                                </div>
                              </td>
                            );
                          }

                          // Empty cell
                          return (
                            <td 
                              key={col.code}
                              className="border-r border-slate-200 bg-white"
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

          {/* TABLE FOOTER & PAGINATION */}
          <div className="bg-slate-50 border-t border-slate-200 px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="text-xs text-slate-600 font-semibold">
              Menampilkan {paginatedVouchers.length} dari {filteredVouchers.length} voucher (Halaman {effectiveCurrentPage} dari {totalPages})
            </div>

            <div className="flex items-center space-x-1 text-xs">
              <button
                disabled={effectiveCurrentPage <= 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-bold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5 inline mr-1" />
                Sebelumnya
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
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
                className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-bold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Selanjutnya
                <ChevronRight className="w-3.5 h-3.5 inline ml-1" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* MODE 2: TABEL LAPORAN ANALISIS RINCI (MINIMALIST & CLEAN) */
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-black border-b border-slate-200 text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-3 w-12 text-center">#</th>
                  <th className="py-3 px-3">No. Voucher & Model</th>
                  <th className="py-3 px-3">Qty & Berat</th>
                  <th className="py-3 px-3">Target Planning (Rencana)</th>
                  <th className="py-3 px-3">Posisi Real (Aktual)</th>
                  <th className="py-3 px-3">Indikator Status</th>
                  <th className="py-3 px-3">Kondisi Planning</th>
                  <th className="py-3 px-3">Mesin / Operator</th>
                  <th className="py-3 px-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {paginatedVouchers.map((v, idx) => {
                  const absoluteRow = (effectiveCurrentPage - 1) * itemsPerPage + idx + 1;
                  const isGreen = v.indicatorColor === 'green' || v.status === 'REALIZED';

                  return (
                    <tr 
                      key={v.voucherNo}
                      className={`hover:bg-slate-50 transition-colors ${
                        !isGreen && v.isPastTarget ? 'bg-amber-50/20' : ''
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
                        <div className="text-[11px] text-slate-600 truncate max-w-xs">
                          {v.modelCode} - {v.modelName}
                        </div>
                      </td>

                      {/* Qty & Berat */}
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-800">
                          {v.realBiji || v.biji} bj • {v.realBeratGr || v.beratTotalGr}g
                        </div>
                        <span className="text-[10px] text-slate-500">
                          Jalur {v.materialType}
                        </span>
                      </td>

                      {/* Target Planning */}
                      <td className="py-3 px-3">
                        <div className="font-bold text-blue-700">
                          Tahap {v.plannedStage}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Target: {v.plannedFinishHours || '-'}
                        </div>
                      </td>

                      {/* Posisi Real */}
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-800">
                          Tahap {v.actualStage}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Masuk: {v.entryDate}
                        </div>
                      </td>

                      {/* Indikator Status: Hijau atau Kuning */}
                      <td className="py-3 px-3">
                        {isGreen ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 inline-flex items-center space-x-1">
                            <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
                            Terealisasi
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-100 text-amber-900 border border-amber-300 inline-flex items-center space-x-1">
                            <Clock className="w-3 h-3 mr-1 text-amber-600" />
                            Di-Schedule
                          </span>
                        )}
                      </td>

                      {/* Kondisi Planning */}
                      <td className="py-3 px-3">
                        {isGreen ? (
                          <div className="font-bold text-emerald-700 text-xs">
                            Selesai Tepat Waktu
                          </div>
                        ) : v.isPastTarget ? (
                          <div>
                            <div className="font-bold text-amber-900 text-xs">
                              Seharusnya Selesai (Lewat {v.delayHours || 12} Jam)
                            </div>
                            <div className="text-[10px] text-slate-400 truncate max-w-[180px]">
                              {v.reason || 'Tertinggal dari target planning'}
                            </div>
                          </div>
                        ) : (
                          <div className="font-bold text-slate-700 text-xs">
                            Dalam Target Rencana
                          </div>
                        )}
                      </td>

                      {/* Mesin & Operator */}
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
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-bold text-[11px] border border-slate-200 transition-colors cursor-pointer"
                        >
                          Detail
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
                className="px-2.5 py-1 bg-white border border-slate-300 rounded font-bold disabled:opacity-40 cursor-pointer"
              >
                Prev
              </button>
              <span className="px-2 font-bold text-slate-700">
                {effectiveCurrentPage} / {totalPages}
              </span>
              <button
                disabled={effectiveCurrentPage >= totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="px-2.5 py-1 bg-white border border-slate-300 rounded font-bold disabled:opacity-40 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>

        </div>
      )}

      {/* 5. PANDUAN PENGGUNA (TO THE POINT: HIJAU VS KUNING & TARGET PLANNING) */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5 flex items-center">
          <Info className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
          Panduan Membaca Laporan Plan vs Real (Indikator Hijau & Kuning)
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          
          {/* Kolom 1: Dua Indikator Warna Utama */}
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
            <span className="font-extrabold text-slate-800 block">
              1. Dua Indikator Warna Utama
            </span>
            <div className="flex items-start space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1 shrink-0"></span>
              <div>
                <strong className="text-emerald-800">🟢 Hijau (Terealisasi):</strong>
                <p className="text-[11px] text-slate-600">
                  Proyek / voucher sudah selesai diproduksi sesuai rencana atau target subproses telah terpenuhi 100%.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 mt-1 shrink-0"></span>
              <div>
                <strong className="text-amber-800">🟡 Kuning (Sedang Di-Schedule):</strong>
                <p className="text-[11px] text-slate-600">
                  Proyek / voucher masih aktif berjalan di lini produksi atau dalam antrean jadwal mesin.
                </p>
              </div>
            </div>
          </div>

          {/* Kolom 2: Mengetahui Yang Seharusnya Selesai vs Planning */}
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
            <span className="font-extrabold text-slate-800 block">
              2. Cara Mengetahui Voucher yang Seharusnya Selesai vs Planning
            </span>
            <p className="text-[11px] text-slate-600">
              Pada voucher berwarna 🟡 <strong>Kuning (Di-Schedule)</strong>, sistem membedakan kondisi planning secara otomatis:
            </p>
            <ul className="text-[11px] text-slate-600 space-y-1 list-disc list-inside">
              <li>
                <strong>Dalam Target:</strong> Waktu pengerjaan masih dalam estimasi jadwal rencana.
              </li>
              <li>
                <strong className="text-amber-900">Seharusnya Selesai:</strong> Target jam planning sudah terlewati namun voucher masih belum selesai. Tampil selisih waktu (misal: <em>Lewat 24 Jam</em>) dan tahap yang seharusnya sudah dicapai.
              </li>
            </ul>
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
