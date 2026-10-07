import React, { useState } from 'react';
import { 
  X, 
  Layers, 
  Calendar, 
  Clock, 
  Cpu, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Lock, 
  Unlock, 
  RotateCcw,
  Sparkles,
  Flame,
  Droplets,
  Zap,
  Play,
  Trash2
} from 'lucide-react';
import { formatTimelineHour, SETUP_BUFFER_HOURS, cascadeOrderSteps } from '../utils/pipelineUtils';

export default function OrderPipelineModal({
  isOpen,
  onClose,
  voucherNo,
  allScheduleBlocks,
  onUpdateBlocks,
  onDeleteSO,
  baseDate = new Date('2026-10-06T00:00:00')
}) {
  if (!isOpen || !voucherNo) return null;

  // Find all blocks belonging to this voucher
  const orderBlocks = allScheduleBlocks
    .filter(b => b.voucherNo === voucherNo)
    .sort((a, b) => (a.stepNumber || 0) - (b.stepNumber || 0));

  const sampleBlock = orderBlocks[0] || {};
  const isLilin = sampleBlock.materialType === 'Lilin';
  const totalSteps = sampleBlock.totalSteps || (isLilin ? 12 : 14);

  // New start hour input for shifting the entire order
  const [newStartHour, setNewStartHour] = useState(orderBlocks[0]?.startHour || 7.0);

  // Apply shift to the entire order (forward or backward with collision ripple)
  const handleShiftEntireOrder = () => {
    if (!orderBlocks[0]) return;
    const updated = cascadeOrderSteps(allScheduleBlocks, orderBlocks[0], Number(newStartHour));
    onUpdateBlocks(updated);
  };

  const handleDeleteThisOrder = () => {
    if (window.confirm(`Yakin ingin MENGHAPUS SELURUH ${orderBlocks.length} tahapan jadwal untuk order ${voucherNo}?`)) {
      if (onDeleteSO) {
        onDeleteSO(voucherNo);
      } else {
        onUpdateBlocks(allScheduleBlocks.filter(b => b.voucherNo !== voucherNo));
      }
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0a3866] to-[#145388] text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-bold">
              <Layers className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-md text-xs font-black shadow-xs">
                  {sampleBlock.soNumber || sampleBlock.voucherNo}
                </span>
                <h3 className="font-black text-base tracking-wide">
                  {sampleBlock.modelCode || 'Model'}
                </h3>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                  isLilin ? 'bg-emerald-400 text-slate-950' : 'bg-cyan-400 text-slate-950'
                }`}>
                  {isLilin ? '12 Sub Proses (Lilin)' : '14 Sub Proses (Timah)'}
                </span>
                {sampleBlock.difficultyFactor > 1.0 && (
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-purple-500 text-white">
                    ★ Bobot {sampleBlock.difficultyFactor}x Rumit
                  </span>
                )}
              </div>
              <p className="text-xs text-blue-100 mt-0.5">
                No. SO / Voucher: <strong className="text-white">{voucherNo}</strong> | Jumlah Biji: <strong>{sampleBlock.biji || 490} pcs</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar text-xs">
          
          {/* Stepper visual horizontal */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-3">
              Progress Alur Tahapan Produksi (1 s/d {totalSteps})
            </h4>

            <div className="flex items-center overflow-x-auto pb-2 custom-scrollbar space-x-2">
              {orderBlocks.map((block, idx) => {
                const isEF = block.processCode === 'EFL' || block.processCode === 'EFT';
                return (
                  <div key={block.id} className="flex items-center shrink-0">
                    <div className={`p-2 rounded-xl border text-center min-w-[70px] transition-all shadow-xs ${
                      isEF
                        ? 'bg-blue-600 text-white border-blue-700 ring-2 ring-blue-300'
                        : 'bg-white text-slate-800 border-slate-300'
                    }`}>
                      <div className="text-[9px] font-extrabold opacity-75">Step {block.stepNumber || idx + 1}</div>
                      <div className="font-black text-xs mt-0.5">{block.processCode}</div>
                      <div className={`text-[9px] font-semibold mt-0.5 ${isEF ? 'text-blue-100' : 'text-slate-500'}`}>
                        {block.durationMinutes ? `${block.durationMinutes}m` : `${Math.round(block.durationHours * 60)}m`}
                      </div>
                    </div>

                    {idx < orderBlocks.length - 1 && (
                      <div className="w-4 h-0.5 bg-slate-300 shrink-0 mx-1"></div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Table of all stages */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="px-4 py-2.5 bg-slate-100/70 border-b border-slate-200 flex items-center justify-between">
              <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                Jadwal Rinci Tiap Subproses
              </span>
              <span className="text-[10px] text-slate-500">
                Terurut otomatis dari proses pertama sampai akhir
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase">
                    <th className="p-2.5 text-center w-12">Tahap</th>
                    <th className="p-2.5">Subproses</th>
                    <th className="p-2.5">Mesin</th>
                    <th className="p-2.5">Jam Mulai</th>
                    <th className="p-2.5">Jam Selesai</th>
                    <th className="p-2.5">Durasi (Menit)</th>
                    <th className="p-2.5">Operator</th>
                    <th className="p-2.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {orderBlocks.map((block, idx) => {
                    const startStr = formatTimelineHour(block.startHour, baseDate);
                    const finishStr = formatTimelineHour(block.startHour + block.durationHours, baseDate);
                    const isEF = block.processCode === 'EFL' || block.processCode === 'EFT';

                    return (
                      <tr key={block.id} className={`hover:bg-slate-50/80 transition-colors ${
                        isEF ? 'bg-blue-50/20 font-semibold' : ''
                      }`}>
                        <td className="p-2.5 text-center font-black text-slate-400">
                          {block.stepNumber || idx + 1}
                        </td>
                        <td className="p-2.5">
                          <span className={`px-2 py-0.5 rounded font-black text-[11px] ${
                            isEF ? 'bg-blue-100 text-blue-900 border border-blue-300' : 'bg-slate-100 text-slate-800'
                          }`}>
                            {block.processCode}
                          </span>
                          <span className="ml-2 font-bold text-slate-800">{block.processName || block.processCode}</span>
                        </td>
                        <td className="p-2.5">
                          <span className="font-extrabold text-blue-900">{block.machineId}</span>
                        </td>
                        <td className="p-2.5 font-semibold text-slate-800">
                          {startStr}
                        </td>
                        <td className="p-2.5 font-semibold text-slate-800">
                          {finishStr}
                        </td>
                        <td className="p-2.5 font-bold text-slate-900">
                          {block.durationMinutes ? `${block.durationMinutes} mnt` : `${Math.round(block.durationHours * 60)} mnt`}
                        </td>
                        <td className="p-2.5 text-slate-600 truncate max-w-[120px]">
                          {block.operatorName || '-'}
                        </td>
                        <td className="p-2.5 text-center">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200 flex items-center justify-center space-x-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Terjadwal</span>
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Global Order Rescheduler */}
          <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-xl flex flex-wrap items-center justify-between gap-3">
            <div>
              <h5 className="font-bold text-amber-950 text-xs">Geser Jam Start Seluruh Order</h5>
              <p className="text-[11px] text-amber-800">
                Menggeser jam mulai tahap 1 (Cetak) akan otomatis menyesuaikan jam mulai seluruh tahap 2 s/d {totalSteps} secara sinkron.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-[11px] font-bold text-amber-900">Jam Start Tahap 1:</label>
              <input
                type="number"
                min="0"
                max="48"
                step="0.5"
                value={newStartHour}
                onChange={(e) => setNewStartHour(Number(e.target.value))}
                className="w-18 px-2 py-1 bg-white border border-amber-300 rounded-lg font-bold text-xs"
              />
              <button
                type="button"
                onClick={handleShiftEntireOrder}
                className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg shadow-xs transition-all active:scale-95 flex items-center space-x-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Terapkan Geser Order</span>
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={handleDeleteThisOrder}
            className="px-3.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 hover:text-red-800 border border-red-300 rounded-xl font-bold flex items-center space-x-1.5 transition-colors active:scale-95 text-xs"
            title="Hapus seluruh tahapan alur untuk order ini"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
            <span>Hapus Seluruh Order ({voucherNo})</span>
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition-all active:scale-95"
          >
            Selesai & Tutup
          </button>
        </div>

      </div>
    </div>
  );
}
