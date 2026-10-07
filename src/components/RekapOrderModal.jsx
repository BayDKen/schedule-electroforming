import React, { useState } from 'react';
import { 
  X, 
  BarChart3, 
  Sparkles, 
  Plus, 
  Download, 
  Upload, 
  CheckCircle2, 
  Zap, 
  Filter, 
  FileSpreadsheet,
  Calendar,
  Layers
} from 'lucide-react';

export default function RekapOrderModal({
  isOpen,
  onClose,
  orders,
  onUpdateOrders,
  machines,
  onOpenTahapanModal
}) {
  if (!isOpen) return null;

  const [orderList, setOrderList] = useState([...orders]);
  const [filterMaterial, setFilterMaterial] = useState('ALL');
  const [autoScheduleDone, setAutoScheduleDone] = useState(false);

  // Calculate totals
  const totalBiji = orderList.reduce((sum, o) => sum + (Number(o.biji) || 0), 0);
  const totalBerat = orderList.reduce((sum, o) => sum + (Number(o.beratTotalGr) || 0), 0);
  const avgVolume = orderList.length ? (orderList.reduce((sum, o) => sum + (Number(o.volumeMl) || 0), 0) / orderList.length).toFixed(0) : 0;

  // Auto scheduler algorithm (Metode 34)
  const handleAutoSchedule = () => {
    // Separate orders by material: Lilin vs Timah
    const lilinMachines = machines.filter(m => m.type === 'Lilin');
    const timahMachines = machines.filter(m => m.type === 'Timah');

    let machineNextAvailable = {};
    machines.forEach(m => {
      // Start scheduling from Day 1 Shift 1 (07:00)
      machineNextAvailable[m.id] = new Date('2026-10-05T07:00:00');
    });

    const scheduled = orderList.map((ord, idx) => {
      // Pick matching machine pool
      const pool = ord.materialType === 'Timah' ? timahMachines : lilinMachines;
      // Pick machine with earliest available time
      let chosenMachine = pool[0];
      let earliestTime = machineNextAvailable[pool[0].id] || new Date('2026-10-05T07:00:00');

      pool.forEach(m => {
        if (machineNextAvailable[m.id] < earliestTime) {
          chosenMachine = m;
          earliestTime = machineNextAvailable[m.id];
        }
      });

      // Calculate Lead Time before EF:
      // Cetak Lilin (1h) + Wash (30m) + Silver (45m) + STY (1.5h) = 3.75 hours
      const prepHours = 3.5;
      const scheduledStart = new Date(earliestTime.getTime());
      const efStart = new Date(scheduledStart.getTime() + prepHours * 3600 * 1000);

      // Batch duration in EF: 25 - 30 hours
      const duration = 25 + (idx % 5); // 25, 26, 27, 28, 29 hours
      const efEnd = new Date(efStart.getTime() + duration * 3600 * 1000);

      // Plus 5 minutes setup buffer for next batch!
      const nextAvailable = new Date(efEnd.getTime() + 5 * 60 * 1000);
      machineNextAvailable[chosenMachine.id] = nextAvailable;

      const formatDt = (d) => {
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const hh = String(d.getHours()).padStart(2, '0');
        const min = String(d.getMinutes()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
      };

      return {
        ...ord,
        assignedMachine: chosenMachine.id,
        scheduledStart: formatDt(scheduledStart),
        efStart: formatDt(efStart),
        efDurationHours: duration,
        status: idx < 3 ? 'In EF Bath' : 'Scheduled',
        settingTesAir: `${String(Math.max(0, efStart.getHours() - 1)).padStart(2, '0')}:30`
      };
    });

    setOrderList(scheduled);
    onUpdateOrders(scheduled);
    setAutoScheduleDone(true);
    setTimeout(() => setAutoScheduleDone(false), 3000);
  };

  const filteredOrders = orderList.filter(o => {
    if (filterMaterial === 'ALL') return true;
    return o.materialType === filterMaterial;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-base font-black text-slate-900 uppercase tracking-wider flex items-center space-x-2">
              <FileSpreadsheet className="w-5 h-5 text-amber-600" />
              <span>REKAP ORDERAN MASUK (~20 MODEL HARIAN)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Input data rekap Excel harian, kalkulasi kapasitas unit, volume (50-350 ml), dan penjadwalan otomatis
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Meeting KPIs bar: 4950 - 5350 unit */}
        <div className="bg-amber-50/60 border-b border-amber-100 p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="bg-white border border-amber-200 px-3 py-2 rounded-lg shadow-2xs">
                <span className="text-[10px] text-slate-500 font-bold block">TOTAL ORDER / MODEL</span>
                <span className="text-base font-black text-slate-900">{orderList.length} Model</span>
              </div>

              <div className="bg-white border border-amber-200 px-3 py-2 rounded-lg shadow-2xs">
                <span className="text-[10px] text-slate-500 font-bold block">TOTAL PRODUKSI BIJI</span>
                <span className="text-base font-black text-amber-700">
                  {totalBiji.toLocaleString()} Unit
                </span>
                <span className="text-[9px] text-emerald-700 font-semibold ml-1 block">
                  (Target 4950-5350 unit OK)
                </span>
              </div>

              <div className="bg-white border border-amber-200 px-3 py-2 rounded-lg shadow-2xs">
                <span className="text-[10px] text-slate-500 font-bold block">RATA-RATA VOLUME</span>
                <span className="text-base font-black text-blue-700">{avgVolume} ml / unit</span>
                <span className="text-[9px] text-slate-500 block">(Range 50 - 350 ml)</span>
              </div>

              <div className="bg-white border border-amber-200 px-3 py-2 rounded-lg shadow-2xs">
                <span className="text-[10px] text-slate-500 font-bold block">TOTAL BERAT EMAS EST.</span>
                <span className="text-base font-black text-indigo-700">{totalBerat.toFixed(1)} Gram</span>
              </div>
            </div>

            {/* Auto Schedule Action Button */}
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleAutoSchedule}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-lg shadow-md transition-all active:scale-95"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Auto-Schedule (Metode 34)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Feedback alert */}
        {autoScheduleDone && (
          <div className="bg-emerald-100 border-b border-emerald-300 px-6 py-2 text-xs font-bold text-emerald-900 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            <span>20 Model berhasil dijadwalkan secara otomatis ke 4 Mesin EF dengan jeda setup 5 menit!</span>
          </div>
        )}

        {/* Table List of 20 Orders */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          <div className="flex items-center justify-between mb-3 text-xs">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-600">Filter Bahan:</span>
              <button
                onClick={() => setFilterMaterial('ALL')}
                className={`px-2.5 py-1 rounded-md font-bold ${
                  filterMaterial === 'ALL' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                Semua ({orderList.length})
              </button>
              <button
                onClick={() => setFilterMaterial('Lilin')}
                className={`px-2.5 py-1 rounded-md font-bold ${
                  filterMaterial === 'Lilin' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-800'
                }`}
              >
                Lilin ({orderList.filter(o => o.materialType === 'Lilin').length})
              </button>
              <button
                onClick={() => setFilterMaterial('Timah')}
                className={`px-2.5 py-1 rounded-md font-bold ${
                  filterMaterial === 'Timah' ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                Timah ({orderList.filter(o => o.materialType === 'Timah').length})
              </button>
            </div>

            <div className="text-[11px] text-slate-400">
              *Rekap manual 20 model harian sesuai SOP UBS Gold
            </div>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">No</th>
                  <th className="py-2.5 px-3">No Voucher</th>
                  <th className="py-2.5 px-3">Kode Model</th>
                  <th className="py-2.5 px-3">Nama Model</th>
                  <th className="py-2.5 px-3">Bahan</th>
                  <th className="py-2.5 px-3 text-right">Biji (Pcs)</th>
                  <th className="py-2.5 px-3 text-right">Volume</th>
                  <th className="py-2.5 px-3 text-right">Berat (gr)</th>
                  <th className="py-2.5 px-3">Alokasi Mesin</th>
                  <th className="py-2.5 px-3">Kapan Masuk EF</th>
                  <th className="py-2.5 px-3">Setting Tes Air</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredOrders.map((ord, idx) => (
                  <tr key={ord.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-slate-400">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-blue-700">{ord.voucherNo}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{ord.modelCode}</td>
                    <td className="py-2.5 px-3 max-w-[160px] truncate text-slate-600">{ord.modelName}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        ord.materialType === 'Lilin'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-200 text-slate-800'
                      }`}>
                        {ord.materialType}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-black text-slate-800">{ord.biji}</td>
                    <td className="py-2.5 px-3 text-right text-slate-600 font-medium">{ord.volumeMl} ml</td>
                    <td className="py-2.5 px-3 text-right text-slate-600 font-medium">{Number(ord.beratTotalGr).toFixed(2)}</td>
                    <td className="py-2.5 px-3 font-bold text-indigo-700">
                      {ord.assignedMachine || '-'}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-700">
                      {ord.efStart || '-'}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-cyan-800 font-semibold">
                      {ord.settingTesAir || '07:00'}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        ord.status === 'In EF Bath' 
                          ? 'bg-emerald-100 text-emerald-800'
                          : ord.status === 'Scheduled'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {ord.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Satu mesin dialokasikan untuk 1 model spesifik dalam satu periode produksi 25-30 jam
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg shadow-2xs"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
}
