import React, { useState } from 'react';
import { 
  X, 
  Cpu, 
  Settings, 
  Check, 
  ArrowLeftRight, 
  Clock, 
  Layers, 
  AlertCircle,
  Save,
  CheckCircle2,
  Calendar,
  Flame,
  Plus,
  Trash2,
  Edit2,
  Filter,
  Sparkles
} from 'lucide-react';
import { PROCESS_GROUPS } from '../data/initialData';

export default function MasterMesinModal({
  isOpen,
  onClose,
  machines,
  onUpdateMachines
}) {
  if (!isOpen) return null;

  // Collect all machines across all processes from PROCESS_GROUPS
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL', 'P1', 'P5'
  
  // Flatten all machines with process info
  const initialAllMachines = PROCESS_GROUPS.flatMap(proc => 
    proc.machines.map(m => ({
      ...m,
      processCode: proc.code,
      processName: proc.name
    }))
  );

  const [allMachineList, setAllMachineList] = useState(initialAllMachines);
  
  // Specific EF machines (P5) state for the 3:1 vs 2:2 switch
  const [allocationMode, setAllocationMode] = useState('3L1T'); // '3L1T' (3 Lilin 1 Timah) or '2L2T' (2 Lilin 2 Timah)
  const [switchDate, setSwitchDate] = useState('05/10/2026 14:00');
  const [switchNotes, setSwitchNotes] = useState('Penyesuaian kenaikan order perhiasan berbahan timah');
  
  // History log: "kapan menggantinya"
  const [historyLogs, setHistoryLogs] = useState([
    {
      date: '01/09/2026 08:00',
      from: '2 Lilin : 2 Timah',
      to: '3 Lilin : 1 Timah (EF-03 dikonversi ke Lilin)',
      reason: 'Peningkatan volume kalung hollow lilin',
      operator: 'Joshua Yordana (ICT)'
    },
    {
      date: '20/08/2026 10:30',
      from: '3 Lilin : 1 Timah',
      to: '2 Lilin : 2 Timah (EF-03 dikonversi ke Timah)',
      reason: 'Order besar cincin mahkota timah',
      operator: 'Bagus Prasetyo (Teknisi EF)'
    }
  ]);

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [editingMachine, setEditingMachine] = useState(null);

  // Switch allocation for EF machines: 3 Lilin 1 Timah vs 2 Lilin 2 Timah
  const handleApplyAllocation = (mode) => {
    setAllocationMode(mode);
    setAllMachineList(prev => prev.map(m => {
      if (m.id === 'EF-03') {
        return {
          ...m,
          type: mode === '3L1T' ? 'Lilin' : 'Timah',
          lastTypeSwitch: `${switchDate} (Diubah ke ${mode === '3L1T' ? 'Lilin' : 'Timah'})`
        };
      }
      return m;
    }));

    const newLog = {
      date: switchDate,
      from: mode === '3L1T' ? '2 Lilin : 2 Timah' : '3 Lilin : 1 Timah',
      to: mode === '3L1T' ? '3 Lilin : 1 Timah' : '2 Lilin : 2 Timah',
      reason: switchNotes,
      operator: 'Joshua Yordana (ICT)'
    };
    setHistoryLogs([newLog, ...historyLogs]);
  };

  const handleFieldChange = (id, field, value) => {
    setAllMachineList(prev => prev.map(m => {
      if (m.id === id) {
        return { ...m, [field]: value };
      }
      return m;
    }));
  };

  const handleSave = () => {
    // If update callback provided, sync P5 EF machines back to parent
    if (onUpdateMachines) {
      const efMachines = allMachineList.filter(m => m.processCode === 'P5');
      onUpdateMachines(efMachines);
    }
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1200);
  };

  // Filter machines based on activeTab
  const filteredMachines = allMachineList.filter(m => {
    if (activeTab === 'ALL') return true;
    return m.processCode === activeTab;
  });

  const efMachines = allMachineList.filter(m => m.processCode === 'P5');
  const lilinCount = efMachines.filter(m => m.type === 'Lilin').length;
  const timahCount = efMachines.filter(m => m.type === 'Timah').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-base font-black text-slate-900 uppercase tracking-wider flex items-center space-x-2">
              <Cpu className="w-5 h-5 text-indigo-600" />
              <span>MASTER DATA MESIN PRODUKSI & KAPASITAS (METODE 34)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Kelola kode mesin lilin (P1), mesin electroforming (P5), kapasitas volume (50-350 ml), BJ per menit, setup time 5 menit, dan peruntukan 3:1 / 2:2
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Filters */}
        <div className="bg-slate-100 border-b border-slate-200 px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-600">Filter Mesin:</span>
            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                activeTab === 'ALL' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white text-slate-700 hover:bg-slate-200'
              }`}
            >
              Semua Mesin ({allMachineList.length})
            </button>
            <button
              onClick={() => setActiveTab('P1')}
              className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                activeTab === 'P1' ? 'bg-amber-600 text-white shadow-xs' : 'bg-white text-slate-700 hover:bg-slate-200'
              }`}
            >
              P1 — Mesin Lilin (3 Mesin)
            </button>
            <button
              onClick={() => setActiveTab('P5')}
              className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                activeTab === 'P5' ? 'bg-blue-600 text-white shadow-xs' : 'bg-white text-slate-700 hover:bg-slate-200'
              }`}
            >
              ⭐ P5 — Mesin Electroforming (4 Mesin EF)
            </button>
          </div>

          <span className="text-[11px] text-slate-500">
            Satu mesin dialokasikan untuk 1 model dalam satu siklus produksi (Metode 34)
          </span>
        </div>

        {/* Electroforming Allocation Configuration Bar (Only when on P5 or ALL) */}
        {(activeTab === 'P5' || activeTab === 'ALL') && (
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-indigo-100 p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-xs font-bold text-indigo-900 flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>Peruntukan Mesin Electroforming (P5):</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-indigo-200 text-indigo-900">
                    {lilinCount} Lilin : {timahCount} Timah
                  </span>
                </div>
                <p className="text-[11px] text-indigo-700 mt-1">
                  Catatan meeting: "Timah dan lilin tidak sama. Pembagian mesin 3 lilin, 1 timah, ada kemungkinan diganti 2 timah, 2 lilin, dan kapan menggantinya dicatat."
                </p>
              </div>

              {/* Action Buttons: 3:1 vs 2:2 */}
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleApplyAllocation('3L1T')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                    lilinCount === 3
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50'
                  }`}
                >
                  Set: 3 Lilin : 1 Timah (Default)
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyAllocation('2L2T')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                    lilinCount === 2
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50'
                  }`}
                >
                  Set: 2 Lilin : 2 Timah (EF-03 Switch)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Body / Machine Cards Grid */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMachines.map((m) => (
              <div 
                key={`${m.processCode}-${m.id}`} 
                className={`border rounded-xl p-4 transition-all shadow-xs ${
                  m.processCode === 'P5'
                    ? 'border-blue-200 bg-blue-50/20'
                    : m.processCode === 'P1'
                    ? 'border-amber-200 bg-amber-50/20'
                    : 'border-slate-200 bg-slate-50/40'
                }`}
              >
                {/* Header card */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-0.5 rounded font-black text-xs ${
                      m.processCode === 'P5' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-white'
                    }`}>
                      {m.code}
                    </span>
                    <div>
                      <span className="font-bold text-xs text-slate-900 block">{m.name}</span>
                      <span className="text-[10px] text-slate-500 font-semibold">{m.processName}</span>
                    </div>
                  </div>

                  {/* Material Type Dropdown */}
                  {m.type && (
                    <select
                      value={m.type}
                      onChange={(e) => handleFieldChange(m.id, 'type', e.target.value)}
                      className={`text-xs font-bold px-2 py-1 rounded-lg border focus:outline-none ${
                        m.type === 'Lilin'
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : 'bg-slate-200 text-slate-800 border-slate-300'
                      }`}
                    >
                      <option value="Lilin">Lilin</option>
                      <option value="Timah">Timah</option>
                    </select>
                  )}
                </div>

                {/* Machine Inputs Grid matching meeting specs */}
                <div className="grid grid-cols-3 gap-3 text-xs mb-3">
                  {/* Kapasitas Biji */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Kapasitas (Biji)</label>
                    <input
                      type="number"
                      value={m.capacityBiji || 600}
                      onChange={(e) => handleFieldChange(m.id, 'capacityBiji', Number(e.target.value))}
                      className="w-full px-2 py-1 text-xs border rounded bg-white font-bold text-slate-800"
                    />
                  </div>

                  {/* Kapasitas Volume ml (50 - 350 ml) */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Volume Max (ml)</label>
                    <input
                      type="number"
                      value={m.capacityVolumeMl || 350}
                      onChange={(e) => handleFieldChange(m.id, 'capacityVolumeMl', Number(e.target.value))}
                      className="w-full px-2 py-1 text-xs border rounded bg-white font-bold text-slate-800"
                    />
                  </div>

                  {/* BJ Per Menit (Sesuai catatan "Master Mesin Bj Per Menit") */}
                  <div>
                    <label className="block text-[10px] font-bold text-blue-700 uppercase">BJ / Menit</label>
                    <input
                      type="number"
                      step="0.01"
                      value={m.speedBjPerMin || 1.0}
                      onChange={(e) => handleFieldChange(m.id, 'speedBjPerMin', Number(e.target.value))}
                      className="w-full px-2 py-1 text-xs border border-blue-300 rounded bg-white font-bold text-blue-800 font-mono"
                    />
                  </div>
                </div>

                {/* Footer card with setup buffer 5 min & notes */}
                <div className="text-[11px] text-slate-500 space-y-1 border-t border-slate-200/70 pt-2">
                  <div className="flex justify-between">
                    <span>Waktu Setup Antar Produk:</span>
                    <strong className="text-slate-800">5 Menit (Sesuai SOP)</strong>
                  </div>
                  {m.lastTypeSwitch && (
                    <div className="flex justify-between">
                      <span>Pergantian Terakhir:</span>
                      <span className="text-slate-600 truncate max-w-[200px]">{m.lastTypeSwitch}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Log Riwayat Rekonfigurasi Mesin ("Kapan Menggantinya") */}
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>Log Riwayat Rekonfigurasi Mesin EF ("Kapan Menggantinya")</span>
            </h3>
            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Waktu Pergantian</th>
                    <th className="py-2.5 px-3">Dari</th>
                    <th className="py-2.5 px-3">Menjadi</th>
                    <th className="py-2.5 px-3">Alasan / Notulen</th>
                    <th className="py-2.5 px-3">Operator Penanggung Jawab</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {historyLogs.map((log, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-mono text-[11px] font-semibold text-blue-900">{log.date}</td>
                      <td className="py-2 px-3">{log.from}</td>
                      <td className="py-2 px-3 font-bold text-emerald-800">{log.to}</td>
                      <td className="py-2 px-3 text-slate-600">{log.reason}</td>
                      <td className="py-2 px-3 text-slate-500">{log.operator}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Metode 34: 1 mesin hanya 1 model dalam satu siklus produksi 25-30 Jam
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 rounded-lg"
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              className="inline-flex items-center space-x-2 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
            >
              {saveSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Tersimpan!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan Master</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
