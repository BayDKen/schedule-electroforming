import React, { useState } from 'react';
import { 
  X, 
  ChevronUp, 
  ChevronDown, 
  Save, 
  Clock, 
  Layers, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle,
  Calendar,
  Sparkles
} from 'lucide-react';
import { SUBPROSES_LIST } from '../data/initialData';

export default function TahapanTimelineModal({
  isOpen,
  onClose,
  selectedOrder,
  onSaveTimeline
}) {
  if (!isOpen) return null;

  // Initialize stages with default schedule or order's schedule
  const [stages, setStages] = useState(() => {
    return SUBPROSES_LIST.map((sp, idx) => {
      // Calculate sample dates based on base date 05/10/2026
      const base = new Date('2026-10-05T07:00:00');
      let offsetHours = 0;
      if (idx === 0) offsetHours = 0;
      else if (idx === 1) offsetHours = 1.5;
      else if (idx === 2) offsetHours = 2.5;
      else if (idx === 3) offsetHours = 3.5;
      else if (idx === 4) offsetHours = 5.0; // EF starts
      else if (idx === 5) offsetHours = 31.0; // after EF 26h
      else if (idx === 6) offsetHours = 32.5;
      else if (idx === 7) offsetHours = 34.0;
      else if (idx === 8) offsetHours = 35.5;
      else if (idx === 9) offsetHours = 37.5;

      const durationH = sp.id === 'SP-05' ? 26 : (sp.defaultLeadTimeMin ? sp.defaultLeadTimeMin / 60 : 1);
      
      const startD = new Date(base.getTime() + offsetHours * 3600 * 1000);
      const endD = new Date(startD.getTime() + durationH * 3600 * 1000);

      const formatDt = (d) => {
        const dd = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const yyyy = d.getFullYear();
        const hh = String(d.getHours()).padStart(2, '0');
        const min = String(d.getMinutes()).padStart(2, '0');
        return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
      };

      return {
        stepNumber: idx + 1,
        code: sp.code,
        name: sp.name,
        jigLimit: sp.jigLimit,
        durationDisplay: sp.id === 'SP-05' ? '26 Jam (EF)' : `${sp.defaultLeadTimeMin || 60} Menit`,
        tglMulai: formatDt(startD),
        tglSelesai: formatDt(endD)
      };
    });
  });

  const [savedNotice, setSavedNotice] = useState(false);

  // Move stage up matching Gambar 3
  const moveUp = (index) => {
    if (index === 0) return;
    const newStages = [...stages];
    const temp = newStages[index - 1];
    newStages[index - 1] = newStages[index];
    newStages[index] = temp;
    
    // update step numbers
    newStages.forEach((s, i) => s.stepNumber = i + 1);
    setStages(newStages);
  };

  // Move stage down matching Gambar 3
  const moveDown = (index) => {
    if (index === stages.length - 1) return;
    const newStages = [...stages];
    const temp = newStages[index + 1];
    newStages[index + 1] = newStages[index];
    newStages[index] = temp;
    
    // update step numbers
    newStages.forEach((s, i) => s.stepNumber = i + 1);
    setStages(newStages);
  };

  const handleDateChange = (index, field, value) => {
    const newStages = [...stages];
    newStages[index][field] = value;
    setStages(newStages);
  };

  const handleSave = () => {
    if (onSaveTimeline) {
      onSaveTimeline(stages);
    }
    setSavedNotice(true);
    setTimeout(() => {
      setSavedNotice(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header matching Gambar 3 */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div>
            <h2 className="text-base font-black text-slate-900 uppercase tracking-wider flex items-center space-x-2">
              <Layers className="w-5 h-5 text-blue-600" />
              <span>TIMELINE TAHAPAN</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Urutan 9 Subproses Electroforming: Cetak Lilin &gt; Wash &gt; Silver oil &gt; STY &gt; EF &gt; STR &gt; HL1 &gt; HL2 &gt; Annealing &gt; Test Kadar
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Order Summary if available */}
        {selectedOrder && (
          <div className="bg-blue-50/70 border-b border-blue-100 px-6 py-2.5 flex flex-wrap items-center justify-between text-xs text-blue-900">
            <div className="flex items-center space-x-3">
              <span className="font-bold">Order: {selectedOrder.voucherNo}</span>
              <span>Model: <strong>{selectedOrder.modelCode}</strong></span>
              <span>Biji: <strong>{selectedOrder.biji} pcs</strong></span>
              <span>Material: <strong>{selectedOrder.materialType}</strong></span>
            </div>
            <span className="text-[11px] bg-blue-200/80 text-blue-800 px-2 py-0.5 rounded font-semibold">
              Kapasitas: {selectedOrder.volumeMl} ml
            </span>
          </div>
        )}

        {/* Modal Body / Table matching Gambar 3 */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f1f5f9] text-slate-600 uppercase font-bold text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">#</th>
                  <th className="py-3 px-4 w-24 text-center">URUTAN</th>
                  <th className="py-3 px-6">TAHAPAN</th>
                  <th className="py-3 px-4 w-52">TGL MULAI</th>
                  <th className="py-3 px-4 w-52">TGL SELESAI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stages.map((st, index) => (
                  <tr key={index} className="hover:bg-slate-50/80 transition-colors">
                    {/* Number */}
                    <td className="py-3 px-4 text-center font-bold text-slate-500">
                      {st.stepNumber}
                    </td>

                    {/* Up & Down Arrows in pill box matching Gambar 3 */}
                    <td className="py-2.5 px-4 text-center">
                      <div className="inline-flex items-center border border-blue-300 rounded-md bg-blue-50/50 p-0.5">
                        <button
                          type="button"
                          onClick={() => moveUp(index)}
                          disabled={index === 0}
                          className={`p-1 rounded hover:bg-blue-100 text-blue-700 transition-colors ${
                            index === 0 ? 'opacity-30 cursor-not-allowed' : ''
                          }`}
                          title="Geser Naik"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <div className="w-[1px] h-3.5 bg-blue-200"></div>
                        <button
                          type="button"
                          onClick={() => moveDown(index)}
                          disabled={index === stages.length - 1}
                          className={`p-1 rounded hover:bg-blue-100 text-blue-700 transition-colors ${
                            index === stages.length - 1 ? 'opacity-30 cursor-not-allowed' : ''
                          }`}
                          title="Geser Turun"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    {/* Stage Name & Details */}
                    <td className="py-3 px-6">
                      <div className="font-bold text-slate-800 text-xs uppercase tracking-wide">
                        {st.name}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 flex items-center space-x-2">
                        <span>Kode: {st.code}</span>
                        <span>•</span>
                        <span>Estimasi: {st.durationDisplay}</span>
                        {st.jigLimit && (
                          <>
                            <span>•</span>
                            <span className="text-blue-600 font-semibold">{st.jigLimit}</span>
                          </>
                        )}
                      </div>
                    </td>

                    {/* Start Date Input matching Gambar 3 */}
                    <td className="py-2.5 px-4">
                      <input
                        type="text"
                        value={st.tglMulai}
                        onChange={(e) => handleDateChange(index, 'tglMulai', e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="DD/MM/YYYY HH:mm"
                      />
                    </td>

                    {/* End Date Input matching Gambar 3 */}
                    <td className="py-2.5 px-4">
                      <input
                        type="text"
                        value={st.tglSelesai}
                        onChange={(e) => handleDateChange(index, 'tglSelesai', e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="DD/MM/YYYY HH:mm"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500 flex items-center space-x-1.5">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>Total Lead Time Est: <strong>~37.5 Jam</strong> (termasuk 26 Jam EF Bath & 5 Menit Setup)</span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Tutup
            </button>
            <button
              onClick={handleSave}
              className="inline-flex items-center space-x-2 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
            >
              {savedNotice ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Tersimpan!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Simpan Urutan & Timeline</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
