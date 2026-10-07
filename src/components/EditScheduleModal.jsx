import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, Clock, AlertTriangle, Workflow, Layers, CheckCircle2 } from 'lucide-react';
import { LILIN_PROCESSES, TIMAH_PROCESSES, INITIAL_OPERATORS } from '../data/initialData';
import { calculateLeadTimeMinutes } from '../utils/pipelineUtils';

export default function EditScheduleModal({
  isOpen,
  onClose,
  block,
  onUpdateBlock,
  onDeleteBlock,
  onDeleteSO,
  allBlocks = [],
  baseDate = null
}) {
  if (!isOpen || !block) return null;

  const isLilin = block.materialType === 'Lilin';
  const activeProcessList = isLilin ? LILIN_PROCESSES : TIMAH_PROCESSES;

  const [soNumber, setSoNumber] = useState(block.soNumber || block.voucherNo || '');
  const [modelCode, setModelCode] = useState(block.modelCode || '');
  const [biji, setBiji] = useState(block.biji || 490);
  const [difficultyFactor, setDifficultyFactor] = useState(block.difficultyFactor || 1.0);
  const [processCode, setProcessCode] = useState(block.processCode || '');
  const [machineId, setMachineId] = useState(block.machineId || '');
  const [startHour, setStartHour] = useState(block.startHour ?? 7);
  const [durationMinutes, setDurationMinutes] = useState(
    block.durationMinutes || Math.round((block.durationHours || 2) * 60)
  );
  const [operatorName, setOperatorName] = useState(block.operatorName || 'Bagus Prasetyo');
  const [tesAirTime, setTesAirTime] = useState(block.tesAirTime || '07:15 WIB');
  const [notes, setNotes] = useState(block.notes || '');
  const [cascadeFollowers, setCascadeFollowers] = useState(true);

  // Sync state if block changes
  useEffect(() => {
    if (block) {
      setSoNumber(block.soNumber || block.voucherNo || '');
      setModelCode(block.modelCode || '');
      setBiji(block.biji || 490);
      setDifficultyFactor(block.difficultyFactor || 1.0);
      setProcessCode(block.processCode || '');
      setMachineId(block.machineId || '');
      setStartHour(block.startHour ?? 7);
      setDurationMinutes(block.durationMinutes || Math.round((block.durationHours || 2) * 60));
      setOperatorName(block.operatorName || 'Bagus Prasetyo');
      setTesAirTime(block.tesAirTime || '07:15 WIB');
      setNotes(block.notes || '');
    }
  }, [block]);

  // Current process & machines
  const currentProcess = activeProcessList.find(p => p.code === processCode) || activeProcessList[0];
  const availableMachines = currentProcess?.machines || [];

  // Count how many blocks exist for this SO
  const totalSOBlocks = allBlocks.filter(b => b.voucherNo === block.voucherNo).length;

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

  const handleBijiChange = (newBiji) => {
    const val = Number(newBiji) || 1;
    setBiji(val);
    const mins = calculateLeadTimeMinutes(currentProcess, val, difficultyFactor);
    setDurationMinutes(mins);
  };

  const handleDifficultyChange = (factor) => {
    const numFactor = Number(factor);
    setDifficultyFactor(numFactor);
    const mins = calculateLeadTimeMinutes(currentProcess, biji, numFactor);
    setDurationMinutes(mins);
  };

  const handleSave = (e) => {
    e.preventDefault();

    const durationHours = Math.round((Number(durationMinutes) / 60) * 10) / 10;
    const updatedBlock = {
      ...block,
      soNumber: soNumber.trim(),
      voucherNo: block.voucherNo || soNumber.trim(),
      modelCode: modelCode.trim(),
      biji: Number(biji),
      difficultyFactor: Number(difficultyFactor),
      processCode,
      processName: currentProcess?.name || block.processName,
      machineId,
      startHour: Number(startHour),
      durationMinutes: Number(durationMinutes),
      durationHours,
      operatorName,
      tesAirTime,
      notes
    };

    onUpdateBlock(updatedBlock, cascadeFollowers);
    onClose();
  };

  const handleDeleteFullSO = () => {
    const targetVoucher = block.voucherNo || soNumber;
    if (window.confirm(`Yakin ingin MENGHAPUS SELURUH ${totalSOBlocks} tahapan jadwal untuk No. SO / Voucher "${targetVoucher}"? Tindakan ini akan menghapus semua jadwal terkait.`)) {
      onDeleteSO(targetVoucher);
      onClose();
    }
  };

  const handleDeleteSingleStage = () => {
    if (window.confirm(`Hapus HANYA tahap ${block.stepNumber ? `Tahap ${block.stepNumber} (${block.processCode})` : block.processCode} pada mesin ${block.machineId}?`)) {
      onDeleteBlock(block.id);
      onClose();
    }
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
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header matching UBS Gold blue */}
        <div className="bg-gradient-to-r from-[#0a3866] to-[#145388] text-white p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-900 flex items-center justify-center font-black">
              {block.soNumber || 'SO'}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-sm tracking-wide">Detail & Edit Jadwal Produksi</h3>
                <span className={`text-[10px] px-2 py-0.2 rounded-full font-bold ${
                  isLilin ? 'bg-emerald-400 text-slate-900' : 'bg-cyan-400 text-slate-900'
                }`}>
                  Jalur {block.materialType} {block.stepNumber ? `(Tahap ${block.stepNumber}/${block.totalSteps || (isLilin ? 12 : 14)})` : ''}
                </span>
              </div>
              <p className="text-[11px] text-blue-100">
                Model: <strong className="text-white">{block.modelCode}</strong> | Voucher: <strong>{block.voucherNo}</strong>
              </p>
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
        <form onSubmit={handleSave} className="p-5 space-y-3.5 max-h-[82vh] overflow-y-auto custom-scrollbar text-xs">
          
          {/* Section 1: Order Identity */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
            <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider flex items-center justify-between">
              <span>1. Identitas Order & Spesifikasi</span>
              <span className="text-[10px] text-slate-500 font-semibold">
                Terhubung dengan {totalSOBlocks} Proses
              </span>
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
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white font-bold text-slate-800 focus:ring-2 focus:ring-blue-500"
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

          {/* Section 2: Proses & Mesin */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
            <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider flex items-center justify-between">
              <span>2. Alokasi Subproses & Mesin ({block.materialType})</span>
              <span className="text-[10px] text-blue-600 font-semibold">1 Mesin = 1 Model</span>
            </h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Subproses</label>
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
                  Kapasitas: <strong className="text-blue-700">{currentProcess.capacityUnit}</strong>
                </span>
              </div>
            )}
          </div>

          {/* Section 3: Time & Lead Time (Menit) */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
            <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider flex items-center justify-between">
              <span>3. Jam Mulai & Lead Time (Durasi Menit)</span>
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

            {/* Cascade option if startHour or duration changes */}
            {totalSOBlocks > 1 && (
              <label className="flex items-center space-x-2 pt-1 text-[11px] text-blue-900 font-bold cursor-pointer">
                <input
                  type="checkbox"
                  checked={cascadeFollowers}
                  onChange={(e) => setCascadeFollowers(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span>Otomatis sinkronkan / geser proses-proses berikutnya dalam SO ini</span>
              </label>
            )}
          </div>

          {/* Section 4: Operator & Setting Jam Tes Air */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
            <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
              4. Operator (Database Karyawan) & Setting Jam Tes Air
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

          {/* Bottom Actions: Hapus SO & Simpan Perubahan */}
          <div className="pt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200">
            {/* Delete buttons */}
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleDeleteFullSO}
                className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 hover:text-red-800 border border-red-300 rounded-xl font-bold flex items-center space-x-1.5 transition-colors active:scale-95"
                title="Hapus seluruh tahapan alur yang terhubung dengan No. SO ini"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-600" />
                <span>Hapus Seluruh SO ({block.voucherNo})</span>
              </button>

              <button
                type="button"
                onClick={handleDeleteSingleStage}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-semibold transition-colors"
                title="Hapus hanya tahapan ini saja"
              >
                Hapus Tahap Ini
              </button>
            </div>

            {/* Save / Close */}
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-semibold hover:bg-slate-100"
              >
                Tutup
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition-all active:scale-95 flex items-center space-x-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Perubahan</span>
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}
