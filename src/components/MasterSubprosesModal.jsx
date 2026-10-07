import React, { useState } from 'react';
import { 
  X, 
  Clock, 
  Layers, 
  Save, 
  CheckCircle2, 
  Zap, 
  Info, 
  Sliders, 
  Calculator, 
  ArrowRight, 
  Droplets, 
  Scale 
} from 'lucide-react';
import { LILIN_PROCESSES, TIMAH_PROCESSES } from '../data/initialData';

export default function MasterSubprosesModal({
  isOpen,
  onClose
}) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('Lilin'); // 'Lilin' or 'Timah'
  const [lilinList, setLilinList] = useState(LILIN_PROCESSES);
  const [timahList, setTimahList] = useState(TIMAH_PROCESSES);
  const [setupTimeMinutes, setSetupTimeMinutes] = useState(5);
  const [saved, setSaved] = useState(false);

  // Interactive Calculator: "Kapan harus masuk electroforming"
  const [calcStartHour, setCalcStartHour] = useState('07:00');
  const [calcEfDuration, setCalcEfDuration] = useState(35); // 35h EF batch
  const [calcDifficulty, setCalcDifficulty] = useState(1.0);

  const calculateFlow = () => {
    const [hh, mm] = calcStartHour.split(':').map(Number);
    const startMins = hh * 60 + mm;

    // Prep steps:
    // Lilin: CEL (245m) + WBN (368m) + SOL (61m) + STI (82m) + TBA (110m) = 866m (~14.4h) * difficulty
    // Timah: CET + AMP + GLD + ULR + STB + ST1 = ~180m * difficulty
    const basePrep = activeTab === 'Lilin' ? 866 : 180;
    const prepMinutes = Math.round(basePrep * calcDifficulty);
    const efStartMins = startMins + prepMinutes;
    const settingTesAirMins = efStartMins - 15; // 15 mins before EF

    const formatMins = (m) => {
      const dayOffset = Math.floor(m / (24 * 60));
      const h = Math.floor((m / 60) % 24);
      const min = Math.floor(m % 60);
      const timeStr = `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
      return dayOffset > 0 ? `${timeStr} (+${dayOffset}hr)` : timeStr;
    };

    const efDurationMins = Math.round(calcEfDuration * 60 * calcDifficulty);
    const efEndMins = efStartMins + efDurationMins;
    // Post EF:
    // Lilin: BOR (41m) + HL1 (780m) + ANN (60m) + HL2 (780m) + TKD (20m) + BJD (15m) = 1,696m
    const postEfMins = activeTab === 'Lilin' ? (41 + 780 + 60 + 780 + 20 + 15) : (30 + 120 + 780 + 60 + 20 + 15);
    const finalFinishMins = efEndMins + postEfMins;
    const totalMinutes = finalFinishMins - startMins;

    return {
      startCEL: formatMins(startMins),
      settingTesAir: formatMins(settingTesAirMins),
      masukEF: formatMins(efStartMins),
      selesaiEF: formatMins(efEndMins),
      finalFinish: formatMins(finalFinishMins),
      totalHours: (totalMinutes / 60).toFixed(1)
    };
  };

  const flowResults = calculateFlow();

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1000);
  };

  const currentList = activeTab === 'Lilin' ? lilinList : timahList;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-6xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-[#0a3866] to-[#145388] text-white">
          <div>
            <h2 className="text-base font-black uppercase tracking-wider flex items-center space-x-2">
              <Clock className="w-5 h-5 text-amber-300" />
              <span>MASTER SUBPROSES, LEAD TIME & KAPASITAS (METODE 34)</span>
            </h2>
            <p className="text-xs text-blue-100 mt-0.5">
              Sinkronisasi Dokumen Kapasitas Pabrik Lilin (12 Tahap) & Papan Tulis Timah (14 Tahap)
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-blue-200 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pipeline Tab Switcher */}
        <div className="bg-slate-100 px-6 py-2.5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('Lilin')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                activeTab === 'Lilin'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>🕯️</span>
              <span>Jalur Lilin (12 Sub Proses)</span>
            </button>

            <button
              onClick={() => setActiveTab('Timah')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                activeTab === 'Timah'
                  ? 'bg-cyan-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>⚙️</span>
              <span>Jalur Timah (14 Sub Proses)</span>
            </button>
          </div>

          <span className="text-[11px] font-semibold text-slate-500">
            Jeda Setup: <strong className="text-slate-800">{setupTimeMinutes} Menit</strong> | Mesin EF: <strong className="text-blue-700">Batch 35 Jam (490 Biji)</strong>
          </span>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar text-xs">
          
          {/* Table of Subprocesses */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 uppercase tracking-wider text-xs">
                Daftar Subproses {activeTab} (Tahap 1 s/d {currentList.length})
              </h3>
              <span className="text-[10px] text-slate-500 font-semibold">
                {activeTab === 'Lilin' ? 'Sesuai Lembar Tabel Kapasitas Lilin (TBA 110m, EF 2100m, HL 780m)' : 'Sesuai Alur Produksi Timah'}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100/70 border-b border-slate-200 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                    <th className="p-2.5 w-10 text-center">No</th>
                    <th className="p-2.5 w-16">Kode</th>
                    <th className="p-2.5">Subproses</th>
                    {activeTab === 'Lilin' ? (
                      <>
                        <th className="p-2.5 text-center">Man</th>
                        <th className="p-2.5 text-center">Mesin</th>
                        <th className="p-2.5 text-right">Leadtime (s)</th>
                        <th className="p-2.5 text-center">Kapasitas</th>
                        <th className="p-2.5 text-right">s/bj</th>
                        <th className="p-2.5 text-right">min/bj</th>
                        <th className="p-2.5 text-right bg-blue-50/50 text-blue-900">Batch 490 bj</th>
                      </>
                    ) : (
                      <>
                        <th className="p-2.5">Lead Time (Sec / Jam)</th>
                        <th className="p-2.5">Kapasitas Mesin</th>
                        <th className="p-2.5">Jumlah Mesin</th>
                      </>
                    )}
                    <th className="p-2.5">Tipe Alokasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {currentList.map((sp) => (
                    <tr key={sp.code} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-2.5 font-black text-center text-slate-400">{sp.number}</td>
                      <td className="p-2.5">
                        <span className={`px-2 py-0.5 rounded font-black text-[11px] ${
                          sp.isEFBath
                            ? 'bg-blue-100 text-blue-900 border border-blue-300'
                            : sp.isShared
                            ? 'bg-purple-100 text-purple-900 border border-purple-200'
                            : 'bg-slate-100 text-slate-800'
                        }`}>
                          {sp.code}
                        </span>
                      </td>
                      <td className="p-2.5">
                        <div className="font-bold text-slate-800">{sp.name}</div>
                        {sp.isShared && (
                          <span className="text-[10px] text-purple-700 font-semibold">Shared: Lilin & Timah</span>
                        )}
                      </td>
                      {activeTab === 'Lilin' ? (
                        <>
                          <td className="p-2.5 text-center font-bold text-slate-600">
                            {sp.kapasitasMan ? `${sp.kapasitasMan} Man` : '-'}
                          </td>
                          <td className="p-2.5 text-center font-bold text-slate-600">
                            {sp.jmlMachine ? `${sp.jmlMachine} Mc` : '-'}
                          </td>
                          <td className="p-2.5 text-right font-mono font-bold text-slate-700">
                            {sp.leadtimeSec?.toLocaleString()}s
                          </td>
                          <td className="p-2.5 text-center font-bold text-slate-800">
                            {sp.capacityUnit}
                          </td>
                          <td className="p-2.5 text-right font-mono text-slate-600">
                            {sp.secPerBiji != null ? `${sp.secPerBiji}` : '-'}
                          </td>
                          <td className="p-2.5 text-right font-mono font-bold text-blue-800">
                            {sp.minPerBiji != null ? `${sp.minPerBiji}` : '-'}
                          </td>
                          <td className="p-2.5 text-right font-mono font-black bg-blue-50/30 text-blue-950">
                            {sp.defaultLeadTimeMinutes} mnt
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="p-2.5">
                            <div className="font-extrabold text-blue-900">{sp.leadtimeDisplay}</div>
                            <div className="text-[10px] text-slate-400">({sp.leadtimeSec.toLocaleString()} dtk)</div>
                          </td>
                          <td className="p-2.5">
                            <span className="font-bold text-slate-700">{sp.capacityUnit}</span>
                          </td>
                          <td className="p-2.5 font-semibold text-slate-700">
                            {sp.machines.length} Mesin
                          </td>
                        </>
                      )}
                      <td className="p-2.5">
                        {sp.isEFBath ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-extrabold">
                            Continuous Plating Bath
                          </span>
                        ) : sp.isShared ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold">
                            Mesin Bersama
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            Dedicated {activeTab}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Flow Calculator: "Kapan Harus Masuk Electroforming" */}
          <div className="bg-gradient-to-br from-blue-50/50 to-indigo-50/40 border border-blue-200 rounded-xl p-5 shadow-xs">
            <h4 className="font-black text-slate-900 text-xs uppercase tracking-wider mb-2 flex items-center space-x-2">
              <Calculator className="w-4 h-4 text-blue-600" />
              <span>Simulasi Alur Jadwal: Kapan Harus Masuk Electroforming</span>
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Jam Start Cetak (WIB)</label>
                <input
                  type="text"
                  value={calcStartHour}
                  onChange={(e) => setCalcStartHour(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Durasi Batch EF (Jam)</label>
                <input
                  type="number"
                  value={calcEfDuration}
                  onChange={(e) => setCalcEfDuration(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Tingkat Kesulitan</label>
                <select
                  value={calcDifficulty}
                  onChange={(e) => setCalcDifficulty(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white font-bold text-indigo-900"
                >
                  <option value={1.0}>1.0 (Normal)</option>
                  <option value={1.5}>1.5 (Rumit)</option>
                </select>
              </div>
            </div>

            {/* Results Timeline Progression */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center">
              <div className="p-3 bg-white border border-slate-200 rounded-xl">
                <div className="text-[10px] font-bold text-slate-400 uppercase">1. Start Cetak</div>
                <div className="text-sm font-black text-slate-800 mt-1">{flowResults.startCEL}</div>
                <div className="text-[10px] text-slate-500">Injeksi model</div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="text-[10px] font-bold text-amber-700 uppercase">2. Setting Tes Air</div>
                <div className="text-sm font-black text-amber-900 mt-1">{flowResults.settingTesAir}</div>
                <div className="text-[10px] text-amber-600 font-semibold">15 mnt sblm EF</div>
              </div>

              <div className="p-3 bg-blue-100/70 border border-blue-300 rounded-xl">
                <div className="text-[10px] font-bold text-blue-800 uppercase">3. Masuk Bath EF</div>
                <div className="text-sm font-black text-blue-900 mt-1">{flowResults.masukEF}</div>
                <div className="text-[10px] text-blue-700 font-bold">Gantung ke busbar</div>
              </div>

              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl">
                <div className="text-[10px] font-bold text-indigo-800 uppercase">4. Selesai EF</div>
                <div className="text-sm font-black text-indigo-900 mt-1">{flowResults.selesaiEF}</div>
                <div className="text-[10px] text-indigo-600 font-semibold">Batch 35 Jam</div>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                <div className="text-[10px] font-bold text-emerald-700 uppercase">5. Selesai Akhir (Bjd)</div>
                <div className="text-sm font-black text-emerald-900 mt-1">{flowResults.finalFinish}</div>
                <div className="text-[10px] text-emerald-700 font-bold">Total: {flowResults.totalHours} Jam</div>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Metode Produksi No. 34 — Perhitungan Kapasitas Mesin Mandiri
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-semibold hover:bg-slate-100"
            >
              Tutup
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition-all active:scale-95 flex items-center space-x-1.5"
            >
              <Save className="w-4 h-4" />
              <span>{saved ? 'Tersimpan!' : 'Simpan Parameter'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
