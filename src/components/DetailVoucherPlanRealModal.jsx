import React from 'react';
import { 
  X, 
  Layers, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Activity, 
  Cpu, 
  User, 
  Scale, 
  Calendar, 
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Printer
} from 'lucide-react';
import { LILIN_PROCESSES, TIMAH_PROCESSES } from '../data/initialData';

export default function DetailVoucherPlanRealModal({
  isOpen,
  onClose,
  voucher
}) {
  if (!isOpen || !voucher) return null;

  const isLilin = voucher.materialType === 'Lilin';
  const processList = isLilin ? LILIN_PROCESSES : TIMAH_PROCESSES;

  // Find step index of actual stage & planned stage
  const actualIndex = processList.findIndex(p => p.code === voucher.actualStage);
  const plannedIndex = processList.findIndex(p => p.code === voucher.plannedStage);

  // Status styling colors: Strictly Green (Terealisasi) and Yellow (Sedang Di-Schedule)
  const isRealized = voucher.indicatorColor === 'green' || voucher.status === 'REALIZED';
  const isPastTarget = voucher.scheduleState === 'PAST_TARGET' || voucher.isPastTarget || (voucher.delayHours && voucher.delayHours > 0);

  const currentTheme = isRealized
    ? {
        badge: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold',
        border: 'border-emerald-500',
        headerBg: 'from-emerald-800 to-teal-800',
        icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
        statusTitle: '🟢 Terealisasi (Selesai)'
      }
    : {
        badge: 'bg-amber-100 text-amber-900 border-amber-300 font-bold',
        border: 'border-amber-500',
        headerBg: 'from-[#b45309] to-[#d97706]',
        icon: <Clock className="w-4 h-4 text-amber-300" />,
        statusTitle: isPastTarget ? '🟡 Sedang Di-Schedule (Melewati Target Planning)' : '🟡 Sedang Di-Schedule (Dalam Target)'
      };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* MODAL HEADER */}
        <div className={`bg-gradient-to-r ${currentTheme.headerBg} text-white p-4 sm:p-5 flex items-center justify-between shrink-0`}>
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center font-bold">
              <Layers className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-md text-xs font-black tracking-wider shadow-xs">
                  {voucher.voucherNo}
                </span>
                <span className="text-white font-bold text-sm">
                  {voucher.modelCode}
                </span>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${currentTheme.badge}`}>
                  {currentTheme.statusTitle}
                </span>
                <span className="text-[10px] font-semibold bg-white/20 text-white px-2 py-0.5 rounded-full">
                  Jalur {voucher.materialType}
                </span>
              </div>
              <p className="text-xs text-blue-100 mt-1">
                {voucher.modelName || 'Perhiasan Electroforming'} | Masuk: <strong className="text-white">{voucher.entryDate}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => window.print()}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title="Cetak Detail"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* MODAL BODY (SCROLLABLE) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar text-xs">
          
          {/* SUMMARY CARDS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/70">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                Perbandingan Qty
              </span>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-base font-black text-slate-800">{voucher.realBiji || voucher.biji} bj</span>
                <span className="text-[11px] text-slate-400">/ Plan {voucher.planBiji || voucher.biji} bj</span>
              </div>
              <p className="text-[10px] text-emerald-600 font-bold mt-1">✓ 100% Terpenuhi</p>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/70">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                Perbandingan Berat
              </span>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-base font-black text-slate-800">{voucher.realBeratGr || voucher.beratTotalGr} g</span>
                <span className="text-[11px] text-slate-400">/ Plan {voucher.planBeratGr || voucher.beratTotalGr} g</span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium mt-1">Toleransi susut wajar</p>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/70">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                Posisi: Plan vs Real
              </span>
              <div className="flex items-center space-x-1 font-bold text-slate-800">
                <span className="text-amber-800">{voucher.actualStage} (Real)</span>
                <ArrowRight className="w-3 h-3 text-slate-400" />
                <span className="text-blue-800">{voucher.plannedStage} (Plan)</span>
              </div>
              <p className={`text-[10px] font-bold mt-1 ${isRealized ? 'text-emerald-700' : (isPastTarget ? 'text-amber-700' : 'text-slate-600')}`}>
                {isRealized ? 'Selesai Sesuai Rencana' : (isPastTarget ? 'Melewati Target Planning' : 'Dalam Target Rencana')}
              </p>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/70">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                Deviasi Waktu
              </span>
              <div className="text-base font-black text-slate-800">
                {voucher.timingText || voucher.delayText || 'Tepat Waktu'}
              </div>
              <p className="text-[10px] text-slate-500 truncate mt-1">
                PIC: {voucher.operator || 'Operator Tim'}
              </p>
            </div>
          </div>

          {/* CATATAN KONDISI LAPANGAN */}
          {voucher.reason && (
            <div className={`p-3.5 rounded-xl border ${
              isRealized ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950' : 'bg-amber-50/70 border-amber-200 text-amber-950'
            }`}>
              <div className="flex items-center space-x-2 font-bold mb-1">
                {currentTheme.icon}
                <span>Status & Analisis Kondisi di Lapangan:</span>
              </div>
              <p className="text-xs leading-relaxed">
                {voucher.reason}. Mesin: <strong>{voucher.machine || '-'}</strong> • Operator: <strong>{voucher.operator || '-'}</strong>.
              </p>
            </div>
          )}

          {/* STEP BY STEP PIPELINE COMPARISON */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-slate-800 text-sm tracking-wide">
                Perbandingan Tahapan Subproses ({processList.length} Tahap)
              </h4>
              <span className="text-[11px] text-slate-500">
                Tahap {actualIndex + 1} dari {processList.length} Aktif di Lapangan
              </span>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 font-bold text-[11px] border-b border-slate-200">
                    <th className="py-2.5 px-3 w-12 text-center">#</th>
                    <th className="py-2.5 px-3">Subproses</th>
                    <th className="py-2.5 px-3">Jadwal Rencana (Plan)</th>
                    <th className="py-2.5 px-3">Realisasi Lapangan (Real)</th>
                    <th className="py-2.5 px-3">Mesin / Operator</th>
                    <th className="py-2.5 px-3 text-center">Status Tahap</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {processList.map((proc, idx) => {
                    const isPassed = idx < actualIndex;
                    const isCurrent = idx === actualIndex;
                    const isTargetPlan = idx === plannedIndex;
                    const isFuture = idx > actualIndex;

                    let stepStatus = 'Belum Dimulai';
                    let stepStatusColor = 'bg-slate-100 text-slate-500';

                    if (isPassed) {
                      stepStatus = 'Selesai';
                      stepStatusColor = 'bg-emerald-100 text-emerald-800 font-bold';
                    } else if (isCurrent) {
                      if (isRealized) {
                        stepStatus = 'Terealisasi';
                        stepStatusColor = 'bg-emerald-100 text-emerald-800 font-black border border-emerald-300';
                      } else if (isPastTarget) {
                        stepStatus = 'Melewati Target';
                        stepStatusColor = 'bg-amber-100 text-amber-900 font-bold border border-amber-300';
                      } else {
                        stepStatus = 'Sedang Di-Schedule';
                        stepStatusColor = 'bg-amber-100 text-amber-900 font-bold border border-amber-300';
                      }
                    } else if (isTargetPlan && isFuture) {
                      stepStatus = 'Target Planning';
                      stepStatusColor = 'bg-blue-50 text-blue-800 font-bold border border-blue-200 border-dashed';
                    }

                    return (
                      <tr 
                        key={proc.code} 
                        className={`transition-colors ${
                          isCurrent 
                            ? 'bg-amber-50/50 font-semibold' 
                            : isPassed 
                              ? 'bg-white' 
                              : 'bg-slate-50/30 text-slate-400'
                        }`}
                      >
                        <td className="py-2.5 px-3 text-center font-bold text-slate-500">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center space-x-1.5">
                            <span className="font-black text-slate-800">{proc.code}</span>
                            <span className="text-slate-600">- {proc.name}</span>
                          </div>
                          <span className="text-[10px] text-slate-400">
                            Lead Time Standar: {proc.leadtimeDisplay || `${proc.defaultLeadTimeMinutes || 60} Mnt`}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="text-slate-700">
                            Target: {proc.defaultLeadTimeHours || 1.0} Jam
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Estimasi Selesai Sesuai Shift
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          {isPassed ? (
                            <div className="text-emerald-700 font-bold">
                              ✓ Selesai dicatat di sistem
                            </div>
                          ) : isCurrent ? (
                            <div className={voucher.condition === 'OVERDUE' ? 'text-rose-700 font-bold' : 'text-blue-700 font-bold'}>
                              Masuk: {voucher.entryDate}
                            </div>
                          ) : (
                            <div className="text-slate-400">- Menunggu giliran -</div>
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          {isCurrent ? (
                            <div>
                              <span className="font-bold text-slate-800">{voucher.machine}</span>
                              <span className="text-slate-500 block text-[10px]">{voucher.operator}</span>
                            </div>
                          ) : isPassed ? (
                            <span className="text-slate-600 font-semibold">{proc.machines?.[0]?.name || 'Stasiun Produksi'}</span>
                          ) : (
                            <span className="text-slate-400">{proc.machines?.[0]?.name || '-'}</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] inline-block ${stepStatusColor}`}>
                            {stepStatus}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* MODAL FOOTER */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 flex justify-between items-center shrink-0">
          <div className="text-[11px] text-slate-500">
            UBS Gold Real-time Schedule Tracker • Sinkronisasi Shift & Subproses
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl shadow-xs transition-colors"
          >
            Tutup Rincian
          </button>
        </div>

      </div>
    </div>
  );
}
