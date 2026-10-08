import React, { useState, useRef, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  ZoomIn, 
  ZoomOut, 
  ChevronLeft, 
  ChevronRight, 
  Filter, 
  AlertTriangle, 
  CheckCircle2, 
  RotateCcw,
  Sparkles,
  Zap,
  Info,
  Layers,
  ChevronDown,
  ChevronUp,
  Cpu,
  Flame,
  Droplets,
  Eye,
  Maximize2,
  Plus,
  Lock,
  Unlock,
  AlertOctagon,
  Wrench,
  CheckCircle,
  Workflow,
  GitBranch,
  ArrowRight,
  Trash2,
  List,
  ClipboardList
} from 'lucide-react';
import { 
  LILIN_PROCESSES, 
  TIMAH_PROCESSES, 
  INITIAL_SCHEDULE_BLOCKS, 
  INITIAL_MACHINES 
} from '../data/initialData';
import AddScheduleModal from './AddScheduleModal';
import EditScheduleModal from './EditScheduleModal';
import OrderPipelineModal from './OrderPipelineModal';
import ProcessVoucherSummaryModal from './ProcessVoucherSummaryModal';
import { cascadeOrderSteps, SETUP_BUFFER_HOURS, formatTimelineHour } from '../utils/pipelineUtils';

export default function ScheduleTimeline({
  machines = INITIAL_MACHINES,
  orders,
  sysInfo,
  onUpdateOrders,
  onSelectOrder,
  onOpenTahapanModal,
  onOpenMasterMesin,
  scheduleBlocks: propScheduleBlocks,
  onUpdateScheduleBlocks
}) {
  // Main pipeline tab: 'Lilin' (11 proses), 'Timah' (14 proses), or 'ALL' (Terpadu)
  const [activePipeline, setActivePipeline] = useState('Lilin');

  // Timeline zoom & scroll & horizon state
  const [zoomLevel, setZoomLevel] = useState(48); // width in px per hour
  const [timelineHorizonMode, setTimelineHorizonMode] = useState('auto'); // 'auto' (ikuti jadwal) or number of days
  const [processFilter, setProcessFilter] = useState('ALL');
  const [collapsedProcesses, setCollapsedProcesses] = useState({});
  
  // Schedule blocks state (independent draggable blocks per process & machine)
  const [internalScheduleBlocks, setInternalScheduleBlocks] = useState(INITIAL_SCHEDULE_BLOCKS);
  const scheduleBlocks = propScheduleBlocks || internalScheduleBlocks;
  const setScheduleBlocks = (val) => {
    if (onUpdateScheduleBlocks) {
      if (typeof val === 'function') {
        onUpdateScheduleBlocks(val(scheduleBlocks));
      } else {
        onUpdateScheduleBlocks(val);
      }
    } else {
      setInternalScheduleBlocks(val);
    }
  };
  const [draggedBlock, setDraggedBlock] = useState(null);
  const [hoveredTarget, setHoveredTarget] = useState(null);
  const [conflictWarning, setConflictWarning] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [history, setHistory] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Edit / Detail modal state
  const [selectedEditBlock, setSelectedEditBlock] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Order chain highlighting & pipeline modal state
  const [highlightedVoucher, setHighlightedVoucher] = useState('VZF2A40039');
  const [isPipelineModalOpen, setIsPipelineModalOpen] = useState(false);
  const [pipelineModalVoucher, setPipelineModalVoucher] = useState('VZF2A40039');

  // Process voucher summary modal state
  const [isVoucherSummaryOpen, setIsVoucherSummaryOpen] = useState(false);
  const [selectedProcessForSummary, setSelectedProcessForSummary] = useState(null);

  // Machine state with Trouble / Maintenance & Floating management
  const [machineStatusOverrides, setMachineStatusOverrides] = useState({
    'EF-03': { isFloating: true, assignment: 'Lilin', status: 'Running' }
  });

  const scrollContainerRef = useRef(null);
  const dateInputRef = useRef(null);

  // Time grid & Date state starting from sysdate (today at 00:00:00)
  const [selectedDateStr, setSelectedDateStr] = useState(() => {
    const d = sysInfo?.now || new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  });

  const baseDate = React.useMemo(() => {
    if (!selectedDateStr) return new Date();
    const parts = selectedDateStr.split('-');
    if (parts.length === 3) {
      return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]), 0, 0, 0);
    }
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
  }, [selectedDateStr]);

  // Calculate maximum end hour across all schedule blocks to ensure timeline never cuts off
  const maxBlockEndHour = React.useMemo(() => {
    if (!scheduleBlocks || scheduleBlocks.length === 0) return 48;
    const maxEnd = scheduleBlocks.reduce((max, b) => {
      const start = Number(b.startHour) || 0;
      const dur = Number(b.durationHours) || (Number(b.durationMinutes) ? Number(b.durationMinutes) / 60 : 2);
      return Math.max(max, start + dur);
    }, 0);
    return Math.max(48, Math.ceil(maxEnd));
  }, [scheduleBlocks]);

  // Minimum required full days to safely cover all blocks with 12h buffer
  const autoRequiredDays = React.useMemo(() => {
    return Math.max(4, Math.ceil((maxBlockEndHour + 12) / 24));
  }, [maxBlockEndHour]);

  // Effective days: guarantees timeline never cuts off dates even if manual option is chosen
  const effectiveHorizonDays = React.useMemo(() => {
    if (timelineHorizonMode === 'auto') {
      return autoRequiredDays;
    }
    const manualDays = Number(timelineHorizonMode) || 4;
    return Math.max(manualDays, autoRequiredDays);
  }, [timelineHorizonMode, autoRequiredDays]);

  const hoursCount = effectiveHorizonDays * 24;

  // Compute array of days within timeline horizon
  const daysArray = React.useMemo(() => {
    const daysIndo = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const monthsIndo = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const monthsIndoShort = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const nowDate = new Date();
    const nowDayStr = `${nowDate.getFullYear()}-${String(nowDate.getMonth() + 1).padStart(2, '0')}-${String(nowDate.getDate()).padStart(2, '0')}`;

    return Array.from({ length: effectiveHorizonDays }, (_, dIdx) => {
      const d = new Date(baseDate.getTime() + dIdx * 24 * 3600 * 1000);
      const dayNum = String(d.getDate()).padStart(2, '0');
      const dayName = daysIndo[d.getDay()];
      const monthName = monthsIndo[d.getMonth()];
      const monthShort = monthsIndoShort[d.getMonth()];
      const year = d.getFullYear();
      const dateFormatted = `${year}-${String(d.getMonth() + 1).padStart(2, '0')}-${dayNum}`;
      const isToday = dateFormatted === nowDayStr;

      return {
        index: dIdx,
        date: d,
        dateFormatted,
        dayNum,
        dayName,
        monthName,
        monthShort,
        year,
        fullDateStr: `${dayName}, ${dayNum} ${monthName} ${year}`,
        shortDateStr: `${dayName}, ${dayNum} ${monthShort}`,
        isToday
      };
    });
  }, [baseDate, effectiveHorizonDays]);

  // Index of today in the daysArray (if present)
  const todayDayIndex = daysArray.findIndex(d => d.isToday);

  // Generate array of timeline hours for ruler
  const timelineHours = React.useMemo(() => {
    return Array.from({ length: hoursCount }, (_, i) => {
      const dayIndex = Math.floor(i / 24);
      const hour = i % 24;
      const dayData = daysArray[dayIndex] || daysArray[0];
      const d = new Date(dayData.date.getTime() + hour * 3600 * 1000);
      
      let shiftNum = 3;
      if (hour >= 7 && hour < 15) shiftNum = 1;
      else if (hour >= 15 && hour < 23) shiftNum = 2;

      return {
        index: i,
        dayIndex,
        dayData,
        date: d,
        dateFormatted: dayData.dateFormatted,
        day: dayData.dayNum,
        dayName: dayData.dayName,
        monthShort: dayData.monthShort,
        hour,
        shiftNum,
        isShiftStart: hour === 7 || hour === 15 || hour === 23,
        isDayStart: hour === 0
      };
    });
  }, [hoursCount, daysArray]);

  // Smooth scroll to Shift 1 (07:00 WIB) on initial mount
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = Math.max(0, 7 * zoomLevel - 80);
    }
  }, []);

  const resetToToday = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    setSelectedDateStr(`${y}-${m}-${day}`);
    jumpToShift(sysInfo?.shiftNum || 1);
  };

  // Toggle collapse for a process section
  const toggleCollapse = (code) => {
    setCollapsedProcesses(prev => ({
      ...prev,
      [code]: !prev[code]
    }));
  };

  // Toggle lock on block
  const toggleBlockLock = (blockId, e) => {
    e.stopPropagation();
    setScheduleBlocks(prev => prev.map(b => {
      if (b.id === blockId) {
        const nextLock = !b.isLocked;
        setToastMessage(nextLock ? `🔒 Jadwal ${b.modelCode} telah dikunci (Locked)` : `🔓 Jadwal ${b.modelCode} dibuka kuncinya`);
        setTimeout(() => setToastMessage(null), 2500);
        return { ...b, isLocked: nextLock };
      }
      return b;
    }));
  };

  // Toggle machine status (Running -> Trouble -> Maintenance -> Running)
  const toggleMachineStatus = (machineId, e) => {
    e.stopPropagation();
    setMachineStatusOverrides(prev => {
      const current = prev[machineId]?.status || 'Running';
      let next = 'Running';
      if (current === 'Running') next = 'Trouble';
      else if (current === 'Trouble') next = 'Maintenance';
      else next = 'Running';

      setToastMessage(`Status mesin ${machineId} diubah menjadi: ${next.toUpperCase()}`);
      setTimeout(() => setToastMessage(null), 3000);

      return {
        ...prev,
        [machineId]: { ...prev[machineId], status: next }
      };
    });
  };

  // Toggle floating assignment for EF-03
  const toggleFloatingAssignment = (machineId, e) => {
    e.stopPropagation();
    setMachineStatusOverrides(prev => {
      const current = prev[machineId]?.assignment || 'Lilin';
      const next = current === 'Lilin' ? 'Timah' : 'Lilin';
      setToastMessage(`Mesin Floating ${machineId} dialihkan penugasan ke: Jalur ${next}`);
      setTimeout(() => setToastMessage(null), 3500);

      return {
        ...prev,
        [machineId]: { ...prev[machineId], assignment: next }
      };
    });
  };

  // Helper to get effective machine status
  const getEffectiveMachine = (machine) => {
    const override = machineStatusOverrides[machine.id];
    return {
      ...machine,
      status: override?.status || machine.status || 'Running',
      assignment: override?.assignment || machine.type || 'Lilin'
    };
  };

  // Drag and Drop handlers
  const handleDragStart = (e, block) => {
    setDraggedBlock(block);
    setHighlightedVoucher(block.voucherNo);
    e.dataTransfer.setData('text/plain', block.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, processCode, machineId, hourIndex) => {
    e.preventDefault();
    setHoveredTarget({ processCode, machineId, hourIndex });

    if (draggedBlock) {
      const effectiveStatus = machineStatusOverrides[machineId]?.status || 'Running';
      if (effectiveStatus === 'Trouble') {
        setConflictWarning(`⚠️ PERINGATAN: Mesin ${machineId} sedang TROUBLE! Jadwal tidak dapat dialokasikan ke mesin ini.`);
      } else if (effectiveStatus === 'Maintenance') {
        setConflictWarning(`⚠️ Mesin ${machineId} sedang masa Maintenance/Perawatan.`);
      } else {
        setConflictWarning(null);
      }
    }
  };

  const handleDrop = (e, targetProcessCode, targetMachineId, targetHourIndex) => {
    e.preventDefault();
    if (!draggedBlock) return;

    // Check if target machine is in Trouble or Maintenance
    const effectiveStatus = machineStatusOverrides[targetMachineId]?.status || 'Running';
    if (effectiveStatus === 'Trouble') {
      alert(`Gagal reschedule: Mesin ${targetMachineId} sedang mengalami TROUBLE! Silakan pilih mesin lain yang berstatus Running.`);
      setDraggedBlock(null);
      setConflictWarning(null);
      setHoveredTarget(null);
      return;
    }

    // Save previous state for Undo functionality
    setHistory(prev => [scheduleBlocks, ...prev.slice(0, 9)]);

    const delta = Math.round((targetHourIndex - draggedBlock.startHour) * 10) / 10;
    const directionStr = delta > 0 
      ? `dimajukan ke depan (+${delta} jam)` 
      : delta < 0 
      ? `dimundurkan ke belakang (${delta} jam)` 
      : `dipindahkan`;

    // Bi-directional auto-cascade: shifts target order forward OR backward, and ripples colliding orders!
    const cascadedAllBlocks = cascadeOrderSteps(scheduleBlocks, draggedBlock, targetHourIndex, targetMachineId);
    setScheduleBlocks(cascadedAllBlocks);

    const sameOrderSteps = scheduleBlocks.filter(b => b.voucherNo === draggedBlock.voucherNo);
    if (sameOrderSteps.length > 1) {
      setToastMessage(`🔄 Rantai Alur Order ${draggedBlock.soNumber || ''} ${draggedBlock.voucherNo} (${draggedBlock.modelCode}) ${directionStr} ke jam ${targetHourIndex}:00. Seluruh ${sameOrderSteps.length} tahapan alur otomatis mengikuti.`);
    } else {
      setToastMessage(`Pesanan ${draggedBlock.modelCode} ${directionStr} ke jam ${targetHourIndex}:00 di mesin ${targetMachineId}. Jadwal lain otomatis menyesuaikan.`);
    }

    setTimeout(() => setToastMessage(null), 4500);

    setDraggedBlock(null);
    setConflictWarning(null);
    setHoveredTarget(null);
  };

  const handleUndo = () => {
    if (history.length > 0) {
      const [previous, ...rest] = history;
      setScheduleBlocks(previous);
      setHistory(rest);
      setToastMessage('Perubahan jadwal berhasil dikembalikan (Undo).');
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  // Add block or full pipeline of blocks
  const handleAddScheduleBlock = (newBlockOrBlocks) => {
    setHistory(prev => [scheduleBlocks, ...prev.slice(0, 9)]);

    const incomingBlocks = Array.isArray(newBlockOrBlocks) ? newBlockOrBlocks : [newBlockOrBlocks];
    let currentAllBlocks = [...scheduleBlocks];

    incomingBlocks.forEach(newBlock => {
      const untouchedBlocks = currentAllBlocks.filter(
        b => !(b.processCode === newBlock.processCode && b.machineId === newBlock.machineId)
      );

      const sameMachineBlocks = currentAllBlocks
        .filter(b => b.processCode === newBlock.processCode && b.machineId === newBlock.machineId)
        .sort((a, b) => a.startHour - b.startHour);

      const unaffected = sameMachineBlocks.filter(b => (b.startHour + b.durationHours) <= newBlock.startHour);
      const toShift = sameMachineBlocks.filter(b => (b.startHour + b.durationHours) > newBlock.startHour);

      let currentOccupiedEnd = newBlock.startHour + newBlock.durationHours + SETUP_BUFFER_HOURS;

      const shiftedBlocks = toShift.map(b => {
        let newStart = b.startHour;
        if (newStart < currentOccupiedEnd) {
          newStart = Math.round(currentOccupiedEnd * 10) / 10;
        }
        currentOccupiedEnd = newStart + b.durationHours + SETUP_BUFFER_HOURS;
        return {
          ...b,
          startHour: newStart
        };
      });

      currentAllBlocks = [...untouchedBlocks, ...unaffected, newBlock, ...shiftedBlocks];
    });

    setScheduleBlocks(currentAllBlocks);

    if (incomingBlocks.length > 1) {
      setHighlightedVoucher(incomingBlocks[0].voucherNo);
      setPipelineModalVoucher(incomingBlocks[0].voucherNo);
      setToastMessage(`✅ Sukses! Seluruh ${incomingBlocks.length} tahapan alur order ${incomingBlocks[0].voucherNo} (${incomingBlocks[0].modelCode}) telah terjadwal berurutan dari tahap 1 sampai selesai!`);
    } else {
      setToastMessage(`Jadwal baru ${incomingBlocks[0].modelCode} berhasil ditambahkan ke ${incomingBlocks[0].machineId}.`);
    }
    setTimeout(() => setToastMessage(null), 5000);
  };

  // Delete entire SO chain
  const handleDeleteSO = (voucherNo) => {
    if (!voucherNo) return;
    setHistory(prev => [scheduleBlocks, ...prev.slice(0, 9)]);
    const countBefore = scheduleBlocks.filter(b => b.voucherNo === voucherNo).length;
    setScheduleBlocks(prev => prev.filter(b => b.voucherNo !== voucherNo));
    if (highlightedVoucher === voucherNo) {
      setHighlightedVoucher(null);
    }
    setToastMessage(`🗑️ Seluruh ${countBefore} tahapan alur untuk SO / Voucher "${voucherNo}" berhasil dihapus.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Delete single stage block
  const handleDeleteBlock = (blockId) => {
    if (!blockId) return;
    setHistory(prev => [scheduleBlocks, ...prev.slice(0, 9)]);
    const targetBlock = scheduleBlocks.find(b => b.id === blockId);
    setScheduleBlocks(prev => prev.filter(b => b.id !== blockId));
    setToastMessage(`🗑️ Tahapan ${targetBlock?.processCode || ''} pada mesin ${targetBlock?.machineId || ''} berhasil dihapus.`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Update block with optional cascade
  const handleUpdateBlock = (updatedBlock, shouldCascade = true) => {
    if (!updatedBlock) return;
    setHistory(prev => [scheduleBlocks, ...prev.slice(0, 9)]);

    // Directly merge all updated attributes (lead time minutes, hours, biji, difficulty, machine, etc.)
    const updatedAllBlocks = scheduleBlocks.map(b => b.id === updatedBlock.id ? { ...b, ...updatedBlock } : b);

    if (shouldCascade) {
      const cascaded = cascadeOrderSteps(updatedAllBlocks, updatedBlock, updatedBlock.startHour);
      setScheduleBlocks(cascaded);
      setToastMessage(`✅ Jadwal ${updatedBlock.modelCode} (${updatedBlock.soNumber || updatedBlock.voucherNo}) berhasil diperbarui: Lead Time ${updatedBlock.durationMinutes} Menit.`);
    } else {
      setScheduleBlocks(updatedAllBlocks);
      setToastMessage(`✅ Jadwal ${updatedBlock.modelCode} berhasil diperbarui: Lead Time ${updatedBlock.durationMinutes} Menit.`);
    }
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Jump to specific shift
  const jumpToShift = (shiftNum) => {
    let targetHour = 7;
    if (shiftNum === 2) targetHour = 15;
    if (shiftNum === 3) targetHour = 23;

    if (scrollContainerRef.current) {
      const scrollPos = targetHour * zoomLevel - 80;
      scrollContainerRef.current.scrollTo({ left: Math.max(0, scrollPos), behavior: 'smooth' });
    }
  };

  // Determine active processes
  let activeProcessList = [];
  if (activePipeline === 'Lilin') {
    activeProcessList = LILIN_PROCESSES;
  } else if (activePipeline === 'Timah') {
    activeProcessList = TIMAH_PROCESSES;
  } else {
    activeProcessList = [...LILIN_PROCESSES, ...TIMAH_PROCESSES.filter(tp => !LILIN_PROCESSES.some(lp => lp.code === tp.code))];
  }

  const displayedProcesses = activeProcessList.filter(p => {
    if (processFilter === 'ALL') return true;
    return p.code === processFilter;
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
      
      {/* 1. PIPELINE SELECTOR TABS (LILIN VS TIMAH VS TERPADU) */}
      <div className="bg-[#0a3866] text-white px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 border-b border-blue-950">
        <div className="flex items-center space-x-2">
          <span className="text-[11px] font-bold text-blue-200 uppercase tracking-wider hidden sm:inline">
            Jalur Produksi:
          </span>

          <div className="flex items-center bg-blue-900/80 p-0.5 rounded-xl border border-blue-700/60 shadow-inner">
            <button
              onClick={() => { setActivePipeline('Lilin'); setProcessFilter('ALL'); }}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activePipeline === 'Lilin'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-blue-200 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>🕯️</span>
              <span>Jalur Lilin (12 Sub Proses)</span>
              <span className="text-[10px] px-1 py-0.2 rounded bg-black/20 font-black">12</span>
            </button>

            <button
              onClick={() => { setActivePipeline('Timah'); setProcessFilter('ALL'); }}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activePipeline === 'Timah'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-blue-200 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>⚙️</span>
              <span>Jalur Timah (14 Sub Proses)</span>
              <span className="text-[10px] px-1 py-0.2 rounded bg-black/20 font-black">14</span>
            </button>

            <button
              onClick={() => { setActivePipeline('ALL'); setProcessFilter('ALL'); }}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activePipeline === 'ALL'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-blue-200 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>🌟</span>
              <span>Terpadu (Semua Mesin & 4 EF)</span>
            </button>
          </div>
        </div>

        {/* Quick info on pipeline */}
        <div className="text-[11px] text-blue-100 hidden md:flex items-center space-x-3">
          {activePipeline === 'Lilin' && (
            <span>Alur: CEL (245m) ➔ WBN (368m) ➔ SOL (61m) ➔ STI (82m) ➔ TBA (110m) ➔ EFL (35h) ➔ BOR (41m) ➔ HL1 (13h) ➔ ANN (1h) ➔ HL2 (13h) ➔ TKD ➔ BJD</span>
          )}
          {activePipeline === 'Timah' && (
            <span>Alur: CET ➔ AMP ➔ GLD ➔ ULR ➔ STB ➔ ST1 ➔ EFT (35h) ➔ ST2 ➔ BOR ➔ OVN (2h) ➔ HL1 ➔ ANN ➔ TKD ➔ BJD</span>
          )}
          {activePipeline === 'ALL' && (
            <span>Total 4 Mesin Bath EF (3 Lilin, 1 Timah, EF-03 Mesin Floating)</span>
          )}
        </div>
      </div>

      {/* 2. Top Toolbar (Compact & Sleek 90%-like density on 100% zoom) */}
      <div className="px-3 py-1.5 bg-slate-50/90 border-b border-slate-200 flex flex-wrap xl:flex-nowrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
          {/* Interactive Date Selector with Single Clean Display */}
          <div className="flex items-center space-x-1">
            <div
              onClick={() => {
                try {
                  dateInputRef.current?.showPicker?.();
                } catch {
                  // Fallback
                }
              }}
              className="relative flex items-center bg-white border border-slate-300 hover:border-blue-500 rounded-lg px-2.5 py-1 shadow-2xs transition-colors cursor-pointer group"
              title="Klik untuk memilih tanggal jadwal timeline"
            >
              <Calendar className="w-3.5 h-3.5 text-blue-600 mr-1.5 shrink-0 group-hover:text-blue-700 pointer-events-none" />
              <span className="text-xs font-bold text-slate-800 tracking-tight pointer-events-none">
                {daysArray[0]?.shortDateStr || daysArray[0]?.fullDateStr || selectedDateStr}
              </span>
              <input
                ref={dateInputRef}
                type="date"
                value={selectedDateStr}
                onChange={(e) => setSelectedDateStr(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                title="Pilih tanggal mulai penjadwalan timeline"
              />
            </div>

            <button
              onClick={resetToToday}
              className={`px-2 py-1 rounded-lg font-bold text-[11px] border transition-all shadow-2xs active:scale-95 cursor-pointer ${
                daysArray[0]?.isToday
                  ? 'bg-blue-600 text-white border-blue-600 shadow-blue-500/20'
                  : 'bg-white hover:bg-blue-50 text-blue-700 border-slate-300 hover:border-blue-400'
              }`}
              title="Kembali ke Hari Ini (Sysdate)"
            >
              Hari Ini
            </button>
          </div>

          {/* Jump to Shift Shortcuts */}
          <div className="flex items-center bg-slate-200/80 p-0.5 rounded-lg text-xs font-medium">
            <span className="text-[10px] text-slate-500 font-bold px-1.5">Shift:</span>
            <button
              onClick={() => jumpToShift(1)}
              className={`px-2 py-0.5 rounded text-[11px] font-bold shadow-2xs transition-colors ${
                sysInfo?.shiftNum === 1
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-slate-700 hover:bg-slate-50'
              }`}
              title="Shift 1: 07:00 - 15:00 WIB (Istirahat 11:30 - 12:30)"
            >
              1 (07:00) {sysInfo?.shiftNum === 1 && '●'}
            </button>
            <button
              onClick={() => jumpToShift(2)}
              className={`px-2 py-0.5 rounded text-[11px] font-bold shadow-2xs transition-colors ${
                sysInfo?.shiftNum === 2
                  ? 'bg-emerald-600 text-white'
                  : 'hover:bg-white text-slate-600'
              }`}
              title="Shift 2: 15:00 - 23:00 WIB (Istirahat 17:30 - 18:30)"
            >
              2 (15:00) {sysInfo?.shiftNum === 2 && '●'}
            </button>
            <button
              onClick={() => jumpToShift(3)}
              className={`px-2 py-0.5 rounded text-[11px] font-bold shadow-2xs transition-colors ${
                sysInfo?.shiftNum === 3
                  ? 'bg-emerald-600 text-white'
                  : 'hover:bg-white text-slate-600'
              }`}
              title="Shift 3: 23:00 - 07:00 WIB (Istirahat 02:00 - 03:00)"
            >
              3 (23:00) {sysInfo?.shiftNum === 3 && '●'}
            </button>
          </div>

          {/* Timeline Horizon View (Auto vs Manual) */}
          <div className="flex items-center space-x-1 text-xs">
            <span className="text-slate-500 font-bold text-[11px]">Rentang:</span>
            <select
              value={timelineHorizonMode}
              onChange={(e) => setTimelineHorizonMode(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-bold text-slate-800 shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              title="Rentang kalender timeline otomatis menyesuaikan jadwal terpanjang agar tidak terpotong"
            >
              <option value="auto">
                ⚡ Auto: {autoRequiredDays} Hari ({autoRequiredDays * 24} Jam)
              </option>
              <option value="4">4 Hari (96 Jam)</option>
              <option value="7">7 Hari (1 Minggu)</option>
              <option value="10">10 Hari (240 Jam)</option>
              <option value="14">14 Hari (2 Minggu)</option>
            </select>
          </div>

          {/* Dynamic Filter Process */}
          <div className="flex items-center space-x-1 text-xs">
            <span className="text-slate-500 font-bold text-[11px]">Filter:</span>
            <select
              value={processFilter}
              onChange={(e) => setProcessFilter(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-bold text-slate-800 shadow-2xs focus:outline-none max-w-[150px] truncate cursor-pointer"
            >
              <option value="ALL">Semua ({activePipeline})</option>
              {activeProcessList.map(p => (
                <option key={p.code} value={p.code}>
                  {p.number ? `${p.number}. ` : ''}{p.code} - {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right controls: Rekap Voucher, Add Schedule, Undo & Zoom slider */}
        <div className="flex items-center space-x-2 shrink-0">
          {/* Rekap Voucher Button */}
          <button
            onClick={() => {
              setSelectedProcessForSummary(null);
              setIsVoucherSummaryOpen(true);
            }}
            className="flex items-center space-x-1.5 px-2.5 py-1 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg shadow-2xs transition-all active:scale-95 cursor-pointer"
            title="Lihat rekapitulasi jumlah voucher per tahapan proses produksi"
          >
            <ClipboardList className="w-3.5 h-3.5 text-indigo-600" />
            <span>Rekap Voucher ({new Set(scheduleBlocks.map(b => b.voucherNo).filter(Boolean)).size})</span>
          </button>

          {/* Add Schedule Button */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center space-x-1 px-2.5 py-1 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition-all active:scale-95"
            title="Tambah orderan jadwal produksi baru (Mendukung Rencana Penuh 1 s/d 10 / 1 s/d 14)"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Jadwal</span>
          </button>

          {/* Undo Button */}
          {history.length > 0 && (
            <button
              onClick={handleUndo}
              className="flex items-center space-x-1 px-2 py-1 text-[11px] font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-lg shadow-2xs transition-all active:scale-95"
              title="Kembalikan posisi jadwal sebelum digeser"
            >
              <RotateCcw className="w-3 h-3 text-amber-700" />
              <span>Undo ({history.length})</span>
            </button>
          )}

          {/* Zoom controls */}
          <div className="flex items-center space-x-1 bg-white border border-slate-200 px-2 py-0.5 rounded-lg shadow-2xs text-xs">
            <button
              onClick={() => setZoomLevel(prev => Math.max(30, prev - 8))}
              className="p-0.5 text-slate-500 hover:text-slate-900 rounded"
              title="Zoom Out"
            >
              <ZoomOut className="w-3 h-3" />
            </button>
            <input
              type="range"
              min="30"
              max="90"
              value={zoomLevel}
              onChange={(e) => setZoomLevel(Number(e.target.value))}
              className="w-14 h-1.5 bg-slate-200 rounded-lg accent-blue-600 cursor-pointer"
            />
            <button
              onClick={() => setZoomLevel(prev => Math.min(90, prev + 8))}
              className="p-0.5 text-slate-500 hover:text-slate-900 rounded"
              title="Zoom In"
            >
              <ZoomIn className="w-3 h-3" />
            </button>
            <button
              onClick={() => setZoomLevel(48)}
              className="p-0.5 text-slate-400 hover:text-slate-700 text-[10px] font-bold"
              title="Reset Zoom"
            >
              100%
            </button>
          </div>
        </div>
      </div>

      {/* 3. ORDER CHAIN FOCUS BANNER (Ketika salah satu order dipilih / disorot) */}
      {highlightedVoucher && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200 px-4 py-2 flex flex-wrap items-center justify-between text-xs text-blue-950 animate-in fade-in gap-2">
          <div className="flex items-center space-x-2">
            <Workflow className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              Fokus Rantai Order: <strong className="text-blue-900 font-extrabold">{highlightedVoucher}</strong> — {
                scheduleBlocks.find(b => b.voucherNo === highlightedVoucher)?.modelCode || 'Model'
              } ({scheduleBlocks.filter(b => b.voucherNo === highlightedVoucher).length} Tahapan Terhubung & Tersinkron)
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setPipelineModalVoucher(highlightedVoucher);
                setIsPipelineModalOpen(true);
              }}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-[11px] shadow-xs flex items-center space-x-1.5 transition-transform active:scale-95"
              title="Lihat seluruh tahapan alur proses voucher ini"
            >
              <List className="w-3.5 h-3.5" />
              <span>Listing</span>
            </button>

            <button
              onClick={() => {
                if (window.confirm(`Yakin ingin MENGHAPUS SELURUH tahapan alur jadwal untuk No. SO / Voucher "${highlightedVoucher}"?`)) {
                  handleDeleteSO(highlightedVoucher);
                }
              }}
              className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-[11px] shadow-xs flex items-center space-x-1.5 transition-transform active:scale-95"
              title="Hapus seluruh tahapan alur untuk order ini"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus Seluruh SO</span>
            </button>

            <button
              onClick={() => setHighlightedVoucher(null)}
              className="text-[11px] text-slate-500 hover:text-slate-800 font-bold px-1.5"
            >
              Lepas Fokus
            </button>
          </div>
        </div>
      )}

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="bg-emerald-50 border-b border-emerald-300 px-4 py-2 flex items-center justify-between text-xs text-emerald-900 animate-in fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-[11px] text-emerald-700 font-bold hover:underline"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Conflict Warning Banner */}
      {conflictWarning && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-between text-xs text-amber-800">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="font-semibold">{conflictWarning}</span>
          </div>
          <span className="text-[10px] text-amber-600 italic">Perhatikan status mesin dan kapasitas</span>
        </div>
      )}

      {/* Main Timeline Scrollable Container */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-x-auto overflow-y-auto custom-scrollbar select-none"
        style={{ maxHeight: '720px' }}
      >
        <div style={{ minWidth: `${hoursCount * zoomLevel + 288}px`, width: `${hoursCount * zoomLevel + 288}px` }} className="relative bg-white">
          
          {/* STICKY TIMELINE HEADER (TANGGAL, SHIFT, & JAM RULER) */}
          <div className="sticky top-0 z-30 bg-white border-b-2 border-slate-300 shadow-md">
            
            {/* TIER 1: TANGGAL & HARI (Day Header Row) */}
            <div className="flex border-b border-slate-300 bg-white">
              <div className="w-72 shrink-0 border-r border-slate-300 p-2.5 font-black text-xs text-slate-800 bg-slate-200 sticky left-0 z-40 flex items-center justify-between shadow-2xs">
                <div className="flex items-center space-x-1.5">
                  <Calendar className="w-4 h-4 text-blue-700 shrink-0" />
                  <span className="uppercase tracking-wider text-[11px] font-black">Tanggal & Hari</span>
                </div>
                <span className="text-[10px] text-blue-900 font-black bg-blue-100 px-2 py-0.5 rounded border border-blue-300">
                  {activePipeline}
                </span>
              </div>

              {/* Day Header columns spanning 24 hours each */}
              <div className="flex" style={{ width: `${hoursCount * zoomLevel}px`, minWidth: `${hoursCount * zoomLevel}px` }}>
                {daysArray.map((day) => (
                  <div
                    key={day.dateFormatted}
                    style={{ width: `${24 * zoomLevel}px` }}
                    className={`shrink-0 border-r-2 border-r-slate-400 px-4 py-2 flex items-center justify-between text-xs font-black shadow-2xs transition-colors ${
                      day.isToday
                        ? 'bg-gradient-to-r from-[#0a3866] via-[#145388] to-[#0a3866] text-white'
                        : 'bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Calendar className={`w-4 h-4 ${day.isToday ? 'text-amber-300' : 'text-blue-700'}`} />
                      <span className="text-xs font-black tracking-wide">
                        {day.fullDateStr}
                      </span>
                      {day.isToday && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-400 text-slate-950 text-[10px] font-black uppercase tracking-wider animate-pulse shadow-xs">
                          ● Hari Ini (Sysdate)
                        </span>
                      )}
                    </div>
                    <div className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                      day.isToday ? 'bg-white/15 text-blue-100' : 'bg-white text-slate-600 border border-slate-300'
                    }`}>
                      24 Jam Produksi
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* TIER 2: ALOKASI SHIFT (Shift Breakdown Row) */}
            <div className="flex border-b border-slate-200 bg-slate-50 text-[11px]">
              <div className="w-72 shrink-0 border-r border-slate-300 px-3 py-1 font-bold text-slate-700 bg-slate-100 sticky left-0 z-40 flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700">Alokasi Shift</span>
                <span className="text-[10px] text-slate-500 font-semibold">3 Shift / 24 Jam</span>
              </div>

              {/* Shift spans per day */}
              <div className="flex" style={{ width: `${hoursCount * zoomLevel}px`, minWidth: `${hoursCount * zoomLevel}px` }}>
                {daysArray.map((day) => (
                  <div key={`shifts-${day.dateFormatted}`} style={{ width: `${24 * zoomLevel}px` }} className="shrink-0 flex border-r-2 border-r-slate-400">
                    {/* Shift 3 Early (00:00 - 07:00 = 7h) with break 02:00 - 03:00 */}
                    <div 
                      style={{ width: `${2 * zoomLevel}px` }} 
                      className="shrink-0 border-r border-emerald-200 bg-emerald-50/80 text-emerald-950 font-bold px-1 py-1 flex items-center justify-center text-center text-[10px] truncate"
                      title="Shift 3 Kerja (00:00 - 02:00 WIB)"
                    >
                      🌙 S3 (00-02)
                    </div>
                    {/* Shift 3 Break: 02:00 - 03:00 (1h) */}
                    <div 
                      style={{ width: `${1 * zoomLevel}px` }} 
                      className="shrink-0 border-r border-amber-400 bg-amber-200 text-amber-950 font-black px-0.5 py-1 flex items-center justify-center text-center text-[9px] truncate shadow-2xs"
                      title="☕ Jam Istirahat Shift 3: 02:00 - 03:00 WIB"
                    >
                      ☕ Istirahat 02-03
                    </div>
                    {/* Shift 3 Post-break: 03:00 - 07:00 (4h) */}
                    <div 
                      style={{ width: `${4 * zoomLevel}px` }} 
                      className="shrink-0 border-r-2 border-emerald-400 bg-emerald-50/80 text-emerald-950 font-bold px-1 py-1 flex items-center justify-center text-center text-[10px] truncate"
                      title="Shift 3 Kerja (03:00 - 07:00 WIB)"
                    >
                      🌙 Shift 3 (03:00 - 07:00)
                    </div>

                    {/* Shift 1 (07:00 - 15:00 = 8h) with break 11:30 - 12:30 */}
                    {/* Shift 1 Pre-break: 07:00 - 11:30 (4.5h) */}
                    <div 
                      style={{ width: `${4.5 * zoomLevel}px` }} 
                      className={`shrink-0 border-r border-emerald-300 font-black px-1.5 py-1 flex items-center justify-center text-center text-[10px] truncate ${
                        day.isToday && sysInfo?.shiftNum === 1
                          ? 'bg-emerald-200/90 text-emerald-950'
                          : 'bg-emerald-100/70 text-emerald-900'
                      }`}
                      title="Shift 1 Kerja (Pagi: 07:00 - 11:30 WIB)"
                    >
                      ☀️ Shift 1 (07:00 - 11:30)
                    </div>
                    {/* Shift 1 Break: 11:30 - 12:30 (1h) */}
                    <div 
                      style={{ width: `${1 * zoomLevel}px` }} 
                      className="shrink-0 border-r border-amber-400 bg-amber-300 text-amber-950 font-black px-0.5 py-1 flex items-center justify-center text-center text-[9px] truncate shadow-inner"
                      title="☕ Jam Istirahat Shift 1: 11:30 - 12:30 WIB"
                    >
                      ☕ 11:30-12:30 Istirahat
                    </div>
                    {/* Shift 1 Post-break: 12:30 - 15:00 (2.5h) */}
                    <div 
                      style={{ width: `${2.5 * zoomLevel}px` }} 
                      className={`shrink-0 border-r-2 border-emerald-400 font-black px-1 py-1 flex items-center justify-center text-center text-[10px] truncate ${
                        day.isToday && sysInfo?.shiftNum === 1
                          ? 'bg-emerald-200/90 text-emerald-950 ring-2 ring-emerald-500'
                          : 'bg-emerald-100/70 text-emerald-900'
                      }`}
                      title="Shift 1 Kerja (12:30 - 15:00 WIB)"
                    >
                      ☀️ S1 (12:30 - 15:00) {day.isToday && sysInfo?.shiftNum === 1 && '● LIVE'}
                    </div>

                    {/* Shift 2 (15:00 - 23:00 = 8h) with break 17:30 - 18:30 */}
                    {/* Shift 2 Pre-break: 15:00 - 17:30 (2.5h) */}
                    <div 
                      style={{ width: `${2.5 * zoomLevel}px` }} 
                      className={`shrink-0 border-r border-emerald-300 font-black px-1 py-1 flex items-center justify-center text-center text-[10px] truncate ${
                        day.isToday && sysInfo?.shiftNum === 2
                          ? 'bg-emerald-200/90 text-emerald-950'
                          : 'bg-emerald-50 text-emerald-900'
                      }`}
                      title="Shift 2 Kerja (Sore: 15:00 - 17:30 WIB)"
                    >
                      ⛅ Shift 2 (15:00 - 17:30)
                    </div>
                    {/* Shift 2 Break: 17:30 - 18:30 (1h) */}
                    <div 
                      style={{ width: `${1 * zoomLevel}px` }} 
                      className="shrink-0 border-r border-amber-400 bg-amber-300 text-amber-950 font-black px-0.5 py-1 flex items-center justify-center text-center text-[9px] truncate shadow-inner"
                      title="☕ Jam Istirahat Shift 2: 17:30 - 18:30 WIB"
                    >
                      ☕ 17:30-18:30 Istirahat
                    </div>
                    {/* Shift 2 Post-break: 18:30 - 23:00 (4.5h) */}
                    <div 
                      style={{ width: `${4.5 * zoomLevel}px` }} 
                      className={`shrink-0 border-r-2 border-emerald-400 font-black px-1.5 py-1 flex items-center justify-center text-center text-[10px] truncate ${
                        day.isToday && sysInfo?.shiftNum === 2
                          ? 'bg-emerald-200/90 text-emerald-950 ring-2 ring-emerald-500'
                          : 'bg-emerald-50 text-emerald-900'
                      }`}
                      title="Shift 2 Kerja (18:30 - 23:00 WIB)"
                    >
                      ⛅ Shift 2 (18:30 - 23:00) {day.isToday && sysInfo?.shiftNum === 2 && '● LIVE'}
                    </div>

                    {/* Shift 3 Late (23:00 - 24:00 = 1h) */}
                    <div 
                      style={{ width: `${1 * zoomLevel}px` }} 
                      className="shrink-0 bg-emerald-50/70 text-emerald-950 font-bold px-1 py-1 flex items-center justify-center text-center text-[9px] truncate"
                      title="Shift 3 (Malam: 23:00 - 07:00 WIB)"
                    >
                      🌙 S3
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* TIER 3: JAM RULER (Hour Numbers 00:00 to 23:00) */}
            <div className="flex border-b border-slate-200 bg-slate-100">
              <div className="w-72 shrink-0 border-r border-slate-300 px-3 py-1 font-bold text-slate-700 bg-slate-100 sticky left-0 z-40 flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700">Jam (WIB)</span>
                <span className="text-[10px] text-blue-700 font-mono font-bold">{zoomLevel}px/jam</span>
              </div>

              {/* Hour ruler columns */}
              <div className="flex" style={{ width: `${hoursCount * zoomLevel}px`, minWidth: `${hoursCount * zoomLevel}px` }}>
                {timelineHours.map((th) => {
                  const isCurrentLiveHour = th.dayData.isToday && Math.floor(sysInfo?.currentHourDecimal ?? -1) === th.hour;
                  return (
                    <div
                      key={th.index}
                      style={{ width: `${zoomLevel}px` }}
                      className={`shrink-0 border-r text-center py-1 flex flex-col items-center justify-center ${
                        th.isDayStart
                          ? 'border-l-2 border-l-slate-500'
                          : th.isShiftStart
                          ? 'border-r-2 border-r-slate-400 bg-blue-50/40'
                          : 'border-r-slate-200'
                      } ${isCurrentLiveHour ? 'bg-red-100/70' : ''}`}
                      title={`${th.dayData.fullDateStr} — Jam ${String(th.hour).padStart(2, '0')}:00 (Shift ${th.shiftNum})`}
                    >
                      <span className={`text-[11px] font-mono leading-tight ${
                        isCurrentLiveHour
                          ? 'text-red-700 font-black'
                          : th.isShiftStart
                          ? 'text-blue-900 font-black'
                          : 'text-slate-600 font-semibold'
                      }`}>
                        {String(th.hour).padStart(2, '0')}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* TIER 4: ACTIVE SHIFT & TIME TRACK (Green / Emerald Bar with Break Times) */}
            <div className="flex bg-emerald-50/70 border-b border-emerald-200">
              <div className="w-72 shrink-0 border-r border-slate-300 px-3 py-1 text-[11px] font-black text-emerald-950 sticky left-0 z-40 bg-emerald-100 flex items-center justify-between shadow-2xs">
                <div className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping"></span>
                  <span>Shift Aktif (Live)</span>
                </div>
                <div className="flex items-center space-x-1">
                  {sysInfo?.isBreakTime && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-400 text-amber-950 font-black animate-pulse shadow-2xs">
                      ☕ Istirahat
                    </span>
                  )}
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-200 text-emerald-950 font-black border border-emerald-400">
                    Shift {sysInfo?.shiftNum || 1}
                  </span>
                </div>
              </div>
              
              <div className="relative h-7 bg-emerald-50/30" style={{ width: `${hoursCount * zoomLevel}px`, minWidth: `${hoursCount * zoomLevel}px` }}>
                {/* Active Shift Bar (Warna Hijau / Emerald dengan Jam Istirahat di tengah) */}
                <div 
                  className="absolute top-0.5 bottom-0.5 bg-emerald-200/90 text-[10px] font-black text-emerald-950 rounded border-2 border-emerald-600 shadow-xs flex overflow-hidden"
                  style={{
                    left: `${(Math.max(0, todayDayIndex) * 24 + Math.max(0, sysInfo?.startHourInDay ?? 7)) * zoomLevel}px`,
                    width: `${(sysInfo?.durationHours ?? 8) * zoomLevel}px`
                  }}
                >
                  {/* Shift 1 (07:00 - 15:00): Istirahat 11:30 - 12:30 */}
                  {sysInfo?.shiftNum === 1 && (
                    <>
                      {/* Kerja Sesi 1: 07:00 - 11:30 (4.5 jam) */}
                      <div 
                        style={{ width: `${4.5 * zoomLevel}px` }} 
                        className="h-full bg-emerald-300/80 px-2 flex items-center border-r border-emerald-500 truncate"
                        title="Waktu Kerja Shift 1 Sesi Pagi (07:00 - 11:30 WIB)"
                      >
                        ☀️ Shift 1 Kerja (07:00 - 11:30)
                      </div>
                      {/* Jam Istirahat: 11:30 - 12:30 (1.0 jam) */}
                      <div 
                        style={{ width: `${1.0 * zoomLevel}px` }} 
                        className="h-full bg-amber-300 text-amber-950 px-1 flex items-center justify-center font-black border-r border-amber-500 shadow-inner text-[9px] truncate"
                        title="☕ Jam Istirahat Shift 1: 11:30 - 12:30 WIB"
                      >
                        ☕ Istirahat 11:30-12:30
                      </div>
                      {/* Kerja Sesi 2: 12:30 - 15:00 (2.5 jam) */}
                      <div 
                        style={{ width: `${2.5 * zoomLevel}px` }} 
                        className="h-full bg-emerald-300/80 px-2 flex items-center truncate"
                        title="Waktu Kerja Shift 1 Sesi Siang (12:30 - 15:00 WIB)"
                      >
                        Kerja (12:30 - 15:00)
                      </div>
                    </>
                  )}

                  {/* Shift 2 (15:00 - 23:00): Istirahat 17:30 - 18:30 */}
                  {sysInfo?.shiftNum === 2 && (
                    <>
                      {/* Kerja Sesi 1: 15:00 - 17:30 (2.5 jam) */}
                      <div 
                        style={{ width: `${2.5 * zoomLevel}px` }} 
                        className="h-full bg-emerald-300/80 px-2 flex items-center border-r border-emerald-500 truncate"
                        title="Waktu Kerja Shift 2 Sesi Sore (15:00 - 17:30 WIB)"
                      >
                        ⛅ Shift 2 Kerja (15:00 - 17:30)
                      </div>
                      {/* Jam Istirahat: 17:30 - 18:30 (1.0 jam) */}
                      <div 
                        style={{ width: `${1.0 * zoomLevel}px` }} 
                        className="h-full bg-amber-300 text-amber-950 px-1 flex items-center justify-center font-black border-r border-amber-500 shadow-inner text-[9px] truncate"
                        title="☕ Jam Istirahat Shift 2: 17:30 - 18:30 WIB"
                      >
                        ☕ Istirahat 17:30-18:30
                      </div>
                      {/* Kerja Sesi 2: 18:30 - 23:00 (4.5 jam) */}
                      <div 
                        style={{ width: `${4.5 * zoomLevel}px` }} 
                        className="h-full bg-emerald-300/80 px-2 flex items-center truncate"
                        title="Waktu Kerja Shift 2 Sesi Malam (18:30 - 23:00 WIB)"
                      >
                        Kerja (18:30 - 23:00)
                      </div>
                    </>
                  )}

                  {/* Shift 3 (23:00 - 07:00): Istirahat 02:00 - 03:00 */}
                  {sysInfo?.shiftNum === 3 && (
                    <>
                      {/* Kerja Sesi 1: 23:00 - 02:00 (3.0 jam) */}
                      <div 
                        style={{ width: `${3.0 * zoomLevel}px` }} 
                        className="h-full bg-emerald-300/80 px-2 flex items-center border-r border-emerald-500 truncate"
                        title="Waktu Kerja Shift 3 Sesi Malam (23:00 - 02:00 WIB)"
                      >
                        🌙 Shift 3 Kerja (23:00 - 02:00)
                      </div>
                      {/* Jam Istirahat: 02:00 - 03:00 (1.0 jam) */}
                      <div 
                        style={{ width: `${1.0 * zoomLevel}px` }} 
                        className="h-full bg-amber-300 text-amber-950 px-1 flex items-center justify-center font-black border-r border-amber-500 shadow-inner text-[9px] truncate"
                        title="☕ Jam Istirahat Shift 3: 02:00 - 03:00 WIB"
                      >
                        ☕ Istirahat 02-03
                      </div>
                      {/* Kerja Sesi 2: 03:00 - 07:00 (4.0 jam) */}
                      <div 
                        style={{ width: `${4.0 * zoomLevel}px` }} 
                        className="h-full bg-emerald-300/80 px-2 flex items-center truncate"
                        title="Waktu Kerja Shift 3 Sesi Subuh (03:00 - 07:00 WIB)"
                      >
                        Kerja (03:00 - 07:00)
                      </div>
                    </>
                  )}
                </div>

                {/* LIVE Time indicator needle */}
                {sysInfo && sysInfo.currentHourDecimal >= 0 && todayDayIndex >= 0 && (
                  <div 
                    className="absolute top-0 bottom-0 w-[2px] bg-red-600 z-30 pointer-events-none"
                    style={{ left: `${(todayDayIndex * 24 + sysInfo.currentHourDecimal) * zoomLevel}px` }}
                    title={`Waktu Saat Ini: ${sysInfo.timeFormatted}`}
                  >
                    <div className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-red-600 rounded-full animate-ping opacity-75"></div>
                    <div className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-red-600 rounded-full"></div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* PROCESS GROUPS WITH NESTED MACHINES */}
          {displayedProcesses.map((proc) => {
            const isCollapsed = collapsedProcesses[proc.code];
            const isEF = proc.isEFBath;
            const machineCount = proc.machines.length;
            const procBlocks = scheduleBlocks.filter(b => b.processCode === proc.code);
            const procVoucherSet = new Set(procBlocks.map(b => b.voucherNo).filter(Boolean));
            const procVoucherCount = procVoucherSet.size;
            const procTotalBiji = procBlocks.reduce((sum, b) => sum + (Number(b.biji) || 0), 0);

            return (
              <div 
                key={`${activePipeline}-${proc.code}`} 
                className={`border-b-4 transition-colors ${
                  isEF ? 'border-blue-400 bg-blue-50/10' : 'border-slate-200'
                }`}
              >
                {/* PROCESS SECTION HEADER */}
                <div 
                  onClick={() => toggleCollapse(proc.code)}
                  className={`sticky left-0 z-20 px-4 py-2 flex items-center justify-between cursor-pointer transition-colors border-b ${
                    isEF
                      ? 'bg-gradient-to-r from-blue-900 to-indigo-900 text-white border-blue-900'
                      : proc.pipeline === 'Lilin'
                      ? 'bg-gradient-to-r from-emerald-800 to-slate-800 text-white border-emerald-900'
                      : proc.pipeline === 'Timah'
                      ? 'bg-gradient-to-r from-cyan-900 to-slate-800 text-white border-cyan-900'
                      : 'bg-gradient-to-r from-slate-700 to-slate-800 text-white border-slate-700'
                  }`}
                >
                  {/* Left: Process Title & Metadata */}
                  <div className="flex items-center space-x-3">
                    <button className="p-0.5 rounded hover:bg-white/20">
                      {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    
                    <div className="flex items-center space-x-2">
                      <span className="font-black text-sm tracking-wider uppercase">
                        {proc.number ? `${proc.number}. ` : ''}{proc.code} — {proc.name}
                      </span>
                      
                      {proc.isShared && (
                        <span className="text-[10px] bg-purple-200 text-purple-900 font-extrabold px-2 py-0.5 rounded-full">
                          Shared Lilin & Timah
                        </span>
                      )}

                      <span className="text-[10px] bg-white/20 text-white font-semibold px-2 py-0.5 rounded-full">
                        LT: {proc.leadtimeDisplay}
                      </span>

                      <span className="text-[10px] bg-white/20 text-white font-semibold px-2 py-0.5 rounded-full">
                        Kap: {proc.capacityUnit}
                      </span>

                      <span className="text-[10px] bg-amber-400 text-slate-900 font-extrabold px-2 py-0.5 rounded-full">
                        {machineCount} Mesin
                      </span>
                    </div>
                  </div>

                  {/* Right: Voucher Count Badge & Quick Rekap Link */}
                  <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => {
                        setSelectedProcessForSummary(proc.code);
                        setIsVoucherSummaryOpen(true);
                      }}
                      className={`text-xs px-2.5 py-0.5 rounded-full border shadow-2xs flex items-center space-x-1.5 transition-all hover:scale-105 active:scale-95 cursor-pointer ${
                        procVoucherCount > 0
                          ? 'bg-amber-400 text-slate-900 border-amber-300 font-extrabold hover:bg-amber-300'
                          : 'bg-white/10 text-white/80 border-white/20 hover:bg-white/20 font-semibold'
                      }`}
                      title={`Klik untuk melihat rincian ${procVoucherCount} voucher pada tahapan ${proc.name}`}
                    >
                      <Layers className="w-3 h-3 shrink-0" />
                      <span>{procVoucherCount} Voucher</span>
                      {procTotalBiji > 0 && (
                        <span className="opacity-75 font-normal text-[10px]">({procTotalBiji} pcs)</span>
                      )}
                    </button>
                  </div>
                </div>

                {/* MACHINE ROWS INSIDE THIS PROCESS */}
                {!isCollapsed && proc.machines.map((rawMachine) => {
                  const machine = getEffectiveMachine(rawMachine);
                  const isTrouble = machine.status === 'Trouble';
                  const isMaintenance = machine.status === 'Maintenance';

                  // Get blocks assigned to this machine and process
                  const machineBlocks = scheduleBlocks.filter(
                    b => b.processCode === proc.code && b.machineId === machine.id
                  );

                  return (
                    <div 
                      key={`${proc.code}-${machine.id}`} 
                      className={`flex border-b border-slate-100 hover:bg-slate-50/60 transition-colors group ${
                        isTrouble ? 'bg-red-50/40' : (isMaintenance ? 'bg-amber-50/30' : 'bg-white')
                      }`}
                    >
                      {/* Left: Machine Label Column */}
                      <div className="w-72 shrink-0 border-r border-slate-200 px-3 py-2 bg-white group-hover:bg-slate-50 sticky left-0 z-20 flex items-center justify-between shadow-xs">
                        <div className="flex items-center space-x-2 overflow-hidden">
                          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                            isTrouble ? 'bg-red-600 animate-pulse' : (isMaintenance ? 'bg-amber-500' : 'bg-emerald-500')
                          }`}></span>
                          <div>
                            <div className="flex items-center space-x-1">
                              <span className="font-extrabold text-xs text-slate-900">{machine.code}</span>
                              {machine.isFloating && (
                                <span className="text-[9px] px-1 py-0.2 rounded bg-purple-100 text-purple-800 font-black" title="Mesin Floating: Dapat ditugaskan ke Lilin atau Timah">
                                  Floating
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-500 truncate block max-w-[130px]">{machine.name}</span>
                          </div>
                        </div>

                        {/* Machine Control Badges */}
                        <div className="flex items-center space-x-1 shrink-0">
                          {/* Floating switch button if EF-03 */}
                          {machine.isFloating && (
                            <button
                              onClick={(e) => toggleFloatingAssignment(machine.id, e)}
                              className={`text-[9px] px-1.5 py-0.5 rounded font-black border transition-all ${
                                machine.assignment === 'Lilin'
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200'
                                  : 'bg-cyan-100 text-cyan-800 border-cyan-300 hover:bg-cyan-200'
                              }`}
                              title="Klik untuk alihkan penugasan mesin Floating (Lilin <-> Timah)"
                            >
                              Core: {machine.assignment}
                            </button>
                          )}

                          {/* Machine Status toggle */}
                          <button
                            onClick={(e) => toggleMachineStatus(machine.id, e)}
                            className={`text-[9px] px-1.5 py-0.5 rounded font-bold border transition-colors ${
                              isTrouble
                                ? 'bg-red-100 text-red-800 border-red-300 font-extrabold'
                                : isMaintenance
                                ? 'bg-amber-100 text-amber-800 border-amber-300'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                            title="Klik untuk ubah status mesin: Running / Trouble / Maintenance"
                          >
                            {isTrouble ? '⚠️ Trouble' : (isMaintenance ? '🔧 Maint' : 'Running')}
                          </button>
                        </div>
                      </div>

                      {/* Right: Machine Timeline Track */}
                      <div 
                        className={`relative h-14 ${isTrouble ? 'bg-red-50/20' : ''}`}
                        style={{ width: `${hoursCount * zoomLevel}px`, minWidth: `${hoursCount * zoomLevel}px` }}
                        onDragOver={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const x = e.clientX - rect.left;
                          const hourIdx = Math.floor(x / zoomLevel);
                          handleDragOver(e, proc.code, machine.id, hourIdx);
                        }}
                        onDrop={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const x = e.clientX - rect.left;
                          const hourIdx = Math.floor(x / zoomLevel);
                          handleDrop(e, proc.code, machine.id, hourIdx);
                        }}
                      >
                        {/* Background Hour Grid Lines */}
                        <div className="absolute inset-0 flex pointer-events-none" style={{ width: `${hoursCount * zoomLevel}px` }}>
                          {timelineHours.map((th) => (
                            <div
                              key={th.index}
                              style={{ width: `${zoomLevel}px` }}
                              className={`shrink-0 border-r h-full ${
                                th.isShiftStart ? 'border-r-slate-300 bg-slate-50/40' : 'border-r-slate-100/90'
                              }`}
                            />
                          ))}
                        </div>

                        {/* Trouble Pattern Banner on track */}
                        {isTrouble && (
                          <div className="absolute inset-0 flex items-center justify-center bg-red-100/20 pointer-events-none">
                            <span className="text-[10px] font-black text-red-600 bg-white/80 px-2 py-0.5 rounded border border-red-200 uppercase tracking-wider">
                              ⚠️ MESIN TROUBLE — JADWAL TIDAK DAPAT DITEMPATKAN
                            </span>
                          </div>
                        )}

                        {/* Drop Target Indicator */}
                        {hoveredTarget?.processCode === proc.code && hoveredTarget?.machineId === machine.id && (
                          <div
                            style={{
                              left: `${hoveredTarget.hourIndex * zoomLevel}px`,
                              width: `${(draggedBlock?.durationHours || 2) * zoomLevel}px`
                            }}
                            className={`absolute top-1 bottom-1 border-2 border-dashed rounded pointer-events-none z-10 animate-pulse ${
                              isTrouble ? 'border-red-600 bg-red-200/40' : 'border-blue-500 bg-blue-400/20'
                            }`}
                          />
                        )}

                        {/* Render Draggable Order Blocks */}
                        {machineBlocks.map((block) => {
                          const left = block.startHour * zoomLevel;
                          const width = block.durationHours * zoomLevel;
                          const isBeingDragged = draggedBlock?.id === block.id;
                          const isLilin = block.materialType === 'Lilin';
                          const isHighlighted = highlightedVoucher === block.voucherNo;

                          return (
                            <div
                              key={block.id}
                              draggable={true}
                              onDragStart={(e) => handleDragStart(e, block)}
                              onClick={() => {
                                setHighlightedVoucher(block.voucherNo);
                                setPipelineModalVoucher(block.voucherNo);
                                const matchedOrder = orders?.find(o => o.voucherNo === block.voucherNo);
                                if (matchedOrder && onSelectOrder) onSelectOrder(matchedOrder);
                                setSelectedEditBlock(block);
                                setIsEditModalOpen(true);
                              }}
                              style={{
                                left: `${left}px`,
                                width: `${width}px`
                              }}
                              className={`absolute top-1.5 bottom-1.5 rounded-md px-2 py-1 flex items-center justify-between transition-all shadow-xs group/item cursor-pointer hover:shadow-md ${
                                isHighlighted
                                  ? 'ring-2 ring-blue-600 shadow-md scale-[1.01] z-20 brightness-105'
                                  : ''
                              } ${
                                isLilin
                                  ? 'bg-[#c3e6cb] hover:bg-[#b1dfbb] border border-[#8fd19e] text-emerald-950'
                                  : 'bg-[#d1ecf1] hover:bg-[#bee5eb] border border-[#9edee8] text-cyan-950'
                              } ${isBeingDragged ? 'opacity-30 scale-95 ring-2 ring-blue-500' : ''}`}
                              title={`[${proc.code} - ${machine.code}] ${block.soNumber || block.voucherNo} | Model: ${block.modelCode} | Tahap ${block.stepNumber || 1}/${block.totalSteps || (isLilin ? 12 : 14)} | ${block.biji} pcs | Durasi: ${block.durationMinutes || Math.round(block.durationHours * 60)} Menit (Klik untuk edit/hapus)`}
                            >
                              {/* 5-minute setup buffer marker on left */}
                              <div 
                                className="absolute -left-1 top-0 bottom-0 w-1 bg-amber-400 rounded-l" 
                                title="Waktu Setup 5 Menit"
                              />

                              {/* SO 1 / SO 2 Badge & Step */}
                              <div className="flex items-center space-x-1.5 overflow-hidden">
                                <span className="font-black text-xs bg-white/95 px-1.5 py-0.5 rounded shadow-2xs text-slate-900 shrink-0 border border-slate-200/80">
                                  {block.soNumber || block.voucherNo}
                                </span>
                                <div className="truncate text-[11px] font-semibold leading-tight">
                                  <span className="font-bold">{block.modelCode}</span>
                                  {block.stepNumber && (
                                    <span className="ml-1 text-[9px] px-1 py-0.2 bg-black/10 text-slate-700 rounded font-black">
                                      {block.stepNumber}/{block.totalSteps || (isLilin ? 12 : 14)}
                                    </span>
                                  )}
                                  {block.difficultyFactor > 1.0 && (
                                    <span className="ml-1 text-[9px] px-1 py-0.2 bg-purple-600 text-white rounded font-black">
                                      ★ 1.5x
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Right duration in minutes */}
                              <div className="flex items-center shrink-0 ml-1">
                                <span className="text-[10px] font-bold text-slate-700 bg-white/80 px-1.5 py-0.2 rounded font-mono shadow-2xs">
                                  {block.durationMinutes ? `${block.durationMinutes}m` : `${Math.round(block.durationHours * 60)}m`}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}

        </div>
      </div>

      {/* Bottom Timeline Controls */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 bg-white border border-slate-200 rounded-lg p-0.5 shadow-xs">
            <button
              onClick={() => {
                if (scrollContainerRef.current) scrollContainerRef.current.scrollLeft -= 250;
              }}
              className="p-1 hover:bg-slate-100 rounded text-slate-600"
              title="Geser Kiri"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-bold text-slate-600 px-2">Geser Hari</span>
            <button
              onClick={() => {
                if (scrollContainerRef.current) scrollContainerRef.current.scrollLeft += 250;
              }}
              className="p-1 hover:bg-slate-100 rounded text-slate-600"
              title="Geser Kanan"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-4 text-[11px] flex-wrap gap-y-1">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded bg-[#c3e6cb] border border-[#8fd19e]"></span>
            <span className="text-slate-600 font-medium">Bahan Lilin (11 Proses)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded bg-[#d1ecf1] border border-[#9edee8]"></span>
            <span className="text-slate-600 font-medium">Bahan Timah (14 Proses)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded ring-2 ring-blue-600 bg-white"></span>
            <span className="text-slate-600 font-medium">Rantai 1 Order Tersinkron</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-3 rounded bg-amber-400"></span>
            <span className="text-slate-600 font-medium">Setup 5 Menit</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded bg-red-500"></span>
            <span className="text-slate-600 font-medium">Mesin Trouble</span>
          </div>
        </div>
      </div>

      {/* Modal Tambah Schedule */}
      <AddScheduleModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddScheduleBlock={handleAddScheduleBlock}
        baseDate={baseDate}
        allScheduleBlocks={scheduleBlocks}
      />

      {/* Modal Detail Rencana Alur Order Penuh (1 s/d 11 / 1 s/d 14) */}
      <OrderPipelineModal
        isOpen={isPipelineModalOpen}
        onClose={() => setIsPipelineModalOpen(false)}
        voucherNo={pipelineModalVoucher}
        allScheduleBlocks={scheduleBlocks}
        onUpdateBlocks={setScheduleBlocks}
        onDeleteSO={handleDeleteSO}
        baseDate={baseDate}
      />

      {/* Modal Detail & Edit Jadwal (Gambar 4) */}
      <EditScheduleModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedEditBlock(null);
        }}
        block={selectedEditBlock}
        onUpdateBlock={handleUpdateBlock}
        onDeleteBlock={handleDeleteBlock}
        onDeleteSO={handleDeleteSO}
        allBlocks={scheduleBlocks}
        baseDate={baseDate}
      />

      {/* Modal Rekapitulasi Voucher per Proses Produksi */}
      <ProcessVoucherSummaryModal
        isOpen={isVoucherSummaryOpen}
        onClose={() => {
          setIsVoucherSummaryOpen(false);
          setSelectedProcessForSummary(null);
        }}
        scheduleBlocks={scheduleBlocks}
        selectedProcessCode={selectedProcessForSummary}
        onSelectVoucher={(voucherNo) => {
          setHighlightedVoucher(voucherNo);
          setIsVoucherSummaryOpen(false);
        }}
      />

    </div>
  );
}
