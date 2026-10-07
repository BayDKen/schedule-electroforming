import React, { useState } from 'react';
import { 
  X, 
  Users, 
  UserPlus, 
  Clock, 
  Save, 
  CheckCircle2, 
  Trash2, 
  Droplets,
  ShieldCheck,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { INITIAL_OPERATORS, PROCESS_GROUPS } from '../data/initialData';

export default function MasterOperatorModal({
  isOpen,
  onClose
}) {
  if (!isOpen) return null;

  // Headcount requirement per process: "Master Orang per proses ( nanti 1 proses berapa orang )"
  const [processHeadcounts, setProcessHeadcounts] = useState([
    { code: 'P1', name: 'Cetak lilin', requiredShift1: 2, requiredShift2: 2, requiredShift3: 1 },
    { code: 'P2', name: 'Wash Lilin', requiredShift1: 1, requiredShift2: 1, requiredShift3: 1 },
    { code: 'P3', name: 'Silver oil', requiredShift1: 1, requiredShift2: 1, requiredShift3: 1 },
    { code: 'P4', name: 'STY (Jig ST 2)', requiredShift1: 2, requiredShift2: 2, requiredShift3: 1 },
    { code: 'P5', name: 'Electroforming (EF)', requiredShift1: 2, requiredShift2: 2, requiredShift3: 2 },
    { code: 'P6', name: 'STR (Stripping)', requiredShift1: 1, requiredShift2: 1, requiredShift3: 1 },
    { code: 'P7', name: 'HL1 (Hollow 1)', requiredShift1: 2, requiredShift2: 2, requiredShift3: 1 },
    { code: 'P8', name: 'HL2 (Hollow 2)', requiredShift1: 2, requiredShift2: 2, requiredShift3: 1 },
    { code: 'P9', name: 'Annealing (Pemanasan)', requiredShift1: 1, requiredShift2: 1, requiredShift3: 1 },
    { code: 'P10', name: 'Test Kadar (Bjd)', requiredShift1: 1, requiredShift2: 1, requiredShift3: 1 }
  ]);

  // List of registered operators with "jam masuk dan setting jam berapa (tes air)"
  const [operators, setOperators] = useState([
    ...INITIAL_OPERATORS.map(op => ({
      ...op,
      jamMasuk: op.shift === 1 ? '06:45' : op.shift === 2 ? '14:45' : '22:45',
      jamSettingTesAir: op.shift === 1 ? '07:00' : op.shift === 2 ? '15:00' : '23:00'
    }))
  ]);

  const [activeTab, setActiveTab] = useState('OPERATOR_LIST'); // 'OPERATOR_LIST' or 'PROCESS_HEADCOUNT'
  const [isAdding, setIsAdding] = useState(false);
  const [saved, setSaved] = useState(false);

  const [newOp, setNewOp] = useState({
    id: '',
    name: '',
    role: 'Operator Produksi',
    assignedProcess: 'P5',
    shift: 1,
    jamMasuk: '06:45',
    jamSettingTesAir: '07:00'
  });

  const handleShiftChange = (shiftNum) => {
    let jamM = '06:45';
    let jamT = '07:00';
    if (shiftNum === 2) {
      jamM = '14:45';
      jamT = '15:00';
    } else if (shiftNum === 3) {
      jamM = '22:45';
      jamT = '23:00';
    }
    setNewOp(prev => ({
      ...prev,
      shift: shiftNum,
      jamMasuk: jamM,
      jamSettingTesAir: jamT
    }));
  };

  const handleAddOperator = (e) => {
    e.preventDefault();
    if (!newOp.id || !newOp.name) {
      alert('Harap isi ID Card / No Induk dan Nama Tukang!');
      return;
    }

    setOperators([...operators, { ...newOp, id: newOp.id.trim() }]);
    setNewOp({
      id: '',
      name: '',
      role: 'Operator Produksi',
      assignedProcess: 'P5',
      shift: 1,
      jamMasuk: '06:45',
      jamSettingTesAir: '07:00'
    });
    setIsAdding(false);
  };

  const handleDelete = (id) => {
    setOperators(operators.filter(o => o.id !== id));
  };

  const handleHeadcountChange = (code, field, val) => {
    setProcessHeadcounts(prev => prev.map(ph => {
      if (ph.code === code) {
        return { ...ph, [field]: Number(val) };
      }
      return ph;
    }));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-base font-black text-slate-900 uppercase tracking-wider flex items-center space-x-2">
              <Users className="w-5 h-5 text-emerald-600" />
              <span>MASTER ORANG / OPERATOR PER PROSES & SHIFT</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Alokasi jumlah orang per proses, jam shift (07:00, 15:00, 23:00), dan waktu setting tes air
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="bg-slate-100 border-b border-slate-200 px-6 py-2 flex items-center space-x-2 text-xs">
          <button
            onClick={() => setActiveTab('OPERATOR_LIST')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
              activeTab === 'OPERATOR_LIST'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            Daftar Operator, Jam Masuk & Setting Tes Air ({operators.length})
          </button>
          <button
            onClick={() => setActiveTab('PROCESS_HEADCOUNT')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
              activeTab === 'PROCESS_HEADCOUNT'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            Standar Kebutuhan Orang per Proses (1 Proses Berapa Orang)
          </button>
        </div>

        {/* Shift Rules Info Banner */}
        <div className="bg-emerald-50/70 border-b border-emerald-100 px-6 py-2.5 flex flex-wrap items-center justify-between text-xs text-emerald-950">
          <div className="flex items-center space-x-4">
            <span className="font-bold">Ketentuan Shift:</span>
            <span>Shift 1 (07:00 - 15:00)</span>
            <span>•</span>
            <span>Shift 2 (15:00 - 23:00)</span>
            <span>•</span>
            <span>Shift 3 (23:00 - 07:00)</span>
          </div>
          <div className="flex items-center space-x-1.5 text-blue-900 font-semibold text-[11px]">
            <Droplets className="w-3.5 h-3.5 text-cyan-600" />
            <span>Setting Tes Air: Dilakukan 15 menit sebelum start batch produksi</span>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar space-y-6">
          
          {/* TAB 1: OPERATOR LIST */}
          {activeTab === 'OPERATOR_LIST' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-700">Daftar Personil Operator & Penugasan Shift</span>
                <button
                  onClick={() => setIsAdding(!isAdding)}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-xs"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>{isAdding ? 'Tutup Form' : 'Tambah Operator Baru'}</span>
                </button>
              </div>

              {/* Add Operator Form */}
              {isAdding && (
                <form onSubmit={handleAddOperator} className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">ID Card / No Induk *</label>
                      <input
                        type="text"
                        required
                        value={newOp.id}
                        onChange={(e) => setNewOp({ ...newOp, id: e.target.value })}
                        placeholder="cth: 019395"
                        className="w-full px-3 py-1.5 border rounded-lg bg-white uppercase font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Nama Lengkap Tukang *</label>
                      <input
                        type="text"
                        required
                        value={newOp.name}
                        onChange={(e) => setNewOp({ ...newOp, name: e.target.value })}
                        placeholder="Nama operator"
                        className="w-full px-3 py-1.5 border rounded-lg bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Subproses Ditugaskan</label>
                      <select
                        value={newOp.assignedProcess}
                        onChange={(e) => setNewOp({ ...newOp, assignedProcess: e.target.value })}
                        className="w-full px-3 py-1.5 border rounded-lg bg-white font-medium"
                      >
                        {PROCESS_GROUPS.map(pg => (
                          <option key={pg.code} value={pg.code}>
                            {pg.code} — {pg.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Shift Kerja</label>
                      <select
                        value={newOp.shift}
                        onChange={(e) => handleShiftChange(Number(e.target.value))}
                        className="w-full px-3 py-1.5 border rounded-lg bg-white font-bold"
                      >
                        <option value={1}>Shift 1 (07:00 - 15:00)</option>
                        <option value={2}>Shift 2 (15:00 - 23:00)</option>
                        <option value={3}>Shift 3 (23:00 - 07:00)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Jam Masuk Kerja</label>
                      <input
                        type="text"
                        value={newOp.jamMasuk}
                        onChange={(e) => setNewOp({ ...newOp, jamMasuk: e.target.value })}
                        className="w-full px-3 py-1.5 border rounded-lg bg-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-cyan-800 mb-1">Setting Jam Berapa (Tes Air)</label>
                      <input
                        type="text"
                        value={newOp.jamSettingTesAir}
                        onChange={(e) => setNewOp({ ...newOp, jamSettingTesAir: e.target.value })}
                        className="w-full px-3 py-1.5 border border-cyan-300 rounded-lg bg-cyan-50 font-mono font-bold text-cyan-900"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg"
                    >
                      Simpan Operator
                    </button>
                  </div>
                </form>
              )}

              {/* Operator Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">No Induk</th>
                      <th className="py-2.5 px-3">Nama Tukang</th>
                      <th className="py-2.5 px-3">Alokasi Subproses</th>
                      <th className="py-2.5 px-3">Jadwal Shift</th>
                      <th className="py-2.5 px-3">Jam Masuk</th>
                      <th className="py-2.5 px-3 text-cyan-800">Setting Jam Berapa (Tes Air)</th>
                      <th className="py-2.5 px-3 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {operators.map((op) => (
                      <tr key={op.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-mono font-bold text-blue-700">{op.id}</td>
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-slate-900">{op.name}</div>
                          <div className="text-[10px] text-slate-400">{op.role}</div>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded font-bold text-[11px] bg-blue-50 text-blue-800 border border-blue-200">
                            {op.assignedProcess}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-bold text-slate-800">
                            Shift {op.shift}
                          </span>{' '}
                          <span className="text-[10px] text-slate-400">
                            ({op.shift === 1 ? '07:00-15:00' : op.shift === 2 ? '15:00-23:00' : '23:00-07:00'})
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-600 font-semibold">
                          {op.jamMasuk}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center space-x-1.5 text-cyan-800 font-bold font-mono">
                            <Droplets className="w-3.5 h-3.5 text-cyan-600" />
                            <span>{op.jamSettingTesAir} WIB</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            onClick={() => handleDelete(op.id)}
                            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: STANDAR KEBUTUHAN ORANG PER PROSES */}
          {activeTab === 'PROCESS_HEADCOUNT' && (
            <div className="space-y-4">
              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3 w-16">Kode</th>
                      <th className="py-2.5 px-3">Nama Subproses</th>
                      <th className="py-2.5 px-3 text-center">Kebutuhan Shift 1 (07-15)</th>
                      <th className="py-2.5 px-3 text-center">Kebutuhan Shift 2 (15-23)</th>
                      <th className="py-2.5 px-3 text-center">Kebutuhan Shift 3 (23-07)</th>
                      <th className="py-2.5 px-3 text-right">Total Orang / Hari</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {processHeadcounts.map((ph) => {
                      const totalOrg = ph.requiredShift1 + ph.requiredShift2 + ph.requiredShift3;
                      return (
                        <tr key={ph.code} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-mono font-bold text-blue-700">{ph.code}</td>
                          <td className="py-2.5 px-3 font-bold text-slate-900">{ph.name}</td>
                          <td className="py-2.5 px-3 text-center">
                            <input
                              type="number"
                              value={ph.requiredShift1}
                              onChange={(e) => handleHeadcountChange(ph.code, 'requiredShift1', e.target.value)}
                              className="w-16 px-2 py-1 text-center font-bold border rounded bg-white"
                            />
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <input
                              type="number"
                              value={ph.requiredShift2}
                              onChange={(e) => handleHeadcountChange(ph.code, 'requiredShift2', e.target.value)}
                              className="w-16 px-2 py-1 text-center font-bold border rounded bg-white"
                            />
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <input
                              type="number"
                              value={ph.requiredShift3}
                              onChange={(e) => handleHeadcountChange(ph.code, 'requiredShift3', e.target.value)}
                              className="w-16 px-2 py-1 text-center font-bold border rounded bg-white"
                            />
                          </td>
                          <td className="py-2.5 px-3 text-right font-black text-emerald-700">
                            {totalOrg} Orang
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Shift jam kerja mulai dari jam 07:00, 15:00, 23:00 WIB
          </div>
          <button
            onClick={handleSave}
            className="inline-flex items-center space-x-2 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
          >
            {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            <span>{saved ? 'Tersimpan!' : 'Simpan Master Operator'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
