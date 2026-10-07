import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ScheduleTimeline from './components/ScheduleTimeline';
import SubprosesForm from './components/SubprosesForm';
import TahapanTimelineModal from './components/TahapanTimelineModal';
import MasterMesinModal from './components/MasterMesinModal';
import MasterSubprosesModal from './components/MasterSubprosesModal';
import MasterOperatorModal from './components/MasterOperatorModal';
import RekapOrderModal from './components/RekapOrderModal';
import LaporanPlanReal from './components/LaporanPlanReal';
import { getSystemShiftInfo } from './utils/dateUtils';
import { 
  INITIAL_MACHINES, 
  INITIAL_ORDERS, 
  INITIAL_TRANSACTIONS, 
  INITIAL_SCHEDULE_BLOCKS,
  SUBPROSES_LIST 
} from './data/initialData';
import { 
  Zap, 
  Layers, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowUpRight, 
  CalendarClock, 
  Cpu, 
  Users, 
  Scale, 
  Droplets,
  Sparkles
} from 'lucide-react';

export default function App() {
  // Navigation & UI state
  const [activeMenu, setActiveMenu] = useState('schedule-timeline'); // default view directly to Schedule Timeline page
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Core Data state
  const [machines, setMachines] = useState(INITIAL_MACHINES);
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [scheduleBlocks, setScheduleBlocks] = useState(INITIAL_SCHEDULE_BLOCKS);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Modals state
  const [isTahapanOpen, setIsTahapanOpen] = useState(false);
  const [isMasterMesinOpen, setIsMasterMesinOpen] = useState(false);
  const [isMasterSubprosesOpen, setIsMasterSubprosesOpen] = useState(false);
  const [isMasterOperatorOpen, setIsMasterOperatorOpen] = useState(false);
  const [isRekapOpen, setIsRekapOpen] = useState(false);

  // Real-time sysdate and production shift tracking
  const [sysInfo, setSysInfo] = useState(() => getSystemShiftInfo());

  useEffect(() => {
    const timer = setInterval(() => {
      setSysInfo(getSystemShiftInfo());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  // Transaction operations
  const handleAddTransaction = (newTx) => {
    setTransactions([newTx, ...transactions]);

    // Also update order if matching voucher
    setOrders(orders.map(o => {
      if (o.voucherNo === newTx.voucherNo) {
        return {
          ...o,
          currentSubproses: newTx.subproses,
          status: newTx.subproses === 'EF' ? 'In EF Bath' : 'In Progress'
        };
      }
      return o;
    }));
  };

  const handleDeleteTransaction = (id) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  // Calculate high-level stats
  const totalUnits = orders.reduce((sum, o) => sum + (o.biji || 0), 0);
  const inEfCount = orders.filter(o => o.status === 'In EF Bath').length;

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans">
      {/* Top Header matching UBS branding with real-time sysdate & shift */}
      <Header
        activeShift={sysInfo}
        currentDateStr={sysInfo.currentDateStr}
        avgUtilization="75.4"
        onOpenTahapanModal={() => setIsTahapanOpen(true)}
        onOpenRekapModal={() => setIsRekapOpen(true)}
        machineCount={machines.length}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar matching Gambar 1 navigation structure */}
        <Sidebar
          activeMenu={activeMenu}
          setActiveMenu={setActiveMenu}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          onOpenMasterMesin={() => setIsMasterMesinOpen(true)}
          onOpenMasterSubproses={() => setIsMasterSubprosesOpen(true)}
          onOpenMasterOperator={() => setIsMasterOperatorOpen(true)}
          onOpenTahapanModal={() => setIsTahapanOpen(true)}
          onOpenRekapModal={() => setIsRekapOpen(true)}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
          
          {/* VIEW SWITCHER / CONTENT */}
          {activeMenu === 'schedule-timeline' && (
            <div className="space-y-3">
              {/* Gantt Chart Matching Gambar 2 */}
              <ScheduleTimeline
                machines={machines}
                orders={orders}
                sysInfo={sysInfo}
                onUpdateOrders={setOrders}
                onSelectOrder={(ord) => {
                  setSelectedOrder(ord);
                }}
                onOpenTahapanModal={() => setIsTahapanOpen(true)}
                onOpenMasterMesin={() => setIsMasterMesinOpen(true)}
                scheduleBlocks={scheduleBlocks}
                onUpdateScheduleBlocks={setScheduleBlocks}
              />
            </div>
          )}

          {activeMenu === 'plan-vs-real' && (
            /* Laporan Plan vs Real Matching Gambar 1 & Detailed Analysis */
            <LaporanPlanReal
              orders={orders}
              scheduleBlocks={scheduleBlocks}
              transactions={transactions}
              sysInfo={sysInfo}
            />
          )}

          {activeMenu === 'subproses' && (
            /* Setor Tukang Form & Table Matching Gambar 1 */
            <SubprosesForm
              transactions={transactions}
              onAddTransaction={handleAddTransaction}
              onDeleteTransaction={handleDeleteTransaction}
              orders={orders}
            />
          )}

          {activeMenu === 'jig' && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="border-b border-slate-200 pb-3 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Manajemen Jig STY (Jigging sampai ST 2)</h2>
                  <p className="text-xs text-slate-500">Ketentuan notulen meeting: "Jig itu sampai ST 2" sebelum memasuki bath Electroforming</p>
                </div>
                <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-lg border border-amber-300">
                  Batasan: ST 2
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 border rounded-xl bg-slate-50">
                  <h4 className="font-bold text-slate-800 mb-1">ST 1 (Rangka Dasar)</h4>
                  <p className="text-slate-500">Pemasangan pin konduktor kawat tembaga pada model lilin/timah.</p>
                </div>
                <div className="p-4 border rounded-xl bg-amber-50/60 border-amber-200">
                  <h4 className="font-bold text-amber-900 mb-1">ST 2 (Rakitan Siap Bath)</h4>
                  <p className="text-slate-600">Pengecekan kontinuitas listrik cat perak, tes air, dan siap gantung ke busbar EF.</p>
                </div>
                <div className="p-4 border rounded-xl bg-slate-50">
                  <h4 className="font-bold text-slate-800 mb-1">Status Kesiapan Jig</h4>
                  <p className="text-emerald-700 font-bold">12 Jig Rakitan Siap Masuk Bath EF</p>
                </div>
              </div>
            </div>
          )}

          {activeMenu === 'dashboard' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-[#0a3866] to-[#16579b] rounded-2xl p-6 text-white shadow-md">
                <div className="flex flex-wrap justify-between items-center gap-4">
                  <div>
                    <span className="px-2.5 py-1 bg-white/20 rounded-full text-xs font-semibold uppercase tracking-wider">
                      Executive Summary Produksi
                    </span>
                    <h2 className="text-2xl font-black mt-2">Sistem Jadwal Electroforming UBS Gold</h2>
                    <p className="text-xs text-blue-100 max-w-2xl mt-1 leading-relaxed">
                      Implementasi Metode Produksi No. 34: Perhitungan kapasitas mesin individual, alokasi 1 model per mesin, siklus batch 25-30 jam, jeda 5 menit setup, serta pembagian shift 07:00 / 15:00 / 23:00.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setActiveMenu('plan-vs-real')}
                      className="px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs rounded-xl shadow-md transition-transform active:scale-95 flex items-center space-x-1.5"
                    >
                      <BarChart3 className="w-4 h-4" />
                      <span>Laporan Plan vs Real</span>
                    </button>
                    <button
                      onClick={() => setActiveMenu('schedule-timeline')}
                      className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-900 font-black text-xs rounded-xl shadow-md transition-transform active:scale-95"
                    >
                      Buka Timeline Gantt
                    </button>
                    <button
                      onClick={() => setActiveMenu('subproses')}
                      className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white font-bold text-xs rounded-xl border border-white/30"
                    >
                      Buka Setor Tukang
                    </button>
                  </div>
                </div>
              </div>

              {/* Subproses Flow Overview */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">
                  Pipeline 9 Subproses Electroforming:
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                  {SUBPROSES_LIST.map((sp, idx) => (
                    <div key={sp.id} className="p-3 border border-slate-200 rounded-xl bg-slate-50/50">
                      <div className="text-[10px] text-blue-600 font-bold mb-1">Tahap {idx + 1}</div>
                      <div className="font-bold text-slate-800 truncate">{sp.name}</div>
                      <div className="text-[10px] text-slate-500 mt-1">
                        {sp.isEFBath ? '25-30 Jam Batch' : `${sp.defaultLeadTimeMin} Menit`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeMenu !== 'schedule-timeline' && activeMenu !== 'subproses' && activeMenu !== 'jig' && activeMenu !== 'dashboard' && (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">
              <Activity className="w-8 h-8 text-blue-500 mx-auto mb-2 opacity-50" />
              <p className="font-bold text-slate-700">Modul {activeMenu} Terhubung dengan Sistem Subproses</p>
              <p className="text-xs text-slate-400 mt-1">Gunakan menu navigasi di sebelah kiri untuk melihat Schedule Timeline atau Setor Tukang.</p>
            </div>
          )}

        </main>
      </div>

      {/* MODALS */}
      {/* 1. Modal Timeline Tahapan Matching Gambar 3 */}
      <TahapanTimelineModal
        isOpen={isTahapanOpen}
        onClose={() => setIsTahapanOpen(false)}
        selectedOrder={selectedOrder}
        onSaveTimeline={() => {}}
      />

      {/* 2. Modal Master Mesin (4 Mesin, 3 Lilin 1 Timah, 2:2 switch) */}
      <MasterMesinModal
        isOpen={isMasterMesinOpen}
        onClose={() => setIsMasterMesinOpen(false)}
        machines={machines}
        onUpdateMachines={setMachines}
      />

      {/* 3. Modal Master 9 Subproses & Lead Time */}
      <MasterSubprosesModal
        isOpen={isMasterSubprosesOpen}
        onClose={() => setIsMasterSubprosesOpen(false)}
      />

      {/* 4. Modal Master Operator & Headcount per proses */}
      <MasterOperatorModal
        isOpen={isMasterOperatorOpen}
        onClose={() => setIsMasterOperatorOpen(false)}
      />

      {/* 5. Modal Rekap Orderan (~20 Model Harian, Auto Scheduler) */}
      <RekapOrderModal
        isOpen={isRekapOpen}
        onClose={() => setIsRekapOpen(false)}
        orders={orders}
        onUpdateOrders={setOrders}
        machines={machines}
        onOpenTahapanModal={() => {
          setIsRekapOpen(false);
          setIsTahapanOpen(true);
        }}
      />
    </div>
  );
}
