import React, { useState } from 'react';
import { 
  Save, 
  RotateCcw, 
  Search, 
  Trash2, 
  QrCode, 
  FileText, 
  User, 
  Layers, 
  Scale, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { SUBPROSES_LIST, INITIAL_OPERATORS } from '../data/initialData';

export default function SubprosesForm({
  transactions,
  onAddTransaction,
  onDeleteTransaction,
  orders
}) {
  // Form input states matching Gambar 1
  const [formData, setFormData] = useState({
    berat: '',
    biji: '',
    kodeTukang: '',
    namaTukang: '',
    subproses: '',
    namaSubproses: '',
    noVoucher: '',
    lokasi: '',
    proses: '',
    noOrder: '',
    keterangan: ''
  });

  const [searchTable, setSearchTable] = useState('');
  const [successNotice, setSuccessNotice] = useState(null);

  // Auto populate tukang on code change
  const handleKodeTukangChange = (code) => {
    const found = INITIAL_OPERATORS.find(op => op.id === code.trim());
    setFormData(prev => ({
      ...prev,
      kodeTukang: code,
      namaTukang: found ? found.name : prev.namaTukang
    }));
  };

  // Auto populate subproses on change
  const handleSubprosesChange = (code) => {
    const found = SUBPROSES_LIST.find(sp => sp.code === code);
    setFormData(prev => ({
      ...prev,
      subproses: code,
      namaSubproses: found ? found.name : '',
      proses: found ? found.name : prev.proses
    }));
  };

  // Auto populate order & voucher details
  const handleVoucherChange = (vNo) => {
    const found = orders.find(o => o.voucherNo.toLowerCase() === vNo.trim().toLowerCase());
    setFormData(prev => ({
      ...prev,
      noVoucher: vNo,
      noOrder: found ? found.id : prev.noOrder,
      biji: found ? found.biji : prev.biji,
      berat: found ? found.beratTotalGr : prev.berat,
      keterangan: found ? `Model: ${found.modelCode} - ${found.modelName}` : prev.keterangan
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.kodeTukang || !formData.subproses || !formData.noVoucher) {
      alert('Harap isi Kode Tukang, Sub Proses, dan No Voucher!');
      return;
    }

    const now = new Date();
    const formattedDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    const newTx = {
      id: `TRX-${Date.now().toString().slice(-4)}`,
      tukangId: formData.kodeTukang,
      tukangName: formData.namaTukang || 'OPERATOR ELECTROFORMING',
      voucherNo: formData.noVoucher.toUpperCase(),
      subproses: formData.subproses,
      subprosesName: formData.namaSubproses || formData.subproses,
      berat: parseFloat(formData.berat) || 0.0,
      biji: parseInt(formData.biji) || 0,
      lokasi: formData.lokasi || 'STATION-01',
      proses: formData.proses || formData.namaSubproses,
      noOrder: formData.noOrder || 'ORD-NEW',
      tanggalStart: formattedDate,
      tanggalFinish: '-',
      keterangan: formData.keterangan || '-'
    };

    onAddTransaction(newTx);
    setSuccessNotice(`Data setor tukang No Voucher ${newTx.voucherNo} berhasil disimpan!`);
    setTimeout(() => setSuccessNotice(null), 4000);

    // Reset form
    handleReset();
  };

  const handleReset = () => {
    setFormData({
      berat: '',
      biji: '',
      kodeTukang: '',
      namaTukang: '',
      subproses: '',
      namaSubproses: '',
      noVoucher: '',
      lokasi: '',
      proses: '',
      noOrder: '',
      keterangan: ''
    });
  };

  // Quick fill helper for testing
  const handleQuickFill = () => {
    handleKodeTukangChange('019393');
    handleSubprosesChange('HL2');
    handleVoucherChange('VZF2A40039');
    setFormData(prev => ({
      ...prev,
      lokasi: 'LINE-HL2-01',
      keterangan: 'Pemeriksaan batch HL2 sesuai SOP UBS'
    }));
  };

  const filteredTx = transactions.filter(tx => {
    const q = searchTable.toLowerCase();
    return (
      tx.voucherNo?.toLowerCase().includes(q) ||
      tx.tukangName?.toLowerCase().includes(q) ||
      tx.tukangId?.toLowerCase().includes(q) ||
      tx.subproses?.toLowerCase().includes(q) ||
      tx.keterangan?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Breadcrumb matching Gambar 1 */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center space-x-1.5 font-medium">
          <span>Transaksi</span>
          <span>&gt;</span>
          <span className="text-blue-600 font-semibold">Electroforming</span>
          <span>&gt;</span>
          <span className="text-slate-800 font-bold">Subproses</span>
        </div>
        <button
          onClick={handleQuickFill}
          className="text-xs text-blue-600 hover:text-blue-800 font-semibold underline"
        >
          [Isi Otomatis Sampel Gambar 1]
        </button>
      </div>

      {/* Page Title & Instructions matching Gambar 1 */}
      <div className="border-b border-slate-200 pb-3">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Setor Tukang per Sub Proses</h1>
        <p className="text-xs text-slate-500 mt-1">
          Scan tukang, isi kode sub proses, scan voucher, lalu simpan.
        </p>
      </div>

      {/* Success Notification */}
      {successNotice && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{successNotice}</span>
        </div>
      )}

      {/* Form Card matching Gambar 1 layout */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 md:p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Row 1: Berat & Biji */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Berat (gr)</label>
              <input
                type="number"
                step="0.01"
                value={formData.berat}
                onChange={(e) => setFormData({ ...formData, berat: e.target.value })}
                placeholder="Kosong = berat setoran sebelumnya / kartu"
                className="w-full px-3 py-2 text-xs bg-slate-50/60 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Biji (pcs)</label>
              <input
                type="number"
                value={formData.biji}
                onChange={(e) => setFormData({ ...formData, biji: e.target.value })}
                placeholder="Kosong = biji kartu"
                className="w-full px-3 py-2 text-xs bg-slate-50/60 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Row 2: Kode Tukang & Nama Tukang */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Kode Tukang <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.kodeTukang}
                  onChange={(e) => handleKodeTukangChange(e.target.value)}
                  placeholder="SCAN ID CARD / NO INDUK"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50/60 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors uppercase tracking-wider font-semibold"
                />
                <QrCode className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nama Tukang</label>
              <input
                type="text"
                value={formData.namaTukang}
                readOnly
                placeholder="Nama tukang"
                className="w-full px-3 py-2 text-xs bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-semibold cursor-not-allowed"
              />
            </div>
          </div>

          {/* Row 3: Sub Proses & Nama Sub Proses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Sub Proses <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.subproses}
                onChange={(e) => handleSubprosesChange(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50/60 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors font-medium"
              >
                <option value="">Pilih / scan kode sub proses</option>
                {SUBPROSES_LIST.map(sp => (
                  <option key={sp.code} value={sp.code}>
                    {sp.code} - {sp.name} ({sp.jigLimit || '-'})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nama Sub Proses</label>
              <input
                type="text"
                value={formData.namaSubproses}
                readOnly
                placeholder="Nama sub proses"
                className="w-full px-3 py-2 text-xs bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-semibold cursor-not-allowed"
              />
            </div>
          </div>

          {/* Row 4: No Voucher, Lokasi, Proses, No Order */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                No Voucher <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.noVoucher}
                  onChange={(e) => handleVoucherChange(e.target.value)}
                  placeholder="SCAN NO VOUCHER"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50/60 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors uppercase font-mono font-bold text-blue-900"
                />
                <QrCode className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Lokasi</label>
              <input
                type="text"
                value={formData.lokasi}
                onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
                placeholder="Lokasi (cth: LINE-HL2)"
                className="w-full px-3 py-2 text-xs bg-slate-50/60 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Proses</label>
              <input
                type="text"
                value={formData.proses}
                onChange={(e) => setFormData({ ...formData, proses: e.target.value })}
                placeholder="Proses"
                className="w-full px-3 py-2 text-xs bg-slate-50/60 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">No Order</label>
              <input
                type="text"
                value={formData.noOrder}
                onChange={(e) => setFormData({ ...formData, noOrder: e.target.value })}
                placeholder="No Order"
                className="w-full px-3 py-2 text-xs bg-slate-50/60 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors font-mono"
              />
            </div>
          </div>

          {/* Row 5: Keterangan */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Keterangan</label>
            <input
              type="text"
              value={formData.keterangan}
              onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
              placeholder="Keterangan tambahan (cth: setting tes air, kondisi bath, atau catatan model)"
              className="w-full px-3 py-2 text-xs bg-slate-50/60 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Buttons matching Gambar 1 */}
          <div className="flex items-center space-x-3 pt-2">
            <button
              type="submit"
              className="inline-flex items-center space-x-2 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Simpan</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center space-x-2 px-4 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4 text-slate-500" />
              <span>Batal</span>
            </button>
          </div>
        </form>
      </div>

      {/* Table matching Gambar 1 below form */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Table Search bar */}
        <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
          <div className="text-xs font-bold text-slate-700">
            Daftar Setoran BDP Subproses ({filteredTx.length} Data)
          </div>
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTable}
              onChange={(e) => setSearchTable(e.target.value)}
              placeholder="Cari..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-600 uppercase tracking-wider font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Tukang</th>
                <th className="py-3 px-4">No Voucher</th>
                <th className="py-3 px-4">Sub Prs</th>
                <th className="py-3 px-4 text-right">Berat</th>
                <th className="py-3 px-4 text-right">Biji</th>
                <th className="py-3 px-4">Tanggal Start</th>
                <th className="py-3 px-4">Tanggal Finish</th>
                <th className="py-3 px-4">Keterangan</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredTx.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-8 text-slate-400">
                    Belum ada data setoran subproses. Silakan input pada form di atas.
                  </td>
                </tr>
              ) : (
                filteredTx.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{tx.tukangId}</div>
                      <div className="text-[11px] text-slate-500">{tx.tukangName}</div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-blue-700">
                      {tx.voucherNo}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded font-bold text-[11px] bg-blue-50 text-blue-800 border border-blue-200">
                        {tx.subproses}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-medium">
                      {Number(tx.berat).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-800">
                      {tx.biji}
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                      {tx.tanggalStart}
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                      {tx.tanggalFinish}
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate text-slate-600">
                      {tx.keterangan}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => onDeleteTransaction(tx.id)}
                        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                        title="Hapus Baris"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
