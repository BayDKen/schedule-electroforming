import React, { useState } from 'react';
import { 
  Home, 
  KeyRound, 
  Layers, 
  FileText, 
  Zap, 
  CalendarClock, 
  History, 
  BarChart3, 
  Activity, 
  CheckSquare, 
  GitMerge, 
  FolderTree, 
  ChevronDown, 
  ChevronRight, 
  ChevronLeft, 
  Settings, 
  Users, 
  Cpu, 
  Clock,
  Menu
} from 'lucide-react';

export default function Sidebar({ 
  activeMenu, 
  setActiveMenu, 
  isCollapsed, 
  setIsCollapsed,
  onOpenMasterMesin,
  onOpenMasterSubproses,
  onOpenMasterOperator,
  onOpenTahapanModal,
  onOpenRekapModal
}) {
  const [efOpen, setEfOpen] = useState(true);
  const [masterOpen, setMasterOpen] = useState(true);

  return (
    <aside 
      className={`bg-white border-r border-slate-200 transition-all duration-300 flex flex-col shrink-0 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* User profile card matching Gambar 1 */}
      {!isCollapsed && (
        <div className="p-4 border-b border-slate-100 flex items-center space-x-3 bg-slate-50/50">
          <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center shadow-sm">
            JY
          </div>
          <div className="overflow-hidden">
            <h4 className="text-xs font-bold text-slate-800 tracking-wide truncate">JOSHUA YORDANA</h4>
            <p className="text-[11px] text-slate-400 font-semibold tracking-wider">ICT</p>
          </div>
        </div>
      )}

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-4 custom-scrollbar text-xs">
        {/* HOME GROUP */}
        <div>
          {!isCollapsed && (
            <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Home
            </p>
          )}
          <div className="space-y-0.5">
            <button
              onClick={() => setActiveMenu('dashboard')}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'px-3'} py-2 rounded-lg text-left transition-colors ${
                activeMenu === 'dashboard'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
              title="Dashboard"
            >
              <Home className="w-4 h-4 shrink-0 text-slate-500" />
              {!isCollapsed && <span className="ml-3 truncate">Dashboard</span>}
            </button>

            <button
              onClick={() => setActiveMenu('access')}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'px-3'} py-2 rounded-lg text-left transition-colors ${
                activeMenu === 'access'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
              title="Access Management"
            >
              <KeyRound className="w-4 h-4 shrink-0 text-slate-500" />
              {!isCollapsed && <span className="ml-3 truncate">Access Management</span>}
            </button>
          </div>
        </div>

        {/* IN TRANSACTION GROUP */}
        <div>
          {!isCollapsed && (
            <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              In Transaction
            </p>
          )}
          <div className="space-y-0.5">
            <button
              onClick={() => setActiveMenu('nt-mesin')}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'px-3'} py-2 rounded-lg text-left transition-colors ${
                activeMenu === 'nt-mesin' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-600 hover:bg-slate-100'
              }`}
              title="NT Mesin"
            >
              <Cpu className="w-4 h-4 shrink-0 text-slate-500" />
              {!isCollapsed && <span className="ml-3 truncate">NT Mesin</span>}
            </button>

            <button
              onClick={() => setActiveMenu('form')}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'px-3'} py-2 rounded-lg text-left transition-colors ${
                activeMenu === 'form' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-600 hover:bg-slate-100'
              }`}
              title="Form"
            >
              <FileText className="w-4 h-4 shrink-0 text-slate-500" />
              {!isCollapsed && <span className="ml-3 truncate">Form</span>}
            </button>

            {/* Electroforming Submenu */}
            <div className="pt-0.5">
              <button
                onClick={() => setEfOpen(!efOpen)}
                className={`w-full flex items-center justify-between ${isCollapsed ? 'justify-center px-0' : 'px-3'} py-2 rounded-lg text-left text-blue-800 font-semibold hover:bg-blue-50/60 transition-colors`}
                title="Electroforming"
              >
                <div className="flex items-center">
                  <Zap className="w-4 h-4 shrink-0 text-blue-600" />
                  {!isCollapsed && <span className="ml-3">Electroforming</span>}
                </div>
                {!isCollapsed && (
                  efOpen ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>

              {(!isCollapsed && efOpen) && (
                <div className="pl-6 pr-1 py-1 space-y-0.5 border-l-2 border-blue-100 ml-4">
                  <button
                    onClick={() => setActiveMenu('schedule-timeline')}
                    className={`w-full flex items-center px-3 py-1.5 rounded-lg text-left transition-all ${
                      activeMenu === 'schedule-timeline'
                        ? 'bg-blue-600 text-white font-semibold shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <CalendarClock className="w-3.5 h-3.5 mr-2 shrink-0" />
                    <span className="truncate">Schedule (Gantt)</span>
                  </button>

                  <button
                    onClick={() => setActiveMenu('plan-vs-real')}
                    className={`w-full flex items-center px-3 py-1.5 rounded-lg text-left transition-all ${
                      activeMenu === 'plan-vs-real'
                        ? 'bg-blue-600 text-white font-semibold shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <BarChart3 className="w-3.5 h-3.5 mr-2 shrink-0 text-amber-500" />
                    <span className="truncate font-semibold">Laporan Plan vs Real</span>
                    <span className="ml-auto text-[9px] px-1 py-0.2 rounded bg-amber-400 text-slate-950 font-black">Live</span>
                  </button>

                  <button
                    onClick={() => setActiveMenu('subproses')}
                    className={`w-full flex items-center px-3 py-1.5 rounded-lg text-left transition-all ${
                      activeMenu === 'subproses'
                        ? 'bg-blue-600 text-white font-semibold shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-2.5"></span>
                    <span className="truncate">Setor Tukang</span>
                  </button>

                  <button
                    onClick={() => setActiveMenu('jig')}
                    className={`w-full flex items-center px-3 py-1.5 rounded-lg text-left transition-all ${
                      activeMenu === 'jig' ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-2.5"></span>
                    <span className="truncate">Jig (ST 2)</span>
                  </button>

                  <button
                    onClick={() => setActiveMenu('history-voucher')}
                    className={`w-full flex items-center px-3 py-1.5 rounded-lg text-left transition-all ${
                      activeMenu === 'history-voucher' ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-2.5"></span>
                    <span className="truncate">History Voucher</span>
                  </button>

                  <button
                    onClick={() => setActiveMenu('monitor-bdp')}
                    className={`w-full flex items-center px-3 py-1.5 rounded-lg text-left transition-all ${
                      activeMenu === 'monitor-bdp' ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-2.5"></span>
                    <span className="truncate">Monitor BDP</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* DATA MASTER & METODE 34 GROUP */}
        <div>
          {!isCollapsed && (
            <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Data Master
            </p>
          )}
          <div className="space-y-0.5">
            <button
              onClick={onOpenMasterMesin}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'px-3'} py-1.5 rounded-lg text-left text-slate-600 hover:bg-slate-100 transition-colors`}
              title="Master Mesin (4 Mesin, 3 Lilin 1 Timah / 2 Lilin 2 Timah)"
            >
              <Cpu className="w-4 h-4 shrink-0 text-indigo-500" />
              {!isCollapsed && <span className="ml-3 truncate">Master Mesin EF (4)</span>}
            </button>

            <button
              onClick={onOpenMasterSubproses}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'px-3'} py-1.5 rounded-lg text-left text-slate-600 hover:bg-slate-100 transition-colors`}
              title="Master 9 Subproses & Lead Time"
            >
              <Clock className="w-4 h-4 shrink-0 text-cyan-500" />
              {!isCollapsed && <span className="ml-3 truncate">Master 9 Subproses & LT</span>}
            </button>

            <button
              onClick={onOpenMasterOperator}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'px-3'} py-1.5 rounded-lg text-left text-slate-600 hover:bg-slate-100 transition-colors`}
              title="Master Orang / Operator per Proses"
            >
              <Users className="w-4 h-4 shrink-0 text-emerald-500" />
              {!isCollapsed && <span className="ml-3 truncate">Master Tukang / Operator</span>}
            </button>
          </div>
        </div>

        {/* OUT TRANSACTION */}
        <div>
          {!isCollapsed && (
            <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Out Transaction
            </p>
          )}
          <div className="space-y-0.5">
            <button
              onClick={() => setActiveMenu('qc')}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'px-3'} py-1.5 rounded-lg text-left text-slate-600 hover:bg-slate-100`}
            >
              <CheckSquare className="w-4 h-4 shrink-0 text-slate-500" />
              {!isCollapsed && <span className="ml-3 truncate">Quality Control</span>}
            </button>
            <button
              onClick={() => setActiveMenu('bdp-sambung')}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'px-3'} py-1.5 rounded-lg text-left text-slate-600 hover:bg-slate-100`}
            >
              <GitMerge className="w-4 h-4 shrink-0 text-slate-500" />
              {!isCollapsed && <span className="ml-3 truncate">BDP Sambung</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Collapse Menu button matching Gambar 1 */}
      <div className="p-3 border-t border-slate-200">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-center p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors text-xs font-medium"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : (
            <div className="flex items-center space-x-2">
              <ChevronLeft className="w-4 h-4" />
              <span>Collapse Menu</span>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
}
