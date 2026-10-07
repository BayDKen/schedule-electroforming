import React, { useState } from 'react';
import { X, Plus, Workflow } from 'lucide-react';
import { LILIN_PROCESSES, TIMAH_PROCESSES, INITIAL_OPERATORS } from '../data/initialData';
import { generateFullOrderPipeline, calculateLeadTimeMinutes } from '../utils/pipelineUtils';

export default function AddScheduleModal({ isOpen, onClose, onAddScheduleBlock, baseDate = null, allScheduleBlocks = [] }) {
  if (!isOpen) return null;

  // Pipeline / Material state: 'Lilin' or 'Timah'
  const [pipeline, setPipeline] = useState('Lilin'); // 'Lilin' or 'Timah'
  const [autoPlanFullOrder, setAutoPlanFullOrder] = useState(true); // Full pipeline mode (1 s/d 12 / 1 s/d 14)
  const [soNumber, setSoNumber] = useState(`SO-400${Math.floor(50 + Math.random() * 50)}`);
  const [modelCode, setModelCode] = useState('MDL-KL34-08');
  const [biji, setBiji] = useState(490);
  const [difficultyFactor, setDifficultyFactor] = useState(1.0); // 1.0 or 1.5

  // Process & Machine state (default to Step 1: CEL for Lilin, CET for Timah)
  const activeProcessList = pipeline === 'Lilin' ? LILIN_PROCESSES : TIMAH_PROCESSES;
  const [processCode, setProcessCode] = useState(pipeline === 'Lilin' ? 'CEL' : 'CET');
  const [machineId, setMachineId] = useState(pipeline === 'Lilin' ? 'ML-01' : 'MT-01');
  const [startHour, setStartHour] = useState(7); // Default Shift 1 (07:00)
  const [durationMinutes, setDurationMinutes] = useState(245); // Default 245 mins (4.1h) for CEL with 490 biji
  const [operatorName, setOperatorName] = useState('Bagus Prasetyo');
  const [tesAirTime, setTesAirTime] = useState('07:15 WIB');
  const [notes, setNotes] = useState('Metode 34 - Alokasi 1 Mesin 1 Model');

  // Find currently selected process object
  const currentProcess = activeProcessList.find(p => p.code === processCode) || activeProcessList[0];
  const availableMachines = currentProcess?.machines || [];

  // When pipeline changes (Lilin <-> Timah), adjust default process & machines to Step 1
  const handlePipelineChange = (newPipeline) => {
    setPipeline(newPipeline);
    const newList = newPipeline === 'Lilin' ? LILIN_PROCESSES : TIMAH_PROCESSES;
    const defaultCode = newPipeline === 'Lilin' ? 'CEL' : 'CET';
    const proc = newList.find(p => p.code === defaultCode) || newList[0];
    setProcessCode(proc.code);
    if (proc.machines && proc.machines.length > 0) {
      setMachineId(proc.machines[0].id);
    }
    const mins = calculateLeadTimeMinutes(proc, biji, difficultyFactor);
    setDurationMinutes(mins);
  };

  // When process changes, recalculate duration with difficultyFactor
  const handleProcessChange = (newCode) => {
    setProcessCode(newCode);
    const proc = activeProcessList.find(p => p.code === newCode);
    if (proc) {
      if (proc.machines && proc.machines.length > 0) {
        setMachineId(proc.machines[0].id);
      }
      const mins = calculateLeadTimeMinutes(proc, biji, difficultyFactor);
      setDurationMinutes(mins);
    }
  };

  // When biji changes, recalculate duration for current process
  const handleBijiChange = (newBiji) => {
    const val = Number(newBiji) || 1;
    setBiji(val);
    const mins = calculateLeadTimeMinutes(currentProcess, val, difficultyFactor);
    setDurationMinutes(mins);
  };

  // When difficulty factor changes (1.0 vs 1.5), multiply duration
  const handleDifficultyChange = (factor) => {
    const numFactor = Number(factor);
    setDifficultyFactor(numFactor);
    const mins = calculateLeadTimeMinutes(currentProcess, biji, numFactor);
    setDurationMinutes(mins);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Check if machine is in Trouble / Maintenance
    const chosenMachine = availableMachines.find(m => m.id === machineId);
    if (chosenMachine?.status === 'Trouble') {
      alert(`Peringatan: Mesin ${chosenMachine.name} sedang dalam status TROUBLE! Silakan pilih mesin lain yang berstatus Running.`);
      return;
    }

    const durationHours = Math.round((Number(durationMinutes) / 60) * 10) / 10;
    const cleanId = soNumber.trim();

    if (autoPlanFullOrder) {
      // Generate all sequential blocks from Step 1 to final step
      const fullOrderBlocks = generateFullOrderPipeline({
        voucherNo: cleanId,
        modelCode: modelCode.trim(),
        soNumber: cleanId,
        materialType: pipeline,
        biji: Number(biji) || 490,
        difficultyFactor: Number(difficultyFactor),
        startHour: Number(startHour),
        selectedProcessCode: processCode,
        selectedMachineId: machineId,
        assignedStartMachine: (processCode === 'CEL' || processCode === 'CET') ? machineId : null,
        assignedEFMachine: (processCode === 'EFL' || processCode === 'EFT') ? machineId : null,
        operatorName,
        tesAirTime,
        notes: notes || `Order ${cleanId} [Planning Penuh Tahap 1 s/d ${pipeline === 'Lilin' ? '12' : '14'}]`,
        existingBlocks: allScheduleBlocks
      });
      onAddScheduleBlock(fullOrderBlocks);
    } else {
      const newBlock = {
        id: `BLK-${cleanId}-${processCode}-${Date.now()}`,
        pipeline,
        soNumber: cleanId,
        voucherNo: cleanId,
        modelCode: modelCode.trim(),
        materialType: pipeline,
        biji: Number(biji) || 490,
        processCode,
        processName: currentProcess?.name || processCode,
        machineId,
        startHour: Number(startHour),
        durationMinutes: Number(durationMinutes),
        durationHours: durationHours,
        difficultyFactor: Number(difficultyFactor),
        isLocked: false,
        operatorName,
        tesAirTime,
        notes,
        color: pipeline === 'Lilin' ? 'emerald' : 'cyan'
      };
      onAddScheduleBlock(newBlock);
    }

    onClose();
  };

  const formatHourLabel = (h) => {
    const effectiveBase = baseDate || new Date();
    const d = new Date(effectiveBase.getFullYear(), effectiveBase.getMonth(), effectiveBase.getDate(), 0, 0, 0);
    const targetDate = new Date(d.getTime() + h * 3600 * 1000);
    const daysIndo = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const monthsIndo = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const dayStr = `${daysIndo[targetDate.getDay()]}, ${String(targetDate.getDate()).padStart(2, '0')} ${monthsIndo[targetDate.getMonth()]}`;
    const hh = String(targetDate.getHours()).padStart(2, '0');
    let shift = 3;
    if (targetDate.getHours() >= 7 && targetDate.getHours() < 15) shift = 1;
    else if (targetDate.getHours() >= 15 && targetDate.getHours() < 23) shift = 2;
    return `${dayStr} - ${hh}:00 (Shift ${shift})`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header matching UBS Gold blue */}
        <div className="bg-gradient-to-r from-[#0a3866] to-[#145388] text-white p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center font-bold">
              <Plus className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-wide">Tambah Schedule Produksi Baru</h3>
              <p className="text-[11px] text-blue-100">Jalur Lilin (12 Sub Proses) & Timah (14 Sub Proses)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 max-h-[82vh] overflow-y-auto custom-scrollbar text-xs">
          
          {/* STEP 1: PIPELINE SELECTION (LILIN VS TIMAH) */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              1. Pilih Jalur Produksi
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handlePipelineChange('Lilin')}
                className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center space-x-2 border transition-all ${
                  pipeline === 'Lilin'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-xs ring-2 ring-emerald-500/20'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                <span>Jalur Lilin (12 Sub Proses)</span>
              </button>

              <button
                type="button"
                onClick={() => handlePipelineChange('Timah')}
                className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center space-x-2 border transition-all ${
                  pipeline === 'Timah'
                    ? 'bg-cyan-50 border-cyan-500 text-cyan-900 shadow-xs ring-2 ring-cyan-500/20'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span className="w-3 h-3 rounded-full bg-cyan-600"></span>
                <span>Jalur Timah (14 Sub Proses)</span>
              </button>
            </div>

            {/* Auto Plan Full Order Toggle */}
            <div className="mt-2.5 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Workflow className="w-4 h-4 text-blue-600 shrink-0" />
                <div>
                  <div className="font-bold text-slate-900 text-[11px] flex items-center space-x-1.5">
                    <span>Rencanakan Otomatis 1 Order Penuh (Tahap 1 s/d {pipeline === 'Lilin' ? '12' : '14'})</span>
                    <span className="bg-blue-600 text-white text-[9px] px-1.5 py-0.2 rounded font-black">Rekomendasi</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Sistem langsung menyusun jam-jam proses secara berurutan dan terplanning dari Cetak sampai Uji Kadar
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoPlanFullOrder}
                  onChange={(e) => setAutoPlanFullOrder(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>

          {/* STEP 2: ORDER & DIFFICULTY FACTOR */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
            <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider flex items-center justify-between">
              <span>2. Identitas Order & Tingkat Kesulitan Produk</span>
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  No. SO / No. Voucher (ID) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={soNumber}
                  onChange={(e) => setSoNumber(e.target.value)}
                  placeholder="Ketik ID order (contoh: SO-001 / VZF2A40050)"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Kode Model / Desain <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={modelCode}
                  onChange={(e) => setModelCode(e.target.value)}
                  placeholder="Contoh: MDL-KL34-08"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white font-medium focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Jumlah Biji (pcs) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={biji}
                  onChange={(e) => handleBijiChange(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Tingkat Kesulitan (Bobot)
                </label>
                <select
                  value={difficultyFactor}
                  onChange={(e) => handleDifficultyChange(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white font-bold text-indigo-900 focus:ring-2 focus:ring-blue-500"
                >
                  <option value={1.0}>1.0 (Normal / Standar)</option>
                  <option value={1.5}>1.5 (Tinggi / Rumit)</option>
                </select>
              </div>
            </div>
          </div>

          {/* STEP 3: PROSES & MESIN ALLOCATION */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
            <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider flex items-center justify-between">
              <span>3. Alokasi Subproses & Mesin ({pipeline})</span>
              <span className="text-[10px] text-blue-600 normal-case font-semibold">1 Mesin = 1 Model</span>
            </h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Subproses {pipeline}</label>
                <select
                  value={processCode}
                  onChange={(e) => handleProcessChange(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white font-bold text-slate-800"
                >
                  {activeProcessList.map((p) => (
                    <option key={p.code} value={p.code}>
                      {p.number}. {p.code} - {p.name} {p.isShared ? '(Shared)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Pilih Mesin</label>
                <select
                  value={machineId}
                  onChange={(e) => setMachineId(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white font-bold text-slate-800"
                >
                  {availableMachines.map((m) => (
                    <option key={m.id} value={m.id} disabled={m.status === 'Trouble'}>
                      {m.code} - {m.name} {m.isFloating ? '(Floating)' : ''} {m.status === 'Trouble' ? '⚠️ (TROUBLE)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {currentProcess && (
              <div className="bg-white p-2 rounded-lg border border-slate-200 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">
                  Lead Time Standar: <strong className="text-slate-800">{currentProcess.defaultLeadTimeMinutes || Math.round((currentProcess.defaultLeadTimeHours || 2) * 60)} Menit</strong>
                </span>
                <span className="text-slate-500">
                  Kapasitas 1 Mesin: <strong className="text-blue-700">{currentProcess.capacityUnit}</strong>
                </span>
              </div>
            )}

            {/* Indikator Alokasi Mesin */}
            <div className="text-[11px] px-2.5 py-1.5 rounded-lg bg-blue-50/70 border border-blue-200 text-blue-900 flex items-center justify-between">
              <span>
                📍 Alokasi: <strong>{currentProcess?.name}</strong> akan dijadwalkan tepat pada mesin <strong>{availableMachines.find(m => m.id === machineId)?.name || machineId}</strong>.
              </span>
              {autoPlanFullOrder && (
                <span className="text-[10px] text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded font-semibold">
                  Tahapan lain terdistribusi seimbang
                </span>
              )}
            </div>
          </div>

          {/* STEP 4: TIME SCHEDULING & LEAD TIME (MENIT) */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
            <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider flex items-center justify-between">
              <span>4. Jam Mulai & Lead Time (Durasi Menit)</span>
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Jam Start Penjadwalan</label>
                <select
                  value={startHour}
                  onChange={(e) => setStartHour(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white font-bold text-blue-900"
                >
                  {Array.from({ length: 48 }, (_, i) => (
                    <option key={i} value={i}>
                      {formatHourLabel(i)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Lead Time Durasi (Menit) {difficultyFactor > 1 && `[${difficultyFactor}x Rumit]`}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="1"
                    min="1"
                    required
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white font-bold text-slate-900 pr-14 focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="absolute right-3 top-1.5 text-xs text-slate-500 font-bold pointer-events-none">
                    mnt
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  ≈ {(durationMinutes / 60).toFixed(1)} jam di timeline
                </span>
              </div>
            </div>
          </div>

          {/* STEP 5: OPERATOR & SETTING JAM TES AIR */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
            <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
              5. Operator (Database Karyawan) & Setting Jam Tes Air
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Operator Bertugas</label>
                <select
                  value={operatorName}
                  onChange={(e) => setOperatorName(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white font-medium text-slate-800 focus:ring-2 focus:ring-blue-500"
                >
                  {INITIAL_OPERATORS.map((op) => (
                    <option key={op.id} value={op.name}>
                      {op.id} - {op.name} ({op.role} - Shift {op.shift})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Setting Jam Tes Air</label>
                <input
                  type="text"
                  value={tesAirTime}
                  onChange={(e) => setTesAirTime(e.target.value)}
                  placeholder="07:15 WIB"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end space-x-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-semibold hover:bg-slate-100"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition-all active:scale-95 flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Simpan ke Jadwal</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
