import React from 'react';
import { Search, Bell, Clock, Cpu, Layers, ShieldCheck, HelpCircle } from 'lucide-react';

export default function Header({ 
  activeShift, 
  currentDateStr, 
  avgUtilization,
  onOpenTahapanModal,
  onOpenRekapModal,
  machineCount = 4
}) {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
      <div className="flex items-center justify-between px-4 lg:px-6 h-16">
        {/* Left: Brand & Title matching Gambar 1 with uploaded blue logo */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <img 
              src="/ubs-logo-blue.png" 
              alt="UBS GOLD - Trust in Gold" 
              className="h-9 w-auto object-contain cursor-pointer hover:opacity-95 transition-opacity" 
            />
            <div className="hidden sm:block border-l border-slate-200 pl-3">
              <span className="font-bold text-sm text-slate-800 tracking-tight">Program SubProses</span>
            </div>
          </div>

          <div className="h-6 w-[1px] bg-slate-200 hidden md:block"></div>

          {/* Shift & Time indicator */}
          <div className="flex items-center space-x-2 text-xs bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full shadow-2xs">
            <span className="flex items-center space-x-1.5 text-slate-800 font-bold">
              <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>{currentDateStr || 'Rabu, 07 Okt 2026'}</span>
            </span>
            <span className="text-slate-300 hidden sm:inline">|</span>
            <span className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold text-[11px] transition-colors border ${activeShift?.badgeColor || 'bg-emerald-100 text-emerald-800 border-emerald-300'}`}>
              <span>Shift {activeShift?.shiftNum || 1} ({activeShift?.timeRange || '07:00 - 15:00 WIB'})</span>
              {activeShift?.breakSchedule && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold border ${activeShift?.isBreakTime ? 'bg-amber-400 text-amber-950 border-amber-500 animate-pulse' : 'bg-emerald-200/80 text-emerald-900 border-emerald-300'}`}>
                  ☕ Istirahat: {activeShift?.breakSchedule?.shortDisplay}
                </span>
              )}
            </span>
          </div>
        </div>

        {/* Center: Search input matching Gambar 1 */}
        <div className="flex-1 max-w-md mx-4 hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari menu, no voucher, model..."
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Right: Notification & Profile matching Gambar 1 */}
        <div className="flex items-center space-x-3">
          {/* Notification icon */}
          <button className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full"></span>
          </button>

          {/* User profile matching Gambar 1: JY - Joshua Yordana ICT */}
          <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold text-xs flex items-center justify-center shadow-inner">
              JY
            </div>
            <div className="hidden xl:block text-left">
              <div className="text-xs font-bold text-slate-800 leading-tight">JOSHUA YORDANA</div>
              <div className="text-[10px] text-slate-500 font-semibold">ICT Dept</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
